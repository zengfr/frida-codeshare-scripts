
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1336229328 @d0UBleW/dump-ios-jsbundle
/**
 * Copyright (c) 2024 d0ublew
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * 
 * Dump encrypted main.jsbundle at runtime
 * 
 */

const bundle_filename = `/var/mobile/Documents/main.jsbundle`;
if (ObjC.available) {
    let loaded_sync = false;
    let rct_js_loader = ObjC.classes.RCTJavaScriptLoader
    // let load_bundle = rct_js_loader['loadBundleAtURL:onProgress:onComplete:']
    let nsdata_data = ObjC.classes.NSData['dataWithContentsOfFile:options:error:'];
    Interceptor.attach(nsdata_data.implementation, {
        onEnter: function(args) {
            this.path = ObjC.Object(args[2]);
        },
        onLeave: function(retval) {
            if (!loaded_sync && this.path.toString().includes("main.jsbundle")) {
                console.log("[*] async path");
                let data = ObjC.Object(retval);
                let bundle = ptr(data.bytes()).readByteArray(data.length());
                writeToFile(bundle, bundle_filename);
            }
        }
    });
    let sync_load = rct_js_loader['attemptSynchronousLoadOfBundleAtURL:sourceLength:error:']
    Interceptor.attach(sync_load.implementation, {
        onEnter: function(args) {},
        onLeave: function(retval) {
            if (retval.compare(ptr(0x0))) {
                loaded_sync = true;
                console.log("[*] sync path");
                let data = ObjC.Object(retval);
                let bundle = ptr(data.bytes()).readByteArray(data.length());
                writeToFile(bundle, bundle_filename);
            }
        }
    })
}

function writeToFile(buf, filename) {
    var timestamp = Date.now();
    console.log(`[*] Writing bundle to ${filename}`)
    const f = new File(filename, 'wb');
    f.write(buf);
    f.close();
    console.log(`[*] Successfully wrote bundle to ${filename}`);
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1336229328 @d0UBleW/dump-ios-jsbundle
