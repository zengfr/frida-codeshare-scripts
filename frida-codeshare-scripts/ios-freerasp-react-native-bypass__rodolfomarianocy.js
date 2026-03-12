
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:712035349 @rodolfomarianocy/ios-freerasp-react-native-bypass
/*
    iOS freeRASP React Native Bypass by rodolfomarianocy
    frida -U -f <bundle_identifier> --codeshare rodolfomarianocy/ios-freerasp-react-native-bypass
    https://github.com/rodolfomarianocy/iOS-freeRASP-React-Native-Bypass
    https://github.com/rodolfomarianocy/Tricks-Pentest-Android-and-iOS-Applications
*/
console.warn("[+] iOS freeRASP React Native Bypass...")
if (ObjC.available) {
    try {
        Interceptor.replace(
            ObjC.classes.FreeraspReactNative['- talsecStart:withResolver:withRejecter:'].implementation,
            new NativeCallback(function() {}, 'void', [])
        );
    } catch (error) {
        console.log(error.message);
    }
} else {
    console.log("[-] ObjC Runtime unavailable");
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:712035349 @rodolfomarianocy/ios-freerasp-react-native-bypass
