
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1386521423 @imagogitter/seek-hook-destroy
function stalkJavaClass(className) {
    Java.perform(function() {
        try {
            var TargetClass = Java.use(className);
            console.log("[*] Stalking class: " + className);

            // Dynamically hook all methods of the class
            var methods = TargetClass.class.getDeclaredMethods();
            methods.forEach(function(method) {
                var methodName = method.getName();
                console.log("[*] Hooking method: " + methodName);

                TargetClass[methodName].overload().implementation = function() {
                    var args = Array.prototype.slice.call(arguments);
                    console.log("[*] Called: " + className + "." + methodName);
                    console.log("[*] Arguments: " + JSON.stringify(args));

                    // Print backtrace
                    console.log("[*] Backtrace:\n" + Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

                    // Call the original method
                    var retval = this[methodName].apply(this, args);
                    console.log("[*] Return value: " + retval);

                    return retval;
                };
            });
        } catch (e) {
            console.error("[!] Error stalking class: " + e);
        }
    });
}

function stalkJavaMethod(className, methodName, overloads) {
    Java.perform(function() {
        try {
            var TargetClass = Java.use(className);
            console.log("[*] Stalking method: " + className + "." + methodName);

            // Dynamically select the correct overload
            var method = TargetClass[methodName].overload.apply(TargetClass[methodName], overloads);
            method.implementation = function() {
                var args = Array.prototype.slice.call(arguments);
                console.log("[*] Called: " + className + "." + methodName);
                console.log("[*] Arguments: " + JSON.stringify(args));

                // Print backtrace
                console.log("[*] Backtrace:\n" + Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

                // Call the original method
                var retval = method.apply(this, args);
                console.log("[*] Return value: " + retval);

                return retval;
            };
        } catch (e) {
            console.error("[!] Error stalking method: " + e);
        }
    });
}

function findClassNames(pattern) {
    Java.perform(function() {
        console.log("[*] Searching for class names matching: " + pattern);

        // Regular expression for matching class names
        var regex = new RegExp(pattern, "i");

        // Enumerate all loaded classes
        Java.enumerateLoadedClasses({
            onMatch: function(className) {
                if (regex.test(className)) {
                    console.log("[*] Found: " + className);
                }
            },
            onComplete: function() {
                console.log("[*] Search completed.");
            }
        });
    });
}

function findAndStalk(pattern) {
    Java.perform(function() {
        console.log("[*] Searching for class names matching: " + pattern);
        var regex = new RegExp(pattern, "i");

        Java.enumerateLoadedClasses({
            onMatch: function(className) {
                if (regex.test(className)) {
                    console.log("[*] Found and stalking: " + className);
                    stalkJavaClass(className); // Automatically stalk this class
                }
            },
            onComplete: function() {
                console.log("[*] Search and stalk completed.");
            }
        });
    });
}

// Nullify all methods of a class
function nullifyClass(className) {
    Java.perform(function() {
        try {
            var TargetClass = Java.use(className);
            console.log("[*] Nullifying class: " + className);

            // Dynamically nullify all methods of the class
            var methods = TargetClass.class.getDeclaredMethods();
            methods.forEach(function(method) {
                var methodName = method.getName();
                console.log("[*] Nullifying method: " + methodName);

                TargetClass[methodName].overload().implementation = function() {
                    var args = Array.prototype.slice.call(arguments);
                    console.log("[*] Nullified method called: " + className + "." + methodName);
                    console.log("[*] Arguments: " + JSON.stringify(args));

                    // Return null or a default value
                    return null;
                };
            });
        } catch (e) {
            console.error("[!] Error nullifying class: " + e);
        }
    });
}

// Example usage:
// To search for class names:
findClassNames("Interceptor");

// To search for and automatically hook classes:
findAndStalk("Interceptor");

// To nullify all methods of a class:
nullifyClass("com.example.target.MyClass");
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1386521423 @imagogitter/seek-hook-destroy
