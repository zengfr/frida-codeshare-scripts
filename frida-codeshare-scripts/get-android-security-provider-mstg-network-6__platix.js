
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1091476162 @platix/get-android-security-provider-mstg-network-6
Java.perform(function () { 
var Sec = Java.use("java.security.Security");
var SecInstance = Sec.$new(); 
console.log(SecInstance.getProviders());

});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1091476162 @platix/get-android-security-provider-mstg-network-6
