
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1405656986 @Hyupai/xposed
function hookFindClassFromJNIEnv() {
    Java.perform(function () {
        const env = Java.vm.getEnv();
        const FindClassIdx = 6;

        const vtablePtr = Memory.readPointer(env.handle);
        const FindClassPtr = Memory.readPointer(vtablePtr.add(FindClassIdx * Process.pointerSize));

        console.log("[*] FindClass JNI real addr:", FindClassPtr);

        Interceptor.attach(FindClassPtr, {
            onEnter: function (args) {
                try {
                    this.className = Memory.readUtf8String(args[1]);
                    this.caller = this.returnAddress;

                    const module = Process.findModuleByAddress(this.caller);
                    const offset = ptr(this.caller).sub(module.base);

                    console.log(`[FindClass] 📦 Classe procurada: ${this.className}`);
                    console.log(`  ↪ Chamador: ${module.name} + 0x${offset.toString(16)}`);
                    console.log(`  ↪ 📍 Base da ${module.name}: ${module.base}`);  // << ADICIONADO AQUI
                } catch (e) {
                    console.log("[FindClass] ⚠ Erro ao ler nome da classe ou chamador:", e);
                    this.className = null;
                }
            },
            onLeave: function (retval) {
                if (this.className) {
                    const nameLower = this.className.toLowerCase();
                    if (
                        nameLower.includes("xposed") ||
                        nameLower.includes("sandhook") ||
                        nameLower.includes("epic") ||
                        nameLower.includes("riru") ||
                        nameLower.includes("andhook")
                    ) {
                        console.warn(`[Bypass] 🚫 Bloqueando classe: ${this.className}`);
                        retval.replace(ptr(0)); // Retorna NULL para bloquear
                    }
                }
            }
        });

        console.log("[+] Hook instalado: JNIEnv->FindClass (com bypass + log de chamador)");
    });
}

// Executar hooks
setImmediate(() => {
    console.log("*] Iniciando hooks avançados...");
    hookFindClassFromJNIEnv();
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1405656986 @Hyupai/xposed
