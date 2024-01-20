
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1673970592 @0xshdax/bypass-root-plugins-cyberkatze-iroot
// Author: 0xshdax

Java.perform(function() {
    let IRoot = Java.use("de.cyberkatze.iroot.IRoot");
    IRoot["execute"].implementation = function(str, jSONArray, callbackContext) {
        this["execute"](str, jSONArray, callbackContext);
        console.log(`Bypass Root [!]`);
        return false;
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1673970592 @0xshdax/bypass-root-plugins-cyberkatze-iroot
