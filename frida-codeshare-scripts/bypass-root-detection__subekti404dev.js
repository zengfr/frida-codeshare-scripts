
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1321781079 @subekti404dev/bypass-root-detection
// Code for bypassing Alibaba IRoot library
Java.perform(function() {
    try {
        var Root = Java.use("com.alibaba.griver.base.common.utils.AOMPDeviceUtils");

        if (Root) {
            console.log("Alibaba IRoot detected");

            Root.isRooted.overload().implementation = function() {
                console.log("Alibaba IRoot called");
                return false;
            };
        } else {
            console.log("Alibaba IRoot Not detected");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
});

// Code for bypassing firebase IRoot library
Java.perform(function() {
    try {
        var Root = Java.use("com.google.firebase.crashlytics.internal.common.CommonUtils");

        if (Root) {
            console.log("firebase IRoot detected");

            Root.isRooted.overload().implementation = function() {
                console.log("firebase IRoot called");
                return false;
            };

            Root.isEmulator.overload().implementation = function() {
                console.log("firebase isEmulator called");
                return false;
            };

            Root.isDebuggerAttached.overload().implementation = function() {
                console.log("firebase isDebuggerAttached called");
                return false;
            };
            
            Root.getDeviceState.overload().implementation = function() {
                console.log("firebase getDeviceState called");
                return 0;
            };

            // Root.isAppDebuggable.overload().implementation = function() {
            //     console.log("firebase isAppDebuggable called");
            //     return false;
            // };
        } else {
            console.log("firebase IRoot Not detected");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
});

// // Code for bypassing dana IRoot library
// Java.perform(function() {
//     try {
//         var Root = Java.use("id.dana.data.config.DeviceInformationProvider");

//         if (Root) {
//             console.log("dana IRoot detected");

//             Root.isRooted.overload().implementation = function() {
//                 return false;
//             };
//         } else {
//             console.log("dana IRoot Not detected");
//         }
//     } catch (error) {
//         console.error("An error occurred:", error);
//     }
// });
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1321781079 @subekti404dev/bypass-root-detection
