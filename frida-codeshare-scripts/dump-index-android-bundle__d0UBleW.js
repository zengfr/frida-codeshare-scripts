
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1378020050 @d0UBleW/dump-index-android-bundle
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
 * Dump encrypted index.android.bundle at runtime
 * 
 */

let do_dlopen = null;
Process.enumerateModules().forEach(function(module) {
    module.enumerateSymbols().forEach(function(symbol) {
        if (symbol.name.includes("do_dlopen")) {
            // console.log("[*] do_dlopen found @ " + module.name);
            do_dlopen = symbol.address;
        }
    });
});


Java.perform(function() {
    hookLibs();
})

let index_android_bundle_length = 0;

let libs = {};
let libHooks = {
    "libreactnativejni.so": {
        "hook": hookLibrnjni,
        "hooked": false,
    },
    "libandroid.so": {
        "hook": hookLibandroid,
        "hooked": false,
    }
};

function hookLibrnjni(lib_base) {
    console.log("[*] Installing hook for libreactnativejni.so @ " + lib_base);
    // nm -gD ./libreactnativejni.so | grep isHermes
    Interceptor.attach(get_addr("libreactnativejni.so", "_ZN8facebook5react22isHermesBytecodeBundleERKNS0_12BundleHeaderE"), {
        onEnter: function(args) {
            console.log("[*] isHermesBytecodeBundle called");
            console.log("[*] bundle size: " + index_android_bundle_length);
            // let d = new Date();
            // var timestamp = ("0" + d.getFullYear()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + d.getDate() + "_" + ("0" + d.getHours()).slice(-2) + "-" + ("0" + d.getMinutes()).slice(-2) + "-" + ("0" + d.getSeconds()).slice(-2) + "-" + ("0" + d.getMilliseconds()).slice(-2);
            var timestamp = Date.now();
            let bundle = args[0].readByteArray(index_android_bundle_length);
            const filename = `/sdcard/Download/index.android.bundle_${timestamp}`;
            console.log(`[*] Writing bundle to ${filename}`)
            const f = new File(filename, 'wb');
            f.write(bundle);
            f.close();
            console.log(`[*] Successfully wrote bundle to ${filename}`);
        },
        onLeave: function(retval) {
            return retval;
        }
    });
}

function hookLibandroid(lib_base) {
    console.log("[*] Installing hook for libandroid.so @ " + lib_base);
    let aa_get_length = new NativeFunction(
        get_addr("libandroid.so", "AAsset_getLength64"),
        "pointer", ["pointer"],
    );
    Interceptor.attach(get_addr("libandroid.so", "AAssetManager_open"), {
        onEnter: function(args) {
            this.filename = args[1].readCString();
            console.log("[*] AAssetManager_open " + this.filename);
        },
        onLeave: function(retval) {
            if (!retval.compare(ptr(0))) {
                return retval;
            }
            if (this.filename == "index.android.bundle") {
                let aasset = retval;
                let len = aa_get_length(aasset);
                index_android_bundle_length = parseInt(len.toString(), 16);
            }
            return retval;
        }
    });
}

function hookLibs() {
    Interceptor.attach(do_dlopen, {
        onEnter: function(args) {
            this.is_null = false;
            this.libname = args[0].readCString();
            if (this.libname !== null) {
                this.libname = this.libname.split("/").reverse()[0];
                // console.log("[*] do_dlopen " + this.libname);
            } else {
                this.is_null = true;
                return;
            }
        },
        onLeave: function(retval) {
            if (this.is_null) {
                return retval;
            }
            if (this.libname in libHooks) {
                let lib = Process.findModuleByName(this.libname);
                // console.log("[*] Loaded " + this.libname + " @ " + lib.base);
                let libh = libHooks[this.libname];
                if (!libh.hooked) {
                    libh.hook(lib.base);
                    libh.hooked = true;
                }
            }
            return retval;
        }
    });
}

function get_addr(libname, sym) {
    return Module.getExportByName(libname, sym);
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1378020050 @d0UBleW/dump-index-android-bundle
