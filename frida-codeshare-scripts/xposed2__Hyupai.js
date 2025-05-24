
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-954664724 @Hyupai/xposed2
// == Configurações ==
const targetModule = "libexec_x86.so";
const offset       = 0x13627;
const POLL_MS      = 25;    // intervalo em ms para re-tentar encontrar a lib

// == Helpers de leitura segura ==
function safeReadPointer(ptrAddr) {
    try {
        return ptrAddr.isNull() ? ptr(0) : Memory.readPointer(ptrAddr);
    } catch (e) {
        console.log(`    ↪ [ERRO] leitura de ponteiro em ${ptrAddr} falhou: ${e.message}`);
        return ptr(0);
    }
}

function guessArgType(ptrVal) {
    // tenta ler string ASCII, se possível
    try {
        let s = Memory.readUtf8String(ptrVal);
        if (s && /^[\x20-\x7E]+$/.test(s)) return `"${s}"`;
    } catch (_) {}
    return `0x${ptrVal.toString(16)}`;
}

// == Log de argumentos (x86 stdcall) ==
function logArguments(ctx) {
    console.log("  ↪ 📝 Argumentos (etch):");
    console.log(`    ↪ ECX = 0x${ctx.ecx.toString(16)}`);
    console.log(`    ↪ EDX = 0x${ctx.edx.toString(16)}`);

    // no x86 stdcall, args começam em [ESP+4]
    for (let i = 0; i < 4; i++) {
        const addr = ctx.esp.add(4 + i*4);
        const val  = safeReadPointer(addr);
        console.log(`    ↪ Arg[${i}] @ ${addr}: ${guessArgType(val)}`);
    }
}

// == Função de hook ==
function hookFunction(base) {
    const targetAddr = base.add(offset);
    console.log(`\n[+] 🎯 Hookando ${targetModule} + 0x${offset.toString(16)} => ${targetAddr}`);

    Interceptor.attach(targetAddr, {
        onEnter: function (args) {
            console.log(`\n[!] 🚨 ${targetModule}+0x${offset.toString(16)} chamada`);

            // 1) Log de registradores relevantes
            console.log("  ↪ 📝 Registradores:");
            console.log(`    ↪ ECX = 0x${this.context.ecx.toString(16)}`);
            console.log(`    ↪ EDX = 0x${this.context.edx.toString(16)}`);

            // 2) Log de argumentos (x86 stdcall)
            const numArgs = 4;
            console.log(`  ↪ 📥 ${numArgs} argumentos na stack:`);

            for (let i = 0; i < numArgs; i++) {
                const argPtrAddr = this.context.esp.add(4 + i * 4);
                const ptrVal = safeReadPointer(argPtrAddr);
                const hexAddr = ptrVal.toString(16);
                console.log(`    ↪ Arg[${i}] @ ${argPtrAddr} = 0x${hexAddr}`);

                // 3) Detecção de tipo
                let typeDesc;
                let originalStr = null;

                try {
                    const s = Memory.readUtf8String(ptrVal);
                    if (s && /^[\x20-\x7E]+$/.test(s)) {
                        typeDesc = ` (string: "${truncateString(s, 80)}")`;
                        originalStr = s;
                    } else {
                        throw new Error();
                    }
                } catch (_) {
                    typeDesc = " (binary data)";
                }
                console.log(typeDesc);

                // 4) Hexdump
                if (ptrVal.compare(ptr(0x1000)) > 0) {
                    try {
                        console.log(`      ↪ 🔎 hexdump(@Arg[${i}]):`);
                        console.log(hexdump(ptrVal, { offset: 0, length: 64, header: false, ansi: false }));
                    } catch (e) {
                        console.log(`      ↪ [ERRO] hexdump falhou: ${e.message}`);
                    }
                }

                // FORÇA substituição de ponteiro de string, assumindo que é Arg[0]
                if (i === 0) {
                    const newStr = "net.lendatv.pass";
                    try {
                        const newPtr = Memory.allocUtf8String(newStr);
                        args[0] = newPtr;
                        console.log(`      ✅ Ponteiro de Arg[0] substituído por nova string: "${newStr}" @ ${newPtr}`);
                    } catch (e) {
                        console.log(`      ⚠ Erro ao substituir ponteiro: ${e.message}`);
                    }
                }
            }
        },

        onLeave: function (retval) {
            console.log(`  ↪ 🔄 Retorno original: ${retval}`);
        }
    });

    console.log("[+] ✅ Hook instalado!\n");
}


// == Loop de espera pelo módulo ==
function waitForModule() {
    const base = Module.findBaseAddress(targetModule);
    if (base) {
        console.log(`[+] 📦 Módulo ${targetModule} carregado em ${base}`);
        hookFunction(base);
    } else {
        // ainda não carregado, tenta de novo
        setTimeout(waitForModule, POLL_MS);
    }
}

// Inicia na próxima iteração de event loop
setImmediate(waitForModule);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-954664724 @Hyupai/xposed2
