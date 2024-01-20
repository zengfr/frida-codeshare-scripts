
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1827566684 @Raghav-Gupta99/root-function
Java.perform(function () {
    // Hooking the isRooted function to always return false
    var RootCheckClass = Java.use("com.yourpackage.name.RootCheck"); // Replace with actual class name
    RootCheckClass.isRooted.implementation = function () {
        console.log("isRooted() was called, returning false.");
        return false;  // Bypass root check by always returning false
    };

    // Hooking the isDebuggerAttached function to always return false
    RootCheckClass.isDebuggerAttached.implementation = function () {
        console.log("isDebuggerAttached() was called, returning false.");
        return false;  // Bypass debugger check by always returning false
    };
    
    // Optionally hook getDeviceState if required
    RootCheckClass.getDeviceState.implementation = function () {
        console.log("getDeviceState() was called, modifying return value.");
        var originalResult = this.getDeviceState();
        return originalResult & ~1 & ~4;  // Remove any flags for rooted or debugger detection
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1827566684 @Raghav-Gupta99/root-function
