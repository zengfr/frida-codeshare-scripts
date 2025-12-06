
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1001268971 @eiliyakeshtkar0/screenshot-protection
Java.perform(function() {
    var Window = Java.use("android.view.Window");
    Window.setFlags.implementation = function(flags, mask) {
        var FLAG_SECURE = 0x2000;
        flags = flags & ~FLAG_SECURE;
        mask = mask & ~FLAG_SECURE;
        console.log("Bypassed FLAG_SECURE");
        return this.setFlags(flags, mask);
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1001268971 @eiliyakeshtkar0/screenshot-protection
