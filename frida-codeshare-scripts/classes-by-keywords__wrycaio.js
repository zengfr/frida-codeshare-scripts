
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1440674564 @wrycaio/classes-by-keywords
// script.js
var keywords = ["Security", "Encryption", "Interceptor", "intercept", "ssl"];
var loadedClasses = [];

Java.perform(function() {
    var classLoaded = Java.enumerateLoadedClassesSync();
    classLoaded.forEach(function(className) {
        keywords.forEach(function(keyword) {
            if (!loadedClasses.includes(className) && className.includes(keyword)) {
                loadedClasses.push("[+] Dumped: " + className + "\n");
            }
        });
    });
    console.log(loadedClasses);
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1440674564 @wrycaio/classes-by-keywords
