
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:2109561175 @muhammadhikmahhusnuzon/fridarootbypass
// Frida script to bypass root detection, anti-debugging, and SSL pinning

Java.perform(function() {
    'use strict';

    console.log("[*] Starting bypass script...");

    // === Bypass d7.C0536k (likely obfuscated RootBeer) ===
    try {
        var C0536k = Java.use('d7.C0536k');
        if (C0536k) {
            console.log("[*] Hooking d7.C0536k...");
            C0536k.a.implementation = function(str) {
                console.log("[+] Bypassing d7.C0536k.a (su check)");
                return false;
            };
            C0536k.b.implementation = function(arrayList) {
                console.log("[+] Bypassing d7.C0536k.b (package check)");
                return false;
            };
            C0536k.c.implementation = function() {
                console.log("[+] Bypassing d7.C0536k.c (root detection)");
                return false;
            };
        }
    } catch (e) {
        console.log("[-] Failed to hook d7.C0536k: " + e.message);
    }


    // === Bypass RootBeerNative ===
    try {
        var RootBeerNative = Java.use('com.scottyab.rootbeer.RootBeerNative');
        if (RootBeerNative) {
            console.log("[*] Hooking com.scottyab.rootbeer.RootBeerNative...");
            RootBeerNative.checkForRoot.implementation = function(paths) {
                console.log("[+] Bypassing RootBeerNative.checkForRoot()");
                return 0;
            };
        }
    } catch (e) {
        console.log("[-] Failed to hook com.scottyab.rootbeer.RootBeerNative: " + e.message);
    }

    // === Build.TAGS & SystemProperties ===
    try {
        var Build = Java.use('android.os.Build');
        Build.TAGS.value = 'release-keys';
        console.log("[+] Build.TAGS set to 'release-keys'");

        var SystemProperties = Java.use('android.os.SystemProperties');
        SystemProperties.get.overload('java.lang.String').implementation = function(key) {
            if (key === 'ro.build.tags' || key === 'ro.secure' || key === 'ro.debuggable') {
                console.log("[+] Bypassing SystemProperties.get for key: " + key);
                return 'release-keys';
            }
            return this.get(key);
        };
    } catch (e) {
        console.log("[-] Failed to hook Build.TAGS or SystemProperties: " + e.message);
    }

    // === File.exists (su) ===
    try {
        var File = Java.use('java.io.File');
        File.exists.implementation = function() {
            var path = this.getAbsolutePath();
            if (path.endsWith('/su') || path.endsWith('/busybox') || path.endsWith('/magisk')) {
                console.log("[+] Bypassing File.exists for path: " + path);
                return false;
            }
            return this.exists.call(this);
        };
    } catch (e) {
        console.log("[-] Failed to hook File.exists: " + e.message);
    }

    // === Runtime.exec / ProcessBuilder ===
    try {
        var Runtime = Java.use('java.lang.Runtime');
        Runtime.exec.overload('[Ljava.lang.String;').implementation = function(cmd) {
            if (cmd[0].indexOf('su') !== -1 || cmd[0].indexOf('which') !== -1) {
                console.log("[+] Bypassing Runtime.exec for command: " + cmd[0]);
                return null;
            }
            return this.exec.call(this, cmd);
        };

        var ProcessBuilder = Java.use('java.lang.ProcessBuilder');
        ProcessBuilder.$init.overload('[Ljava.lang.String;').implementation = function(cmd) {
            if (cmd[0].indexOf('su') !== -1 || cmd[0].indexOf('which') !== -1) {
                console.log("[+] Bypassing ProcessBuilder for command: " + cmd[0]);
                return null;
            }
            return this.$init.call(this, cmd);
        };
    } catch (e) {
        console.log("[-] Failed to hook Runtime.exec or ProcessBuilder: " + e.message);
    }

    // === PackageManager checks ===
    try {
        var PackageManager = Java.use('android.content.pm.PackageManager');
        PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(packageName, flags) {
            var rootPackages = ['com.noshufou.android.su', 'com.noshufou.android.su.elite', 'eu.chainfire.supersu', 'com.koushikdutta.superuser', 'com.thirdparty.superuser', 'com.yellowes.su', 'com.topjohnwu.magisk', 'com.kingroot.kinguser', 'com.kingo.root', 'com.smedialink.oneclickroot', 'com.zhiqupk.root.global', 'com.alephzain.framaroot'];
            if (rootPackages.indexOf(packageName) > -1) {
                console.log("[+] Bypassing PackageManager.getPackageInfo for package: " + packageName);
                throw PackageManager.NameNotFoundException.$new();
            }
            return this.getPackageInfo.call(this, packageName, flags);
        };
    } catch (e) {
        console.log("[-] Failed to hook PackageManager.getPackageInfo: " + e.message);
    }

    // === Debug ===
    try {
        var Debug = Java.use('android.os.Debug');
        Debug.isDebuggerConnected.implementation = function() {
            console.log("[+] Bypassing Debug.isDebuggerConnected()");
            return false;
        };
        Debug.waitingForDebugger.implementation = function() {
            console.log("[+] Bypassing Debug.waitingForDebugger()");
            return false;
        };
    } catch (e) {
        console.log("[-] Failed to hook Debug methods: " + e.message);
    }

    // === X509TrustManager / OkHttp ===
    try {
        var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
        var SSLContext = Java.use('javax.net.ssl.SSLContext');

        var TrustManager = Java.registerClass({
            name: 'dev.imigrasi.TrustManager',
            implements: [X509TrustManager],
            methods: {
                checkClientTrusted: function(chain, authType) {},
                checkServerTrusted: function(chain, authType) {},
                getAcceptedIssuers: function() {
                    return [];
                }
            }
        });

        var TrustManagers = [TrustManager.$new()];
        var sslContext = SSLContext.getInstance.overload('java.lang.String').call(SSLContext, 'TLS');
        sslContext.init(null, TrustManagers, null);
        var defaultSslContext = SSLContext.getDefault.call(SSLContext);
        defaultSslContext.init(null, TrustManagers, null);
        console.log("[+] SSL pinning bypass applied.");
    } catch (e) {
        console.log("[-] Error bypassing SSL pinning: " + e.message);
    }

    // === Native Hooks ===
    try {
        var fopen = Module.findExportByName(null, 'fopen');
        if (fopen) {
            Interceptor.attach(fopen, {
                onEnter: function(args) {
                    var path = args[0].readUtf8String();
                    if (path.indexOf('su') !== -1 || path.indexOf('magisk') !== -1) {
                        console.log("[+] Bypassing native fopen for path: " + path);
                        this.bypass = true;
                    }
                },
                onLeave: function(retval) {
                    if (this.bypass) {
                        retval.replace(0);
                    }
                }
            });
        }

        var access = Module.findExportByName(null, 'access');
        if (access) {
            Interceptor.attach(access, {
                onEnter: function(args) {
                    var path = args[0].readUtf8String();
                    if (path.indexOf('su') !== -1 || path.indexOf('magisk') !== -1) {
                        console.log("[+] Bypassing native access for path: " + path);
                        this.bypass = true;
                    }
                },
                onLeave: function(retval) {
                    if (this.bypass) {
                        retval.replace(-1);
                    }
                }
            });
        }

        var stat = Module.findExportByName(null, 'stat');
        if (stat) {
            Interceptor.attach(stat, {
                onEnter: function(args) {
                    var path = args[0].readUtf8String();
                    if (path.indexOf('su') !== -1 || path.indexOf('magisk') !== -1) {
                        console.log("[+] Bypassing native stat for path: " + path);
                        this.bypass = true;
                    }
                },
                onLeave: function(retval) {
                    if (this.bypass) {
                        retval.replace(-1);
                    }
                }
            });
        }

        var system = Module.findExportByName(null, 'system');
        if (system) {
            Interceptor.attach(system, {
                onEnter: function(args) {
                    var cmd = args[0].readUtf8String();
                    if (cmd.indexOf('su') !== -1 || cmd.indexOf('which') !== -1) {
                        console.log("[+] Bypassing native system for command: " + cmd);
                        this.bypass = true;
                    }
                },
                onLeave: function(retval) {
                    if (this.bypass) {
                        retval.replace(0);
                    }
                }
            });
        }
    } catch (e) {
        console.log("[-] Error applying native hooks: " + e.message);
    }

    console.log("[*] Bypass script finished.");
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:2109561175 @muhammadhikmahhusnuzon/fridarootbypass
