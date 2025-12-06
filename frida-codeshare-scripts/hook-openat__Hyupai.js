
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1889009411 @Hyupai/hook-openat
function isLibexecModule(name) {
    if (!name) return false;
    return name.includes("libexec") || name.includes("libexec_x86");
}

function getModuleNameByAddr(addr) {
    const mod = Process.findModuleByAddress(addr);
    return mod ? mod.name : null;
}

function safeReadUtf8String(ptr) {
    try {
        return Memory.readUtf8String(ptr);
    } catch {
        return "??";
    }
}

function shouldLogByContext(context) {
    const modName = getModuleNameByAddr(context.pc);
    if (isLibexecModule(modName)) return true;

    const bt = Thread.backtrace(context, Backtracer.ACCURATE)
        .map(getModuleNameByAddr);
    return bt.some(isLibexecModule);
}

// jmethodID / jfieldID -> metadata
const methodCache = new Map();
const fieldCache = new Map();

function hookJNI() {
    Java.perform(() => {
        const env = Java.vm.getEnv();
        const vtablePtr = Memory.readPointer(env.handle);

        const PTR_SIZE = Process.pointerSize;

        const indices = {
            FindClass: 6,
            GetMethodID: 29,
            GetStaticMethodID: 100,
            GetFieldID: 94,
            GetStaticFieldID: 96,
            CallObjectMethod: 33,
            CallBooleanMethod: 35,
            CallIntMethod: 39,
            CallLongMethod: 42,
            CallVoidMethod: 46,
            CallStaticObjectMethod: 109,
            CallStaticBooleanMethod: 111,
            CallStaticIntMethod: 115,
            CallStaticLongMethod: 118,
            CallStaticVoidMethod: 122,
        };

        // Track FindClass para mapear ponteiros -> nomes
        const classPtrMap = new Map();

        Interceptor.attach(Memory.readPointer(vtablePtr.add(indices.FindClass * PTR_SIZE)), {
            onEnter(args) {
                this.className = safeReadUtf8String(args[1]);
                this.shouldLog = shouldLogByContext(this.context);
            },
            onLeave(retval) {
                if (this.shouldLog && !retval.isNull()) {
                    classPtrMap.set(retval.toString(), this.className);
                    const callerMod = getModuleNameByAddr(this.returnAddress) || "desconhecido";
                    const offset = ptr(this.returnAddress).sub(Process.findModuleByName(callerMod)?.base || ptr(0));
                    console.log(`\n[JNI] 🔍 FindClass chamado`);
                    console.log(`  ↪ Classe: ${this.className}`);
                    console.log(`  ↪ Chamador: ${callerMod} + 0x${offset.toString(16)}`);
                    console.log(`  ↩ Retorno: ${retval}`);
                }
            }
        });

        function hookMethod(methodName, idx, cache, isStatic = false) {
            const ptrAddr = Memory.readPointer(vtablePtr.add(idx * PTR_SIZE));
            Interceptor.attach(ptrAddr, {
                onEnter(args) {
                    this.classPtr = args[1];
                    this.name = safeReadUtf8String(args[2]);
                    this.sig = safeReadUtf8String(args[3]);
                    this.className = classPtrMap.get(this.classPtr.toString()) || "??";
                    this.shouldLog = shouldLogByContext(this.context);
                },
                onLeave(retval) {
                    if (this.shouldLog && !retval.isNull()) {
                        cache.set(retval.toString(), {
                            name: this.name,
                            sig: this.sig,
                            className: this.className,
                        });
                        const callerMod = getModuleNameByAddr(this.returnAddress) || "desconhecido";
                        console.log(`\n[JNI] 🏷️ ${methodName} chamado`);
                        console.log(`  ↪ Classe: ${this.className}`);
                        console.log(`  ↪ Nome: ${this.name}`);
                        console.log(`  ↪ Assinatura JNI: ${this.sig}`);
                        console.log(`  ↪ Chamador: ${callerMod}`);
                        console.log(`  ↩ ID: ${retval}`);
                    }
                }
            });
        }

        hookMethod("GetMethodID", indices.GetMethodID, methodCache);
        hookMethod("GetStaticMethodID", indices.GetStaticMethodID, methodCache, true);
        hookMethod("GetFieldID", indices.GetFieldID, fieldCache);
        hookMethod("GetStaticFieldID", indices.GetStaticFieldID, fieldCache, true);

        function hookCallMethod(idx, methodName, cache, isStatic) {
            const ptrAddr = Memory.readPointer(vtablePtr.add(idx * PTR_SIZE));
            Interceptor.attach(ptrAddr, {
                onEnter(args) {
                    this.methodID = args[2].toString();
                    this.shouldLog = shouldLogByContext(this.context);
                },
                onLeave(retval) {
                    if (this.shouldLog) {
                        const info = cache.get(this.methodID);
                        const methodDesc = info
                            ? `${info.className}.${info.name} ${info.sig}`
                            : "jmethodID desconhecido";
                        const callerMod = getModuleNameByAddr(this.returnAddress) || "desconhecido";
                        const offset = ptr(this.returnAddress).sub(Process.findModuleByName(callerMod)?.base || ptr(0));

                        console.log(`\n[JNI] 📞 ${methodName} chamado`);
                        console.log(`  ↪ Chamador: ${callerMod} + 0x${offset.toString(16)}`);
                        console.log(`  ↪ Método: ${methodDesc}`);

                        const trace = Thread.backtrace(this.context, Backtracer.ACCURATE).slice(0, 5);
                        trace.forEach(addr => {
                            const sym = DebugSymbol.fromAddress(addr);
                            console.log(`  🔍 ${addr} (${sym.name || "???"})`);
                        });

                        console.log(`  ↩ Retorno: ${retval}`);
                    }
                }
            });
        }

        // CallXXXMethod
        hookCallMethod(indices.CallObjectMethod, "CallObjectMethod", methodCache);
        hookCallMethod(indices.CallBooleanMethod, "CallBooleanMethod", methodCache);
        hookCallMethod(indices.CallIntMethod, "CallIntMethod", methodCache);
        hookCallMethod(indices.CallLongMethod, "CallLongMethod", methodCache);
        hookCallMethod(indices.CallVoidMethod, "CallVoidMethod", methodCache);

        // CallStaticXXXMethod
        hookCallMethod(indices.CallStaticObjectMethod, "CallStaticObjectMethod", methodCache, true);
        hookCallMethod(indices.CallStaticBooleanMethod, "CallStaticBooleanMethod", methodCache, true);
        hookCallMethod(indices.CallStaticIntMethod, "CallStaticIntMethod", methodCache, true);
        hookCallMethod(indices.CallStaticLongMethod, "CallStaticLongMethod", methodCache, true);
        hookCallMethod(indices.CallStaticVoidMethod, "CallStaticVoidMethod", methodCache, true);
    });
}

const functionsToHook = ["openat", "openat64", "__openat"];

const skipBacktracePaths = [
    "/proc/",
    "/system/lib",
    "/system_ext/lib",
    "/vendor/lib",
    "/apex/",
    "/dev/"
];

// Libs suspeitas
const suspiciousLibs = ["libziparchive.so"];

function isSensitivePath(path) {
    return skipBacktracePaths.some(skip => path.startsWith(skip));
}
function hookOpenAtFunc(funcName) {
    const addr = Module.findExportByName("libc.so", funcName);
    if (!addr) {
        console.log(`[!] Função ${funcName} não encontrada.`);
        return;
    }

    console.log(`[+] Hookando ${funcName} @ ${addr}`);

    Interceptor.attach(addr, {
        onEnter: function (args) {
            try {
                const pathPtr = args[1];
                if (pathPtr.isNull()) {
                    console.log(`[LOG] ${funcName} chamado com path nulo`);
                    return;
                }

                const path = Memory.readUtf8String(pathPtr);
                console.log(`\n[LOG] ${funcName} chamado com path: ${path}`);

                // Evita backtrace em paths sensíveis
                if (isSensitivePath(path)) {
                    console.log(`[LOG] ${funcName} — path sensível, backtrace ignorado.`);
                    return;
                }

                // Backtrace (limitado a 4 níveis)
                const bt = Thread.backtrace(this.context, Backtracer.ACCURATE)
                    .slice(0, 4)
                    .map(addr => {
                        const mod = Process.findModuleByAddress(addr);
                        return {
                            addr: addr,
                            name: mod ? mod.name : "desconhecido",
                            text: `${addr} (${mod ? mod.name : "desconhecido"})`
                        };
                    });

                console.log("[Backtrace - até 4 níveis]:");
                bt.forEach(line => console.log("   " + line.text));

              
               

            } catch (e) {
                console.error(`[Erro] ${funcName} leitura falhou:`, e);
            }
        }
    });
}




    const ActivityThread = Java.use("android.app.ActivityThread");
    const ArrayList = Java.use("java.util.ArrayList");
    const WeakReference = Java.use("java.lang.ref.WeakReference");
    const ArrayMap = Java.use("android.util.ArrayMap");

    const apkPath = "/data/data/com.mm.droid.livetv.duna.mobile/cache/original.apk";

    // Cores ANSI para logs no terminal Frida
    const colors = {
        reset: "\x1b[0m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        cyan: "\x1b[36m",
        magenta: "\x1b[35m",
        white: "\x1b[37m",
        blue: "\x1b[34m",
    };

    function safeGetValue(field) {
        try {
            return field && field.value;
        } catch (e) {
            return undefined;
        }
    }

    function logInfo(tag, message, color = colors.white) {
        console.log(color + `[${tag}] ${message}` + colors.reset);
    }
    function logSuccess(tag, message) {
        logInfo(tag, "✅ " + message, colors.green);
    }
    function logWarning(tag, message) {
        logInfo(tag, "⚠️ " + message, colors.yellow);
    }
    function logError(tag, message) {
        logInfo(tag, "❌ " + message, colors.red);
    }
    function logStep(tag, message) {
        logInfo(tag, "🔷 " + message, colors.cyan);
    }


setImmediate(() => {
    
    console.log("[*] Iniciando hooks JNI filtrados por libexec/libexec_x86...");
    hookJNI();
    // Inicia hooks
    functionsToHook.forEach(hookOpenAtFunc);
 
   
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1889009411 @Hyupai/hook-openat
