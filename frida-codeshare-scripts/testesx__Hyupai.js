
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:263592710 @Hyupai/testesx
const TARGET_MODULE = "libexec_x86.so";
const HOOK_OFFSET = 0x13627;
const REPLACE_STR = "com.exemplo.MutableClass";
const POLL_INTERVAL = 50; // ms

function installHook() {
    const module = Process.findModuleByName(TARGET_MODULE);
    if (!module) {
        console.error(`❌ ${TARGET_MODULE} não carregado`);
        return false;
    }

    const hookAddress = module.base.add(HOOK_OFFSET);
    console.log(`🔗 Hook instalado em ${hookAddress}`);

    Interceptor.attach(hookAddress, {
        onEnter(args) {
            const stringPtr = this.context.esp.add(4).readPointer();
            const originalStr = Memory.readUtf8String(stringPtr);
            
            console.log(`📌 String original: "${originalStr}"`);
            
            const newStrPtr = Memory.allocUtf8String(REPLACE_STR);
            this.context.esp.add(4).writePointer(newStrPtr);
            
            console.log(`🔧 Substituído por: "${REPLACE_STR}"`);
        }
    });

    return true;
}

function waitForModule(retry = 0) {
    if (Module.findBaseAddress(TARGET_MODULE)) {
        console.log(`✅ ${TARGET_MODULE} carregado`);
        if (!installHook()) {
            setTimeout(waitForModule, POLL_INTERVAL);
        }
    } else {
        if (retry < 10) { // Limite de 10 tentativas
            setTimeout(waitForModule, POLL_INTERVAL, retry + 1);
        } else {
            console.error("❌ Tempo esgotado - Módulo não carregado");
        }
    }
}

// Inicia o monitoramento
setImmediate(() => {
    console.log("⏳ Monitorando carregamento do módulo...");
    waitForModule();
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:263592710 @Hyupai/testesx
