
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1716019321 @beyrakIn/enum-packages-check
Java.perform(function() {
    console.log("\nFrida app running...");

    var PackageManager = Java.use("android.app.ApplicationPackageManager");

    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
        console.log("[+] " + pname);
        return this.getPackageInfo.overload('java.lang.String', 'int').call(this, pname, flags);
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1716019321 @beyrakIn/enum-packages-check
