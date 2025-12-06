
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1233022346 @Hyupai/findlibcryptofunctions
'use strict';

/*
 * Hook universal de crypto/ssl via ApiResolver (sem enumerateSymbols).
 * Testado em 32/64-bit. Adapta-se a libs: libcrypto, libssl, libjavacrypto, libconscrypt, stable_cronet_*.
 */

(function () {

  const libs = [
    'libcrypto',
    'libssl',
    'libjavacrypto',
    'libconscrypt',
    'stable_cronet_libcrypto',
    'stable_cronet_libssl'
  ];

  const resolver = new ApiResolver('module');
  const hookedAddrs = new Set();

  function safeHex(ptrBuf, len, max) {
    const n = Math.min(len >>> 0, max);
    if (n <= 0) return;
    try { console.log(hexdump(ptr(ptrBuf), { length: n })); } catch (_) {}
  }

  function hookOnce(address, onEnter, onLeave, tag) {
    const key = address.toString();
    if (hookedAddrs.has(key)) return false;
    try {
      Interceptor.attach(address, {
        onEnter: onEnter || function () { console.log(`[${tag}] enter`); },
        onLeave: onLeave  || function (retval) { console.log(`[${tag}] leave -> ${retval}`); }
      });
      hookedAddrs.add(key);
      return true;
    } catch (e) {
      console.log(`[hook error] ${tag} @ ${address} -> ${e}`);
      return false;
    }
  }

function findAndHook(pattern, handlerFactory) {
    
  // pattern no formato 'exports:*libcrypto*!EVP_DecryptFinal_ex'
    try {
      resolver.enumerateMatches(pattern).forEach(m => {
        const tag = `${m.name} (${m.moduleName})`;
        const ok = hookOnce(m.address, handlerFactory.onEnter(tag), handlerFactory.onLeave(tag), tag);
        if (ok) console.log(`[hooked v0] ${tag} @ ${m.address}`);
      });
    } catch (e) {
      console.log(`[resolver error v0] ${pattern} -> ${e}`);
    }

    try {
        // Cria o resolver apropriado
        const resolver = new ApiResolver('module');
        
        resolver.enumerateMatches(pattern).forEach(m => {
            const module = Process.findModuleByAddress(m.address);
            const baseAddress = module ? module.base : ptr(0);
            const offset = m.address.sub(baseAddress);
            const absoluteAddress = m.address;
            
            const tag = `${m.name} (${module ? module.name : 'unknown'}) | `
                     + `Base: ${baseAddress} | `
                     + `Offset: 0x${offset.toString(16)} | `
                     + `Absolute: ${absoluteAddress}`;

            try {
                Interceptor.attach(absoluteAddress, {
                    onEnter: handlerFactory.onEnter ?
                        handlerFactory.onEnter(tag, baseAddress, offset, absoluteAddress) :
                        function(args) {},
                    
                    onLeave: handlerFactory.onLeave ?
                        handlerFactory.onLeave(tag, baseAddress, offset, absoluteAddress) :
                        function(retval) {}
                });
                console.log(`[Hooked] ${tag}`);
            } catch(e) {
                console.error(`[Hook Failed] ${tag}: ${e.message}`);
            }
        });
    } catch (e) {
        console.error(`[Resolver Error] ${pattern}: ${e}`);
    }
}

  // ---------------- SSL hooks (captura plaintext/ciphertext no boundary) ----------------
  function hookSSL() {
    const targets = [
      'SSL_read', 'SSL_read_ex',
      'SSL_write', 'SSL_write_ex'
    ];

    targets.forEach(sym => {
      libs.filter(n => n.indexOf('libssl') >= 0 || n.indexOf('cronet') >= 0).forEach(lib => {
        const pat = `exports:*${lib}*!${sym}`;
        findAndHook(pat, {
          onEnter: (tag) => function (args) {
            this.sym = tag;
            // SSL* ctx = args[0]
            this.buf = args[1];
            // Para *_ex, o len está em args[2]; para não _ex, também.
            this.lenArg = args[2];
          },
          onLeave: (tag) => function (retval) {
            // Para SSL_read/SSL_write: retval == bytes realmente processados
            // Para *_ex: retval==1/0 e bytes em *args[3] (mas retval simples já ajuda)
            let n = 0;
            try {
              if (tag.indexOf('_ex') >= 0) {
                // *_ex: bytes em *args[3] (size_t*). Nem sempre precisamos; use retval>0 então leia *lenArg
                if (retval.toInt32() > 0 && this.lenArg) {
                  n = this.lenArg.readU64 ? Number(this.lenArg.readU64()) : this.lenArg.readUInt();
                }
              } else {
                n = retval.toInt32();
              }
            } catch (_) {}

            if (n > 0 && this.buf) {
              console.log(`[${tag}] bytes=${n}`);
              safeHex(this.buf, n, 256);
            } else {
              console.log(`[${tag}] retval=${retval}`);
            }
          }
        });
      });
    });
  }

  // ---------------- EVP/HMAC hooks (libcrypto/libjavacrypto/libconscrypt) ----------------
  function hookEVP() {
    const evpTargets = [
      'EVP_DecryptUpdate',
      'EVP_DecryptFinal_ex',
      'EVP_EncryptUpdate',
      'EVP_EncryptFinal_ex',
      'EVP_CipherUpdate',
      'EVP_CipherFinal_ex',
    ];
    const rsaTargets = [
      'RSA_public_encrypt',
      'RSA_private_decrypt',
      'RSA_public_decrypt',
      'RSA_private_encrypt'
    ];
    const hmacTargets = [
      'HMAC_Init_ex',
      'HMAC_Update',
      'HMAC_Final',
    ];

    // EVP_DecryptUpdate(ctx, out, outl*, in, inl)
    evpTargets.forEach(sym => {
      libs.forEach(lib => {
        const pat = `exports:*${lib}*!${sym}`;
        findAndHook(pat, {
          onEnter: (tag) => function (args) {
            this.tag = tag;
            this.ctx  = args[0];
            this.out  = args[1];
            this.outl = args[2];
            this.in   = args[3];
            this.inl  = args[4];
            // Para *_Final_ex: assinatura é (ctx, outm, outl*)
            if (!this.in && !this.inl) {
              this.isFinal = true;
            }
          },
          onLeave: (tag) => function (retval) {
            try {
              if (this.isFinal) {
                const outLen = this.outl ? this.outl.readS32() : 0;
                console.log(`[${tag}] FINAL retval=${retval} outLen=${outLen}`);
                if (outLen > 0) safeHex(this.out, outLen, 256);
              } else {
                const inLen  = this.inl ? this.inl.toInt32() : 0;
                const outLen = this.outl ? this.outl.readS32() : 0;
                console.log(`[${tag}] UPDATE retval=${retval} inLen=${inLen} outLen=${outLen}`);
                if (inLen > 0 && this.in)  { console.log(`[${tag}] IN:`);  safeHex(this.in,  Math.min(inLen, 256), 256); }
                if (outLen > 0 && this.out){ console.log(`[${tag}] OUT:`); safeHex(this.out, Math.min(outLen, 256), 256); }
              }
            } catch (e) {
              console.log(`[${tag}] parse error: ${e}`);
            }
          }
        });
      });
    });

    // HMAC
    hmacTargets.forEach(sym => {
      libs.forEach(lib => {
        const pat = `exports:*${lib}*!${sym}`;
        findAndHook(pat, {
          onEnter: (tag) => function (args) {
            this.tag = tag;
            this.args = args;
          },
          onLeave: (tag) => function (retval) {
            console.log(`[${tag}] retval=${retval}`);
            if (tag.indexOf('HMAC_Init_ex') >= 0) {
              const keyPtr = this.args[1];
              const keyLen = this.args[2].toInt32 ? this.args[2].toInt32() : 0;
              if (keyPtr && keyLen > 0) {
                console.log(`[${tag}] key len=${keyLen}`);
                safeHex(keyPtr, keyLen, 128);
              }
            }
          }
        });
      });
    });
    
    
    rsaTargets.forEach(sym => {
      libs.forEach(lib => {
        const pat = `exports:*${lib}*!${sym}`;
        findAndHook(pat, {
          onEnter: (tag) => function (args) {
            this.tag = tag;
            this.flLen = args[2].toInt32 ? args[2].toInt32() : 0;
            this.inBuf = args[0];
            this.key   = args[3]; // RSA* pointer
            console.log(`[${tag}] called in ${lib}`);
            safeHex(this.inBuf, this.flLen, 256);
          },
          onLeave: (tag) => function (retval) {
            if (!retval.isNull()) {
              console.log(`[${tag}] result:`);
              safeHex(retval, 256, 256);
            }
          }
        });
      });
    });

  }

  // ---------------- Inicial: tente hookar imediatamente o que já está carregado ----------------
  hookSSL();
  hookEVP();

  // ---------------- Re-hook em novas libs carregadas (dlopen) ----------------
  ['dlopen', 'android_dlopen_ext'].forEach(fname => {
    const faddr = Module.findExportByName(null, fname);
    if (!faddr) return;
    Interceptor.attach(faddr, {
      onEnter: function (args) {
        this.path = args[0] ? args[0].readUtf8String() : '';
      },
      onLeave: function () {
        if (!this.path) return;
        if (libs.some(n => this.path.indexOf(n) >= 0)) {
          console.log(`[dlopen] loaded ${this.path}`);
          // Re-run hooks – se exportarem, serão encontrados; duplicados são ignorados
          hookSSL();
          hookEVP();
        }
      }
    });
  });

})();
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1233022346 @Hyupai/findlibcryptofunctions
