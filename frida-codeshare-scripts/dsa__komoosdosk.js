
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1067591389 @komoosdosk/dsa
if (ObjC.available) {
    console.log("✅ Tinder Full System Call Logger Loaded");

    var syscall = Module.findExportByName(null, "syscall");
    if (syscall) {
        Interceptor.attach(syscall, {
            onEnter: function(args) {
                var syscall_number = args[0].toInt32();
                console.log("🔥 syscall() called: " + syscall_number);
            }
        });
    }

    var open = Module.findExportByName(null, "open");
    if (open) {
        Interceptor.attach(open, {
            onEnter: function(args) {
                var filename = Memory.readUtf8String(args[0]);
                console.log("🔥 open() called with filename: " + filename);
            }
        });
    }

    var opendir = Module.findExportByName(null, "opendir");
    if (opendir) {
        Interceptor.attach(opendir, {
            onEnter: function(args) {
                var dirname = Memory.readUtf8String(args[0]);
                console.log("🔥 opendir() called: " + dirname);
            }
        });
    }

    var readdir = Module.findExportByName(null, "readdir");
    if (readdir) {
        Interceptor.attach(readdir, {
            onEnter: function(args) {
                console.log("🔥 readdir() called");
            }
        });
    }

    var csops = Module.findExportByName(null, "csops");
    if (csops) {
        Interceptor.attach(csops, {
            onEnter: function(args) {
                console.log("🔥 csops() called – Checking app integrity");
            }
        });
    }

    var fork = Module.findExportByName(null, "fork");
    if (fork) {
        Interceptor.attach(fork, {
            onEnter: function(args) {
                console.log("🔥 fork() called – Checking sandbox");
            }
        });
    }

    var task_info = Module.findExportByName(null, "task_info");
    if (task_info) {
        Interceptor.attach(task_info, {
            onEnter: function(args) {
                console.log("🔥 task_info() called – Checking system state");
            }
        });
    }

    var ptrace = Module.findExportByName(null, "ptrace");
    if (ptrace) {
        Interceptor.attach(ptrace, {
            onEnter: function(args) {
                console.log("🔥 ptrace() called – Possible anti-debugging");
            }
        });
    }

    console.log("✅ Tinder Full System Call Logger Ready!");
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1067591389 @komoosdosk/dsa
