
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1581263712 @Hyupai/dumper
Java.perform(function() {
    // Enumerate all classes loaded in the application
    Java.enumerateLoadedClasses({
        onMatch: function(className) {
            try {
                // Get a reference to the class
                var clazz = Java.use(className);

                // Enumerate all methods of the class
                var methods = clazz.class.getDeclaredMethods();
                
                methods.forEach(function(method) {
                    var methodName = method.getName();

                    // Hook the method
                    clazz[methodName].overload().implementation = function() {
                        // Log the method call
                        console.log('Called: ' + className + '.' + methodName);

                        // Call the original method and get the result
                        var result = this[methodName].apply(this, arguments);

                        // Optionally, modify the result here if needed

                        // Return the result
                        return result;
                    };
                });

            } catch (error) {
                // Catch any errors (e.g., methods that can't be hooked)
                console.error("Error hooking " + className + ": " + error);
            }
        },
        onComplete: function() {
            console.log('Finished hooking all methods.');
        }
    });
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1581263712 @Hyupai/dumper
