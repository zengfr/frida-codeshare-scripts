
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1167865936 @Elpepe25456/aes
Java.perform(function () {
  const Cipher = Java.use('javax.crypto.Cipher');
  const IvSpec = Java.use('javax.crypto.spec.IvParameterSpec');
  const SecretKey = Java.use('javax.crypto.SecretKey');

  // Mapa por instancia de Cipher
  const meta = new Map(); // key: this.$h / value: { mode, ivHex, alg }

  function toHex(bytes) {
    if (!bytes) return '';
    const a = Java.array('byte', bytes);
    let out = '';
    for (let i = 0; i < a.length; i++) {
      let v = (a[i] & 0xff).toString(16);
      if (v.length === 1) v = '0' + v;
      out += v;
    }
    return out;
  }

  function toPrintable(bytes) {
    if (!bytes) return '';
    try {
      const Str = Java.use('java.lang.String');
      const s = Str.$new(bytes, 'UTF-8').toString();
      // Mostrar solo si parece JSON o texto legible
      const looksJson = s.trim().startsWith('{') || s.trim().startsWith('[');
      const printable = /[\x09\x0A\x0D\x20-\x7E]/.test(s);
      return (looksJson || printable) ? s : '';
    } catch (e) {
      return '';
    }
  }

  function setMeta(self, obj) {
    meta.set(self.$h, Object.assign(meta.get(self.$h) || {}, obj));
  }
  function getMeta(self) {
    return meta.get(self.$h) || {};
  }

  // --- Hook de init(...) para capturar modo + IV + algoritmo ---
  // int opmode, Key key, AlgorithmParameterSpec params
  Cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec').implementation =
    function (opmode, key, params) {
      try {
        let ivHex = '';
        if (params) {
          try {
            const ivObj = Java.cast(params, IvSpec);
            ivHex = toHex(ivObj.getIV());
          } catch (_) {
            ivHex = '';
          }
        }
        setMeta(this, { mode: opmode, ivHex: ivHex, alg: this.getAlgorithm() });
      } catch (e) {
        // sin drama
      }
      return this.init(opmode, key, params);
    };

  // int opmode, Key key
  Cipher.init.overload('int', 'java.security.Key').implementation = function (opmode, key) {
    try { setMeta(this, { mode: opmode, ivHex: '', alg: this.getAlgorithm() }); } catch (_) {}
    return this.init(opmode, key);
  };

  // --- Función común para loggear como en la captura ---
  function dumpLikeScreenshot(self, bytesToShow) {
    const m = getMeta(self);
    const hex = toHex(bytesToShow);
    const txt = toPrintable(bytesToShow);
    const iv = m.ivHex || '';
    // Formato “tal cual”
    console.log('Gotcha!');
    console.log('Data: ' + hex + (txt ? (' | ' + txt) : ''));
    console.log('IV: ' + iv);
  }

  // Detectar modos (Cipher.ENCRYPT_MODE = 1, DECRYPT_MODE = 2)
  function isEncrypt(self) { return (getMeta(self).mode === 1); }
  function isDecrypt(self) { return (getMeta(self).mode === 2); }

  // --- Hook de doFinal(...) sobrecargas más comunes ---
  // byte[] doFinal(byte[] input)
  Cipher.doFinal.overload('[B').implementation = function (input) {
    const result = this.doFinal(input);
    try {
      if (isEncrypt(this)) {
        // ENCRYPT: el input es el plaintext que quieres ver
        dumpLikeScreenshot(this, input);
      } else if (isDecrypt(this)) {
        // DECRYPT: el result es el plaintext ya decriptado
        dumpLikeScreenshot(this, result);
      } else {
        // Modo desconocido: intenta mostrar algo útil
        dumpLikeScreenshot(this, input || result);
      }
    } catch (_) {}
    return result;
  };

  // byte[] doFinal(byte[] input, int offset, int len)
  Cipher.doFinal.overload('[B', 'int', 'int').implementation = function (input, off, len) {
    const result = this.doFinal(input, off, len);
    try {
      const slice = Java.array('byte', input).slice(off, off + len);
      const arr = Java.array('byte', slice);
      if (isEncrypt(this)) {
        dumpLikeScreenshot(this, arr);
      } else if (isDecrypt(this)) {
        dumpLikeScreenshot(this, result);
      } else {
        dumpLikeScreenshot(this, arr || result);
      }
    } catch (_) {}
    return result;
  };

  // byte[] doFinal()
  Cipher.doFinal.overload().implementation = function () {
    const result = this.doFinal();
    try {
      // Sin input directo; si estamos decriptando, el result es lo interesante
      if (isDecrypt(this)) {
        dumpLikeScreenshot(this, result);
      } else {
        dumpLikeScreenshot(this, result);
      }
    } catch (_) {}
    return result;
  };

  // byte[] doFinal(byte[] input, int inputOffset, int inputLen, byte[] output)
  // (menos común; lo incluimos por si acaso)
  if (Cipher.doFinal.overloads.length > 3) {
    Cipher.doFinal.overloads.forEach(function (ov) {
      const sig = ov.returnType.className + '(' + ov.argumentTypes.map(a => a.className).join(', ') + ')';
      if (sig.indexOf('[B, int, int, [B') !== -1) {
        ov.implementation = function (input, off, len, outBuf) {
          const result = this.doFinal(input, off, len, outBuf);
          try {
            const slice = Java.array('byte', input).slice(off, off + len);
            const arr = Java.array('byte', slice);
            if (isEncrypt(this)) {
              dumpLikeScreenshot(this, arr);
            } else if (isDecrypt(this)) {
              dumpLikeScreenshot(this, outBuf || result);
            } else {
              dumpLikeScreenshot(this, arr || outBuf || result);
            }
          } catch (_) {}
          return result;
        };
      }
    });
  }

  console.log('[*] Cipher hooks installed (init/doFinal). Esperando eventos…');
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1167865936 @Elpepe25456/aes
