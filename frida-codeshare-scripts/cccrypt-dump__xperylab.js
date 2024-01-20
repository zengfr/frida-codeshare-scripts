
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-244099115 @xperylab/cccrypt-dump
function base64(input) {
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    input = new Uint8Array(input);
    while (i < input.byteLength) {
        chr1 = input[i++];
        chr2 = input[i++];
        chr3 = input[i++];
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
    }
    return output;
}


var func_crypto = Module.findExportByName('libcommonCrypto.dylib', 'CCCrypt');
var out;
var outLen;
Interceptor.attach(func_crypto, {
    onEnter: function(args) {
        var valuein = '';
        try {
            valuein = Memory.readUtf8String(args[6]);
        } catch (error) {
            var dataLength = args[7].toInt32();
            valuein = base64(Memory.readByteArray(args[6], dataLength));
        }

        console.log('Value In: ' + valuein);
        var key = Memory.readByteArray(args[3], 32);
        console.log('Key: ' + base64(key));
        var iv = Memory.readByteArray(args[5], 16);
        console.log('IV: ' + base64(iv));
        out = args[8];
        outLen = args[9];

    },

    onLeave: function(retval) {
        var valueout = '';
        try {
            valueout = Memory.readUtf8String(out);
        } catch (error) {
            var dataLength = outLen.toInt32();
            valueout = base64(Memory.readByteArray(out, dataLength));
        }
        console.log('Value Out: ' + valueout);
        console.log('\n');
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-244099115 @xperylab/cccrypt-dump
