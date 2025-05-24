
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1431833481 @komoosdosk/pdf
// Stealth Frida Injection for Tinder
// This script bypasses Tinder's Frida detection by hiding the Frida process

Java.perform(function () {
    console.log("[+] Stealth Frida Hook Loaded");

    // Hook sysctl to prevent Frida detection
    var sysctl = Module.findExportByName(null, "sysctl");
    if (sysctl) {
        Interceptor.attach(sysctl, {
            onEnter: function (args) {
                console.log("[Blocked] sysctl call detected");
                this.skip = true;
            },
            onLeave: function (retval) {
                if (this.skip) retval.replace(-1);
            }
        });
    }

    // Hook ptrace to prevent anti-debugging
    var ptrace = Module.findExportByName(null, "ptrace");
    if (ptrace) {
        Interceptor.attach(ptrace, {
            onEnter: function (args) {
                console.log("[Blocked] ptrace anti-debugging");
                args[0] = 31; // Prevents PTRACE_TRACEME
            }
        });
    }

    console.log("[+] Frida Hooks Applied - Tinder Should Now Be Accessible");
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1431833481 @komoosdosk/pdf
