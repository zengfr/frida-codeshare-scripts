
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-596952088 @Akramelbahar/native-request-module-offset-finder-
/*
 * Frida SSL/TLS Tracer
 * This script hooks various SSL/TLS and socket-related functions to help identify
 * where SSL/TLS operations are performed in native code.
 */

// Helper function to print stack traces with module information
function getStackTraceWithModules() {
    let result = "";
    try {
        throw new Error();
    } catch (e) {
        const stack = Thread.backtrace(e.context, Backtracer.ACCURATE)
            .map(DebugSymbol.fromAddress)
            .filter(function(symbol) {
                return symbol.name !== null && symbol.name.indexOf("frida") === -1;
            });

        for (let i = 0; i < stack.length; i++) {
            result += `${i}\t${stack[i].address} ${stack[i].moduleName}!${stack[i].name || "???"}\n`;
        }
    }
    return result;
}

// Function to get module details for an address
function getModuleForAddress(addr) {
    try {
        const module = Process.findModuleByAddress(addr);
        if (module) {
            return `${module.name} (${module.base}-${module.base.add(module.size)})`;
        }
    } catch (e) {}
    return "Unknown module";
}

// Hook OpenSSL functions
function hookOpenSSL() {
    console.log("[*] Hooking OpenSSL functions...");

    const sslHandshakeFuncs = [
        "SSL_connect",
        "SSL_do_handshake",
        "SSL_accept",
        "SSL_CTX_new",
        "TLS_method",
        "TLS_client_method",
        "SSL_new"
    ];

    sslHandshakeFuncs.forEach(funcName => {
        const func = Module.findExportByName(null, funcName);
        if (func) {
            console.log(`[+] Found ${funcName} at ${func}`);
            Interceptor.attach(func, {
                onEnter: function(args) {
                    console.log(`\n[+] Called ${funcName}`);
                    console.log(`[+] Module: ${getModuleForAddress(this.returnAddress)}`);
                    console.log("[+] Stack trace:");
                    console.log(getStackTraceWithModules());
                }
            });
        } else {
            console.log(`[-] Function ${funcName} not found`);
        }
    });
}

// Hook BoringSSL functions (used in some Android apps and Chrome)
function hookBoringSSL() {
    console.log("[*] Hooking BoringSSL functions...");

    const boringFuncs = [
        "SSL_do_handshake",
        "SSL_connect",
        "SSL_CTX_new",
        "SSL_library_init"
    ];

    boringFuncs.forEach(funcName => {
        const func = Module.findExportByName(null, funcName);
        if (func) {
            console.log(`[+] Found ${funcName} at ${func}`);
            Interceptor.attach(func, {
                onEnter: function(args) {
                    console.log(`\n[+] Called ${funcName}`);
                    console.log(`[+] Module: ${getModuleForAddress(this.returnAddress)}`);
                    console.log("[+] Stack trace:");
                    console.log(getStackTraceWithModules());
                }
            });
        }
    });
}

// Hook GnuTLS functions
function hookGnuTLS() {
    console.log("[*] Hooking GnuTLS functions...");

    const gnuTlsFuncs = [
        "gnutls_handshake",
        "gnutls_init",
        "gnutls_credentials_set"
    ];

    gnuTlsFuncs.forEach(funcName => {
        const func = Module.findExportByName(null, funcName);
        if (func) {
            console.log(`[+] Found ${funcName} at ${func}`);
            Interceptor.attach(func, {
                onEnter: function(args) {
                    console.log(`\n[+] Called ${funcName}`);
                    console.log(`[+] Module: ${getModuleForAddress(this.returnAddress)}`);
                    console.log("[+] Stack trace:");
                    console.log(getStackTraceWithModules());
                }
            });
        }
    });
}

// Hook socket-related functions
function hookSocketFunctions() {
    console.log("[*] Hooking socket-related functions...");

    const socketFuncs = [
        "socket",
        "connect",
        "send",
        "recv",
        "SSL_write",
        "SSL_read"
    ];

    socketFuncs.forEach(funcName => {
        const func = Module.findExportByName(null, funcName);
        if (func) {
            console.log(`[+] Found ${funcName} at ${func}`);
            Interceptor.attach(func, {
                onEnter: function(args) {
                    // Only log for non-loopback connections to reduce noise
                    if (funcName === "connect") {
                        const sockAddr = args[1];
                        const sockAddrIn = sockAddr.add(2);
                        const port = Memory.readU16(sockAddrIn);
                        const ip = Memory.readU32(sockAddrIn.add(2));
                        // Skip if it's localhost (127.0.0.1)
                        if (ip === 0x0100007f) {
                            return;
                        }
                    }

                    console.log(`\n[+] Called ${funcName}`);
                    console.log(`[+] Module: ${getModuleForAddress(this.returnAddress)}`);
                    // Log additional details for specific functions
                    if (funcName === "SSL_write" || funcName === "SSL_read") {
                        console.log(`[+] SSL context: ${args[0]}`);
                        if (args[1] != null) {
                            try {
                                const data = Memory.readByteArray(args[1], args[2].toInt32() > 100 ? 100 : args[2].toInt32());
                                console.log(`[+] Data preview: ${hexdump(data, { length: 32 })}`);
                            } catch (e) {
                                console.log(`[!] Error reading data: ${e}`);
                            }
                        }
                    }

                    console.log("[+] Stack trace:");
                    console.log(getStackTraceWithModules());
                }
            });
        } else {
            console.log(`[-] Function ${funcName} not found`);
        }
    });
}

// Hook platform-specific libraries

// iOS/macOS Security framework
function hookAppleSecurity() {
    console.log("[*] Checking for Apple Security framework...");

    const securityFunctions = [
        "SSLHandshake",
        "SSLSetConnection",
        "SSLCreateContext",
        "SecureTransportProtocol"
    ];

    securityFunctions.forEach(funcName => {
        const func = Module.findExportByName("Security", funcName) ||
            Module.findExportByName("libSystem.B.dylib", funcName);
        if (func) {
            console.log(`[+] Found ${funcName} at ${func}`);
            Interceptor.attach(func, {
                onEnter: function(args) {
                    console.log(`\n[+] Called ${funcName}`);
                    console.log(`[+] Module: ${getModuleForAddress(this.returnAddress)}`);
                    console.log("[+] Stack trace:");
                    console.log(getStackTraceWithModules());
                }
            });
        }
    });
}

// Windows SChannel
function hookSChannel() {
    console.log("[*] Checking for Windows SChannel...");

    const schannelFuncs = [
        "InitializeSecurityContextW",
        "InitializeSecurityContextA",
        "AcquireCredentialsHandleW",
        "AcquireCredentialsHandleA",
        "AcceptSecurityContext"
    ];

    schannelFuncs.forEach(funcName => {
        const func = Module.findExportByName("secur32.dll", funcName) ||
            Module.findExportByName("security.dll", funcName);
        if (func) {
            console.log(`[+] Found ${funcName} at ${func}`);
            Interceptor.attach(func, {
                onEnter: function(args) {
                    console.log(`\n[+] Called ${funcName}`);
                    console.log(`[+] Module: ${getModuleForAddress(this.returnAddress)}`);
                    console.log("[+] Stack trace:");
                    console.log(getStackTraceWithModules());
                }
            });
        }
    });
}

// Custom function to log all loaded modules for reference
function listLoadedModules() {
    console.log("[*] Listing all loaded modules...");
    Process.enumerateModules()
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(module => {
            console.log(`[+] ${module.name}: ${module.base}-${module.base.add(module.size)} (Size: ${module.size})`);
        });
}

// Log information about SSL certificates (works with OpenSSL)
function hookCertificateVerification() {
    const x509Funcs = [
        "X509_verify_cert",
        "SSL_CTX_set_verify"
    ];

    x509Funcs.forEach(funcName => {
        const func = Module.findExportByName(null, funcName);
        if (func) {
            console.log(`[+] Found ${funcName} at ${func}`);
            Interceptor.attach(func, {
                onEnter: function(args) {
                    console.log(`\n[+] Called ${funcName} - Certificate verification`);
                    console.log(`[+] Module: ${getModuleForAddress(this.returnAddress)}`);
                    console.log("[+] Stack trace:");
                    console.log(getStackTraceWithModules());

                    if (funcName === "SSL_CTX_set_verify") {
                        console.log(`[+] Verify mode: ${args[1]}`);
                        console.log(`[+] Verify callback: ${args[2]}`);
                    }
                }
            });
        }
    });
}

// Main function to start hooking
function main() {
    console.log("[*] Starting SSL/TLS tracer...");

    // Platform detection (optional)
    const platform = Process.platform;
    console.log(`[*] Detected platform: ${platform}`);

    // List all loaded modules for reference
    listLoadedModules();

    // Hook SSL implementations
    hookOpenSSL();
    hookBoringSSL();
    hookGnuTLS();
    hookCertificateVerification();

    // Hook socket functions
    hookSocketFunctions();

    // Platform-specific hooks
    if (platform === "darwin" || platform === "ios") {
        hookAppleSecurity();
    } else if (platform === "windows") {
        hookSChannel();
    }

    console.log("[*] All hooks installed. Waiting for SSL/TLS operations...");
}

// Start the script
main();
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-596952088 @Akramelbahar/native-request-module-offset-finder-
