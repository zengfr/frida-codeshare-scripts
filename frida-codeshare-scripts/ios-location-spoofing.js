
//https://github.com/zengfr/frida-codeshare-scripts
//-1744523822 @securitytest3r/ios-location-spoofing
/*
Author: Divya Mudgal
LinkedIn: https://www.linkedin.com/in/divya-mudgal
Twitter: https://twitter.com/divya_mudgal
Apple Documentation: https://developer.apple.com/documentation/corelocation/cllocation
*/
function spoof_location(spoof_latitude, spoof_longitude)
{
var hook_cllocation = ObjC.classes["CLLocation"]["- coordinate"]
Interceptor.attach(hook_cllocation.implementation, {
  onLeave: function(return_value) {
//console.log(new ObjC.Object(return_value))
var spoofed_return_value = (new ObjC.Object(return_value)).initWithLatitude_longitude_(spoof_latitude, spoof_longitude)
return_value.replace(spoofed_return_value)
  }
});
}
//Mention latitude and longitude in below function call
//spoof_location(27.1753336,78.0417905)
//https://github.com/zengfr/frida-codeshare-scripts
//-1744523822 @securitytest3r/ios-location-spoofing
