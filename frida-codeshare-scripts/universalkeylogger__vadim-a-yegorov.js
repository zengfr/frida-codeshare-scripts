
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:952417280 @vadim-a-yegorov/universalkeylogger
/**
 * Android, iOS (12.0-15.7.3), Linux universal SSLKEYLOG dumper.
 *
 * Usage:
 * 
 *   # For iOS and mac:
 *   rvictl -s [UDID]
 *   # Then open Wireshark and select rvi0
 * 
 *   # For iOS and not mac:
 *   git clone https://github.com/gh2o/rvi_capture
 *   ./rvi_capture/rvi_capture.py - | wireshark -k -i -
 * 
 *   # For Android
 *   androiddump --extcap-interface=android-wifi-tcpdump --capture --fifo=&1 | wireshark -k -i -
 * 
 *   # For Linux
 *   tcpdump
 * 
 *   # Dumping SSLKEYLOG
 *   frida --codeshare vadim-a-yegorov/universalkeylogger -f YOUR_BINARY -U --no-pause > sslkeylog.log
 *   
 *   # Then in Wireshark TLS settings load "sslkeylog.log" file
 * 
 * Vadim A. Yegorov
 * https://gist.github.com/vadim-a-yegorov/9d4fbcdfec055373656daa9bc97063ac
 */


/**
 * Sleep
 */
async function sleep(seconds = 0) {
    await new Promise(r => setTimeout(r, seconds * 1000))
}


/**
 * Logging function, reads null terminated string from address in line.
 */
function keyLogger(ssl, line) {
    const keylog = new NativePointer(line).readCString()
    console.log(keylog)
}
const keyLogCallback = new NativeCallback(keyLogger, 'void', ['pointer', 'pointer'])


/**
 * Start logging libboringssl.dylib TLS keys. Should be called before resuming the binary.
 */
function startSystemTLSKeyLogger() {
    const moduleName = "libboringssl.dylib"

    // iOS version
    const deviceSystemVersion = ObjC.classes.UIDevice.currentDevice().systemVersion()
    const deviceSystemVersionMajor = deviceSystemVersion.floatValue() ^ 0

    // Offset of keylog_callback pointer in SSL struct
    // Derived from dissassembly of ssl_log_secret in ssl_lib.c (libboringssl.dylib) on iOS
    const CALLBACK_OFFSET = {
        12: 0x2A8,
        13: 0x2C0,
        14: 0x2B8,
        15: 0x2F8
    }[deviceSystemVersionMajor]
    if (!CALLBACK_OFFSET) {
        throw new Error(`iOS ${deviceSystemVersion} isn't supported yet.`)
    }

    // Intercept
    const SSL_CTX_set_info_callback = Module.findExportByName(moduleName, "SSL_CTX_set_info_callback");
    Interceptor.attach(SSL_CTX_set_info_callback, {
        onEnter: function(args) {
            const ssl = new NativePointer(args[0])
            const callback = new NativePointer(ssl).add(CALLBACK_OFFSET)
            callback.writePointer(keyLogCallback)
        }
    })
    send(`Module ${moduleName} SSL logging started.`)
}


/**
 * Start logging TLS keys. Should be called before resuming the binary.
 */
function startTLSKeyLogger(moduleName) {
    if (moduleName === "libboringssl.dylib") {
        return startSystemTLSKeyLogger()
    }
    const SSL_CTX_new = Module.findExportByName(moduleName, "SSL_CTX_new")
    const SSL_CTX_set_keylog_callback = Module.findExportByName(moduleName, "SSL_CTX_set_keylog_callback")
    if (!SSL_CTX_set_keylog_callback) {
        return
    }
    Interceptor.attach(SSL_CTX_new, {
        onLeave: function(retval) {
            const ssl = new NativePointer(retval)
            if (!ssl.isNull()) {
                const SSL_CTX_set_keylog_callbackFn = new NativeFunction(SSL_CTX_set_keylog_callback, 'void', ['pointer', 'pointer'])
                SSL_CTX_set_keylog_callbackFn(ssl, keyLogCallback)
            }
        }
    })
    send(`Module ${moduleName} SSL logging started.`)
}


(async function() {
    // Wait for environment (for iOS)
    if (Process.platform === "darwin") {
        while (true) {
            try {
                Module.ensureInitialized("libboringssl.dylib")
                break
            } catch {
                await sleep(0)
            }
        }
    }
    send("Loaded!")

    if (Process.platform === "darwin") {
        startTLSKeyLogger("libboringssl.dylib")
    }

    const modules = Process.enumerateModules()
    for (const module of modules) {
        if (module.name === "libboringssl.dylib") {
            continue
        }

        startTLSKeyLogger(module.name)
    }
})()
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:952417280 @vadim-a-yegorov/universalkeylogger
