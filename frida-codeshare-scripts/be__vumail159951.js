
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1738798346 @vumail159951/be
Java.perform(function(){
    var RootBeer = Java.use("com.scottyab.rootbeer.RootBeer");
    var Utils = Java.use("com.scottyab.rootbeer.util.Utils");   
    
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
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1738798346 @vumail159951/be
