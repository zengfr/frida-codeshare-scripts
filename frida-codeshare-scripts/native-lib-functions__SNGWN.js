
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1555641060 @SNGWN/native-lib-functions
// frida script to get list of all loaded libraries from the application

// Frida Command to trigger this scirpt
// frida -U -f <target-package> --codeshare SNGWN/native-lib-functions -e 'package_name="package.name.here"' -e 'class_name="class_name_here"'

// Variables for Package Name and Class Name
var package_name = "package.name";
var class_name = "class_name";

Java.perform(function() {
    var Process = Java.use(package_name + '.' + class_name);
    console.log('\nMethods available on ' + class_name + ' :-:');

    // Get List of Functions from the class.
    var methods = Process.class.getDeclaredMethods();
    methods.forEach(function(method) {
        var methodName = method.getName();
        var parameterTypes = method.getParameterTypes();
        var parameterInfo = parameterTypes.map(function(type) {
            return type.getName();
        }).join(', ');
        console.log(methodName + '(' + parameterInfo + ')');
    });

    // Call the desired methods
    var instance = Process.$new();
    methods.forEach(function(method) {
        var methodName = method.getName();
        var parameterTypes = method.getParameterTypes();

        // Call methods without parameters
        if (parameterTypes.length === 0) {
            try {
                var result = instance[methodName]();
                console.log('\x1b[32m[+] ' + methodName + '(): ' + result + '\x1b[0m'); // Green color
            } catch (e) {
                console.log('\x1b[31m[!] Error calling ' + methodName + '(): ' + e.message + '\x1b[0m'); // Red color
            }
        }

        // Call methods with a single boolean parameter
        if (parameterTypes.length === 1 && parameterTypes[0].getName() === 'boolean') {
            try {
                var result = instance[methodName](true);
                console.log('\x1b[34m[+] ' + methodName + '(true): ' + result + '\x1b[0m'); // Blue color
            } catch (e) {
                console.log('\x1b[31m[!] Error calling ' + methodName + '(true): ' + e.message + '\x1b[0m'); // Red color
            }
        }
    });
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1555641060 @SNGWN/native-lib-functions
