// https://github.com/Eltion/Messenger-SSL-Pinning-Bypass/
// https://github.com/Eltion/Messenger-SSL-Pinning-Bypass/
// https://github.com/Eltion/Messenger-SSL-Pinning-Bypass/

function patch_arm64(library) {
    let found = false;
    const pattern = "b5 01 00 b4 80 82 4c 39";
    Memory.scan(library.base, library.size, pattern, {
        onMatch(address, size) {
            found = true;
            Memory.patchCode(address, 4, code => {
                const cw = new Arm64Writer(code);
                cw.putBytes([0xb5, 0x01, 0x0, 0xb5]);
                cw.flush();
            });
            logger(`[*][+] Patched libcoldstart.so`);
            return 'stop';
        },
        onComplete() {
            if (!found) {
                logger(`[*][-] Failed to find pattern: ${pattern}`);
            }
        }
    });
}


function patch_x86(library) {
    let found = false;
    const pattern = "74 44 8b 8f d4 01 00 00";
    Memory.scan(library.base, library.size, pattern, {
        onMatch(address, size) {
            found = true;
            Memory.patchCode(address, 2, code => {
                const cw = new X86Writer(code);
                cw.putBytes([0x75, 0x44]);
                cw.flush();
            });
            logger(`[*][+] Patched libcoldstart.so`);
            return 'stop';
        },
        onComplete() {
            if (!found) {
                logger(`[*][-] Failed to find pattern: ${pattern}`);
            }
        }
    });
}


function logger(message) {
    console.log(message);
    Java.perform(function() {
        var Log = Java.use("android.util.Log");
        Log.v("MESSENGER_SSL_PINNING_BYPASS", message);
    });
}

function waitForModule(moduleName) {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            const module = Process.findModuleByName(moduleName);
            if (module != null) {
                clearInterval(interval);
                resolve(module);
            }
        }, 10);
    });
}


Java.perform(function() {
    try {
        var array_list = Java.use("java.util.ArrayList");
        var ApiClient = Java.use('com.android.org.conscrypt.TrustManagerImpl');
        if (ApiClient.checkTrustedRecursive) {
            logger("[*][+] Hooked checkTrustedRecursive")
            ApiClient.checkTrustedRecursive.implementation = function(a1, a2, a3, a4, a5, a6) {
                var k = array_list.$new();
                return k;
            }
        } else {
            logger("[*][-] checkTrustedRecursive not Found")
        }
    } catch (e) {
        logger("[*][-] Failed to hook checkTrustedRecursive")
    }
});

Java.perform(function() {
    try {
        const x509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
        const sSLContext = Java.use("javax.net.ssl.SSLContext");
        const TrustManager = Java.registerClass({
            implements: [x509TrustManager],
            methods: {
                checkClientTrusted(chain, authType) {},
                checkServerTrusted(chain, authType) {},
                getAcceptedIssuers() {
                    return [];
                },
            },
            name: "com.leftenter.messenger",
        });
        const TrustManagers = [TrustManager.$new()];
        const SSLContextInit = sSLContext.init.overload(
            "[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom");
        SSLContextInit.implementation = function(keyManager, trustManager, secureRandom) {
            SSLContextInit.call(this, keyManager, TrustManagers, secureRandom);
        };
        logger("[*][+] Hooked SSLContextInit")
    } catch (e) {
        logger("[*][-] Failed to hook SSLContextInit")
    }
});


waitForModule("libcoldstart.so").then(lib => {
    if (Process.arch == "arm64") {
        patch_arm64(lib)
    } else if (Process.arch == "ia32") {
        patch_x86(lib)
    }
});
//https://github.com/zengfr/frida-codeshare-scripts
//1297749639 @0zl/msslpb