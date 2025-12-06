
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1213862487 @h4rithd/rootbeerultimate
/*
---------------- RootBeer Root Detection Bypass ----------------

Description:
This script uses the Frida dynamic instrumentation toolkit to bypass all root
detection mechanisms implemented within the popular RootBeer library for Android.
It hooks the library's core Java methods at runtime to consistently report a
non-rooted environment, allowing applications to run on rooted devices without
being blocked.

Functionalities:
1.  Master Bypass: Hooks and disables the main 'isRooted()' methods to
    prevent the primary root detection logic from executing.
2.  Binary Checks: Neutralizes checks for common root-related binaries,
    including 'su', 'busybox', and 'magisk'.
3.  Filesystem & Property Checks: Disables detection of dangerous system
    properties and writable paths (e.g., /system) that indicate a rooted device.
4.  Application Checks: Prevents the detection of known root management,
    cloaking, and other potentially dangerous applications.
5.  Test Key Detection: Bypasses checks for builds signed with common test keys.
6.  Native Code Bypass: Hooks the native-level root checks to ensure
    all layers of the RootBeer library are effectively disabled.

Example:
 frida -U --codeshare h4rithd/rootbeerultimate -f com.example.targetapp

Author: Harith D (h4rithd)
GitHub: https://github.com/h4rithd
Date: 11-August-2025
*/

Java.perform(function() {
    const className = "com.scottyab.rootbeer.RootBeer";
    console.log(`[*] Starting bypass for root checks in class: ${className}`);

    try {
        const RootBeer = Java.use(className);

        // --- Boolean Return Type Methods ---
        // These methods are hooked to always return `false`.
        const methodsToBypass = [
            // General checks
            "isRooted", "isRootedWithoutBusyBoxCheck", "isRootedWithBusyBoxCheck",
            // Specific checks
            "detectTestKeys", "checkForSuBinary", "checkForMagiskBinary",
            "checkForBusyBoxBinary", "checkForRWPaths", "checkForDangerousProps",
            "checkSuExists", "checkForNativeLibraryReadAccess", "canLoadNativeLibrary",
            "checkForRootNative"
        ];

        methodsToBypass.forEach(methodName => {
            RootBeer[methodName].implementation = function() {
                console.log(`[+] Bypassing ${className}.${methodName}() -> returning false`);
                return false;
            };
        });

        // --- Methods with String Array Argument ---
        const strArrayMethods = [
            "detectRootManagementApps", "detectPotentiallyDangerousApps", "detectRootCloakingApps"
        ];

        strArrayMethods.forEach(methodName => {
            RootBeer[methodName].overload('[Ljava.lang.String;').implementation = function(args) {
                console.log(`[+] Bypassing ${className}.${methodName}(String[]) -> returning false`);
                return false;
            };
        });

        // --- Method with Single String Argument ---
        RootBeer.checkForBinary.implementation = function(binaryName) {
            console.log(`[+] Bypassing ${className}.checkForBinary("${binaryName}") -> returning false`);
            return false;
        };

        // --- Object Return Type Methods ---
        // These methods are hooked to return `null`.
        const nullMethods = ["propsReader", "mountReader"];

        nullMethods.forEach(methodName => {
            RootBeer[methodName].implementation = function() {
                console.log(`[+] Bypassing ${className}.${methodName}() -> returning null`);
                return null;
            };
        });

        console.log(`[*] All targeted methods in ${className} have been successfully hooked.`);

    } catch (err) {
        console.error(`[!] Failed to find or hook class ${className}. The application may not use this library or it might be obfuscated.`);
        console.error(String(err.stack || err));
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1213862487 @h4rithd/rootbeerultimate
