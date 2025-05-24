
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:69491175 @anubi5egypt/jailmonkey-root-detection-bypass
/**
Root detection bypass script for Gantix JailMoney
https://github.com/GantMan/jail-monkey
**/
Java.perform(() => {
    const klass = Java.use("com.gantix.JailMonkey.JailMonkeyModule");
    const hashmap_klass = Java.use("java.util.HashMap");
    const false_obj = Java.use("java.lang.Boolean").FALSE.value;

    klass.getConstants.implementation = function() {
        var h = hashmap_klass.$new();
        h.put("isJailBroken", false_obj);
        h.put("hookDetected", false_obj);
        h.put("canMockLocation", false_obj);
        h.put("isOnExternalStorage", false_obj);
        h.put("AdbEnabled", false_obj);
        return h;
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:69491175 @anubi5egypt/jailmonkey-root-detection-bypass
