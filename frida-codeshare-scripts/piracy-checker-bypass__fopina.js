
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1253016008 @fopina/piracy-checker-bypass
/*
Android piracy checker bypass

Bypass implemented based on https://stackoverflow.com/a/37540163/432152
*/

Java.perform(function() {
    var PackageManager = Java.use("android.app.ApplicationPackageManager");

    var loaded_classes = Java.enumerateLoadedClassesSync();

    send("Loaded " + loaded_classes.length + " classes!");

    PackageManager.getInstallerPackageName.implementation = function(pname) {
        var original = this.getInstallerPackageName.call(this, pname);
        send("Bypass INSTALLER check for package: " + original + " " + pname);
        return 'com.android.vending';
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1253016008 @fopina/piracy-checker-bypass
