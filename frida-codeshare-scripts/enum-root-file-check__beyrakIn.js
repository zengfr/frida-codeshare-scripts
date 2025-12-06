
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-80694091 @beyrakIn/enum-root-file-check
Java.perform(function() {
    console.log("[*] Frida script started for detect root binaries...");


    try {
        var File = Java.use("java.io.File");
        File.exists.implementation = function() {
            var path = this.getAbsolutePath();
            if (path.includes("/su") || path.includes("/magisk") || path.includes("Superuser") || path.includes("frida") || path.includes("gdb") || path.includes("daemonsu") || path.includes("busybox")) {
                console.log("[+] " + path);
                //               return false;
            }
            return this.exists();
        };
    } catch (e) {
        console.log("[!] Error hooking root detection: " + e);
    }


});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-80694091 @beyrakIn/enum-root-file-check
