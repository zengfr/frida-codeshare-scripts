
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1613549528 @sdcampbell/android-vm-and-root-detection
Java.perform(function() {
    var SystemProperties = Java.use('android.os.SystemProperties');
    var Runtime = Java.use('java.lang.Runtime');
    var ProcessBuilder = Java.use('java.lang.ProcessBuilder');
    var File = Java.use('java.io.File');
    var Build = Java.use('android.os.Build');
    var BuildVersion = Java.use('android.os.Build$VERSION');
    var PackageManager = Java.use('android.content.pm.PackageManager');

    // Hook SystemProperties.get method (for getting properties like ro.debuggable, ro.secure)
    SystemProperties.get.overload('java.lang.String').implementation = function(name) {
        console.log('[SystemProperties.get] Property: ' + name);
        return this.get(name); // Call original method
    };

    // Hook Runtime.exec (for executing commands like "su", "id")
    Runtime.exec.overload('[Ljava.lang.String;').implementation = function(cmdArray) {
        console.log('[Runtime.exec] Command: ' + cmdArray);
        return this.exec(cmdArray); // Call original method
    };

    Runtime.exec.overload('java.lang.String').implementation = function(cmd) {
        console.log('[Runtime.exec] Command: ' + cmd);
        return this.exec(cmd); // Call original method
    };

    // Hook ProcessBuilder.start (for building and starting processes)
    ProcessBuilder.start.overload().implementation = function() {
        console.log('[ProcessBuilder.start] ProcessBuilder: ' + this.command().toString());
        return this.start(); // Call original method
    };

    // Hook file checks like exists(), canRead(), canWrite() (for checking root files or directories)
    File.exists.implementation = function() {
        var filePath = this.getPath();
        console.log('[File.exists] File: ' + filePath);
        return this.exists(); // Call original method
    };

    File.canRead.implementation = function() {
        var filePath = this.getPath();
        console.log('[File.canRead] File: ' + filePath);
        return this.canRead(); // Call original method
    };

    File.canWrite.implementation = function() {
        var filePath = this.getPath();
        console.log('[File.canWrite] File: ' + filePath);
        return this.canWrite(); // Call original method
    };

    // Hook Build.MODEL, Build.MANUFACTURER, and similar properties for VM detection
    console.log('[Build.MODEL] ' + Build.MODEL.value);
    console.log('[Build.MANUFACTURER] ' + Build.MANUFACTURER.value);
    console.log('[Build.BRAND] ' + Build.BRAND.value);
    console.log('[Build.DEVICE] ' + Build.DEVICE.value);
    console.log('[Build.PRODUCT] ' + Build.PRODUCT.value);
    console.log('[Build.BOARD] ' + Build.BOARD.value);
    console.log('[Build.HARDWARE] ' + Build.HARDWARE.value);
    console.log('[Build.FINGERPRINT] ' + Build.FINGERPRINT.value);
    console.log('[BuildVersion.SDK_INT] ' + BuildVersion.SDK_INT.value);

    // Hook PackageManager.getInstalledPackages (for checking apps like SuperSU, Magisk)
    PackageManager.getInstalledPackages.overload('int').implementation = function(flags) {
        console.log('[PackageManager.getInstalledPackages] Flags: ' + flags);
        return this.getInstalledPackages(flags); // Call original method
    };

    // Hook PackageManager.getPackageInfo (for checking specific packages)
    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(packageName, flags) {
        console.log('[PackageManager.getPackageInfo] Package: ' + packageName + ', Flags: ' + flags);
        return this.getPackageInfo(packageName, flags); // Call original method
    };

    // Hook SELinux.isSELinuxEnabled and isSELinuxEnforced
    var SELinux = Java.use('android.os.SELinux');
    SELinux.isSELinuxEnabled.implementation = function() {
        console.log('[SELinux.isSELinuxEnabled] Called');
        return this.isSELinuxEnabled(); // Call original method
    };

    SELinux.isSELinuxEnforced.implementation = function() {
        console.log('[SELinux.isSELinuxEnforced] Called');
        return this.isSELinuxEnforced(); // Call original method
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1613549528 @sdcampbell/android-vm-and-root-detection
