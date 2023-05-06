
//https://github.com/zengfr/frida-codeshare-scripts
//-1720888382 @Tindam/test2
setTimeout(function(){
    Java.perform(function (){
    console.log("");
    
    Java.enumerateLoadedClasses({
        onMatch: function(className) {
            if (className.startsWith("android.os.StrictMode")) {
                console.log(className);
            }
        },
        onComplete: function() {}
        });  
    
    var StrictMode = Java.use("android.os.StrictMode");
    var StrictModeBuilder = Java.use("android.os.StrictMode$ThreadPolicy$Builder");

    var policy = StrictModeBuilder.$new().permitAll().build();
        StrictMode.setThreadPolicy(policy);
        
        console.log("");
    console.log("[.] Cert Pinning Bypass/Re-Pinning");

    var CertificateFactory = Java.use("java.security.cert.CertificateFactory");
    var FileInputStream = Java.use("java.io.FileInputStream");
    var BufferedInputStream = Java.use("java.io.BufferedInputStream");
    var X509Certificate = Java.use("java.security.cert.X509Certificate");
    var KeyStore = Java.use("java.security.KeyStore");
    var TrustManagerFactory = Java.use("javax.net.ssl.TrustManagerFactory");
    var SSLContext = Java.use("javax.net.ssl.SSLContext");

    // Load CAs from an InputStream
    console.log("[+] Loading our CA...")
    var cf = CertificateFactory.getInstance("X.509");
    
    try{
    try {
    var fileInputStream = FileInputStream.$new("/data/local/tmp/cert-der.crt");
    }
    catch(err) {
    console.log("[o] " + err);
    }
    
    var bufferedInputStream = BufferedInputStream.$new(fileInputStream);
  var ca = cf.generateCertificate(bufferedInputStream);
    bufferedInputStream.close();

var certInfo = Java.cast(ca, X509Certificate);
    console.log("[o] Our CA Info: " + certInfo.getSubjectDN());

    // Create a KeyStore containing our trusted CAs
    console.log("[+] Creating a KeyStore for our CA...");
    var keyStoreType = KeyStore.getDefaultType();
    var keyStore = KeyStore.getInstance(keyStoreType);
    keyStore.load(null, null);
    keyStore.setCertificateEntry("ca", ca);
    
    // Create a TrustManager that trusts the CAs in our KeyStore
    console.log("[+] Creating a TrustManager that trusts the CA in our KeyStore...");
    var tmfAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
    var tmf = TrustManagerFactory.getInstance(tmfAlgorithm);
    tmf.init(keyStore);
    console.log("[+] Our TrustManager is ready...");

    console.log("[+] Hijacking SSLContext methods now...")
    console.log("[-] Waiting for the app to invoke SSLContext.init()...")

   SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom").implementation = function(a,b,c) {
   console.log("[o] App invoked javax.net.ssl.SSLContext.init...");
   SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom").call(this, a, tmf.getTrustManagers(), c);
   console.log("[+] SSLContext initialized with our custom TrustManager!");
   }
    } catch (err){
        console.log("[o] " + err)
    }
    });
},0);
//https://github.com/zengfr/frida-codeshare-scripts
//-1720888382 @Tindam/test2
