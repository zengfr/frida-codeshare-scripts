
//https://github.com/zengfr/frida-codeshare-scripts
//1902146048 @segura2010/android-certificate-pinning-bypass
Java.perform(function () {
// Invalidate the certificate pinner set up
    var OkHttpClient = Java.use("com.squareup.okhttp.OkHttpClient");
    OkHttpClient.setCertificatePinner.implementation = function(certificatePinner){
        // do nothing
    console.log("Called!");
    return this;
    };

    // Invalidate the certificate pinnet checks (if "setCertificatePinner" was called before the previous invalidation)
    var CertificatePinner = Java.use("com.squareup.okhttp.CertificatePinner");
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
//https://github.com/zengfr/frida-codeshare-scripts
//1902146048 @segura2010/android-certificate-pinning-bypass
