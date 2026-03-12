
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1852750837 @dontlosecontrol/okhttp4bypass
Java.perform(function() {
    console.log("[+] Starting comprehensive OkHttp4 bypass...");

    // Load OkHttp classes
    setTimeout(function() {
        Java.enumerateLoadedClasses({
            onMatch: function(name, handle) {
                if (name.indexOf("okhttp3") !== -1) {
                    console.log("[+] Found OkHttp class: " + name);
                }
            },
            onComplete: function() {}
        });
    }, 2000);

    //  Universal OkHttp Response Interceptor
    try {
        var Response = Java.use("okhttp3.Response");
        var ResponseBuilder = Java.use("okhttp3.Response$Builder");

        console.log("[+] OkHttp4 response interceptor enabled");
    } catch (e) {
        console.log("[-] Response interceptor failed: " + e.message);
    }

    // Bypass Application-Level Proxy Detection
    try {
        // General method for bypassing isProxySet checks
        Java.enumerateLoadedClasses({
            onMatch: function(name, handle) {
                if (name.indexOf("ProxyDetector") !== -1 ||
                    name.indexOf("NetworkChecker") !== -1 ||
                    name.indexOf("SecurityCheck") !== -1) {

                    try {
                        var clazz = Java.use(name);
                        var methods = clazz.class.getDeclaredMethods();

                        methods.forEach(function(method) {
                            var methodName = method.getName();
                            if (methodName.indexOf("isProxy") !== -1 ||
                                methodName.indexOf("checkProxy") !== -1 ||
                                methodName.indexOf("detectProxy") !== -1 ||
                                methodName.indexOf("hasProxy") !== -1) {

                                console.log("[+] Hooking proxy detection method: " + name + "." + methodName);

                                try {
                                    clazz[methodName].implementation = function() {
                                        console.log("[+] Proxy detection bypassed: " + methodName);
                                        return false;
                                    };
                                } catch (hookError) {
                                    console.log("[-] Failed to hook " + methodName + ": " + hookError);
                                }
                            }
                        });
                    } catch (e) {
                        console.log("[-] Failed to process class " + name + ": " + e);
                    }
                }
            },
            onComplete: function() {}
        });
    } catch (e) {
        console.log("[-] Proxy detection bypass failed: " + e.message);
    }

    // 3. OkHttp Call Interceptor
    try {
        var Call = Java.use("okhttp3.Call");

        // If RealCall exists
        try {
            var RealCall = Java.use("okhttp3.internal.call.RealCall");

            RealCall.execute.implementation = function() {
                console.log("[+] RealCall.execute() intercepted");

                try {
                    var response = this.execute();
                    return response;
                } catch (e) {
                    console.log("[-] Execute error: " + e);
                    throw e;
                }
            };

            console.log("[+] RealCall execute interceptor enabled");
        } catch (e) {
            console.log("[-] RealCall not found: " + e.message);
        }
    } catch (e) {
        console.log("[-] Call interceptor failed: " + e.message);
    }

    // 4. SSL Certificate Pinning Bypass
    try {
        var CertificatePinner = Java.use("okhttp3.CertificatePinner");
        CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation =
            function(hostname, peerCertificates) {
                console.log('[+] Certificate pinning bypassed for: ' + hostname);
                return;
            };
        console.log("[+] Certificate pinning bypass enabled");
    } catch (e) {
        console.log("[-] Certificate pinning bypass failed: " + e.message);
    }

    // 5. Enhanced Network Security Policy Bypass
    try {
        var NetworkSecurityPolicy = Java.use("android.security.NetworkSecurityPolicy");
        NetworkSecurityPolicy.getInstance.implementation = function() {
            var policy = this.getInstance();
            policy.isCleartextTrafficPermitted.overload().implementation = function() {
                console.log("[+] Cleartext traffic permitted");
                return true;
            };
            return policy;
        };
        console.log("[+] Enhanced network security policy bypass enabled");
    } catch (e) {
        console.log("[-] Enhanced network security policy not found: " + e.message);
    }

    // 6. TrustManager Bypass
    try {
        var X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");

        X509TrustManager.checkClientTrusted.implementation = function(chain, authType) {
            console.log("[+] Client certificate trust check bypassed");
        };

        X509TrustManager.checkServerTrusted.implementation = function(chain, authType) {
            console.log("[+] Server certificate trust check bypassed");
        };

        X509TrustManager.getAcceptedIssuers.implementation = function() {
            console.log("[+] Accepted issuers check bypassed");
            return [];
        };

        console.log("[+] TrustManager bypass enabled");
    } catch (e) {
        console.log("[-] TrustManager bypass failed: " + e.message);
    }

    console.log("[+] Comprehensive OkHttp4 bypass loaded!");
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1852750837 @dontlosecontrol/okhttp4bypass
