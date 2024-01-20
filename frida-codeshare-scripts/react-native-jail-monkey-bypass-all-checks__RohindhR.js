
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1504231427 @RohindhR/react-native-jail-monkey-bypass-all-checks
// Author: Rohindh
// Github: https://github.com/RohindhR
// Date: 08/03/2024
// Version: 1.0
// Description: Frida script for bypassing React Native Jail Monkey checks
// Tested and developed for Jail Monkey version 2.8.0 (https://www.npmjs.com/package/jail-monkey/v/2.8.0) and Frida version 16.2.1
// Usage: frida -U -f com.example.appname --codeshare RohindhR/react-native-jail-monkey-bypass-all-checks
// Note: This script is for educational purposes only. Do not use it for illegal activities.
//      I am not responsible for any damage done by this script.
//      Use this script at your own risk.

Java.perform(function() {
    // Bypassing Root, Hook, Mock Location, External Storage, ADB checks
    Java.use('com.gantix.JailMonkey.JailMonkeyModule').getConstants.implementation = function() {
        var hashmap = this.getConstants();
        hashmap.put('isJailBroken', Java.use("java.lang.Boolean").$new(false));
        console.log(`Root Check Bypassed : ✅`);

        hashmap.put('hookDetected', Java.use("java.lang.Boolean").$new(false));
        console.log(`Hook Check Bypassed : ✅`);

        hashmap.put('canMockLocation', Java.use("java.lang.Boolean").$new(false));
        console.log(`Mock Location Check Bypassed : ✅`);

        hashmap.put('isOnExternalStorage', Java.use("java.lang.Boolean").$new(false));
        console.log(`External Storage Check Bypassed : ✅`);

        hashmap.put('AdbEnabled', Java.use("java.lang.Boolean").$new(false));
        console.log(`ADB Check Bypassed : ✅`);

        return hashmap;
    }

    // Bypassing Rooted Check
    let RootedCheckClass = Java.use("com.gantix.JailMonkey.Rooted.RootedCheck")
    RootedCheckClass.getResultByDetectionMethod.implementation = function() {
        let map = this.getResultByDetectionMethod();
        map.put("jailMonkey", Java.use("java.lang.Boolean").$new(false));
        return map;
    }

    // Bypassing Root detection method's result of RootBeer library
    var RootBeerResultsClass = Java.use("com.gantix.JailMonkey.Rooted.RootedCheck$RootBeerResults");
    RootBeerResultsClass.isJailBroken.implementation = function() {
        return false;
    };

    RootBeerResultsClass.toNativeMap.implementation = function() {
        var map = this.toNativeMap.call(this);
        map.put("detectRootManagementApps", Java.use("java.lang.Boolean").$new(false));
        map.put("detectPotentiallyDangerousApps", Java.use("java.lang.Boolean").$new(false));
        map.put("checkForSuBinary", Java.use("java.lang.Boolean").$new(false));
        map.put("checkForDangerousProps", Java.use("java.lang.Boolean").$new(false));
        map.put("checkForRWPaths", Java.use("java.lang.Boolean").$new(false));
        map.put("detectTestKeys", Java.use("java.lang.Boolean").$new(false));
        map.put("checkSuExists", Java.use("java.lang.Boolean").$new(false));
        map.put("checkForRootNative", Java.use("java.lang.Boolean").$new(false));
        map.put("checkForMagiskBinary", Java.use("java.lang.Boolean").$new(false));

        console.log("Root detection method's result bypass : ✅");

        return map;
    };

    // Bypassing Development settings check
    Java.use("com.gantix.JailMonkey.JailMonkeyModule").isDevelopmentSettingsMode.overload("com.facebook.react.bridge.Promise").implementation = function(p) {
        p.resolve(Java.use("java.lang.Boolean").$new(false));
        console.log("isDevelopmentSettingsMode Check Bypassed : ✅");
    }

    // Bypassing Debugger check
    Java.use("com.gantix.JailMonkey.JailMonkeyModule").isDebuggedMode.overload("com.facebook.react.bridge.Promise").implementation = function(p) {
        p.resolve(Java.use("java.lang.Boolean").$new(false));
        console.log("isDebuggerConnected Check Bypassed : ✅");
    }
})
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1504231427 @RohindhR/react-native-jail-monkey-bypass-all-checks
