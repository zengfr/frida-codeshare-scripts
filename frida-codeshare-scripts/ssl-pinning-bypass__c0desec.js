
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1345456541 @c0desec/ssl-pinning-bypass
// ssl_pinning_bypass.js

Java.perform(function () {
    // Find the TrustManager class (adjust as needed for different pinning implementations)
    var TrustManager = Java.use('javax.net.ssl.X509TrustManager');

    // Implement a custom TrustManager
    var MyTrustManager = Java.registerClass({
        name: 'com.example.MyTrustManager', // Choose a unique name
        implements: [TrustManager],
        methods: {
            checkClientTrusted: function (chain, authType) {
                // Log to console for debugging
                console.log("checkClientTrusted called!");

                // Accept all certificates (INSECURE - for testing only)
                // In a real-world scenario, you might want to inspect the chain
                // and potentially trust specific certificates or CAs.

                // Example: Check if a specific certificate is in the chain:
                /*
                for (var i = 0; i < chain.length; i++) {
                  var cert = chain[i];
                  // ... extract certificate information (e.g., Common Name) ...
                  // if (cert.CommonName.contains("my_trusted_domain.com")) {
                  //    return; // Trust this certificate
                  // }
                }
                */

                // WARNING: The following line is VERY INSECURE.  Only use for testing.
                return; // Accept all certificates
            },
            checkServerTrusted: function (chain, authType) {
                console.log("checkServerTrusted called!");

                // Same logic as checkClientTrusted - VERY INSECURE in this example.
                return; // Accept all certificates
            },
            getAcceptedIssuers: function () {
                console.log("getAcceptedIssuers called!");
                return []; // Return an empty array
            }
        }
    });

    // Replace the default TrustManager with our custom one
    var SSLContext = Java.use('javax.net.ssl.SSLContext');
    var TrustManagerArray = Java.use('[Ljavax.net.ssl.TrustManager;');
    var MyTrustManagerInstance = MyTrustManager.$new();
    var TrustManagers = TrustManagerArray.$new(1);
    TrustManagers[0] = MyTrustManagerInstance;

    var sslContext = SSLContext.getInstance('TLS'); // Or 'SSL'
    sslContext.init(null, TrustManagers, null);

    // Override the createSocket method (more robust approach)
    var HttpsURLConnection = Java.use('javax.net.ssl.HttpsURLConnection');
    HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory());

    console.log("SSL pinning bypass successful (INSECURE - for testing only)!");

});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1345456541 @c0desec/ssl-pinning-bypass
