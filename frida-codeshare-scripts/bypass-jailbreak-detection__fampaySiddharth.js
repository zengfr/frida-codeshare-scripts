
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-863795567 @fampaySiddharth/bypass-jailbreak-detection
if (ObjC.available) {
    var paths = [
        "/Applications/blackra1n.app",
        "/Applications/Cydia.app",
        "/Applications/FakeCarrier.app",
        "/Applications/Icy.app",
        "/Applications/IntelliScreen.app",
        "/Applications/MxTube.app",
        "/Applications/RockApp.app",
        "/Applications/SBSetttings.app",
        "/Applications/WinterBoard.app",
        "/bin/bash",
        "/bin/sh",
        "/bin/su",
        "/etc/apt",
        "/etc/ssh/sshd_config",
        "/Library/MobileSubstrate/DynamicLibraries/LiveClock.plist",
        "/Library/MobileSubstrate/DynamicLibraries/Veency.plist",
        "/Library/MobileSubstrate/MobileSubstrate.dylib",
        "/pguntether",
        "/private/var/lib/cydia",
        "/private/var/mobile/Library/SBSettings/Themes",
        "/private/var/stash",
        "/private/var/tmp/cydia.log",
        "/System/Library/LaunchDaemons/com.ikey.bbot.plist",
        "/System/Library/LaunchDaemons/com.saurik.Cydia.Startup.plist",
        "/usr/bin/cycript",
        "/usr/bin/ssh",
        "/usr/bin/sshd",
        "/usr/libexec/sftp-server",
        "/usr/libexec/ssh-keysign",
        "/usr/sbin/frida-server",
        "/usr/sbin/sshd",
        "/var/cache/apt",
        "/var/lib/cydia",
        "/var/log/syslog",
        "/var/mobile/Media/.evasi0n7_installed",
        "/var/tmp/cydia.log",
        "/var/mobile/Library/Preferences/ABPattern",
        "/usr/lib/ABDYLD.dylib",
        "/usr/lib/ABSubLoader.dylib",
        "/usr/sbin/frida-server",
        "/etc/apt/sources.list.d/electra.list",
        "/etc/apt/sources.list.d/sileo.sources",
        "/.bootstrapped_electra",
        "/usr/lib/libjailbreak.dylib",
        "/jb/lzma",
        "/.cydia_no_stash",
        "/.installed_unc0ver",
        "/jb/offsets.plist",
        "/usr/share/jailbreak/injectme.plist",
        "/etc/apt/undecimus/undecimus.list",
        "/var/lib/dpkg/info/mobilesubstrate.md5sums",
        "/Library/MobileSubstrate/MobileSubstrate.dylib",
        "/jb/jailbreakd.plist",
        "/jb/amfid_payload.dylib",
        "/jb/libjailbreak.dylib",
        "/usr/libexec/cydia/firmware.sh",
        "/var/lib/cydia",
        "/etc/apt",
        "/private/var/lib/apt",
        "/private/var/Users/",
        "/var/log/apt",
        "/Applications/Cydia.app",
        "/private/var/stash",
        "/private/var/lib/apt/",
        "/private/var/lib/cydia",
        "/private/var/cache/apt/",
        "/private/var/log/syslog",
        "/private/var/tmp/cydia.log",
        "/Applications/Icy.app",
        "/Applications/MxTube.app",
        "/Applications/RockApp.app",
        "/Applications/blackra1n.app",
        "/Applications/SBSettings.app",
        "/Applications/FakeCarrier.app",
        "/Applications/WinterBoard.app",
        "/Applications/IntelliScreen.app",
        "/private/var/mobile/Library/SBSettings/Themes",
        "/Library/MobileSubstrate/CydiaSubstrate.dylib",
        "/System/Library/LaunchDaemons/com.ikey.bbot.plist",
        "/Library/MobileSubstrate/DynamicLibraries/Veency.plist",
        "/Library/MobileSubstrate/DynamicLibraries/LiveClock.plist",
        "/System/Library/LaunchDaemons/com.saurik.Cydia.Startup.plist",
        "/Applications/Sileo.app",
        "/var/binpack",
        "/Library/PreferenceBundles/LibertyPref.bundle",
        "/Library/PreferenceBundles/ShadowPreferences.bundle",
        "/Library/PreferenceBundles/ABypassPrefs.bundle",
        "/Library/PreferenceBundles/FlyJBPrefs.bundle",
        "/Library/PreferenceBundles/Cephei.bundle",
        "/Library/PreferenceBundles/SubstitutePrefs.bundle",
        "/Library/PreferenceBundles/libhbangprefs.bundle",
        "/usr/lib/libhooker.dylib",
        "/usr/lib/libsubstitute.dylib",
        "/usr/lib/substrate",
        "/usr/lib/TweakInject",
        "/var/binpack/Applications/loader.app",
        "/Applications/FlyJB.app",
        "/Applications/Zebra.app",
        "/Library/BawAppie/ABypass",
        "/Library/MobileSubstrate/DynamicLibraries/SSLKillSwitch2.plist",
        "/Library/MobileSubstrate/DynamicLibraries/PreferenceLoader.plist",
        "/Library/MobileSubstrate/DynamicLibraries/PreferenceLoader.dylib",
        "/Library/MobileSubstrate/DynamicLibraries",
        "/var/mobile/Library/Preferences/me.jjolano.shadow.plist"
    ];
    var f = Module.findExportByName("libSystem.B.dylib", "stat64");
    Interceptor.attach(f, {
        onEnter: function(args) {
            this.is_common_path = false;
            var arg = Memory.readUtf8String(args[0]);
            for (var path in paths) {
                if (arg.indexOf(paths[path]) > -1) {
                    console.log("Hooking native function stat64: " + arg);
                    this.is_common_path = true;
                    //return -1;
                }
            }
        },
        onLeave: function(retval) {
            if (this.is_common_path) {
                console.log("stat64 Bypass!!!");
                retval.replace(-1);
            }
        }
    });
    var f = Module.findExportByName("libSystem.B.dylib", "stat");
    Interceptor.attach(f, {
        onEnter: function(args) {
            this.is_common_path = false;
            var arg = Memory.readUtf8String(args[0]);
            for (var path in paths) {
                if (arg.indexOf(paths[path]) > -1) {
                    console.log("Hooking native function stat: " + arg);
                    this.is_common_path = true;
                    //return -1;
                }
            }
        },
        onLeave: function(retval) {
            if (this.is_common_path) {
                console.log("stat Bypass!!!");
                retval.replace(-1);
            }
        }
    });
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-863795567 @fampaySiddharth/bypass-jailbreak-detection
