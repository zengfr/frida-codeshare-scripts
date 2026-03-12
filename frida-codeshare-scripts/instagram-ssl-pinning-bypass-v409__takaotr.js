
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-2082323422 @takaotr/instagram-ssl-pinning-bypass-v409
/* 
SCRIPT BY 
TAKAO TR 
TURKISH DEVELOPER
*/

'use strict'

var isTigonMNSServiceHolderHooked = false;
function hookLibLoading(){
    Java.perform(() => {
        var systemClass = Java.use("com.facebook.soloader.MergedSoMapping$Invoke_JNI_OnLoad");
systemClass.libappstatelogger2_so.implementation = function(){
            if(isTigonMNSServiceHolderHooked == false){
                isTigonMNSServiceHolderHooked = true;
                hookTigonMNSServiceHolder();
            }
            var ret = this.libappstatelogger2_so();
return ret;
}
});
}


function hookTigonMNSServiceHolder() {
    Java.perform(() => {
        try {
            const Holder = Java.use("com.facebook.tigon.tigonmns.TigonMNSServiceHolder");
            const providers = [
                "com.facebook.tigon.iface.TigonServiceHolderProvider",
                "com.facebook.tigon.iface.TigonServiceHolder",
            ];
            const hucs = [
                "com.facebook.tigon.tigonhuc.HucClient",
                "com.facebook.tigon.huc.HucClient",
            ];

            let OL = null;

            Holder.initHybrid.overloads.forEach((ol, i) => {
                const sig = ol.argumentTypes.map(t => t.className);
                
                // 7 parametreli yeni overload için kontrol (Instagram'ın yeni versiyonu)
                const match7Params = sig.length === 7 &&
                    sig[0] === "com.facebook.tigon.tigonmns.TigonMNSConfig" &&
                    sig[1] === "java.lang.String" &&
                    hucs.indexOf(sig[2]) !== -1 &&
                    sig[3] === "boolean" &&
                    providers.indexOf(sig[4]) !== -1 &&
                    sig[5] === "java.lang.String" &&
                    sig[6] === "boolean";

                // 6 parametreli eski overload'lar için kontrol
                const matchNew = sig.length === 6 &&
                    sig[0] === "com.facebook.tigon.tigonmns.TigonMNSConfig" &&
                    sig[1] === "java.lang.String" &&
                    hucs.indexOf(sig[2]) !== -1 &&
                    sig[3] === "boolean" &&
                    providers.indexOf(sig[4]) !== -1 &&
                    sig[5] === "java.lang.String";

                const matchOld = sig.length === 6 &&
                    sig[0] === "com.facebook.tigon.tigonmns.TigonMNSConfig" &&
                    sig[1] === "java.lang.String" &&
                    hucs.indexOf(sig[2]) !== -1 &&
                    providers.indexOf(sig[3]) !== -1 &&
                    sig[4] === "java.lang.String" &&
                    sig[5] === "boolean";

                if (match7Params || matchNew || matchOld) {
                    OL = ol;
                    console.log(`[*][+] Picked initHybrid overload #${i} (${sig.join(", ")})`);
                }
            });

            if (!OL) {
                try {
                    Holder.initHybrid.overloads.forEach((ol, i) =>
                        console.log("[initHybrid OL" + i + "] (" +
                            ol.argumentTypes.map(t => t.className).join(", ") + ")")
                    );
                } catch (e) {}
                throw new Error("Uygun initHybrid overload bulunamadı");
            }

            OL.implementation = function() {
                const cfg = arguments[0];
                
                try {
                    if (cfg.setEnableCertificateVerificationWithProofOfPossession)
                        cfg.setEnableCertificateVerificationWithProofOfPossession(false);
                } catch (e) {}
                
                try {
                    if (cfg.setTrustSandboxCertificates)
                        cfg.setTrustSandboxCertificates(true);
                } catch (e) {}
                
                try {
                    if (cfg.setForceHttp2)
                        cfg.setForceHttp2(true);
                } catch (e) {}

                console.log("[*][+] Hooked TigonMNSServiceHolder.initHybrid");
                return OL.apply(this, arguments);
            };

        } catch (e) {
            console.log("[*][-] Failed to TigonMNSServiceHolder.initHybrid: " + e);
        }
    });
}


function logger(message) {
    console.log(message);

}


hookLibLoading();


Java.perform(function() {
    try {
        var array_list = Java.use("java.util.ArrayList");
        var ApiClient = Java.use('com.android.org.conscrypt.TrustManagerImpl');
        if (ApiClient.checkTrustedRecursive) {
            logger("[*][+] Hooked checkTrustedRecursive")
            ApiClient.checkTrustedRecursive.implementation = function(a1, a2, a3, a4, a5, a6) {
                var k = array_list.$new();
                return k;
            }
        } else {
            logger("[*][-] checkTrustedRecursive not Found")
        }
    } catch (e) {
        logger("[*][-] Failed to hook checkTrustedRecursive")
    }
});

Java.perform(function() {
    try {
        const x509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
        const sSLContext = Java.use("javax.net.ssl.SSLContext");
        const TrustManager = Java.registerClass({
            implements: [x509TrustManager],
            methods: {
                checkClientTrusted(chain, authType) {
                },
                checkServerTrusted(chain, authType) {
                },
                getAcceptedIssuers() {
                    return [];
                },
            },
            name: "com.leftenter.instagram",
        });
        const TrustManagers = [TrustManager.$new()];
        const SSLContextInit = sSLContext.init.overload(
            "[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom");
        SSLContextInit.implementation = function(keyManager, trustManager, secureRandom) {
            SSLContextInit.call(this, keyManager, TrustManagers, secureRandom);
        };
        logger("[*][+] Hooked SSLContextInit")
    } catch (e) {
        logger("[*][-] Failed to hook SSLContextInit")
    }
})
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-2082323422 @takaotr/instagram-ssl-pinning-bypass-v409
