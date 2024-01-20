
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:841137279 @Raphkitue/android-debug-mode-bypass
setTimeout(function() {
    Java.perform(function() {
        console.log("");
        console.log("[.] Debug check bypass");

        var Debug = Java.use('android.os.Debug');
        Debug.isDebuggerConnected.implementation = function() {
            //console.log('isDebuggerConnected Bypassed !');
            return false;
        }


    });
}, 0);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:841137279 @Raphkitue/android-debug-mode-bypass
