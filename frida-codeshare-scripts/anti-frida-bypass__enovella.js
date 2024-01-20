
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:799399861 @enovella/anti-frida-bypass
Interceptor.attach(Module.findExportByName("libc.so", "strstr"), {

    onEnter: function(args) {

        this.haystack = args[0];
        this.needle = args[1];
        this.frida = Boolean(0);

        haystack = Memory.readUtf8String(this.haystack);
        needle = Memory.readUtf8String(this.needle);

        if (haystack.indexOf("frida") !== -1 || haystack.indexOf("xposed") !== -1) {
            this.frida = Boolean(1);
        }
    },

    onLeave: function(retval) {

        if (this.frida) {
            retval.replace(0);
        }
        return retval;
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:799399861 @enovella/anti-frida-bypass
