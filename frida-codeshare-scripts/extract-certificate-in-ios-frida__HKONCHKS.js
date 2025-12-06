
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1508792865 @HKONCHKS/extract-certificate-in-ios-frida
const security = Module.findExportByName(null, 'SecPKCS12Import');

if (security !== null) {
    console.log("[*] Interceptando SecPKCS12Import para extrair certificados...");

    Interceptor.attach(security, {
        onEnter: function(args) {
            console.log("\n[+] Hook ativado!");

            try {
                if (args[0].isNull() || args[1].isNull()) {
                    console.log("[!] Argumento nulo detectado! Abortando interceptação.");
                    return;
                }

                this.certData = new ObjC.Object(args[0]);
                this.password = new ObjC.Object(args[1]);

                if (!this.certData || !this.password) {
                    console.log("[!] Dados inválidos! Certificado ou senha não foram capturados.");
                    return;
                }

                const dataLength = this.certData.length();
                const dataPtr = this.certData.bytes();

                if (dataPtr.isNull() || dataLength === 0) {
                    console.log("[!] Certificado vazio ou inválido! Ignorando.");
                    return;
                }

                this.dataByteArray = Memory.readByteArray(dataPtr, dataLength);

                const tmpDir = ObjC.classes.NSFileManager.defaultManager().temporaryDirectory().path();
                this.filePath = tmpDir.stringByAppendingPathComponent_('cert.p12');

            } catch (err) {
                console.error("[!] Erro ao processar dados: ", err);
            }
        },
        onLeave: function(retval) {
            if (this.dataByteArray && this.filePath) {
                try {
                    console.log("\n[+] Salvando certificado interceptado...");

                    const file = new File(this.filePath.toString(), "wb");
                    file.write(this.dataByteArray);
                    file.flush();
                    file.close();

                    console.log("\n[*] Certificado capturado com sucesso!");
                    console.log("📌 Arquivo salvo em: " + this.filePath.toString());
                    console.log("🔑 Senha do certificado: " + JSON.stringify(this.password.toString(), null, 2));

                } catch (error) {
                    console.error("[!] Erro ao escrever arquivo: ", error);
                }
            }
        }
    });

} else {
    console.log("[!] Função 'SecPKCS12Import' não encontrada! O app pode estar protegendo essa API.");
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1508792865 @HKONCHKS/extract-certificate-in-ios-frida
