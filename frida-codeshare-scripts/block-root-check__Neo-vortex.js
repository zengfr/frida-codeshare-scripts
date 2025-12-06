
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1379271819 @Neo-vortex/block-root-check
Java.perform(function () {
    var cls = Java.use("o.applyHelperParams$cancelAll");
    var overload = cls['_$$a'].overload('android.content.Context', 'long', 'long');
    var orig = overload.implementation;

    // replace with our hook
    overload.implementation = function (context, j1, j2) {
        console.log("[HOOK] _$$a called - context:", context, "j1:", j1, "j2:", j2);

        //return orig.apply(this, arguments);
    };

    console.log("[+] Hook installed for _$$a");
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1379271819 @Neo-vortex/block-root-check
