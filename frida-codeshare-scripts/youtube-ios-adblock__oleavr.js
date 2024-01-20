
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1504812317 @oleavr/youtube-ios-adblock
'use strict';

Module.ensureInitialized('Module_Framework');

var isMonetized = ObjC.classes.YTIPlayerResponse['- isMonetized'];
isMonetized.implementation = ObjC.implement(isMonetized, function () {
  return false;
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1504812317 @oleavr/youtube-ios-adblock
