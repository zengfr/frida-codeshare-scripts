
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1046214415 @angga0x/how-payload-encrypted
// frida_xl_encryption_minimal.js - Minimalist Frida script to intercept XL payload encryption
// This script focuses only on the essential encryption functions to avoid hanging the app

Java.perform(function() {
    console.log("[*] Starting minimal XL encryption analysis...");
    
    try {
        // Hook Android's Cipher class - focus on the most relevant methods
        var Cipher = Java.use('javax.crypto.Cipher');
        var SecretKeySpec = Java.use('javax.crypto.spec.SecretKeySpec');
        var String = Java.use('java.lang.String');
        
        // Hook Cipher.init for encryption mode
        Cipher.init.overload('int', 'java.security.Key').implementation = function(opmode, key) {
            if (opmode == 1) { // Cipher.ENCRYPT_MODE
                console.log("\n[CIPHER] Cipher.init() called for ENCRYPTION");
                try {
                    var keyBytes = key.getEncoded();
                    console.log('[CIPHER] Key: ' + bytesToHex(keyBytes));
                } catch (e) {
                    console.log('[CIPHER] Error getting key: ' + e);
                }
            }
            return this.init(opmode, key);
        };
        
        // Hook Cipher.doFinal to capture encrypted data
        Cipher.doFinal.overload('[B').implementation = function(input) {
            var result = this.doFinal(input);
            try {
                // Only log if this looks like it might be XL-related data
                if (input.length > 50) {
                    var inputStr = String.$new(input);
                    console.log("\n[ENCRYPT] Processing data (" + input.length + " bytes)");
                    
                    // Log if it contains JSON-like structures or XL indicators
                    if (inputStr.includes('{') && inputStr.includes('}') && 
                        (inputStr.includes('lang') || inputStr.includes('xdata') || inputStr.includes('xtime'))) {
                        console.log('[ENCRYPT] Input (likely JSON): ' + inputStr.substring(0, 200) + (inputStr.length > 200 ? '...' : ''));
                        console.log('[ENCRYPT] Output (encrypted): ' + bytesToHex(result));
                    } else if (input.length > 100) {
                        // Log large binary data
                        console.log('[ENCRYPT] Large input detected, first 100 bytes: ' + bytesToHex(input.slice(0, 100)));
                        console.log('[ENCRYPT] Output (encrypted), first 100 bytes: ' + bytesToHex(result.slice(0, 100)));
                    }
                }
            } catch (e) {
                // If we can't convert to string, log if it's significant binary data
                if (input.length > 100) {
                    console.log("\n[ENCRYPT] Binary data processing (" + input.length + " bytes)");
                    console.log('[ENCRYPT] First 50 bytes: ' + bytesToHex(input.slice(0, 50)));
                    console.log('[ENCRYPT] Output first 50 bytes: ' + bytesToHex(result.slice(0, 50)));
                }
            }
            return result;
        };
        
        console.log("[*] Hooked essential Cipher functions");
    } catch (e) {
        console.log("[!] Error hooking Cipher: " + e);
    }
    
    // Hook HTTP functions to capture requests with encrypted payloads
    try {
        var HttpURLConnection = Java.use('java.net.HttpURLConnection');
        var OutputStream = Java.use('java.io.OutputStream');
        var String = Java.use('java.lang.String');
        
        // Hook getOutputStream to identify XL API requests
        HttpURLConnection.getOutputStream.implementation = function() {
            try {
                var url = this.getURL().toString();
                // Focus on XL-related URLs
                if (url.includes('xl') || url.includes('myxl') || url.includes('api')) {
                    console.log("\n[HTTP] XL-related request detected");
                    console.log('[HTTP] URL: ' + url);
                    console.log('[HTTP] Method: ' + this.getRequestMethod());
                    
                    // Log relevant headers
                    try {
                        var contentType = this.getRequestProperty('Content-Type');
                        if (contentType) console.log('[HTTP] Content-Type: ' + contentType);
                        
                        var auth = this.getRequestProperty('Authorization');
                        if (auth) console.log('[HTTP] Authorization present: true');
                        
                        var signature = this.getRequestProperty('X-Signature');
                        if (signature) console.log('[HTTP] X-Signature present: true');
                    } catch (e) {}
                }
            } catch (e) {}
            
            return this.getOutputStream();
        };
        
        // Hook OutputStream.write to capture request bodies
        OutputStream.write.overload('[B').implementation = function(data) {
            try {
                // Only analyze significant data payloads
                if (data.length > 50) {
                    var dataStr = String.$new(data);
                    
                    // Look for XL-specific patterns
                    if (dataStr.includes('xdata') || dataStr.includes('xtime') || 
                        (dataStr.trim().startsWith('{') && dataStr.includes('}') && dataStr.length > 100)) {
                        console.log("\n[HTTP-WRITE] XL payload detected:");
                        console.log('[HTTP-WRITE] Data: ' + dataStr);
                    } else if (data.length > 500) {
                        // Log very large payloads
                        console.log("\n[HTTP-WRITE] Large payload (" + data.length + " bytes)");
                        console.log('[HTTP-WRITE] First 200 chars: ' + dataStr.substring(0, 200));
                    }
                }
            } catch (e) {
                // For binary data, check if it's large
                if (data.length > 500) {
                    console.log("\n[HTTP-WRITE] Large binary payload (" + data.length + " bytes)");
                    console.log('[HTTP-WRITE] First 50 bytes (hex): ' + bytesToHex(data.slice(0, 50)));
                }
            }
            
            return this.write(data);
        };
        
        console.log("[*] Hooked HTTP functions");
    } catch (e) {
        console.log("[!] Error hooking HTTP functions: " + e);
    }
    
    // Helper functions
    function bytesToHex(bytes) {
        try {
            var result = '';
            for (var i = 0; i < Math.min(bytes.length, 32); i++) {
                var hex = (bytes[i] & 0xFF).toString(16);
                if (hex.length === 1) hex = '0' + hex;
                result += hex;
            }
            if (bytes.length > 32) result += '...';
            return result.toUpperCase();
        } catch (e) {
            return '[Error converting to hex]';
        }
    }
});

console.log("[*] Minimal XL encryption interceptor loaded. Waiting for app activity...");
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1046214415 @angga0x/how-payload-encrypted
