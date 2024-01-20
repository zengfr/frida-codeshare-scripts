
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-894414445 @Zero3141/rootbeer-root-detection-bypass
/**
 * Android RootBeer Root Detection Bypass
 * by Heiko Kiesel
 * 
 * $ frida -U <app-id> -l rootbeer_bypass.js
 * 
 */


Java.perform(function() {
    const RootBeer = Java.use('com.scottyab.rootbeer.RootBeer');
    const RootBeerUtils = Java.use('com.scottyab.rootbeer.util.Utils');

    // isRooted
    RootBeer.isRooted.implementation = function() {
        console.log('isRooted called');
        return false;
    };

    // isRootedWithBusyBoxCheck
    RootBeer.isRootedWithBusyBoxCheck.implementation = function() {
        console.log('isRootedWithBusyBoxCheck called');
        return false;
    };

    // detectRootManagementApps
    RootBeer.detectRootManagementApps.overload('[Ljava.lang.String;').implementation = function() {
        console.log('Root Management Apps called');
        return false;
    }

    // detectPotentiallyDangerousApps
    RootBeer.detectPotentiallyDangerousApps.overload('[Ljava.lang.String;').implementation = function() {
        console.log('detectPotentiallyDangerousApps called');
        return false;
    };

    // detectRootCloakingApps
    RootBeer.detectRootCloakingApps.overload('[Ljava.lang.String;').implementation = function() {
        console.log('detectRootCloakingApps called');
        return false;
    };

    // detectTestKeys
    RootBeer.detectTestKeys.implementation = function() {
        console.log('TestKeys called');
        return false;
    };

    // checkForBusyBoxBinary
    RootBeer.checkForBusyBoxBinary.implementation = function() {
        console.log('checkForBusyBoxBinary called');
        return false;
    };

    // checkForSuBinary
    RootBeer.checkForSuBinary.implementation = function() {
        console.log('checkForSuBinary called');
        return false;
    };

    // checkSuExists
    RootBeer.checkSuExists.implementation = function() {
        console.log('checkSuExists called');
        return false;
    };

    // checkForRWPaths
    RootBeer.checkForRWPaths.implementation = function() {
        console.log('checkForRWPaths called');
        return false;
    };

    // checkForDangerousProps
    RootBeer.checkForDangerousProps.implementation = function() {
        console.log('checkForDangerousProps called');
        return false;
    };

    // SE linux Flag Is Enabled
    RootBeerUtils.isSelinuxFlagInEnabled.implementation = function() {
        console.log('SE linux Flag Is Enabled called');
        return false;
    }

    // checkForMagiskBinary
    RootBeer.checkForMagiskBinary.implementation = function() {
        console.log('checkForMagiskBinary called');
        return false;
    };

});


// Root via native check
const libtool_checker_checkForRoot = Module.getExportByName('libtool-checker.so', 'Java_com_scottyab_rootbeer_RootBeerNative_checkForRoot');
Interceptor.attach(libtool_checker_checkForRoot, {
    onEnter(args) {
        console.log('Root via native check called');
    },
    onLeave(retval) {
        retval.replace(0); // overwrite with false
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-894414445 @Zero3141/rootbeer-root-detection-bypass
