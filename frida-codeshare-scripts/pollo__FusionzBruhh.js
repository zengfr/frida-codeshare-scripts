
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:21729068 @FusionzBruhh/pollo
// Hook BoringSSL native cert verification
Interceptor.attach(Module.findExportByName(null, "SSL_CTX_set_custom_verify"), {
    onEnter: function (args) {
        console.log("[*] Bypassing SSL_CTX_set_custom_verify");
        // args[1] = mode, args[2] = callback
        args[1] = 0; // SSL_VERIFY_NONE
        args[2] = ptr(0); // null callback
    }
});

// Optional: Patch SSL_get_verify_result to always succeed
Interceptor.attach(Module.findExportByName(null, "SSL_get_verify_result"), {
    onLeave: function (retval) {
        console.log("[*] Patching SSL_get_verify_result return value");
        retval.replace(0x0); // X509_V_OK
    }
});

// Optional: Hook SSL_read to see decrypted traffic (debug only)
Interceptor.attach(Module.findExportByName(null, "SSL_read"), {
    onEnter: function (args) {
        this.ssl = args[0];
        this.buf = args[1];
    },
    onLeave: function (retval) {
        if (retval.toInt32() > 0) {
            var buf = Memory.readByteArray(this.buf, retval.toInt32());
            console.log("[*] SSL_read data:\n" + hexdump(buf, { offset: 0, length: retval.toInt32(), header: true, ansi: true }));
        }
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:21729068 @FusionzBruhh/pollo
