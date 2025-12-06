
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1491105482 @jadkorr/universal-ssl-pinning-bypass
Java.perform(function() {
    console.log("\n               Universal SSL Pinning Bypass v2.0");
    console.log("                    by Jadkorr\n");

    try {
        // 1. TrustManager - Android Conscrypt
        try {
            var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
            TrustManagerImpl.verifyChain.implementation = function(untrustedChain, host, session) {
                console.log("[*] TrustManagerImpl.verifyChain() bypassed for: " + host);
                return untrustedChain;
            };
            console.log("[✓] Android Conscrypt TrustManager hooked");
        } catch (err) {
            console.log("[!] Android Conscrypt TrustManager not found");
        }

        // 2. X509TrustManager
        try {
            var X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
            X509TrustManager.checkClientTrusted.implementation = function(chain, authType) {
                console.log("[*] X509TrustManager.checkClientTrusted() bypassed");
            };
            X509TrustManager.checkServerTrusted.implementation = function(chain, authType) {
                console.log("[*] X509TrustManager.checkServerTrusted() bypassed");
            };
            X509TrustManager.getAcceptedIssuers.implementation = function() {
                console.log("[*] X509TrustManager.getAcceptedIssuers() bypassed");
                return [];
            };
            console.log("[✓] X509TrustManager hooked");
        } catch (err) {
            console.log("[!] X509TrustManager not found");
        }

        // 3. WebViewClient
        try {
            var WebViewClient = Java.use("android.webkit.WebViewClient");
            WebViewClient.onReceivedSslError.implementation = function(view, handler, error) {
                console.log("[*] WebViewClient.onReceivedSslError() bypassed");
                handler.proceed();
            };
            console.log("[✓] WebViewClient SSL error handler hooked");
        } catch (err) {
            console.log("[!] WebViewClient not found");
        }

        // 4. OkHttp3 CertificatePinner
        try {
            var CertificatePinner3 = Java.use("okhttp3.CertificatePinner");
            CertificatePinner3.check.overload("java.lang.String", "java.util.List").implementation = function(hostname, peerCertificates) {
                console.log("[*] OkHttp3 CertificatePinner.check() bypassed for: " + hostname);
                return;
            };
            console.log("[✓] OkHttp 3.x CertificatePinner hooked");
        } catch (err) {
            console.log("[!] OkHttp 3.x CertificatePinner not found");
        }

        // 5. HostnameVerifier
        try {
            var HostnameVerifier = Java.use("javax.net.ssl.HostnameVerifier");
            HostnameVerifier.verify.implementation = function(hostname, session) {
                console.log("[*] HostnameVerifier.verify() bypassed for: " + hostname);
                return true;
            };
            console.log("[✓] HostnameVerifier hooked");
        } catch (err) {
            console.log("[!] HostnameVerifier not found");
        }

        // 6. OkHttp HostnameVerifier
        try {
            var OkHostnameVerifier = Java.use("okhttp3.internal.tls.OkHostnameVerifier");
            OkHostnameVerifier.verify.overload("java.lang.String", "javax.net.ssl.SSLSession").implementation = function(hostname, session) {
                console.log("[*] OkHostnameVerifier.verify() bypassed for: " + hostname);
                return true;
            };
            console.log("[✓] OkHttp HostnameVerifier hooked");
        } catch (err) {
            console.log("[!] OkHttp HostnameVerifier not found");
        }

        // 7. SSLContext
        try {
            var SSLContext = Java.use("javax.net.ssl.SSLContext");
            var X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");

            var TrustManagerFactory = Java.registerClass({
                name: 'com.*******.TrustManagerFactory',
                implements: [X509TrustManager],
                methods: {
                    checkClientTrusted: function(chain, authType) {
                        console.log("[*] Custom TrustManager - checkClientTrusted bypassed");
                    },
                    checkServerTrusted: function(chain, authType) {
                        console.log("[*] Custom TrustManager - checkServerTrusted bypassed");
                    },
                    getAcceptedIssuers: function() {
                        return [];
                    }
                }
            });

            SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom").implementation = function(keyManager, trustManager, secureRandom) {
                console.log("[*] SSLContext.init() called - injecting custom TrustManager");
                var customTrustManager = TrustManagerFactory.$new();
                this.init(keyManager, [customTrustManager], secureRandom);
            };
            console.log("[✓] SSLContext.init() hooked with custom TrustManager");
        } catch (err) {
            console.log("[!] SSLContext hooking failed");
        }

        // 8. Network Security Policy
        try {
            var NetworkSecurityPolicy = Java.use("android.security.NetworkSecurityPolicy");
            NetworkSecurityPolicy.getInstance.implementation = function() {
                console.log("[*] NetworkSecurityPolicy.getInstance() bypassed");
                return Java.cast(this.getInstance(), NetworkSecurityPolicy);
            };

            var NetworkSecurityPolicyInstance = NetworkSecurityPolicy.getInstance();
            NetworkSecurityPolicyInstance.isCertificateTransparencyVerificationRequired.implementation = function(hostname) {
                console.log("[*] Certificate Transparency verification disabled for: " + hostname);
                return false;
            };
            console.log("[✓] Network Security Policy hooked");
        } catch (err) {
            console.log("[!] Network Security Policy not found");
        }

        // 9. Hardcoded Certificate Bypass
        try {
            var X509Certificate = Java.use("java.security.cert.X509Certificate");
            X509Certificate.checkValidity.overload().implementation = function() {
                console.log("[*] X509Certificate.checkValidity() bypassed");
                return;
            };

            X509Certificate.checkValidity.overload('java.util.Date').implementation = function(date) {
                console.log("[*] X509Certificate.checkValidity(Date) bypassed");
                return;
            };

            X509Certificate.verify.overload('java.security.PublicKey').implementation = function(publicKey) {
                console.log("[*] X509Certificate.verify() bypassed");
                return;
            };

            console.log("[✓] Hardcoded X509Certificate validation bypassed");
        } catch (err) {
            console.log("[!] X509Certificate bypass failed");
        }

        console.log("\n[*] SSL Pinning Bypass initialization completed");
        console.log("[*] Monitoring SSL/TLS connections...");

    } catch (err) {
        console.log("[!] Critical error: " + err);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1491105482 @jadkorr/universal-ssl-pinning-bypass
