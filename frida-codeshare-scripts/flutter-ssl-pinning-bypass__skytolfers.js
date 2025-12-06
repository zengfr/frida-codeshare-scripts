
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1422147281 @skytolfers/flutter-ssl-pinning-bypass
setTimeout(function() {

        var libraryModule = Process.findModuleByName("libflutter.so");

        var pattern = "55 41 57 41 56 41 55 41 54 53 50 49 89 fe 48 8b 1f 48 8b 43 30 4c 8b b8 d0 01 00 00 4d 85 ff 74 12 4d 8b a7 90 00 00 00 4d 85 e4 74 4a 49 8b 04 24 eb 46";

        var ranges = libraryModule.enumerateRanges('r-x');

        ranges.forEach(range => {

            Memory.scan(range.base, range.size, pattern, {
                onMatch: function(address, size) {
                    var ssl_verify_peer_cert_offset = address.sub(libraryModule.base).toString(16);
                    console.log("ssl_verify_peer_cert function offset:" + ssl_verify_peer_cert_offset);
                    hook_ssl_verify(address);
                }
            })

        });

        function hook_ssl_verify(address) {
            Interceptor.replace(address, new NativeCallback((pathPtr, flags) => {
                console.log("ssl_verify hooked");
                return 0;
            }, 'int', ['pointer', 'int']));
        }
    }, 1000);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1422147281 @skytolfers/flutter-ssl-pinning-bypass
