
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:953314208 @atuncer/ios-ssl-key-steal2
var CALLBACK_OFFSET = 0x2b8; //ios 14

// Logging function, reads null terminated string from address in line
function key_logger(ssl, line) {
    console.log(new NativePointer(line).readCString());
}

// Wrap key_logger JS function in NativeCallback
var key_log_callback = new NativeCallback(key_logger, 'void', ['pointer', 'pointer']);

/*
 * SSL_CTX_set_keylog_callback isn't implemented in iOS version of boringssl
 *
 * Hook SSL_CTX_set_info_callback as it can access SSL_CTX and 
 * directly set SSL_CTX->keylog_callback to address of logging callback above
 */
var SSL_CTX_set_info_callback = Module.findExportByName("libboringssl.dylib", "SSL_CTX_set_info_callback");

Interceptor.attach(SSL_CTX_set_info_callback, {
    onEnter: function(args) {
        var ssl = new NativePointer(args[0]);
        var callback = new NativePointer(ssl).add(CALLBACK_OFFSET);

        callback.writePointer(key_log_callback);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:953314208 @atuncer/ios-ssl-key-steal2
