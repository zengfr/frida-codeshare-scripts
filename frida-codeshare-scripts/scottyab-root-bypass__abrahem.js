
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1539574155 @abrahem/scottyab-root-bypass
Java.perform(function () {
    setTimeout(function () {
        // List all loaded modules
        var modules = Process.enumerateModules();
        modules.forEach(function(module) {
            console.log("Loaded module:", module.name);
        });

        // Find the base address of the target module
        var targetModule = Process.getModuleByName("libtoolChecker.so");
        if (targetModule) {
            console.log("Found libtoolChecker.so at:", targetModule.base);
        } else {
            console.log("Failed to find libtoolChecker.so.");
        }
    }, 2000); // Wait for 2 seconds before trying to access the modules
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1539574155 @abrahem/scottyab-root-bypass
