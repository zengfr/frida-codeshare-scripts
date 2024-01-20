
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1806275829 @avltree9798/universal-android-ssl-pinning-bypass
/*
   Universal Android SSL Pinning Bypass
   by Anthony Viriya (@avltree9798)

   $ frida -U -f org.package.name -l universal-ssl-check-bypass.js --no-pause
*/

Java.perform(function() {
    var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
    var ArrayList = Java.use("java.util.ArrayList");
    TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain,
        host, clientAuth, ocspData, tlsSctData) {
        console.log("[+] Bypassing TrustManagerImpl->verifyChain()");
        return untrustedChain;
    }
    TrustManagerImpl.checkTrustedRecursive.implementation = function(certs, host, clientAuth, untrustedChain,
        trustAnchorChain, used) {
        console.log("[+] Bypassing TrustManagerImpl->checkTrustedRecursive()");
        return ArrayList.$new();
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1806275829 @avltree9798/universal-android-ssl-pinning-bypass
