
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1443971859 @beyrakIn/enum-code-exec
Java.perform(function() {
    console.log("\n[*] Frida script started for enumerating cmd runs...");

    var Runtime = Java.use("java.lang.Runtime");
    var ProcessBuilder = Java.use('java.lang.ProcessBuilder');


    try {
        Runtime.exec.overload("java.lang.String").implementation = function(cmd) {
            console.log("[+] Runtime.exec called with: " + cmd);
            return this.exec(cmd);

        }


        ProcessBuilder.start.implementation = function() {
            var cmd = this.command.call(this); // Get the command list
            // Convert the command list to a readable string
            var cmdString = Java.use('java.lang.String').valueOf(cmd);
            console.log("[+] ProcessBuilder.start called with: " + cmdString);

            return this.start.call(this); // Proceed with the original method
        };
    } catch (e) {
        console.log("[!] Error hooking func: " + e);
    }

});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1443971859 @beyrakIn/enum-code-exec
