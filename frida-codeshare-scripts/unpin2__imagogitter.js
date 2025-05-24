
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:478424169 @imagogitter/unpin2
// Comprehensive SSL Unpinning & Complete HTTP Traffic Capture Script
// Captures all URLs, headers, and body content for requests and responses

Java.perform(function() {
    console.log("[*] Enhanced SSL unpinning and traffic capture script started");
    
    // Storage for ongoing connections
    const connections = new Map();
    let connectionCounter = 0;
    
    // Part 1: Android SSL Pinning Bypass
    bypassOkHttp();
    bypassTrustManager();
    bypassSSLContext();
    bypassHostnameVerifier();
    bypassWebViewSSL();
    bypassConscrypt();
    
    // Part 2: Enhanced HTTP Interception
    hookHttpURLConnection();
    hookOkHttp();
    hookVolley();
    hookRetrofit();
    
    // Part 3: Socket Traffic Interception
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
    
    // ---------------------- HTTP LIBRARY INTERCEPTION ----------------------
    
    function hookHttpURLConnection() {
        try {
            // Hook HttpURLConnection
            const URL = Java.use('java.net.URL');
            URL.openConnection.overload().implementation = function() {
                const url = this.toString();
                const conn = this.openConnection();
                
                // Create a unique connection ID
                const connId = connectionCounter++;
                console.log(`[+] HttpURLConnection [${connId}] Opening connection to: ${url}`);
                
                // Store connection info
                connections.set(connId, {
                    url: url,
                    method: "GET", // Default
                    requestHeaders: {},
                    requestBody: null,
                    responseCode: null,
                    responseHeaders: {},
                    responseBody: null
                });
                
                // Attach connection ID to the connection object
                if (conn.getClass().getName().includes('HttpURLConnection')) {
                    hookHttpMethods(conn, connId);
                }
                
                return conn;
            };
            
            console.log('[+] HttpURLConnection hooks installed');
        } catch (err) {
            console.log('[-] HttpURLConnection hooks failed: ' + err);
        }
    }
    
    function hookHttpMethods(conn, connId) {
        try {
            // Get the original methods to hook
            const HttpURLConnection = Java.use('java.net.HttpURLConnection');
            
            // Set request method
            const setRequestMethod = HttpURLConnection.setRequestMethod;
            conn.setRequestMethod.overload('java.lang.String').implementation = function(method) {
                if (connections.has(connId)) {
                    connections.get(connId).method = method;
                    console.log(`[+] HttpURLConnection [${connId}] Set method: ${method}`);
                }
                return setRequestMethod.call(this, method);
            };
            
            // Set request property (header)
            const setRequestProperty = HttpURLConnection.setRequestProperty;
            conn.setRequestProperty.overload('java.lang.String', 'java.lang.String').implementation = function(key, value) {
                if (connections.has(connId)) {
                    connections.get(connId).requestHeaders[key] = value;
                    console.log(`[+] HttpURLConnection [${connId}] Set header: ${key}: ${value}`);
                }
                return setRequestProperty.call(this, key, value);
            };
            
            // Get output stream (for request body)
            const getOutputStream = HttpURLConnection.getOutputStream;
            conn.getOutputStream.overload().implementation = function() {
                const outputStream = getOutputStream.call(this);
                console.log(`[+] HttpURLConnection [${connId}] Getting output stream for writing request body`);
                
                // Wrap the output stream to capture request body
                return new ProxyOutputStream(outputStream, connId);
            };
            
            // Get input stream (for response body)
            const getInputStream = HttpURLConnection.getInputStream;
            conn.getInputStream.overload().implementation = function() {
                try {
                    const inputStream = getInputStream.call(this);
                    console.log(`[+] HttpURLConnection [${connId}] Getting input stream for reading response body`);
                    
                    // Capture response code and headers before reading body
                    captureHttpResponseInfo(this, connId);
                    
                    // Wrap the input stream to capture response body
                    return new ProxyInputStream(inputStream, connId);
                } catch (e) {
                    console.log(`[-] HttpURLConnection [${connId}] Error getting input stream: ${e}`);
                    throw e;
                }
            };
            
            // Connect method
            const connect = HttpURLConnection.connect;
            conn.connect.overload().implementation = function() {
                console.log(`[+] HttpURLConnection [${connId}] Connecting`);
                return connect.call(this);
            };
            
            // Get response code
            const getResponseCode = HttpURLConnection.getResponseCode;
            conn.getResponseCode.overload().implementation = function() {
                const responseCode = getResponseCode.call(this);
                if (connections.has(connId)) {
                    connections.get(connId).responseCode = responseCode;
                    console.log(`[+] HttpURLConnection [${connId}] Response code: ${responseCode}`);
                    
                    // Capture response headers
                    captureHttpResponseInfo(this, connId);
                }
                return responseCode;
            };
            
        } catch (err) {
            console.log(`[-] Error hooking HttpURLConnection methods: ${err}`);
        }
    }
    
    function captureHttpResponseInfo(connection, connId) {
        if (!connections.has(connId)) return;
        
        try {
            const connInfo = connections.get(connId);
            
            // Capture response code if not already captured
            if (connInfo.responseCode === null) {
                connInfo.responseCode = connection.getResponseCode();
            }
            
            // Capture all response headers
            const headerFields = connection.getHeaderFields();
            if (headerFields !== null) {
                const keys = headerFields.keySet().toArray();
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    if (key !== null) {
                        const value = headerFields.get(key).toString();
                        connInfo.responseHeaders[key] = value;
                    }
                }
            }
            
            // Print formatted response info
            console.log(`\n[←] HTTP Response [${connId}]`);
            console.log(`URL: ${connInfo.url}`);
            console.log(`Status: ${connInfo.responseCode}`);
            console.log("Headers:");
            for (const [key, value] of Object.entries(connInfo.responseHeaders)) {
                console.log(`  ${key}: ${value}`);
            }
        } catch (e) {
            console.log(`[-] Error capturing response info: ${e}`);
        }
    }
    
    // Proxy streams for HttpURLConnection
    const ProxyOutputStream = Java.registerClass({
        name: 'dev.adb.ProxyOutputStream',
        superClass: Java.use('java.io.OutputStream'),
        fields: {
            original: 'java.io.OutputStream',
            connId: 'int',
            buffer: '[B'
        },
        methods: {
            '<init>': [{
                returnType: 'void',
                argumentTypes: ['java.io.OutputStream', 'int'],
                implementation: function(original, connId) {
                    this.original.value = original;
                    this.connId.value = connId;
                    
                    // Create an initial buffer
                    const ByteArrayOutputStream = Java.use('java.io.ByteArrayOutputStream');
                    this.buffer.value = ByteArrayOutputStream.$new().toByteArray();
                }
            }],
            write: [{
                returnType: 'void',
                argumentTypes: ['int'],
                implementation: function(byte) {
                    this.original.value.write(byte);
                    
                    // Append to buffer
                    const Array = Java.use('[B');
                    const newBuffer = Array.newArray(this.buffer.value.length + 1);
                    Java.array('byte', this.buffer.value).forEach((b, i) => {
                        newBuffer[i] = b;
                    });
                    newBuffer[this.buffer.value.length] = byte;
                    this.buffer.value = newBuffer;
                }
            }, {
                returnType: 'void',
                argumentTypes: ['[B'],
                implementation: function(bytes) {
                    this.original.value.write(bytes);
                    
                    // Append to buffer
                    const Array = Java.use('[B');
                    const newBuffer = Array.newArray(this.buffer.value.length + bytes.length);
                    Java.array('byte', this.buffer.value).forEach((b, i) => {
                        newBuffer[i] = b;
                    });
                    Java.array('byte', bytes).forEach((b, i) => {
                        newBuffer[this.buffer.value.length + i] = b;
                    });
                    this.buffer.value = newBuffer;
                }
            }, {
                returnType: 'void',
                argumentTypes: ['[B', 'int', 'int'],
                implementation: function(bytes, off, len) {
                    this.original.value.write(bytes, off, len);
                    
                    // Append to buffer
                    const Array = Java.use('[B');
                    const newBuffer = Array.newArray(this.buffer.value.length + len);
                    Java.array('byte', this.buffer.value).forEach((b, i) => {
                        newBuffer[i] = b;
                    });
                    for (let i = 0; i < len; i++) {
                        newBuffer[this.buffer.value.length + i] = bytes[off + i];
                    }
                    this.buffer.value = newBuffer;
                }
            }],
            close: {
                returnType: 'void',
                implementation: function() {
                    // When closing, log the complete request body
                    if (connections.has(this.connId.value)) {
                        const connInfo = connections.get(this.connId.value);
                        
                        // Convert buffer to string
                        const String = Java.use('java.lang.String');
                        try {
                            connInfo.requestBody = String.$new(this.buffer.value, "UTF-8").toString();
                        } catch (e) {
                            // If not a valid UTF-8 string, use Base64
                            const Base64 = Java.use('android.util.Base64');
                            connInfo.requestBody = "[Binary data, Base64 encoded] " + 
                                Base64.encodeToString(this.buffer.value, Base64.DEFAULT);
                        }
                        
                        // Print formatted request info
                        console.log(`\n[→] HTTP Request [${this.connId.value}]`);
                        console.log(`URL: ${connInfo.url}`);
                        console.log(`Method: ${connInfo.method}`);
                        console.log("Headers:");
                        for (const [key, value] of Object.entries(connInfo.requestHeaders)) {
                            console.log(`  ${key}: ${value}`);
                        }
                        console.log("Body:");
                        console.log(connInfo.requestBody);
                    }
                    
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
    
    const ProxyInputStream = Java.registerClass({
        name: 'dev.adb.ProxyInputStream',
        superClass: Java.use('java.io.InputStream'),
        fields: {
            original: 'java.io.InputStream',
            connId: 'int',
            buffer: '[B',
            hasReadData: 'boolean'
        },
        methods: {
            '<init>': [{
                returnType: 'void',
                argumentTypes: ['java.io.InputStream', 'int'],
                implementation: function(original, connId) {
                    this.original.value = original;
                    this.connId.value = connId;
                    
                    // Create an initial buffer
                    const ByteArrayOutputStream = Java.use('java.io.ByteArrayOutputStream');
                    this.buffer.value = ByteArrayOutputStream.$new().toByteArray();
                    this.hasReadData.value = false;
                }
            }],
            read: [{
                returnType: 'int',
                implementation: function() {
                    const byte = this.original.value.read();
                    if (byte !== -1) {
                        // Append to buffer
                        const Array = Java.use('[B');
                        const newBuffer = Array.newArray(this.buffer.value.length + 1);
                        Java.array('byte', this.buffer.value).forEach((b, i) => {
                            newBuffer[i] = b;
                        });
                        newBuffer[this.buffer.value.length] = byte;
                        this.buffer.value = newBuffer;
                        this.hasReadData.value = true;
                    } else if (this.hasReadData.value) {
                        // End of stream, log response body
                        this.logResponseBody();
                    }
                    return byte;
                }
            }, {
                returnType: 'int',
                argumentTypes: ['[B'],
                implementation: function(bytes) {
                    const read = this.original.value.read(bytes);
                    if (read > 0) {
                        // Append to buffer
                        const Array = Java.use('[B');
                        const newBuffer = Array.newArray(this.buffer.value.length + read);
                        Java.array('byte', this.buffer.value).forEach((b, i) => {
                            newBuffer[i] = b;
                        });
                        for (let i = 0; i < read; i++) {
                            newBuffer[this.buffer.value.length + i] = bytes[i];
                        }
                        this.buffer.value = newBuffer;
                        this.hasReadData.value = true;
                    } else if (read === -1 && this.hasReadData.value) {
                        // End of stream, log response body
                        this.logResponseBody();
                    }
                    return read;
                }
            }, {
                returnType: 'int',
                argumentTypes: ['[B', 'int', 'int'],
                implementation: function(bytes, off, len) {
                    const read = this.original.value.read(bytes, off, len);
                    if (read > 0) {
                        // Append to buffer
                        const Array = Java.use('[B');
                        const newBuffer = Array.newArray(this.buffer.value.length + read);
                        Java.array('byte', this.buffer.value).forEach((b, i) => {
                            newBuffer[i] = b;
                        });
                        for (let i = 0; i < read; i++) {
                            newBuffer[this.buffer.value.length + i] = bytes[off + i];
                        }
                        this.buffer.value = newBuffer;
                        this.hasReadData.value = true;
                    } else if (read === -1 && this.hasReadData.value) {
                        // End of stream, log response body
                        this.logResponseBody();
                    }
                    return read;
                }
            }],
            close: {
                returnType: 'void',
                implementation: function() {
                    // Make sure to log the response body if not already done
                    if (this.hasReadData.value) {
                        this.logResponseBody();
                    }
                    this.original.value.close();
                }
            },
            available: {
                returnType: 'int',
                implementation: function() {
                    return this.original.value.available();
                }
            },
            logResponseBody: {
                returnType: 'void',
                implementation: function() {
                    if (connections.has(this.connId.value) && this.hasReadData.value) {
                        const connInfo = connections.get(this.connId.value);
                        
                        // Avoid logging twice
                        if (connInfo.responseBody !== null) return;
                        
                        // Convert buffer to string
                        const String = Java.use('java.lang.String');
                        try {
                            connInfo.responseBody = String.$new(this.buffer.value, "UTF-8").toString();
                        } catch (e) {
                            // If not a valid UTF-8 string, use Base64
                            const Base64 = Java.use('android.util.Base64');
                            connInfo.responseBody = "[Binary data, Base64 encoded] " + 
                                Base64.encodeToString(this.buffer.value, Base64.DEFAULT);
                        }
                        
                        // Add response body to the already logged response info
                        console.log("Response Body:");
                        console.log(connInfo.responseBody);
                        
                        // Try to format JSON
                        if (connInfo.responseBody.trim().startsWith('{') || connInfo.responseBody.trim().startsWith('[')) {
                            try {
                                const JSON = Java.use('org.json.JSONObject');
                                let formatted;
                                if (connInfo.responseBody.trim().startsWith('{')) {
                                    formatted = JSON.$new(connInfo.responseBody).toString(2);
                                } else {
                                    const JSONArray = Java.use('org.json.JSONArray');
                                    formatted = JSONArray.$new(connInfo.responseBody).toString(2);
                                }
                                console.log("\nFormatted JSON:");
                                console.log(formatted);
                            } catch (e) {
                                // Not valid JSON, ignore
                            }
                        }
                        
                        this.hasReadData.value = false;
                    }
                }
            }
        }
    });
    
    function hookOkHttp() {
        try {
            // Try to find OkHttp's RealCall class
            const RealCall = Java.use('okhttp3.RealCall');
            
            // Hook the execute method to capture synchronous requests
            RealCall.execute.implementation = function() {
                const call = this;
                const request = call.request();
                const connId = connectionCounter++;
                
                // Log request details
                logOkHttpRequest(request, connId);
                
                // Execute the original call
                const response = this.execute();
                
                // Log response details
                logOkHttpResponse(response, connId);
                
                return response;
            };
            
            // Hook the enqueue method to capture asynchronous requests
            const Callback = Java.use('okhttp3.Callback');
            RealCall.enqueue.implementation = function(callback) {
                const call = this;
                const request = call.request();
                const connId = connectionCounter++;
                
                // Log request details
                logOkHttpRequest(request, connId);
                
                // Create a callback wrapper to intercept the response
                const proxyCallback = Java.registerClass({
                    name: 'dev.adb.ProxyCallback',
                    implements: [Callback],
                    fields: {
                        original: 'okhttp3.Callback',
                        connId: 'int'
                    },
                    methods: {
                        '<init>': [{
                            returnType: 'void',
                            argumentTypes: ['okhttp3.Callback', 'int'],
                            implementation: function(original, connId) {
                                this.original.value = original;
                                this.connId.value = connId;
                            }
                        }],
                        onFailure: {
                            returnType: 'void',
                            argumentTypes: ['okhttp3.Call', 'java.io.IOException'],
                            implementation: function(call, e) {
                                console.log(`[!] OkHttp Request [${this.connId.value}] failed: ${e}`);
                                this.original.value.onFailure(call, e);
                            }
                        },
                        onResponse: {
                            returnType: 'void',
                            argumentTypes: ['okhttp3.Call', 'okhttp3.Response'],
                            implementation: function(call, response) {
                                // Log response details
                                logOkHttpResponse(response, this.connId.value);
                                
                                // Pass to original callback
                                this.original.value.onResponse(call, response);
                            }
                        }
                    }
                });
                
                // Call the original enqueue with our proxy callback
                this.enqueue(proxyCallback.$new(callback, connId));
            };
            
            console.log('[+] OkHttp hooks installed');
        } catch (err) {
            console.log('[-] OkHttp hooks failed: ' + err);
        }
    }
    
    function logOkHttpRequest(request, connId) {
        try {
            // Extract request details
            const url = request.url().toString();
            const method = request.method();
            const headers = request.headers();
            const body = request.body();
            
            // Create connection info
            connections.set(connId, {
                url: url,
                method: method,
                requestHeaders: {},
                requestBody: null,
                responseCode: null,
                responseHeaders: {},
                responseBody: null
            });
            
            // Extract headers
            const headerCount = headers.size();
            const connInfo = connections.get(connId);
            for (let i = 0; i < headerCount; i++) {
                const name = headers.name(i);
                const value = headers.value(i);
                connInfo.requestHeaders[name] = value;
            }
            
            // Print formatted request info
            console.log(`\n[→] OkHttp Request [${connId}]`);
            console.log(`URL: ${url}`);
            console.log(`Method: ${method}`);
            console.log("Headers:");
            for (const [key, value] of Object.entries(connInfo.requestHeaders)) {
                console.log(`  ${key}: ${value}`);
            }
            
            // Try to extract body content if available
            if (body) {
                try {
                    const Buffer = Java.use('okio.Buffer');
                    const buffer = Buffer.$new();
                    body.writeTo(buffer);
                    connInfo.requestBody = buffer.readUtf8();
                    console.log("Body:");
                    console.log(connInfo.requestBody);
                } catch (e) {
                    console.log("Body: [Failed to extract body: " + e + "]");
                }
            } else {
                console.log("Body: [No body]");
            }
        } catch (e) {
            console.log(`[-] Error logging OkHttp request: ${e}`);
        }
    }
    
    function logOkHttpResponse(response, connId) {
        try {
            if (!connections.has(connId)) return;
            
            const connInfo = connections.get(connId);
            connInfo.responseCode = response.code();
            
            // Extract headers
            const headers = response.headers();
            const headerCount = headers.size();
            for (let i = 0; i < headerCount; i++) {
                const name = headers.name(i);
                const value = headers.value(i);
                connInfo.responseHeaders[name] = value;
            }
            
            // Print formatted response info
            console.log(`\n[←] OkHttp Response [${connId}]`);
            console.log(`URL: ${connInfo.url}`);
            console.log(`Status: ${connInfo.responseCode}`);
            console.log("Headers:");
            for (const [key, value] of Object.entries(connInfo.responseHeaders)) {
                console.log(`  ${key}: ${value}`);
            }
            
            // Try to extract response body
            try {
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:478424169 @imagogitter/unpin2
