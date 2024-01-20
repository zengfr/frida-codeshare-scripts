
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1413627481 @atuncer/ios-ssl-key-steal
/*
 * This is based on https://codeshare.frida.re/@andydavies/ios-tls-keylogger/
 * but does not require the binary to use `SSL_CTX_set_info_callback` etc. 
 * Instead it directly hooks `SSL_CTX_new` to find the pointer to each
 * SSL_CTX and then directly calls `SSL_CTX_set_keylog_callback`.
 * This method requires that you can find the the pointers to both
 * `SSL_CTX_new` and `SSL_CTX_set_keylog_callback` which might not
 * always be possible.
 *
 * This is based on work by Andy Davies
 *  Copyright (c) 2019 Andy Davies, @andydavies, http://andydavies.me
 *
 * The rest is his work 
 *  Copyright (c) 2020 Hugo Tunius, @k0nserv, https://hugotunius.se
 *
 * Andy's original code is released under MIT License and my modifications
 * are likewise MIT licensed.
 *
 * A full writeup is available on my blog
 * https://hugotunius.se/2020/08/07/stealing-tls-sessions-keys-from-ios-apps.html
 */

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
startTLSKeyLogger();
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1413627481 @atuncer/ios-ssl-key-steal
