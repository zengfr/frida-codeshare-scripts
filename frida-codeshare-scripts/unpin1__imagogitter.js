
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:361087456 @imagogitter/unpin1
// Comprehensive SSL Unpinning & HTTP Traffic Capture Script for Frida
// This script handles various SSL implementations and socket communications

Java.perform(function() {
    console.log("[*] Comprehensive SSL unpinning script started");
    
    // Part 1: Android SSL Pinning Bypass
    bypassOkHttp();
    bypassTrustManager();
    bypassSSLContext();
    bypassHostnameVerifier();
    bypassWebViewSSL();
    bypassConscrypt();
    
    // Part 2: Socket Traffic Interception
    hookSocketFunctions();
    
    // ---------------------- SSL UNPINNING FUNCTIONS ----------------------
    
    function bypassOkHttp() {
        try {
            const CertificatePinner = Java.use('okhttp3.CertificatePinner');
            CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function() {
                console.log('[+] OkHttp CertificatePinner.check() bypassed');
                return;
            };
            
            CertificatePinner.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function() {
                console.log('[+] OkHttp CertificatePinner.check() [Certificate] bypassed');
                return;
            };
            
            // OkHttp3 newer versions
            const Builder = Java.use('okhttp3.CertificatePinner$Builder');
            Builder.add.overload('java.lang.String', 'java.util.List').implementation = function(str, list) {
                console.log('[+] OkHttp CertificatePinner$Builder.add() bypassed');
                return this;
            };
            
            console.log('[+] OkHttp pinning bypassed');
        } catch (err) {
            console.log('[-] OkHttp pinning not found');
        }
    }
    
    function bypassTrustManager() {
        try {
            const TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
            
            TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
                console.log('[+] TrustManagerImpl.verifyChain() bypassed');
                return untrustedChain;
            };
            
            const X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
            const SSLContext = Java.use('javax.net.ssl.SSLContext');
            
            // TrustManager bypass
            const TrustManager = Java.registerClass({
                name: 'dev.adb.TrustManager',
                implements: [X509TrustManager],
                methods: {
                    checkClientTrusted: function(chain, authType) {},
                    checkServerTrusted: function(chain, authType) {},
                    getAcceptedIssuers: function() { return []; }
                }
            });
            
            // Create a new TrustManager
            const TrustManagers = [TrustManager.$new()];
            const SSLContextInit = SSLContext.init.overload(
                '[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom'
            );
            
            // Override SSLContext.init method
            SSLContextInit.implementation = function(keyManager, trustManager, secureRandom) {
                console.log('[+] SSLContext.init() bypassed');
                SSLContextInit.call(this, keyManager, TrustManagers, secureRandom);
            };
            
            console.log('[+] TrustManager pinning bypassed');
        } catch (err) {
            console.log('[-] TrustManager pinning bypass failed: ' + err);
        }
    }
    
    function bypassSSLContext() {
        try {
            // Create empty TrustManager
            const TrustManager = Java.registerClass({
                name: 'dev.adb.EmptyTrustManager',
                implements: [Java.use('javax.net.ssl.X509TrustManager')],
                methods: {
                    checkClientTrusted: function(chain, authType) {},
                    checkServerTrusted: function(chain, authType) {},
                    getAcceptedIssuers: function() { return []; }
                }
            });
            
            const SSLContext = Java.use('javax.net.ssl.SSLContext');
            
            // Get the default instance
            const sslContext = SSLContext.getInstance('TLS');
            const TrustManagers = [TrustManager.$new()];
            
            // Initialize with empty TrustManager
            sslContext.init(null, TrustManagers, null);
            
            const HttpsURLConnection = Java.use('javax.net.ssl.HttpsURLConnection');
            HttpsURLConnection.setDefaultSSLSocketFactory.implementation = function(ssf) {
                console.log('[+] HttpsURLConnection.setDefaultSSLSocketFactory() bypassed');
                HttpsURLConnection.setDefaultSSLSocketFactory.call(this, sslContext.getSocketFactory());
            };
            
            console.log('[+] SSLContext pinning bypassed');
        } catch (err) {
            console.log('[-] SSLContext pinning bypass failed: ' + err);
        }
    }
    
    function bypassHostnameVerifier() {
        try {
            const HostnameVerifier = Java.use('javax.net.ssl.HostnameVerifier');
            const SSLSession = Java.use('javax.net.ssl.SSLSession');
            
            // Create a new HostnameVerifier that always returns true
            const AllowAllVerifier = Java.registerClass({
                name: 'dev.adb.AllowAllVerifier',
                implements: [HostnameVerifier],
                methods: {
                    verify: function(hostname, session) {
                        console.log('[+] Allowing connection to host: ' + hostname);
                        return true;
                    }
                }
            });
            
            const HttpsURLConnection = Java.use('javax.net.ssl.HttpsURLConnection');
            HttpsURLConnection.setDefaultHostnameVerifier.implementation = function(hostnameVerifier) {
                console.log('[+] HttpsURLConnection.setDefaultHostnameVerifier() bypassed');
                HttpsURLConnection.setDefaultHostnameVerifier.call(this, AllowAllVerifier.$new());
            };
            
            HttpsURLConnection.setHostnameVerifier.implementation = function(hostnameVerifier) {
                console.log('[+] HttpsURLConnection.setHostnameVerifier() bypassed');
                HttpsURLConnection.setHostnameVerifier.call(this, AllowAllVerifier.$new());
            };
            
            console.log('[+] HostnameVerifier bypassed');
        } catch (err) {
            console.log('[-] HostnameVerifier bypass failed: ' + err);
        }
    }
    
    function bypassWebViewSSL() {
        try {
            const WebView = Java.use('android.webkit.WebView');
            const SslErrorHandler = Java.use('android.webkit.SslErrorHandler');
            
            WebView.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(webView, handler, error) {
                console.log('[+] WebView.onReceivedSslError() bypassed');
                handler.proceed();
            };
            
            console.log('[+] WebView SSL errors bypassed');
        } catch (err) {
            console.log('[-] WebView SSL bypass failed: ' + err);
        }
    }
    
    function bypassConscrypt() {
        try {
            const Conscrypt = Java.use('com.android.org.conscrypt.ConscryptFileDescriptorSocket');
            Conscrypt.verifyCertificateChain.implementation = function(certChain, authMethod) {
                console.log('[+] Conscrypt verification bypassed');
            };
            
            console.log('[+] Conscrypt pinning bypassed');
        } catch (err) {
            console.log('[-] Conscrypt pinning not found');
        }
    }
    
    // ---------------------- SOCKET TRAFFIC INTERCEPTION ----------------------
    
    function hookSocketFunctions() {
        try {
            // Hook Java Socket Implementation
            const Socket = Java.use('java.net.Socket');
            
            // getOutputStream
            Socket.getOutputStream.implementation = function() {
                const socket = this;
                const host = socket.getInetAddress().getHostAddress();
                const port = socket.getPort();
                console.log(`[+] Socket connection: ${host}:${port}`);
                
                const originalOutputStream = this.getOutputStream();
                return wrapOutputStream(originalOutputStream, host, port);
            };
            
            // getInputStream
            Socket.getInputStream.implementation = function() {
                const socket = this;
                const host = socket.getInetAddress().getHostAddress();
                const port = socket.getPort();
                
                const originalInputStream = this.getInputStream();
                return wrapInputStream(originalInputStream, host, port);
            };
            
            // Also hook SSLSocket
            try {
                const SSLSocket = Java.use('javax.net.ssl.SSLSocket');
                
                SSLSocket.getInputStream.implementation = function() {
                    const socket = this;
                    const host = socket.getInetAddress().getHostAddress();
                    const port = socket.getPort();
                    console.log(`[+] SSL Socket connection: ${host}:${port}`);
                    
                    const originalInputStream = this.getInputStream();
                    return wrapInputStream(originalInputStream, host, port);
                };
                
                SSLSocket.getOutputStream.implementation = function() {
                    const socket = this;
                    const host = socket.getInetAddress().getHostAddress();
                    const port = socket.getPort();
                    
                    const originalOutputStream = this.getOutputStream();
                    return wrapOutputStream(originalOutputStream, host, port);
                };
                
                console.log('[+] SSLSocket hooks installed');
            } catch (err) {
                console.log('[-] Could not hook SSLSocket: ' + err);
            }
            
            console.log('[+] Socket hooks installed');
        } catch (err) {
            console.log('[-] Socket hooks failed: ' + err);
        }
    }
    
    function wrapOutputStream(originalOutputStream, host, port) {
        const OutputStream = Java.use('java.io.OutputStream');
        const JavaByteArray = Java.use('[B');
        
        // Create a proxy OutputStream that logs data
        const ProxyOutputStream = Java.registerClass({
            name: 'dev.adb.ProxyOutputStream',
            superClass: OutputStream,
            fields: {
                original: 'java.io.OutputStream',
                host: 'java.lang.String',
                port: 'int'
            },
            methods: {
                '<init>': [{
                    returnType: 'void',
                    argumentTypes: ['java.io.OutputStream', 'java.lang.String', 'int'],
                    implementation: function(original, host, port) {
                        this.original.value = original;
                        this.host.value = host;
                        this.port.value = port;
                    }
                }],
                write: [{
                    returnType: 'void',
                    argumentTypes: ['[B'],
                    implementation: function(data) {
                        logOutboundTraffic(this.host.value, this.port.value, data);
                        this.original.value.write(data);
                    }
                }, {
                    returnType: 'void',
                    argumentTypes: ['[B', 'int', 'int'],
                    implementation: function(data, offset, length) {
                        // Extract the relevant part of the byte array
                        const subArray = Java.array('byte', Arrays.copyOfRange(data, offset, offset + length));
                        logOutboundTraffic(this.host.value, this.port.value, subArray);
                        this.original.value.write(data, offset, length);
                    }
                }, {
                    returnType: 'void',
                    argumentTypes: ['int'],
                    implementation: function(byte) {
                        // Convert single byte to array for consistency in logging
                        const data = Java.array('byte', [byte]);
                        logOutboundTraffic(this.host.value, this.port.value, data);
                        this.original.value.write(byte);
                    }
                }],
                close: {
                    returnType: 'void',
                    implementation: function() {
                        this.original.value.close();
                    }
                },
                flush: {
                    returnType: 'void',
                    implementation: function() {
                        this.original.value.flush();
                    }
                }
            }
        });
        
        const Arrays = Java.use('java.util.Arrays');
        return ProxyOutputStream.$new(originalOutputStream, host, port);
    }
    
    function wrapInputStream(originalInputStream, host, port) {
        const InputStream = Java.use('java.io.InputStream');
        const JavaByteArray = Java.use('[B');
        
        // Create a proxy InputStream that logs data
        const ProxyInputStream = Java.registerClass({
            name: 'dev.adb.ProxyInputStream',
            superClass: InputStream,
            fields: {
                original: 'java.io.InputStream',
                host: 'java.lang.String',
                port: 'int'
            },
            methods: {
                '<init>': [{
                    returnType: 'void',
                    argumentTypes: ['java.io.InputStream', 'java.lang.String', 'int'],
                    implementation: function(original, host, port) {
                        this.original.value = original;
                        this.host.value = host;
                        this.port.value = port;
                    }
                }],
                read: [{
                    returnType: 'int',
                    argumentTypes: [],
                    implementation: function() {
                        const byte = this.original.value.read();
                        if (byte !== -1) {
                            // Convert to byte array for consistency in logging
                            const data = Java.array('byte', [byte]);
                            logInboundTraffic(this.host.value, this.port.value, data);
                        }
                        return byte;
                    }
                }, {
                    returnType: 'int',
                    argumentTypes: ['[B'],
                    implementation: function(data) {
                        const bytesRead = this.original.value.read(data);
                        if (bytesRead > 0) {
                            // Extract the actually read bytes
                            const Arrays = Java.use('java.util.Arrays');
                            const actualData = Arrays.copyOf(data, bytesRead);
                            logInboundTraffic(this.host.value, this.port.value, actualData);
                        }
                        return bytesRead;
                    }
                }, {
                    returnType: 'int',
                    argumentTypes: ['[B', 'int', 'int'],
                    implementation: function(data, offset, length) {
                        const bytesRead = this.original.value.read(data, offset, length);
                        if (bytesRead > 0) {
                            // Extract the actually read bytes
                            const Arrays = Java.use('java.util.Arrays');
                            const actualData = Arrays.copyOfRange(data, offset, offset + bytesRead);
                            logInboundTraffic(this.host.value, this.port.value, actualData);
                        }
                        return bytesRead;
                    }
                }],
                close: {
                    returnType: 'void',
                    implementation: function() {
                        this.original.value.close();
                    }
                },
                available: {
                    returnType: 'int',
                    implementation: function() {
                        return this.original.value.available();
                    }
                }
            }
        });
        
        const Arrays = Java.use('java.util.Arrays');
        return ProxyInputStream.$new(originalInputStream, host, port);
    }
    
    // ---------------------- LOGGING FUNCTIONS ----------------------
    
    function logOutboundTraffic(host, port, data) {
        try {
            const buffer = Java.array('byte', data);
            const dataString = bytesToString(buffer);
            console.log(`\n[→] Outbound to ${host}:${port}:\n${dataString}\n`);
            
            // Try to detect and format HTTP/HTTPS traffic
            if (isHttpTraffic(dataString)) {
                console.log("[HTTP Request Detected]");
                formatHttpTraffic(dataString, "→");
            }
        } catch (err) {
            console.log(`[-] Error logging outbound traffic: ${err}`);
        }
    }
    
    function logInboundTraffic(host, port, data) {
        try {
            const buffer = Java.array('byte', data);
            const dataString = bytesToString(buffer);
            console.log(`\n[←] Inbound from ${host}:${port}:\n${dataString}\n`);
            
            // Try to detect and format HTTP/HTTPS traffic
            if (isHttpTraffic(dataString)) {
                console.log("[HTTP Response Detected]");
                formatHttpTraffic(dataString, "←");
            }
        } catch (err) {
            console.log(`[-] Error logging inbound traffic: ${err}`);
        }
    }
    
    function bytesToString(bytes) {
        try {
            // Try to decode as UTF-8 first
            const String = Java.use('java.lang.String');
            return String.$new(bytes, 'UTF-8');
        } catch (err) {
            // Fall back to hex representation for binary data
            const hexBytes = [];
            for (let i = 0; i < bytes.length; i++) {
                const byte = bytes[i] & 0xff;
                if (byte >= 32 && byte <= 126) { // printable ASCII
                    hexBytes.push(String.fromCharCode(byte));
                } else {
                    hexBytes.push(`\\x${byte.toString(16).padStart(2, '0')}`);
                }
            }
            return hexBytes.join('');
        }
    }
    
    function isHttpTraffic(data) {
        // Simple check for HTTP headers pattern
        return /^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH|CONNECT|TRACE)\s|HTTP\/[0-9.]+\s[0-9]+\s/.test(data);
    }
    
    function formatHttpTraffic(data, direction) {
        try {
            const lines = data.split('\n');
            let formattedOutput = '';
            
            if (direction === "→") { // Request
                // Extract method, path, and HTTP version
                const requestLine = lines[0].trim();
                console.log(`HTTP Request: ${requestLine}`);
                
                // Extract headers
                let i = 1;
                console.log("\nHeaders:");
                while (i < lines.length && lines[i].trim() !== '') {
                    console.log(`  ${lines[i].trim()}`);
                    i++;
                }
                
                // Extract body if present
                if (i < lines.length - 1) {
                    console.log("\nBody:");
                    console.log(lines.slice(i + 1).join('\n'));
                }
            } else { // Response
                // Extract status line
                const statusLine = lines[0].trim();
                console.log(`HTTP Response: ${statusLine}`);
                
                // Extract headers
                let i = 1;
                console.log("\nHeaders:");
                while (i < lines.length && lines[i].trim() !== '') {
                    console.log(`  ${lines[i].trim()}`);
                    i++;
                }
                
                // Extract body if present
                if (i < lines.length - 1) {
                    console.log("\nBody:");
                    console.log(lines.slice(i + 1).join('\n'));
                    
                    // Try to detect and format JSON
                    try {
                        const bodyContent = lines.slice(i + 1).join('\n');
                        if (bodyContent.trim().startsWith('{') || bodyContent.trim().startsWith('[')) {
                            const jsonObj = JSON.parse(bodyContent);
                            console.log("\nFormatted JSON:");
                            console.log(JSON.stringify(jsonObj, null, 2));
                        }
                    } catch (e) {
                        // Not valid JSON, ignore
                    }
                }
            }
        } catch (err) {
            console.log(`[-] Error formatting HTTP traffic: ${err}`);
        }
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:361087456 @imagogitter/unpin1
