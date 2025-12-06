
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:985738484 @DevTraleski/android-ios-freerasp-bypass
/*
    Android/iOS freeRASP Bypass by DevTraleski (Based on rodolfomarianocy/ios-freerasp-react-native-bypass )
    frida -U -f <bundle_identifier> --codeshare DevTraleski/android-ios-freerasp-bypass
    https://github.com/rodolfomarianocy/iOS-freeRASP-React-Native-Bypass
    https://github.com/rodolfomarianocy/Tricks-Pentest-Android-and-iOS-Applications
*/
//In case of class not found, use JADX to find the path
console.warn("[+] Android/iOS freeRASP React Native Bypass...")
if (ObjC.available) {
    try {
        Interceptor.replace(
            ObjC.classes.FreeraspReactNative['- talsecStart:withResolver:withRejecter:'].implementation,
            new NativeCallback(function() {}, 'void', [])
        );
    } catch (error) {
        console.log(error.message);
    }
} else if (Java.available) {
    Java.perform(function() {
        try {
            Interceptor.replace(
                Java.use("com.freerasp.FreeraspNativeModule").talsecStart.implementation,
                new NativeCallback(function() {}, 'void', [])
            );
        } catch (error) {
            console.log(error.message);
        }
    });
} else {
    console.log("[-] ObjC/Java Runtime unavailable");
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:985738484 @DevTraleski/android-ios-freerasp-bypass
