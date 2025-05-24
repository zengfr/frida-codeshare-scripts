
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-505752541 @ScreaMy7/hookpermissions
/*
Updated by : Screamy
Original Author: secretdiary.ninja

 * */

setImmediate(function() {
    Java.perform(function() {
        // Hooking into ContextImpl.checkSelfPermission
        var ContextImpl = Java.use("android.app.ContextImpl");
        ContextImpl.checkSelfPermission.overload('java.lang.String').implementation = function(permission) {
            console.log("[*] ContextImpl.checkSelfPermission called with permission: " + permission);
            // Call the original method and return its result
            return this.checkSelfPermission(permission);
        };

        // Hooking into ContextCompat.checkSelfPermission
        var ContextCompat = Java.use("androidx.core.content.ContextCompat");
        ContextCompat.checkSelfPermission.overload('android.content.Context', 'java.lang.String').implementation = function(context, permission) {
            console.log("[*] ContextCompat.checkSelfPermission called with permission: " + permission);
            // Call the original method and return its result
            return this.checkSelfPermission(context, permission);
        };

        // Hooking into PermissionChecker.checkSelfPermission
        var PermissionChecker = Java.use("androidx.core.content.PermissionChecker");
        PermissionChecker.checkSelfPermission.overload('android.content.Context', 'java.lang.String').implementation = function(context, permission) {
            console.log("[*] PermissionChecker.checkSelfPermission called with permission: " + permission);
            // Call the original method and return its result
            return this.checkSelfPermission(context, permission);
        };

        // Hooking into ActivityCompat.requestPermissions
        var ActivityCompat = Java.use("androidx.core.app.ActivityCompat");
        ActivityCompat.requestPermissions.overload('android.app.Activity', '[Ljava.lang.String;', 'int').implementation = function(activity, permissions, requestCode) {
            console.log("[*] ActivityCompat.requestPermissions called. Permissions: " + permissions + ", Request Code: " + requestCode);
            // Call the original method
            return this.requestPermissions(activity, permissions, requestCode);
        };
    });
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-505752541 @ScreaMy7/hookpermissions
