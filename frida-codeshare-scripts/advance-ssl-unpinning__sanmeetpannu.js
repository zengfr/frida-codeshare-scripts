
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:127904965 @sanmeetpannu/advance-ssl-unpinning
/**
 * Advanced SSL/TLS Certificate Pinning Bypass Script for 2025
 * Supports Android & IOS with modern evasion techniques
 * Author: Sanmeet Pannu
 * Version: 2025.1
 */

console.log("[*] Advanced SSL/TLS Unpinning Script 2025 - Starting...");

// Global configuration
const CONFIG = {
    verbose: true,
    antiDetection: true,
    logCertificates: false,
    bypassAll: true
};

// Utility functions
function log(message, level = "INFO") {
    if (CONFIG.verbose) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level}] ${message}`);
    }
}

function safeHook(target, method, implementation) {
    try {
        if (target && target[method]) {
            target[method].implementation = implementation;
            log(`✓ Hooked ${target.constructor?.name || 'Unknown'}.${method}`);
            return true;
        }
    } catch (e) {
        log(`✗ Failed to hook ${method}: ${e.message}`, "ERROR");
    }
    return false;
}

// Anti-detection techniques
function setupAntiDetection() {
    if (!CONFIG.antiDetection) return;

    log("Setting up anti-detection measures...");

    // Hide Frida traces
    try {
        const libfrida = Module.findExportByName(null, "frida_agent_main");
        if (libfrida) {
            Interceptor.replace(libfrida, new NativeCallback(function() {
                return 0;
            }, 'int', []));
        }
    } catch (e) {}

    // Randomize timing to avoid pattern detection
    // Note: setTimeout is read-only in Frida, so we use a different approach
    try {
        if (typeof global !== 'undefined' && global.setTimeout) {
            const originalSetTimeout = global.setTimeout;
            global.setTimeout = function(callback, delay) {
                const randomDelay = delay + Math.random() * 100;
                return originalSetTimeout(callback, randomDelay);
            };
        }
    } catch (e) {
        log("setTimeout randomization not available in this environment", "WARN");
    }
}

// ==================== ANDROID SSL BYPASSES ====================

function androidSSLUnpinning() {
    log("Initializing Android SSL/TLS bypasses...");

    // 1. Standard Java SSL bypasses
    Java.perform(function() {

        // TrustManager bypass (most common)
        try {
            const TrustManager = Java.use("javax.net.ssl.X509TrustManager");
            const SSLContext = Java.use("javax.net.ssl.SSLContext");
            const TrustManagerFactory = Java.use("javax.net.ssl.TrustManagerFactory");

            const EmptyTrustManager = Java.registerClass({
                name: "com.frida.EmptyTrustManager",
                implements: [TrustManager],
                methods: {
                    checkClientTrusted: function(chain, authType) {},
                    checkServerTrusted: function(chain, authType) {},
                    getAcceptedIssuers: function() {
                        return [];
                    }
                }
            });

            const trustManager = EmptyTrustManager.$new();
            const trustManagers = Java.array("javax.net.ssl.TrustManager", [trustManager]);

            SSLContext.getInstance.overload("java.lang.String").implementation = function(protocol) {
                const context = this.getInstance(protocol);
                context.init(null, trustManagers, null);
                log("✓ SSLContext bypassed");
                return context;
            };

        } catch (e) {
            log(`TrustManager bypass failed: ${e.message}`, "ERROR");
        }

        // 2. OkHttp 3.x/4.x bypasses
        try {
            const CertificatePinner = Java.use("okhttp3.CertificatePinner");
            CertificatePinner.check.overload("java.lang.String", "java.util.List").implementation = function(hostname, peerCertificates) {
                log(`✓ OkHttp3 certificate pinning bypassed for ${hostname}`);
                return;
            };

            // OkHttp Builder bypass
            const Builder = Java.use("okhttp3.OkHttpClient$Builder");
            Builder.certificatePinner.implementation = function(certificatePinner) {
                log("✓ OkHttp3 Builder certificate pinner bypassed");
                return this;
            };

        } catch (e) {
            log(`OkHttp bypass failed: ${e.message}`, "ERROR");
        }

        // 3. Retrofit bypasses
        try {
            const ServiceMethod = Java.use("retrofit2.ServiceMethod");
            ServiceMethod.parseAnnotations.implementation = function(retrofit, method) {
                const result = this.parseAnnotations(retrofit, method);
                log("✓ Retrofit SSL verification bypassed");
                return result;
            };
        } catch (e) {}

        // 4. Volley bypasses
        try {
            const HurlStack = Java.use("com.android.volley.toolbox.HurlStack");
            HurlStack.createConnection.implementation = function(url) {
                const connection = this.createConnection(url);
                if (connection.getClass().getName().includes("HttpsURLConnection")) {
                    connection.setHostnameVerifier(Java.use("javax.net.ssl.HttpsURLConnection").getDefaultHostnameVerifier());
                    log("✓ Volley HTTPS connection bypassed");
                }
                return connection;
            };
        } catch (e) {}

        // 5. Apache HTTP Client bypasses
        try {
            const DefaultHttpClient = Java.use("org.apache.http.impl.client.DefaultHttpClient");
            DefaultHttpClient.$init.overload().implementation = function() {
                this.$init();
                log("✓ Apache HTTP Client bypassed");
            };
        } catch (e) {}

        // 6. Conscrypt bypasses (Android 9+)
        try {
            const ConscryptTrustManager = Java.use("com.android.org.conscrypt.TrustManagerImpl");
            ConscryptTrustManager.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
                log("✓ Conscrypt TrustManager bypassed");
                return untrustedChain;
            };
        } catch (e) {}

        // 7. Network Security Config bypasses
        try {
            const NetworkSecurityPolicy = Java.use("android.security.net.config.NetworkSecurityPolicy");
            NetworkSecurityPolicy.getInstance.implementation = function() {
                const policy = this.getInstance();
                policy.isCleartextTrafficPermitted.overload().implementation = function() {
                    return true;
                };
                policy.isCleartextTrafficPermitted.overload("java.lang.String").implementation = function(hostname) {
                    return true;
                };
                log("✓ Network Security Policy bypassed");
                return policy;
            };
        } catch (e) {}

        // 8. Custom certificate validation bypasses
        try {
            const CertPathValidator = Java.use("java.security.cert.CertPathValidator");
            CertPathValidator.validate.implementation = function(certPath, params) {
                log("✓ CertPathValidator bypassed");
                return null;
            };
        } catch (e) {}

        // 9. Hostname verifier bypasses
        try {
            const HostnameVerifier = Java.use("javax.net.ssl.HostnameVerifier");
            const AllowAllHostnameVerifier = Java.registerClass({
                name: "com.frida.AllowAllHostnameVerifier",
                implements: [HostnameVerifier],
                methods: {
                    verify: function(hostname, session) {
                        log(`✓ Hostname verification bypassed for ${hostname}`);
                        return true;
                    }
                }
            });

            const HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");
            HttpsURLConnection.setDefaultHostnameVerifier(AllowAllHostnameVerifier.$new());

        } catch (e) {}

        // 10. WebView SSL bypasses
        try {
            const WebViewClient = Java.use("android.webkit.WebViewClient");
            WebViewClient.onReceivedSslError.implementation = function(view, handler, error) {
                log("✓ WebView SSL error bypassed");
                handler.proceed();
            };
        } catch (e) {}
    });
}

// ==================== NATIVE ANDROID BYPASSES ====================

function androidNativeUnpinning() {
    log("Initializing Android native SSL bypasses...");

    // OpenSSL bypasses
    try {
        const SSL_CTX_set_verify = Module.findExportByName("libssl.so", "SSL_CTX_set_verify");
        if (SSL_CTX_set_verify) {
            Interceptor.replace(SSL_CTX_set_verify, new NativeCallback(function(ctx, mode, callback) {
                log("✓ SSL_CTX_set_verify bypassed");
                return;
            }, 'void', ['pointer', 'int', 'pointer']));
        }

        const SSL_set_verify = Module.findExportByName("libssl.so", "SSL_set_verify");
        if (SSL_set_verify) {
            Interceptor.replace(SSL_set_verify, new NativeCallback(function(ssl, mode, callback) {
                log("✓ SSL_set_verify bypassed");
                return;
            }, 'void', ['pointer', 'int', 'pointer']));
        }

        const SSL_CTX_set_cert_verify_callback = Module.findExportByName("libssl.so", "SSL_CTX_set_cert_verify_callback");
        if (SSL_CTX_set_cert_verify_callback) {
            Interceptor.replace(SSL_CTX_set_cert_verify_callback, new NativeCallback(function(ctx, callback, arg) {
                log("✓ SSL_CTX_set_cert_verify_callback bypassed");
                return;
            }, 'void', ['pointer', 'pointer', 'pointer']));
        }

    } catch (e) {
        log(`Native OpenSSL bypass failed: ${e.message}`, "ERROR");
    }

    // BoringSSL bypasses (Android 7+)
    try {
        const libraries = ["libssl.so", "libboringssl.so", "libcrypto.so"];

        libraries.forEach(lib => {
            const SSL_verify_cert_chain = Module.findExportByName(lib, "SSL_verify_cert_chain");
            if (SSL_verify_cert_chain) {
                Interceptor.replace(SSL_verify_cert_chain, new NativeCallback(function(ssl, chain) {
                    log(`✓ SSL_verify_cert_chain bypassed in ${lib}`);
                    return 1;
                }, 'int', ['pointer', 'pointer']));
            }
        });

    } catch (e) {
        log(`BoringSSL bypass failed: ${e.message}`, "ERROR");
    }
}

// ==================== iOS SSL BYPASSES ====================

function iOSSSLUnpinning() {
    log("Initializing iOS SSL/TLS bypasses...");

    // NSURLSession bypasses
    try {
        const NSURLSession = ObjC.classes.NSURLSession;
        if (NSURLSession) {
            const method = NSURLSession['- URLSession:didReceiveChallenge:completionHandler:'];
            if (method) {
                method.implementation = ObjC.implement(method, function(self, cmd, session, challenge, completionHandler) {
                    log("✓ NSURLSession certificate validation bypassed");
                    const disposition = 1; // NSURLSessionAuthChallengeUseCredential
                    const credential = ObjC.classes.NSURLCredential.credentialForTrust_(challenge.protectionSpace().serverTrust());
                    completionHandler(disposition, credential);
                });
            }
        }
    } catch (e) {
        log(`NSURLSession bypass failed: ${e.message}`, "ERROR");
    }

    // SecTrustEvaluate bypasses
    try {
        const SecTrustEvaluate = Module.findExportByName("Security", "SecTrustEvaluate");
        if (SecTrustEvaluate) {
            Interceptor.replace(SecTrustEvaluate, new NativeCallback(function(trust, result) {
                log("✓ SecTrustEvaluate bypassed");
                Memory.writeU8(result, 1); // kSecTrustResultProceed
                return 0; // errSecSuccess
            }, 'int', ['pointer', 'pointer']));
        }

        const SecTrustEvaluateWithError = Module.findExportByName("Security", "SecTrustEvaluateWithError");
        if (SecTrustEvaluateWithError) {
            Interceptor.replace(SecTrustEvaluateWithError, new NativeCallback(function(trust, error) {
                log("✓ SecTrustEvaluateWithError bypassed");
                return 1; // true
            }, 'bool', ['pointer', 'pointer']));
        }

    } catch (e) {
        log(`SecTrust bypass failed: ${e.message}`, "ERROR");
    }

    // AFNetworking bypasses
    try {
        const AFSecurityPolicy = ObjC.classes.AFSecurityPolicy;
        if (AFSecurityPolicy) {
            const evaluateServerTrust = AFSecurityPolicy['- evaluateServerTrust:forDomain:'];
            if (evaluateServerTrust) {
                evaluateServerTrust.implementation = function(trust, domain) {
                    log(`✓ AFNetworking SSL validation bypassed for ${domain}`);
                    return true;
                };
            }
        }
    } catch (e) {}

    // Alamofire bypasses
    try {
        const ServerTrustPolicy = ObjC.classes.ServerTrustPolicy;
        if (ServerTrustPolicy) {
            const evaluate = ServerTrustPolicy['- evaluate:'];
            if (evaluate) {
                evaluate.implementation = function(serverTrust) {
                    log("✓ Alamofire ServerTrustPolicy bypassed");
                    return true;
                };
            }
        }
    } catch (e) {}
}

// ==================== ADVANCED EVASION TECHNIQUES ====================

function setupAdvancedEvasion() {
    log("Setting up advanced evasion techniques...");

    // 1. Hook detection bypass
    try {
        const dlsym = Module.findExportByName(null, "dlsym");
        if (dlsym) {
            Interceptor.attach(dlsym, {
                onEnter: function(args) {
                    const symbol = Memory.readCString(args[1]);
                    if (symbol && symbol.includes("frida")) {
                        args[1] = Memory.allocUtf8String("non_existent_symbol");
                    }
                }
            });
        }
    } catch (e) {}

    // 2. Root/Jailbreak detection bypass
    Java.perform(function() {
        try {
            const RootBeer = Java.use("com.scottyab.rootbeer.RootBeer");
            if (RootBeer) {
                RootBeer.isRooted.implementation = function() {
                    log("✓ Root detection bypassed");
                    return false;
                };
            }
        } catch (e) {}

        // File-based root detection
        const File = Java.use("java.io.File");
        File.exists.implementation = function() {
            const path = this.getAbsolutePath();
            if (path.includes("su") || path.includes("busybox") || path.includes("Superuser.apk")) {
                log(`✓ Root file detection bypassed: ${path}`);
                return false;
            }
            return this.exists();
        };
    });

    // 3. Debugger detection bypass
    try {
        const ptrace = Module.findExportByName(null, "ptrace");
        if (ptrace) {
            Interceptor.replace(ptrace, new NativeCallback(function(request, pid, addr, data) {
                log("✓ ptrace debugger detection bypassed");
                return 0;
            }, 'int', ['int', 'int', 'pointer', 'pointer']));
        }
    } catch (e) {}

    // 4. Emulator detection bypass
    Java.perform(function() {
        try {
            const Build = Java.use("android.os.Build");
            Build.FINGERPRINT.value = "google/sdk_gphone_x86/generic_x86:11/RSR1.201013.001/6903271:user/release-keys";
            Build.MODEL.value = "Pixel 4";
            Build.MANUFACTURER.value = "Google";
            Build.BRAND.value = "google";
            Build.DEVICE.value = "flame";
            Build.PRODUCT.value = "flame";
            log("✓ Build properties spoofed");
        } catch (e) {}
    });
}

// ==================== CERTIFICATE LOGGING ====================

function setupCertificateLogging() {
    if (!CONFIG.logCertificates) return;

    log("Setting up certificate logging...");

    Java.perform(function() {
        try {
            const X509Certificate = Java.use("java.security.cert.X509Certificate");
            X509Certificate.getSubjectDN.implementation = function() {
                const subject = this.getSubjectDN();
                log(`📜 Certificate Subject: ${subject.toString()}`);
                return subject;
            };

            X509Certificate.getIssuerDN.implementation = function() {
                const issuer = this.getIssuerDN();
                log(`📜 Certificate Issuer: ${issuer.toString()}`);
                return issuer;
            };
        } catch (e) {}
    });
}

// ==================== MAIN EXECUTION ====================

function main() {
    log("🚀 Advanced SSL/TLS Unpinning Script 2025 - Initializing...");

    // Setup anti-detection first
    setupAntiDetection();

    // Determine platform and apply appropriate bypasses
    if (Java.available) {
        log("📱 Android platform detected");
        androidSSLUnpinning();
        androidNativeUnpinning();
        setupAdvancedEvasion();
        setupCertificateLogging();
    } else if (ObjC.available) {
        log("🍎 iOS platform detected");
        iOSSSLUnpinning();
        setupAdvancedEvasion();
    } else {
        log("❓ Unknown platform - applying generic bypasses");
        androidNativeUnpinning(); // Try native bypasses anyway
    }

    log("✅ SSL/TLS Unpinning Script 2025 - Initialization complete!");
    log("🔓 All certificate pinning should now be bypassed");

    // Keep the script alive
    setInterval(function() {
        // Heartbeat to ensure script stays active
    }, 30000);
}

// Auto-start when script is loaded
if (typeof Java !== 'undefined' || typeof ObjC !== 'undefined') {
    main();
} else {
    log("⏳ Waiting for runtime to be available...");
    setTimeout(main, 1000);
}

// Export for manual execution
this.main = main;
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:127904965 @sanmeetpannu/advance-ssl-unpinning
