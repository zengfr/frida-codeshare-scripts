
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:629707450 @roopaks31051987-maker/reveny-emulator-bypassjs
/*
I developed a custom Frida script to bypass emulator detection in the 
Reveny Android Emulator Detection project emulator-detection-demo-v1.5.0.apk (https://github.com/reveny/Android-Emulator-Detection).

By reverse-engineering the native library, identifying its detection flow, 
and intercepting critical return values, I crafted a targeted Frida hook 
that successfully bypasses all checks.
*/

Java.perform(function () {
    var emuDetectorClass = Java.use("com.reveny.emulatordetector.plugin.EmulatorDetection");

    emuDetectorClass.isDetected.implementation = function () {
        console.log("Bypassed isDetected()");
        return false;
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:629707450 @roopaks31051987-maker/reveny-emulator-bypassjs
