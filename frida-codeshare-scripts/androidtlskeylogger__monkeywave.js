
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1579656849 @monkeywave/androidtlskeylogger
/* 
   AndroidTLSKeylogger hooks common SSL libraries on Android to extract the TLS key material to the terminal
   
   If this project is not working try to use friTap: https://github.com/fkie-cad/friTap

*/

const TARGET_LIBS = [
    "libssl.so",
    "libconscrypt_gmscore_jni.so",
    "libconscrypt_jni.so"
];


const BORING_TARGET_LIBS = [
    "libwarp_mobile.so",
    "libcronet.so",
    "libssl.so",
    "libflutter.so"
];

// Constants for parsing
const SSL3_RANDOM_SIZE = 32; // Assuming SSL3_RANDOM_SIZE is 32 bytes
const SSL_MAX_MD_SIZE = 48;  // Assuming SSL_MAX_MD_SIZE is 64 bytes
var session_client_random = "";

function get_key_from_ptr(key_ptr){
    const MAX_KEY_LENGTH = 64;
    const RANDOM_KEY_LENGTH = 32;

    if (!key_ptr.isNull()) {
        let KEY_LENGTH = 0;
            let calculatedKeyLength = 0;

            // Iterate through the memory to determine key length
            while (calculatedKeyLength < MAX_KEY_LENGTH) {
                const byte = Memory.readU8(key_ptr.add(calculatedKeyLength)); // Read one byte at a time


                if (byte === 0) { // Stop if null terminator is found (optional, adjust as needed)
                    if(calculatedKeyLength < 20){
                        calculatedKeyLength++;
                        continue;
                    }
                    break;
                }
                calculatedKeyLength++;
            }
            //console.log("calculatedKeyLength: "+calculatedKeyLength);

            if (calculatedKeyLength > 24 && calculatedKeyLength <= 46) {
                KEY_LENGTH = 32; // Closest match is 32 bytes
            } else if (calculatedKeyLength >= 47 && calculatedKeyLength <=49) {
                KEY_LENGTH = 48; // Closest match is 48 bytes
            }else{
                KEY_LENGTH = 32; // fall back size
            }

        const keyData = Memory.readByteArray(key_ptr, KEY_LENGTH); // Read the key data (KEY_LENGTH bytes)
        
        // Convert the byte array to a string of space-separated hex values
        const hexKey = Array
            .from(new Uint8Array(keyData)) // Convert byte array to Uint8Array and then to Array
            .map(byte => byte.toString(16).padStart(2, '0').toUpperCase()) // Convert each byte to a 2-digit hex string
            .join(''); // Join all the hex values with a space


        //console.log("Key: "+hexKey); // Print the key as a space-separated hex string
        return hexKey;
        
    }

    return "";

}


function get_client_random(s3_ptr,SSL3_RANDOM_SIZE) {
    // Check if s3 pointer is valid
    if (!s3_ptr.isNull()) {
        // Offset for client_random is 0x30 in the s3 struct
        var client_random_ptr = s3_ptr.add(0x30);

        // Read the client_random bytes (32 bytes)
        var client_random = Memory.readByteArray(client_random_ptr, SSL3_RANDOM_SIZE);

        // Convert the bytes to an uppercase, concatenated hex string
        const hexClientRandom = Array
            .from(new Uint8Array(client_random))
            .map(byte => byte.toString(16).padStart(2, '0').toUpperCase()) // Convert to uppercase hex
            .join(''); // Concatenate the hex values without spaces

        //console.log("client_random (32 bytes): " + hexClientRandom);
        return hexClientRandom;
    } else {
        console.log("[Error] s3 pointer is NULL");
    }
}

function get_client_random_from_ssl_struct(ssl_st_ptr){
    // parses the ssl_st in order to get the client_random


    /* 
    https://github.com/google/boringssl/blob/d9ad235cd8c203db7430c366751f1dddcf450060/ssl/internal.h#L3926C1-L3958C53

    struct ssl_st {
      explicit ssl_st(SSL_CTX *ctx_arg);
      ssl_st(const ssl_st &) = delete;
      ssl_st &operator=(const ssl_st &) = delete;
      ~ssl_st();

      // method is the method table corresponding to the current protocol (DTLS or
      // TLS).
      const bssl::SSL_PROTOCOL_METHOD *method = nullptr;

      // config is a container for handshake configuration.  Accesses to this field
      // should check for nullptr, since configuration may be shed after the
      // handshake completes.  (If you have the |SSL_HANDSHAKE| object at hand, use
      // that instead, and skip the null check.)
      bssl::UniquePtr<bssl::SSL_CONFIG> config;

      // version is the protocol version.
      uint16_t version = 0;

      uint16_t max_send_fragment = 0;

      // There are 2 BIO's even though they are normally both the same. This is so
      // data can be read and written to different handlers

      bssl::UniquePtr<BIO> rbio;  // used by SSL_read
      bssl::UniquePtr<BIO> wbio;  // used by SSL_write

      // do_handshake runs the handshake. On completion, it returns |ssl_hs_ok|.
      // Otherwise, it returns a value corresponding to what operation is needed to
      // progress.
      bssl::ssl_hs_wait_t (*do_handshake)(bssl::SSL_HANDSHAKE *hs) = nullptr;

      bssl::SSL3_STATE *s3 = nullptr;   // TLS variables



    https://github.com/google/boringssl/blob/d9ad235cd8c203db7430c366751f1dddcf450060/ssl/internal.h#L2793C1-L2803C49



    struct SSL3_STATE {
          static constexpr bool kAllowUniquePtr = true;

          SSL3_STATE();
          ~SSL3_STATE();

          uint64_t read_sequence = 0;
          uint64_t write_sequence = 0;

          uint8_t server_random[SSL3_RANDOM_SIZE] = {0};
          uint8_t client_random[SSL3_RANDOM_SIZE] = {0};
    */
    var arch = Process.arch;
    var offset_s3 = 0x30;

    if (arch === 'x64' || arch === 'arm64') {
        offset_s3 = 0x30;  // Offset for x86-64 and arm64
    } else if (arch === 'x86' || arch === 'arm') {
        offset_s3 = 0x2C;  // Offset for x86 and arm
    }
    


    var s3_ptr = ssl_st_ptr.add(offset_s3).readPointer();
    return get_client_random(s3_ptr,SSL3_RANDOM_SIZE);
}


function get_ssl_ptr_from_handshake(hs_ptr) {
    var hs = hs_ptr;  // SSL_HANDSHAKE *hs is passed as the first argument
    var ssl_ptr = hs.add(0x8).readPointer();  // Since SSL *ssl is at offset 0

    return ssl_ptr;
}



function dump_keys(label, identifier,key) {
    // Set the expected length of the key (in bytes). Adjust as needed.
    const KEY_LENGTH = 32; // Assuming 32 bytes for this example, change this as required.
    var labelStr = "";
    var client_random = "";
    var secret_key = "";

    // Read and print the string from label (first parameter)
    //console.log("Label:");
    if (!label.isNull()) {
        labelStr = label.readCString(); // Read the C string
        //console.log("Label: "+labelStr);
    } else {
        console.log("[Error] Argument 'label' is NULL");
    }

    if (!identifier.isNull()) {
        console.log("SSL_Struct_pointer (working): ",identifier);
        client_random = get_client_random_from_ssl_struct(identifier)
    } else {
        console.log("[Error] Argument 'identifier' is NULL");
    }


    if (!key.isNull()) {
        secret_key = get_key_from_ptr(key);

    } else {
        console.log("[Error] Argument 'key' is NULL");
    }

    console.log(labelStr+" "+client_random+" "+secret_key);
}

/*

Currently only tested on ARM64
*/
function hook_ssl_log_secret(module_name){
        const cronetModule = Process.findModuleByName(module_name);

        let symbols = Process.getModuleByName(module_name).enumerateSymbols().filter(exports => exports.name.toLowerCase().includes("ssl_log"));
        if(symbols.length > 0){
            console.log("Installed ssl_log_secret() hooks using sybmols.");
            try{
                Interceptor.attach(symbols[0].address, {
                    onEnter: function(args) {
                        // label(X1), identifier (X0),key (X2) 
                        dump_keys(args[1], args[0], args[2]);
                    }
                });

            }catch(e){
                // right now we ingore error's here
            }
        }
    
}

function hookLibrary(libname) {
    try {
        let sslCtxNewPtr = Module.findExportByName(libname, "SSL_CTX_new");
        if (sslCtxNewPtr) {
            console.log("[*] Found SSL_CTX_new in " + libname + " at " + sslCtxNewPtr);
            Interceptor.attach(sslCtxNewPtr, {
                onEnter: function (args) {
                    console.log("[*] SSL_CTX_new called in " + libname);
                },
                onLeave: function (retval) {
                    console.log("[*] SSL_CTX_new returned: " + retval);
                    
                    let keylog_callback = new NativeCallback(function (ctx, line) {
                        // 'line' is a pointer to a C string.
                        let logLine = Memory.readCString(line);
                        console.log("[*] KEYLOG: " + logLine);
                    }, 'void', ['pointer', 'pointer']);

                    // Look up SSL_CTX_set_keylog_callback in the same library.
                    let setKeylogPtr = Module.findExportByName(libname, "SSL_CTX_set_keylog_callback");
                    if (setKeylogPtr) {
                        console.log("[*] Found SSL_CTX_set_keylog_callback in " + libname + " at " + setKeylogPtr);
                        let setKeylog = new NativeFunction(setKeylogPtr, 'void', ['pointer', 'pointer']);
                        // Call the function on the returned SSL_CTX from SSL_CTX_new.
                        setKeylog(retval, keylog_callback);
                        console.log("[*] Installed keylog callback in " + libname);
                    } else {
                        console.log("[!] Could not find SSL_CTX_set_keylog_callback in " + libname);
                    }
                }
            });
        } else {
            console.log("[!] SSL_CTX_new not found in " + libname);
        }
    } catch (e) {
        console.error("[!] Error hooking " + libname + ": " + e);
    }
}

// Hook function for dlopen (and android_dlopen_ext) so that if a target lib is loaded later, we hook it.
function hookDlopen() {
    const DLOPEN_FUNCS = ["dlopen", "android_dlopen_ext"];
    DLOPEN_FUNCS.forEach(function(name) {
        let addr = Module.findExportByName(null, name);
        if (addr) {
            console.log("[*] Hooking " + name + " at " + addr);
            Interceptor.attach(addr, {
                onEnter: function(args) {
                    // Read the name of the library being loaded.
                    this.libName = Memory.readCString(args[0]);
                    // Optionally log the library name.
                    // console.log("[*] " + name + " called for: " + this.libName);
                },
                onLeave: function(retval) {
                    if (this.libName) {
                        TARGET_LIBS.forEach(function(target) {
                            if (this.libName.indexOf(target) >= 0) {
                                console.log("[*] Detected target library load: " + this.libName);
                                // Attempt to hook the library after it is loaded.
                                hookLibrary(target);
                            }
                        }.bind(this)); // 

                        BORING_TARGET_LIBS.forEach(function(target) {
                            if (this.libName.indexOf(target) >= 0) {
                                console.log("[*] Detected target library load: " + this.libName);
                                // Attempt to hook the library after it is loaded.
                                hook_ssl_log_secret(target);
                            }
                        }.bind(this));
                    }
                }
            });
        } else {
            console.log("[!] Could not find export for " + name);
        }
    });
}

// First, try to hook target libraries that are already loaded.
TARGET_LIBS.forEach(function(lib) {
    if (Module.findBaseAddress(lib) !== null) {
        console.log("[*] " + lib + " is already loaded. Installing hooks.");
        hookLibrary(lib);
    }
});

// First, try to hook target libraries that are already loaded.
BORING_TARGET_LIBS.forEach(function(lib) {
    if (Module.findBaseAddress(lib) !== null) {
        console.log("[*] " + lib + " is already loaded. Installing hooks.");
        hook_ssl_log_secret(lib);
    }
});


// Then, install hooks on dlopen to catch future loads.
hookDlopen();
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1579656849 @monkeywave/androidtlskeylogger
