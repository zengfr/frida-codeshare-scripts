
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:784080548 @kushjasrapuria/anti-debug-bypass
// Github: https://github.com/kushjasrapuria

Java.perform(function() {
    var Debug = Java.use('android.os.Debug');
    
    console.log("\n");
    
    Debug.isDebuggerConnected.implementation = function() {
        return false;
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:784080548 @kushjasrapuria/anti-debug-bypass
