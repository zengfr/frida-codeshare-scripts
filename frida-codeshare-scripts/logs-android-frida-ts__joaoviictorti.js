
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-48956416 @joaoviictorti/logs-android-frida-ts
Java.perform(function() {
    var log = Java.use("android.util.Log");

    var logLevels = ['e', 'd', 'v', 'i', 'w', 'wtf'];

    logLevels.forEach(function(level) {
        log[level].overload('java.lang.String', 'java.lang.String').implementation = function(key, value) {
            console.log(`${key} | ${value}`);
            return this[level](key, value);
        }

        log[level].overload('java.lang.String', 'java.lang.String', 'java.lang.Throwable').implementation = function(key, value, throwable) {
            console.log(`${key} | ${value} | ${throwable}`);
            return this[level](key, value, throwable);
        }
    });
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-48956416 @joaoviictorti/logs-android-frida-ts
