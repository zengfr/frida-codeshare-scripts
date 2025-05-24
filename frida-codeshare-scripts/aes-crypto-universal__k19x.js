
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-658287805 @k19x/aes-crypto-universal
// by: Caique Pascoal (kiqx8)
// frida -U -n "<APPNAME> -l script_crypto.js --no-pause"

Java.perform(function() {
    try {
        var IvParameterSpec = Java.use('javax.crypto.spec.IvParameterSpec');
        var SecretKeySpec = Java.use('javax.crypto.spec.SecretKeySpec');

        var lastIv = null,
            lastKey = null;

        function byteArrayToHexString(byteArray) {
            return Array.from(byteArray, b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
        }

        function logInfo(prefix, value) {
            console.log(`[+] ${prefix}: ${value}`);
        }

        IvParameterSpec.$init.overload('[B').implementation = function(iv) {
            try {
                var currentIv = byteArrayToHexString(iv);
                if (lastIv !== currentIv) {
                    logInfo('IvParameterSpec', currentIv);
                    lastIv = currentIv;
                }
                return this.$init(iv);
            } catch (error) {
                console.error('[!] Error in IvParameterSpec implementation: ' + error);
            }
        };

        SecretKeySpec.$init.overload('[B', 'java.lang.String').implementation = function(keyBytes, algorithm) {
            try {
                var currentKey = byteArrayToHexString(keyBytes);
                if (lastKey !== currentKey) {
                    logInfo('SecretKeySpec', currentKey + ', ' + algorithm);
                    lastKey = currentKey;
                }
                return this.$init(keyBytes, algorithm);
            } catch (error) {
                console.error('[!] Error in SecretKeySpec implementation: ' + error);
            }
        };
    } catch (error) {
        console.error('[!] Error in Java.perform: ' + error);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-658287805 @k19x/aes-crypto-universal
