
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1897925710 @Hyupai/onpixtv
Java.perform(function() {
    console.log("[*] Hooking TextView.setText()...");

    // Pegue a classe TextView
    var TextView = Java.use("android.widget.TextView");

    // Intercepte o método setText(CharSequence)
    TextView.setText.overload('java.lang.CharSequence').implementation = function(text) {
        try {
            // Pegue o nome do campo de texto e verifique se é o desejado
            var id = this.getId();
            var name = this.getResources().getResourceEntryName(id); // Pega o nome do recurso

            // Cheque se o nome do recurso corresponde a 'tv_trial_days'
            if (name === "tv_trial_days") {
                console.log("[*] setText chamado para TextView com nome 'tv_trial_days'");
                
                // Processamento para pegar apenas a data
                var processedText = text.toString().replace(/Data de expiração:\n/, '').trim();

                // Exibir a data extraída
                console.log("    Data extraída: " + processedText);
            }
        } catch (err) {
            console.error("[!] Erro ao verificar ID: " + err);
        }

        // Chame o método original para garantir que o texto seja atualizado
        return this.setText(text);
    };

    console.log("[*] Hook de TextView.setText() completo.");
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1897925710 @Hyupai/onpixtv
