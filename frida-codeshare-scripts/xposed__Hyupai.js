
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-797936510 @Hyupai/xposed
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

function hookJNIMethodCall(index, name) {
    Java.perform(function () {
        const env = Java.vm.getEnv();
        const vtablePtr = Memory.readPointer(env.handle);
        const methodPtr = Memory.readPointer(vtablePtr.add(index * Process.pointerSize));

        console.log(`[*] ${name} JNI real addr:`, methodPtr);

        Interceptor.attach(methodPtr, {
            onEnter: function (args) {
                this.caller = this.returnAddress;

                const module = Process.findModuleByAddress(this.caller);
                const offset = module ? ptr(this.caller).sub(module.base) : "desconhecido";

                console.log(`[JNI] 📞 ${name} chamado`);
                console.log(`  ↪ Chamador: ${module ? module.name : "desconhecido"} + 0x${offset.toString(16)}`);

                // Dependendo da chamada, a assinatura do método pode variar.
                // Você pode também tentar ler a jclass ou jobject aqui, se quiser.
            },
            onLeave: function (retval) {
                console.log(`  ↩ Retorno: ${retval}`);
            }
        });

        console.log(`[+] Hook instalado: JNIEnv->${name}`);
    });
}

// Índices comuns da vtable do JNIEnv para chamadas de métodos
const jniCalls = [
    { index: 33, name: "CallObjectMethod" },
    { index: 35, name: "CallBooleanMethod" },
    { index: 39, name: "CallIntMethod" },
    { index: 42, name: "CallLongMethod" },
    { index: 46, name: "CallVoidMethod" },
    { index: 109, name: "CallStaticObjectMethod" },
    { index: 111, name: "CallStaticBooleanMethod" },
    { index: 115, name: "CallStaticIntMethod" },
    { index: 118, name: "CallStaticLongMethod" },
    { index: 122, name: "CallStaticVoidMethod" }
];


// Executar hooks
setImmediate(() => {
    console.log("*] Iniciando hooks avançados...");
    hookFindClassFromJNIEnv();
     console.log("[*] Iniciando hooks avançados em métodos JNI...");
    jniCalls.forEach(entry => hookJNIMethodCall(entry.index, entry.name));
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-797936510 @Hyupai/xposed
