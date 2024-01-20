
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:791571611 @chishunho/danieltesting
//Thanks to https://codeshare.frida.re/@pcipolloni/universal-android-ssl-pinning-bypass-with-frida/
//At the moment, this seems to fix the SSL exceptions, but bypass the proxy itself!

//If you have any idea why Android would ignore the proxy setting completely after the following runs, please email androidbugs@voltagex.org - thanks!
(function () {
    Java.perform(function() {
        console.log("");
        console.log("[.] Cert Pinning Bypass/Re-Pinning");
        
        var URL = Java.use('java.net.URL');
        var InputStreamReader = Java.use('java.io.InputStreamReader');
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
    
    try {
            //this assumes you've already got the system proxy set to use Fiddler
            var fiddlerUrl = URL.$new("http://192.168.1.101:8888/FiddlerRoot.cer");
            var connection = fiddlerUrl.openConnection();
        
    }
    catch(err) {
    console.log("[o] " + err);
    }
    
    var bufferedInputStream = BufferedInputStream.$new(connection.getInputStream());
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
        })})();
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:791571611 @chishunho/danieltesting
