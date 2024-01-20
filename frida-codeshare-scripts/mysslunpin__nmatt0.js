
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1772927281 @nmatt0/mysslunpin
/* 
   Android SSL Re-pinning frida script v0.2 030417-pier 

   $ adb push burpca-cert-der.crt /data/local/tmp/cert-der.crt
   $ frida -U -f it.app.mobile -l frida-android-repinning.js --no-pause

   https://techblog.mediaservice.net/2017/07/universal-android-ssl-pinning-bypass-with-frida/
   
   UPDATE 20191605: Fixed undeclared var. Thanks to @oleavr and @ehsanpc9999 !
*/

setTimeout(function(){
    Java.perform(function (){
    console.log("");
    console.log("[.] Cert Pinning Bypass/Re-Pinning");

    var CertificateFactory = Java.use("java.security.cert.CertificateFactory");
    var FileInputStream = Java.use("java.io.FileInputStream");
    var BufferedInputStream = Java.use("java.io.BufferedInputStream");
    var InputStream = Java.use("java.io.InputStream");
    var URL = Java.use("java.net.URL");
    var X509Certificate = Java.use("java.security.cert.X509Certificate");
    var KeyStore = Java.use("java.security.KeyStore");
    var TrustManagerFactory = Java.use("javax.net.ssl.TrustManagerFactory");
    var SSLContext = Java.use("javax.net.ssl.SSLContext");

    // Load CAs from an InputStream
    console.log("[+] Loading our CA...")
    var cf = CertificateFactory.getInstance("X.509");
    
  
        var httpUrl = URL.$new("http://10.10.1.4/owasp_zap_root_ca.crt");
     //var fileInputStream = FileInputStream.$new("/storage/self/primary/Android/owasp_zap_root_ca.cer");

    //var initialArray = {130, 5, 8, 48, 130, 3, 240, 160, 3, 2, 1, 2, 2, 4, 123, 152, 106, 28, 48, 13, 6, 9, 42, 134, 72, 134, 247, 13, 1, 1, 11, 5, 0, 48, 129, 132, 49, 39, 48, 37, 6, 3, 85, 4, 3, 12, 30, 79, 87, 65, 83, 80, 32, 90, 101, 100, 32, 65, 116, 116, 97, 99, 107, 32, 80, 114, 111, 120, 121, 32, 82, 111, 111, 116, 32, 67, 65, 49, 24, 48, 22, 6, 3, 85, 4, 7, 12, 15, 54, 52, 49, 50, 48, 56, 50, 52, 100, 97, 57, 52, 56, 99, 49, 49, 22, 48, 20, 6, 3, 85, 4, 10, 12, 13, 79, 87, 65, 83, 80, 32, 82, 111, 111, 116, 32, 67, 65, 49, 26, 48, 24, 6, 3, 85, 4, 11, 12, 17, 79, 87, 65, 83, 80, 32, 90, 65, 80, 32, 82, 111, 111, 116, 32, 67, 65, 49, 11, 48, 9, 6, 3, 85, 4, 6, 19, 2, 120, 120, 48, 30, 23, 13, 50, 50, 48, 57, 50, 54, 49, 54, 50, 53, 53, 53, 90, 23, 13, 50, 51, 48, 57, 50, 54, 49, 54, 50, 53, 53, 53, 90, 48, 129, 132, 49, 39, 48, 37, 6, 3, 85, 4, 3, 12, 30, 79, 87, 65, 83, 80, 32, 90, 101, 100, 32, 65, 116, 116, 97, 99, 107, 32, 80, 114, 111, 120, 121, 32, 82, 111, 111, 116, 32, 67, 65, 49, 24, 48, 22, 6, 3, 85, 4, 7, 12, 15, 54, 52, 49, 50, 48, 56, 50, 52, 100, 97, 57, 52, 56, 99, 49, 49, 22, 48, 20, 6, 3, 85, 4, 10, 12, 13, 79, 87, 65, 83, 80, 32, 82, 111, 111, 116, 32, 67, 65, 49, 26, 48, 24, 6, 3, 85, 4, 11, 12, 17, 79, 87, 65, 83, 80, 32, 90, 65, 80, 32, 82, 111, 111, 116, 32, 67, 65, 49, 11, 48, 9, 6, 3, 85, 4, 6, 19, 2, 120, 120, 48, 130, 1, 34, 48, 13, 6, 9, 42, 134, 72, 134, 247, 13, 1, 1, 1, 5, 0, 3, 130, 1, 15, 0, 48, 130, 1, 10, 2, 130, 1, 1, 0, 163, 138, 231, 231, 128, 118, 160, 207, 86, 242, 85, 126, 26, 239, 159, 102, 255, 69, 14, 10, 137, 96, 15, 229, 81, 157, 4, 183, 153, 87, 3, 206, 102, 230, 226, 196, 206, 99, 221, 220, 90, 219, 18, 193, 149, 225, 154, 11, 79, 85, 228, 246, 138, 11, 201, 204, 87, 215, 151, 82, 117, 134, 128, 43, 14, 55, 10, 12, 92, 242, 142, 0, 169, 141, 17, 108, 218, 127, 16, 5, 16, 163, 32, 241, 6, 86, 1, 98, 38, 193, 18, 10, 154, 27, 214, 225, 77, 181, 232, 34, 123, 224, 90, 55, 33, 33, 55, 137, 244, 34, 221, 20, 130, 235, 125, 41, 35, 78, 199, 83, 164, 57, 188, 68, 154, 199, 81, 196, 143, 53, 203, 97, 172, 231, 181, 12, 122, 152, 148, 164, 193, 127, 22, 179, 76, 157, 167, 62, 9, 247, 99, 100, 250, 210, 177, 172, 189, 107, 104, 107, 168, 227, 144, 2, 171, 33, 250, 49, 141, 82, 204, 221, 35, 105, 190, 181, 94, 113, 247, 162, 85, 113, 188, 182, 150, 13, 33, 94, 107, 48, 252, 2, 220, 114, 74, 198, 19, 187, 232, 234, 164, 67, 241, 30, 248, 143, 144, 157, 136, 96, 115, 9, 240, 213, 154, 182, 61, 7, 231, 88, 168, 210, 240, 30, 252, 226, 130, 207, 191, 133, 239, 188, 139, 129, 25, 147, 240, 208, 195, 246, 42, 67, 211, 68, 71, 137, 7, 187, 233, 50, 173, 98, 16, 96, 204, 43, 2, 3, 1, 0, 1, 163, 130, 1, 126, 48, 130, 1, 122, 48, 130, 1, 51, 6, 3, 85, 29, 14, 4, 130, 1, 42, 4, 130, 1, 38, 48, 130, 1, 34, 48, 13, 6, 9, 42, 134, 72, 134, 247, 13, 1, 1, 1, 5, 0, 3, 130, 1, 15, 0, 48, 130, 1, 10, 2, 130, 1, 1, 0, 163, 138, 231, 231, 128, 118, 160, 207, 86, 242, 85, 126, 26, 239, 159, 102, 255, 69, 14, 10, 137, 96, 15, 229, 81, 157, 4, 183, 153, 87, 3, 206, 102, 230, 226, 196, 206, 99, 221, 220, 90, 219, 18, 193, 149, 225, 154, 11, 79, 85, 228, 246, 138, 11, 201, 204, 87, 215, 151, 82, 117, 134, 128, 43, 14, 55, 10, 12, 92, 242, 142, 0, 169, 141, 17, 108, 218, 127, 16, 5, 16, 163, 32, 241, 6, 86, 1, 98, 38, 193, 18, 10, 154, 27, 214, 225, 77, 181, 232, 34, 123, 224, 90, 55, 33, 33, 55, 137, 244, 34, 221, 20, 130, 235, 125, 41, 35, 78, 199, 83, 164, 57, 188, 68, 154, 199, 81, 196, 143, 53, 203, 97, 172, 231, 181, 12, 122, 152, 148, 164, 193, 127, 22, 179, 76, 157, 167, 62, 9, 247, 99, 100, 250, 210, 177, 172, 189, 107, 104, 107, 168, 227, 144, 2, 171, 33, 250, 49, 141, 82, 204, 221, 35, 105, 190, 181, 94, 113, 247, 162, 85, 113, 188, 182, 150, 13, 33, 94, 107, 48, 252, 2, 220, 114, 74, 198, 19, 187, 232, 234, 164, 67, 241, 30, 248, 143, 144, 157, 136, 96, 115, 9, 240, 213, 154, 182, 61, 7, 231, 88, 168, 210, 240, 30, 252, 226, 130, 207, 191, 133, 239, 188, 139, 129, 25, 147, 240, 208, 195, 246, 42, 67, 211, 68, 71, 137, 7, 187, 233, 50, 173, 98, 16, 96, 204, 43, 2, 3, 1, 0, 1, 48, 15, 6, 3, 85, 29, 19, 1, 1, 255, 4, 5, 48, 3, 1, 1, 255, 48, 11, 6, 3, 85, 29, 15, 4, 4, 3, 2, 1, 182, 48, 35, 6, 3, 85, 29, 37, 4, 28, 48, 26, 6, 8, 43, 6, 1, 5, 5, 7, 3, 1, 6, 8, 43, 6, 1, 5, 5, 7, 3, 2, 6, 4, 85, 29, 37, 0, 48, 13, 6, 9, 42, 134, 72, 134, 247, 13, 1, 1, 11, 5, 0, 3, 130, 1, 1, 0, 159, 9, 132, 120, 153, 110, 175, 83, 133, 21, 61, 194, 196, 21, 4, 132, 24, 65, 8, 128, 18, 212, 234, 105, 132, 49, 43, 15, 116, 235, 248, 170, 82, 26, 52, 44, 94, 207, 20, 80, 106, 196, 79, 175, 83, 37, 179, 217, 54, 16, 244, 189, 220, 177, 155, 77, 16, 50, 177, 143, 208, 103, 250, 33, 16, 43, 14, 156, 53, 200, 67, 44, 101, 224, 88, 199, 44, 121, 156, 235, 244, 230, 58, 176, 114, 65, 229, 48, 134, 201, 233, 81, 238, 33, 92, 58, 193, 12, 36, 175, 151, 136, 28, 214, 175, 177, 9, 94, 164, 53, 75, 74, 186, 38, 80, 84, 119, 204, 228, 214, 209, 127, 99, 197, 190, 18, 237, 193, 35, 68, 223, 40, 210, 34, 54, 48, 164, 151, 96, 87, 89, 199, 123, 148, 5, 138, 238, 91, 16, 72, 184, 116, 252, 101, 248, 223, 216, 91, 86, 49, 6, 131, 92, 142, 254, 229, 187, 40, 97, 245, 118, 212, 72, 138, 103, 108, 95, 255, 152, 26, 45, 121, 47, 173, 77, 110, 14, 78, 100, 22, 252, 185, 178, 188, 53, 93, 153, 214, 211, 188, 135, 181, 41, 186, 49, 144, 9, 235, 167, 77, 14, 40, 56, 154, 198, 229, 7, 94, 140, 49, 164, 140, 201, 237, 106, 42, 106, 17, 183, 150, 210, 222, 114, 161, 52, 86, 240, 19, 162, 230, 225, 71, 220, 143, 153, 196, 185, 29, 187, 109, 93, 206, 102, 242, 59, 82};
    //var targetStream = ByteArrayInputStream.$new(initialArray);
    
    var bufferedInputStream = BufferedInputStream.$new(httpUrl.openStream());
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
    });
},0);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1772927281 @nmatt0/mysslunpin
