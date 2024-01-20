
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:684361578 @RohindhR/react-native-firebase-remote-config
// Author: Rohindh
// Github: https://github.com/RohindhR
// Date: 11/03/2024
// Version: 1.0
// Description: Frida script to list all the firebase remote config values
// Tested and developed for @react-native-firebase/app version 19.0.1 (https://www.npmjs.com/package/@react-native-firebase/app/v/19.0.1) and Frida version 16.2.1
// Usage: frida -U -f com.example.appname --codeshare RohindhR/react-native-firebase-remote-config
// Note: This script is for educational purposes only. Do not use it for illegal activities.
//      I am not responsible for any damage done by this script.
//      Use this script at your own risk.

Java.perform(function() {
    var remoteConfigClass = Java.use("io.invertase.firebase.config.UniversalFirebaseConfigModule");
    remoteConfigClass.getAllValuesForApp.implementation = function(appName) {
        var result = this.getAllValuesForApp(appName);
        var HashMapNode = Java.use('java.util.HashMap$Node');
        var iterator = result.entrySet().iterator();
        var count = 1;
        while (iterator.hasNext()) {
            var entry = Java.cast(iterator.next(), HashMapNode);
            console.log("Entry: " + count++);
            console.log(entry.getKey());
            console.log(entry.getValue());
            console.log("\n ____________ \n")
        }
        return result;
    }
})
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:684361578 @RohindhR/react-native-firebase-remote-config
