
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1635280327 @vumail159951/all-degist-and-sslpinning
function bin2ascii(array) {
    var result = [];

    for (var i = 0; i < array.length; ++i) {
        result.push(String.fromCharCode( // hex2ascii part
            parseInt(
                ('0' + (array[i] & 0xFF).toString(16)).slice(-2), // binary2hex part
                16
            )
        ));
    }
    return result.join('');
}

function bin2hex(array, length) {
    var result = "";

    length = length || array.length;

    for (var i = 0; i < length; ++i) {
        result += ('0' + (array[i] & 0xFF).toString(16)).slice(-2);
    }
    return result;
}


setTimeout(function() {
    Java.perform(function() {
        console.log("Loaded!!");

        var req = Java.use("okhttp3.Request");

        console.log("started");

        var Log = Java.use("android.util.Log")
        var Exception = Java.use("java.lang.Exception")


        // KeyGenerator
        var keyGenerator = Java.use("javax.crypto.KeyGenerator");
        keyGenerator.generateKey.implementation = function() {
            console.log("[*] Generate symmetric key called. ");
            return this.generateKey();
        };

        keyGenerator.getInstance.overload('java.lang.String').implementation = function(var0) {
            console.log("[*] KeyGenerator.getInstance called with algorithm: " + var0 + "\n");
            return this.getInstance(var0);
        };

        keyGenerator.getInstance.overload('java.lang.String', 'java.lang.String').implementation = function(var0, var1) {
            console.log("[*] KeyGenerator.getInstance called with algorithm: " + var0 + " and provider: " + var1 + "\n");
            return this.getInstance(var0, var1);
        };

        keyGenerator.getInstance.overload('java.lang.String', 'java.security.Provider').implementation = function(var0, var1) {
            console.log("[*] KeyGenerator.getInstance called with algorithm: " + var0 + " and provider: " + var1 + "\n");
            return this.getInstance(var0, var1);
        };

        // KeyPairGenerator
        var keyPairGenerator = Java.use("java.security.KeyPairGenerator");
        keyPairGenerator.getInstance.overload('java.lang.String').implementation = function(var0) {
            console.log("[*] GetPairGenerator.getInstance called with algorithm: " + var0 + "\n");
            return this.getInstance(var0);
        };

        keyPairGenerator.getInstance.overload('java.lang.String', 'java.lang.String').implementation = function(var0, var1) {
            console.log("[*] GetPairGenerator.getInstance called with algorithm: " + var0 + " and provider: " + var1 + "\n");
            return this.getInstance(var0, var1);
        };

        keyPairGenerator.getInstance.overload('java.lang.String', 'java.security.Provider').implementation = function(var0, var1) {
            console.log("[*] GetPairGenerator.getInstance called with algorithm: " + var0 + " and provider: " + var1 + "\n");
            return this.getInstance(var0, var1);
        };

        // secret key spec
        var secretKeySpec = Java.use("javax.crypto.spec.SecretKeySpec");
        secretKeySpec.$init.overload('[B', 'java.lang.String').implementation = function(keyb, cipher) {
            var buffer = Java.array('byte', keyb);
            var resultStr = "";
            try {
                for (var i = 0; i < buffer.length; ++i) {
                    resultStr += (String.fromCharCode(buffer[i]));
                }
            } catch (e) {
                resultStr = "0x";
                for (var i = 0; i < buffer.length; ++i) {
                    var nn = buffer[i];
                    resultStr += nn.toString(16);
                }
            }
            console.log("[*] SecretKeySpec.init called with key: " + bin2hex(Java.array('byte', keyb)) + " | " + bin2ascii(Java.array('byte', keyb)) + " using algorithm: " + cipher + "\n");
            return secretKeySpec.$init.overload('[B', 'java.lang.String').call(this, keyb, cipher);
        }

        // MessageDigest
        var messageDigest = Java.use("java.security.MessageDigest");
        messageDigest.getInstance.overload('java.lang.String').implementation = function(var0) {
            console.log("[*] MessageDigest.getInstance called with algorithm: " + var0 + "\n");
            return this.getInstance(var0);
        };

        messageDigest.getInstance.overload('java.lang.String', 'java.lang.String').implementation = function(var0, var1) {
            console.log("[*] MessageDigest.getInstance called with algorithm: " + var0 + " and provider: " + var1 + "\n");
            return this.getInstance(var0, var1);
        };

        messageDigest.getInstance.overload('java.lang.String', 'java.security.Provider').implementation = function(var0, var1) {
            console.log("[*] MessageDigest.getInstance called with algorithm: " + var0 + " and provider: " + var1 + "\n");
            return this.getInstance(var0, var1);
        };

        messageDigest.digest.overload().implementation = function() {
            var ret = messageDigest.digest.overload().call(this);
            var buffer = Java.array('byte', ret);
            var resultStr = "0x";
            for (var i = 0; i < 16; ++i) {
                var nn = buffer[i];
                if (nn < 0) {
                    nn = 0xFFFFFFFF + nn + 1;
                }
                nn.toString(16).toUpperCase();
                resultStr += nn;
            }
            console.log("[*] MessageDigest.digest called with hash: " + resultStr + " using algorithm: " + this.getAlgorithm() + " (Alternative representation: " + bin2hex(Java.array('byte', ret)) + " | " + bin2ascii(Java.array('byte', ret)) + ")\n");
            return ret;
        };

        /*
        messageDigest.digest.overload("[B").implementation = function (inp) {
            var ret =  messageDigest.digest.overload("[B").call(this, inp);
            var buffer = Java.array('byte', ret);
            var resultStr = "0x";
            for(var i = 0; i < buffer.length; ++i){
                var nn = buffer[i];
                resultStr+= nn.toString(16);
            }
            console.log("[*] MessageDigest.digest called with hash: " + resultStr + " using algorithm: " + this.getAlgorithm() + "\n");
        };
            
        messageDigest.digest.overload("[B", "int", "int").implementation = function (inp, offset, len) {
            var ret =  messageDigest.digest.overload("[B", "int", "int").call(this, inp, offset, len);
            var buffer = Java.array('byte', inp);
            var resultStr = "0x";
            for(var i = offset; i < ret; ++i){
                var nn = buffer[i];
                resultStr+= nn.toString(16);
            }
            console.log("[*] MessageDigest.digest called with hash: " + resultStr + " using algorithm: " + this.getAlgorithm() + "\n");
        };*/

        // secret key factory
        var secretKeyFactory = Java.use("javax.crypto.SecretKeyFactory");
        secretKeyFactory.getInstance.overload('java.lang.String').implementation = function(var0) {
            console.log("[*] SecretKeyFactory.getInstance called with algorithm: " + var0 + "\n");
            return this.getInstance(var0);
        };

        secretKeyFactory.getInstance.overload('java.lang.String', 'java.lang.String').implementation = function(var0, var1) {
            console.log("[*] SecretKeyFactory.getInstance called with algorithm: " + var0 + " and provider: " + var1 + "\n");
            return this.getInstance(var0, var1);
        };

        secretKeyFactory.getInstance.overload('java.lang.String', 'java.security.Provider').implementation = function(var0, var1) {
            console.log("[*] SecretKeyFactory.getInstance called with algorithm: " + var0 + " and provider: " + var1 + "\n");
            return this.getInstance(var0, var1);
        };

        // Signature
        var signature = Java.use("java.security.Signature");
        signature.getInstance.overload('java.lang.String').implementation = function(var0) {
            console.log("[*] Signature.getInstance called with algorithm: " + var0 + "\n");
            return this.getInstance(var0);
        };

        signature.getInstance.overload('java.lang.String', 'java.lang.String').implementation = function(var0, var1) {
            console.log("[*] Signature.getInstance called with algorithm: " + var0 + " and provider: " + var1 + "\n");
            return this.getInstance(var0, var1);
        };

        signature.getInstance.overload('java.lang.String', 'java.security.Provider').implementation = function(var0, var1) {
            console.log("[*] Signature.getInstance called with algorithm: " + var0 + " and provider: " + var1 + "\n");
            return this.getInstance(var0, var1);
        };


        // Cipher
        var cipher = Java.use("javax.crypto.Cipher");
        cipher.getInstance.overload('java.lang.String').implementation = function(var0) {
            console.log("[*] Cipher.getInstance called with algorithm: " + var0 + "\n");
            return this.getInstance(var0);
        };

        cipher.getInstance.overload('java.lang.String', 'java.lang.String').implementation = function(var0, var1) {
            console.log("[*] Cipher.getInstance called with algorithm: " + var0 + " and provider: " + var1 + "\n");
            return this.getInstance(var0, var1);
        };

        cipher.getInstance.overload('java.lang.String', 'java.security.Provider').implementation = function(var0, var1) {
            console.log("[*] Cipher.getInstance called with algorithm: " + var0 + " and provider: " + var1 + "\n");
            return this.getInstance(var0, var1);
        };

        cipher.doFinal.overload('[B').implementation = function(b) {
            console.log("Cipher.doFinal called by " + Log.getStackTraceString(Exception.$new()));
            return cipher.doFinal.overload("[B").call(this, b);
        };


        // MAC

        var mac = Java.use("javax.crypto.Mac");
        mac.getInstance.overload('java.lang.String').implementation = function(var0) {
            console.log("[*] Mac.getInstance called with algorithm: " + var0 + "\n");
            return this.getInstance(var0);
        };

        mac.getInstance.overload('java.lang.String', 'java.lang.String').implementation = function(var0, var1) {
            console.log("[*] Mac.getInstance called with algorithm: " + var0 + " and provider: " + var1 + "\n");
            return this.getInstance(var0, var1);
        };

        mac.getInstance.overload('java.lang.String', 'java.security.Provider').implementation = function(var0, var1) {
            console.log("[*] Mac.getInstance called with algorithm: " + var0 + " and provider: " + var1 + "\n");
            return this.getInstance(var0, var1);
        };



        /** KeyGenParameterSpec **/

        //decrypt = 2
        // encrypt = 1
        // decrypt | encrypt = 3
        // sign = 4
        // verify = 8
        var useKeyGen = Java.use("android.security.keystore.KeyGenParameterSpec$Builder");
        useKeyGen.$init.overload("java.lang.String", "int").implementation = function(keyStoreAlias, purpose) {
            var purposeStr = "Purpose = " + purpose;
            if (purpose == 2)
                purposeStr = "decrypt";
            else if (purpose == 1)
                purposeStr = "encrypt";
            else if (purpose == 3)
                purposeStr = "decrypt|encrypt";
            else if (purpose == 4)
                purposeStr = "sign";
            else if (purpose == 8)
                purposeStr = "verify";

            console.log("KeyGenParameterSpec.Builder(" + keyStoreAlias + ", " + purposeStr + ")");

            return useKeyGen.$init.overload("java.lang.String", "int").call(this, keyStoreAlias, purpose);
        }

        useKeyGen.setBlockModes.implementation = function(modes) {
            console.log("KeyGenParameterSpec.Builder.setBlockModes('" + modes.toString() + "')");
            return useKeyGen.setBlockModes.call(this, modes);
        }

        useKeyGen.setDigests.implementation = function(digests) {
            console.log("KeyGenParameterSpec.Builder.setDigests('" + digests.toString() + "')");
            return useKeyGen.setDigests.call(this, digests);
        }

        useKeyGen.setKeySize.implementation = function(keySize) {
            console.log("KeyGenParameterSpec.Builder.setKeySize(" + keySize + ")");
            return useKeyGen.setKeySize.call(this, keySize);
        }

        useKeyGen.setEncryptionPaddings.implementation = function(paddings) {
            console.log("KeyGenParameterSpec.Builder.setEncryptionPaddings('" + paddings.toString() + "')");
            return useKeyGen.setEncryptionPaddings.call(this, paddings);
        }

        useKeyGen.setSignaturePaddings.implementation = function(paddings) {
            console.log("KeyGenParameterSpec.Builder.setSignaturePaddings('" + paddings.toString() + "')");
            return useKeyGen.setSignaturePaddings.call(this, paddings);
        }

        useKeyGen.setAlgorithmParameterSpec.implementation = function(spec) {
            console.log("KeyGenParameterSpec.Builder.setAlgorithmParameterSpec('" + spec.toString() + "')");
            return useKeyGen.setAlgorithmParameterSpec.call(this, spec);
        }

        useKeyGen.build.implementation = function() {
            console.log("KeyGenParameterSpec.Builder.build()");
            return useKeyGen.build.call(this);
        }

        // IvParameterSpec
        var ivSpec = Java.use("javax.crypto.spec.IvParameterSpec");
        ivSpec.$init.overload("[B").implementation = function(ivBytes) {
            var buffer = Java.array('byte', ivBytes);
            var resultStr = "";
            try {
                for (var i = 0; i < buffer.length; ++i) {
                    resultStr += (String.fromCharCode(buffer[i]));
                }
            } catch (e) {
                resultStr = "0x";
                for (var i = 0; i < buffer.length; ++i) {
                    var nn = buffer[i];
                    resultStr += nn.toString(16);
                }
            }
            console.log("IvParameterSpec.init(" + resultStr + ")" + " -> Alternative representation: " + bin2hex(Java.array('byte', ivBytes)) + " | " + bin2ascii(Java.array('byte', ivBytes)));
            return ivSpec.$init.overload("[B").call(this, ivBytes);
        }

        ivSpec.$init.overload("[B", "int", "int").implementation = function(ivBytes, offset, len) {
            var buffer = Java.array('byte', ivBytes);
            var resultStr = "";
            try {
                for (var i = offset; i < len; ++i) {
                    resultStr += (String.fromCharCode(buffer[i]));
                }
            } catch (e) {
                resultStr = "0x";
                for (var i = offset; i < len; ++i) {
                    var nn = buffer[i];
                    resultStr += nn.toString(16);
                }
            }
            console.log("IvParameterSpec.init(" + resultStr + ")" + " -> Alternative representation: " + bin2hex(ivBytes) + " | " + bin2ascii(ivBytes));
            return ivSpec.$init.overload("[B", "int", "int").call(this, ivBytes, offset, len);
        }

        req.method.overload().implementation = function() {
            var ret = req.method.overload().call(this);
            console.log(" -- Method -- ");
            if (ret != null)
                console.log(ret.toString());
            console.log("--------------");
            return ret;
        }

        req.url.overload().implementation = function() {
            var ret = req.url.overload().call(this);
            console.log(" -- url -- ");
            if (ret != null)
                console.log(ret.toString());
            console.log("--------------");
            return ret;
        }

        req.headers.overload().implementation = function() {
            var ret = req.headers.overload().call(this);
            console.log(" -- headers -- ");
            if (ret != null)
                console.log(ret.toString());
            console.log("--------------");
            return ret;
        }


        var rb = Java.use("okhttp3.RequestBody");
        rb.create.overload('okhttp3.MediaType', 'java.lang.String').implementation = function(mtype, str) {
            console.log(" -- body --");
            console.log("Type: " + mtype);
            console.log("String: " + str);
            console.log("--------------");
            var ret = rb.create.overload('okhttp3.MediaType', 'java.lang.String').call(this, mtype, str);
            return ret;
        }

        rb.create.overload('okhttp3.MediaType', 'okio.ByteString').implementation = function(mtype, str) {
            console.log(" -- body --");
            console.log("Type: " + mtype);
            console.log("Byte-String: " + str.toString());
            console.log("--------------");
            var ret = rb.create.overload('okhttp3.MediaType', 'okio.ByteString').call(this, mtype, str);
            return ret;
        }

        rb.create.overload('okhttp3.MediaType', '[B', 'int', 'int').implementation = function(mtype, bytes, offset, bytecount) {
            console.log(" -- body --");
            console.log("Type: " + mtype);
            var buffer = Java.array('byte', bytes);
            var result = "";
            //for(var i = offset; i < bytecount; ++i){
            //result+= (String.fromCharCode(buffer[i]));
            //}
            console.log("Bytes: " + result);
            console.log("--------------");
            var ret = rb.create.overload('okhttp3.MediaType', '[B', 'int', 'int').call(this, mtype, bytes, offset, bytecount);
            return ret;
        }

        rb.create.overload('okhttp3.MediaType', 'java.io.File').implementation = function(mtype, file) {
            console.log(" -- body --");
            console.log("Type: " + mtype);
            console.log("File: " + file.toString());
            console.log("--------------");
            var ret = rb.create.overload('okhttp3.MediaType', 'java.io.File').call(this, mtype, file);
            return ret;
        }

        rb.create.overload('okhttp3.MediaType', '[B').implementation = function(mtype, bytes) {
            console.log(" -- body --");
            console.log("Type: " + mtype);
            var buffer = Java.array('byte', bytes);
            var result = "";
            //for(var i = 0; i < buffer.length; ++i){
            //result+= (String.fromCharCode(buffer[i]));
            //}
            console.log("Bytes: " + result);
            console.log("--------------");
            var ret = rb.create.overload('okhttp3.MediaType', '[B').call(this, mtype, bytes);
            return ret;
        }

        var resp = Java.use("okhttp3.Response");
        resp.message.overload().implementation = function() {
            var ret = resp.message.overload.call(this);
            console.log("Message from Response: " + message);
            return ret;
        }

        // in case returned but never used
        Java.choose("okhttp3.Headers", {
            onMatch: function(instance) { //This function will be called for every instance found by frida
                console.log("Found instance: " + instance.toString());
            },
            onComplete: function() {
                console.log("Scan Completed");
            }
        });
    });
}, 2000);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1635280327 @vumail159951/all-degist-and-sslpinning
