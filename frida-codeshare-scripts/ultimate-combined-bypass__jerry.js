
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:268396656 @jerry/ultimate-combined-bypass
/**
 * ULTIMATE COMBINED BYPASS
 * Root Detection Bypass + SSL Pinning Bypass
 */

console.log("[🎯] Starting Ultimate Combined Bypass");

Java.perform(function() {
    console.log("[✅] Applying all bypasses...");

    // ========== COMPLETE TERMINATION PROTECTION ========== //
    var killCount = 0;
    Java.use("android.os.Process").killProcess.implementation = function(pid) {
        killCount++;
        console.log("[🛡️] BLOCKED killProcess #" + killCount + " - App stays alive");
        // Don't call original - keep app running
    };

    Java.use("java.lang.System").exit.implementation = function(code) {
        console.log("[🛡️] BLOCKED System.exit(" + code + ")");
    };

    Java.use("java.lang.Runtime").exit.implementation = function(code) {
        console.log("[🛡️] BLOCKED Runtime.exit(" + code + ")");
    };

    // ========== STRING DETECTION BYPASS ========== //
    try {
        var String = Java.use("java.lang.String");

        // Hook equals method
        String.equals.implementation = function(other) {
            var result = this.equals.call(this, other);
            if (other && (other.toString().toLowerCase() === "root" || other.toString().toLowerCase().includes("root"))) {
                console.log("[✅] String.equals('root') -> FORCED FALSE");
                return false;
            }
            return result;
        };

        // Hook contains method
        String.contains.implementation = function(sequence) {
            var result = this.contains.call(this, sequence);
            if (sequence && sequence.toString().toLowerCase().includes("root")) {
                console.log("[✅] String.contains('root') -> FORCED FALSE");
                return false;
            }
            return result;
        };

        // Hook equalsIgnoreCase
        String.equalsIgnoreCase.implementation = function(other) {
            var result = this.equalsIgnoreCase.call(this, other);
            if (other && other.toString().toLowerCase().includes("root")) {
                console.log("[✅] String.equalsIgnoreCase('root') -> FORCED FALSE");
                return false;
            }
            return result;
        };
    } catch (e) {}

    // ========== SECURITYCHECK COMPLETE BYPASS ========== //
    try {
        var SecurityCheck = Java.use("com.example.virtualoffice.SecurityCheck");
        var methods = SecurityCheck.class.getDeclaredMethods();
        methods.forEach(function(method) {
            var methodName = method.getName();
            try {
                SecurityCheck[methodName].implementation = function() {
                    console.log("[✅] SecurityCheck." + methodName + " -> NEUTRALIZED");
                    if (method.getReturnType().getName() === "boolean") return false;
                    if (method.getReturnType().getName() === "void") return;
                    return null;
                };
            } catch (e) {}
        });
    } catch (e) {}

    // ========== ROOT DETECTION BYPASS ========== //

    // File detection
    try {
        var File = Java.use("java.io.File");
        File.exists.implementation = function() {
            var path = this.getPath();
            if (path && (path.includes("/su") || path.includes("/magisk") || path.includes("busybox"))) {
                return false;
            }
            return this.exists.call(this);
        };
    } catch (e) {}

    // Command execution
    try {
        var Runtime = Java.use("java.lang.Runtime");
        Runtime.exec.overload('[Ljava.lang.String;').implementation = function(cmdArray) {
            if (cmdArray) {
                var cmd = cmdArray.join(" ");
                if (cmd.includes("su") || cmd.includes("which") || cmd.includes("busybox")) {
                    console.log("[✅] Blocked command: " + cmd);
                    return null;
                }
            }
            return this.exec.call(this, cmdArray);
        };
    } catch (e) {}

    // ========== POPUP & UI BYPASS ========== //

    // Hook ALL dialog and popup methods
    try {
        var Dialog = Java.use("android.app.Dialog");
        Dialog.show.implementation = function() {
            console.log("[🔍] Dialog.show() called - CHECKING FOR ROOT POPUP");

            // Try to detect if this is a root detection popup
            try {
                // Check various fields that might contain the message
                var fields = ["mTitle", "mMessage", "message", "mAlert"];
                for (var i = 0; i < fields.length; i++) {
                    try {
                        var field = Dialog.class.getDeclaredField(fields[i]);
                        field.setAccessible(true);
                        var value = field.get(this);
                        if (value && value.toString().toLowerCase().includes("root")) {
                            console.log("[🚨] ROOT POPUP DETECTED AND BLOCKED");
                            console.log("[🚨] Field: " + fields[i] + ", Value: " + value);
                            return; // Block the popup
                        }
                    } catch (e) {}
                }
            } catch (e) {}

            return this.show.call(this);
        };
    } catch (e) {}

    // Hook Toast messages
    try {
        var Toast = Java.use("android.widget.Toast");
        Toast.makeText.overload('android.content.Context', 'java.lang.CharSequence', 'int').implementation = function(context, text, duration) {
            if (text && text.toString().toLowerCase().includes("root")) {
                console.log("[🚨] ROOT TOAST BLOCKED: " + text);
                return null;
            }
            return this.makeText.call(this, context, text, duration);
        };
    } catch (e) {}

    // ========== ADDITIONAL DETECTION BYPASS ========== //

    // Build properties
    try {
        var Build = Java.use("android.os.Build");
        Build.TAGS.value = "release-keys";
        Build.TYPE.value = "user";
        Build.TAGS.value = "release-keys";
    } catch (e) {}

    // System properties
    try {
        var SystemProperties = Java.use("android.os.SystemProperties");
        SystemProperties.get.overload('java.lang.String').implementation = function(key) {
            if (key === "ro.debuggable") return "0";
            if (key === "ro.secure") return "1";
            if (key === "ro.build.type") return "user";
            if (key === "ro.build.tags") return "release-keys";
            return this.get.call(this, key);
        };
    } catch (e) {}

    // ========== SSL PINNING BYPASS ========== //

    console.log("[🔓] Applying SSL Pinning Bypass...");

    // 1. HostnameVerifier - Always return true
    try {
        var HostnameVerifier = Java.use("javax.net.ssl.HostnameVerifier");
        HostnameVerifier.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(hostname, session) {
            console.log("[✅] HostnameVerifier bypassed: " + hostname);
            return true;
        };
    } catch (e) {
        console.log("[ℹ️] HostnameVerifier: " + e.message);
    }

    // 2. TrustManager - Accept all certificates
    try {
        var X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");

        var AllTrustingManager = Java.registerClass({
            name: "com.bypass.AllTrustingManager",
            implements: [X509TrustManager],
            methods: {
                checkClientTrusted: function(chain, authType) {
                    console.log("[🔓] AllTrustingManager: Client trusted");
                },
                checkServerTrusted: function(chain, authType) {
                    console.log("[🔓] AllTrustingManager: Server trusted");
                },
                getAcceptedIssuers: function() {
                    return [];
                }
            }
        });

        // Replace in SSLContext
        var SSLContext = Java.use("javax.net.ssl.SSLContext");
        SSLContext.init.overload('[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom').implementation = function(keyManagers, trustManagers, secureRandom) {
            console.log("[✅] SSLContext.init hooked - Replacing TrustManager");
            return this.init.call(this, keyManagers, [AllTrustingManager.$new()], secureRandom);
        };
    } catch (e) {
        console.log("[ℹ️] TrustManager: " + e.message);
    }

    // 3. OkHttp CertificatePinner bypass
    try {
        var CertificatePinner = Java.use("okhttp3.CertificatePinner");
        CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function(hostname, pins) {
            console.log("[✅] OkHttp CertificatePinner bypassed for: " + hostname);
            // Don't call original - bypass completely
        };

        // Also hook the Builder
        var CertificatePinnerBuilder = Java.use("okhttp3.CertificatePinner$Builder");
        CertificatePinnerBuilder.build.implementation = function() {
            console.log("[✅] CertificatePinner.Builder neutralized");
            return CertificatePinner.$new(); // Return empty pinner
        };
    } catch (e) {
        console.log("[ℹ️] OkHttp: " + e.message);
    }

    // 4. WebView SSL error handler
    try {
        var WebViewClient = Java.use("android.webkit.WebViewClient");
        WebViewClient.onReceivedSslError.implementation = function(view, handler, error) {
            console.log("[✅] WebView SSL error bypassed");
            handler.proceed(); // Always proceed
        };
    } catch (e) {
        console.log("[ℹ️] WebView: " + e.message);
    }

    // 5. Android Network Security Config
    try {
        var NetworkSecurityPolicy = Java.use("android.security.net.config.NetworkSecurityPolicy");
        NetworkSecurityPolicy.isCleartextTrafficPermitted.overload('java.lang.String').implementation = function(hostname) {
            console.log("[✅] NetworkSecurityPolicy: Cleartext permitted for " + hostname);
            return true;
        };
    } catch (e) {
        console.log("[ℹ️] NetworkSecurityPolicy: " + e.message);
    }

    // ========== MONITOR FOR MISSING DETECTIONS ========== //

    setTimeout(function() {
        console.log("[🔍] Scanning for additional detection methods...");

        Java.enumerateLoadedClasses({
            onMatch: function(className) {
                // Hook root detection methods in app packages
                if (className.startsWith("com.example.")) {
                    try {
                        var cls = Java.use(className);
                        var methods = cls.class.getDeclaredMethods();

                        methods.forEach(function(method) {
                            var methodName = method.getName();
                            var returnType = method.getReturnType().getName();

                            // Hook any boolean method that might be a detection
                            if (returnType === "boolean" &&
                                (methodName.toLowerCase().includes("check") ||
                                    methodName.toLowerCase().includes("detect") ||
                                    methodName.toLowerCase().includes("is") ||
                                    methodName.toLowerCase().includes("has") ||
                                    methodName.toLowerCase().includes("root") ||
                                    methodName.toLowerCase().includes("jail"))) {

                                try {
                                    var originalMethod = cls[methodName];
                                    cls[methodName].implementation = function() {
                                        var result = originalMethod.apply(this, arguments);
                                        if (result === true) {
                                            console.log("[🚨] DETECTION FOUND: " + className + "." + methodName + " = true");
                                            console.log("[✅] FORCING TO FALSE");
                                        }
                                        return false; // Always return false
                                    };
                                } catch (e) {}
                            }

                            // Hook SSL pinning methods
                            if (methodName.toLowerCase().includes("ssl") ||
                                methodName.toLowerCase().includes("pin") ||
                                methodName.toLowerCase().includes("certificate") ||
                                methodName.toLowerCase().includes("verify")) {

                                try {
                                    var originalMethod = cls[methodName];
                                    cls[methodName].implementation = function() {
                                        console.log("[🔓] SSL/Pinning method neutralized: " + className + "." + methodName);
                                        if (method.getReturnType().getName() === "boolean") return true;
                                        return null;
                                    };
                                } catch (e) {}
                            }
                        });
                    } catch (e) {}
                }

                // Also hook common SSL classes globally
                if (className.toLowerCase().includes("ssl") ||
                    className.toLowerCase().includes("certificate") ||
                    className.toLowerCase().includes("pinning")) {

                    try {
                        var cls = Java.use(className);
                        var methods = cls.class.getDeclaredMethods();

                        methods.forEach(function(method) {
                            var methodName = method.getName();
                            if (methodName.toLowerCase().includes("verify") ||
                                methodName.toLowerCase().includes("check") ||
                                methodName.toLowerCase().includes("validate")) {

                                try {
                                    cls[methodName].implementation = function() {
                                        console.log("[🔓] Global SSL bypass: " + className + "." + methodName);
                                        return true;
                                    };
                                } catch (e) {}
                            }
                        });
                    } catch (e) {}
                }
            },
            onComplete: function() {
                console.log("[✅] Comprehensive scan complete");
            }
        });
    }, 3000);

    console.log("[🎉] ULTIMATE COMBINED BYPASS APPLIED SUCCESSFULLY!");
    console.log("[🛡️] Root detection: BYPASSED");
    console.log("[🔓] SSL pinning: BYPASSED");
    console.log("[📡] Ready to capture network requests!");
});

// Additional protection
setTimeout(function() {
    console.log("[⚡] Combined bypass active and monitoring...");
}, 1000);

console.log("[🎯] Ultimate combined bypass loaded - ready to use!");
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:268396656 @jerry/ultimate-combined-bypass
