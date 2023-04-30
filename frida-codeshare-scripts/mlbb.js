function startTLSKeyLogger(SSL_CTX_new, SSL_CTX_set_keylog_callback) {
    function keyLogger(ssl, line) {
        console.log(new NativePointer(line).readCString());
    }
    const keyLogCallback = new NativeCallback(keyLogger, 'void', ['pointer', 'pointer']);

    Interceptor.attach(SSL_CTX_new, {
        onLeave: function(retval) {
            const ssl = new NativePointer(retval);

            if (!ssl.isNull()) {
                const SSL_CTX_set_keylog_callbackFn = new NativeFunction(SSL_CTX_set_keylog_callback, 'void', ['pointer', 'pointer']);
                SSL_CTX_set_keylog_callbackFn(ssl, keyLogCallback);
            }
        }
    });
}
//https://github.com/zengfr/frida-codeshare-scripts
//-1799658334 @GDTNguyen/mlbb