
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1781063384 @log-cat/murder-meta-bypass
// https://github.com/logosred/murder-meta-bypass
// Simple script to bypass SSL pinning in Instagram.
Java.perform(function() {
    console.log("--- Murder Meta Bypass Loaded ---");
    console.log("--- Targeting the core 'verify' method ---");

    try {
        const CertificateVerifier = Java.use("com.facebook.mobilenetwork.internal.certificateverifier.CertificateVerifier");

        CertificateVerifier.verify.overload(
            '[Ljava.security.cert.X509Certificate;',
            'java.lang.String',
            'boolean'
        ).implementation = function(certChain, hostname, someBoolean) {
            console.log(`[+] Bypassed CertificateVerifier.verify(certChain, "${hostname}", ${someBoolean}). Certificate chain is now trusted.`);
            return;
        };

        console.log("[+] Hook on CertificateVerifier.verify with correct signature is active.");

    } catch (e) {
        console.error("[-] Failed to hook CertificateVerifier.verify(). Error:");
        console.error(e);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1781063384 @log-cat/murder-meta-bypass
