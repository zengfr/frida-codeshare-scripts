
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:303557466 @AkhileshCh/sslpinningmine
setTimeout(function() {
    Java.perform(function() {
       
    var array_list = Java.use("java.util.ArrayList");
    var ApiClient = Java.use('com.android.org.conscrypt.TrustManagerImpl');

    ApiClient.checkTrustedRecursive.implementation = function(a1, a2, a3, a4, a5, a6) {
        // console.log('Bypassing SSL Pinning');
        var k = array_list.$new();
        return k;
    }
        var CommonUtils = Java.use('l.a.a.a.o.b.i');
        CommonUtils.i.overload('android.content.Context').implementation = function(context) {
            console.log("[+] bypassRootDetection");
            return false;
        }
    });
}, 0);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:303557466 @AkhileshCh/sslpinningmine
