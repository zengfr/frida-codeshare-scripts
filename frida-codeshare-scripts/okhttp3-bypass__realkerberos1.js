
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-935200537 @realkerberos1/okhttp3-bypass
Java.perform(function () {

    var CertificatePinner = Java.use("com.android.okhttp.CertificatePinner");
    CertificatePinner.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function(p0, p1){
        // do nothing
        console.log("Called! [Certificate]");
        return;
    };
    CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function(p0, p1){
        // do nothing
        console.log("Called! [List]");
        return;
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-935200537 @realkerberos1/okhttp3-bypass
