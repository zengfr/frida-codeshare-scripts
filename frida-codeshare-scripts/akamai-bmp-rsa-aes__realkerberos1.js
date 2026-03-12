
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:545619148 @realkerberos1/akamai-bmp-rsa-aes
function processJniOnLoad(libraryName) {
    const library = Process.getModuleByName(libraryName);

    let exports = library.enumerateExports();
    let actualRsaEncryptAddress = null;
    let actualAesEncryptAddress = null;
    for (let i = 0; i < exports.length; i++) {
        const element = exports[i];
        if (element.name.includes("RSAEncrypt")) {
            actualRsaEncryptAddress = element.address;
        } else if (element.name.includes("AESEncrypt")) {
            actualAesEncryptAddress = element.address;
        }
    }

    if (actualRsaEncryptAddress == null) {
        throw ("No RSAEncrypt found. Try adjusting your filter.");
    }
    if (actualAesEncryptAddress == null) {
        throw ("No AESEncrypt found. Try adjusting your filter.");
    }

    console.log("[+] Actual RSA Encrypt Address " + actualRsaEncryptAddress);

    Interceptor.attach(actualRsaEncryptAddress, {
        onEnter: function(args) {
            console.log("Hooked RSAEncrypt");
            const rsaPublicKey = Memory.readUtf8String(args[0]); //public key is the first arg, and is type uchar *
            console.log(rsaPublicKey);
        },
        onLeave: function(retval) {
            console.log("Leaving RSAEncrypt");
        }
    });


    //AESEncrypt Hook (encrypts the sensor)
    console.log("[+] Actual AESEncrypt Address " + actualAesEncryptAddress);

    Interceptor.attach(actualAesEncryptAddress, {
        onEnter: function(args) {
            console.log("Hooked AESEncrypt");
            const plainSensor = Memory.readUtf8String(args[0]); //sensor is the first arg, and is type uchar *
            console.log(plainSensor);
        },
        onLeave: function(retval) {
            console.log("Leaving AESEncrypt");
        }
    });
}

function waitForLibLoading(libraryName) {
    var isLibLoaded = false;

    Interceptor.attach(Module.findExportByName(null, "android_dlopen_ext"), {
        onEnter: function(args) {
            var libraryPath = Memory.readCString(args[0]);
            if (libraryPath.includes(libraryName)) {
                console.log("[+] Loading library " + libraryPath + "...");
                isLibLoaded = true;
            }
        },
        onLeave: function(args) {
            if (isLibLoaded) {
                processJniOnLoad(libraryName);
                isLibLoaded = false;
            }
        }
    });
}

waitForLibLoading("libakamaibmp.so");
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:545619148 @realkerberos1/akamai-bmp-rsa-aes
