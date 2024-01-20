
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-147782172 @oleavr/vipps-antijb
'use strict';

var method = ObjC.classes.VPSUtils['+ isJailbroken'];
method.implementation = ObjC.implement(method, function (handle, selector) {
  console.log('+[VPSUtils isJailbroken] => nope!');
  return false;
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-147782172 @oleavr/vipps-antijb
