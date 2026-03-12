
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1803923612 @jadkorr/android-flutter-bypass
// flutter_bypass.js - Bypass Flutter anti-debugging and TLS verification
// Engine SnapshotHash: fee3de0d0af52c31bb081d4226a13a42
// Uses JNI callbacks instead of native hooking to avoid crashes
// by jadkorr

Java.perform(function() {
    console.log('[*] Flutter bypass starting...');

    // 1. Hook URLConnection to disable SSL verification at Java level
    try {
        var HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");

        // Override setDefaultHostnameVerifier
        HttpsURLConnection.setDefaultHostnameVerifier.overload("javax.net.ssl.HostnameVerifier").implementation = function(verifier) {
            console.log('[+] setDefaultHostnameVerifier called - using permissive verifier');
            // Don't set any verifier (allows all)
            return;
        };

        console.log('[+] HttpsURLConnection.setDefaultHostnameVerifier hooked');
    } catch (e) {
        console.log('[*] HttpsURLConnection hook failed: ' + e);
    }

    // 2. Hook SSLContext to accept all certificates
    try {
        var SSLContext = Java.use("javax.net.ssl.SSLContext");

        var init = SSLContext.init.overload(
            "[Ljavax.net.ssl.KeyManager;",
            "[Ljavax.net.ssl.TrustManager;",
            "java.security.SecureRandom"
        );

        init.implementation = function(keyManagers, trustManagers, secureRandom) {
            console.log('[+] SSLContext.init intercepted - installing permissive TrustManager');

            // Create a permissive trust manager
            var TrustManager = Java.use("javax.net.ssl.X509TrustManager");
            var TrustAllManager = Java.registerClass({
                name: "com.example.TrustAllCertificates",
                implements: [TrustManager],
                methods: {
                    checkClientTrusted: function(chain, authType) {},
                    checkServerTrusted: function(chain, authType) {},
                    getAcceptedIssuers: function() {
                        return null;
                    }
                }
            });

            var trustAllArray = Java.array("javax.net.ssl.X509TrustManager", [TrustAllManager.$new()]);
            return init.call(this, keyManagers, trustAllArray, secureRandom);
        };

        console.log('[+] SSLContext.init hooked');
    } catch (e) {
        console.log('[*] SSLContext hook failed: ' + e);
    }

    // 3. Hook OkHttp if Flutter uses it
    try {
        var OkHttpClient = Java.use("okhttp3.OkHttpClient$Builder");

        var build = OkHttpClient.build.overload();
        var originalBuild = build.implementation;

        build.implementation = function() {
            console.log('[+] OkHttpClient.Builder.build called');
            var client = originalBuild.call(this);

            try {
                // Set permissive certificate verifier
                var trustAll = Java.use("okhttp3.internal.tls.CertificateChainCleaner");
                client.sslSocketFactory = null;
            } catch (e) {
                console.log('[*] OkHttp SSL modification failed');
            }

            return client;
        };

        console.log('[+] OkHttpClient hooked');
    } catch (e) {
        console.log('[*] OkHttpClient hook failed');
    }

    // 4. Hook Retrofit if used
    try {
        var Retrofit = Java.use("retrofit2.Retrofit$Builder");

        var client = Retrofit.client.overload("okhttp3.OkHttpClient");
        client.implementation = function(httpClient) {
            console.log('[+] Retrofit client set - intercepted');
            return this.client(httpClient);
        };

        console.log('[+] Retrofit hooked');
    } catch (e) {
        console.log('[*] Retrofit hook failed');
    }

    // 5. Hook Google's HttpClient
    try {
        var HttpClient = Java.use("com.android.okhttp.OkHttpClient");

        if (HttpClient) {
            var setSSLSocketFactory = HttpClient.setSSLSocketFactory.overload("javax.net.ssl.SSLSocketFactory");
            setSSLSocketFactory.implementation = function(factory) {
                console.log('[+] OkHttp setSSLSocketFactory intercepted');
                return;
            };

            console.log('[+] com.android.okhttp hooked');
        }
    } catch (e) {
        console.log('[*] com.android.okhttp hook failed');
    }

    // 6. Hook HttpURLConnection
    try {
        var URLConnection = Java.use("java.net.URLConnection");

        var getInputStream = URLConnection.getInputStream.overload();
        getInputStream.implementation = function() {
            console.log('[*] URLConnection.getInputStream called');
            return getInputStream.call(this);
        };

        console.log('[+] URLConnection hooked');
    } catch (e) {
        console.log('[*] URLConnection hook failed');
    }

    // 7. Hook common antidebug properties that Flutter might check
    try {
        var System = Java.use("java.lang.System");
        var originalGetProperty = System.getProperty.overload("java.lang.String");

        System.getProperty.overload("java.lang.String").implementation = function(key) {
            if (key && (key.includes("ro.debuggable") || key.includes("ro.secure"))) {
                console.log('[+] System.getProperty("' + key + '") - returning safe value');
                return "1";
            }
            return originalGetProperty.call(this, key);
        };

        console.log('[+] System.getProperty hooked');
    } catch (e) {
        console.log('[*] System.getProperty hook failed: ' + e);
    }

    console.log('[+] Flutter bypass loaded successfully');
});

console.log('[+] Flutter bypass script initialized');
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1803923612 @jadkorr/android-flutter-bypass
