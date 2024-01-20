
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-829299357 @sdcampbell/android-hook-crypto-functions
Java.perform(function() {

    function printStackTrace() {
        var Exception = Java.use("java.lang.Exception");
        var ex = Exception.$new();
        var stack = ex.getStackTrace();
        console.log("[*] Stack trace:");
        for (var i = 0; i < stack.length; i++) {
            console.log("\t" + stack[i].toString());
        }
    }

    // Function to safely convert byte array to a string
    function byteArrayToSafeString(byteArray) {
        var result = '';
        for (var i = 0; i < byteArray.length; ++i) {
            var byteVal = byteArray[i] & 0xFF;  // Get unsigned byte value
            // Only convert printable ASCII characters (32-126); otherwise, use a placeholder (.)
            if (byteVal >= 32 && byteVal <= 126) {
                result += String.fromCharCode(byteVal);
            } else {
                result += '.';  // Replace non-printable characters with a dot
            }
        }
        return result;
    }

    // Hook javax.crypto.Cipher.init function
    var Cipher = Java.use('javax.crypto.Cipher');

    Cipher.init.overload('int', 'java.security.Key').implementation = function(opmode, key) {
        console.log("[*] Cipher.init() called with opmode: " + opmode + " and key: " + key);
        return this.init(opmode, key);
    };

    Cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec').implementation = function(opmode, key, params) {
        console.log("[*] Cipher.init() called with opmode: " + opmode + ", key: " + key + ", params: " + params);
        return this.init(opmode, key, params);
    };

    // Hook javax.crypto.Mac.init function
    var Mac = Java.use('javax.crypto.Mac');
    Mac.init.overload('java.security.Key').implementation = function(key) {
        console.log("[*] Mac.init() called with key: " + key);
        return this.init(key);
    };

    // Hook java.security.MessageDigest getInstance and digest functions
    var MessageDigest = Java.use('java.security.MessageDigest');
    MessageDigest.getInstance.overload('java.lang.String').implementation = function(algorithm) {
        console.log("[*] MessageDigest.getInstance() called with algorithm: " + algorithm);
        return this.getInstance(algorithm);
    };

    MessageDigest.digest.overload('[B').implementation = function(input) {
        console.log("[*] MessageDigest.digest() called with input: " + input);

        // Convert byte array to a safe string and print it immediately
        var byteArray = Java.array('byte', input);  // Convert input to a Java byte array
        var safePlaintext = byteArrayToSafeString(byteArray);
        console.log("[*] Plaintext interpretation of input bytes: " + safePlaintext);
        return this.digest(input);
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-829299357 @sdcampbell/android-hook-crypto-functions
