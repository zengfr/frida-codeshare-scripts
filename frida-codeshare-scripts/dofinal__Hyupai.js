
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-2014315420 @Hyupai/dofinal
setTimeout(function() {
    console.log("[+] Script carregado com sucesso!");

    Java.perform(function x() {
        
        
      
    
        // Helpers de conversão
        function bytesToHex(bytes) {
            return Array.from(bytes).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
        }

      function bytesToBase64(bytes) {
            // Converte os bytes para Base64
            var base64String = Java.use("android.util.Base64").encodeToString(bytes, 0);
        
            // Verifica se a saída contém "g290FC"
            if (base64String.includes("g290FC")) {
                console.log("\n⚠️ [STACK TRACE DETECTADO] ⚠️");
                var Log = Java.use("android.util.Log");
                var Exception = Java.use("java.lang.Exception");
                console.log(Log.getStackTraceString(Exception.$new()));
            }
        
            return base64String;
        }
        
        function bytesToUTF8(bytes) {
            try {
                return Java.use("java.lang.String").$new(bytes).toString();
            } catch(e) {
                return "NÃO LEGÍVEL";
            }
        }

        // Hook SecretKeySpec
        var secret_key_spec = Java.use("javax.crypto.spec.SecretKeySpec");
        secret_key_spec.$init.overload("[B", "java.lang.String").implementation = function (keyBytes, algorithm) {
            console.log("\n🔑 [CHAVE DETECTADA]");
            console.log(`| Algoritmo: ${algorithm}`);
            console.log(`| Base64: ${bytesToBase64(keyBytes)}`);
            console.log(`| Hex: ${bytesToHex(keyBytes)}`);
            console.log(`| UTF-8: ${bytesToUTF8(keyBytes)}`);
            return this.$init(keyBytes, algorithm);
        };

        // Hook IvParameterSpec
        var iv_parameter_spec = Java.use("javax.crypto.spec.IvParameterSpec");
        iv_parameter_spec.$init.overload("[B").implementation = function (ivBytes) {
            console.log("\n🛡 [IV DETECTADO]");
            console.log(`| Base64: ${bytesToBase64(ivBytes)}`);
            console.log(`| Hex: ${bytesToHex(ivBytes)}`);
            console.log(`| UTF-8: ${bytesToUTF8(ivBytes)}`);
            return this.$init(ivBytes);
        };

        // Hook Cipher
        var cipher = Java.use("javax.crypto.Cipher");
        var cipherModes = new WeakMap();

        cipher.init.overload("int", "java.security.Key", "java.security.spec.AlgorithmParameterSpec").implementation = function (mode, key, params) {
            cipherModes.set(this, mode === 1 ? "CRIPTOGRAFIA" : "DESCRIPTOGRAFIA");
            
            // Log da chave
            var keyBytes = key.getEncoded();
            console.log("\n⚙ [CHAVE USADA NA OPERAÇÃO]");
            console.log(`| Base64: ${bytesToBase64(keyBytes)}`);
            console.log(`| Hex: ${bytesToHex(keyBytes)}`);
            console.log(`| UTF-8: ${bytesToUTF8(keyBytes)}`);

            // Log do IV (se existir)
            try {
                var ivBytes = Java.cast(params, iv_parameter_spec).getIV();
                console.log("\n🛡 [IV USADO NA OPERAÇÃO]");
                console.log(`| Base64: ${bytesToBase64(ivBytes)}`);
                console.log(`| Hex: ${bytesToHex(ivBytes)}`);
                console.log(`| UTF-8: ${bytesToUTF8(ivBytes)}`);
            } catch(e) {}

            return this.init(mode, key, params);
        };

        cipher.doFinal.overload("[B").implementation = function (inputBytes) {
            var operation = cipherModes.get(this) || "MODO DESCONHECIDO";
            
            console.log(`\n🔒 [OPERACAO: ${operation}]`);
            
            // Input
            console.log("📤 ENTRADA:");
            console.log(`| Base64: ${bytesToBase64(inputBytes)}`);
            console.log(`| Hex: ${bytesToHex(inputBytes)}`);
            console.log(`| UTF-8: ${bytesToUTF8(inputBytes)}`);

            // Processa
            var outputBytes = this.doFinal(inputBytes);

            // Output
            console.log("\n📥 SAÍDA:");
            console.log(`| Base64: ${bytesToBase64(outputBytes)}`);
            console.log(`| Hex: ${bytesToHex(outputBytes)}`);
            console.log(`| UTF-8: ${bytesToUTF8(outputBytes)}`);
            console.log("──────────────────────────────────");

            return outputBytes;
        };
    });
}, 1000);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-2014315420 @Hyupai/dofinal
