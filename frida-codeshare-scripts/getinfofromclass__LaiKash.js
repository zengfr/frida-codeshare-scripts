
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1109261859 @LaiKash/getinfofromclass
// Call it inside Java.perform(function () {getInfoFromClass("com.example.class.name");});
// For fast exploration of a class with the signatures for the overloaded methods. 

function getInfoFromClass(className) {
    let javaClass = Java.use(className);
    const indent = "    "; // 4-space indentation

    console.log(`\nClass Name: ${className}`);

    // Attempt to log the constructors
    console.log("\n\nAvailable constructors:");
    let constructors = javaClass.class.getDeclaredConstructors();
    for (let i = 0; i < constructors.length; i++) {
        console.log(`${indent}Constructor: ${constructors[i]}`);
    }

    // Log and access fields
    console.log("\n\nAvailable fields:");
    var fields = javaClass.class.getDeclaredFields();
    fields.forEach(function(field) {
        let modifiers = field.getModifiers();
        let fieldName = field.getName();
        field.setAccessible(true);
        console.log(`${indent}Field name: ${fieldName}`);
        if ((modifiers & 0x0008) !== 0) { // Check if it's static (modifier 0x0008)
            console.log(`${indent}${indent}Static field found. Modifiers: ${getModifiersAsKeywords(modifiers)}`);
            //Trick to add the _ with the dynamic fieldName
            let fieldValue = eval('javaClass._' + fieldName + '.value');
            console.log(`${indent}${indent}Value: ${fieldValue}`);
        } else {
            console.log(`${indent}${indent}Not a static field. You need an instance, it's not populated. Modifiers: ${getModifiersAsKeywords(modifiers)}`);
        }
    });

    // Attempt to log the methods
    console.log("\n\nAvailable methods:");
    let seenMethodNames = new Set();
    javaClass.class.getDeclaredMethods().forEach(function(method) {
        let methodName = `Method name: ${method.getName()} ${indent} Modifiers: ${getModifiersAsKeywords(method.getModifiers())}`; // Get the method name as a string

        // Check if the method name has already been processed
        if (!seenMethodNames.has(methodName)) {
            console.log(`${indent}${methodName}`);
            seenMethodNames.add(methodName); // Add it to the set to mark it as processed

            // Check all overloads of this method
            console.log(`${indent}${indent}Overloads:`);
            javaClass[method.getName()].overloads.forEach(function(overload) {
                console.log(`${indent}${indent}${indent}Return type=${overload.returnType.className}, Arguments=${overload.argumentTypes.map(type => type.className).join(', ')}`);
            });
        }
    });


    function getModifiersAsKeywords(modifiers) {
        let keywords = [];
        if ((modifiers & 0x0001) !== 0) keywords.push("public");
        if ((modifiers & 0x0002) !== 0) keywords.push("private");
        if ((modifiers & 0x0004) !== 0) keywords.push("protected");
        if ((modifiers & 0x0008) !== 0) keywords.push("static");
        if ((modifiers & 0x0010) !== 0) keywords.push("final");
        if ((modifiers & 0x0020) !== 0) keywords.push("synchronized");
        if ((modifiers & 0x0100) !== 0) keywords.push("native");
        if ((modifiers & 0x0400) !== 0) keywords.push("abstract");
        if ((modifiers & 0x0800) !== 0) keywords.push("strict");
        return keywords;
    }

}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1109261859 @LaiKash/getinfofromclass
