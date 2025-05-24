
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1697723530 @vumail159951/sh
Java.perform(function() {
    var RootBeer = Java.use("com.harrison.demo.autoairpay.ui.main.MainActivity");


    RootBeer.verifyInfo.overload().implementation = function() {
        return true;
    };


});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1697723530 @vumail159951/sh
