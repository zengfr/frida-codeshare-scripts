
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1233253952 @Hyupai/hook-iplayplus
const functionsToHook = ["openat", "openat64", "__openat"];

const skipBacktracePaths = [
    "/proc/",
    "/system/lib",
    "/system_ext/lib",
    "/vendor/lib",
    "/apex/",
    "/dev/"
];

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

                // Substitui MAC spoof
                if (
                    
                    path === "/sys/class/net/wlan0/address"
                ) {
                    const fakePath = "/data/data/com.iplay.iptv/cache/macFake";
                    args[1] = Memory.allocUtf8String(fakePath);
                    console.warn(`[MODIFICADO] Path MAC spoof substituído por: ${fakePath}`);
                    return;
                }

                if (isSensitivePath(path)) {
                    console.log(`[LOG] ${funcName} — path sensível, backtrace ignorado.`);
                    return;
                }

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
const fakeMacStr = "00:11:22:33:44:55";
const fakeMacBytes = [0x00, 0x11, 0x22, 0x33, 0x44, 0x55];
const fakeMacFile = "/data/data/com.iplay.iptv/cache/macFake";
const macFilePaths = [
    "/sys/class/net/eth0/address",
    "/sys/class/net/wlan0/address"
];

function hookJavaMacMethods() {
    Java.perform(() => {
        // WifiInfo.getMacAddress()
        try {
            const WifiInfo = Java.use("android.net.wifi.WifiInfo");
            WifiInfo.getMacAddress.implementation = function () {
                console.warn("[HOOK] WifiInfo.getMacAddress() -> spoofado:", fakeMacStr);
                return fakeMacStr;
            };
        } catch (e) {
            console.error("[Erro] hook WifiInfo:", e);
        }

        // NetworkInterface.getHardwareAddress()
        try {
            const NetworkInterface = Java.use("java.net.NetworkInterface");
            NetworkInterface.getHardwareAddress.implementation = function () {
                console.warn("[HOOK] NetworkInterface.getHardwareAddress() -> spoofado");
                return Java.array('byte', fakeMacBytes);
            };
        } catch (e) {
            console.error("[Erro] hook NetworkInterface:", e);
        }

       
    });
}

setImmediate(() => {
    console.log("[*] Iniciando spoof de MAC Address...");

    // Hooks nativos
    functionsToHook.forEach(hookOpenAtFunc);

    // Hooks Java
    Java.perform(() => {
        hookJavaMacMethods();
    });
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1233253952 @Hyupai/hook-iplayplus
