
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1193780361 @komoosdosk/logall
if (ObjC.available) {
    console.log("✅ Loading Full Tinder Debug Logger");

    // Hook and log sysctl()
    var sysctl = Module.findExportByName(null, "sysctl");
    if (sysctl) {
        Interceptor.attach(sysctl, {
            onEnter: function(args) {
                console.log("🔥 sysctl() called");
            },
            onLeave: function(retval) {
                retval.replace(0);
            }
        });
    }

    // Hook and log csops()
    var csops = Module.findExportByName(null, "csops");
    if (csops) {
        Interceptor.attach(csops, {
            onEnter: function(args) {
                console.log("🔥 csops() called");
            },
            onLeave: function(retval) {
                retval.replace(0);
            }
        });
    }

    // Hook and log task_info()
    var task_info = Module.findExportByName(null, "task_info");
    if (task_info) {
        Interceptor.attach(task_info, {
            onEnter: function(args) {
                console.log("🔥 task_info() called");
            },
            onLeave: function(retval) {
                retval.replace(0);
            }
        });
    }

    // Hook and log syscall()
    var syscall = Module.findExportByName(null, "syscall");
    if (syscall) {
        Interceptor.attach(syscall, {
            onEnter: function(args) {
                var syscall_number = args[0].toInt32();
                console.log("🔥 syscall() detected: " + syscall_number);
            },
            onLeave: function(retval) {
                retval.replace(0);
            }
        });
    }

    // Hook and log mmap() (used for memory checks)
    var mmap = Module.findExportByName(null, "mmap");
    if (mmap) {
        Interceptor.attach(mmap, {
            onEnter: function(args) {
                console.log("🔥 mmap() called");
            },
            onLeave: function(retval) {
                retval.replace(ptr(-1));
            }
        });
    }

    // Hook and log ptrace() (used for anti-debugging)
    var ptrace = Module.findExportByName(null, "ptrace");
    if (ptrace) {
        Interceptor.attach(ptrace, {
            onEnter: function(args) {
                console.log("🔥 ptrace() called (possible anti-debugging)");
            },
            onLeave: function(retval) {
                retval.replace(0);
            }
        });
    }

    console.log("✅ Full Tinder Debug Logger Loaded");
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1193780361 @komoosdosk/logall
