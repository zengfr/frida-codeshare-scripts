
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1321633083 @damaidec/root-detection-bypass-for-cordova-plugin-devicecompile
Java.perform(function(){
    try {
        var Root = Java.use("cordova.plugin.devicecompile.devicecompile");
        
        if (Root) {
            console.log("cordova.plugin.devicecompile detected");
            Root.IsDrived.overload().implementation = function(){
                return false;
            };
        } else {
            console.log("cordova.plugin.devicecompile Not detected");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1321633083 @damaidec/root-detection-bypass-for-cordova-plugin-devicecompile
