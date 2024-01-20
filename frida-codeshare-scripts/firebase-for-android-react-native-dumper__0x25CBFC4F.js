
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-169133718 @0x25CBFC4F/firebase-for-android-react-native-dumper
/*
    Obviously only works on application start.
    Start your app via frida -U -f <app name> --codeshare 0x25CBFC4F/firebase-for-react-native-dumper
    And wait a bit.
*/

let AppModuleInstance = null;

Java.perform(() => {
    const c = "io.invertase.firebase.app.ReactNativeFirebaseAppModule";
    let ReactNativeFirebaseAppModule = Java.use(c);
    ReactNativeFirebaseAppModule["$init"].implementation = function(bridgeAppContext) {
        console.log("\nCaught instance ReactNativeFirebaseAppModule: " + this);
        AppModuleInstance = Java.retain(this);
        return this["$init"](bridgeAppContext);
    }
});

setTimeout(function() {
    Java.perform(() => {
        console.log("Got appmodule: " + AppModuleInstance);
        console.log("getConstants() -> ");
        let constants = AppModuleInstance.getConstants();

        var keys = constants.keySet();
        var iterator = keys.iterator();
        while (iterator.hasNext()) {
            var k = iterator.next();
            console.log(k + " : " + constants.get(k));
        }
    });
}, 1000);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-169133718 @0x25CBFC4F/firebase-for-android-react-native-dumper
