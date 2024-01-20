
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:116141852 @teknogeek/android-universal-ssl-unpin
Java.perform(function() {
    console.log('\n[.] Cert Pinning Bypass');

    // Create a TrustManager that trusts everything
    console.log('[+] Creating a TrustyTrustManager that trusts everything...');
    var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
    var TrustyTrustManager = Java.registerClass({
        name: 'com.example.TrustyTrustManager',
        implements: [X509TrustManager],
        methods: {
            checkClientTrusted: function(chain, authType) {},
            checkServerTrusted: function(chain, authType) {},
            getAcceptedIssuers: function() {
                return [];
            }
        }
    });
    console.log('[+] Our TrustyTrustManagers is ready');

    var SSLContext = Java.use('javax.net.ssl.SSLContext');
    try {
        SSLContext.init.overload('[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom').implementation = function(keyManager, trustManager, secureRandom) {
            console.log('[+] App invoked SSLContext.init()...');
            SSLContext.init.overload('[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom').call(this, keyManager, [TrustyTrustManager.$new()], secureRandom);
            console.log('[+] SSLContext initialized with our custom TrustManager!');
        };
        console.log('[+] Setup hook for SSLContext.init()');
    } catch (err) {
        console.log('[-] Unable to hook SSLContext.init()');
    }

    // okhttp3
    var CertificatePinner = null;
    try {
        CertificatePinner = Java.use('okhttp3.CertificatePinner');
    } catch (err) {
        console.log('[-] OkHTTPv3 CertificatePinner class not found. Skipping.');
        CertificatePinner = null;
    }

    if (CertificatePinner != null) {
        try {
            CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function(str, list) {
                console.log(`[+] Bypassing OkHTTPv3-1: ${str}`);
                return true;
            };
            console.log('[+] Loaded OkHTTPv3-1 hook');
        } catch (err) {
            console.log('[-] Skipping OkHTTPv3-1 hook');
        }

        try {
            CertificatePinner.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(str, cert) {
                console.log(`[+] Bypassing OkHTTPv3-2: ${str}`);
                return true;
            };
            console.log('[+] Loaded OkHTTPv3-2 hook');
        } catch (err) {
            console.log('[-] Skipping OkHTTPv3-2 hook');
        }

        try {
            CertificatePinner.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function(str, certArr) {
                console.log(`[+] Bypassing OkHTTPv3-3: ${str}`);
                return true;
            };
            console.log('[+] Loaded OkHTTPv3-3 hook');
        } catch (err) {
            console.log('[-] Skipping OkHTTPv3-3 hook');
        }

        try {
            CertificatePinner['check$okhttp'].implementation = function(str, peerCerts) {
                console.log(`[+] Bypassing OkHTTPv3-4 (4.2+): ${str}`);
            };
            console.log('[+] Loaded OkHTTPv3-4 hook (4.2+)');
        } catch (err) {
            console.log('[-] Skipping OkHTTPv3-4 hook (4.2+)');
        }
    }

    // trustkit
    try {
        var Activity = Java.use("com.datatheorem.android.trustkit.pinning.OkHostnameVerifier");
        Activity.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(str) {
            console.log(`[+] Intercepted trustkit.verify[1]: ${str}`);
            return true;
        };

        Activity.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(str) {
            console.log(`[+] Intercepted trustkit.verify[2]: ${str}`);
            return true;
        };

        console.log('[+] Setup trustkit pinning');
    } catch (err) {
        console.log('[-] Unable to hook trustkit pinning');
    }

    // Appcelerator
    try {
        var PinningTrustManager = Java.use('appcelerator.https.PinningTrustManager');
        PinningTrustManager.checkServerTrusted.implementation = function() {
            console.log('[+] Skipping Appcelerator check');
        }

        console.log('[+] Setup Appcelerator pinning');
    } catch (err) {
        console.log('[-] Unable to hook Appcelerator pinning');
    }

    // TrustManagerImpl
    var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
    var Arrays = Java.use('java.util.Arrays');
    try {
        TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
            console.log(`[+] Intercepted TrustManagerImpl for host: ${host}`);
            return untrustedChain;
        }

        console.log('[+] Loaded TrustManagerImpl.verifyChain hook');
    } catch (err) {
        console.log('[-] Unable to hook into TrustManagerImpl.verifyChain()');
    }

    // Android 8
    try {
        TrustManagerImpl.checkTrusted.overload('[Ljava.security.cert.X509Certificate;', 'java.lang.String', 'java.lang.String', 'boolean').implementation = function(chain, type, host, b) {
            console.log(`[+] Ignoring trust check for host: ${host}`);
            return Arrays.asList(chain);
        };
        console.log('[+] Loaded TrustManagerImpl.checkTrusted hook (Android 8)');
    } catch (err) {
        // Android 9+
        try {
            TrustManagerImpl.checkTrusted.overload('[Ljava.security.cert.X509Certificate;', '[B', '[B', 'java.lang.String', 'java.lang.String', 'boolean').implementation = function(chain, b1, b2, type, host, bool) {
                console.log(`[+] Ignoring trust check for host: ${host}`);
                return Arrays.asList(chain);
            };
            console.log('[+] Loaded TrustManagerImpl.checkTrusted hook (Android 9+)');
        } catch (err2) {
            console.log('[-] Unable to hook either TrustManagerImpl.checkTrusted() method');
        }
    }

    // NetworkSecurityTrustManager
    try {
        var NetworkSecurityTrustManager = Java.use('android.security.net.config.NetworkSecurityTrustManager');
        NetworkSecurityTrustManager.isPinningEnforced.implementation = function(chain) {
            console.log('[+] Bypassing NetworkSecurityTrustManager pinning check');
            return false;
        }

        console.log('[+] Setup NetworkSecurityTrustManager hook');
    } catch (err) {
        console.log('[-] Unable to hook NetworkSecurityTrustManager.isPinningEnforced()');
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:116141852 @teknogeek/android-universal-ssl-unpin
