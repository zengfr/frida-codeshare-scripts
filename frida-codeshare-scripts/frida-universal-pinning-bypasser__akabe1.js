
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1101420930 @akabe1/frida-universal-pinning-bypasser
/*  Another universal ssl certificate pinning bypass script for Android
    by Maurizio Siddu
    Run with:
    frida -U -f [APP_ID] -l frida_universal_pinning_bypasser.js --no-pause
*/

setTimeout(function() {
    Java.perform(function() {
        console.log('');
        console.log('======');
        console.log('[#] Android Universal Certificate Pinning Bypasser [#]');
        console.log('======');

        // TrustManagerImpl Certificate Pinning Bypass             
        try { 
            var array_list = Java.use('java.util.ArrayList');
            var custom_TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
 
            //custom_TrustManagerImpl.checkTrustedRecursive.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
            custom_TrustManagerImpl.checkTrustedRecursive.implementation = function(a, b, c, d, e, f, g, h) {
                //if host:
                console.log('[+] Bypassing TrustManagerImpl pinner for: ' + b + '...');
                //else:
                //     console.log('[+] Bypassing TrustManagerImpl pinner...');
                var fakeTrusted = array_list.$new(); 
                return fakeTrusted;
            }
        } catch (err) {
                console.log('[-] TrustManagerImpl pinner not found');
        }


        // OpenSSLSocketImpl Certificate Pinning Bypass
        try {
            var custom_OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
            custom_OpenSSLSocketImpl.verifyCertificateChain.implementation = function (g, i) {
                console.log('[+] Bypassing OpenSSLSocketImpl pinner...');
            }
        } catch (err) {
                console.log('[-] OpenSSLSocketImpl pinner not found');
            }

    });
},0);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1101420930 @akabe1/frida-universal-pinning-bypasser
