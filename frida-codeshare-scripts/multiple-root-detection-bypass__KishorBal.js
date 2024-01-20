
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1996314976 @KishorBal/multiple-root-detection-bypass
// Code for bypassing CyberKatze IRoot library
Java.perform(function(){
    try {
        var Root = Java.use("de.cyberkatze.iroot.IRoot");
        
        if (Root) {
            console.log("CyberKatze IRoot detected");

            Root.isDeviceRooted.overload().implementation = function(){
                return false;
            };
        } else {
            console.log("CyberKatze IRoot Not detected");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
});

// Code for bypassing Stericson library
Java.perform(function(){
    try {
        var Root = Java.use("com.stericson.RootShell.RootShell");
        
        if (Root) {
            console.log("Stericson Root detected");

            Root.isRootAvailable.overload().implementation = function(){
                return false;
            };
        } else {
            console.log("Stericson Root not detected");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
});

// Code for bypassing Jailmonkey library
Java.perform(function(){
    try {
        var Root = Java.use("com.gantix.JailMonkey.Rooted");
        
        if (Root) {
            console.log("JailMonkey Root detected");

            Root.RootedCheck.overload().implementation = function(){
                return false;
            };
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
});

Java.perform(() => {
    try {
        const klass = Java.use("com.gantix.JailMonkey.JailMonkeyModule");
        const hashmap_klass = Java.use("java.util.HashMap");
        const false_obj = Java.use("java.lang.Boolean").FALSE.value;

        klass.getConstants.implementation = function () {
            var h = hashmap_klass.$new();
            h.put("isJailBroken", false_obj);
            h.put("hookDetected", false_obj);
            h.put("canMockLocation", false_obj);
            h.put("isOnExternalStorage", false_obj);
            h.put("AdbEnabled", false_obj);
            return h;
        };
    } catch (error) {
        console.error("An error occurred:", error);
    }
});

// Code for bypassing RootBeer library
Java.perform(function(){
    try {
        var RootBeer = Java.use("com.scottyab.rootbeer.RootBeer");
        var Utils = Java.use("com.scottyab.rootbeer.util.Utils"); 
        
        if (RootBeer) {
            console.log("RootBeer Root detected");
            
            RootBeer.detectRootManagementApps.overload().implementation = function(){
                return false;
            };
            
            RootBeer.detectPotentiallyDangerousApps.overload().implementation = function(){
        return false;
    };
    
    RootBeer.detectTestKeys.overload().implementation = function(){
        return false;
    };
    
    RootBeer.checkForBusyBoxBinary.overload().implementation = function(){
        return false;
    };
    
    RootBeer.checkForSuBinary.overload().implementation = function(){
        return false;
    };
    
    RootBeer.checkSuExists.overload().implementation = function(){
        return false;
    };
    
    RootBeer.checkForRWPaths.overload().implementation = function(){
        return false;
    };
    
    RootBeer.checkForDangerousProps.overload().implementation = function(){
        return false;
    };
    
    RootBeer.checkForRootNative.overload().implementation = function(){
        return false;
    };
    
    RootBeer.detectRootCloakingApps.overload().implementation = function(){
        return false;
    };
    
    Utils.isSelinuxFlagInEnabled.overload().implementation = function(){
        return false;
    };
    
    RootBeer.checkForMagiskBinary.overload().implementation = function(){
        return false;
    };

            RootBeer.isRooted.overload().implementation = function(){
                return false;
            };
        } else {
            console.log("RootBeer Root not detected");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1996314976 @KishorBal/multiple-root-detection-bypass
