
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-113227711 @abduxg/strwrt
Java.perform(function() {
    var seenClasses = new Set();


    console.log("Waiting for classes to load...");

    setTimeout(function() {
        try {

            var classes = Java.enumerateLoadedClassesSync();


            classes.forEach(function(className) {
                if (className === 'java.lang.String') {
                    try {
                        var StringClass = Java.use(className);


                        StringClass.$init.overload('java.lang.String').implementation = function(value) {

                            var stackTrace = Java.use('java.lang.Thread').currentThread().getStackTrace();


                            for (var i = stackTrace.length - 1; i >= 0; i--) {
                                var callingClass = stackTrace[i].getClassName();


                                if (!seenClasses.has(callingClass)) {
                                    seenClasses.add(callingClass);
                                    console.log("[String] Created: " + value + " from class: " + callingClass);
                                    break;
                                }
                            }

                            return this.$init(value);
                        };


                        StringClass.toString.implementation = function() {
                            var result = this.toString();
                            if (result !== "") {

                                var stackTrace = Java.use('java.lang.Thread').currentThread().getStackTrace();


                                for (var i = stackTrace.length - 1; i >= 0; i--) {
                                    var callingClass = stackTrace[i].getClassName();


                                    if (!seenClasses.has(callingClass)) {
                                        seenClasses.add(callingClass);

                                        if (result !== "$" && result.trim() !== "")
                                            console.log("[String] VALUE: " + result + " from class: " + callingClass);
                                        break;
                                    }
                                }
                            }
                            return result;
                        };
                    } catch (e) {
                        console.log("Error with StringClass: " + e.message);
                    }
                }
            });
        } catch (e) {
            console.log("Error in enumerating classes: " + e.message);
        }
    }, 2000);
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-113227711 @abduxg/strwrt
