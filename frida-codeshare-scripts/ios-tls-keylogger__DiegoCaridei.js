
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-2094937256 @DiegoCaridei/ios-tls-keylogger
/*

See https://www.iprog.it/blog/varie/capturing-and-decrypting-https-traffic-from-ios-apps-using-frida/
frida -U -l ios-tls-keylogger.js   -o keylogfile.txt -f com.einnovation.temu
*/

function offset() {
    var processInfo = ObjC.classes.NSProcessInfo.processInfo();
    var versionString = processInfo.operatingSystemVersionString().toString();
    var ver = versionString.split(' ');
    var version = ver[1];
    //tested
    if (version.startsWith("14")) {
        return 0x2B8;
    }
    //Not tested
    else if (version.startsWith("15")) {
        return 0x2f8;
    }
    //Not tested
    else if (version.startsWith("16")) {
        return 0x300;
    }
    //Not tested
    else if (version.startsWith("17")) {
        return 0x308;
    } else {
        console.log("Unknown iOS version: " + version);
    }
}

var key_log_callback = new NativeCallback(key_logger, 'void', ['pointer', 'pointer']);

function key_logger(ssl, line) {
    console.log(new NativePointer(line).readCString());
}



Interceptor.attach(Module.findExportByName(null, 'dlopen'), {

    onEnter: function(args) {
        var libNamePointer = args[0];
        if (libNamePointer.isNull()) {
            console.log('Library name pointer is null.');
            return;
        }

        var libName = Memory.readUtf8String(libNamePointer);
        if (libName === null) {
            console.log('Failed to read library name.');
            return;
        }

        if (libName.indexOf('libboringssl.dylib') !== -1) {
            console.log('libboringssl.dylib loaded');
            var CALLBACK_OFFSET = offset();
            // Imposta un timer per ritardare l'esecuzione del codice
            setTimeout(function() {
                var SSL_CTX_set_info_callback = Module.findExportByName('libboringssl.dylib', 'SSL_CTX_set_info_callback');
                if (SSL_CTX_set_info_callback === null) {
                    console.log('Function SSL_CTX_set_info_callback not found.');
                } else {
                    console.log('Function found at: ' + SSL_CTX_set_info_callback);
                    Interceptor.attach(SSL_CTX_set_info_callback, {
                        onEnter: function(args) {
                            var ssl = new NativePointer(args[0]);
                            var callback = new NativePointer(ssl).add(CALLBACK_OFFSET);
                            callback.writePointer(key_log_callback);
                        }
                    });
                }
            }, 1000); // Attendi 1 secondo prima di controllare di nuovo
        }
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-2094937256 @DiegoCaridei/ios-tls-keylogger
