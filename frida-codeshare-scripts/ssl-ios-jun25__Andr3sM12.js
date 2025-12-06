
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1824571079 @Andr3sM12/ssl-ios-jun25
// SSL Pinning Bypass iOS - Frida Script
// Cobertura: SecTrustEvaluate, NSURLSession, BoringSSL
console.log("[*] Iniciando SSL Bypass para iOS...");

const SSL_VERIFY_NONE = 0;

// --- SecTrustEvaluate ---
const trustEvaluate = Module.findExportByName(null, "SecTrustEvaluate");
if (trustEvaluate) {
    Interceptor.replace(trustEvaluate, new NativeCallback(function (trustRef, resultPtr) {
        console.log("[*] SecTrustEvaluate interceptado");
        if (!resultPtr.isNull()) {
            Memory.writeU32(resultPtr, 1); // kSecTrustResultProceed
        }
        return 0; // errSecSuccess
    }, 'int', ['pointer', 'pointer']));
}

const trustEvaluateWithError = Module.findExportByName(null, "SecTrustEvaluateWithError");
if (trustEvaluateWithError) {
    Interceptor.replace(trustEvaluateWithError, new NativeCallback(function (trust, error) {
        console.log("[*] SecTrustEvaluateWithError interceptado");
        return 1; // true
    }, 'bool', ['pointer', 'pointer']));
}

// --- CFNetwork (opcional) ---
const cfSetAllowsAny = Module.findExportByName(null, "CFURLConnectionSetAllowsAnyHTTPSCertificate");
if (cfSetAllowsAny) {
    Interceptor.replace(cfSetAllowsAny, new NativeCallback(function (conn, host) {
        console.log("[*] CFURLConnectionSetAllowsAnyHTTPSCertificate interceptado");
    }, 'void', ['pointer', 'pointer']));
}

// --- BoringSSL (solo si está presente) ---
try {
    const boring = Process.getModuleByName("libboringssl.dylib");
    const setVerifyPtr = boring.findExportByName("SSL_set_custom_verify");
    const getPskPtr = boring.findExportByName("SSL_get_psk_identity");

    if (setVerifyPtr) {
        const SSL_set_custom_verify = new NativeFunction(setVerifyPtr, 'void', ['pointer', 'int', 'pointer']);
        const verifyCallback = new NativeCallback(function (ssl, alert) {
            console.log("[*] SSL verify callback ejecutado");
            return SSL_VERIFY_NONE;
        }, 'int', ['pointer', 'pointer']);

        Interceptor.replace(setVerifyPtr, new NativeCallback(function (ssl, mode, cb) {
            console.log("[*] Reemplazando SSL_set_custom_verify");
            SSL_set_custom_verify(ssl, mode, verifyCallback);
        }, 'void', ['pointer', 'int', 'pointer']));
    }

    if (getPskPtr) {
        Interceptor.replace(getPskPtr, new NativeCallback(function (ssl) {
            console.log("[*] SSL_get_psk_identity interceptado");
            return Memory.allocUtf8String("notarealPSKidentity");
        }, 'pointer', ['pointer']));
    }
} catch (e) {
    console.log("[-] libboringssl.dylib no presente o no cargado");
}

console.log("[+] SSL Bypass cargado correctamente.");
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1824571079 @Andr3sM12/ssl-ios-jun25
