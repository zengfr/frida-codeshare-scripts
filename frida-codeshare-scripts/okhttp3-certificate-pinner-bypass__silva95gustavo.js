
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-535077919 @silva95gustavo/okhttp3-certificate-pinner-bypass
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
    var CertificatePinner = Java.use('okhttp3.CertificatePinner');
    console.log("[+] Bypassing CertificatePinner->check()");
    CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function(hostname, peerCertificates) {
        return;
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-535077919 @silva95gustavo/okhttp3-certificate-pinner-bypass
