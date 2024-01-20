
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1650590340 @zeroinside/extractkeys
setTimeout(function() {
    Java.perform(function() {
        var libopenssl = "MONITORED_OPENSSL_LIB.so"; // CHANGEME

        function writePrivateKeyToFile(pkey) {
            if (!pkey || pkey.isNull()) {
                console.error("Invalid EVP_PKEY pointer");
                return;
            }
            var i2d_PrivateKey = new NativeFunction(Module.findExportByName(libopenssl, 'i2d_PrivateKey'), 'int', ['pointer', 'pointer']);
            console.log(">>>> i2d_PrivateKey called! <<<<");
            var derLength = i2d_PrivateKey(pkey, NULL);
            if (derLength > 0) {
                var derData = Memory.alloc(derLength);
                i2d_PrivateKey(pkey, derData);
                var derBuffer = Memory.readByteArray(ptr(derData).readPointer(), derLength);
                var filename = "/data/local/tmp/certs/pke";
                var file = new File(filename, "wb");
                file.write(derBuffer);
                file.flush();
                file.close();

                console.log("Private key written to file: " + filename);
            }
        }
        Interceptor.attach(Module.findExportByName(libopenssl, 'PEM_read_bio_PrivateKey'), {
            onEnter: function(args) {
                console.log(">>>> PEM_read_bio_PrivateKey called! <<<<");
            },
            onLeave: function(retval) {
                console.log("PEM_read_bio_PrivateKey retval: " + retval);
                if (!retval || retval.isNull()) {
                    console.error("Invalid PEM_read_bio_PrivateKey return value");
                    return;
                }
                console.log("Writing private key to file...");
                writePrivateKeyToFile(retval);
            },
        });
    });
}, 60);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1650590340 @zeroinside/extractkeys
