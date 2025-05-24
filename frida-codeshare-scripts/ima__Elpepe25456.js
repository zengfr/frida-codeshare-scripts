
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1742323909 @Elpepe25456/ima
Java.perform(function () {
    console.log("[+] Hooking SSL Pinning");

    var X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
    var CertificateFactory = Java.use("java.security.cert.CertificateFactory");
    var ByteArrayInputStream = Java.use("java.io.ByteArrayInputStream");
    var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");

    // Tu hash SHA-256 del certificado confiable (sin los dos puntos)
    var trustedFingerprint = "3AA81AD7B08F0158FFD2ADD7602FA1B027E491D063C842372CD3FBDA9D6B8DA0";

    TrustManagerImpl.verifyChain.implementation = function (chain, authType, host) {
        try {
            // Comprobar si la cadena de certificados no es null ni vacía
            if (chain == null || chain.length === 0) {
                console.log("[!] Cadena de certificados vacía o nula, bloqueando.");
                throw new Error("Cadena de certificados nula o vacía");
            }

            console.log("[+] Cadena de certificados recibida: " + chain);

            var cert = chain[0]; // Primer certificado de la cadena
            if (!cert) {
                console.log("[!] Certificado no encontrado en la cadena.");
                throw new Error("Certificado no encontrado en la cadena");
            }

            var certBytes = cert.getEncoded();
            var md = Java.use("java.security.MessageDigest").getInstance("SHA-256");
            var fingerprint = md.digest(certBytes);

            // Convertir el hash a String
            var hexString = "";
            for (var i = 0; i < fingerprint.length; i++) {
                var hex = (fingerprint[i] & 0xFF).toString(16);
                if (hex.length == 1) hex = "0" + hex;
                hexString += hex.toUpperCase();
            }

            console.log("[+] Certificado detectado: " + hexString);

            if (hexString === trustedFingerprint) {
                console.log("[+] Certificado confiable, permitiendo conexión.");
                return chain; // Permitir el certificado confiable
            } else {
                console.log("[!] Certificado NO confiable, bloqueando.");
                throw new Error("SSL Pinning detectado");
            }

        } catch (e) {
            // Capturar cualquier excepción y mostrar el error
            console.log("[!] Error durante la verificación del certificado: " + e.message);
            throw e; // Lanzar de nuevo el error para asegurarse de que se bloquee la conexión
        }
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1742323909 @Elpepe25456/ima
