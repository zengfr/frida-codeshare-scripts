
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-219348888 @beyrakIn/enum-file-check
Java.perform(function() {
    console.log("[*] Frida script started for detect root binaries...");


    try {
        // Additional root detection bypass for common checks
        var File = Java.use("java.io.File");
        File.exists.implementation = function() {
            var path = this.getAbsolutePath();
            console.log("[+] " + path);
            return this.exists();
        };
    } catch (e) {
        console.log("[!] Error hooking root detection: " + e);
    }


});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-219348888 @beyrakIn/enum-file-check
