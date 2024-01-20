
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1854403828 @sahabrifki/okhttp3-obfuscated---ssl-pinning-bypass
Java.perform(function() {

    let Pin_a = Java.use("okhttp3.CertificatePinner$Pin");
    Pin_a["a"].overload('java.lang.String').implementation = function(hostname) {
        //console.log(`Pin.a is called: hostname=${hostname}`);
        let result = this["a"](hostname);
        //console.log(`Pin.a result=${result}`);
        return false;
    };



    let CertificatePinner = Java.use("okhttp3.CertificatePinner");
    CertificatePinner["equals"].implementation = function(obj) {
        //console.log(`CertificatePinner.equals is called: obj=${obj}`);
        let result = this["equals"](obj);
        //console.log(`CertificatePinner.equals result=${result}`);
        return true;
    };


});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1854403828 @sahabrifki/okhttp3-obfuscated---ssl-pinning-bypass
