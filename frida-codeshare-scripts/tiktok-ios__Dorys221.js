
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1882759995 @Dorys221/tiktok-ios
Interceptor.attach(ObjC.classes.TTHttpTask["- skipSSLCertificateError"].implementation, {
onEnter: function (args) {
    
},
onLeave: function (retval) {
    console.log('Overriding -> TTHttpTask skipSSLCertificateError : ');
    retval.replace(0x1)
}
});


console.log('Successfully Initalized SSL Bypass...');
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1882759995 @Dorys221/tiktok-ios
