const jailbreakPaths = [
    "/Applications/palera1n.app",
    "/tmp",
    "/private/jailbreak.txt",
    "/.bootstrapped_electra",
    "/.cydia_no_stash",
    "/.installed_unc0ver",
    "/Applications/Cydia.app",
    "/Applications/FakeCarrier.app",
    "/Applications/Icy.app",
    "/Applications/IntelliScreen.app",
    "/Applications/MxTube.app",
    "/Applications/RockApp.app",
    "/Applications/SBSettings.app",
    "/Applications/Sileo.app",
    "/Applications/Snoop-itConfig.app",
    "/Applications/WinterBoard.app",
    "/Applications/blackra1n.app",
    "/Library/MobileSubstrate/CydiaSubstrate.dylib",
    "/Library/MobileSubstrate/DynamicLibraries/LiveClock.plist",
    "/Library/MobileSubstrate/DynamicLibraries/Veency.plist",
    "/Library/MobileSubstrate/MobileSubstrate.dylib",
    "/Library/PreferenceBundles/ABypassPrefs.bundle",
    "/Library/PreferenceBundles/FlyJBPrefs.bundle",
    "/Library/PreferenceBundles/LibertyPref.bundle",
    "/Library/PreferenceBundles/ShadowPreferences.bundle",
    "/System/Library/LaunchDaemons/com.ikey.bbot.plist",
    "/System/Library/LaunchDaemons/com.saurik.Cydia.Startup.plist",
    "/bin/bash",
    "/bin/sh",
    "/etc/apt",
    "/etc/apt/sources.list.d/electra.list",
    "/etc/apt/sources.list.d/sileo.sources",
    "/etc/apt/undecimus/undecimus.list",
    "/etc/ssh/sshd_config",
    "/jb/amfid_payload.dylib",
    "/jb/jailbreakd.plist",
    "/jb/libjailbreak.dylib",
    "/jb/lzma",
    "/jb/offsets.plist",
    "/private/etc/apt",
    "/private/etc/dpkg/origins/debian",
    "/private/etc/ssh/sshd_config",
    "/private/var/Users/",
    "/private/var/cache/apt/",
    "/private/var/lib/apt",
    "/private/var/lib/cydia",
    "/private/var/log/syslog",
    "/private/var/mobile/Library/SBSettings/Themes",
    "/private/var/stash",
    "/private/var/tmp/cydia.log",
    "/var/tmp/cydia.log",
    "/usr/bin/cycript",
    "/usr/bin/sshd",
    "/usr/lib/libcycript.dylib",
    "/usr/lib/libhooker.dylib",
    "/usr/lib/libjailbreak.dylib",
    "/usr/lib/libsubstitute.dylib",
    "/usr/lib/substrate",
    "/usr/lib/TweakInject",
    "/usr/libexec/cydia",
    "/usr/libexec/cydia/firmware.sh",
    "/usr/libexec/sftp-server",
    "/usr/libexec/ssh-keysign",
    "/usr/local/bin/cycript",
    "/usr/sbin/frida-server",
    "/usr/sbin/sshd",
    "/usr/share/jailbreak/injectme.plist",
    "/var/binpack",
    "/var/cache/apt",
    "/var/checkra1n.dmg",
    "/var/lib/apt",
    "/var/lib/cydia",
    "/var/lib/dpkg/info/mobilesubstrate.md5sums",
    "/var/log/apt",
    "/var/lib/undecimus/apt",
    "/Applications",
    "/Library/Ringtones",
    "/Library/Wallpaper",
    "/usr/arm-apple-darwin9",
    "/usr/include",
    "/usr/libexec",
    "/usr/share",
    "/.file",
    "/usr/lib/Cephei.framework/Cephei",
    "/Applications/SBSetttings.app",
    "/Applications/Terminal.app",
    "/Applications/Pirni.app",
    "/Applications/iFile.app",
    "/Applications/iProtect.app",
    "/Applications/Backgrounder.app",
    "/Applications/biteSMS.app",
    "/Library/MobileSubstrate/DynamicLibraries/SBSettings.dylib",
    "/Library/MobileSubstrate/DynamicLibraries/SBSettings.plist",
    "/System/Library/LaunchDaemons/com.saurik.Cy@dia.Startup.plist",
    "/System/Library/LaunchDaemons/com.bigboss.sbsettingsd.plist",
    "/System/Library/PreferenceBundles/CydiaSettings.bundle",
    "/etc/profile.d/terminal.sh",
    "/private/var/root/Media/Cydia",
    "/private/var/lib/dpkg/info/cydia-sources.list",
    "/private/var/lib/dpkg/info/cydia.list",
    "/private/etc/profile.d/terminal.sh",
    "/usr/bin/ssh",
    "/var/log/syslog",
    "/var/lib/dpkg/info/cydia-sources.list",
    "/var/lib/dpkg/info/cydia.list",
    "/var/lib/dpkg/info/mobileterminal.list",
    "/var/lib/dpkg/info/mobileterminal.postinst",
    "/User/Library/SBSettings",
    "/usr/bin/sbsettingsd",
    "/var/mobile/Library/SBSettings",
    "/etc/passwd",
    "/usr/share/icu/icudt68l.dat",
    "/.bootstrapped_electra",
    "/.cydia_no_stash",
    "/.installed_unc0ver",
    "/Applications/Cydia.app",
    "/Applications/FakeCarrier.app",
    "/Applications/Icy.app",
    "/Applications/IntelliScreen.app",
    "/Applications/MxTube.app",
    "/Applications/RockApp.app",
    "/Applications/SBSettings.app",
    "/Applications/Sileo.app",
    "activator://package/com.example.package",
    "cydia://package/com.example.package",
    "filza://package/com.example.package",
    "sileo://package/com.example.package",
    "/var/db/timezone/icutz",
    "/var/db/timezone/icutz/icutz44l.dat"
];

//App URL list in lower case for canOpenURL
const canOpenURL = [
    "cydia",
    "activator",
    "filza",
    "sileo",
    "undecimus",
    "zbra"
]

if (ObjC.available) {
    try {
        //Hooking fileExistsAtPath:
        Interceptor.attach(ObjC.classes.NSFileManager["- fileExistsAtPath:"].implementation, {
            onEnter(args) {
                // Use a marker to check onExit if we need to manipulate
                // the response.
                this.is_common_path = false;
                // Extract the path
                this.path = new ObjC.Object(args[2]).toString();
                // check if the looked up path is in the list of common_paths
                if (jailbreakPaths.indexOf(this.path) >= 0) {
                    // Mark this path as one that should have its response
                    // modified if needed.
                    this.is_common_path = true;
                }
            },
            onLeave(retval) {
                // stop if we dont care about the path
                if (!this.is_common_path) {
                    return;
                }

                // ignore failed lookups
                if (retval.isNull()) {
                    return;
                }
                console.log(`fileExistsAtPath: bypassing ` + this.path);
                retval.replace(new NativePointer(0x00));
            },
        });

        //Hooking fopen
        Interceptor.attach(Module.findExportByName(null, "fopen"), {
            onEnter(args) {
                this.is_common_path = false;
                // Extract the path
                this.path = args[0].readCString();
                // check if the looked up path is in the list of common_paths
                if (jailbreakPaths.indexOf(this.path) >= 0) {
                    // Mark this path as one that should have its response
                    // modified if needed.
                    this.is_common_path = true;
                }
            },
            onLeave(retval) {
                // stop if we dont care about the path
                if (!this.is_common_path) {
                    return;
                }

                // ignore failed lookups
                if (retval.isNull()) {
                    return;
                }
                console.log(`fopen: bypassing` + this.path);
                retval.replace(new NativePointer(0x00));
            },
        });

        //Hooking canOpenURL for Cydia
        Interceptor.attach(ObjC.classes.UIApplication["- canOpenURL:"].implementation, {
            onEnter(args) {
                this.is_flagged = false;
                // Extract the path
                this.path = new ObjC.Object(args[2]).toString();
                let app = this.path.split(":")[0].toLowerCase();
                if (canOpenURL.indexOf(app) >= 0) {
                    this.is_flagged = true;
                }
            },
            onLeave(retval) {
                if (!this.is_flagged) {
                    return;
                }

                // ignore failed
                if (retval.isNull()) {
                    return;
                }
                console.log(`canOpenURL: ` +
                    this.path + ` was successful with: ` +
                    retval.toString() + `, bypassing.`);
                retval.replace(new NativePointer(0x00));
            }
        });

        //Hooking libSystemBFork
        const libSystemBdylibFork = Module.findExportByName("libSystem.B.dylib", "fork");
        if (libSystemBdylibFork) {
            Interceptor.attach(libSystemBdylibFork, {
                onLeave(retval) {
                    // already failed forks are ok
                    if (retval.isNull()) {
                        return;
                    }
                    console.log(`Call to libSystem.B.dylib::fork() was successful with ` +
                        retval.toString() + ` marking it as failed.`);
                    retval.replace(new NativePointer(0x0));
                },
            });
        }
        
        //Hooking libSystemBdylib stat64
        const libSystemBdylibStat64 = Module.findExportByName("libSystem.B.dylib", "stat64");
        if (libSystemBdylibStat64) {
            Interceptor.attach(libSystemBdylibStat64, {
                onEnter: function(args) {
                    this.is_common_path = true;
                    this.arg = Memory.readUtf8String(args[0]);
                    for (var path in jailbreakPaths) {
                        if (this.arg.indexOf(jailbreakPaths[path]) > -1) {
                            this.is_common_path = false;
                            //return -1;
                        }
                    }
                },
                onLeave: function(retval) {
                    if(retval.isNull()){
                        return;
                    }
                    
                    if (!this.is_common_path) {
                        console.log(`stat64: bypass` + this.arg);
                        retval.replace(-1);
                    }
                }
            });
        }
        
        //Hooking libSystemBdylib stat
        const libSystemBdylibStat = Module.findExportByName("libSystem.B.dylib", "stat");
        if (libSystemBdylibStat) {
            Interceptor.attach(libSystemBdylibStat, {
                onEnter: function(args) {
                    this.is_common_path = true;
                    this.arg = Memory.readUtf8String(args[0]);
                    for (var path in jailbreakPaths) {
                        if (this.arg.indexOf(jailbreakPaths[path]) > -1) {
                            this.is_common_path = false;
                            //return -1;
                        }
                    }
                },
                onLeave: function(retval) {
                    if(retval.isNull()){
                        return;
                    }
                    
                    if (!this.is_common_path) {
                        console.log(`stat: bypass` + this.arg);
                        retval.replace(-1);
                    }
                }
            });
        }
        
    } catch (err) {
        console.log("Exception : " + err.message);
    }
} else {
    console.log("Objective-C Runtime is not available!");
}
//https://github.com/zengfr/frida-codeshare-scripts
//1718224030 @DevTraleski/ios-jailbreak-detection-bypass-palera1n