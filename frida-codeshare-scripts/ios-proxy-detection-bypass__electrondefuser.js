
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1211731708 @electrondefuser/ios-proxy-detection-bypass
/* 
    Author: Vineet Nair (electrondefuser), Siddharth Saxena (s1dds)
    Organization: XYSec Labs (Appknox)
*/

const CFNetwork = Module.getExportByName('CFNetwork', 'CFNetworkCopySystemProxySettings');
console.log("[+] Found CFNetwork as " + ptr(CFNetwork))

Interceptor.attach(CFNetwork, {
    onEnter(args) {
        console.log("[+] Detected Proxy Check");
    },

    onLeave(retval) {
        var NSDict = ObjC.classes.NSMutableDictionary.alloc().init();
        var data = getDefaultNetworkingConfig();
        var keys = Object.keys(data);

        for (var i = 0; i < keys.length; i++) {
            NSDict.setObject_forKey_(keys[0], data[keys[0]]);
        }

        console.log("[+] Bypassing with iOS default networking values")
        retval.replace(NSDict)
    }
});

function getDefaultNetworkingConfig() {
    var config = {
        "FTPPassive": "1",
        "ExceptionsList": "(\"*.local\", \"169.254/16\")",
        "__SCOPED__": "{ en0 = {ExceptionsList = (\"*.local\", \"169.254/16\"); FTPPassive = 1; }; }"
    }

    return config
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1211731708 @electrondefuser/ios-proxy-detection-bypass
