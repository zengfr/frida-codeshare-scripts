
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1540905876 @limyout/test
Java.perform(function() {
    var RootPackages = ["com.noshufou.android.su", "com.noshufou.android.su.elite", "eu.chainfire.supersu",
        "com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su", "com.koushikdutta.rommanager",
        "com.koushikdutta.rommanager.license", "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch",
        "com.ramdroid.appquarantine", "com.ramdroid.appquarantinepro", "com.devadvance.rootcloak", "com.devadvance.rootcloakplus",
        "de.robv.android.xposed.installer", "com.saurik.substrate", "com.zachspong.temprootremovejb", "com.amphoras.hidemyroot",
        "com.amphoras.hidemyrootadfree", "com.formyhm.hiderootPremium", "com.formyhm.hideroot", "me.phh.superuser",
        "eu.chainfire.supersu.pro", "com.kingouser.com"
    ];

    var RootBinaries = ["su", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk"];

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

    PackageManager.getPackageInfo.implementation = function(pname, flags) {
        var shouldFakePackage = (RootPackages.indexOf(pname) > -1);
        if (shouldFakePackage) {
            send("Bypass root check for package: " + pname);
            pname = "set.package.name.to.a.fake.one.so.we.can.bypass.it";
        }
        return this.getPackageInfo.call(this, pname, flags);
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

})

 
function SSLContext()
{
    var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
    var SSLContext = Java.use('javax.net.ssl.SSLContext');

    // build fake trust manager
    var TrustManager = Java.registerClass({
        name: 'com.sensepost.test.TrustManager',
        implements: [X509TrustManager],
        methods: {
            checkClientTrusted: function (chain, authType) {
            },
            checkServerTrusted: function (chain, authType) {
            },
            getAcceptedIssuers: function () {
                return [];
            }
        }
    });

    // pass our own custom trust manager through when requested
    var TrustManagers = [TrustManager.$new()];
    var SSLContext_init = SSLContext.init.overload(
        '[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom'
    );
    SSLContext_init.implementation = function (keyManager, trustManager, secureRandom) {
        console.log('! Intercepted trustmanager request');
        SSLContext_init.call(this, keyManager, TrustManagers, secureRandom);
    };

    console.log('* Setup custom trust manager');
}
    
function okhttp3()
{
    try {
        var CertificatePinner = Java.use('okhttp3.CertificatePinner');
        CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function (str) {
            console.log('! Intercepted okhttp3: ' + str);
            return;
        };

        console.log('* Setup okhttp3 pinning')
    } catch(err) {
        console.log('* Unable to hook into okhttp3 pinner')
    }

}


function TrustManagerImpl()
{
    try {
        var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
        TrustManagerImpl.verifyChain.implementation = function (untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
            console.log('! Intercepted TrustManagerImp: ' + host);
            return untrustedChain;
        }
      
      var ArrayList = Java.use("java.util.ArrayList");
      TrustManagerImpl.checkTrustedRecursive.implementation = function(certs, host, clientAuth, untrustedChain,
        trustAnchorChain, used) {
        console.log("[+] Bypassing TrustManagerImpl->checkTrustedRecursive()");
        return ArrayList.$new();
    };

        console.log('* Setup TrustManagerImpl pinning')
    } catch (err) {
        console.log('* Unable to hook into TrustManagerImpl')
    }

}


Java.perform(function () {
    console.log("");
    console.log("[*] Universal SSL Bypass");
    console.log("[1] javax.net.ssl.SSLContext.init()");
    console.log("[2] okhttp3.CertificatePinner.check()")
    console.log("[3] com.android.org.conscrypt.TrustManagerImpl.verifyChain()");
    console.log("");

    //TODO: TrustManagerImpl.checkTrustedRecursive()

    SSLContext();
    okhttp3();
    TrustManagerImpl();

});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1540905876 @limyout/test
