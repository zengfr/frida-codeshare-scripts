
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-592759538 @0tax00/ios-freerasp-bypass
/*
    GitHub: https://github.com/0tax00/ios-freerasp-bypass
    Usage: frida -U -f <bundle_identifier> -l freerasp-bypass-ios.js
*/

console.log("[+] freerasp-bypass-ios");
if (ObjC.available) {
    const cls = ObjC.classes.FreeraspReactNative;
    const method = cls['- talsecStart:withResolver:withRejecter:'];
    if (method) {
        method.implementation = new NativeCallback(() => {}, 'void', []);
    }
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-592759538 @0tax00/ios-freerasp-bypass
