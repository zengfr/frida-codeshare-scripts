
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:8162746 @abdolzx/tbdoool
Java.perform(function () {
    var ProtectedApp = Java.use("mobi.foo.sama.ProtectedApp");

    // Hook the onCreate method to bypass the protection
    ProtectedApp.onCreate.implementation = function () {
        console.log("Bypassing ProtectedApp.onCreate");
        // Do not call the original method to prevent the exception
    };

    // Hook the AsfG method (if it's part of the protection mechanism)
    ProtectedApp.AsfG.implementation = function () {
        console.log("Bypassing ProtectedApp.AsfG");
        return 0; // Return a safe value to prevent the exception
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:8162746 @abdolzx/tbdoool
