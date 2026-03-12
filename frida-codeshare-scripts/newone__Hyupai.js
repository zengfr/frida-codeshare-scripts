
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1363307278 @Hyupai/newone
// === CONFIG ===
const targetLib = "l57354b6e.so";   // nome da lib a monitorar
const targetFunction = "JNI_OnLoad"; // função específica que quer hookar (ou null)
const attachAllExports = false;      // se true, tentará hookar todas as exports tipo "function" (cuidado com spam)
// === END CONFIG ===

function safeReadUtf8(ptr) {
    if (!ptr || ptr.isNull()) return null;
    try {
        return Memory.readUtf8String(ptr);
    } catch (e) {
        return null;
    }
}

function tryAttach(addr, name) {
    if (!addr) return false;
    try {
        Interceptor.attach(addr, {
            onEnter: function(args) {
                try {
                    console.log(`[HOOK][ENTER] ${name} @ ${addr}`);
                    // print first 3 args (tentativo seguro)
                    for (let i=0;i<3;i++){
                        try {
                            let a = args[i];
                            // se parece ponteiro para string
                            if (a && !a.isNull()) {
                                const s = safeReadUtf8(a);
                                if (s !== null) {
                                    console.log(`  arg${i}: "${s}"`);
                                } else {
                                    console.log(`  arg${i}: ${a}`);
                                }
                            } else {
                                console.log(`  arg${i}: ${a}`);
                            }
                        } catch (e) {}
                    }
                } catch (e) {}
            },
            onLeave: function(retval) {
                try {
                    console.log(`[HOOK][LEAVE] ${name} returned ${retval}`);
                } catch (e) {}
            }
        });
        return true;
    } catch (e) {
        console.error(`[!] Failed to attach to ${name} @ ${addr}: ${e}`);
        return false;
    }
}

function enumerateAndLogExports(libName) {
    try {
        const exps = Module.enumerateExports(libName);
        console.log(`[+] Exports de ${libName} (count: ${exps.length}):`);
        exps.forEach(function(exp) {
            console.log(`  ${exp.type} ${exp.name} @ ${exp.address}`);
        });
        return exps;
    } catch (e) {
        console.error(`[!] enumerateExports erro: ${e}`);
        return [];
    }
}

function hookByOffset(mod, offset, name) {
    const addr = mod.base.add(offset);
    console.warn(`[+] Hookando ${name} @ ${addr}`);
    Interceptor.attach(addr, {
        onEnter: function(args) {
            try {
                console.log(`[ENTER] ${name}`);
                console.log(" arg0:", Memory.readUtf8String(args[0]));
                console.log(" arg1:", Memory.readUtf8String(args[1]));
            } catch (e) {
                console.log(" erro lendo args:", e);
            }
        },
        onLeave: function(retval) {
            console.log(`[LEAVE] ${name} => ${retval.toInt32()}`);
        }
    });
}

function onLibFound(mod) {
    console.warn(`[+] Biblioteca detectada: ${mod.name} base=${mod.base}`);
      hookByOffset(mod, strcmpOffset, "strcmp_0");
    // 1) listar exports
    const exps = enumerateAndLogExports(mod.name);

    // 2) tentar hookar JNI_OnLoad se exportado
    try {
        const jniAddr = Module.findExportByName(mod.name, "JNI_OnLoad");
        if (jniAddr) {
            console.warn(`[+] JNI_OnLoad exportado encontrado em ${jniAddr}`);
            tryAttach(jniAddr, "JNI_OnLoad");
        } else {
            console.warn("[-] JNI_OnLoad não exportado (ou não encontrado).");
        }
    } catch (e) {
        console.error("[!] erro ao procurar JNI_OnLoad:", e);
    }

    // 3) hookar função específica se pedida
    if (targetFunction) {
        try {
            const fnAddr = Module.findExportByName(mod.name, targetFunction);
            if (fnAddr) {
                console.warn(`[+] Função alvo ${targetFunction} encontrada: ${fnAddr}`);
                tryAttach(fnAddr, targetFunction);
            } else {
                console.warn(`[-] Função alvo ${targetFunction} não encontrada como export.`);
            }
        } catch (e) {
            console.error("[!] erro ao procurar targetFunction:", e);
        }
    }

    // 4) (opcional) hookar todas as exports do tipo "function"
    if (attachAllExports) {
        exps.forEach(exp => {
            if (exp.type === "function") {
                // cuidado: muitos hooks = muito output
                tryAttach(exp.address, exp.name);
            }
        });
    }
}




// polling passivo (seguro) até a lib aparecer.
// Usamos loop curto para aumentar chance de pegar antes de JNI_OnLoad ser invocado.
// Se quiser reduzir overhead, aumente o delay.
(function waitForLib() {
    try {
        const mod = Process.findModuleByName(targetLib);
        if (mod) {
            onLibFound(mod);
            return;
        }
    } catch (e) {
        // ignore temporariamente
    }
    // Tentar novamente muito rápido (1ms). Troque para 50-200ms se quiser menos CPU.
    setTimeout(waitForLib, 1);
})();

// opcional: expõe uma função global para listar exports manualmente quando quiser
rpc.exports = {
    listexports: function(libName) {
        libName = libName || targetLib;
        try {
            const m = Process.findModuleByName(libName);
            if (!m) return "module not found";
            const exps = Module.enumerateExports(libName);
            return exps.map(e => `${e.type} ${e.name} @ ${e.address}`).join("\n");
        } catch (e) {
            return "error: " + e.message;
        }
    },
    attachexport: function(libName, symName) {
        try {
            const addr = Module.findExportByName(libName, symName);
            if (!addr) return `symbol ${symName} not found in ${libName}`;
            return tryAttach(addr, symName) ? "attached" : "attach failed";
        } catch (e) {
            return "error: " + e.message;
        }
    }
};
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1363307278 @Hyupai/newone
