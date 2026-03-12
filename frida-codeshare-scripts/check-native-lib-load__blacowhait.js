
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-122826149 @blacowhait/check-native-lib-load
const LIB_NAME = "libnative.so"

function waitForModule(moduleName) {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const module = Process.findModuleByName(moduleName);
            if (module != null) {
                clearInterval(interval);
                resolve(module);
            }
        }, 1);
    });
}

function check() {
    waitForModule(LIB_NAME).then(module => {
        var moduleName = LIB_NAME;

        var moduleBase = Module.findBaseAddress(moduleName);
        if (!moduleBase) {
            console.log("[-] Could not find module: " + moduleName);
            return;
        }

        console.log("[*] Found module " + moduleName + " at " + moduleBase);

        Module.enumerateExports(moduleName).filter(e =>
                e.type === "function"
            )
            .forEach(e => {
                console.log("[+] Hooking:", e.name, "@", e.address);
            });
    });
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-122826149 @blacowhait/check-native-lib-load
