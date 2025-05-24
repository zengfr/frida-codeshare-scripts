
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-499808490 @AltayAkkus/tensorflow-lite-dumper
// Change if needed! Requires chmod 777 /data/local/tmp && disabling SELinux (setenforce 0)
const FOLDER_PATH = "/data/local/tmp/";

// util fn
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// accepts java.nio.ByteBuffer, writes it to file
function dumpByteBuffer(buf) {
    // Dumping the model to file
    var remaining = buf.remaining();
    // Unique filename to prevent collisions
    const filename = FOLDER_PATH + 'dump' + getRandomInt(99999) + '.tflite';

    console.log("[*] Opening file name=" + filename + " to write " + remaining + " bytes");
    const f = new File(filename, 'wb');
    // Uint8Array that will be written to file
    var outBuf = new Uint8Array(remaining);

    // Progress interval (every 1% or 100 bytes, whichever comes first)
    const progressInterval = Math.max(100, Math.floor(remaining / 100));

    // Transfer ByteBuffer to Uint8Array, byte by byte.
    for (var i = 0; i < remaining; i += 1000) {
        outBuf[i] = buf.get();

        // Log progress at intervals
        if (i % progressInterval === 0) {
            const progress = Math.floor((i / remaining) * 100);
            console.log(`[*] Writing... ${progress}% completed (${i} / ${remaining} bytes)`);
        }
    }

    console.log("[*] Writing " + remaining + " bytes...");
    f.write(outBuf);
    f.close();

    // checking
    remaining = buf.remaining();
    if (remaining > 0) {
        console.log("[-] Error: There are " + remaining + " remaining bytes!");
    } else {
        console.log("[+] File dumped successfully in " + filename);
    }
}

// Hooking
Java.perform(() => {
    const NativeInterpreterWrapper = (function() {
        try {
            return Java.use('org.tensorflow.lite.NativeInterpreterWrapper')
        } catch {
            return false
        }
    })()

    if (NativeInterpreterWrapper) {
        // Hook NativeInterpreterWrapper.createModelWithBuffer
        NativeInterpreterWrapper.createModelWithBuffer.overload('java.nio.ByteBuffer', 'long').implementation = function(byteBuffer, errorReporterPtr) {
            console.log("[+] Called NativeInterpreterWrapper.createModelWithBuffer");
            // Call the original method
            const result = this.createModelWithBuffer(byteBuffer, errorReporterPtr);
            // Dump the java.nio.ByteBuffer to file
            dumpByteBuffer(byteBuffer)
            // return original result
            return result;
        };
        // Hook NativeInterpreterWrapper.createModel
        NativeInterpreterWrapper.createModel.overload('java.lang.String', 'long').implementation = function(str, errorReporterPtr) {
            console.log("[+] Called NativeInterpreterWrapper.createModel");
            // Call the original method
            const result = this.createModel(str, errorReporterPtr);
            // Not implemented yet
            console.log("[*] Capturing model from string is not implemented yet! The string is either a filepath, or a buffer. The buffer may break your terminal and/or crash your app.")
            const answer = prompt("Print the string to console? (y/n)")
            if (answer.toLowerCase() == "y") {
                console.log(str)
            }
            return result

        }
    } else {
        console.log("org.tensorflow.lite.NativeInterpreterWrapper.createModelWithBuffer not found! Is your app using TFLite?")
    }

});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-499808490 @AltayAkkus/tensorflow-lite-dumper
