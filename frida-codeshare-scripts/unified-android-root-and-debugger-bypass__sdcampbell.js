
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-121296146 @sdcampbell/unified-android-root-and-debugger-bypass
/*
 * Combined Root Detection and Debugger Check Bypass Script
 * This script combines functionality to bypass both root detection and debugging checks
 */

// Initialize root detection related arrays and objects
var RootPackages = ["com.noshufou.android.su", "com.noshufou.android.su.elite", "eu.chainfire.supersu",
    "com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su", "com.koushikdutta.rommanager",
    "com.koushikdutta.rommanager.license", "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch",
    "com.ramdroid.appquarantine", "com.ramdroid.appquarantinepro", "com.devadvance.rootcloak", "com.devadvance.rootcloakplus",
    "de.robv.android.xposed.installer", "com.saurik.substrate", "com.zachspong.temprootremovejb", "com.amphoras.hidemyroot",
    "com.amphoras.hidemyrootadfree", "com.formyhm.hiderootPremium", "com.formyhm.hideroot", "me.phh.superuser",
    "eu.chainfire.supersu.pro", "com.kingouser.com"
];

var RootBinaries = ["mu", ".su", "su", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk"];
var RootProperties = {
    "ro.build.selinux": "1",
    "ro.debuggable": "0",
    "service.adb.root": "0",
    "ro.secure": "1"
};
var RootPropertiesKeys = [];
for (var k in RootProperties) RootPropertiesKeys.push(k);

// Utility function for root checks
function get_implementations(toHook) {
    var imp_args = []
    toHook.overloads.forEach(function(impl, _) {
        if (impl.hasOwnProperty('argumentTypes')) {
            var args = [];
            var argTypes = impl.argumentTypes
            argTypes.forEach(function(arg_type, __) {
                args.push(arg_type.className)
            });
            imp_args.push(args);
        }
    });
    return imp_args;
}

// Root detection check function
function isRootCheck(cmd) {
    var fakeCmd;
    if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh") {
        fakeCmd = "grep";
        console.log("[RootDetection Bypass] " + cmd + " command");
        return fakeCmd;
    }
    if (cmd == "su") {
        fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
        console.log("[RootDetection Bypass] " + cmd + " command");
        return fakeCmd;
    }
    return false;
}

// Main implementation
Java.performNow(function() {
    // Root Detection Bypasses
    try {
        var NativeFile = Java.use('java.io.File');
        NativeFile.exists.implementation = function() {
            var name = NativeFile.getName.call(this);
            if (RootBinaries.indexOf(name) > -1) {
                console.log("[RootDetection Bypass] return value for binary: " + name);
                return false;
            }
            return this.exists.call(this);
        };

        var javaString = Java.use('java.lang.String');
        javaString.contains.implementation = function(name) {
            if (name == "test-keys") {
                console.log("[RootDetection Bypass] test-keys check");
                return false;
            }
            return this.contains.call(this, name);
        };

        // Runtime.exec implementation
        var Runtime = Java.use('java.lang.Runtime');
        var execImplementations = get_implementations(Runtime.exec);
        var exec = Runtime.exec.overload('java.lang.String');

        execImplementations.forEach(function(args, _) {
            Runtime.exec.overload.apply(null, args).implementation = function() {
                var fakeCmd;
                var argz = [].slice.call(arguments);
                var cmd = argz[0];
                if (typeof cmd === 'string') {
                    fakeCmd = isRootCheck(cmd);
                    if (fakeCmd) {
                        return exec.call(this, fakeCmd);
                    }
                } else if (typeof cmd === 'object') {
                    for (var i = 0; i < cmd.length; i = i + 1) {
                        var tmp_cmd = cmd[i];
                        fakeCmd = isRootCheck(tmp_cmd);
                        if (fakeCmd) {
                            return exec.call(this, '');
                        }
                    }
                }
                return this['exec'].apply(this, argz);
            };
        });

        // BufferedReader implementation
        var BufferedReader = Java.use('java.io.BufferedReader');
        BufferedReader.readLine.overload().implementation = function() {
            var text = this.readLine.call(this);
            if (text !== null && text.indexOf("ro.build.tags=test-keys") > -1) {
                console.log("[RootDetection Bypass] build.prop file read");
                text = text.replace("ro.build.tags=test-keys", "ro.build.tags=release-keys");
            }
            return text;
        };

        // ProcessBuilder implementation
        var ProcessBuilder = Java.use('java.lang.ProcessBuilder');
        ProcessBuilder.start.implementation = function() {
            var cmd = this.command.call(this);
            var shouldModifyCommand = false;
            for (var i = 0; i < cmd.size(); i = i + 1) {
                var tmp_cmd = cmd.get(i).toString();
                if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd.indexOf("mount") != -1 || 
                    tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd.indexOf("id") != -1) {
                    shouldModifyCommand = true;
                }
            }
            if (shouldModifyCommand) {
                console.log("[RootDetection Bypass] ProcessBuilder " + JSON.stringify(cmd));
                this.command.call(this, ["grep"]);
                return this.start.call(this);
            }
            if (cmd.indexOf("su") != -1) {
                console.log("[RootDetection Bypass] ProcessBuilder " + JSON.stringify(cmd));
                this.command.call(this, ["justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled"]);
                return this.start.call(this);
            }
            return this.start.call(this);
        };

    } catch(err) {
        console.log('[RootDetection Bypass] Error: ' + err);
    }

    // Debugger Detection Bypasses
    try {
        var Debug = Java.use('android.os.Debug');
        Debug.isDebuggerConnected.implementation = function() {
            console.log('[Debugger Check] isDebuggerConnected() check bypassed');
            return false;
        };
    } catch(err) {
        console.log('[Debugger Check] Error: ' + err);
    }
});

// Native hooks
try {
    // Root Detection Native Hooks
    Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
        onEnter: function(args) {
            var path = Memory.readCString(args[0]);
            path = path.split("/");
            var executable = path[path.length - 1];
            var shouldFakeReturn = (RootBinaries.indexOf(executable) > -1)
            if (shouldFakeReturn) {
                Memory.writeUtf8String(args[0], "/notexists");
                console.log("[RootDetection Bypass] native fopen");
            }
        }
    });

    Interceptor.attach(Module.findExportByName("libc.so", "system"), {
        onEnter: function(args) {
            var cmd = Memory.readCString(args[0]);
            if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id") {
                console.log("[RootDetection Bypass] native system: " + cmd);
                Memory.writeUtf8String(args[0], "grep");
            }
            if (cmd == "su") {
                console.log("[RootDetection Bypass] native system: " + cmd);
                Memory.writeUtf8String(args[0], "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled");
            }
        }
    });

    // Debugger Detection Native Hooks
    Interceptor.attach(Module.findExportByName("libc.so", "connect"), {
        onEnter: function(args) {
            var memory = Memory.readByteArray(args[1], 64);
            var b = new Uint8Array(memory);
            if (b[2] == 0x69 && b[3] == 0xa2 && b[4] == 0x7f && b[5] == 0x00 && b[6] == 0x00 && b[7] == 0x01) {
                this.frida_detection = true;
            }
        },
        onLeave: function(retval) {
            if (this.frida_detection) {
                console.log("[Debugger Check] Frida Port detection bypassed");
                retval.replace(-1);
            }
        }
    });

    var fgetsPtr = Module.findExportByName("libc.so", "fgets");
    var fgets = new NativeFunction(fgetsPtr, 'pointer', ['pointer', 'int', 'pointer']);
    Interceptor.replace(fgetsPtr, new NativeCallback(function(buffer, size, fp) {
        var retval = fgets(buffer, size, fp);
        var bufstr = Memory.readUtf8String(buffer);
        if (bufstr.indexOf("TracerPid:") > -1) {
            Memory.writeUtf8String(buffer, "TracerPid:\t0");
            console.log("[Debugger Check] TracerPID check bypassed");
        }
        return retval;
    }, 'pointer', ['pointer', 'int', 'pointer']));

    Interceptor.attach(Module.findExportByName(null, "ptrace"), {
        onLeave: function(retval) {
            console.log("[Debugger Check] Ptrace check bypassed");
            retval.replace(0);
        }
    });

} catch(err) {
    console.log('[Native Hooks] Error: ' + err);
}

// Additional Security Checks
Java.perform(function() {
    // VPN Checks
    try {
        var NInterface = Java.use("java.net.NetworkInterface");
        NInterface.getName.overload().implementation = function() {
            var IName = this.getName();
            if (IName == "tun0" || IName == "ppp0" || IName == "p2p0" || IName == "ccmni0" || IName == "tun") {
                console.log("[Security Check] Bypassed Network Interface name check: " + IName);
                return "Bypass";
            }
            return IName;
        };
    } catch(err) {
        console.log('[VPN Check] Error: ' + err);
    }

    // Developer Mode Checks
    try {
        var SSecure = Java.use("android.provider.Settings$Secure");
        SSecure.getStringForUser.overload('android.content.ContentResolver', 'java.lang.String', 'int').implementation = function(Content, Name, Flag) {
            if (Name.indexOf("development_settings_enabled") >= 0) {
                console.log("[Security Check] Developer mode check bypassed for: " + Name);
                return this.getStringForUser.call(this, Content, "bypassed", Flag);
            }
            return this.getStringForUser(Content, Name, Flag);
        };
    } catch(err) {
        console.log('[Developer Mode Check] Error: ' + err);
    }

    // React Native JailMonkey Checks
    try {
        let toHook = Java.use('com.gantix.JailMonkey.JailMonkeyModule')['getConstants'];
        toHook.implementation = function() {
            var hashmap = this.getConstants();
            hashmap.put('isJailBroken', Java.use("java.lang.Boolean").$new(false));
            hashmap.put('hookDetected', Java.use("java.lang.Boolean").$new(false));
            hashmap.put('canMockLocation', Java.use("java.lang.Boolean").$new(false));
            hashmap.put('isOnExternalStorage', Java.use("java.lang.Boolean").$new(false));
            hashmap.put('AdbEnabled', Java.use("java.lang.Boolean").$new(false));
            return hashmap;
        };
    } catch(err) {
        console.log('[JailMonkey Check] Error: ' + err);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-121296146 @sdcampbell/unified-android-root-and-debugger-bypass
