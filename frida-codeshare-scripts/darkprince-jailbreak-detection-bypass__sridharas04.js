
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1806502538 @sridharas04/darkprince-jailbreak-detection-bypass
console.warn(`[*] Darkprince JB Detection Bypass`);
/**
 * 
 *  Script by : D@rkprince
 * 
 */
console.warn(`################################################`);

//Detection Reference Script https://github.com/securing/IOSSecuritySuite/blob/master/IOSSecuritySuite/JailbreakChecker.swift

if (ObjC.available) {

    var jbPaths = [
        "/Applications/FakeCarrier.app",
        "/var/lib/apt",
        "/usr/bin/ssh-agent",
        "/Applications/blackra1n.app",
        "/Library/MobileSubstrate/MobileSubstrate.dylib",
        "/private/var/mobile/Library/SBSettings/Themes",
        "/Library/MobileSubstrate/DynamicLibraries/MobileSafety.dylib",
        "/usr/libexec/substrated",
        "/System/Library/LaunchDaemons/com.bigboss.sbsettingsd.plist",
        "/private/etc/apt/sources.list.d/sileo.sources",
        "/.cydia_no_stash",
        "/private/etc/dpkg/origins/debian",
        "/private/var/cache/clutch_cracked.plist",
        "/etc/apt/",
        "Library/LaunchDaemons/dropbear.plist",
        "/usr/sbin/frida-server",
        "/Library/MobileSubstrate/DynamicLibraries/xCon.dylib",
        "/private/etc/clutch_cracked.plist",
        "/usr/bin/sftp",
        "/var/cache/clutch.plist",
        "/var/lib/cydia",
        "/etc/ssh/sshd_config",
        "/Applications/SBSetttings.app",
        "/private/var/Users/",
        "/usr/lib/libsubstrate.dylib/SSLKillSwitch2.dylib",
        "/User/Library/SBSettings",
        "/Library/MobileSubstrate/DynamicLibraries/SBSettings.plist",
        "/etc/apt/sources.list.d/electra.list",
        "/usr/libexec/sshd-keygen-wrapper",
        "/Applications/flex3.app",
        "/Library/Frameworks/CydiaSubstrate.framework/Info.plist",
        "/etc/profile.d/terminal.sh",
        "/Applications/crackerxi.app",
        "/private/var/MobileSoftwareUpdate/mnt1/System/Library/PrivateFrameworks/DictionaryServices.framework/SubstituteCharacters.plist",
        "/Library/LaunchDaemons/dhpdaemon.plist",
        "/private/etc/ssh/sshd_config",
        "/usr/libexec/filza/Filza",
        "/private/var/lib/dpkg/",
        "/usr/bin/sbsettingsd",
        "/Library/PreferenceBundles/ABypassPrefs.bundle",
        "/var/mobile/Library/Caches/com.saurik.Cydia/sources.list",
        "/Library/MobileSubstrate/CydiaSubstrate.dylib",
        "/private/etc/apt/preferences.d/cydia",
        "/private/var/mobile/Library/Filza/pasteboard.plist",
        "/private/var/mobile/Library/Cydia/",
        "/var/lib/dpkg/",
        "/Library/MobileSubstrate/DynamicLibraries/AppSyncUnified-FrontBoard.dylib",
        "/etc/apt",
        "/usr/libexec/cydia/firmware.sh",
        "/usr/libexec/substituted",
        "/var/mobile/Library/Filza/",
        "/Library/MobileSubstrate/DynamicLibraries/PreferenceLoader.dylib",
        "/private/var/mobile/Library/Filza/",
        "/Library/PreferenceBundles/libhbangprefs.bundle",
        "/bin/su",
        "/Library/MobileSubstrate/DynamicLibraries/AAAInjectionFoundation.dylib",
        "/private/etc/profile.d/terminal.sh",
        "/var/mobile/Library/SBSettings",
        "/usr/include",
        "/usr/sbinsshd",
        "/usr/bin/cycript",
        "/Library/MobileSubstrate/DynamicLibraries/",
        "/usr/lib/libsubstitute.dylib",
        "/Cydia/Substrate",
        "/Library/PreferenceBundles/SubstitutePrefs.bundle/Info.plist",
        "/usr/bin/sinject",
        "/Library/LaunchDaemons/com.saurik.Cydia.Startup.plist",
        "/var/lib/undecimus/apt",
        "/usr/lib/libhooker.dylib",
        "/Library/Ringtones",
        "/System/Library/LaunchDaemons/com.saurik.Cydia.Startup.plist",
        "/usr/libexec/sftp-server",
        "/Library/MobileSubstrate/DynamicLibraries/afc2dSupport.plist",
        "/var/mobile/Library/Preferences/com.ex.substitute.plist",
        "/var/lib/dpkg/info/mobilesubstrate.dylib",
        "/var/cache/clutch_cracked.plist",
        "/var/mobile/Library/Filza/pasteboard.plist",
        "/Library/Frameworks/Shadow.framework/Shadow",
        "/Library/MobileSubstrate/DynamicLibraries/PreferenceLoader.plist",
        "/Applications/MxTube.app",
        "/var/binpack",
        "/etc/passwd",
        "/Library/MobileSubstrate/",
        "/var/cache/apt/",
        "/var/lib/dpkg/info/mobilesubstrate.md5sums",
        "/Library/PreferenceBundles/FlyJBPrefs.bundle",
        "/Library/Frameworks/CydiaSubstrate.framework/Headers/",
        "/private/etc/apt/preferences.d/checkra1n",
        "/Library/BawAppie/ABypass",
        "/Systetem/Library/LaunchDaemons/com.ikey.bbot.plist",
        "/bin.sh",
        "/private/var/Users",
        "/jb/libjailbreak.dylib",
        "/Library/MobileSubstrate/DynamicLibraries/Veency.dylib",
        "/Library/Activator",
        "/usr/lib/Cephei.framework/Cephei",
        "/usr/lib/frida/frida-agent.dylib",
        "/Library/MobileSubstrate/DynamicLibraries/MobileSafety.plist",
        "/bin/bash",
        "/var/tmp/cydia.log",
        "/Library/MobileSubstrate/DynamicLibraries/afc2dSupport.dylib",
        "/Library/Frameworks/CydiaSubstrate.framework/",
        "/Library/MobileSubstrate/DynamicLibraries/Shadow.plist",
        "/usr/lib/TweakInject",
        "/etc/apt/undecimus/undecimus.list",
        "/usr/lib/cycript0.9/com/saurik/substrate/MS.cy",
        "/Library/MobileSubstrate/DynamicLibraries/RocketBootstrap.dylib",
        "/private/var/lib/dpkg/info/cydia.list",
        "/var/lib/dpkg/info/mobileterminal.postinst",
        "/etc/alternatives/sh",
        "/Library/PreferenceBundles/SubstitutePrefs.bundle/SubstitutePrefs",
        "/usr/share/jailbreak/injectme.plist",
        "/Applications/LibertyLite.app",
        "/usr/lib/libsubstrate.dylib",
        "/pguntether",
        "/var/lib/cydia/",
        "/usr/bin/ssh-keygen",
        "/Library/MobileSubstrate/DynamicLibraries/LiveClock.plist",
        "/Library/PreferenceBundles/ShadowPreferences.bundle",
        "/Library/MobileSubstrate/DynamicLibraries/afc2dService.plist",
        "/usr/lib/ABSubLoader.dylib",
        "/usr/lib/cycript0.9/com/saurik/",
        "/Library/MobileSubstrate/DynamicLibraries/SBSettings.dylib",
        "/Applications/excon.app",
        "/Library/MobileSubstrate/DynamicLibraries/Veency.plist",
        "/Library/MobileSubstrate/DynamicLibraries/*",
        "/etc/apt/preferences.d/checkra1n",
        "/usr/bin/scp",
        "/private/var/stash",
        "/usr/bin/ssh",
        "/private/var/cache/clutch.plist",
        "/Applications/Snoop-itConfig.app",
        "/Library/LaunchDaemons/com.openssh.sshd.plist",
        "/var/lib/clutch/overdrive.dylib",
        "/etc/clutch_cracked.plist",
        "/private/var/lib/apt",
        "/usr/share",
        "/private/var/evasi0n",
        "/usr/bin/sshd",
        "/usr/lib/substrate/SubstrateInserter.dylib",
        "/Library/MobileSubstrate/DynamicLibraries/0Shadow.dylib",
        "/Applications/Backgrounder.app",
        "/usr/binsshd",
        "/var/containers/Shared/SystemGroup/systemgroup.com.apple.configurationprofiles/Library/ConfigurationProfiles",
        "/Library/MobileSubstrate/DynamicLibraries/Choicy.plist",
        "/bin/sh",
        "/Applications/exconflex3.app",
        "/tmp",
        "/Library/MobileSubstrate/DynamicLibraries/zorro.dylib",
        "/Library/PreferenceBundles/Cephei.bundle",
        "/var/db/stash",
        "/usr/lib/libjailbreak.dylib",
        "/Applications/Sileo.app",
        "/var/binpack/Applications/loader.app",
        "/var/dropbear_rsa_host_key",
        "/Applications/Terminal.app",
        "/usr/lib/CepheiUI.framework/CepheiUI",
        "/var/evasi0n",
        "/usr/local/bin/cycript",
        "/private/jailbreak.txt",
        "/var/log/apt",
        "/usr/lib/frida",
        "/var/mobile/Library/Preferences/me.jjolano.shadow.plist",
        "/Library/Modulous/HookKit/HookKitSubstrateModule.bundle",
        "/Library/Modulous/HookKit",
        "/Library/Modulous/",
        "/Library/PreferenceBundles/HideJBPrefs.bundle",
        "/usr/libexec/substrate",
        "/var/MobileSoftwareUpdate/mnt1/System/Library/PrivateFrameworks/DictionaryServices.framework/SubstituteCharacters.plist",
        "/Library/dpkg/info/kjc.checkra1n.mobilesubstraterepo.list",
        "/Library/LaunchDaemons/ai.akemi.asu_inject.plist",
        "/Library/LaunchDaemons/com.rpetrich.rocketbootstrapd.plist",
        "/jb/amfid_payload.dylib",
        "/usr/lib/ABDYLD.dylib",
        "/Library/PreferenceBundles/SubstitutePrefs.bundle/",
        "/private/var/mobile/Library/Preferences/com.ex.substitute.plist",
        "/Applications/iProtect.app",
        "/private/var/log/syslog",
        "/Library/MobileSubstrate/DynamicLibraries/AppSyncUnified-installd.dylib",
        "/usr/lib/substrate/SubstrateLoader.dylib",
        "/Applications/palera1n.app",
        "/Library/Frameworks/Modulous.framework/Modulous",
        "/private/var/cache/apt",
        "/jb/jailbreakd.plist",
        "/var/mobile/Media/.evasi0n7_installed",
        "/usr/libexec",
        "/var/mobile/Library/Preferences/ABPattern",
        "/Library/MobileSubstrate/DynamicLibraries/AAAInjectionFoundation.plist",
        "/Library/Flipswitch",
        "/private/var/root/Media/Cydia",
        "/Library/MobileSubstrate/DynamicLibraries/ChoicySB.dylib",
        "/Applications/FlyJB.app",
        "/private/var/root/Documents/Cracked/",
        "/Library/Frameworks/CydiaSubstrate.framework/Headers/CydiaSubstrate.h",
        "/Library/MobileSubstrate/DynamicLibraries/afc2dService.dylib",
        "/private/etc/rc.d/substitute-launcher",
        "/usr/include/substrate.h",
        "/System/Library/LaunchDaemons/com.saurik.Cy@dia.Startup.plist",
        "/Applications/Cydia.app",
        "/etc/apt/sources.list.d/sileo.sourcs",
        "/Library/Wallpaper",
        "/Applications/Liberty.app",
        "/Library/Frameworks/HookKit.framework/HookKit",
        "/var/cache/apt",
        "/.installed_unc0ver",
        "/usr/lib/substrate/",
        "/var/stash",
        "/Applications/SBSettings.app",
        "/usr/arm-apple-darwin9",
        "/Library/MobileSubstrate/DynamicLibraries/zzzzHeiBaoLib.dylib",
        "/Library/PreferenceLoader/Preferences/SubstituteSettings.plist",
        "/usr/lib/libsubstrate.dylib/SSLKillSwitch2.plist",
        "/Applications",
        "/Applications/biteSMS.app",
        "/private/var/db/stash",
        "/private/var/mobile/Library/SBSettingsThemes/",
        "/Library/Frameworks/RootBridge.framework/RootBridge",
        "/usr/bin/ssh-add",
        "/private/var/lib/cydia",
        "/usr/libexec/cydia/",
        "/var/checkra1n.dmg",
        "/Applications/WinterBoard.app",
        "/Applications/RockApp.app",
        "/Library/MobileSubstrate/DynamicLibraries/LiveClock.dylib",
        "/private/var/cache/apt/",
        "/jb/lzma",
        "/usr/lib/cycript0.9/",
        "/var/mobile/Library/Cydia/",
        "/.file",
        "/jb/offsets.plists",
        "/usr/lib/sandyd_global.plist",
        "/System/Library/LaunchDaemons/com.ikey.bbot.plist",
        "/etc/clutch.conf",
        "/jb/offsets.plist",
        "/private/etc/apt/trusted.gpg.d/*",
        "/private/etc/clutch.conf",
        "/Applications/Pirni.app",
        "/Library/MobileSubstrate/DynamicLibraries/dygz.dylib",
        "/Library/LaunchDaemons/com.tigisoftware.filza.helper.plist",
        "/Library/MobileSubstrate/DynamicLibraries",
        "/usr/bin/ssh-keyscan",
        "/Applications/IntelliScreen.app",
        "/Library/LaunchDaemons/re.frida.server.plist",
        "/var/db/timezone/icutz",
        "/Applications/Zebra.app",
        "/.bootstrapped_electra",
        "/.mount_rw",
        "/.bootstrapped",
        "/.file",
        "/Library/PreferenceBundles/LibertyPref.bundle",
        "/usr/libexec/ssh-keysign",
        "/private/etc/apt/sources.list.d/procursus.sources",
        "/var/lib/dpkg/info/cydia.list",
        "/Library/MobileSubstrate/DynamicLibraries/Choicy.dylib",
        "/var/lib/apt/",
        "/Applications/iFile.app",
        "/Library/MobileSubstrate/DynamicLibraries/Shadow.dylib",
        "/private/var/tmp/frida-*.dylib",
        "/Library/PreferenceBundles/SubstitutePrefs.bundle",
        "/Library/dpkg/",
        "/etc/apt/sources.list.d/sileo.sources",
        "/var/root/.bash_history",
        "/var/lib/dpkg/info/cydia-sources.list",
        "/usr/share/icu/icudt68l.dat",
        "/etc/apt/sources.list.d/cydia.list",
        "/usr/lib/substrate/SubstrateBootstrap.dylib",
        "/System/Library/PreferenceBundles/CydiaSettings.bundle",
        "/usr/lib/substrate",
        "/var/mobile/Library/SBSettingsThemes/",
        "/Library/MobileSubstrate/DynamicLibraries/SSLKillSwitch2.plist",
        "/Applications/Icy.app",
        "/var/root/Documents/Cracked/",
        "/usr/lib/libcycript.dylib",
        "/usr/sbin/sshd",
        "/usr/libexec/cydia",
        "/private/var/tmp/cydia.log",
        "/private/var/lib/apt/",
        "/var/lib/dpkg/info/mobileterminal.list",
        "/private/etc/apt",
        "/private/etc/alternatives/sh",
        "/usr/lib/cycript0.9/com/",
        "/var/log/syslog",
        "/usr/lib/cycript0.9/com/saurik/substrate/",
        "/usr/libexec/sinject-vpa",
        "/private/var/lib/dpkg/info/cydia-sources.list",
        "/Applications/Lite.app",
        "/System/Library/PrivateFrameworks/DictionaryServices.framework/SubstituteCharacters.plist",
        "/System/Library/LinguisticData/Info.plist",
        "/Library/MobileSubstrate/DynamicLibraries/mrybootstrap.plist",
        "/Library/MobileSubstrate/DynamicLibraries/!ABypass2.plist",
        "/Library/MobileSubstrate/DynamicLibraries/SparkAppListSB.plist",
        "/Library/MobileSubstrate/DynamicLibraries/mrybootstrap.dylib",
        "/Library/MobileSubstrate/DynamicLibraries/SparkAppListSB.dylib",
        "/Library/MobileSubstrate/DynamicLibraries/SSLKillSwitch2.dylib",
        "/var/mobile/Library/Preferences/com.rpgfarm.abypassprefs.plist",
        "/private/var/mobile/Library/Preferences/com.nablac0d3.SSLKillSwitchSettings.plist",
        " /Library/MobileSubstrate/DynamicLibraries/  _iKoTHEST=wJlK_.plist",
        "/usr/lib/libmryipc.dylib",
        "/usr/lib/libsandy.dylib",
        "/usr/lib/libsparkapplist.dylib",
        "/Library/Modulous/HookKit/HookKitSubstrateModule.bundle/Info.plist",
        "/Library/Shadow/Rulesets/StandardRules.plist",
        "/Library/Shadow/Rulesets/JailbreakMisc.plist",
        "/Library/Shadow/Rulesets/dpkgInstalled.plist",
        "/Library/Shadow/Rulesets",
        "/usr/lib/sandyd_global.plist",
        "/Library/MobileSubstrate/DynamicLibraries/ Crane.dylib",
        "/Library/MobileSubstrate/DynamicLibraries/  _iKoTHEST=wJlK_.dylib"
    ]


    // File Path Bypass
    Interceptor.attach(ObjC.classes.NSFileManager["- fileExistsAtPath:"].implementation, {
        onEnter(args) {
            var path = new ObjC.Object(args[2]).toString();
            this.jailbroken = false;
            for (let i = 0; i < jbPaths.length; i++) {
                if (path === jbPaths[i]) {
                    this.jailbroken = true;
                    console.log(`\n\x1b[31m    [-] Detected JB Detection path : ${path}\x1b[0m`);
                    break;
                }
            }
        },
        onLeave(retval) {
            if (this.jailbroken) {
                retval.replace(new NativePointer(0x0));
                console.log(`\x1b[32m    [-] Bypassed with: ${retval}\x1b[0m`);
            }
        }
    });


    // WriteToFile Bypass
    var hookWriteToFile = ObjC.classes.NSString["- writeToFile:atomically:encoding:error:"];
    var jailbreakPathsWriteToFile = [
        "/",
        "/root/",
        "/private/",
        "/jb/",
    ];

    Interceptor.attach(hookWriteToFile.implementation, {
        onEnter(args) {
            var path = ObjC.Object(args[2]).toString();
            console.log(`\x1b[33m\n  [+] Entering writeToFile: ${path}\x1b[0m`);
            this.jailbreakDetection = false;

            for (var i = 0; i < jailbreakPathsWriteToFile.length; i++) {
                if (path.indexOf(jailbreakPathsWriteToFile[i]) !== -1) {
                    console.log(`\x1b[31m    [+] Detected jailbreak path: ${path}\x1b[0m`);
                    this.jailbreakDetection = true;
                    this.errorPtr = args[5];
                    break;
                }
            }
        },
        onLeave(retval) {
            console.log(`\x1b[33m    [-] Leaving writeToFile. Jailbreak: ${this.jailbreakDetection}, ReturnValue: ${retval}\x1b[0m`);

            if (this.jailbreakDetection) {
                var error = ObjC.classes.NSError.alloc();
                Memory.writePointer(this.errorPtr, error);
                console.log(`\x1b[32m    [-] Jailbreak detection bypassed!\x1b[0m\n`);
            }
        }
    });


    // canOpenURL Bypass
    var hookCanOpenURL = ObjC.classes.UIApplication["- canOpenURL:"];
    var forbiddenURLs = [
        "cydia",
        "activator",
        "filza",
        "sileo",
        "undecimus",
        "zbra"
    ];

    Interceptor.attach(hookCanOpenURL.implementation, {
        onEnter(args) {
            var url = ObjC.Object(args[2]).toString();
            console.log(`\x1b[33m\n  [+] Entering canOpenURL: ${url}\x1b[0m`);
            this.jailbreakDetection = false;

            for (var i = 0; i < forbiddenURLs.length; i++) {
                if (url.includes(forbiddenURLs[i])) {
                    console.log(`\x1b[31m    [+] Detected forbidden URL: ${url}\x1b[0m`);
                    this.jailbreakDetection = true;
                    break;
                }
            }
        },
        onLeave(retval) {
            console.log(`\x1b[33m    [-] Leaving canOpenURL. Jailbreak detection attempt: ${this.jailbreakDetection}, ReturnValue: ${retval}\x1b[0m`);

            if (this.jailbreakDetection) {
                retval.replace(0x00);
                console.log(`\x1b[32m    [-] Jailbreak detection bypassed! manipulated return value ${retval}\x1b[0m\n`);
            }
        }
    });


    // Fork Bypass
    const libc = Module.findBaseAddress('libc.so');
    const forkFunc = new NativeFunction(Module.findExportByName(libc, 'fork'), 'int', []);

    Interceptor.attach(forkFunc, {
        onEnter(args) {
            console.log('\x1b[33m[+]\x1b[0m \x1b[36mfork() function called\x1b[0m');
        },
        onLeave(retval) {
            console.log('\x1b[33m[-]\x1b[0m \x1b[36mfork() function returned (before modification):\x1b[0m', retval);

            // Set the return value to -1 (indicating failure)
            this.context.x0 = ptr(-1);
            // Modify the return address to skip the original return instruction
            this.context.lr = this.context.lr.add(4);

            console.log('\x1b[33m[-]\x1b[0m \x1b[36mfork() function returned (after modification):\x1b[0m', this.context.x0);
            console.log('\x1b[33m[-]\x1b[0m \x1b[36mReturn address (after modification):\x1b[0m', this.context.lr);
        },
    });


    // Sysctl libfile open bypass
    const pathsToMatch = [
        "/Library/MobileSubstrate/DynamicLibraries/PreferenceLoader.dylib",
        "/Library/MobileSubstrate/DynamicLibraries/PreferenceLoader.plist",
        "/Library/MobileSubstrate/DynamicLibraries/Shadow.dylib",
        "/Library/MobileSubstrate/DynamicLibraries/AAAInjectionFoundation.dylib",
        "/Library/MobileSubstrate/DynamicLibraries/AAAInjectionFoundation.plist",
        "/Library/MobileSubstrate/DynamicLibraries/PreferenceLoader.plist",
        "/Library/MobileSubstrate/DynamicLibraries/Shadow.plist",
        "/Library/MobileSubstrate/DynamicLibraries/afc2dSupport.plist",
        "/Library/MobileSubstrate/DynamicLibraries/afc2dService.dylib",
        "/Library/MobileSubstrate/DynamicLibraries/afc2dService.plist",
        "/Library/MobileSubstrate/DynamicLibraries/MobileSafety.dylib",
        "/Library/MobileSubstrate/DynamicLibraries/MobileSafety.plist",
        "/Library/MobileSubstrate/DynamicLibraries/afc2dSupport.dylib",
        "/Library/MobileSubstrate/DynamicLibraries/afc2dSupport.plist"
    ];

    const openFunc = Module.findExportByName(null, "open");

    Interceptor.attach(openFunc, {
        onEnter: function(args) {
            // Print the arguments being passed to open()
            const filePath = args[0].readUtf8String();

            // Check if the file path is in the array
            if (pathsToMatch.includes(filePath)) {
                // Set a flag to indicate that the path matches
                this.matched = true;

                // Print the matched path with color
                console.log(`  \x1b[32mMatched path:\x1b[0m \x1b[36m${filePath}\x1b[0m`);
            } else {
                // Reset the flag for non-matching paths
                this.matched = false;
            }
        },
        onLeave: function(retval) {
            // Check if the return value is successful (not -1) and the path matched
            if (retval.toInt32() !== -1 && this.matched) {
                // Modify the return value to indicate failure (return -1)
                this.context.x0 = ptr(-1);
                // Skip the original open() call by modifying the return address
                this.context.lr = this.context.lr.add(4);

                console.log(`  \x1b[33mChanged syscall value from ${retval} to failure\x1b[0m`);
            }
        }
    });


    var jbLibs = [
        "SSLKillSwitch2.dylib",
        "MobileSubstrate.dylib",
        "xCon.dylib",
        "libsubstitute.dylib",
        "libhooker.dylib",
        "CydiaSubstrate.dylib",
        "AAAInjectionFoundation.dylib",
        "libsparkapplist.dylib",
        "_iKoTHEST=wJlK_.dylib",
        "SubstrateInserter.dylib",
        "SubstrateLoader.dylib",
        "libsubstrate.dylib",
        "SubstrateBootstrap.dylib",
        "PreferenceLoader.dylib",
        "Shadow.dylib",
        "libjailbreak.dylib",
        "Veency.dylib",
        "frida-agent.dylib",
        "RocketBootstrap.dylib",
        "ABSubLoader.dylib",
        "SBSettings.dylib",
        "overdrive.dylib",
        "0Shadow.dylib",
        "zorro.dylib",
        "amfid_payload.dylib",
        "ABDYLD.dylib",
        "AppSyncUnified-installd.dylib",
        "ChoicySB.dylib",
        "zzzzHeiBaoLib.dylib",
        "LiveClock.dylib",
        "dygz.dylib",
        "frida-*.dylib",
        "libcycript.dylib",
        "AAAInjectionFoundation.dylib",
        "afc2dService.dylib",
        "MobileSafety.dylib",
        "afc2dSupport.dylib",
        "SubstrateBootstrap.dylib",
        "AppSyncUnified-FrontBoard.dylib",
        "libsandy.dylib",
        "libmryipc.dylib",
        "Crane.dylib"
    ];

    Interceptor.attach(Module.findExportByName(null, 'dlopen'), {
        onEnter: function(args) {
            if (!args[0].isNull()) {
                var filename = Memory.readUtf8String(args[0]);
                var pathComponents = filename.split('/');
                var libraryName = pathComponents[pathComponents.length - 1];
                for (var i = 0; i < jbLibs.length; i++) {
                    if (libraryName.indexOf(jbLibs[i]) !== -1) {
                        args[0] = NULL;
                        //console.log("[*] Intercepted dlopen for library: " + libraryName);
                        return;
                    }
                }
            } else {
                //console.log("Invalid memory address for filename");
            }
        },
        onLeave: function(retval) {
            // Check the return value if necessary
            //console.log("dlopen returned: " + retval);
        }
    });


    Interceptor.attach(Module.findExportByName(null, '_dyld_get_image_name'), {
        onLeave: function(retval) {
            if (!retval.isNull()) {
                try {
                    var originalName = Memory.readUtf8String(retval);
                    for (var i = 0; i < jbLibs.length; i++) {
                        if (originalName.includes(jbLibs[i])) {
                            var modifiedName = "/System/Library/Frameworks/Library.dylib";
                            Memory.writeUtf8String(retval, modifiedName);
                            // console.log("[*] Intercepted library: " + jbLibs[i]);
                            // console.log("[*] Modified library name: " + modifiedName);
                            // console.log("[*] Original Dyld image name: " + originalName);
                            return;
                        }
                    }
                } catch (e) {
                    console.error("Error:", e);
                }
            } else {
                console.warn("Returned value is null");
            }
        }
    });



    // Hooking stat64
    const libSystemBdylibStat64 = Module.findExportByName("libSystem.B.dylib", "stat64");
    if (libSystemBdylibStat64) {
        Interceptor.attach(libSystemBdylibStat64, {
            onEnter: function(args) {
                this.is_common_path = true;
                this.arg = Memory.readUtf8String(args[0]);
                for (var path in jbPaths) {
                    if (this.arg.indexOf(jbPaths[path]) > -1) {
                        this.is_common_path = false;
                        //return -1;
                    }
                }
            },
            onLeave: function(retval) {
                if (retval.isNull()) {
                    return;
                }

                if (!this.is_common_path) {
                    //console.log(`stat64: bypass ` + this.arg);
                    retval.replace(-1);
                }
            }
        });
    }

    // Hooking libSystemBdylib stat
    const libSystemBdylibStat = Module.findExportByName("libSystem.B.dylib", "stat");
    if (libSystemBdylibStat) {
        Interceptor.attach(libSystemBdylibStat, {
            onEnter: function(args) {
                this.is_common_path = true;
                this.arg = Memory.readUtf8String(args[0]);
                for (var path in jbPaths) {
                    if (this.arg.indexOf(jbPaths[path]) > -1) {
                        this.is_common_path = false;
                    }
                }
            },
            onLeave: function(retval) {
                if (retval.isNull()) {
                    return;
                }

                if (!this.is_common_path) {
                    //console.log(`stat: bypass ` + this.arg);
                    retval.replace(-1);
                }
            }
        });
    }

    // Hooking lstat file check
    var lstatPtr = Module.findExportByName(null, 'lstat');
    if (lstatPtr !== null) {
        Interceptor.attach(lstatPtr, {
            onEnter: function(args) {
                var path = Memory.readUtf8String(args[0]);
                for (var i = 0; i < jbPaths.length; i++) {
                    if (path.indexOf(jbPaths[i]) !== -1) {
                        // Return null instead of performing the lstat operation
                        args[0] = NULL;
                        console.log("[*] Intercepted lstat for path matching: " + jbPaths[i]);
                        return;
                    }
                }
            },
            onLeave: function(retval) {
                //console.log("[*] lstat returned: " + retval);
            }
        });
    } else {
        console.log("[-] lstat not found");
    }

    // Hooking readlink file check
    var readlinkPtr = Module.findExportByName(null, 'readlink');
    if (readlinkPtr !== null) {
        Interceptor.attach(readlinkPtr, {
            onEnter: function(args) {
                var path = Memory.readUtf8String(args[0]);
                console.log("[*] \x1b[36mreadlink\x1b[0m called with path: \x1b[33m" + path + "\x1b[0m");
            },
            onLeave: function(retval) {
                retval.replace(ptr('0xffffffffffffffff'));
                console.log("[*] \x1b[36mreadlink\x1b[0m bypassed with value: \x1b[32m" + retval + "\x1b[0m");
            }
        });
    } else {
        console.log("[-] \x1b[31mreadlink\x1b[0m not found");
    }



    // Hooking open file access function
    Interceptor.attach(Module.findExportByName(null, "open"), {
        onEnter: function(args) {
            var filename = Memory.readUtf8String(args[0]);
            if (jbPaths.includes(filename)) {
                args[0] = ptr('0xffffffffffffffff');
                console.log("\x1b[36m[*] open called with filename: \x1b[0m" + filename + " \x1b[31m[Jailbreak detection bypassed]\x1b[0m");
            }
        },
        onLeave: function(retval) {
            if (retval.equals(ptr('0xffffffffffffffff'))) {
                //console.log("\x1b[32m[*] open returned: \x1b[0m" + retval);
            }
        }
    });

    // Hooking access file access function
    Interceptor.attach(Module.findExportByName(null, "access"), {
        onEnter: function(args) {
            var filename = Memory.readUtf8String(args[0]);
            if (jbPaths.includes(filename)) {
                args[0] = ptr('0xffffffffffffffff');
                console.log("\x1b[36m[*] access called with filename: \x1b[0m" + filename + " \x1b[31m[Jailbreak detection bypassed]\x1b[0m");
            }
        },
        onLeave: function(retval) {
            if (retval.equals(ptr('0xffffffffffffffff'))) {
                //console.log("\x1b[32m[*] access returned: \x1b[0m" + retval);
            }
        }
    });

} else {
    console.log("\x1b[31mObjective-C Runtime is not available\x1b[0m");
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1806502538 @sridharas04/darkprince-jailbreak-detection-bypass
