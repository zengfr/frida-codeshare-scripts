
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:35826141 @h4rithd/jailmonkey-bypass
/*
 ------------ JailMonkey Bypass All Checks -------------

 Description:
 This script dynamically instruments Android applications using Frida to bypass multiple security layers,
 including root detection, emulator detection, ADB/debugger checks, and JailMonkey anti-tampering mechanisms.

 Functionalities:
 1. Hooks and disables 'isEmulatorSync()' to fake real device environment.
 2. Prevents debugger detection by overriding 'Debug.isDebuggerConnected()'.
 3. Bypasses ADB enabled flag via Settings.Secure and Settings.Global.
 4. Intercepts JailMonkey’s 'getConstants()' and returns fake safe values.
 5. Bypasses development settings and debug mode checks in JailMonkey.
 7. Attempts to hook RootBeer detection mechanisms (if present).

 Example:
 frida -U --codeshare h4rithd/jailmonkey-bypass -f com.example.targetapp

 Author: Harith Dilshan | h4rithd.com
 GitHub: https://github.com/h4rithd
 Date: 23-June-2025
*/

Java.perform(() => {

    console.log(`
  ╔═════════════════════════════╗
  ║   JailMonkey Bypass Loaded  ║
  ║   Author: h4rithd           ║
  ╚═════════════════════════════╝
`);

    // Bypass isEmulatorSync
    const RNDeviceModule = Java.use('com.learnium.RNDeviceInfo.RNDeviceModule');
    console.log("➤ Hooking isEmulatorSync method...");
    RNDeviceModule.isEmulatorSync.implementation = function() {
        console.log("✔ isEmulatorSync() called → returning false");
        return false;
    };
    console.log("✔ Bypass for isEmulatorSync is now active.");

    // Bypass debugger + ADB settings
    const Debug = Java.use("android.os.Debug");
    const SettingsGlobal = Java.use("android.provider.Settings$Global");
    const SettingsSecure = Java.use("android.provider.Settings$Secure");

    Debug.isDebuggerConnected.implementation = function() {
        console.log("✔ Debug.isDebuggerConnected bypassed");
        return false;
    };

    SettingsSecure.getInt.overload("android.content.ContentResolver", "java.lang.String", "int").implementation = function(resolver, name, def) {
        if (name === "adb_enabled") {
            console.log("✔ adb_enabled (Secure) bypassed");
            return 0;
        }
        return this.getInt(resolver, name, def);
    };

    SettingsGlobal.getInt.overload("android.content.ContentResolver", "java.lang.String", "int").implementation = function(resolver, name, def) {
        if (name === "adb_enabled") {
            console.log("✔ adb_enabled (Global) bypassed");
            return 0;
        }
        return this.getInt(resolver, name, def);
    };

    // Patch JailMonkey.getConstants
    try {
        const JailMonkeyModule = Java.use('com.gantix.JailMonkey.JailMonkeyModule');
        JailMonkeyModule.getConstants.implementation = function() {
            const originalConstants = this.getConstants();
            const JBoolean = Java.use("java.lang.Boolean");

            originalConstants.put("isJailBroken", JBoolean.$new(false));
            console.log("✔ JailMonkey Root Check bypassed");

            originalConstants.put("hookDetected", JBoolean.$new(false));
            console.log("✔ Hook Check bypassed");

            originalConstants.put("canMockLocation", JBoolean.$new(false));
            console.log("✔ Mock Location Check bypassed");

            originalConstants.put("isOnExternalStorage", JBoolean.$new(false));
            console.log("✔ External Storage Check bypassed");

            originalConstants.put("AdbEnabled", JBoolean.$new(false));
            console.log("✔ ADB Flag bypassed");

            return originalConstants;
        };

        // Patch isDevelopmentSettingsMode
        JailMonkeyModule.isDevelopmentSettingsMode.overload("com.facebook.react.bridge.Promise").implementation = function(promise) {
            promise.resolve(Java.use("java.lang.Boolean").$new(false));
            console.log("✔ Development Settings Check bypassed");
        };

        // Patch isDebuggedMode
        JailMonkeyModule.isDebuggedMode.overload("com.facebook.react.bridge.Promise").implementation = function(promise) {
            promise.resolve(Java.use("java.lang.Boolean").$new(false));
            console.log("✔ isDebuggedMode Check bypassed");
        };

    } catch (err) {
        console.warn("⚠ JailMonkeyModule not found - skipping those hooks");
    }

    // Patch RootedCheck (if available)
    try {
        const RootCheck = Java.use("com.gantix.JailMonkey.Rooted.RootedCheck");
        RootCheck.getResultByDetectionMethod.implementation = function() {
            const resultMap = this.getResultByDetectionMethod();
            resultMap.put("jailMonkey", Java.use("java.lang.Boolean").$new(false));
            console.log("✔ JailMonkey RootedCheck bypassed");
            return resultMap;
        };
    } catch (err) {
        console.warn("⚠ RootedCheck class not found - skipping");
    }

    // Patch RootBeer checks (if available)
    try {
        const RootBeer = Java.use("com.gantix.JailMonkey.Rooted.RootedCheck$RootBeerResults");

        RootBeer.isJailBroken.implementation = function() {
            console.log("✔ RootBeer.isJailBroken bypassed");
            return false;
        };

        RootBeer.toNativeMap.implementation = function() {
            const nativeMap = this.toNativeMap.call(this);
            const JBoolean = Java.use("java.lang.Boolean");

            const keys = [
                "detectRootManagementApps",
                "detectPotentiallyDangerousApps",
                "checkForSuBinary",
                "checkForDangerousProps",
                "checkForRWPaths",
                "detectTestKeys",
                "checkSuExists",
                "checkForRootNative",
                "checkForMagiskBinary"
            ];

            keys.forEach(k => nativeMap.put(k, JBoolean.$new(false)));
            console.log("✔ RootBeer Detection Map fully bypassed");

            return nativeMap;
        };
    } catch (err) {
        console.warn("⚠ RootBeerResults class not found - skipping");
    }

});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:35826141 @h4rithd/jailmonkey-bypass
