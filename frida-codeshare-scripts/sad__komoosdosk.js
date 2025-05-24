
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:2076612082 @komoosdosk/sad
// Hide DYLD_INSERT_LIBRARIES
Interceptor.attach(Module.findExportByName(null, "getenv"), {
    onEnter: function(args) {
        var name = Memory.readUtf8String(args[0]);
        if (name === "DYLD_INSERT_LIBRARIES") {
            console.log("[🔥] getenv() called for DYLD_INSERT_LIBRARIES — Hiding it!");
            this.replace = true;
            args[0] = Memory.allocUtf8String("FAKE_ENV");
        }
    },
    onLeave: function(retval) {
        if (this.replace) {
            retval.replace(0);
        }
    }
});

// Block task_for_pid (used for anti-debugging)
Interceptor.attach(Module.findExportByName("libSystem.B.dylib", "task_for_pid"), {
    onEnter: function(args) {
        console.log("[🔥] task_for_pid() detected — Blocking it!");
        args[1] = ptr(0);
    },
    onLeave: function(retval) {
        retval.replace(1);
    }
});

// Block sysctl (another method Tinder uses to check for debugger/frida)
Interceptor.attach(Module.findExportByName("libSystem.B.dylib", "sysctl"), {
    onEnter: function(args) {
        console.log("[🔥] sysctl() called — Faking response.");
        this.replace = true;
    },
    onLeave: function(retval) {
        if (this.replace) {
            retval.replace(0);
        }
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:2076612082 @komoosdosk/sad
