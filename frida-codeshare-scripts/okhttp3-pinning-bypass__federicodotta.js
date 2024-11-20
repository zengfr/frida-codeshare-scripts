
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1755351394 @federicodotta/okhttp3-pinning-bypass
/* 
 *  Description: OkHttp3 various SSL Pinning bypasses, including versions 4.2+.
 *  Authors:  @apps3c and @pcipolloni
 */

setTimeout(function() {

    Java.perform(function () {

var okhttp3_CertificatePinner_class = null;
try {
            okhttp3_CertificatePinner_class = Java.use('okhttp3.CertificatePinner');    
        } catch (err) {
            console.log('[-] OkHTTPv3 CertificatePinner class not found. Skipping.');
            okhttp3_CertificatePinner_class = null;
        }

        if(okhttp3_CertificatePinner_class != null) {

        try{
            okhttp3_CertificatePinner_class.check.overload('java.lang.String', 'java.util.List').implementation = function (str,list) {
                console.log('[+] Bypassing OkHTTPv3 1: ' + str);
                return true;
            };
            console.log('[+] Loaded OkHTTPv3 hook 1');
        } catch(err) {
        console.log('[-] Skipping OkHTTPv3 hook 1');
        }

        try{
            okhttp3_CertificatePinner_class.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function (str,cert) {
                console.log('[+] Bypassing OkHTTPv3 2: ' + str);
                return true;
            };
            console.log('[+] Loaded OkHTTPv3 hook 2');
        } catch(err) {
        console.log('[-] Skipping OkHTTPv3 hook 2');
        }

        try {
            okhttp3_CertificatePinner_class.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function (str,cert_array) {
                console.log('[+] Bypassing OkHTTPv3 3: ' + str);
                return true;
            };
            console.log('[+] Loaded OkHTTPv3 hook 3');
        } catch(err) {
        console.log('[-] Skipping OkHTTPv3 hook 3');
        }

        try {
            okhttp3_CertificatePinner_class['check$okhttp'].implementation = function (str,obj) {
            console.log('[+] Bypassing OkHTTPv3 4 (4.2+): ' + str);
        };
        console.log('[+] Loaded OkHTTPv3 hook 4 (4.2+)');
    } catch(err) {
        console.log('[-] Skipping OkHTTPv3 hook 4 (4.2+)');
        }

}

});
    
}, 0);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1755351394 @federicodotta/okhttp3-pinning-bypass
