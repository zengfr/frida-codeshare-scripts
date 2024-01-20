
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:757465858 @acsayson/rootandpinning
Java.perform(function() {
    var RootPackages = ["com.noshufou.android.su", "com.noshufou.android.su.elite", "eu.chainfire.supersu",
        "com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su", "com.koushikdutta.rommanager",
        "com.koushikdutta.rommanager.license", "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch",
        "com.ramdroid.appquarantine", "com.ramdroid.appquarantinepro", "com.devadvance.rootcloak", "com.devadvance.rootcloakplus",
        "de.robv.android.xposed.installer", "com.saurik.substrate", "com.zachspong.temprootremovejb", "com.amphoras.hidemyroot",
        "com.amphoras.hidemyrootadfree", "com.formyhm.hiderootPremium", "com.formyhm.hideroot", "me.phh.superuser",
        "eu.chainfire.supersu.pro", "com.kingouser.com", "com.topjohnwu.magisk"
    ];

    var RootBinaries = ["su", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk", "magisk"];

    var RootProperties = {
        "ro.build.selinux": "1",
        "ro.debuggable": "0",
        "service.adb.root": "0",
        "ro.secure": "1"
    };

    var RootPropertiesKeys = [];

    for (var k in RootProperties) RootPropertiesKeys.push(k);

    var PackageManager = Java.use("android.app.ApplicationPackageManager");

    var Runtime = Java.use('java.lang.Runtime');

    var NativeFile = Java.use('java.io.File');

    var String = Java.use('java.lang.String');

    var SystemProperties = Java.use('android.os.SystemProperties');

    var BufferedReader = Java.use('java.io.BufferedReader');

    var ProcessBuilder = Java.use('java.lang.ProcessBuilder');

    var StringBuffer = Java.use('java.lang.StringBuffer');

    var loaded_classes = Java.enumerateLoadedClassesSync();

    send("Loaded " + loaded_classes.length + " classes!");

    var useKeyInfo = false;

    var useProcessManager = false;

    send("loaded: " + loaded_classes.indexOf('java.lang.ProcessManager'));

    if (loaded_classes.indexOf('java.lang.ProcessManager') != -1) {
        try {
            //useProcessManager = true;
            //var ProcessManager = Java.use('java.lang.ProcessManager');
        } catch (err) {
            send("ProcessManager Hook failed: " + err);
        }
    } else {
        send("ProcessManager hook not loaded");
    }

    var KeyInfo = null;

    if (loaded_classes.indexOf('android.security.keystore.KeyInfo') != -1) {
        try {
            //useKeyInfo = true;
            //var KeyInfo = Java.use('android.security.keystore.KeyInfo');
        } catch (err) {
            send("KeyInfo Hook failed: " + err);
        }
    } else {
        send("KeyInfo hook not loaded");
    }

    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
        var shouldFakePackage = (RootPackages.indexOf(pname) > -1);
        if (shouldFakePackage) {
            send("Bypass root check for package: " + pname);
            pname = "set.package.name.to.a.fake.one.so.we.can.bypass.it";
        }
        return this.getPackageInfo.overload('java.lang.String', 'int').call(this, pname, flags);
    };

    NativeFile.exists.implementation = function() {
        var name = NativeFile.getName.call(this);
        var shouldFakeReturn = (RootBinaries.indexOf(name) > -1);
        if (shouldFakeReturn) {
            send("Bypass return value for binary: " + name);
            return false;
        } else {
            return this.exists.call(this);
        }
    };

    var exec = Runtime.exec.overload('[Ljava.lang.String;');
    var exec1 = Runtime.exec.overload('java.lang.String');
    var exec2 = Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;');
    var exec3 = Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;');
    var exec4 = Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;', 'java.io.File');
    var exec5 = Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;', 'java.io.File');

    exec5.implementation = function(cmd, env, dir) {
        if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh") {
            var fakeCmd = "grep";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        if (cmd == "su") {
            var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        return exec5.call(this, cmd, env, dir);
    };

    exec4.implementation = function(cmdarr, env, file) {
        for (var i = 0; i < cmdarr.length; i = i + 1) {
            var tmp_cmd = cmdarr[i];
            if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id" || tmp_cmd == "sh") {
                var fakeCmd = "grep";
                send("Bypass " + cmdarr + " command");
                return exec1.call(this, fakeCmd);
            }

            if (tmp_cmd == "su") {
                var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                send("Bypass " + cmdarr + " command");
                return exec1.call(this, fakeCmd);
            }
        }
        return exec4.call(this, cmdarr, env, file);
    };

    exec3.implementation = function(cmdarr, envp) {
        for (var i = 0; i < cmdarr.length; i = i + 1) {
            var tmp_cmd = cmdarr[i];
            if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id" || tmp_cmd == "sh") {
                var fakeCmd = "grep";
                send("Bypass " + cmdarr + " command");
                return exec1.call(this, fakeCmd);
            }

            if (tmp_cmd == "su") {
                var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                send("Bypass " + cmdarr + " command");
                return exec1.call(this, fakeCmd);
            }
        }
        return exec3.call(this, cmdarr, envp);
    };

    exec2.implementation = function(cmd, env) {
        if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh") {
            var fakeCmd = "grep";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        if (cmd == "su") {
            var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        return exec2.call(this, cmd, env);
    };

    exec.implementation = function(cmd) {
        for (var i = 0; i < cmd.length; i = i + 1) {
            var tmp_cmd = cmd[i];
            if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id" || tmp_cmd == "sh") {
                var fakeCmd = "grep";
                send("Bypass " + cmd + " command");
                return exec1.call(this, fakeCmd);
            }

            if (tmp_cmd == "su") {
                var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                send("Bypass " + cmd + " command");
                return exec1.call(this, fakeCmd);
            }
        }

        return exec.call(this, cmd);
    };

    exec1.implementation = function(cmd) {
        if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh") {
            var fakeCmd = "grep";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        if (cmd == "su") {
            var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
            send("Bypass " + cmd + " command");
            return exec1.call(this, fakeCmd);
        }
        return exec1.call(this, cmd);
    };

    String.contains.implementation = function(name) {
        if (name == "test-keys") {
            send("Bypass test-keys check");
            return false;
        }
        return this.contains.call(this, name);
    };

    var get = SystemProperties.get.overload('java.lang.String');

    get.implementation = function(name) {
        if (RootPropertiesKeys.indexOf(name) != -1) {
            send("Bypass " + name);
            return RootProperties[name];
        }
        return this.get.call(this, name);
    };

    Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
        onEnter: function(args) {
            var path = Memory.readCString(args[0]);
            path = path.split("/");
            var executable = path[path.length - 1];
            var shouldFakeReturn = (RootBinaries.indexOf(executable) > -1)
            if (shouldFakeReturn) {
                Memory.writeUtf8String(args[0], "/notexists");
                send("Bypass native fopen");
            }
        },
        onLeave: function(retval) {

        }
    });

    Interceptor.attach(Module.findExportByName("libc.so", "system"), {
        onEnter: function(args) {
            var cmd = Memory.readCString(args[0]);
            send("SYSTEM CMD: " + cmd);
            if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id") {
                send("Bypass native system: " + cmd);
                Memory.writeUtf8String(args[0], "grep");
            }
            if (cmd == "su") {
                send("Bypass native system: " + cmd);
                Memory.writeUtf8String(args[0], "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled");
            }
        },
        onLeave: function(retval) {

        }
    });

    /*

    TO IMPLEMENT:

    Exec Family

    int execl(const char *path, const char *arg0, ..., const char *argn, (char *)0);
    int execle(const char *path, const char *arg0, ..., const char *argn, (char *)0, char *const envp[]);
    int execlp(const char *file, const char *arg0, ..., const char *argn, (char *)0);
    int execlpe(const char *file, const char *arg0, ..., const char *argn, (char *)0, char *const envp[]);
    int execv(const char *path, char *const argv[]);
    int execve(const char *path, char *const argv[], char *const envp[]);
    int execvp(const char *file, char *const argv[]);
    int execvpe(const char *file, char *const argv[], char *const envp[]);

    */


    BufferedReader.readLine.overload('boolean').implementation = function() {
        var text = this.readLine.overload('boolean').call(this);
        if (text === null) {
            // just pass , i know it's ugly as hell but test != null won't work :(
        } else {
            var shouldFakeRead = (text.indexOf("ro.build.tags=test-keys") > -1);
            if (shouldFakeRead) {
                send("Bypass build.prop file read");
                text = text.replace("ro.build.tags=test-keys", "ro.build.tags=release-keys");
            }
        }
        return text;
    };

    var executeCommand = ProcessBuilder.command.overload('java.util.List');

    ProcessBuilder.start.implementation = function() {
        var cmd = this.command.call(this);
        var shouldModifyCommand = false;
        for (var i = 0; i < cmd.size(); i = i + 1) {
            var tmp_cmd = cmd.get(i).toString();
            if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd.indexOf("mount") != -1 || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd.indexOf("id") != -1) {
                shouldModifyCommand = true;
            }
        }
        if (shouldModifyCommand) {
            send("Bypass ProcessBuilder " + cmd);
            this.command.call(this, ["grep"]);
            return this.start.call(this);
        }
        if (cmd.indexOf("su") != -1) {
            send("Bypass ProcessBuilder " + cmd);
            this.command.call(this, ["justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled"]);
            return this.start.call(this);
        }

        return this.start.call(this);
    };

    if (useProcessManager) {
        var ProcManExec = ProcessManager.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;', 'java.io.File', 'boolean');
        var ProcManExecVariant = ProcessManager.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;', 'java.lang.String', 'java.io.FileDescriptor', 'java.io.FileDescriptor', 'java.io.FileDescriptor', 'boolean');

        ProcManExec.implementation = function(cmd, env, workdir, redirectstderr) {
            var fake_cmd = cmd;
            for (var i = 0; i < cmd.length; i = i + 1) {
                var tmp_cmd = cmd[i];
                if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id") {
                    var fake_cmd = ["grep"];
                    send("Bypass " + cmdarr + " command");
                }

                if (tmp_cmd == "su") {
                    var fake_cmd = ["justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled"];
                    send("Bypass " + cmdarr + " command");
                }
            }
            return ProcManExec.call(this, fake_cmd, env, workdir, redirectstderr);
        };

        ProcManExecVariant.implementation = function(cmd, env, directory, stdin, stdout, stderr, redirect) {
            var fake_cmd = cmd;
            for (var i = 0; i < cmd.length; i = i + 1) {
                var tmp_cmd = cmd[i];
                if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id") {
                    var fake_cmd = ["grep"];
                    send("Bypass " + cmdarr + " command");
                }

                if (tmp_cmd == "su") {
                    var fake_cmd = ["justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled"];
                    send("Bypass " + cmdarr + " command");
                }
            }
            return ProcManExecVariant.call(this, fake_cmd, env, directory, stdin, stdout, stderr, redirect);
        };
    }

    if (useKeyInfo) {
        KeyInfo.isInsideSecureHardware.implementation = function() {
            send("Bypass isInsideSecureHardware");
            return true;
        }
    }

});

/*  Android ssl certificate pinning bypass script for various methods
by Maurizio Siddu

Run with:
frida -U -f <APP_ID> -l frida_multiple_unpinning.js [--no-pause]
*/

setTimeout(function() {
    Java.perform(function() {
        console.log('');
        console.log('======');
        console.log('[#] Android Bypass for various Certificate Pinning methods [#]');
        console.log('======');

        var errDict = {};

        // TrustManager (Android < 7) //
        ////////////////////////////////
        var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
        var SSLContext = Java.use('javax.net.ssl.SSLContext');
        var TrustManager = Java.registerClass({
            // Implement a custom TrustManager
            name: 'dev.asd.test.TrustManager',
            implements: [X509TrustManager],
            methods: {
                checkClientTrusted: function(chain, authType) {},
                checkServerTrusted: function(chain, authType) {},
                getAcceptedIssuers: function() {
                    return [];
                }
            }
        });
        // Prepare the TrustManager array to pass to SSLContext.init()
        var TrustManagers = [TrustManager.$new()];
        // Get a handle on the init() on the SSLContext class
        var SSLContext_init = SSLContext.init.overload(
            '[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom');
        try {
            // Override the init method, specifying the custom TrustManager
            SSLContext_init.implementation = function(keyManager, trustManager, secureRandom) {
                console.log('[+] Bypassing Trustmanager (Android < 7) pinner');
                SSLContext_init.call(this, keyManager, TrustManagers, secureRandom);
            };
        } catch (err) {
            console.log('[-] TrustManager (Android < 7) pinner not found');
            //console.log(err);
        }




        // OkHTTPv3 (quadruple bypass) //
        /////////////////////////////////
        try {
            // Bypass OkHTTPv3 {1}
            var okhttp3_Activity_1 = Java.use('okhttp3.CertificatePinner');
            okhttp3_Activity_1.check.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
                console.log('[+] Bypassing OkHTTPv3 {1}: ' + a);
                return;
            };
        } catch (err) {
            console.log('[-] OkHTTPv3 {1} pinner not found');
            //console.log(err);
            errDict[err] = ['okhttp3.CertificatePinner', 'check'];
        }
        try {
            // Bypass OkHTTPv3 {2}
            // This method of CertificatePinner.check is deprecated but could be found in some old Android apps
            var okhttp3_Activity_2 = Java.use('okhttp3.CertificatePinner');
            okhttp3_Activity_2.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(a, b) {
                console.log('[+] Bypassing OkHTTPv3 {2}: ' + a);
                return;
            };
        } catch (err) {
            console.log('[-] OkHTTPv3 {2} pinner not found');
            //console.log(err);
            //errDict[err] = ['okhttp3.CertificatePinner', 'check'];
        }
        try {
            // Bypass OkHTTPv3 {3}
            var okhttp3_Activity_3 = Java.use('okhttp3.CertificatePinner');
            okhttp3_Activity_3.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function(a, b) {
                console.log('[+] Bypassing OkHTTPv3 {3}: ' + a);
                return;
            };
        } catch (err) {
            console.log('[-] OkHTTPv3 {3} pinner not found');
            //console.log(err);
            errDict[err] = ['okhttp3.CertificatePinner', 'check'];
        }
        try {
            // Bypass OkHTTPv3 {4}
            var okhttp3_Activity_4 = Java.use('okhttp3.CertificatePinner');
            //okhttp3_Activity_4['check$okhttp'].implementation = function(a, b) {
            okhttp3_Activity_4.check$okhttp.overload('java.lang.String', 'kotlin.jvm.functions.Function0').implementation = function(a, b) {
                console.log('[+] Bypassing OkHTTPv3 {4}: ' + a);
                return;
            };
        } catch (err) {
            console.log('[-] OkHTTPv3 {4} pinner not found');
            //console.log(err);
            errDict[err] = ['okhttp3.CertificatePinner', 'check$okhttp'];
        }



        // Trustkit (triple bypass) //
        //////////////////////////////
        try {
            // Bypass Trustkit {1}
            var trustkit_Activity_1 = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
            trustkit_Activity_1.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
                console.log('[+] Bypassing Trustkit {1}: ' + a);
                return true;
            };
        } catch (err) {
            console.log('[-] Trustkit {1} pinner not found');
            //console.log(err);
            errDict[err] = ['com.datatheorem.android.trustkit.pinning.OkHostnameVerifier', 'verify'];
        }
        try {
            // Bypass Trustkit {2}
            var trustkit_Activity_2 = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
            trustkit_Activity_2.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
                console.log('[+] Bypassing Trustkit {2}: ' + a);
                return true;
            };
        } catch (err) {
            console.log('[-] Trustkit {2} pinner not found');
            //console.log(err);
            errDict[err] = ['com.datatheorem.android.trustkit.pinning.OkHostnameVerifier', 'verify'];
        }
        try {
            // Bypass Trustkit {3}
            var trustkit_PinningTrustManager = Java.use('com.datatheorem.android.trustkit.pinning.PinningTrustManager');
            trustkit_PinningTrustManager.checkServerTrusted.overload('[Ljava.security.cert.X509Certificate;', 'java.lang.String').implementation = function(chain, authType) {
                console.log('[+] Bypassing Trustkit {3}');
            };
        } catch (err) {
            console.log('[-] Trustkit {3} pinner not found');
            //console.log(err);
            errDict[err] = ['com.datatheorem.android.trustkit.pinning.PinningTrustManager', 'checkServerTrusted'];
        }




        // TrustManagerImpl (Android > 7) //
        ////////////////////////////////////
        try {
            // Bypass TrustManagerImpl (Android > 7) {1}
            var array_list = Java.use("java.util.ArrayList");
            var TrustManagerImpl_Activity_1 = Java.use('com.android.org.conscrypt.TrustManagerImpl');
            TrustManagerImpl_Activity_1.checkTrustedRecursive.implementation = function(certs, ocspData, tlsSctData, host, clientAuth, untrustedChain, trustAnchorChain, used) {
                console.log('[+] Bypassing TrustManagerImpl (Android > 7) checkTrustedRecursive check for: ' + host);
                return array_list.$new();
            };
        } catch (err) {
            console.log('[-] TrustManagerImpl (Android > 7) checkTrustedRecursive check not found');
            //console.log(err);
            errDict[err] = ['com.android.org.conscrypt.TrustManagerImpl', 'checkTrustedRecursive'];
        }
        try {
            // Bypass TrustManagerImpl (Android > 7) {2} (probably no more necessary)
            var TrustManagerImpl_Activity_2 = Java.use('com.android.org.conscrypt.TrustManagerImpl');
            TrustManagerImpl_Activity_2.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
                console.log('[+] Bypassing TrustManagerImpl (Android > 7) verifyChain check for: ' + host);
                return untrustedChain;
            };
        } catch (err) {
            console.log('[-] TrustManagerImpl (Android > 7) verifyChain check not found');
            //console.log(err);
            errDict[err] = ['com.android.org.conscrypt.TrustManagerImpl', 'verifyChain'];
        }





        // Appcelerator Titanium PinningTrustManager //
        ///////////////////////////////////////////////
        try {
            var appcelerator_PinningTrustManager = Java.use('appcelerator.https.PinningTrustManager');
            appcelerator_PinningTrustManager.checkServerTrusted.implementation = function(chain, authType) {
                console.log('[+] Bypassing Appcelerator PinningTrustManager');
                return;
            };
        } catch (err) {
            console.log('[-] Appcelerator PinningTrustManager pinner not found');
            //console.log(err);
            errDict[err] = ['appcelerator.https.PinningTrustManager', 'checkServerTrusted'];
        }




        // Fabric PinningTrustManager //
        ////////////////////////////////
        try {
            var fabric_PinningTrustManager = Java.use('io.fabric.sdk.android.services.network.PinningTrustManager');
            fabric_PinningTrustManager.checkServerTrusted.implementation = function(chain, authType) {
                console.log('[+] Bypassing Fabric PinningTrustManager');
                return;
            };
        } catch (err) {
            console.log('[-] Fabric PinningTrustManager pinner not found');
            //console.log(err);
            errDict[err] = ['io.fabric.sdk.android.services.network.PinningTrustManager', 'checkServerTrusted'];
        }




        // OpenSSLSocketImpl Conscrypt (double bypass) //
        /////////////////////////////////////////////////
        try {
            var OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
            OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certRefs, JavaObject, authMethod) {
                console.log('[+] Bypassing OpenSSLSocketImpl Conscrypt {1}');
            };
        } catch (err) {
            console.log('[-] OpenSSLSocketImpl Conscrypt {1} pinner not found');
            //console.log(err);
            errDict[err] = ['com.android.org.conscrypt.OpenSSLSocketImpl', 'verifyCertificateChain'];
        }
        try {
            var OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
            OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certChain, authMethod) {
                console.log('[+] Bypassing OpenSSLSocketImpl Conscrypt {2}');
            };
        } catch (err) {
            console.log('[-] OpenSSLSocketImpl Conscrypt {2} pinner not found');
            //console.log(err);
            errDict[err] = ['com.android.org.conscrypt.OpenSSLSocketImpl', 'verifyCertificateChain'];
        }




        // OpenSSLEngineSocketImpl Conscrypt //
        ///////////////////////////////////////
        try {
            var OpenSSLEngineSocketImpl_Activity = Java.use('com.android.org.conscrypt.OpenSSLEngineSocketImpl');
            OpenSSLEngineSocketImpl_Activity.verifyCertificateChain.overload('[Ljava.lang.Long;', 'java.lang.String').implementation = function(a, b) {
                console.log('[+] Bypassing OpenSSLEngineSocketImpl Conscrypt: ' + b);
            };
        } catch (err) {
            console.log('[-] OpenSSLEngineSocketImpl Conscrypt pinner not found');
            //console.log(err);
            errDict[err] = ['com.android.org.conscrypt.OpenSSLEngineSocketImpl', 'verifyCertificateChain'];
        }




        // OpenSSLSocketImpl Apache Harmony //
        //////////////////////////////////////
        try {
            var OpenSSLSocketImpl_Harmony = Java.use('org.apache.harmony.xnet.provider.jsse.OpenSSLSocketImpl');
            OpenSSLSocketImpl_Harmony.verifyCertificateChain.implementation = function(asn1DerEncodedCertificateChain, authMethod) {
                console.log('[+] Bypassing OpenSSLSocketImpl Apache Harmony');
            };
        } catch (err) {
            console.log('[-] OpenSSLSocketImpl Apache Harmony pinner not found');
            //console.log(err);
            errDict[err] = ['org.apache.harmony.xnet.provider.jsse.OpenSSLSocketImpl', 'verifyCertificateChain'];
        }




        // PhoneGap sslCertificateChecker //
        ////////////////////////////////////
        try {
            var phonegap_Activity = Java.use('nl.xservices.plugins.sslCertificateChecker');
            phonegap_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(a, b, c) {
                console.log('[+] Bypassing PhoneGap sslCertificateChecker: ' + a);
                return true;
            };
        } catch (err) {
            console.log('[-] PhoneGap sslCertificateChecker pinner not found');
            //console.log(err);
            errDict[err] = ['nl.xservices.plugins.sslCertificateChecker', 'execute'];
        }




        // IBM MobileFirst pinTrustedCertificatePublicKey (double bypass) //
        ////////////////////////////////////////////////////////////////////
        try {
            // Bypass IBM MobileFirst {1}
            var WLClient_Activity_1 = Java.use('com.worklight.wlclient.api.WLClient');
            WLClient_Activity_1.getInstance().pinTrustedCertificatePublicKey.overload('java.lang.String').implementation = function(cert) {
                console.log('[+] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey {1}: ' + cert);
                return;
            };
        } catch (err) {
            console.log('[-] IBM MobileFirst pinTrustedCertificatePublicKey {1} pinner not found');
            //console.log(err);
            errDict[err] = ['com.worklight.wlclient.api.WLClient', 'pinTrustedCertificatePublicKey'];
        }
        try {
            // Bypass IBM MobileFirst {2}
            var WLClient_Activity_2 = Java.use('com.worklight.wlclient.api.WLClient');
            WLClient_Activity_2.getInstance().pinTrustedCertificatePublicKey.overload('[Ljava.lang.String;').implementation = function(cert) {
                console.log('[+] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey {2}: ' + cert);
                return;
            };
        } catch (err) {
            console.log('[-] IBM MobileFirst pinTrustedCertificatePublicKey {2} pinner not found');
            //console.log(err);
            errDict[err] = ['com.worklight.wlclient.api.WLClient', 'pinTrustedCertificatePublicKey'];
        }




        // IBM WorkLight (ancestor of MobileFirst) HostNameVerifierWithCertificatePinning (quadruple bypass) //
        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        try {
            // Bypass IBM WorkLight {1}
            var worklight_Activity_1 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
            worklight_Activity_1.verify.overload('java.lang.String', 'javax.net.ssl.SSLSocket').implementation = function(a, b) {
                console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {1}: ' + a);
                return;
            };
        } catch (err) {
            console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {1} pinner not found');
            //console.log(err);
            errDict[err] = ['com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning', 'verify'];
        }
        try {
            // Bypass IBM WorkLight {2}
            var worklight_Activity_2 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
            worklight_Activity_2.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
                console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {2}: ' + a);
                return;
            };
        } catch (err) {
            console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {2} pinner not found');
            //console.log(err);
            errDict[err] = ['com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning', 'verify'];
        }
        try {
            // Bypass IBM WorkLight {3}
            var worklight_Activity_3 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
            worklight_Activity_3.verify.overload('java.lang.String', '[Ljava.lang.String;', '[Ljava.lang.String;').implementation = function(a, b) {
                console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {3}: ' + a);
                return;
            };
        } catch (err) {
            console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {3} pinner not found');
            //console.log(err);
            errDict[err] = ['com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning', 'verify'];
        }
        try {
            // Bypass IBM WorkLight {4}
            var worklight_Activity_4 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
            worklight_Activity_4.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
                console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {4}: ' + a);
                return true;
            };
        } catch (err) {
            console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {4} pinner not found');
            //console.log(err);
            errDict[err] = ['com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning', 'verify'];
        }




        // Conscrypt CertPinManager //
        //////////////////////////////
        try {
            var conscrypt_CertPinManager_Activity = Java.use('com.android.org.conscrypt.CertPinManager');
            conscrypt_CertPinManager_Activity.checkChainPinning.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
                console.log('[+] Bypassing Conscrypt CertPinManager: ' + a);
                return;
            };
        } catch (err) {
            console.log('[-] Conscrypt CertPinManager pinner not found');
            //console.log(err);
            errDict[err] = ['com.android.org.conscrypt.CertPinManager', 'checkChainPinning'];
        }




        // Conscrypt CertPinManager (Legacy) //
        ///////////////////////////////////////
        try {
            var legacy_conscrypt_CertPinManager_Activity = Java.use('com.android.org.conscrypt.CertPinManager');
            legacy_conscrypt_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
                console.log('[+] Bypassing Conscrypt CertPinManager (Legacy): ' + a);
                return true;
            };
        } catch (err) {
            console.log('[-] Conscrypt CertPinManager (Legacy) pinner not found');
            //console.log(err);
            errDict[err] = ['com.android.org.conscrypt.CertPinManager', 'isChainValid'];
        }




        // CWAC-Netsecurity (unofficial back-port pinner for Android<4.2) CertPinManager //
        ///////////////////////////////////////////////////////////////////////////////////
        try {
            var cwac_CertPinManager_Activity = Java.use('com.commonsware.cwac.netsecurity.conscrypt.CertPinManager');
            cwac_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
                console.log('[+] Bypassing CWAC-Netsecurity CertPinManager: ' + a);
                return true;
            };
        } catch (err) {
            console.log('[-] CWAC-Netsecurity CertPinManager pinner not found');
            //console.log(err);
            errDict[err] = ['com.commonsware.cwac.netsecurity.conscrypt.CertPinManager', 'isChainValid'];
        }




        // Worklight Androidgap WLCertificatePinningPlugin //
        /////////////////////////////////////////////////////
        try {
            var androidgap_WLCertificatePinningPlugin_Activity = Java.use('com.worklight.androidgap.plugin.WLCertificatePinningPlugin');
            androidgap_WLCertificatePinningPlugin_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(a, b, c) {
                console.log('[+] Bypassing Worklight Androidgap WLCertificatePinningPlugin: ' + a);
                return true;
            };
        } catch (err) {
            console.log('[-] Worklight Androidgap WLCertificatePinningPlugin pinner not found');
            //console.log(err);
            errDict[err] = ['com.worklight.androidgap.plugin.WLCertificatePinningPlugin', 'execute'];
        }




        // Netty FingerprintTrustManagerFactory //
        //////////////////////////////////////////
        try {
            var netty_FingerprintTrustManagerFactory = Java.use('io.netty.handler.ssl.util.FingerprintTrustManagerFactory');
            //NOTE: sometimes this below implementation could be useful 
            //var netty_FingerprintTrustManagerFactory = Java.use('org.jboss.netty.handler.ssl.util.FingerprintTrustManagerFactory');
            netty_FingerprintTrustManagerFactory.checkTrusted.implementation = function(type, chain) {
                console.log('[+] Bypassing Netty FingerprintTrustManagerFactory');
            };
        } catch (err) {
            console.log('[-] Netty FingerprintTrustManagerFactory pinner not found');
            //console.log(err);
            errDict[err] = ['io.netty.handler.ssl.util.FingerprintTrustManagerFactory', 'checkTrusted'];
        }




        // Squareup CertificatePinner [OkHTTP<v3] (double bypass) //
        ////////////////////////////////////////////////////////////
        try {
            // Bypass Squareup CertificatePinner  {1}
            var Squareup_CertificatePinner_Activity_1 = Java.use('com.squareup.okhttp.CertificatePinner');
            Squareup_CertificatePinner_Activity_1.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(a, b) {
                console.log('[+] Bypassing Squareup CertificatePinner {1}: ' + a);
                return;
            };
        } catch (err) {
            console.log('[-] Squareup CertificatePinner {1} pinner not found');
            //console.log(err);
            errDict[err] = ['com.squareup.okhttp.CertificatePinner', 'check'];
        }
        try {
            // Bypass Squareup CertificatePinner {2}
            var Squareup_CertificatePinner_Activity_2 = Java.use('com.squareup.okhttp.CertificatePinner');
            Squareup_CertificatePinner_Activity_2.check.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
                console.log('[+] Bypassing Squareup CertificatePinner {2}: ' + a);
                return;
            };
        } catch (err) {
            console.log('[-] Squareup CertificatePinner {2} pinner not found');
            //console.log(err);
            errDict[err] = ['com.squareup.okhttp.CertificatePinner', 'check'];
        }




        // Squareup OkHostnameVerifier [OkHTTP v3] (double bypass) //
        /////////////////////////////////////////////////////////////
        try {
            // Bypass Squareup OkHostnameVerifier {1}
            var Squareup_OkHostnameVerifier_Activity_1 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
            Squareup_OkHostnameVerifier_Activity_1.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
                console.log('[+] Bypassing Squareup OkHostnameVerifier {1}: ' + a);
                return true;
            };
        } catch (err) {
            console.log('[-] Squareup OkHostnameVerifier check not found');
            //console.log(err);
            errDict[err] = ['com.squareup.okhttp.internal.tls.OkHostnameVerifier', 'verify'];
        }
        try {
            // Bypass Squareup OkHostnameVerifier {2}
            var Squareup_OkHostnameVerifier_Activity_2 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
            Squareup_OkHostnameVerifier_Activity_2.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
                console.log('[+] Bypassing Squareup OkHostnameVerifier {2}: ' + a);
                return true;
            };
        } catch (err) {
            console.log('[-] Squareup OkHostnameVerifier check not found');
            //console.log(err);
            errDict[err] = ['com.squareup.okhttp.internal.tls.OkHostnameVerifier', 'verify'];
        }




        // Android WebViewClient (quadruple bypass) //
        //////////////////////////////////////////////
        try {
            // Bypass WebViewClient {1} (deprecated from Android 6)
            var AndroidWebViewClient_Activity_1 = Java.use('android.webkit.WebViewClient');
            AndroidWebViewClient_Activity_1.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
                console.log('[+] Bypassing Android WebViewClient check {1}');
            };
        } catch (err) {
            console.log('[-] Android WebViewClient {1} check not found');
            //console.log(err)
            errDict[err] = ['android.webkit.WebViewClient', 'onReceivedSslError'];
        }
        // Not working properly temporarily disused
        //try {
        //// Bypass WebViewClient {2}
        //var AndroidWebViewClient_Activity_2 = Java.use('android.webkit.WebViewClient');
        //AndroidWebViewClient_Activity_2.onReceivedHttpError.overload('android.webkit.WebView', 'android.webkit.WebResourceRequest', 'android.webkit.WebResourceResponse').implementation = function(obj1, obj2, obj3) {
        //console.log('[+] Bypassing Android WebViewClient check {2}');
        //};
        //} catch (err) {
        //console.log('[-] Android WebViewClient {2} check not found');
        ////console.log(err)
        //errDict[err] = ['android.webkit.WebViewClient', 'onReceivedHttpError'];
        //}
        try {
            // Bypass WebViewClient {3}
            var AndroidWebViewClient_Activity_3 = Java.use('android.webkit.WebViewClient');
            //AndroidWebViewClient_Activity_3.onReceivedError.overload('android.webkit.WebView', 'int', 'java.lang.String', 'java.lang.String').implementation = function(obj1, obj2, obj3, obj4) {
            AndroidWebViewClient_Activity_3.onReceivedError.implementation = function(view, errCode, description, failingUrl) {
                console.log('[+] Bypassing Android WebViewClient check {3}');
            };
        } catch (err) {
            console.log('[-] Android WebViewClient {3} check not found');
            //console.log(err)
            errDict[err] = ['android.webkit.WebViewClient', 'onReceivedError'];
        }
        try {
            // Bypass WebViewClient {4}
            var AndroidWebViewClient_Activity_4 = Java.use('android.webkit.WebViewClient');
            AndroidWebViewClient_Activity_4.onReceivedError.overload('android.webkit.WebView', 'android.webkit.WebResourceRequest', 'android.webkit.WebResourceError').implementation = function(obj1, obj2, obj3) {
                console.log('[+] Bypassing Android WebViewClient check {4}');
            };
        } catch (err) {
            console.log('[-] Android WebViewClient {4} check not found');
            //console.log(err)
            errDict[err] = ['android.webkit.WebViewClient', 'onReceivedError'];
        }




        // Apache Cordova WebViewClient //
        //////////////////////////////////
        try {
            var CordovaWebViewClient_Activity = Java.use('org.apache.cordova.CordovaWebViewClient');
            CordovaWebViewClient_Activity.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
                console.log('[+] Bypassing Apache Cordova WebViewClient check');
                obj3.proceed();
            };
        } catch (err) {
            console.log('[-] Apache Cordova WebViewClient check not found');
            //console.log(err);
        }




        // Boye AbstractVerifier //
        ///////////////////////////
        try {
            var boye_AbstractVerifier = Java.use('ch.boye.httpclientandroidlib.conn.ssl.AbstractVerifier');
            boye_AbstractVerifier.verify.implementation = function(host, ssl) {
                console.log('[+] Bypassing Boye AbstractVerifier check for: ' + host);
            };
        } catch (err) {
            console.log('[-] Boye AbstractVerifier check not found');
            //console.log(err);
            errDict[err] = ['ch.boye.httpclientandroidlib.conn.ssl.AbstractVerifier', 'verify'];
        }



        // Apache AbstractVerifier (quadruple bypass) //
        ////////////////////////////////////////////////
        try {
            var apache_AbstractVerifier_1 = Java.use('org.apache.http.conn.ssl.AbstractVerifier');
            apache_AbstractVerifier_1.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
                console.log('[+] Bypassing Apache AbstractVerifier {1} check for: ' + a);
                return;
            };
        } catch (err) {
            console.log('[-] Apache AbstractVerifier {1} check not found');
            //console.log(err);
            errDict[err] = ['org.apache.http.conn.ssl.AbstractVerifier', 'verify'];
        }
        try {
            var apache_AbstractVerifier_2 = Java.use('org.apache.http.conn.ssl.AbstractVerifier');
            apache_AbstractVerifier_2.verify.overload('java.lang.String', 'javax.net.ssl.SSLSocket').implementation = function(a, b) {
                console.log('[+] Bypassing Apache AbstractVerifier {2} check for: ' + a);
                return;
            };
        } catch (err) {
            console.log('[-] Apache AbstractVerifier {2} check not found');
            //console.log(err);
            errDict[err] = ['org.apache.http.conn.ssl.AbstractVerifier', 'verify'];
        }
        try {
            var apache_AbstractVerifier_3 = Java.use('org.apache.http.conn.ssl.AbstractVerifier');
            apache_AbstractVerifier_3.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
                console.log('[+] Bypassing Apache AbstractVerifier {3} check for: ' + a);
                return;
            };
        } catch (err) {
            console.log('[-] Apache AbstractVerifier {3} check not found');
            //console.log(err);
            errDict[err] = ['org.apache.http.conn.ssl.AbstractVerifier', 'verify'];
        }
        try {
            var apache_AbstractVerifier_4 = Java.use('org.apache.http.conn.ssl.AbstractVerifier');
            apache_AbstractVerifier_4.verify.overload('java.lang.String', '[Ljava.lang.String;', '[Ljava.lang.String;', 'boolean').implementation = function(a, b, c, d) {
                console.log('[+] Bypassing Apache AbstractVerifier {4} check for: ' + a);
                return;
            };
        } catch (err) {
            console.log('[-] Apache AbstractVerifier {4} check not found');
            //console.log(err);
            errDict[err] = ['org.apache.http.conn.ssl.AbstractVerifier', 'verify'];
        }




        // Chromium Cronet //
        /////////////////////
        try {
            var CronetEngineBuilderImpl_Activity = Java.use("org.chromium.net.impl.CronetEngineBuilderImpl");
            // Setting argument to TRUE (default is TRUE) to disable Public Key pinning for local trust anchors
            CronetEngine_Activity.enablePublicKeyPinningBypassForLocalTrustAnchors.overload('boolean').implementation = function(a) {
                console.log("[+] Disabling Public Key pinning for local trust anchors in Chromium Cronet");
                var cronet_obj_1 = CronetEngine_Activity.enablePublicKeyPinningBypassForLocalTrustAnchors.call(this, true);
                return cronet_obj_1;
            };
            // Bypassing Chromium Cronet pinner
            CronetEngine_Activity.addPublicKeyPins.overload('java.lang.String', 'java.util.Set', 'boolean', 'java.util.Date').implementation = function(hostName, pinsSha256, includeSubdomains, expirationDate) {
                console.log("[+] Bypassing Chromium Cronet pinner: " + hostName);
                var cronet_obj_2 = CronetEngine_Activity.addPublicKeyPins.call(this, hostName, pinsSha256, includeSubdomains, expirationDate);
                return cronet_obj_2;
            };
        } catch (err) {
            console.log('[-] Chromium Cronet pinner not found')
            //console.log(err);
        }




        // Flutter Pinning packages http_certificate_pinning and ssl_pinning_plugin (double bypass) //
        //////////////////////////////////////////////////////////////////////////////////////////////
        try {
            // Bypass HttpCertificatePinning.check {1}
            var HttpCertificatePinning_Activity = Java.use('diefferson.http_certificate_pinning.HttpCertificatePinning');
            HttpCertificatePinning_Activity.checkConnexion.overload("java.lang.String", "java.util.List", "java.util.Map", "int", "java.lang.String").implementation = function(a, b, c, d, e) {
                console.log('[+] Bypassing Flutter HttpCertificatePinning : ' + a);
                return true;
            };
        } catch (err) {
            console.log('[-] Flutter HttpCertificatePinning pinner not found');
            //console.log(err);
            errDict[err] = ['diefferson.http_certificate_pinning.HttpCertificatePinning', 'checkConnexion'];
        }
        try {
            // Bypass SslPinningPlugin.check {2}
            var SslPinningPlugin_Activity = Java.use('com.macif.plugin.sslpinningplugin.SslPinningPlugin');
            SslPinningPlugin_Activity.checkConnexion.overload("java.lang.String", "java.util.List", "java.util.Map", "int", "java.lang.String").implementation = function(a, b, c, d, e) {
                console.log('[+] Bypassing Flutter SslPinningPlugin: ' + a);
                return true;
            };
        } catch (err) {
            console.log('[-] Flutter SslPinningPlugin pinner not found');
            //console.log(err);
            errDict[err] = ['com.macif.plugin.sslpinningplugin.SslPinningPlugin', 'checkConnexion'];
        }




        // Unusual/obfuscated pinners bypass //
        ///////////////////////////////////////
        try {
            // Iterating all caught pinner errors and try to overload them 
            for (var key in errDict) {
                var errStr = key;
                var targetClass = errDict[key][0]
                var targetFunc = errDict[key][1]
                var retType = Java.use(targetClass)[targetFunc].returnType.type;
                //console.log("errDict content: "+errStr+" "+targetClass+"."+targetFunc);
                if (String(errStr).includes('.overload')) {
                    overloader(errStr, targetClass, targetFunc, retType);
                }
            }
        } catch (err) {
            //console.log('[-] The pinner "'+targetClass+'.'+targetFunc+'" is not unusual/obfuscated, skipping it..');
            //console.log(err);
        }




        // Dynamic SSLPeerUnverifiedException Bypasser                               //
        // An useful technique to bypass SSLPeerUnverifiedException failures raising //
        // when the Android app uses some uncommon SSL Pinning methods or an heavily //
        // code obfuscation. Inspired by an idea of: https://github.com/httptoolkit  //
        ///////////////////////////////////////////////////////////////////////////////
        try {
            var UnverifiedCertError = Java.use('javax.net.ssl.SSLPeerUnverifiedException');
            UnverifiedCertError.$init.implementation = function(reason) {
                try {
                    var stackTrace = Java.use('java.lang.Thread').currentThread().getStackTrace();
                    var exceptionStackIndex = stackTrace.findIndex(stack =>
                        stack.getClassName() === "javax.net.ssl.SSLPeerUnverifiedException"
                    );
                    // Retrieve the method raising the SSLPeerUnverifiedException
                    var callingFunctionStack = stackTrace[exceptionStackIndex + 1];
                    var className = callingFunctionStack.getClassName();
                    var methodName = callingFunctionStack.getMethodName();
                    var callingClass = Java.use(className);
                    var callingMethod = callingClass[methodName];
                    console.log('\x1b[36m[!] Unexpected SSLPeerUnverifiedException occurred related to the method "' + className + '.' + methodName + '"\x1b[0m');
                    //console.log("Stacktrace details:\n"+stackTrace);
                    // Checking if the SSLPeerUnverifiedException was generated by an usually negligible (not blocking) method
                    if (className == 'com.android.org.conscrypt.ActiveSession' || className == 'com.google.android.gms.org.conscrypt.ActiveSession') {
                        throw 'Reason: skipped SSLPeerUnverifiedException bypass since the exception was raised from a (usually) non blocking method on the Android app';
                    } else {
                        console.log('\x1b[34m[!] Starting to dynamically circumvent the SSLPeerUnverifiedException for the method "' + className + '.' + methodName + '"...\x1b[0m');
                        var retTypeName = callingMethod.returnType.type;
                        // Skip it when the calling method was already bypassed with Frida
                        if (!(callingMethod.implementation)) {
                            // Trying to bypass (via implementation) the SSLPeerUnverifiedException if due to an uncommon SSL Pinning method
                            callingMethod.implementation = function() {
                                console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + className + '.' + methodName + '" via Frida function implementation\x1b[0m');
                                returner(retTypeName);
                            }
                        }
                    }
                } catch (err2) {
                    // Dynamic circumvention via function implementation does not works, then trying via function overloading
                    if (String(err2).includes('.overload')) {
                        overloader(err2, className, methodName, retTypeName);
                    } else {
                        if (String(err2).includes('SSLPeerUnverifiedException')) {
                            console.log('\x1b[36m[-] Failed to dynamically circumvent SSLPeerUnverifiedException -> ' + err2 + '\x1b[0m');
                        } else {
                            //console.log('\x1b[36m[-] Another kind of exception raised during overloading  -> '+err2+'\x1b[0m');
                        }
                    }
                }
                //console.log('\x1b[36m[+] SSLPeerUnverifiedException hooked\x1b[0m');
                return this.$init(reason);
            };
        } catch (err1) {
            //console.log('\x1b[36m[-] SSLPeerUnverifiedException not found\x1b[0m');
            //console.log('\x1b[36m'+err1+'\x1b[0m');
        }


    });

}, 0);




function returner(typeName) {
    // This is a improvable rudimentary fix, if not works you can patch it manually
    //console.log("typeName: "+typeName)
    if (typeName === undefined || typeName === 'void') {
        return;
    } else if (typeName === 'boolean') {
        return true;
    } else {
        return null;
    }
}


function overloader(errStr, targetClass, targetFunc, retType) {
    // One ring to overload them all.. ;-)
    var tClass = Java.use(targetClass);
    var tFunc = tClass[targetFunc];
    var params = [];
    var argList = [];
    var overloads = tFunc.overloads;
    var returnTypeName = retType;
    var splittedList = String(errStr).split('.overload');
    for (var n = 1; n < splittedList.length; n++) {
        var extractedOverload = splittedList[n].trim().split('(')[1].slice(0, -1).replaceAll("'", "");
        // Discarding useless error strings
        if (extractedOverload.includes('<signature>')) {
            continue;
        }
        console.log('\x1b[34m[!] Found the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"\x1b[0m');
        // Check if extractedOverload is empty
        if (!extractedOverload) {
            // Overloading method withouth arguments
            tFunc.overload().implementation = function() {
                var printStr = printer();
                console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
                returner(returnTypeName);
            }
        } else {
            // Check if extractedOverload has multiple arguments
            if (extractedOverload.includes(',')) {
                argList = extractedOverload.split(', ');
            }
            // Considering max 8 arguments for the method to overload (Note: increase it, if needed)
            if (argList.length == 0) {
                tFunc.overload(extractedOverload).implementation = function(a) {
                    var printStr = printer();
                    console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
                    returner(returnTypeName);
                }
            } else if (argList.length == 2) {
                tFunc.overload(argList[0], argList[1]).implementation = function(a, b) {
                    var printStr = printer(a);
                    console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
                    returner(returnTypeName);
                }
            } else if (argList.length == 3) {
                tFunc.overload(argList[0], argList[1], argList[2]).implementation = function(a, b, c) {
                    var printStr = printer(a, b);
                    console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
                    returner(returnTypeName);
                }
            } else if (argList.length == 4) {
                tFunc.overload(argList[0], argList[1], argList[2], argList[3]).implementation = function(a, b, c, d) {
                    var printStr = printer(a, b, c);
                    console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
                    returner(returnTypeName);
                }
            } else if (argList.length == 5) {
                tFunc.overload(argList[0], argList[1], argList[2], argList[3], argList[4]).implementation = function(a, b, c, d, e) {
                    var printStr = printer(a, b, c, d);
                    console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
                    returner(returnTypeName);
                }
            } else if (argList.length == 6) {
                tFunc.overload(argList[0], argList[1], argList[2], argList[3], argList[4], argList[5]).implementation = function(a, b, c, d, e, f) {
                    var printStr = printer(a, b, c, d, e);
                    console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
                    returner(returnTypeName);
                }
            } else if (argList.length == 7) {
                tFunc.overload(argList[0], argList[1], argList[2], argList[3], argList[4], argList[5], argList[6]).implementation = function(a, b, c, d, e, f, g) {
                    var printStr = printer(a, b, c, d, e, f);
                    console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
                    returner(returnTypeName);
                }
            } else if (argList.length == 8) {
                tFunc.overload(argList[0], argList[1], argList[2], argList[3], argList[4], argList[5], argList[6], argList[7]).implementation = function(a, b, c, d, e, f, g, h) {
                    var printStr = printer(a, b, c, d, e, f, g);
                    console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
                    returner(returnTypeName);
                }
            }
        }

    }
}


function printer(a, b, c, d, e, f, g, h) {
    // Build the string to print for the overloaded pinner
    var printList = [];
    var printStr = '';
    if (typeof a === 'string') {
        printList.push(a);
    }
    if (typeof b === 'string') {
        printList.push(b);
    }
    if (typeof c === 'string') {
        printList.push(c);
    }
    if (typeof d === 'string') {
        printList.push(d);
    }
    if (typeof e === 'string') {
        printList.push(e);
    }
    if (typeof f === 'string') {
        printList.push(f);
    }
    if (typeof g === 'string') {
        printList.push(g);
    }
    if (typeof h === 'string') {
        printList.push(h);
    }
    if (printList.length !== 0) {
        printStr = ' check for:';
        for (var i = 0; i < printList.length; i++) {
            printStr += ' ' + printList[i];
        }
    }
    return printStr;
}

function disableFlutterPinningv2() {
    var config = {
        "ios": {
            "modulename": "Flutter",
            "patterns": {
                "arm64": [
                    "FF 83 01 D1 FA 67 01 A9 F8 5F 02 A9 F6 57 03 A9 F4 4F 04 A9 FD 7B 05 A9 FD 43 01 91 F? 03 00 AA ?? 0? 40 F9 ?8 1? 40 F9 15 ?? 4? F9 B5 00 00 B4",
                ],
            },
        },
        "android": {
            "modulename": "libflutter.so",
            "patterns": {
                "arm64": [
                    "F? 0F 1C F8 F? 5? 01 A9 F? 5? 02 A9 F? ?? 03 A9 ?? ?? ?? ?? 68 1A 40 F9",
                    "F? 43 01 D1 FE 67 01 A9 F8 5F 02 A9 F6 57 03 A9 F4 4F 04 A9 13 00 40 F9 F4 03 00 AA 68 1A 40 F9",
                    "FF 43 01 D1 FE 67 01 A9 ?? ?? 06 94 ?? 7? 06 94 68 1A 40 F9 15 15 41 F9 B5 00 00 B4 B6 4A 40 F9",
                ],
                "arm": [
                    "2D E9 F? 4? D0 F8 00 80 81 46 D8 F8 18 00 D0 F8 ??",
                ],
                "x64": [
                    "55 41 57 41 56 41 55 41 54 53 50 49 89 f? 4c 8b 37 49 8b 46 30 4c 8b a? ?? 0? 00 00 4d 85 e? 74 1? 4d 8b",
                    "55 41 57 41 56 41 55 41 54 53 48 83 EC 18 49 89 FF 48 8B 1F 48 8B 43 30 4C 8B A0 28 02 00 00 4D 85 E4 74"
                ]
            }
        }
    };

    var TLSValidationDisabled = false;
    if (Java.available) {
        console.log("[+] Java environment detected");
        Java.perform(hookSystemLoadLibrary);
    } else if (ObjC.available) {
        console.log("[+] iOS environment detected");
    }
    disableTLSValidation();
    setTimeout(disableTLSValidation, 2000, true);

    function hookSystemLoadLibrary() {
        const System = Java.use('java.lang.System');
        const Runtime = Java.use('java.lang.Runtime');
        const SystemLoad_2 = System.loadLibrary.overload('java.lang.String');
        const VMStack = Java.use('dalvik.system.VMStack');

        SystemLoad_2.implementation = function(library) {
            try {
                const loaded = Runtime.getRuntime().loadLibrary0(VMStack.getCallingClassLoader(), library);
                if (library === 'flutter') {
                    console.log("[+] libflutter.so loaded");
                    disableTLSValidation();
                }
                return loaded;
            } catch (ex) {
                console.log(ex);
            }
        };
    }

    function disableTLSValidation(fallback = false) {
        if (TLSValidationDisabled) return;

        var platformConfig = config[Java.available ? "android" : "ios"];
        var m = Process.findModuleByName(platformConfig["modulename"]);

        // If there is no loaded Flutter module, the setTimeout may trigger a second time, but after that we give up
        if (m === null) {
            if (fallback) console.log("[!] Flutter module not found.");
            return;
        }

        if (Process.arch in platformConfig["patterns"]) {
            findAndPatch(m, platformConfig["patterns"][Process.arch], Java.available && Process.arch == "arm" ? 1 : 0, fallback);
        } else {
            console.log("[!] Processor architecture not supported: ", Process.arch);
        }

        if (!TLSValidationDisabled) {
            if (fallback) {
                if (m.enumerateRanges('r-x').length == 0) {
                    console.log('[!] No memory ranges found in Flutter library. This is either a Frida bug, or the application is using some kind of RASP.');
                } else {
                    console.log('[!] ssl_verify_peer_cert not found. Please open an issue at https://github.com/NVISOsecurity/disable-flutter-tls-verification/issues');
                }
            } else {
                console.log('[!] ssl_verify_peer_cert not found. Trying again...');
            }
        }
    }

    function findAndPatch(m, patterns, thumb, fallback) {
        console.log("[+] Flutter library found");
        var ranges = m.enumerateRanges('r-x');
        ranges.forEach(range => {
            patterns.forEach(pattern => {
                Memory.scan(range.base, range.size, pattern, {
                    onMatch: function(address, size) {
                        console.log('[+] ssl_verify_peer_cert found at offset: 0x' + (address - m.base).toString(16));
                        TLSValidationDisabled = true;
                        hook_ssl_verify_peer_cert(address.add(thumb));
                    }
                });
            });
        });
    }

    function hook_ssl_verify_peer_cert(address) {
        Interceptor.replace(address, new NativeCallback((pathPtr, flags) => {
            return 0;
        }, 'int', ['pointer', 'int']));
    }
}


function hook_ssl_verify_result(address) {
    Interceptor.attach(address, {
        onEnter: function(args) {
            console.log("Disabling SSL validation")
        },
        onLeave: function(retval) {
            console.log("Retval: " + retval)
            retval.replace(0x1);
        }
    });
}

function disablePinning() {
    try {
        var m = Process.findModuleByName("libflutter.so");
        var pattern = "2d e9 f0 4f a3 b0 82 46 50 20 10 70"
        var res = Memory.scan(m.base, m.size, pattern, {
            onMatch: function(address, size) {
                console.log('[+] ssl_verify_result found at: ' + address.toString());
                hook_ssl_verify_result(address.add(0x01));
            },
            onError: function(reason) {
                console.log('[!] There was an error scanning memory');
            },
            onComplete: function() {
                console.log("All done")
            }
        });
    } catch (e) {
        console.warn("Not A Flutter App");
    }
}


function CommonMethods() {
    try {
        const HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");
        HttpsURLConnection.setDefaultHostnameVerifier.implementation = function(hostnameVerifier) {
            console.log('[*] Bypassing HttpsURLConnection (setDefaultHostnameVerifier)');
            return;
        };
        console.log('[+] HttpsURLConnection (setDefaultHostnameVerifier)');
    } catch (err) {
        console.log('[!] HttpsURLConnection (setDefaultHostnameVerifier)');
    }
    try {
        const HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");
        HttpsURLConnection.setSSLSocketFactory.implementation = function(SSLSocketFactory) {
            console.log('[*] Bypassing HttpsURLConnection (setSSLSocketFactory)');
            return;
        };
        console.log('[+] HttpsURLConnection (setSSLSocketFactory)');
    } catch (err) {
        console.log('[!] HttpsURLConnection (setSSLSocketFactory)');
    }
    try {
        const HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");
        HttpsURLConnection.setHostnameVerifier.implementation = function(hostnameVerifier) {
            console.log('[*] Bypassing HttpsURLConnection (setHostnameVerifier)');
            return;
        };
        console.log('[+] HttpsURLConnection (setHostnameVerifier)');
    } catch (err) {
        console.log('[!] HttpsURLConnection (setHostnameVerifier)');
    }
    try {
        const X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
        const SSLContext = Java.use('javax.net.ssl.SSLContext');
        const TrustManager = Java.registerClass({
            name: 'incogbyte.bypass.test.TrustManager',
            implements: [X509TrustManager],
            methods: {
                checkClientTrusted: function(chain, authType) {},
                checkServerTrusted: function(chain, authType) {},
                getAcceptedIssuers: function() {
                    return [];
                }
            }
        });
        const TrustManagers = [TrustManager.$new()];
        const SSLContext_init = SSLContext.init.overload('[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom');
        SSLContext_init.implementation = function(keyManager, trustManager, secureRandom) {
            console.log('[*] Bypassing Trustmanager (Android < 7) request');
            SSLContext_init.call(this, keyManager, TrustManagers, secureRandom);
        };
        console.log('[+] SSLContext');
    } catch (err) {
        console.log('[!] SSLContext');
    }
    try {
        const array_list = Java.use("java.util.ArrayList");
        const TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
        TrustManagerImpl.checkTrustedRecursive.implementation = function(a1, a2, a3, a4, a5, a6) {
            console.log('[*] Bypassing TrustManagerImpl checkTrusted ');
            return array_list.$new();
        }
        TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
            console.log('[*] Bypassing TrustManagerImpl verifyChain: ' + host);
            return untrustedChain;
        };
        console.log('[+] TrustManagerImpl');
    } catch (err) {
        console.log('[!] TrustManagerImpl');
    }
    try {
        const okhttp3_Activity_1 = Java.use('okhttp3.CertificatePinner');
        okhttp3_Activity_1.check.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
            console.log('[*] Bypassing OkHTTPv3 (list): ' + a);
        };
        console.log('[+] OkHTTPv3 (list)');
    } catch (err) {
        console.log('[!] OkHTTPv3 (list)');
    }
    try {
        const okhttp3_Activity_2 = Java.use('okhttp3.CertificatePinner');
        okhttp3_Activity_2.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(a, b) {
            console.log('[*] Bypassing OkHTTPv3 (cert): ' + a);
            return true;
        };
        console.log('[+] OkHTTPv3 (cert)');
    } catch (err) {
        console.log('[!] OkHTTPv3 (cert)');
    }
    try {
        const okhttp3_Activity_3 = Java.use('okhttp3.CertificatePinner');
        okhttp3_Activity_3.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function(a, b) {
            console.log('[*] Bypassing OkHTTPv3 (cert array): ' + a);
            return true;
        };
        console.log('[+] OkHTTPv3 (cert array)');
    } catch (err) {
        console.log('[!] OkHTTPv3 (cert array)');
    }
    try {
        const okhttp3_Activity_4 = Java.use('okhttp3.CertificatePinner');
        okhttp3_Activity_4['check$okhttp'].implementation = function(a, b) {
            console.log('[*] Bypassing OkHTTPv3 ($okhttp): ' + a);
        };
        console.log('[+] OkHTTPv3 ($okhttp)');
    } catch (err) {
        console.log('[!] OkHTTPv3 ($okhttp)');
    }
    try {
        const trustkit_Activity_1 = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
        trustkit_Activity_1.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
            console.log('[*] Bypassing Trustkit OkHostnameVerifier(SSLSession): ' + a);
            return true;
        };
        console.log('[+] Trustkit OkHostnameVerifier(SSLSession)');
    } catch (err) {
        console.log('[!] Trustkit OkHostnameVerifier(SSLSession)');
    }
    try {
        const trustkit_Activity_2 = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
        trustkit_Activity_2.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
            console.log('[*] Bypassing Trustkit OkHostnameVerifier(cert): ' + a);
            return true;
        };
        console.log('[+] Trustkit OkHostnameVerifier(cert)');
    } catch (err) {
        console.log('[!] Trustkit OkHostnameVerifier(cert)');
    }
    try {
        const trustkit_PinningTrustManager = Java.use('com.datatheorem.android.trustkit.pinning.PinningTrustManager');
        trustkit_PinningTrustManager.checkServerTrusted.implementation = function() {
            console.log('[*] Bypassing Trustkit PinningTrustManager');
        };
        console.log('[+] Trustkit PinningTrustManager');
    } catch (err) {
        console.log('[!] Trustkit PinningTrustManager');
    }
    try {
        const appcelerator_PinningTrustManager = Java.use('appcelerator.https.PinningTrustManager');
        appcelerator_PinningTrustManager.checkServerTrusted.implementation = function() {
            console.log('[*] Bypassing Appcelerator PinningTrustManager');
        };
        console.log('[+] Appcelerator PinningTrustManager');
    } catch (err) {
        console.log('[!] Appcelerator PinningTrustManager');
    }
    try {
        const OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
        OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certRefs, JavaObject, authMethod) {
            console.log('[*] Bypassing OpenSSLSocketImpl Conscrypt');
        };
        console.log('[+] OpenSSLSocketImpl Conscrypt');
    } catch (err) {
        console.log('[!] OpenSSLSocketImpl Conscrypt');
    }
    try {
        const OpenSSLEngineSocketImpl_Activity = Java.use('com.android.org.conscrypt.OpenSSLEngineSocketImpl');
        OpenSSLEngineSocketImpl_Activity.verifyCertificateChain.overload('[Ljava.lang.Long;', 'java.lang.String').implementation = function(a, b) {
            console.log('[*] Bypassing OpenSSLEngineSocketImpl Conscrypt: ' + b);
        };
        console.log('[+] OpenSSLEngineSocketImpl Conscrypt');
    } catch (err) {
        console.log('[!] OpenSSLEngineSocketImpl Conscrypt');
    }
    try {
        const OpenSSLSocketImpl_Harmony = Java.use('org.apache.harmony.xnet.provider.jsse.OpenSSLSocketImpl');
        OpenSSLSocketImpl_Harmony.verifyCertificateChain.implementation = function(asn1DerEncodedCertificateChain, authMethod) {
            console.log('[*] Bypassing OpenSSLSocketImpl Apache Harmony');
        };
        console.log('[+] OpenSSLSocketImpl Apache Harmony');
    } catch (err) {
        console.log('[!] OpenSSLSocketImpl Apache Harmony');
    }
    try {
        const phonegap_Activity = Java.use('nl.xservices.plugins.sslCertificateChecker');
        phonegap_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(a, b, c) {
            console.log('[*] Bypassing PhoneGap sslCertificateChecker: ' + a);
            return true;
        };
        console.log('[+] PhoneGap sslCertificateChecker');
    } catch (err) {
        console.log('[!] PhoneGap sslCertificateChecker');
    }
    try {
        const WLClient_Activity_1 = Java.use('com.worklight.wlclient.api.WLClient');
        WLClient_Activity_1.getInstance().pinTrustedCertificatePublicKey.overload('java.lang.String').implementation = function(cert) {
            console.log('[*] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey (string): ' + cert);
            return;
        };
        console.log('[+] IBM MobileFirst pinTrustedCertificatePublicKey (string)');
    } catch (err) {
        console.log('[!] IBM MobileFirst pinTrustedCertificatePublicKey (string)');
    }
    try {
        const WLClient_Activity_2 = Java.use('com.worklight.wlclient.api.WLClient');
        WLClient_Activity_2.getInstance().pinTrustedCertificatePublicKey.overload('[Ljava.lang.String;').implementation = function(cert) {
            console.log('[*] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey (string array): ' + cert);
            return;
        };
        console.log('[+] IBM MobileFirst pinTrustedCertificatePublicKey (string array)');
    } catch (err) {
        console.log('[!] IBM MobileFirst pinTrustedCertificatePublicKey (string array)');
    }
    try {
        const worklight_Activity_1 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
        worklight_Activity_1.verify.overload('java.lang.String', 'javax.net.ssl.SSLSocket').implementation = function(a, b) {
            console.log('[*] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning (SSLSocket): ' + a);
            return;
        };
        console.log('[+] IBM WorkLight HostNameVerifierWithCertificatePinning (SSLSocket)');
    } catch (err) {
        console.log('[!] IBM WorkLight HostNameVerifierWithCertificatePinning (SSLSocket)');
    }
    try {
        const worklight_Activity_2 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
        worklight_Activity_2.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
            console.log('[*] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning (cert): ' + a);
            return;
        };
        console.log('[+] IBM WorkLight HostNameVerifierWithCertificatePinning (cert)');
    } catch (err) {
        console.log('[!] IBM WorkLight HostNameVerifierWithCertificatePinning (cert)');
    }
    try {
        const worklight_Activity_3 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
        worklight_Activity_3.verify.overload('java.lang.String', '[Ljava.lang.String;', '[Ljava.lang.String;').implementation = function(a, b) {
            console.log('[*] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning (string string): ' + a);
            return;
        };
        console.log('[+] IBM WorkLight HostNameVerifierWithCertificatePinning (string string)');
    } catch (err) {
        console.log('[!] IBM WorkLight HostNameVerifierWithCertificatePinning (string string)');
    }
    try {
        const worklight_Activity_4 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
        worklight_Activity_4.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
            console.log('[*] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning (SSLSession): ' + a);
            return true;
        };
        console.log('[+] IBM WorkLight HostNameVerifierWithCertificatePinning (SSLSession)');
    } catch (err) {
        console.log('[!] IBM WorkLight HostNameVerifierWithCertificatePinning (SSLSession)');
    }
    try {
        const conscrypt_CertPinManager_Activity = Java.use('com.android.org.conscrypt.CertPinManager');
        conscrypt_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
            console.log('[*] Bypassing Conscrypt CertPinManager: ' + a);
            return true;
        };
        console.log('[+] Conscrypt CertPinManager');
    } catch (err) {
        console.log('[!] Conscrypt CertPinManager');
    }
    try {
        const cwac_CertPinManager_Activity = Java.use('com.commonsware.cwac.netsecurity.conscrypt.CertPinManager');
        cwac_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
            console.log('[*] Bypassing CWAC-Netsecurity CertPinManager: ' + a);
            return true;
        };
        console.log('[+] CWAC-Netsecurity CertPinManager');
    } catch (err) {
        console.log('[!] CWAC-Netsecurity CertPinManager');
    }
    try {
        const androidgap_WLCertificatePinningPlugin_Activity = Java.use('com.worklight.androidgap.plugin.WLCertificatePinningPlugin');
        androidgap_WLCertificatePinningPlugin_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(a, b, c) {
            console.log('[*] Bypassing Worklight Androidgap WLCertificatePinningPlugin: ' + a);
            return true;
        };
        console.log('[+] Worklight Androidgap WLCertificatePinningPlugin');
    } catch (err) {
        console.log('[!] Worklight Androidgap WLCertificatePinningPlugin');
    }
    try {
        const netty_FingerprintTrustManagerFactory = Java.use('io.netty.handler.ssl.util.FingerprintTrustManagerFactory');
        netty_FingerprintTrustManagerFactory.checkTrusted.implementation = function(type, chain) {
            console.log('[*] Bypassing Netty FingerprintTrustManagerFactory');
        };
        console.log('[+] Netty FingerprintTrustManagerFactory');
    } catch (err) {
        console.log('[!] Netty FingerprintTrustManagerFactory');
    }
    try {
        const Squareup_CertificatePinner_Activity_1 = Java.use('com.squareup.okhttp.CertificatePinner');
        Squareup_CertificatePinner_Activity_1.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(a, b) {
            console.log('[*] Bypassing Squareup CertificatePinner (cert): ' + a);
            return;
        };
        console.log('[+] Squareup CertificatePinner (cert)');
    } catch (err) {
        console.log('[!] Squareup CertificatePinner (cert)');
    }
    try {
        const Squareup_CertificatePinner_Activity_2 = Java.use('com.squareup.okhttp.CertificatePinner');
        Squareup_CertificatePinner_Activity_2.check.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
            console.log('[*] Bypassing Squareup CertificatePinner (list): ' + a);
            return null;
        };
        console.log('[+] Squareup CertificatePinner (list)');
    } catch (err) {
        console.log('[!] Squareup CertificatePinner (list)');
    }
    try {
        const Squareup_OkHostnameVerifier_Activity_1 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
        Squareup_OkHostnameVerifier_Activity_1.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
            console.log('[*] Bypassing Squareup OkHostnameVerifier (cert): ' + a);
            return true;
        };
        console.log('[+] Squareup OkHostnameVerifier (cert)');
    } catch (err) {
        console.log('[!] Squareup OkHostnameVerifier (cert)');
    }
    try {
        const Squareup_OkHostnameVerifier_Activity_2 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
        Squareup_OkHostnameVerifier_Activity_2.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
            console.log('[*] Bypassing Squareup OkHostnameVerifier (SSLSession): ' + a);
            return true;
        };
        console.log('[+] Squareup OkHostnameVerifier (SSLSession)');
    } catch (err) {
        console.log('[!] Squareup OkHostnameVerifier (SSLSession)');
    }
    try {
        const AndroidWebViewClient_Activity_1 = Java.use('android.webkit.WebViewClient');
        AndroidWebViewClient_Activity_1.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
            console.log('[*] Bypassing Android WebViewClient (SslErrorHandler)');
        };
        console.log('[+] Android WebViewClient (SslErrorHandler)');
    } catch (err) {
        console.log('[!] Android WebViewClient (SslErrorHandler)');
    }
    try {
        const AndroidWebViewClient_Activity_2 = Java.use('android.webkit.WebViewClient');
        AndroidWebViewClient_Activity_2.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.WebResourceRequest', 'android.webkit.WebResourceError').implementation = function(obj1, obj2, obj3) {
            console.log('[*] Bypassing Android WebViewClient (WebResourceError)');
        };
        console.log('[+] Android WebViewClient (WebResourceError)');
    } catch (err) {
        console.log('[!] Android WebViewClient (WebResourceError)');
    }
    try {
        const CordovaWebViewClient_Activity = Java.use('org.apache.cordova.CordovaWebViewClient');
        CordovaWebViewClient_Activity.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
            console.log('[*] Bypassing Apache Cordova WebViewClient');
            obj3.proceed();
        };
    } catch (err) {
        console.log('[!] Apache Cordova WebViewClient');
    }
    try {
        const boye_AbstractVerifier = Java.use('ch.boye.httpclientandroidlib.conn.ssl.AbstractVerifier');
        boye_AbstractVerifier.verify.implementation = function(host, ssl) {
            console.log('[*] Bypassing Boye AbstractVerifier: ' + host);
        };
    } catch (err) {
        console.log('[!] Boye AbstractVerifier');
    }
}

function dynamicPatching() {
    var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
    var SSLContext = Java.use('javax.net.ssl.SSLContext');
    var TrustManager = Java.registerClass({
        name: 'incogbyte.bypass.test.TrustManager',
        implements: [X509TrustManager],
        methods: {
            checkClientTrusted: function(chain, authType) {},
            checkServerTrusted: function(chain, authType) {},
            getAcceptedIssuers: function() {
                return [];
            }
        }
    });
    try {
        var okhttp3_Activity_1 = Java.use('okhttp3.CertificatePinner');
        okhttp3_Activity_1.check.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
            console.log('[+] Bypassing OkHTTPv3 {1}: ' + a);
            return;
        };
    } catch (err) {
        console.log('[-] OkHTTPv3 {1} pinner not found');
    }
    try {
        var okhttp3_Activity_2 = Java.use('okhttp3.CertificatePinner');
        okhttp3_Activity_2.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(a, b) {
            console.log('[+] Bypassing OkHTTPv3 {2}: ' + a);
            return;
        };
    } catch (err) {
        console.log('[-] OkHTTPv3 {2} pinner not found');
    }
    try {
        var okhttp3_Activity_3 = Java.use('okhttp3.CertificatePinner');
        okhttp3_Activity_3.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function(a, b) {
            console.log('[+] Bypassing OkHTTPv3 {3}: ' + a);
            return;
        };
    } catch (err) {
        console.log('[-] OkHTTPv3 {3} pinner not found');
    }
    try {
        var okhttp3_Activity_4 = Java.use('okhttp3.CertificatePinner');
        okhttp3_Activity_4.check$okhttp.overload('java.lang.String', 'kotlin.jvm.functions.Function0').implementation = function(a, b) {
            console.log('[+] Bypassing OkHTTPv3 {4}: ' + a);
            return;
        };
    } catch (err) {
        console.log('[-] OkHTTPv3 {4} pinner not found');
    }
    try {
        var trustkit_Activity_1 = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
        trustkit_Activity_1.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
            console.log('[+] Bypassing Trustkit {1}: ' + a);
            return true;
        };
    } catch (err) {
        console.log('[-] Trustkit {1} pinner not found');
    }
    try {
        var trustkit_Activity_2 = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
        trustkit_Activity_2.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
            console.log('[+] Bypassing Trustkit {2}: ' + a);
            return true;
        };
    } catch (err) {
        console.log('[-] Trustkit {2} pinner not found');
    }
    try {
        var trustkit_PinningTrustManager = Java.use('com.datatheorem.android.trustkit.pinning.PinningTrustManager');
        trustkit_PinningTrustManager.checkServerTrusted.overload('[Ljava.security.cert.X509Certificate;', 'java.lang.String').implementation = function(chain, authType) {
            console.log('[+] Bypassing Trustkit {3}');
        };
    } catch (err) {
        console.log('[-] Trustkit {3} pinner not found');
    }
    try {
        var array_list = Java.use("java.util.ArrayList");
        var TrustManagerImpl_Activity_1 = Java.use('com.android.org.conscrypt.TrustManagerImpl');
        TrustManagerImpl_Activity_1.checkTrustedRecursive.implementation = function(certs, ocspData, tlsSctData, host, clientAuth, untrustedChain, trustAnchorChain, used) {
            console.log('[+] Bypassing TrustManagerImpl (Android > 7) checkTrustedRecursive check: ' + host);
            return array_list.$new();
        };
    } catch (err) {
        console.log('[-] TrustManagerImpl (Android > 7) checkTrustedRecursive check not found');
    }
    try {
        var TrustManagerImpl_Activity_2 = Java.use('com.android.org.conscrypt.TrustManagerImpl');
        TrustManagerImpl_Activity_2.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
            console.log('[+] Bypassing TrustManagerImpl (Android > 7) verifyChain check: ' + host);
            return untrustedChain;
        };
    } catch (err) {
        console.log('[-] TrustManagerImpl (Android > 7) verifyChain check not found');
    }
    try {
        var appcelerator_PinningTrustManager = Java.use('appcelerator.https.PinningTrustManager');
        appcelerator_PinningTrustManager.checkServerTrusted.implementation = function(chain, authType) {
            console.log('[+] Bypassing Appcelerator PinningTrustManager');
            return;
        };
    } catch (err) {
        console.log('[-] Appcelerator PinningTrustManager pinner not found');
    }
    try {
        var fabric_PinningTrustManager = Java.use('io.fabric.sdk.android.services.network.PinningTrustManager');
        fabric_PinningTrustManager.checkServerTrusted.implementation = function(chain, authType) {
            console.log('[+] Bypassing Fabric PinningTrustManager');
            return;
        };
    } catch (err) {
        console.log('[-] Fabric PinningTrustManager pinner not found');
    }
    try {
        var OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
        OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certRefs, JavaObject, authMethod) {
            console.log('[+] Bypassing OpenSSLSocketImpl Conscrypt {1}');
        };
    } catch (err) {
        console.log('[-] OpenSSLSocketImpl Conscrypt {1} pinner not found');
    }
    try {
        var OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
        OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certChain, authMethod) {
            console.log('[+] Bypassing OpenSSLSocketImpl Conscrypt {2}');
        };
    } catch (err) {
        console.log('[-] OpenSSLSocketImpl Conscrypt {2} pinner not found');
    }

    try {
        var OpenSSLEngineSocketImpl_Activity = Java.use('com.android.org.conscrypt.OpenSSLEngineSocketImpl');
        OpenSSLEngineSocketImpl_Activity.verifyCertificateChain.overload('[Ljava.lang.Long;', 'java.lang.String').implementation = function(a, b) {
            console.log('[+] Bypassing OpenSSLEngineSocketImpl Conscrypt: ' + b);
        };
    } catch (err) {
        console.log('[-] OpenSSLEngineSocketImpl Conscrypt pinner not found');
    }

    try {
        var OpenSSLSocketImpl_Harmony = Java.use('org.apache.harmony.xnet.provider.jsse.OpenSSLSocketImpl');
        OpenSSLSocketImpl_Harmony.verifyCertificateChain.implementation = function(asn1DerEncodedCertificateChain, authMethod) {
            console.log('[+] Bypassing OpenSSLSocketImpl Apache Harmony');
        };
    } catch (err) {
        console.log('[-] OpenSSLSocketImpl Apache Harmony pinner not found');
    }

    try {
        var phonegap_Activity = Java.use('nl.xservices.plugins.sslCertificateChecker');
        phonegap_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(a, b, c) {
            console.log('[+] Bypassing PhoneGap sslCertificateChecker: ' + a);
            return true;
        };
    } catch (err) {
        console.log('[-] PhoneGap sslCertificateChecker pinner not found');
    }

    try {
        var WLClient_Activity_1 = Java.use('com.worklight.wlclient.api.WLClient');
        WLClient_Activity_1.getInstance().pinTrustedCertificatePublicKey.overload('java.lang.String').implementation = function(cert) {
            console.log('[+] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey {1}: ' + cert);
            return;
        };
    } catch (err) {
        console.log('[-] IBM MobileFirst pinTrustedCertificatePublicKey {1} pinner not found');
    }
    try {
        var WLClient_Activity_2 = Java.use('com.worklight.wlclient.api.WLClient');
        WLClient_Activity_2.getInstance().pinTrustedCertificatePublicKey.overload('[Ljava.lang.String;').implementation = function(cert) {
            console.log('[+] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey {2}: ' + cert);
            return;
        };
    } catch (err) {
        console.log('[-] IBM MobileFirst pinTrustedCertificatePublicKey {2} pinner not found');
    }

    try {
        var worklight_Activity_1 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
        worklight_Activity_1.verify.overload('java.lang.String', 'javax.net.ssl.SSLSocket').implementation = function(a, b) {
            console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {1}: ' + a);
            return;
        };
    } catch (err) {
        console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {1} pinner not found');
    }
    try {
        var worklight_Activity_2 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
        worklight_Activity_2.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
            console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {2}: ' + a);
            return;
        };
    } catch (err) {
        console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {2} pinner not found');
    }
    try {
        var worklight_Activity_3 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
        worklight_Activity_3.verify.overload('java.lang.String', '[Ljava.lang.String;', '[Ljava.lang.String;').implementation = function(a, b) {
            console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {3}: ' + a);
            return;
        };
    } catch (err) {
        console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {3} pinner not found');
    }
    try {
        var worklight_Activity_4 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
        worklight_Activity_4.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
            console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {4}: ' + a);
            return true;
        };
    } catch (err) {
        console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {4} pinner not found');
    }

    try {
        var conscrypt_CertPinManager_Activity = Java.use('com.android.org.conscrypt.CertPinManager');
        conscrypt_CertPinManager_Activity.checkChainPinning.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
            console.log('[+] Bypassing Conscrypt CertPinManager: ' + a);
            return true;
        };
    } catch (err) {
        console.log('[-] Conscrypt CertPinManager pinner not found');
    }

    try {
        var legacy_conscrypt_CertPinManager_Activity = Java.use('com.android.org.conscrypt.CertPinManager');
        legacy_conscrypt_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
            console.log('[+] Bypassing Conscrypt CertPinManager (Legacy): ' + a);
            return true;
        };
    } catch (err) {
        console.log('[-] Conscrypt CertPinManager (Legacy) pinner not found');
    }

    try {
        var cwac_CertPinManager_Activity = Java.use('com.commonsware.cwac.netsecurity.conscrypt.CertPinManager');
        cwac_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
            console.log('[+] Bypassing CWAC-Netsecurity CertPinManager: ' + a);
            return true;
        };
    } catch (err) {
        console.log('[-] CWAC-Netsecurity CertPinManager pinner not found');
    }

    try {
        var androidgap_WLCertificatePinningPlugin_Activity = Java.use('com.worklight.androidgap.plugin.WLCertificatePinningPlugin');
        androidgap_WLCertificatePinningPlugin_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(a, b, c) {
            console.log('[+] Bypassing Worklight Androidgap WLCertificatePinningPlugin: ' + a);
            return true;
        };
    } catch (err) {
        console.log('[-] Worklight Androidgap WLCertificatePinningPlugin pinner not found');
    }

    try {
        var netty_FingerprintTrustManagerFactory = Java.use('io.netty.handler.ssl.util.FingerprintTrustManagerFactory');
        //var netty_FingerprintTrustManagerFactory = Java.use('org.jboss.netty.handler.ssl.util.FingerprintTrustManagerFactory');
        netty_FingerprintTrustManagerFactory.checkTrusted.implementation = function(type, chain) {
            console.log('[+] Bypassing Netty FingerprintTrustManagerFactory');
        };
    } catch (err) {
        console.log('[-] Netty FingerprintTrustManagerFactory pinner not found');
    }

    try {
        var Squareup_CertificatePinner_Activity_1 = Java.use('com.squareup.okhttp.CertificatePinner');
        Squareup_CertificatePinner_Activity_1.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(a, b) {
            console.log('[+] Bypassing Squareup CertificatePinner {1}: ' + a);
            return;
        };
    } catch (err) {
        console.log('[-] Squareup CertificatePinner {1} pinner not found');
    }
    try {
        var Squareup_CertificatePinner_Activity_2 = Java.use('com.squareup.okhttp.CertificatePinner');
        Squareup_CertificatePinner_Activity_2.check.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
            console.log('[+] Bypassing Squareup CertificatePinner {2}: ' + a);
            return;
        };
    } catch (err) {
        console.log('[-] Squareup CertificatePinner {2} pinner not found');
    }

    try {
        var Squareup_OkHostnameVerifier_Activity_1 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
        Squareup_OkHostnameVerifier_Activity_1.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
            console.log('[+] Bypassing Squareup OkHostnameVerifier {1}: ' + a);
            return true;
        };
    } catch (err) {
        console.log('[-] Squareup OkHostnameVerifier check not found');
    }
    try {
        var Squareup_OkHostnameVerifier_Activity_2 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
        Squareup_OkHostnameVerifier_Activity_2.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
            console.log('[+] Bypassing Squareup OkHostnameVerifier {2}: ' + a);
            return true;
        };
    } catch (err) {
        console.log('[-] Squareup OkHostnameVerifier check not found');
    }

    try {
        var AndroidWebViewClient_Activity_1 = Java.use('android.webkit.WebViewClient');
        AndroidWebViewClient_Activity_1.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
            console.log('[+] Bypassing Android WebViewClient check {1}');
        };
    } catch (err) {
        console.log('[-] Android WebViewClient {1} check not found');
    }
    try {
        var AndroidWebViewClient_Activity_2 = Java.use('android.webkit.WebViewClient');
        AndroidWebViewClient_Activity_2.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.WebResourceRequest', 'android.webkit.WebResourceError').implementation = function(obj1, obj2, obj3) {
            console.log('[+] Bypassing Android WebViewClient check {2}');
        };
    } catch (err) {
        console.log('[-] Android WebViewClient {2} check not found');
    }
    try {
        var AndroidWebViewClient_Activity_3 = Java.use('android.webkit.WebViewClient');
        AndroidWebViewClient_Activity_3.onReceivedError.overload('android.webkit.WebView', 'int', 'java.lang.String', 'java.lang.String').implementation = function(obj1, obj2, obj3, obj4) {
            console.log('[+] Bypassing Android WebViewClient check {3}');
        };
    } catch (err) {
        console.log('[-] Android WebViewClient {3} check not found');
    }
    try {
        var AndroidWebViewClient_Activity_4 = Java.use('android.webkit.WebViewClient');
        AndroidWebViewClient_Activity_4.onReceivedError.overload('android.webkit.WebView', 'android.webkit.WebResourceRequest', 'android.webkit.WebResourceError').implementation = function(obj1, obj2, obj3) {
            console.log('[+] Bypassing Android WebViewClient check {4}');
        };
    } catch (err) {
        console.log('[-] Android WebViewClient {4} check not found');
    }

    try {
        var CordovaWebViewClient_Activity = Java.use('org.apache.cordova.CordovaWebViewClient');
        CordovaWebViewClient_Activity.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
            console.log('[+] Bypassing Apache Cordova WebViewClient check');
            obj3.proceed();
        };
    } catch (err) {
        console.log('[-] Apache Cordova WebViewClient check not found');
    }

    try {
        var boye_AbstractVerifier = Java.use('ch.boye.httpclientandroidlib.conn.ssl.AbstractVerifier');
        boye_AbstractVerifier.verify.implementation = function(host, ssl) {
            console.log('[+] Bypassing Boye AbstractVerifier check: ' + host);
        };
    } catch (err) {
        console.log('[-] Boye AbstractVerifier check not found');
    }

    try {
        var apache_AbstractVerifier = Java.use('org.apache.http.conn.ssl.AbstractVerifier');
        apache_AbstractVerifier.verify.implementation = function(a, b, c, d) {
            console.log('[+] Bypassing Apache AbstractVerifier check: ' + a);
            return;
        };
    } catch (err) {
        console.log('[-] Apache AbstractVerifier check not found');
    }

    try {
        var CronetEngineBuilderImpl_Activity = Java.use("org.chromium.net.impl.CronetEngineBuilderImpl");
        CronetEngine_Activity.enablePublicKeyPinningBypassForLocalTrustAnchors.overload('boolean').implementation = function(a) {
            console.log("[+] Disabling Public Key pinning for local trust anchors in Chromium Cronet");
            var cronet_obj_1 = CronetEngine_Activity.enablePublicKeyPinningBypassForLocalTrustAnchors.call(this, true);
            return cronet_obj_1;
        };
        CronetEngine_Activity.addPublicKeyPins.overload('java.lang.String', 'java.util.Set', 'boolean', 'java.util.Date').implementation = function(hostName, pinsSha256, includeSubdomains, expirationDate) {
            console.log("[+] Bypassing Chromium Cronet pinner: " + hostName);
            var cronet_obj_2 = CronetEngine_Activity.addPublicKeyPins.call(this, hostName, pinsSha256, includeSubdomains, expirationDate);
            return cronet_obj_2;
        };
    } catch (err) {
        console.log('[-] Chromium Cronet pinner not found')
    }

    try {
        var HttpCertificatePinning_Activity = Java.use('diefferson.http_certificate_pinning.HttpCertificatePinning');
        HttpCertificatePinning_Activity.checkConnexion.overload("java.lang.String", "java.util.List", "java.util.Map", "int", "java.lang.String").implementation = function(a, b, c, d, e) {
            console.log('[+] Bypassing Flutter HttpCertificatePinning : ' + a);
            return true;
        };
    } catch (err) {
        console.log('[-] Flutter HttpCertificatePinning pinner not found');
    }
    try {
        var SslPinningPlugin_Activity = Java.use('com.macif.plugin.sslpinningplugin.SslPinningPlugin');
        SslPinningPlugin_Activity.checkConnexion.overload("java.lang.String", "java.util.List", "java.util.Map", "int", "java.lang.String").implementation = function(a, b, c, d, e) {
            console.log('[+] Bypassing Flutter SslPinningPlugin: ' + a);
            return true;
        };
    } catch (err) {
        console.log('[-] Flutter SslPinningPlugin pinner not found');
    }

    function rudimentaryFix(typeName) {
        if (typeName === undefined) {
            return;
        } else if (typeName === 'boolean') {
            return true;
        } else {
            return null;
        }
    }
    try {
        var UnverifiedCertError = Java.use('javax.net.ssl.SSLPeerUnverifiedException');
        UnverifiedCertError.$init.implementation = function(str) {
            console.log('[!] Unexpected SSLPeerUnverifiedException occurred, trying to patch it dynamically...!');
            try {
                var stackTrace = Java.use('java.lang.Thread').currentThread().getStackTrace();
                var exceptionStackIndex = stackTrace.findIndex(stack => stack.getClassName() === "javax.net.ssl.SSLPeerUnverifiedException");
                var callingFunctionStack = stackTrace[exceptionStackIndex + 1];
                var className = callingFunctionStack.getClassName();
                var methodName = callingFunctionStack.getMethodName();
                var callingClass = Java.use(className);
                var callingMethod = callingClass[methodName];
                console.log('[!] Attempting to bypass uncommon SSL Pinning method on: ' + className + '.' + methodName + '!');
                if (callingMethod.implementation) {
                    return;
                }
                var returnTypeName = callingMethod.returnType.type;
                callingMethod.implementation = function() {
                    rudimentaryFix(returnTypeName);
                };
            } catch (e) {
                if (String(e).includes(".overload")) {
                    var splittedList = String(e).split(".overload");
                    for (let i = 2; i < splittedList.length; i++) {
                        var extractedOverload = splittedList[i].trim().split("(")[1].slice(0, -1).replaceAll("'", "");
                        if (extractedOverload.includes(",")) {
                            var argList = extractedOverload.split(", ");
                            console.log('[!] Attempting overload of ' + className + '.' + methodName + ' with arguments: ' + extractedOverload + '!');
                            if (argList.length == 2) {
                                callingMethod.overload(argList[0], argList[1]).implementation = function(a, b) {
                                    rudimentaryFix(returnTypeName);
                                }
                            } else if (argNum == 3) {
                                callingMethod.overload(argList[0], argList[1], argList[2]).implementation = function(a, b, c) {
                                    rudimentaryFix(returnTypeName);
                                }
                            } else if (argNum == 4) {
                                callingMethod.overload(argList[0], argList[1], argList[2], argList[3]).implementation = function(a, b, c, d) {
                                    rudimentaryFix(returnTypeName);
                                }
                            } else if (argNum == 5) {
                                callingMethod.overload(argList[0], argList[1], argList[2], argList[3], argList[4]).implementation = function(a, b, c, d, e) {
                                    rudimentaryFix(returnTypeName);
                                }
                            } else if (argNum == 6) {
                                callingMethod.overload(argList[0], argList[1], argList[2], argList[3], argList[4], argList[5]).implementation = function(a, b, c, d, e, f) {
                                    rudimentaryFix(returnTypeName);
                                }
                            }
                        } else {
                            callingMethod.overload(extractedOverload).implementation = function(a) {
                                rudimentaryFix(returnTypeName);
                            }
                        }
                    }
                } else {
                    console.log('[-] Failed to dynamically patch SSLPeerUnverifiedException ' + e + '!');
                }
            }
            return this.$init(str);
        };
    } catch (err) {}
}

/**
 * Main function
 */

setTimeout(function() {
    Java.perform(function() {
        var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
        var SSLContext = Java.use('javax.net.ssl.SSLContext');
        var TrustManager = Java.registerClass({
            name: 'incogbyte.bypass.test.TrustManager',
            implements: [X509TrustManager],
            methods: {
                checkClientTrusted: function(chain, authType) {},
                checkServerTrusted: function(chain, authType) {},
                getAcceptedIssuers: function() {
                    return [];
                }
            }
        });

        console.log("[*] Flutter testing");
        setTimeout(disablePinning, 1000);
        disableFlutterPinningv2();
        console.log("[*] Dynamic patching");
        dynamicPatching();
        console.log("[*] CommonMethods");
        CommonMethods();
        console.log("[*] Testing OKHTTP methods");

        try {
            var okhttp3_Activity = Java.use('okhttp3.CertificatePinner');
            okhttp3_Activity.check.overload('java.lang.String', 'java.util.List').implementation = function(str) {
                console.log('[+] Bypassing OkHTTPv3 {1}: ' + str);
                return true;
            };
            okhttp3_Activity.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(str) {
                console.log('[+] Bypassing OkHTTPv3 {2}: ' + str);
                return true;
            };
        } catch (err) {
            console.log('[-] OkHTTPv3 pinner not found');
        }
        try {
            var trustkit_Activity = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
            trustkit_Activity.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(str) {
                console.log('[+] Bypassing Trustkit {1}: ' + str);
                return true;
            };
            trustkit_Activity.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(str) {
                console.log('[+] Bypassing Trustkit {2}: ' + str);
                return true;
            };
            var trustkit_PinningTrustManager = Java.use('com.datatheorem.android.trustkit.pinning.PinningTrustManager');
            trustkit_PinningTrustManager.checkServerTrusted.implementation = function() {
                console.log('[+] Bypassing Trustkit {3}');
            };
        } catch (err) {
            console.log('[-] Trustkit pinner not found');
        }
        try {
            var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
            TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
                console.log('[+] Bypassing TrustManagerImpl (Android > 7): ' + host);
                return untrustedChain;
            };
        } catch (err) {
            console.log('[-] TrustManagerImpl (Android > 7) pinner not found');
        }
        try {
            var appcelerator_PinningTrustManager = Java.use('appcelerator.https.PinningTrustManager');
            appcelerator_PinningTrustManager.checkServerTrusted.implementation = function() {
                console.log('[+] Bypassing Appcelerator PinningTrustManager');
            };
        } catch (err) {
            console.log('[-] Appcelerator PinningTrustManager pinner not found');
        }
        try {
            var OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
            OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certRefs, JavaObject, authMethod) {
                console.log('[+] Bypassing OpenSSLSocketImpl Conscrypt');
            };
        } catch (err) {
            console.log('[-] OpenSSLSocketImpl Conscrypt pinner not found');
        }
        try {
            var OpenSSLEngineSocketImpl_Activity = Java.use('com.android.org.conscrypt.OpenSSLEngineSocketImpl');
            OpenSSLSocketImpl_Activity.verifyCertificateChain.overload('[Ljava.lang.Long;', 'java.lang.String').implementation = function(str1, str2) {
                console.log('[+] Bypassing OpenSSLEngineSocketImpl Conscrypt: ' + str2);
            };
        } catch (err) {
            console.log('[-] OpenSSLEngineSocketImpl Conscrypt pinner not found');
        }
        try {
            var OpenSSLSocketImpl_Harmony = Java.use('org.apache.harmony.xnet.provider.jsse.OpenSSLSocketImpl');
            OpenSSLSocketImpl_Harmony.verifyCertificateChain.implementation = function(asn1DerEncodedCertificateChain, authMethod) {
                console.log('[+] Bypassing OpenSSLSocketImpl Apache Harmony');
            };
        } catch (err) {
            console.log('[-] OpenSSLSocketImpl Apache Harmony pinner not found');
        }
        try {
            var phonegap_Activity = Java.use('nl.xservices.plugins.sslCertificateChecker');
            phonegap_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(str) {
                console.log('[+] Bypassing PhoneGap sslCertificateChecker: ' + str);
                return true;
            };
        } catch (err) {
            console.log('[-] PhoneGap sslCertificateChecker pinner not found');
        }
        try {
            var WLClient_Activity = Java.use('com.worklight.wlclient.api.WLClient');
            WLClient_Activity.getInstance().pinTrustedCertificatePublicKey.overload('java.lang.String').implementation = function(cert) {
                console.log('[+] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey {1}: ' + cert);
                return;
            };
            WLClient_Activity.getInstance().pinTrustedCertificatePublicKey.overload('[Ljava.lang.String;').implementation = function(cert) {
                console.log('[+] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey {2}: ' + cert);
                return;
            };
        } catch (err) {
            console.log('[-] IBM MobileFirst pinTrustedCertificatePublicKey pinner not found');
        }
        try {
            var worklight_Activity = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
            worklight_Activity.verify.overload('java.lang.String', 'javax.net.ssl.SSLSocket').implementation = function(str) {
                console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {1}: ' + str);
                return;
            };
            worklight_Activity.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(str) {
                console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {2}: ' + str);
                return;
            };
            worklight_Activity.verify.overload('java.lang.String', '[Ljava.lang.String;', '[Ljava.lang.String;').implementation = function(str) {
                console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {3}: ' + str);
                return;
            };
            worklight_Activity.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(str) {
                console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {4}: ' + str);
                return true;
            };
        } catch (err) {
            console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning pinner not found');
        }
        try {
            var conscrypt_CertPinManager_Activity = Java.use('com.android.org.conscrypt.CertPinManager');
            conscrypt_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function(str) {
                console.log('[+] Bypassing Conscrypt CertPinManager: ' + str);
                return true;
            };
        } catch (err) {
            console.log('[-] Conscrypt CertPinManager pinner not found');
        }
        try {
            var cwac_CertPinManager_Activity = Java.use('com.commonsware.cwac.netsecurity.conscrypt.CertPinManager');
            cwac_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function(str) {
                console.log('[+] Bypassing CWAC-Netsecurity CertPinManager: ' + str);
                return true;
            };
        } catch (err) {
            console.log('[-] CWAC-Netsecurity CertPinManager pinner not found');
        }
        try {
            var androidgap_WLCertificatePinningPlugin_Activity = Java.use('com.worklight.androidgap.plugin.WLCertificatePinningPlugin');
            androidgap_WLCertificatePinningPlugin_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(str) {
                console.log('[+] Bypassing Worklight Androidgap WLCertificatePinningPlugin: ' + str);
                return true;
            };
        } catch (err) {
            console.log('[-] Worklight Androidgap WLCertificatePinningPlugin pinner not found');
        }
        try {
            var Squareup_CertificatePinner_Activity = Java.use('com.squareup.okhttp.CertificatePinner');
            Squareup_CertificatePinner_Activity.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(str1, str2) {
                console.log('[+] Bypassing Squareup CertificatePinner {1}: ' + str1);
                return;
            };
            Squareup_CertificatePinner_Activity.check.overload('java.lang.String', 'java.util.List').implementation = function(str1, str2) {
                console.log('[+] Bypassing Squareup CertificatePinner {2}: ' + str1);
                return;
            };
        } catch (err) {
            console.log('[-] Squareup CertificatePinner pinner not found');
        }
        try {
            var Squareup_OkHostnameVerifier_Activity = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
            Squareup_OkHostnameVerifier_Activity.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(str1, str2) {
                console.log('[+] Bypassing Squareup OkHostnameVerifier {1}: ' + str1);
                return true;
            };
            Squareup_OkHostnameVerifier_Activity.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(str1, str2) {
                console.log('[+] Bypassing Squareup OkHostnameVerifier {2}: ' + str1);
                return true;
            };
        } catch (err) {
            console.log('[-] Squareup OkHostnameVerifier pinner not found');
        }
        try {
            var AndroidWebViewClient_Activity = Java.use('android.webkit.WebViewClient');
            AndroidWebViewClient_Activity.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
                console.log('[+] Bypassing Android WebViewClient');
            };
        } catch (err) {
            console.log('[-] Android WebViewClient pinner not found');
        }
        try {
            var CordovaWebViewClient_Activity = Java.use('org.apache.cordova.CordovaWebViewClient');
            CordovaWebViewClient_Activity.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
                console.log('[+] Bypassing Apache Cordova WebViewClient');
                obj3.proceed();
            };
        } catch (err) {
            console.log('[-] Apache Cordova WebViewClient pinner not found');
        }
        try {
            var boye_AbstractVerifier = Java.use('ch.boye.httpclientandroidlib.conn.ssl.AbstractVerifier');
            boye_AbstractVerifier.verify.implementation = function(host, ssl) {
                console.log('[+] Bypassing Boye AbstractVerifier: ' + host);
            };
        } catch (err) {
            console.log('[-] Boye AbstractVerifier pinner not found');
        }

        // Android 7+ TrustManagerImpl
        var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
        try {
            TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
                console.log("[+] TrustManagerImpl verifyChain called");
                // Skip all the logic and just return the chain again :P
                // https://www.nccgroup.trust/uk/about-us/newsroom-and-events/blogs/2017/november/bypassing-androids-network-security-configuration/
                // https://github.com/google/conscrypt/blob/c88f9f55a523f128f0e4dace76a34724bfa1e88c/platform/src/main/java/org/conscrypt/TrustManagerImpl.java#L650
                return untrustedChain;
            }
        } catch (e) {
            console.log("[-] TrustManagerImpl verifyChain nout found below 7.0");
        }
        // OpenSSLSocketImpl
        try {
            var OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
            OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certRefs, authMethod) {
                console.log('    OpenSSLSocketImpl.verifyCertificateChain');
            }

            console.log('[+] OpenSSLSocketImpl pinning')
        } catch (err) {
            console.log('[-] OpenSSLSocketImpl pinner not found');
        }
        // Trustkit
        try {
            var Activity = Java.use("com.datatheorem.android.trustkit.pinning.OkHostnameVerifier");
            Activity.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(str) {
                console.log('    Trustkit.verify1: ' + str);
                return true;
            };
            Activity.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(str) {
                console.log('    Trustkit.verify2: ' + str);
                return true;
            };

            console.log('[+] Trustkit pinning')
        } catch (err) {
            console.log('[-] Trustkit pinner not found')
        }

        // Cronet pinner hook
        // Weibo don't invoke
        try {
            var netBuilder = Java.use("org.chromium.net.CronetEngine$Builder");

            // https://developer.android.com/guide/topics/connectivity/cronet/reference/org/chromium/net/CronetEngine.Builder.html#enablePublicKeyPinningBypassForLocalTrustAnchors(boolean)
            netBuilder.enablePublicKeyPinningBypassForLocalTrustAnchors.implementation = function(arg) {
                // Weibo not invoke
                console.log("    Enables or disables public key pinning bypass for local trust anchors = " + arg);
                // True to enable the bypass, false to disable.
                var ret = netBuilder.enablePublicKeyPinningBypassForLocalTrustAnchors.call(this, true);
                return ret;
            };

            netBuilder.addPublicKeyPins.implementation = function(hostName, pinsSha256, includeSubdomains, expirationDate) {
                console.log("[+] Сronet addPublicKeyPins hostName = " + hostName);
                return this;
            };

        } catch (err) {
            console.log('[-] Cronet pinner not found')
        }
    });
}, 0);

Java.perform(function () {
// Invalidate the certificate pinner set up
    var OkHttpClient = Java.use("com.squareup.okhttp.OkHttpClient");
    OkHttpClient.setCertificatePinner.implementation = function(certificatePinner){
        // do nothing
    console.log("Called!");
    return this;
    };

    // Invalidate the certificate pinnet checks (if "setCertificatePinner" was called before the previous invalidation)
    var CertificatePinner = Java.use("com.squareup.okhttp.CertificatePinner");
    CertificatePinner.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function(p0, p1){
        // do nothing
        console.log("Called! [Certificate]");
        return;
    };
    CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function(p0, p1){
        // do nothing
        console.log("Called! [List]");
        return;
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:757465858 @acsayson/rootandpinning
