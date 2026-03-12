
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1584553784 @licitrasimone/flutter-ssl-pinning-bypass
/**
 * Flutter SSL Pinning Bypass
 *
 * A Frida script to bypass SSL certificate pinning in Flutter-based Android applications.
 * Works by patching the native SSL verification function and hooking Java SSL classes.
 *
 * Usage:
 *   frida -U -f <package_name> -l flutter-ssl-pinning.js --no-pause
 *   frida -U -n <app_name> -l flutter-ssl-pinning.js
 *
 * Tested on: ARM64 Android devices
 *
 * Author: Simone Licitra (@r08t)
 * License: MIT
 */

'use strict';

var CONFIG = {
    // Delay before scanning (ms) - allows app to fully initialize
    scanDelay: 3000,

    // Minimum size for Flutter library detection (bytes)
    minFlutterSize: 0x100000, // 1MB

    // Minimum size for generic large region scan (bytes)
    minGenericSize: 0x500000, // 5MB

    // Enable verbose logging
    verbose: true,

    // Keywords to identify Flutter-related memory regions
    flutterKeywords: ['libflutter.so', 'libapp.so', 'flutter', 'split_config']
};

// ARM64 patch bytes
var PATCH = {
    // MOV W0, #1 - Return true/success
    movW0One: [0x20, 0x00, 0x80, 0x52],
    // RET - Return from function
    ret: [0xC0, 0x03, 0x5F, 0xD6]
};

// SSL verification function patterns (ARM64)
var PATTERNS = {
    primary: [{
        name: 'ssl_crypto_x509_session_verify_cert_chain',
        pattern: 'FE 4F BF A9 F3 03 00 AA',
        description: 'STP X30,X30,[SP,#-0x10]! + MOV X19,X0'
    }],
    alternatives: [{
            name: 'variant_prologue_1',
            pattern: 'FF 83 01 D1 F4 4F 02 A9',
            description: 'SUB SP,SP,#0x60 + STP X20,X19,[SP,#0x20]'
        },
        {
            name: 'variant_prologue_2',
            pattern: 'FF C3 01 D1 FE 0F 1E F8',
            description: 'SUB SP,SP,#0x70 + STR X30,[SP,#-0x10]!'
        },
        {
            name: 'standard_prologue',
            pattern: 'FD 7B BE A9 FD 03 00 91',
            description: 'STP X29,X30,[SP,#-0x20]! + MOV X29,SP'
        }
    ]
};

function log(msg) {
    console.log('[Flutter-SSL] ' + msg);
}

function logVerbose(msg) {
    if (CONFIG.verbose) {
        console.log('[Flutter-SSL] ' + msg);
    }
}

function logSuccess(msg) {
    console.log('[Flutter-SSL] [+] ' + msg);
}

function logError(msg) {
    console.log('[Flutter-SSL] [-] ' + msg);
}

function logInfo(msg) {
    console.log('[Flutter-SSL] [*] ' + msg);
}

/**
 * Find memory ranges that likely contain Flutter code
 */
function findFlutterRanges() {
    var execRanges = Process.enumerateRanges('r-x');
    logVerbose('Total executable ranges: ' + execRanges.length);

    // First, try to find specifically labeled Flutter ranges
    var flutterRanges = execRanges.filter(function(r) {
        if (r.size < CONFIG.minFlutterSize) return false;
        if (!r.file || !r.file.path) return false;

        var path = r.file.path.toLowerCase();
        return CONFIG.flutterKeywords.some(function(keyword) {
            return path.indexOf(keyword) !== -1;
        });
    });

    if (flutterRanges.length > 0) {
        logInfo('Found ' + flutterRanges.length + ' Flutter-specific range(s):');
        flutterRanges.forEach(function(r) {
            logVerbose('  ' + r.base + ' size=0x' + r.size.toString(16) + ' ' + r.file.path);
        });
        return flutterRanges;
    }

    // Fallback: scan large executable regions
    logInfo('No labeled Flutter ranges found. Scanning large executable regions...');
    flutterRanges = execRanges.filter(function(r) {
        return r.size > CONFIG.minGenericSize;
    });

    logInfo('Found ' + flutterRanges.length + ' large executable region(s) to scan');
    flutterRanges.forEach(function(r) {
        var path = r.file ? r.file.path : 'anonymous';
        logVerbose('  ' + r.base + ' size=0x' + r.size.toString(16) + ' ' + path);
    });

    return flutterRanges;
}

/**
 * Patch a function to return 1 (success/true)
 */
function patchFunction(address) {
    try {
        var before = address.readByteArray(8);
        logVerbose('  Before: ' + hexdump(before, {
            length: 8,
            header: false
        }));

        Memory.protect(address, 8, 'rwx');
        address.writeByteArray(PATCH.movW0One);
        address.add(4).writeByteArray(PATCH.ret);

        var after = address.readByteArray(8);
        logVerbose('  After:  ' + hexdump(after, {
            length: 8,
            header: false
        }));

        return true;
    } catch (e) {
        logError('Patch failed at ' + address + ': ' + e);
        return false;
    }
}

/**
 * Scan memory ranges for a specific pattern and patch matches
 */
function scanAndPatch(ranges, patternObj) {
    var patched = false;

    for (var i = 0; i < ranges.length && !patched; i++) {
        var range = ranges[i];

        Memory.scan(range.base, range.size, patternObj.pattern, {
            onMatch: function(address, size) {
                if (patched) return 'stop';

                logSuccess('Found ' + patternObj.name + ' at ' + address);

                if (patchFunction(address)) {
                    patched = true;
                    return 'stop';
                }
            },
            onComplete: function() {}
        });
    }

    return patched;
}

/**
 * Main native bypass function - patches Flutter's SSL verification
 */
function bypassNativeSSL() {
    log('='.repeat(50));
    log('Starting native SSL bypass...');
    log('='.repeat(50));

    var ranges = findFlutterRanges();

    if (ranges.length === 0) {
        logError('No suitable memory ranges found to scan');
        return false;
    }

    // Try primary patterns first
    log('');
    logInfo('Scanning for primary SSL verification patterns...');

    for (var i = 0; i < PATTERNS.primary.length; i++) {
        var pattern = PATTERNS.primary[i];
        logVerbose('Trying: ' + pattern.name + ' (' + pattern.description + ')');

        if (scanAndPatch(ranges, pattern)) {
            logSuccess('SSL PINNING BYPASSED! (Pattern: ' + pattern.name + ')');
            return true;
        }
    }

    // Try alternative patterns
    log('');
    logInfo('Primary patterns not found. Trying alternatives...');

    for (var i = 0; i < PATTERNS.alternatives.length; i++) {
        var pattern = PATTERNS.alternatives[i];
        logVerbose('Trying: ' + pattern.name + ' (' + pattern.description + ')');

        if (scanAndPatch(ranges, pattern)) {
            logSuccess('SSL PINNING BYPASSED! (Pattern: ' + pattern.name + ')');
            return true;
        }
    }

    logError('Could not find SSL verification function');
    return false;
}

/**
 * Java-level SSL bypass hooks
 */
function bypassJavaSSL() {
    log('');
    log('='.repeat(50));
    log('Setting up Java SSL bypass hooks...');
    log('='.repeat(50));

    Java.perform(function() {
        // Hook TrustManagerImpl.verifyChain
        try {
            var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
            TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
                logVerbose('TrustManagerImpl.verifyChain bypassed for: ' + host);
                return untrustedChain;
            };
            logSuccess('Hooked TrustManagerImpl.verifyChain');
        } catch (e) {
            logVerbose('TrustManagerImpl not available: ' + e.message);
        }

        // Hook SSLContext.init with custom TrustManager
        try {
            var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
            var TrustManager = Java.registerClass({
                name: 'com.flutter.bypass.TrustManager',
                implements: [X509TrustManager],
                methods: {
                    checkClientTrusted: function(chain, authType) {},
                    checkServerTrusted: function(chain, authType) {},
                    getAcceptedIssuers: function() {
                        return [];
                    }
                }
            });

            var SSLContext = Java.use('javax.net.ssl.SSLContext');
            SSLContext.init.overload('[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom').implementation = function(km, tm, sr) {
                logVerbose('SSLContext.init intercepted - injecting custom TrustManager');
                this.init(km, [TrustManager.$new()], sr);
            };
            logSuccess('Hooked SSLContext.init');
        } catch (e) {
            logVerbose('SSLContext hook failed: ' + e.message);
        }

        // Hook OkHttp CertificatePinner (common in Flutter apps using platform channels)
        try {
            var CertificatePinner = Java.use('okhttp3.CertificatePinner');
            CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function(hostname, peerCertificates) {
                logVerbose('OkHttp CertificatePinner.check bypassed for: ' + hostname);
            };
            logSuccess('Hooked OkHttp CertificatePinner');
        } catch (e) {
            logVerbose('OkHttp CertificatePinner not found (this is normal for pure Flutter apps)');
        }

        // Hook Apache HttpClient (legacy support)
        try {
            var AbstractVerifier = Java.use('org.apache.http.conn.ssl.AbstractVerifier');
            AbstractVerifier.verify.overload('java.lang.String', '[Ljava.lang.String;', '[Ljava.lang.String;', 'boolean').implementation = function(host, cns, subjectAlts, strictWithSubDomains) {
                logVerbose('Apache AbstractVerifier.verify bypassed for: ' + host);
            };
            logSuccess('Hooked Apache HttpClient AbstractVerifier');
        } catch (e) {
            logVerbose('Apache HttpClient not found (expected for modern apps)');
        }
    });
}

/**
 * Main entry point
 */
function main() {
    log('');
    log('Flutter SSL Pinning Bypass');
    log('Target: ' + (Java.available ? Java.androidVersion : 'Unknown'));
    log('');

    // Start Java hooks immediately
    if (Java.available) {
        bypassJavaSSL();
    } else {
        logInfo('Java not available - skipping Java hooks');
    }

    // Delay native bypass to allow libraries to load
    log('');
    logInfo('Waiting ' + (CONFIG.scanDelay / 1000) + 's for libraries to load...');

    setTimeout(function() {
        var success = bypassNativeSSL();

        log('');
        log('='.repeat(50));
        if (success) {
            logSuccess('Native SSL bypass: SUCCESS');
        } else {
            logError('Native SSL bypass: FAILED');
            logInfo('Try using reflutter to repack the APK instead');
            logInfo('Or adjust patterns for your specific Flutter version');
        }
        log('='.repeat(50));
        log('');
    }, CONFIG.scanDelay);
}

// Run
main();
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1584553784 @licitrasimone/flutter-ssl-pinning-bypass
