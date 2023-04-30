/*  Android ssl certificate pinning bypass script for various methods
by Maurizio Siddu

Run with:
frida -U -f [APP_ID] -l frida_multiple_unpinning.js --no-pause
*/

setTimeout(function() {
    Java.perform(function() {
  //const StringBuilder = Java.use('com.viviet.login.KeystoreUtil');
  //const emulator = Java.use('com.viviet.utils.EmulatorDetector');



  var ver = Java.use('android.os.Build$VERSION');
//console.log("Version before: "+ver.SDK_INT.value);
ver.SDK_INT.value = 15;
//console.log("Version after: "+ver.SDK_INT.value);

 // emulator.detect.overload().implementation = function () {
//return false;
 // }


//  StringBuilder.sign.implementation = function (x, y) {
 //       console.log("original call: " + x + " ----------------- " + y + " -------------");
   //     return this.sign(x, y);
  // };

});

}, 0);
//https://github.com/zengfr/frida-codeshare-scripts
//1780135977 @vumail159951/fgdgd