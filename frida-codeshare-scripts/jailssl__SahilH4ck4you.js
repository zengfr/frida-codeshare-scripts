
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1612332416 @SahilH4ck4you/jailssl
/**
 * Combined Frida script
 * - Bypasses JailMonkey root detection
 * - Bypasses SSL pinning (common trust manager bypass)
 */

Java.perform(() => {
    // --- Root Detection Bypass for JailMonkey ---
    try {
        const klass = Java.use("com.gantix.JailMonkey.JailMonkeyModule");
        const hashmap_klass = Java.use("java.util.HashMap");
        const false_obj = Java.use("java.lang.Boolean").FALSE.value;

        klass.getConstants.implementation = function () {
            var h = hashmap_klass.$new();
            h.put("isJailBroken", false_obj);
            h.put("hookDetected", false_obj);
            h.put("canMockLocation", false_obj);
            h.put("isOnExternalStorage", false_obj);
            h.put("AdbEnabled", false_obj);
            return h;
        };

        console.log("[+] JailMonkey root checks bypassed");
    } catch (err) {
        console.log("[-] JailMonkey bypass failed:", err);
    }

    // --- SSL Pinning Bypass ---
    try {
        const X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
        const SSLContext = Java.use('javax.net.ssl.SSLContext');

        // Create a new TrustManager that trusts all certs
        const TrustManager = Java.registerClass({
            name: 'org.anti.pinning.TrustManager',
            implements: [X509TrustManager],
            methods: {
                checkClientTrusted: function (chain, authType) { },
                checkServerTrusted: function (chain, authType) { },
                getAcceptedIssuers: function () { return []; }
            }
        });

        // Override SSLContext.init to use our TrustManager
        const TrustManagers = [TrustManager.$new()];
        SSLContext.init.overload('[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom')
            .implementation = function (keyManager, trustManager, secureRandom) {
                console.log('[+] Overriding SSLContext.init with custom TrustManager');
                this.init(keyManager, TrustManagers, secureRandom);
            };

        console.log("[+] SSL pinning bypassed via TrustManager hook");
    } catch (err) {
        console.log("[-] SSL pinning bypass failed:", err);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1612332416 @SahilH4ck4you/jailssl
