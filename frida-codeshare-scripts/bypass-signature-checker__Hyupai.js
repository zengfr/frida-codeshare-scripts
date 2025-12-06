
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-2436780 @Hyupai/bypass-signature-checker
Java.perform(function() {
    
function readProcSelfMaps() {
    var fopen = new NativeFunction(Module.findExportByName("libc.so", "fopen"), 'pointer', ['pointer', 'pointer']);
    var fgets = new NativeFunction(Module.findExportByName("libc.so", "fgets"), 'pointer', ['pointer', 'int', 'pointer']);
    var fclose = new NativeFunction(Module.findExportByName("libc.so", "fclose"), 'int', ['pointer']);

    var filePath = Memory.allocUtf8String("/proc/self/maps");
    var mode = Memory.allocUtf8String("r");
    var buffer = Memory.alloc(4096);

    var fp = fopen(filePath, mode);
    if (fp.isNull()) {
        console.log("⚠️ Não foi possível abrir /proc/self/maps");
        return;
    }

    console.log("📄 Conteúdo de /proc/self/maps:");
    while (fgets(buffer, 4096, fp) !== ptr(0)) {
        var line = Memory.readUtf8String(buffer);
        console.log(line.trim());
    }

    fclose(fp);
}
function hookopenlibc() {
    const originalApkPath = "/data/app/com.mm.droid.livetv.duna.mobile-JkHj-orahHNzDM68NOJxaA==/base.apk";
    const fakeApkPath = "/data/data/com.mm.droid.livetv.duna.mobile/cache/original.apk";

    function getBacktrace(context) {
        try {
            return Thread.backtrace(context, Backtracer.ACCURATE)
                .slice(0, 4)
                .map(DebugSymbol.fromAddress)
                .map((s, i) => `    #${i} ${s.name} (${s.address})`)
                .join("\n");
        } catch (e) {
            return "    ⚠️ Erro ao obter backtrace: " + e;
        }
    }

    function hookFunction(funcName, pathArgIndex = 0) {
        const ptr = Module.findExportByName("libc.so", funcName);
        if (!ptr) {
            console.log(`⚠️ Função ${funcName} não encontrada em libc.so`);
            return;
        }

        console.log(`🧩 Hooking ${funcName} em libc.so`);

        Interceptor.attach(ptr, {
            onEnter: function(args) {
                try {
                    const path = Memory.readUtf8String(args[pathArgIndex]);

                   
                } catch (e) {
                    console.log(`[libc ${funcName}] ⚠️ Erro ao ler ou sobrescrever path: ${e}`);
                }
            }
        });
    }

    const functionsToHook = [
        { name: "fopen", pathArgIndex: 0 },
        { name: "fopen64", pathArgIndex: 0 },
        { name: "open", pathArgIndex: 0 },
        { name: "open64", pathArgIndex: 0 },
        { name: "openat", pathArgIndex: 1 },
        { name: "stat", pathArgIndex: 0 },
        { name: "lstat", pathArgIndex: 0 },
        { name: "access", pathArgIndex: 0 },
        { name: "readlink", pathArgIndex: 0 }
    ];

    functionsToHook.forEach(f => hookFunction(f.name, f.pathArgIndex));
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

    function patchApplicationInfo(appInfo) {
        const tag = "ApplicationInfo";
        if (!appInfo) {
            logWarning(tag, "ApplicationInfo é null, pulando...");
            return;
        }

        try {
            const origSourceDir = appInfo.sourceDir.value;
            const origPublicSourceDir = appInfo.publicSourceDir.value;

            logStep(tag, `sourceDir: ORIGINAL="${origSourceDir}", FAKE="${apkPath}"`);
            logStep(tag, `publicSourceDir: ORIGINAL="${origPublicSourceDir}", FAKE="${apkPath}"`);

            appInfo.sourceDir.value = apkPath;
            appInfo.publicSourceDir.value = apkPath;

            logSuccess(tag, "Campos sourceDir e publicSourceDir atualizados");
        } catch (e) {
            logError(tag, "Erro ao patch ApplicationInfo: " + e);
        }
    }

    function patchLoadedApk(loadedApk) {
        const tag = "LoadedApk";
        if (!loadedApk) {
            logWarning(tag, "LoadedApk é null, pulando...");
            return;
        }

        try {
            const mApplicationInfo = loadedApk.mApplicationInfo ? loadedApk.mApplicationInfo.value : null;
            const mAppDir = loadedApk.mAppDir ? loadedApk.mAppDir.value : null;
            const mResDir = loadedApk.mResDir ? loadedApk.mResDir.value : null;

            logStep(tag, `mApplicationInfo: ${mApplicationInfo ? mApplicationInfo.toString() : "null"}`);
            logStep(tag, `mAppDir: ORIGINAL="${mAppDir}", FAKE="${apkPath}"`);
            logStep(tag, `mResDir: ORIGINAL="${mResDir}", FAKE="${apkPath}"`);

            if (mApplicationInfo) {
                patchApplicationInfo(mApplicationInfo);
            }

            if (loadedApk.mAppDir) loadedApk.mAppDir.value = apkPath;
            if (loadedApk.mResDir) loadedApk.mResDir.value = apkPath;

            logSuccess(tag, "Campos mAppDir e mResDir atualizados");
        } catch (e) {
            logError(tag, "Erro ao patch LoadedApk: " + e);
        }
    }

    function patchAppBindData(appBindData) {
        const tag = "AppBindData";
        if (!appBindData) {
            logWarning(tag, "AppBindData é null, pulando...");
            return;
        }

        try {
            const info = safeGetValue(appBindData.info);
            const appInfo = safeGetValue(appBindData.appInfo);

            logStep(tag, `info (LoadedApk): ${info ? info.toString() : "null"}`);
            logStep(tag, `appInfo (ApplicationInfo): ${appInfo ? appInfo.toString() : "null"}`);

            patchLoadedApk(info);
            patchApplicationInfo(appInfo);

            logSuccess(tag, "Patch concluído");
        } catch (e) {
            logError(tag, "Erro patch AppBindData: " + e);
        }
    }

    function patchApplication(app) {
        const tag = "Application";
        if (!app) {
            logWarning(tag, "Application é null, pulando...");
            return;
        }

        try {
            const loadedApk = safeGetValue(app.mLoadedApk);
            logStep(tag, `mLoadedApk: ${loadedApk ? loadedApk.toString() : "null"}`);
            patchLoadedApk(loadedApk);
            logSuccess(tag, "Patch concluído");
        } catch (e) {
            logError(tag, "Erro patch Application: " + e);
        }
    }

    function logAndPatch() {
        const tag = "mBoundApplication";
        try {
            const ActivityThread = Java.use("android.app.ActivityThread");
            const appThread = ActivityThread.currentActivityThread();
            const mBoundApplication = safeGetValue(appThread.mBoundApplication);

            if (mBoundApplication !== null) {
                logSuccess(tag, "mBoundApplication encontrado!");

                const loadedApk = safeGetValue(mBoundApplication.info);
                const appInfo = safeGetValue(mBoundApplication.appInfo);

                logStep(tag, `info (LoadedApk): ${loadedApk}`);
                logStep(tag, `appInfo (ApplicationInfo): ${appInfo}`);

                if (loadedApk !== null) {
                    const origAppInfo = safeGetValue(loadedApk.mApplicationInfo);
                    const origAppDir = safeGetValue(loadedApk.mAppDir);
                    const origResDir = safeGetValue(loadedApk.mResDir);

                    logStep(tag, `LoadedApk.mApplicationInfo: ${origAppInfo}`);
                    logStep(tag, `LoadedApk.mAppDir: ORIGINAL="${origAppDir}", FAKE="${apkPath}"`);
                    logStep(tag, `LoadedApk.mResDir: ORIGINAL="${origResDir}", FAKE="${apkPath}"`);

                    loadedApk.mAppDir.value = apkPath;
                    loadedApk.mResDir.value = apkPath;

                    logSuccess(tag, "LoadedApk.mAppDir e mResDir atualizados");
                } else {
                    logWarning(tag, "LoadedApk (info) está null");
                }

                if (appInfo !== null) {
                    const origSourceDir = safeGetValue(appInfo.sourceDir);
                    const origPublicSourceDir = safeGetValue(appInfo.publicSourceDir);

                    logStep(tag, `ApplicationInfo.sourceDir: ORIGINAL="${origSourceDir}", FAKE="${apkPath}"`);
                    logStep(tag, `ApplicationInfo.publicSourceDir: ORIGINAL="${origPublicSourceDir}", FAKE="${apkPath}"`);

                    appInfo.sourceDir.value = apkPath;
                    appInfo.publicSourceDir.value = apkPath;

                    logSuccess(tag, "ApplicationInfo sourceDir e publicSourceDir atualizados");
                } else {
                    logWarning(tag, "ApplicationInfo (appInfo) está null");
                }
            } else {
                logInfo(tag, "⏳ mBoundApplication é null, tentando novamente...", colors.yellow);
                setTimeout(logAndPatch, 500);
            }
        } catch (e) {
            logError(tag, "Erro no logAndPatch: " + e);
        }
    }

    function main() {
         hookopenlibc();
        logAndPatch();

        const tag = "ActivityThread";
        const currentActivityThread = ActivityThread.currentActivityThread();
        if (!currentActivityThread) {
            logError(tag, "currentActivityThread é null");
            return;
        }

        try {
            // Patch AppBindData (mBoundApplication)
            const mBoundApplication = safeGetValue(currentActivityThread.mBoundApplication);
            patchAppBindData(mBoundApplication);

            // Patch mInitialApplication
            const mInitialApplication = safeGetValue(currentActivityThread.mInitialApplication);
            patchApplication(mInitialApplication);

            // Patch mAllApplications (ArrayList)
            const mAllApplications = safeGetValue(currentActivityThread.mAllApplications);
            if (mAllApplications !== null) {
                const list = Java.cast(mAllApplications, ArrayList);
                logStep("mAllApplications", `size: ${list.size()}`);
                for (let i = 0; i < list.size(); i++) {
                    const app = list.get(i);
                    logStep("mAllApplications", `Application #${i}: ${app.toString()}`);
                    patchApplication(app);
                }
                logSuccess("mAllApplications", "Todos os applications foram patchados");
            } else {
                logWarning("mAllApplications", "é null ou vazio");
            }

            // Patch mPackages (ArrayMap<packageName, WeakReference<LoadedApk>>)
            const mPackages = safeGetValue(currentActivityThread.mPackages);
            if (mPackages !== null) {
                const map = Java.cast(mPackages, ArrayMap);
                logStep("mPackages", `size: ${map.size()}`);
                for (let i = 0; i < map.size(); i++) {
                    const weakRef = Java.cast(map.valueAt(i), WeakReference);
                    const loadedApk = weakRef.get();
                    logStep("mPackages", `LoadedApk #${i}: ${loadedApk ? loadedApk.toString() : "null"}`);
                    patchLoadedApk(loadedApk);

                    // Substitui WeakReference para evitar referência velha
                    const newWeak = Java.use("java.lang.ref.WeakReference").$new(loadedApk);
                    map.setValueAt(i, newWeak);
                }
                logSuccess("mPackages", "Todos os LoadedApk foram patchados");
            } else {
                logWarning("mPackages", "é null ou vazio");
            }

            // Patch mResourcePackages (ArrayMap)
            const mResourcePackages = safeGetValue(currentActivityThread.mResourcePackages);
            if (mResourcePackages !== null) {
                const mapRes = Java.cast(mResourcePackages, ArrayMap);
                logStep("mResourcePackages", `size: ${mapRes.size()}`);
                for (let i = 0; i < mapRes.size(); i++) {
                    const weakRef = Java.cast(mapRes.valueAt(i), WeakReference);
                    const loadedApk = weakRef.get();
                    logStep("mResourcePackages", `LoadedApk #${i}: ${loadedApk ? loadedApk.toString() : "null"}`);
                    patchLoadedApk(loadedApk);

                    const newWeak = Java.use("java.lang.ref.WeakReference").$new(loadedApk);
                    mapRes.setValueAt(i, newWeak);
                }
                logSuccess("mResourcePackages", "Todos os LoadedApk foram patchados");
            } else {
                logWarning("mResourcePackages", "é null ou vazio");
            }
        } catch (e) {
            logError("main", "Erro geral patching: " + e);
        }
    }
    
    // 3️⃣ exit(int) — libc
    const exitPtr = Module.findExportByName("libc.so", "exit");
    if (exitPtr) {
        Interceptor.attach(exitPtr, {
            onEnter: function (args) {
                const code = args[0].toInt32();
                console.warn(`🚨 [libc] exit(${code}) chamado`);
                console.log("❌ Bloqueando exit()");
                // impede o exit:
                this.shouldBlock = true;
            },
            onLeave: function (retval) {
                if (this.shouldBlock) {
                    retval.replace(0); // retorna sem fechar
                }
            }
        });
    }

    // 4️⃣ abort() — comum em proteção
    const abortPtr = Module.findExportByName("libc.so", "abort");
    if (abortPtr) {
        Interceptor.attach(abortPtr, {
            onEnter: function () {
                console.warn(`🚨 [libc] abort() chamado`);
                console.log("❌ Bloqueando abort()");
                // pode simplesmente ignorar ou desviar
                // Desvia a execução retornando de imediato
                this.context.pc = this.returnAddress;
            }
        });
    }

    main();
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-2436780 @Hyupai/bypass-signature-checker
