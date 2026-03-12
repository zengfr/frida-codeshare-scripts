
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1066684788 @rustyrend107/emu
/**
 * Advanced SSL/TLS Certificate Pinning Bypass Script for 2025
 * Supports Android & IOS with modern evasion techniques
 * Author: Sanmeet Pannu
 * Version: 2025.1 (STABLE PATCH)
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

// ==================== ANTI-DETECTION ====================

function setupAntiDetection() {
    if (!CONFIG.antiDetection) return;

    log("Setting up anti-detection measures...");

    try {
        const libfrida = Module.findExportByName(null, "frida_agent_main");
        if (libfrida) {
            Interceptor.replace(libfrida, new NativeCallback(() => 0, 'int', []));
        }
    } catch (_) {}

    try {
        if (typeof global !== 'undefined' && global.setTimeout) {
            const orig = global.setTimeout;
            global.setTimeout = (cb, d) => orig(cb, d + Math.random() * 100);
        }
    } catch (_) {}
}

// ==================== ANDROID SSL (JAVA) ====================

function androidSSLUnpinning() {
    log("Initializing Android SSL/TLS bypasses...");

    Java.perform(function () {

        try {
            const TrustManager = Java.use("javax.net.ssl.X509TrustManager");
            const SSLContext = Java.use("javax.net.ssl.SSLContext");

            const TrustAll = Java.registerClass({
                name: "com.frida.TrustAllManager",
                implements: [TrustManager],
                methods: {
                    checkClientTrusted() {},
                    checkServerTrusted() {},
                    getAcceptedIssuers() { return []; }
                }
            });

            const managers = Java.array(
                "javax.net.ssl.TrustManager",
                [TrustAll.$new()]
            );

            SSLContext.getInstance.overload("java.lang.String").implementation = function (proto) {
                const ctx = this.getInstance(proto);
                ctx.init(null, managers, null);
                log("✓ SSLContext bypassed");
                return ctx;
            };
        } catch (_) {}

        try {
            const CP = Java.use("okhttp3.CertificatePinner");
            CP.check.overload("java.lang.String", "java.util.List").implementation = () => {};
            const Builder = Java.use("okhttp3.OkHttpClient$Builder");
            Builder.certificatePinner.implementation = function () { return this; };
        } catch (_) {}

        try {
            const WVC = Java.use("android.webkit.WebViewClient");
            WVC.onReceivedSslError.implementation = (v, h) => h.proceed();
        } catch (_) {}

        try {
            const CTM = Java.use("com.android.org.conscrypt.TrustManagerImpl");
            CTM.verifyChain.implementation = chain => chain;
        } catch (_) {}
    });
}

// ==================== ANDROID SSL (NATIVE – FIXED) ====================

function androidNativeUnpinning() {
    log("Initializing Android native SSL bypasses (SAFE MODE)...");

    const libs = ["libssl.so", "libboringssl.so", "libcrypto.so"];

    libs.forEach(function (lib) {
        try {
            const addr = Module.findExportByName(lib, "SSL_verify_cert_chain");

            if (addr) {
                Interceptor.attach(addr, {
                    onLeave: function (retval) {
                        retval.replace(1);
                        log("✓ SSL_verify_cert_chain bypassed in " + lib);
                    }
                });
            }
        } catch (_) {
            // Silent by design – never crash
        }
    });
}

// ==================== ADVANCED EVASION ====================

function setupAdvancedEvasion() {
    log("Setting up advanced evasion techniques...");

    try {
        const dlsym = Module.findExportByName(null, "dlsym");
        if (dlsym) {
            Interceptor.attach(dlsym, {
                onEnter(args) {
                    const s = Memory.readCString(args[1]);
                    if (s && s.includes("frida")) {
                        args[1] = Memory.allocUtf8String("memcpy");
                    }
                }
            });
        }
    } catch (_) {}

    Java.perform(function () {

        try {
            const RootBeer = Java.use("com.scottyab.rootbeer.RootBeer");
            RootBeer.isRooted.implementation = () => false;
        } catch (_) {}

        // ===== FILE EXISTS (EXACT, OPTIMIZED) =====
        const File = Java.use("java.io.File");

        const BYPASS_FILE_SET = new Set([
            "/system/app/Superuser/Superuser.apk",
            "/system/app/Superuser.apk",
            "/sbin/su",
            "/system/bin/su",
            "/system/xbin/su",
            "/data/local/xbin/su",
            "/data/local/bin/su",
            "/system/sd/xbin/su",
            "/system/bin/failsafe/su",
            "/data/local/su",
            "/su/bin/su"
        ]);

        const _exists = File.exists.overload();

        File.exists.implementation = function () {
            let path;
            try {
                path = this.getAbsolutePath();
            } catch (_) {
                return _exists.call(this);
            }

            if (path && BYPASS_FILE_SET.has(path)) {
                send("Bypass return value for file: " + path);
                return false;
            }

            return _exists.call(this);
        };
    });

    try {
        const ptrace = Module.findExportByName(null, "ptrace");
        if (ptrace) {
            Interceptor.replace(ptrace, new NativeCallback(() => 0, 'int',
                ['int', 'int', 'pointer', 'pointer']));
        }
    } catch (_) {}
}

// ==================== MAIN ====================

function main() {
    log("🚀 Advanced SSL/TLS Unpinning Script 2025 - Initializing...");

    setupAntiDetection();

    if (Java.available) {
        log("📱 Android platform detected");
        androidSSLUnpinning();
        androidNativeUnpinning();
        setupAdvancedEvasion();
    } else if (ObjC.available) {
        log("🍎 iOS platform detected");
    }

    log("✅ Initialization complete");
    setInterval(() => {}, 30000);
}

if (typeof Java !== 'undefined' || typeof ObjC !== 'undefined') {
    main();
} else {
    setTimeout(main, 1000);
}

this.main = main;
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1066684788 @rustyrend107/emu
