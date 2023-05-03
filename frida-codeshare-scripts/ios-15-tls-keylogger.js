
//https://github.com/zengfr/frida-codeshare-scripts
//-1358644863 @jankais3r/ios-15-tls-keylogger
/*
Updated with iOS 15.x offsets by @jankais3r in November 2022.
Use like this:
frida -U --codeshare jankais3r/ios-15-tls-keylogger --no-pause -o keylogfile.txt -p 2845
or
frida -U --codeshare jankais3r/ios-15-tls-keylogger --no-pause -o keylogfile.txt -f com.apple.shortcuts
*/

/*
ios-tls-keylogger.js

Extracts secrets from TLS sessions so packet captures can be decrypted

See https://andydavies.me/blog/2019/12/12/capturing-and-decrypting-https-traffic-from-ios-apps/

Copyright (c) 2019 Andy Davies, @andydavies, http://andydavies.me

Released under MIT License, feel free to fork it, incorporate into other software etc.
*/

/*
Steps to find an offset for a specific version of iOS:
1) Download an IPSW, unzip it.
2) Mount the largest (~5.5GB) DMG image and copy out the following folder: `/System/Library/Caches/com.apple.dyld`.
3) Extract the dyld shared cache: `dsc_extractor com.apple.dyld/dyld_shared_cache_arm64 extracted`.
4) Disassemble `/usr/lib/libboringssl.dylib` in Binary Ninja or similar.
5) Locate the `ssl_log_secret` function. The second instance of `ldr` instruction holds our offset.

0000000199381680  int64_t bssl::ssl_log_secret(void* arg1, int64_t arg2, char* arg3, int64_t arg4)
0000000199381680         sub         sp, sp, #0x60
0000000199381684         stp         x22, x21, [sp, #0x30]
0000000199381688         stp         x20, x19, [sp, #0x40]
000000019938168c         stp         x29, x30, [sp, #0x50]
0000000199381690         add         x29, sp, #0x50
0000000199381694         ldr         x8, [x0, #0x78]
0000000199381698         ldr         x8, [x8, #0x2f8]; <--- This is our offset
000000019938169c         cbz         x8, 0x1993817a4

iOS versionMD5 (/usr/lib/libboringssl.dylib)Offset
15.0331e2de619435e8a9eb1c61df6a1ad710x2f8
15.0.1b5c9e2183fd9727111ebe354f235c3660x2f8
15.0.2c66960115dd2d8f76940e445a5b88e3b0x2f8
15.163eb7d8f4c1fa57751b6348531b616330x2f8
15.292bf3f6f87e7be25135b0ac7ec479bc40x2f8
15.2.157a6e4f13597e3052bfd5bb3a69913460x2f8
15.3e2e01c1f89e2467d28b672937aac9a290x2f8
15.3.1e2e01c1f89e2467d28b672937aac9a290x2f8
15.4ee4132c6469e4c3fceb6ddce4ddd12ad0x2f8
15.4.1b50ab797ad8ada3d8a2ed8d1faa02fc40x2f8
15.5198d42ff836f4cb72dac2d200fc47a7e0x2f8
15.667d83be27f553d7959a94c90f90f060b0x2f8
15.6.167d83be27f553d7959a94c90f90f060b0x2f8
15.79b81ff819e641de2007a140054a24e590x2f8
15.7.128da87d0f8384149f3f0631193e02a780x2f8
*/

var CALLBACK_OFFSET = 0x2f8;

function key_logger(ssl, line) {
    console.log(new NativePointer(line).readCString());
}

var key_log_callback = new NativeCallback(key_logger, 'void', ['pointer', 'pointer']);
var SSL_CTX_set_info_callback = Module.findExportByName('libboringssl.dylib', 'SSL_CTX_set_info_callback');

Interceptor.attach(SSL_CTX_set_info_callback, {
    onEnter: function(args) {
        var ssl = new NativePointer(args[0]);
        var callback = new NativePointer(ssl).add(CALLBACK_OFFSET);

        callback.writePointer(key_log_callback);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts
//-1358644863 @jankais3r/ios-15-tls-keylogger
