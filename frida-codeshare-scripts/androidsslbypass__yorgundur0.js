
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1596007354 @yorgundur0/androidsslbypass
Untitled
Java.perform(function() {
    console.log('SSL Pinning Bypass Script Loaded');

    // OkHTTPv3 Pinning Bypass
    try {
        var okhttp3_CertificatePinner = Java.use('okhttp3.CertificatePinner');
        okhttp3_CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function(p0, p1) {
            console.log('Bypassing OkHTTPv3: ' + p0);
            return;
        };
    } catch (err) {
        console.log('OkHTTPv3 Pinning Not Found');
    }

    // TrustManagerImpl Pinning Bypass
    try {
        var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
        TrustManagerImpl.checkTrustedRecursive.implementation = function(certs, ocspData, tlsSctData, authType, host, session, algorithmConstraints, untrustedChain, used) {
            console.log('Bypassing TrustManagerImpl: ' + host);
            // Return a new ArrayList to avoid the error
            var ArrayList = Java.use('java.util.ArrayList');
            var newCerts = ArrayList.$new();
            return newCerts;
        };
    } catch (err) {
        console.log('TrustManagerImpl Pinning Not Found');
    }

    // Appcelerator Pinning Bypass
    try {
        var PinningTrustManager = Java.use('appcelerator.https.PinningTrustManager');
        PinningTrustManager.checkServerTrusted.implementation = function() {
            console.log('Bypassing Appcelerator Pinning');
        };
    } catch (err) {
        console.log('Appcelerator Pinning Not Found');
    }

    // TrustManager Bypass (Fallback)
    try {
        var TrustManager = Java.use('javax.net.ssl.X509TrustManager');
        TrustManager.checkServerTrusted.implementation = function(chain, authType) {
            console.log('Bypassing checkServerTrusted: ' + authType);
        };
    } catch (err) {
        console.log('javax.net.ssl.X509TrustManager Not Found');
    }

    // SSLContext Bypass
    try {
        var SSLContext = Java.use('javax.net.ssl.SSLContext');
        SSLContext.init.overload('[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom').implementation = function(keyManager, trustManager, secureRandom) {
            console.log('Bypassing SSLContext');
            var TrustManager = Java.use('javax.net.ssl.TrustManager');
            var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
            var customTrustManager = Java.registerClass({
                name: 'com.custom.TrustManager',
                implements: [X509TrustManager],
                methods: {
                    checkClientTrusted: function(chain, authType) {},
                    checkServerTrusted: function(chain, authType) {},
                    getAcceptedIssuers: function() {
                        return [];
                    }
                }
            });
            var TrustManagers = [customTrustManager.$new()];
            this.init(keyManager, TrustManagers, secureRandom);
        };
    } catch (err) {
        console.log('SSLContext Not Found');
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1596007354 @yorgundur0/androidsslbypass
