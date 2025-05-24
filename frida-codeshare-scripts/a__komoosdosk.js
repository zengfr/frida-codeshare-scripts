
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-521769141 @komoosdosk/a
if (ObjC.available) {
    var paths = [
        "/Applications/Cydia.app",
        "/Applications/FakeCarrier.app",
        "/Applications/Icy.app",
        "/bin/bash",
        "/bin/sh",
        "/etc/apt",
        "/var/lib/cydia",
        "/var/log/syslog",
        "/Library/MobileSubstrate/MobileSubstrate.dylib"
    ];

    var stat = Module.findExportByName("libSystem.B.dylib", "stat");
    Interceptor.attach(stat, {
        onEnter: function(args) {
            if (args[0].isNull()) return; // Fix for crash
            var arg = Memory.readUtf8String(args[0]);
            for (var path of paths) {
                if (arg.includes(path)) {
                    console.log("Blocking stat: " + arg);
                    args[0] = ptr(0);
                }
            }
        },
        onLeave: function(retval) {
            retval.replace(-1);
        }
    });

    var getenv = Module.findExportByName(null, "getenv");
    Interceptor.attach(getenv, {
        onEnter: function(args) {
            if (args[0].isNull()) return;
            var variable = Memory.readUtf8String(args[0]);
            if (variable === "DYLD_INSERT_LIBRARIES") {
                console.log("Hiding DYLD_INSERT_LIBRARIES");
                this.should_block = true;
            }
        },
        onLeave: function(retval) {
            if (this.should_block) {
                retval.replace(ptr(0));
            }
        }
    });

    var syscall = Module.findExportByName(null, "syscall");
    Interceptor.attach(syscall, {
        onEnter: function(args) {
            if (args[0].isNull()) return;
            var syscall_number = args[0].toInt32();
            if (syscall_number === 26 || syscall_number === 39) { // csops, getppid
                console.log("Blocking syscall: " + syscall_number);
                retval.replace(-1);
            }
        }
    });

    var task_info = Module.findExportByName(null, "task_info");
    Interceptor.attach(task_info, {
        onEnter: function(args) {
            console.log("Blocking task_info");
        },
        onLeave: function(retval) {
            retval.replace(-1);
        }
    });

    var ptrace = Module.findExportByName(null, "ptrace");
    Interceptor.attach(ptrace, {
        onEnter: function(args) {
            console.log("Blocking ptrace anti-debugging");
        },
        onLeave: function(retval) {
            retval.replace(0);
        }
    });

    var mmap = Module.findExportByName(null, "mmap");
    Interceptor.attach(mmap, {
        onEnter: function(args) {
            console.log("Blocking mmap jailbreak detection");
        },
        onLeave: function(retval) {
            retval.replace(ptr(-1));
        }
    });

    var csops = Module.findExportByName(null, "csops");
    Interceptor.attach(csops, {
        onEnter: function(args) {
            console.log("Blocking csops jailbreak detection");
        },
        onLeave: function(retval) {
            retval.replace(ptr(0));
        }
    });

    // **Frida Detection Bypass**
    var dlopen = Module.findExportByName(null, "dlopen");
    Interceptor.attach(dlopen, {
        onEnter: function(args) {
            if (args[0].isNull()) return;
            var libname = Memory.readUtf8String(args[0]);
            if (libname.includes("frida") || libname.includes("FridaGadget")) {
                console.log("Blocking Frida detection: " + libname);
                retval.replace(ptr(0)); // Prevent loading Frida hooks
            }
        }
    });

    console.log("✅ Advanced Jailbreak Bypass Loaded! (Fixed Version)");
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-521769141 @komoosdosk/a
