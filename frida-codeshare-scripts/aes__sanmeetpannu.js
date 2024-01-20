
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:77249728 @sanmeetpannu/aes
function addColor(color, text) {
    var colors = {
        reset: '\x1b[0m',
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
    };

    return colors[color] + text + colors.reset;
}

// Function to generate a cool logo-like text
function generateLogoText() {
    var logoText =
        "███████╗ █████╗ ███╗   ██╗███╗   ███╗███████╗███████╗████████╗    ██████╗  █████╗ ███╗   ██╗███╗   ██╗██╗   ██╗\n" +
        "██╔════╝██╔══██╗████╗  ██║████╗ ████║██╔════╝██╔════╝╚══██╔══╝    ██╔══██╗██╔══██╗████╗  ██║████╗  ██║██║   ██║\n" +
        "███████╗███████║██╔██╗ ██║██╔████╔██║█████╗  █████╗     ██║       ██████╔╝███████║██╔██╗ ██║██╔██╗ ██║██║   ██║\n" +
        "╚════██║██╔══██║██║╚██╗██║██║╚██╔╝██║██╔══╝  ██╔══╝     ██║       ██╔═══╝ ██╔══██║██║╚██╗██║██║╚██╗██║██║   ██║\n" +
        "███████║██║  ██║██║ ╚████║██║ ╚═╝ ██║███████╗███████╗   ██║       ██║     ██║  ██║██║ ╚████║██║ ╚████║╚██████╔╝\n" +
        "╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝     ╚═╝╚══════╝╚══════╝   ╚═╝       ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝ ╚═════╝\n";

    return logoText;
}

/// Generate and print the logo-like text


console.log(
    addColor("green", generateLogoText())
);
Java.perform(function() {


    var Cipher = Java.use('javax.crypto.Cipher');
    var SecretKeySpec = Java.use('javax.crypto.spec.SecretKeySpec');
    var IvParameterSpec = Java.use('javax.crypto.spec.IvParameterSpec');
    var HttpURLConnection = Java.use('java.net.HttpURLConnection');

    // Function to convert byte array to hex string
    function bytesToHex(bytes) {
        var hexArray = [];
        for (var i = 0; i < bytes.length; ++i) {
            var hex = (bytes[i] & 0xff).toString(16);
            hex = hex.length === 1 ? '0' + hex : hex;
            hexArray.push(hex);
        }
        return hexArray.join('');
    }


    var sno = 0;

    // Function to convert byte array to base64 string
    function bytesToBase64(bytes) {
        var base64Chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var base64 = '';
        var byte1, byte2, byte3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        while (i < bytes.length) {
            byte1 = bytes[i++];
            byte2 = bytes[i++];
            byte3 = bytes[i++];

            enc1 = byte1 >> 2;
            enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
            enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
            enc4 = byte3 & 63;

            if (isNaN(byte2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(byte3)) {
                enc4 = 64;
            }

            base64 +=
                base64Chars.charAt(enc1) +
                base64Chars.charAt(enc2) +
                base64Chars.charAt(enc3) +
                base64Chars.charAt(enc4);
        }

        return base64;
    }

    // Hook Cipher init method
    Cipher.init.overload(
        'int',
        'java.security.Key',
        'java.security.spec.AlgorithmParameterSpec'
    ).implementation = function(opmode, key, params) {
        var algorithm = this.getAlgorithm();

        if (algorithm && algorithm.indexOf('/GCM/') !== -1) {
            var keyBytes = Java.cast(key, SecretKeySpec).getEncoded();
            var iv = null;

            if (params) {
                iv = Java.cast(params, IvParameterSpec).getIV();
            }

            var keyHex = bytesToHex(keyBytes);
            var ivHex = iv ? bytesToHex(iv) : 'No IV';
            sno++;

            console.log(
                addColor('red', '============== Found Method ==============')
            );

            console.log(
                addColor('cyan', 'S.NO:' + sno)
            );
            console.log(
                addColor('green', 'Cipher:' + algorithm)
            );

            console.log(
                addColor('blue', 'KEY (Hex):' + keyHex)
            );
            console.log(
                addColor('yellow', 'IV (Hex):' + ivHex)
            );

            var keyBase64 = bytesToBase64(keyBytes);
            var ivBase64 = iv ? bytesToBase64(iv) : 'No IV';

            console.log(
                addColor('blue', 'KEY (Base64):' + keyBase64)
            );
            console.log(
                addColor('yellow', 'IV (Base64):' + ivBase64)
            );

            console.log(
                addColor('red', '============== End Method ==============')
            );
            console.log('                                       ');
        }

        return this.init.apply(this, arguments);
    };

    // Hook HttpURLConnection getOutputStream method
    HttpURLConnection.getOutputStream.implementation = function() {
        var url = this.getURL().toString();
        console.log('URL: ' + url);

        return this.getOutputStream.apply(this, arguments);
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:77249728 @sanmeetpannu/aes
