
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-702187790 @dmaral3noz/0xsaudi-root-detection-bypass
// 0xSaudi-root-detection-bypass
// Saud Alenazi & https://twitter.com/dmaral3noz
// https://t.me/x0Saudi

Java.perform(function() {
    var RootPackages = ["com.noshufou.android.su", "com.noshufou.android.su.elite", "eu.chainfire.supersu",
        "com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su", "com.koushikdutta.rommanager",
        "com.koushikdutta.rommanager.license", "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch",
        "com.ramdroid.appquarantine", "com.ramdroid.appquarantinepro", "com.devadvance.rootcloak", "com.devadvance.rootcloakplus",
        "de.robv.android.xposed.installer", "com.saurik.substrate", "com.zachspong.temprootremovejb", "com.amphoras.hidemyroot",
        "com.amphoras.hidemyrootadfree", "com.formyhm.hiderootPremium", "com.formyhm.hideroot", "me.phh.superuser",
        "eu.chainfire.supersu.pro", "com.kingouser.com", "com.android.vending.billing.InAppBillingService.COIN","com.topjohnwu.magisk"
    ];
 
    var RootBinaries = ["su", "which", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk", "magisk",
    "/system/app/Superuser.apk", "/vendor/bin", "/system/bin/failsafe", "/system/bin/failsafe/su", "/sbin/", "/sbin/su",
    "/data/local/xbin", "/system/usr/we-need-root/", "/data/local/xbin/su", "/data/local/bin", "/data/local/bin/su",
    "/su/bin/su", "/data/", "/cache/", "/dev/", "/product/bin/", "/vendor/bin/", "/vendor/xbin/", "/odm/bin/",
    "/apex/com.android.runtime/bin/", "/apex/com.android.art/bin/", "/data/local", "/data/local/su", "/system/xbin/",
    "/system/xbin/su", "/system/xbin/which", "/system/sd/xbin", "/system/sd/xbin/su", "/system/bin/su", "/system/bin",
    "/sbin/.magisk", "/sbin/.magisk/img", "/sbin/.magisk/mirror", "/sbin/.core/mirror", "/system/addon.d",
    "/system/bin/mir", "/system/etc/init.d", "/system/vendor/bin", "/system/xbin/mir"
    ];
    var RootProperties = {
        "ro.build.selinux": "1",
        "ro.debuggable": "0",
        "service.adb.root": "0",
        "ro.secure": "1"
    };

    var PackageManager = Java.use("android.app.ApplicationPackageManager");
    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
        if (RootPackages.indexOf(pname) > -1) {
            console.log("Saud Bypass root check for package: " + pname);
            pname = "saud.package.Dmar";
        }
        return this.getPackageInfo.call(this, pname, flags);
    };

    var NativeFile = Java.use('java.io.File');
    NativeFile.exists.implementation = function() {
        var name = NativeFile.getName.call(this);
        if (RootBinaries.indexOf(name) > -1) {
            console.log("Saud Bypass NativeFile.exists for binary: " + name);
            return false;
        } else {
            return this.exists.call(this);
        }
    };

    var Runtime = Java.use('java.lang.Runtime');
    Runtime.exec.overload('java.lang.String').implementation = function(cmd) {
        if (cmd == "su") {
            console.log("Saud Bypass Runtime.exec for command: " + cmd);
            return null;
        } else {
            return this.exec.call(this, cmd);
        }
    };


    var SystemProperties = Java.use('android.os.SystemProperties');
    SystemProperties.get.overload('java.lang.String').implementation = function(name) {
        if (RootProperties[name]) {
            console.log("Saud Bypass SystemProperties.get for property: " + name);
            return RootProperties[name];
        } else {
            return this.get.call(this, name);
        }
    };

 
    var BufferedReader = Java.use('java.io.BufferedReader');
    BufferedReader.readLine.overload().implementation = function() {
        var line = this.readLine.call(this);
        if (line && line.indexOf("ro.build.tags=test-keys") > -1) {
            console.log("Saud Bypass BufferedReader.readLine for build.prop");
            line = line.replace("ro.build.tags=test-keys", "ro.build.tags=release-keys");
        }
        return line;
    };

    Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
        onEnter: function(args) {
            var path = Memory.readCString(args[0]);
            if (path.indexOf("build.prop") > -1) {
                console.log("Saud Bypass fopen for build.prop");
                Memory.writeUtf8String(args[0], "/Saud/Dmar/build.prop");
            }
        }
    });

  
    var ProcessBuilder = Java.use('java.lang.ProcessBuilder');
    ProcessBuilder.start.implementation = function() {
        var cmd = this.command.call(this);
        if (cmd && cmd.indexOf("su") > -1) {
            console.log("Saud Bypass ProcessBuilder for command: " + cmd);
            cmd = ["saudcommand"];
            this.command.call(this, cmd);
        }
        return this.start.call(this);
    };

    if (Java.available && Java.androidVersion.startsWith('5') || Java.androidVersion.startsWith('6') || Java.androidVersion.startsWith('7') || Java.androidVersion.startsWith('8') || Java.androidVersion.startsWith('9') || Java.androidVersion.startsWith('10')) {
        var KeyInfo = Java.use('android.security.keystore.KeyInfo');
        KeyInfo.isInsideSecureHardware.implementation = function() {
            console.log("Bypass KeyInfo.isInsideSecureHardware");
            return false;
        };
    }


    var openPtr = Module.findExportByName("libc.so", "open");
    var accessPtr = Module.findExportByName("libc.so", "access");

    var open = new NativeFunction(openPtr, 'int', ['pointer', 'int']);
    var access = new NativeFunction(accessPtr, 'int', ['pointer', 'int']);

    Interceptor.replace(openPtr, new NativeCallback(function (path, flags) {
        if (Memory.readUtf8String(path).endsWith("/su")) {
            return -1;
        }
        return open(path, flags);
    }, 'int', ['pointer', 'int']));

    Interceptor.replace(accessPtr, new NativeCallback(function (path, mode) {
        if (Memory.readUtf8String(path).endsWith("/su")) {
            return -1;
        }
        return access(path, mode);
    }, 'int', ['pointer', 'int']));
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-702187790 @dmaral3noz/0xsaudi-root-detection-bypass
