
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:2091026388 @latestnew1310/final-ultimate-bypass-avinash
/**
 * FINAL ULTIMATE BYPASS
 * Combines all working bypasses and adds missing pieces
 */

console.log("[🎯] Starting Final Ultimate Bypass");

Java.perform(function() {
    console.log("[✅] Applying final ultimate bypasses...");

    // ========== COMPLETE TERMINATION PROTECTION ========== //
    var killCount = 0;
    Java.use("android.os.Process").killProcess.implementation = function(pid) {
        killCount++;
        console.log("[🛡️] BLOCKED killProcess #" + killCount + " - App stays alive");
        // Don't call original - keep app running
    };

    Java.use("java.lang.System").exit.implementation = function(code) {
        console.log("[🛡️] BLOCKED System.exit(" + code + ")");
    };

    // ========== STRING DETECTION BYPASS ========== //
    try {
        var String = Java.use("java.lang.String");

        // Hook equals method
        String.equals.implementation = function(other) {
            var result = this.equals.call(this, other);
            if (other && (other.toString().toLowerCase() === "root" || other.toString().toLowerCase().includes("root"))) {
                console.log("[✅] String.equals('root') -> FORCED FALSE");
                return false;
            }
            return result;
        };

        // Hook contains method
        String.contains.implementation = function(sequence) {
            var result = this.contains.call(this, sequence);
            if (sequence && sequence.toString().toLowerCase().includes("root")) {
                console.log("[✅] String.contains('root') -> FORCED FALSE");
                return false;
            }
            return result;
        };

        // Hook equalsIgnoreCase
        String.equalsIgnoreCase.implementation = function(other) {
            var result = this.equalsIgnoreCase.call(this, other);
            if (other && other.toString().toLowerCase().includes("root")) {
                console.log("[✅] String.equalsIgnoreCase('root') -> FORCED FALSE");
                return false;
            }
            return result;
        };
    } catch (e) {}

    // ========== SECURITYCHECK COMPLETE BYPASS ========== //
    try {
        var SecurityCheck = Java.use("com.example.example.example");
        var methods = SecurityCheck.class.getDeclaredMethods();
        methods.forEach(function(method) {
            var methodName = method.getName();
            try {
                SecurityCheck[methodName].implementation = function() {
                    console.log("[✅] SecurityCheck." + methodName + " -> NEUTRALIZED");
                    if (method.getReturnType().getName() === "boolean") return false;
                    if (method.getReturnType().getName() === "void") return;
                    return null;
                };
            } catch (e) {}
        });
    } catch (e) {}

    // ========== ROOT DETECTION BYPASS ========== //

    // File detection
    try {
        var File = Java.use("java.io.File");
        File.exists.implementation = function() {
            var path = this.getPath();
            if (path && (path.includes("/su") || path.includes("/magisk") || path.includes("busybox"))) {
                return false;
            }
            return this.exists.call(this);
        };
    } catch (e) {}

    // Command execution
    try {
        var Runtime = Java.use("java.lang.Runtime");
        Runtime.exec.overload('[Ljava.lang.String;').implementation = function(cmdArray) {
            if (cmdArray) {
                var cmd = cmdArray.join(" ");
                if (cmd.includes("su") || cmd.includes("which") || cmd.includes("busybox")) {
                    console.log("[✅] Blocked command: " + cmd);
                    return null;
                }
            }
            return this.exec.call(this, cmdArray);
        };
    } catch (e) {}

    // ========== POPUP & UI BYPASS ========== //

    // Hook ALL dialog and popup methods
    try {
        var Dialog = Java.use("android.app.Dialog");
        Dialog.show.implementation = function() {
            console.log("[🔍] Dialog.show() called - CHECKING FOR ROOT POPUP");

            // Try to detect if this is a root detection popup
            try {
                // Check various fields that might contain the message
                var fields = ["mTitle", "mMessage", "message", "mAlert"];
                for (var i = 0; i < fields.length; i++) {
                    try {
                        var field = Dialog.class.getDeclaredField(fields[i]);
                        field.setAccessible(true);
                        var value = field.get(this);
                        if (value && value.toString().toLowerCase().includes("root")) {
                            console.log("[🚨] ROOT POPUP DETECTED AND BLOCKED");
                            console.log("[🚨] Field: " + fields[i] + ", Value: " + value);
                            return; // Block the popup
                        }
                    } catch (e) {}
                }
            } catch (e) {}

            return this.show.call(this);
        };
    } catch (e) {}

    // Hook Toast messages
    try {
        var Toast = Java.use("android.widget.Toast");
        Toast.makeText.overload('android.content.Context', 'java.lang.CharSequence', 'int').implementation = function(context, text, duration) {
            if (text && text.toString().toLowerCase().includes("root")) {
                console.log("[🚨] ROOT TOAST BLOCKED: " + text);
                return null;
            }
            return this.makeText.call(this, context, text, duration);
        };
    } catch (e) {}

    // ========== ADDITIONAL DETECTION BYPASS ========== //

    // Build properties
    try {
        var Build = Java.use("android.os.Build");
        Build.TAGS.value = "release-keys";
    } catch (e) {}

    // System properties
    try {
        var SystemProperties = Java.use("android.os.SystemProperties");
        SystemProperties.get.overload('java.lang.String').implementation = function(key) {
            if (key === "ro.debuggable") return "0";
            if (key === "ro.secure") return "1";
            return this.get.call(this, key);
        };
    } catch (e) {}

    // ========== MONITOR FOR MISSING DETECTIONS ========== //

    // Hook all boolean methods in the app package
    setTimeout(function() {
        Java.enumerateLoadedClasses({
            onMatch: function(className) {
                if (className.startsWith("com.example.")) {
                    try {
                        var cls = Java.use(className);
                        var methods = cls.class.getDeclaredMethods();

                        methods.forEach(function(method) {
                            var methodName = method.getName();
                            var returnType = method.getReturnType().getName();

                            // Hook any boolean method that might be a detection
                            if (returnType === "boolean" &&
                                (methodName.toLowerCase().includes("check") ||
                                    methodName.toLowerCase().includes("detect") ||
                                    methodName.toLowerCase().includes("is") ||
                                    methodName.toLowerCase().includes("has"))) {

                                try {
                                    var originalMethod = cls[methodName];
                                    cls[methodName].implementation = function() {
                                        var result = originalMethod.apply(this, arguments);
                                        if (result === true) {
                                            console.log("[🚨] DETECTION FOUND: " + className + "." + methodName + " = true");
                                            console.log("[✅] FORCING TO FALSE");
                                        }
                                        return false; // Always return false
                                    };
                                } catch (e) {}
                            }
                        });
                    } catch (e) {}
                }
            },
            onComplete: function() {
                console.log("[✅] Comprehensive detection bypass complete");
            }
        });
    }, 2000);

    console.log("[🎉] Final ultimate bypass applied successfully!");
    console.log("[🚀] App should now work without root detection!");
});

console.log("[🎯] Final bypass loaded - ready to use!");
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:2091026388 @latestnew1310/final-ultimate-bypass-avinash
