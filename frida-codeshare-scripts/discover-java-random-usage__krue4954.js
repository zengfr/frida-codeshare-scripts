
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1483709372 @krue4954/discover-java-random-usage
Java.perform(
    function() {
        var javaRandom = Java.use("java.util.Random");
        console.log("[!] Found random loaded");
        javaRandom.nextInt.overload("int").implementation = function(a) {
            var ret = this.nextInt(a);
            console.log("[*] The random number: " + ret.toString());
            Java.perform(function() {
                console.log("[*] Calling method:" + Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()))
            });
            return ret;
        }
    }
);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1483709372 @krue4954/discover-java-random-usage
