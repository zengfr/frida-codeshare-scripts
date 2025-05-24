
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1529980089 @JockerNet-Dev/detectprotections
// Telegram  : @@JockerNetVIP
// My Channel : https://t.me/JockVIP
Java.perform(function() {
     // We are Egyptian Devs

    // Check for 'su' binary presence
    var Runtime = Java.use('java.lang.Runtime');
    Runtime.exec.overload('[Ljava.lang.String;').implementation = function(cmd) {
        console.log('Runtime.exec detected with command:', cmd);
        if (cmd[0].indexOf('su') !== -1) {
            console.log('Root check detected via su command');
            console.log(' By JockerNet-Dev');
        }
        return this.exec(cmd);
    };

    // Hook Runtime.getRuntime().exec("su")
    Runtime.exec.overload('java.lang.String').implementation = function(cmd) {
        console.log('Runtime.exec detected with command:', cmd);
        if (cmd.indexOf('su') !== -1) {
            console.log('Root check detected via su command');
        }
        return this.exec(cmd);
    };

    // Hook ProcessBuilder
    var ProcessBuilder = Java.use('java.lang.ProcessBuilder');
    ProcessBuilder.command.overload('java.util.List').implementation = function(cmd) {
        console.log('ProcessBuilder.command detected with command:', cmd);
        if (cmd.toString().indexOf('su') !== -1) {
            console.log('Root check detected via su command');
        }
        return this.command(cmd);
    };
    ProcessBuilder.command.overload('[Ljava.lang.String;').implementation = function(cmd) {
        console.log('ProcessBuilder.command detected with command:', cmd);
        if (cmd[0].indexOf('su') !== -1) {
            console.log('Root check detected via su command');
            console.log(' By JockerNet-Dev');
        }
        return this.command(cmd);
    };

    // Hook File.exists to detect checks for root-related files
    var File = Java.use('java.io.File');
    File.exists.implementation = function() {
        var path = this.getAbsolutePath();
        var result = this.exists();
        if (path === '/system/xbin/su' || path === '/system/bin/su' || path === '/system/app/Superuser.apk') {
            console.log('Root check detected via file existence:', path);
        }
        return result;
    };

    // Hook the System.getenv method to catch environment variable checks
    var System = Java.use('java.lang.System');
    System.getenv.overload('java.lang.String').implementation = function(name) {
        var result = this.getenv(name);
        console.log('System.getenv detected with name:', name, 'result:', result);
        if (name === 'PATH' && (result.indexOf('/system/xbin') !== -1 || result.indexOf('/system/bin') !== -1)) {
            console.log('Root check detected via PATH environment variable');
        }
        return result;
    };

    // Hook to detect checking for root-related packages
    var PackageManager = Java.use('android.app.ApplicationPackageManager');
    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pkg, flags) {
        console.log('PackageManager.getPackageInfo detected for package:', pkg);
        if (pkg === 'eu.chainfire.supersu' || pkg === 'com.koushikdutta.superuser' || pkg === 'com.thirdparty.superuser') {
            console.log('Root check detected via package:', pkg);
        }
        return this.getPackageInfo(pkg, flags);
    };

    // Hook Build.TAGS to catch "test-keys"
    var Build = Java.use('android.os.Build');
    var originalTags = Build.TAGS.value;
    Object.defineProperty(Build, 'TAGS', {
        get: function() {
            console.log('Build.TAGS detected:', originalTags);
            return originalTags;
        }
    });

    // Hook to detect reading root-related system properties
    var SystemProperties = Java.use('android.os.SystemProperties');
    SystemProperties.get.overload('java.lang.String').implementation = function(key) {
        var result = this.get(key);
        if (key === 'ro.build.tags' && result.indexOf('test-keys') !== -1) {
            console.log('Root check detected via system property:', key);
        }
        return result;
    };

    SystemProperties.get.overload('java.lang.String', 'java.lang.String').implementation = function(key, def) {
        var result = this.get(key, def);
        if (key === 'ro.build.tags' && result.indexOf('test-keys') !== -1) {
            console.log('Root check detected via system property:', key);
        }
        return result;
    };

    // Enhanced by Jocke Net

    // Hooking CRC32 methods for checksum verification
    var CRC32 = Java.use('java.util.zip.CRC32');
    CRC32.update.overload('[B').implementation = function(data) {
        console.log('CRC32 update detected with data:', data);
        console.log(' By JockerNet-Dev');
        this.update(data);
    };
    CRC32.getValue.implementation = function() {
        console.log('CRC32 getValue detected');
        return this.getValue();
    };

    // Hooking PackageManager to detect APK signature checks
    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pkg, flags) {
        console.log('PackageManager.getPackageInfo detected for package:', pkg);
        
        if (pkg === 'com.example.app' && (flags & PackageManager.GET_SIGNATURES) !== 0) {
            console.log('APK signature check detected for package:', pkg);
        }
        return this.getPackageInfo(pkg, flags);
    };

    // Hooking Signature class methods for signature checks
    var Signature = Java.use('android.content.pm.Signature');
    Signature.toByteArray.implementation = function() {
        console.log('Signature toByteArray detected');
        return this.toByteArray();
    };

    // Hooking MessageDigest to detect hash checks
    var MessageDigest = Java.use('java.security.MessageDigest');
    MessageDigest.digest.overload().implementation = function() {
        var result = this.digest();
        console.log('MessageDigest digest detected, result:', result);
        return result;
    };
    MessageDigest.update.overload('[B').implementation = function(input) {
        console.log('MessageDigest update detected with input:', input);
        this.update(input);
    };

    // Hooking CertificateFactory for certificate checks
    var CertificateFactory = Java.use('java.security.cert.CertificateFactory');
    CertificateFactory.generateCertificate.overload('java.io.InputStream').implementation = function(inputStream) {
        console.log('CertificateFactory generateCertificate detected');
        return this.generateCertificate(inputStream);
    };

    // Hooking FileInputStream for file reads (used in custom checks)
    var FileInputStream = Java.use('java.io.FileInputStream');
    FileInputStream.read.overload().implementation = function() {
        console.log('FileInputStream read detected');
        return this.read();
    };

    // Hooking File methods for file integrity checks
    File.length.implementation = function() {
        var length = this.length();
        console.log('File length detected, path:', this.getAbsolutePath(), 'length:', length);
        return length;
    };

    File.exists.implementation = function() {
        var exists = this.exists();
        console.log('File exists check detected, path:', this.getAbsolutePath(), 'exists:', exists);
        return exists;
    };

    
    // Hook Build.FINGERPRINT to detect emulator fingerprints
    Object.defineProperty(Build, 'FINGERPRINT', {
        get: function() {
            console.log('Build.FINGERPRINT detected:', this.FINGERPRINT);
            if (this.FINGERPRINT.toLowerCase().includes('generic') ||
                this.FINGERPRINT.toLowerCase().includes('vbox') ||
                this.FINGERPRINT.toLowerCase().includes('virtual')) {
                console.log('Emulator check detected via Build.FINGERPRINT:', this.FINGERPRINT);
            }
            return this.FINGERPRINT;
        }
    });

    // Hook Build.MODEL to detect emulator models
    Object.defineProperty(Build, 'MODEL', {
        get: function() {
            console.log('Build.MODEL detected:', this.MODEL);
            if (this.MODEL.toLowerCase() === 'sdk' ||
                this.MODEL.toLowerCase() === 'google_sdk' ||
                this.MODEL.toLowerCase().includes('droid4x') ||
                this.MODEL.toLowerCase().includes('nox') ||
                this.MODEL.toLowerCase().includes('emulator')) {
                console.log('Emulator check detected via Build.MODEL:', this.MODEL);
            }
            return this.MODEL;
        }
    });

    // Hook Build.MANUFACTURER to detect emulator manufacturers
    Object.defineProperty(Build, 'MANUFACTURER', {
        get: function() {
            console.log('Build.MANUFACTURER detected:', this.MANUFACTURER);
            if (this.MANUFACTURER.toLowerCase().includes('genymotion') ||
                this.MANUFACTURER.toLowerCase().includes('nox') ||
                this.MANUFACTURER.toLowerCase().includes('andy')) {
                console.log('Emulator check detected via Build.MANUFACTURER:', this.MANUFACTURER);
            }
            return this.MANUFACTURER;
        }
    });

    // Hook Build.HARDWARE to detect emulator hardware
    Object.defineProperty(Build, 'HARDWARE', {
        get: function() {
            console.log('Build.HARDWARE detected:', this.HARDWARE);
            if (this.HARDWARE.toLowerCase() === 'goldfish' ||
                this.HARDWARE.toLowerCase() === 'ranchu' ||
                this.HARDWARE.toLowerCase() === 'vbox86') {
                console.log('Emulator check detected via Build.HARDWARE:', this.HARDWARE);
            }
            return this.HARDWARE;
        }
    });

    // Hook Build.BOARD to detect emulator board
    Object.defineProperty(Build, 'BOARD', {
        get: function() {
            console.log('Build.BOARD detected:', this.BOARD);
            if (this.BOARD.toLowerCase() === 'unknown' ||
                this.BOARD.toLowerCase() === 'google_sdk' ||
                this.BOARD.toLowerCase() === 'emulator') {
                console.log('Emulator check detected via Build.BOARD:', this.BOARD);
            }
            return this.BOARD;
        }
    });

    // Hook Build.PRODUCT to detect emulator product
    Object.defineProperty(Build, 'PRODUCT', {
        get: function() {
            console.log('Build.PRODUCT detected:', this.PRODUCT);
            if (this.PRODUCT.toLowerCase() === 'sdk' ||
                this.PRODUCT.toLowerCase() === 'google_sdk' ||
                this.PRODUCT.toLowerCase() === 'sdk_google' ||
                this.PRODUCT.toLowerCase() === 'sdk_x86' ||
                this.PRODUCT.toLowerCase() === 'vbox86p') {
                console.log('Emulator check detected via Build.PRODUCT:', this.PRODUCT);
            }
            return this.PRODUCT;
        }
    });

    // Hook Build.HOST to detect emulator host
    Object.defineProperty(Build, 'HOST', {
        get: function() {
            console.log('Build.HOST detected:', this.HOST);
            if (this.HOST.toLowerCase() === 'android-build' ||
                this.HOST.toLowerCase() === 'abvb') {
                console.log('Emulator check detected via Build.HOST:', this.HOST);
            }
            return this.HOST;
        }
    });

    // Hook Build.USER to detect emulator user
    Object.defineProperty(Build, 'USER', {
        get: function() {
            console.log('Build.USER detected:', this.USER);
            if (this.USER.toLowerCase() === 'android-build' ||
                this.USER.toLowerCase() === 'android') {
                console.log('Emulator check detected via Build.USER:', this.USER);
            }
            return this.USER;
        }
    });


    if (Build.FINGERPRINT.includes('generic') ||
        Build.FINGERPRINT.includes('vbox') ||
        Build.FINGERPRINT.includes('generic_x86') ||
        Build.MODEL === 'sdk' ||
        Build.MODEL === 'google_sdk' ||
        Build.MODEL.includes('Emulator') ||
        Build.MODEL.includes('Android SDK built for x86') ||
        Build.MANUFACTURER === 'Genymotion' ||
        Build.PRODUCT === 'sdk' ||
        Build.PRODUCT === 'google_sdk' ||
        Build.HARDWARE === 'goldfish' ||
        Build.HARDWARE === 'ranchu' ||
        Build.BOARD === 'unknown' ||
        Build.BOARD === 'google_sdk' ||
        Build.BOARD === 'emulator' ||
        Build.PRODUCT === 'sdk_google' ||
        Build.PRODUCT === 'sdk_x86' ||
        Build.PRODUCT === 'vbox86p' ||
        Build.HOST === 'android-build' ||
        Build.USER === 'android-build' ||
        Build.USER === 'android') {
        console.log('Emulator check detected based on various properties');
    }

});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1529980089 @JockerNet-Dev/detectprotections
