
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1606498452 @Legal1337228/test
// bypass_debug.js
Java.perform(function () {
    var Debug = Java.use('android.os.Debug');
    Debug.isDebuggerConnected.implementation = function() {
        console.log("Bypassing Debug.isDebuggerConnected()");
        return false;
    };

    var DebugFlags = Java.use('android.os.Debug$DebugFlags');
    DebugFlags.DEBUG_ENABLE_DEBUGGER = 0;
    
    var System = Java.use('java.lang.System');
    System.getenv.overload('java.lang.String').implementation = function(name) {
        console.log("Bypassing System.getenv(" + name + ")");
        if (name === 'debug') {
            return null;
        }
        return this.getenv(name);
    };

    var ActivityThread = Java.use('android.app.ActivityThread');
    ActivityThread.currentApplication().getApplicationContext().getApplicationInfo().flags.value = 0;
    
    console.log("Bypassing complete");
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1606498452 @Legal1337228/test
