
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1266949733 @zeroinside/extractcerts
setTimeout(function() {
    Java.perform(function() {
        var libopenssl = "MONITORED_OPENSSL_LIB.so"; // CHANGEME
        function printFullCertificate(x509) {
            if (!x509 || x509.isNull()) {
                console.error("Invalid X.509 certificate pointer");
                return;
            }
            var i2d_X509 = new NativeFunction(Module.findExportByName(libopenssl, 'i2d_X509'), 'int', ['pointer', 'pointer']);
            var derLength = i2d_X509(x509, NULL);
            if (derLength > 0) {
                var derData = Memory.alloc(derLength);
                i2d_X509(x509, derData);
                console.log("DER Encoded Certificate:");
                var derBuffer = Memory.readByteArray(ptr(derData).readPointer(), derLength);
                console.log(derBuffer);
            }
        }

        function WriteFullCertificate(x509) {
            // Ensure x509 is a valid pointer
            if (!x509 || x509.isNull()) {
                console.error("Invalid X.509 certificate pointer");
                return;
            }
            var i2d_X509 = new NativeFunction(Module.findExportByName(libopenssl, 'i2d_X509'), 'int', ['pointer', 'pointer']);
            var derLength = i2d_X509(x509, NULL);
            if (derLength > 0) {
                var derData = Memory.alloc(derLength);
                i2d_X509(x509, derData);
                console.log("DER Encoded Certificate:");
                var derBuffer = Memory.readByteArray(ptr(derData).readPointer(), derLength);
                console.log(derBuffer);
            }
            var filename = '/data/local/tmp/certs/cert_X'; //generateRandomFilename();
            console.log(filename);

            var file = new File(filename, "w");

            // Write the DER data to the file
            file.write(derBuffer);

            // Close the file
            file.flush();
            file.close();

            console.log("Certificate written to file: " + filename);
        }

        function printCertificate(x509) {
            var X509_NAME_oneline = new NativeFunction(Module.findExportByName(libopenssl, 'X509_NAME_oneline'), 'pointer', ['pointer', 'pointer', 'int']);
            var X509_get_subject_name = new NativeFunction(Module.findExportByName(libopenssl, 'X509_get_subject_name'), 'pointer', ['pointer']);
            var X509_get_issuer_name = new NativeFunction(Module.findExportByName(libopenssl, 'X509_get_issuer_name'), 'pointer', ['pointer']);
            var subjectName = X509_NAME_oneline(X509_get_subject_name(x509), NULL, 0);
            var issuerName = X509_NAME_oneline(X509_get_issuer_name(x509), NULL, 0);
            console.log("Subject: " + Memory.readUtf8String(subjectName));
            console.log("Issuer: " + Memory.readUtf8String(issuerName));
        }
        Interceptor.attach(Module.findExportByName(libopenssl, "PEM_read_bio_X509"), {
            onEnter: function(args) {
                console.log(">>>>PEM_read_bio_X509 called!<<<<");
            },
            onLeave: function(retval) {
                console.log("printCertificate:");
                printCertificate(ptr(retval));
                console.log("DER:");
                WriteFullCertificate(ptr(retval));
            },
        });
    });
}, 60);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1266949733 @zeroinside/extractcerts
