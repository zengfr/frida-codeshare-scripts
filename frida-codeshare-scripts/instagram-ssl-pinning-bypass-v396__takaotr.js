
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:630609044 @takaotr/instagram-ssl-pinning-bypass-v396
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
      let picked = { huc: null, provider: null };

      outer:
      for (const p of providers) {
        for (const h of hucs) {
          try {
            OL = Holder.initHybrid.overload(
              "com.facebook.tigon.tigonmns.TigonMNSConfig",
              "java.lang.String",
              h,
              p,
              "java.lang.String",
              "boolean"
            );
            picked = { huc: h, provider: p };
            break outer;
          } catch (e) {
    
          }
        }
      }

      if (!OL) {

        try {
          Holder.initHybrid.overloads.forEach((ol, i) =>
            console.log("[initHybrid OL" + i + "] (" +
              ol.argumentTypes.map(t => t.className).join(", ") + ")"));
        } catch (e2) {}
        throw new Error("initHybrid için uygun overload bulunamadı (imza değişmiş olabilir)");
      }

      OL.implementation = function (cfg, s1, hucClient, holderOrProvider, s2, z) {
        try {
          if (cfg.setEnableCertificateVerificationWithProofOfPossession)
            cfg.setEnableCertificateVerificationWithProofOfPossession(false);
        } catch (e) { logger("[cfg] setEVCWPoP hata: " + e); }

        try {
          if (cfg.setTrustSandboxCertificates)
            cfg.setTrustSandboxCertificates(true);
        } catch (e) { logger("[cfg] setTrustSandboxCertificates hata: " + e); }

        try {
          if (cfg.setForceHttp2)
            cfg.setForceHttp2(true);
        } catch (e) { logger("[cfg] setForceHttp2 hata: " + e); }

        logger(`[*][+] Hooked TigonMNSServiceHolder.initHybrid (huc=${picked.huc}, provider=${picked.provider})`);
        return OL.call(this, cfg, s1, hucClient, holderOrProvider, s2, z);
      };
    } catch (e) {
      logger("[*][-] Failed to TigonMNSServiceHolder.initHybrid: " + e);
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
//hash:630609044 @takaotr/instagram-ssl-pinning-bypass-v396
