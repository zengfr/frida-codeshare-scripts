
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-989594242 @komoosdosk/k
// Updated Frida script to bypass new jailbreak detection in Tinder 16.2.2
// Hooks additional detection methods found in latest version

Java.perform(function () {
    var jailbreakPaths = [
        "/Applications/Cydia.app",
        "/Applications/Sileo.app",
        "/Applications/Zebra.app",
        "/Applications/blackra1n.app",
        "/private/var/lib/cydia",
        "/usr/bin/ssh",
        "/etc/apt"
    ];

    // Hook file existence checks
    var fopen = Module.findExportByName("libsystem_kernel.dylib", "open");
    if (fopen) {
        Interceptor.attach(fopen, {
            onEnter: function (args) {
                var path = Memory.readUtf8String(args[0]);
                if (jailbreakPaths.includes(path)) {
                    console.log("Blocked jailbreak path check: " + path);
                    args[0] = Memory.allocUtf8String("/fakepath");
                }
            }
        });
    }

    // Hook sysctl calls to prevent jailbreak detection
    var sysctl = Module.findExportByName("libsystem_kernel.dylib", "sysctl");
    if (sysctl) {
        Interceptor.attach(sysctl, {
            onEnter: function (args) {
                console.log("Blocked sysctl call (possible jailbreak check)");
                this.shouldBlock = true;
            },
            onLeave: function (retval) {
                if (this.shouldBlock) retval.replace(0);
            }
        });
    }

    // Hook getenv to block environment variable checks
    var getenv = Module.findExportByName("libc.dylib", "getenv");
    if (getenv) {
        Interceptor.attach(getenv, {
            onEnter: function (args) {
                var varName = Memory.readUtf8String(args[0]);
                if (varName.indexOf("DYLD_INSERT_LIBRARIES") !== -1) {
                    console.log("Blocked getenv DYLD_INSERT_LIBRARIES check");
                    args[0] = Memory.allocUtf8String("FAKE_ENV_VAR");
                }
            }
        });
    }
    
    // Hook new jailbreak detection functions in 16.2.2
    var newJailbreakFunctions = ["ptrace", "csops", "sysctlbyname", "get_task_allow"];
    newJailbreakFunctions.forEach(function (func) {
        var target = Module.findExportByName("libsystem_kernel.dylib", func);
        if (target) {
            Interceptor.attach(target, {
                onEnter: function (args) {
                    console.log("Blocked new jailbreak detection: " + func);
                    this.shouldBlock = true;
                },
                onLeave: function (retval) {
                    if (this.shouldBlock) retval.replace(0);
                }
            });
        }
    });
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-989594242 @komoosdosk/k
