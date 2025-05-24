
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1649534191 @fdciabdul/frida-tracer
Java.perform(function() {
    var ByteString = Java.use("com.android.okhttp.okio.ByteString");
    var Buffer = Java.use("com.android.okhttp.okio.Buffer");
    var Interceptor = Java.use("com.android.okhttp.Interceptor");
    var String = Java.use("java.lang.String");
    var DatagramPacket = Java.use("java.net.DatagramPacket");
    var DatagramSocket = Java.use("java.net.DatagramSocket");
    
    var HttpInterceptor = Java.registerClass({
        name: "com.custom.HttpInterceptor",
        implements: [Interceptor],
        methods: {
            intercept: function(chain) {
                var request = chain.request();
                var requestBody = request.body();
                var reqMethod = request.method();
                var reqUrl = request.url().toString();
                
                if (reqMethod === "POST") {
                    console.log("[+] HTTP POST Request detected: " + reqUrl);
                    
                    if (requestBody) {
                        var buffer = Buffer.$new();
                        requestBody.writeTo(buffer);
                        var requestBytes = buffer.readByteArray();
                        var requestContent = String.$new(requestBytes);
                        console.log("[+] POST Request Body: " + requestContent);
                    }
                    
                    var response = chain.proceed(request);
                    var responseBody = response.body();
                    
                    if (responseBody) {
                        var source = responseBody.source();
                        source.request(Long.MAX_VALUE);
                        var respBuffer = source.buffer();
                        var responseContent = respBuffer.clone().readString();
                        console.log("[+] POST Response Body: " + responseContent);
                    }
                    
                    return response;
                }
                
                return chain.proceed(request);
            }
        }
    });
    
    var OkHttpClient = Java.use("com.android.okhttp.OkHttpClient");
    OkHttpClient.interceptors.overload().implementation = function() {
        var interceptors = this.interceptors();
        interceptors.add(HttpInterceptor.$new());
        return interceptors;
    };
    
    DatagramSocket.send.overload('java.net.DatagramPacket').implementation = function(packet) {
        try {
            var data = Java.array('byte', packet.getData());
            var offset = packet.getOffset();
            var length = packet.getLength();
            var address = packet.getAddress().getHostAddress();
            var port = packet.getPort();
            
            var dataStr = ByteString.of(data, offset, length).utf8();
            console.log("[+] UDP Outgoing Packet");
            console.log("    Destination: " + address + ":" + port);
            console.log("    Data: " + dataStr);
        } catch (e) {
            console.log("Error tracing UDP send: " + e);
        }
        
        return this.send(packet);
    };
    
    DatagramSocket.receive.overload('java.net.DatagramPacket').implementation = function(packet) {
        this.receive(packet);
        
        try {
            var data = Java.array('byte', packet.getData());
            var offset = packet.getOffset();
            var length = packet.getLength();
            var address = packet.getAddress().getHostAddress();
            var port = packet.getPort();
            
            var dataStr = ByteString.of(data, offset, length).utf8();
            console.log("[+] UDP Incoming Packet");
            console.log("    Source: " + address + ":" + port);
            console.log("    Data: " + dataStr);
        } catch (e) {
            console.log("Error tracing UDP receive: " + e);
        }
    };
    
    var OutputStream = Java.use("java.io.OutputStream");
    
    OutputStream.write.overload('[B', 'int', 'int').implementation = function(data, offset, length) {
        var conn = this.getClass().toString();
        
        try {
            var parent = Java.cast(this, Java.use("java.io.FilterOutputStream")).out.value;
            if (parent) {
                conn = parent.getClass().toString();
                if (conn.includes("HttpURLConnection")) {
                    var dataStr = ByteString.of(data, offset, length).utf8();
                    console.log("[+] HTTP Connection Write detected");
                    console.log("    Data: " + dataStr);
                }
            }
        } catch (e) {}
        
        return this.write(data, offset, length);
    };
    
    console.log("[+] Setting up SSL pinning bypasses");
    
    try {
        var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
        var SSLContext = Java.use('javax.net.ssl.SSLContext');
        
        var TrustManager = Java.registerClass({
            name: 'com.custom.TrustManager',
            implements: [X509TrustManager],
            methods: {
                checkClientTrusted: function(chain, authType) {},
                checkServerTrusted: function(chain, authType) {},
                getAcceptedIssuers: function() {
                    return [];
                }
            }
        });
        
        var TrustManagers = [TrustManager.$new()];
        var SSLContext_init = SSLContext.init.overload(
            '[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom'
        );
        
        SSLContext_init.implementation = function(keyManager, trustManager, secureRandom) {
            console.log('[+] Bypassing SSL pinning via SSLContext');
            SSLContext_init.call(this, keyManager, TrustManagers, secureRandom);
        };
        
        console.log('[+] SSLContext SSL pinning bypass installed');
    } catch (e) {
        console.log("[-] SSLContext hook failed: " + e);
    }
    
    try {
        var CertificatePinner = Java.use('okhttp3.CertificatePinner');
        CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function() {
            console.log('[+] OkHttp 3.x CertificatePinner check bypassed');
            return;
        };
        console.log('[+] OkHttp 3.x CertificatePinner bypass installed');
    } catch (e) {
        console.log("[-] OkHttp 3.x CertificatePinner hook failed: " + e);
    }
    
    try {
        var OkHttpClient = Java.use("okhttp3.OkHttpClient");
        OkHttpClient.$init.overload('okhttp3.OkHttpClient$Builder').implementation = function(builder) {
            console.log("[+] OkHttp 3.x init intercepted");
            builder.certificatePinner.value = CertificatePinner.DEFAULT.value;
            return this.$init(builder);
        };
        console.log('[+] OkHttp 3.x Builder certificatePinner bypass installed');
    } catch (e) {
        console.log("[-] OkHttp 3.x Builder hook failed: " + e);
    }
    
    try {
        var InputStreamClass = Java.use("java.io.InputStream");
        var readMethod = InputStreamClass.read.overload('[B', 'int', 'int');
        
        readMethod.implementation = function(buffer, offset, length) {
            var result = readMethod.call(this, buffer, offset, length);
            if (result > 0) {
                try {
                    var parent = this.getClass().toString();
                    if (parent.includes("HttpInputStream") || parent.includes("ChunkedInputStream")) {
                        var data = Java.array('byte', buffer);
                        var responseData = ByteString.of(data, offset, result).utf8();
                        console.log("[+] HTTP Response read detected");
                        console.log("    Data: " + responseData);
                    }
                } catch (e) {}
            }
            return result;
        };
        
        console.log('[+] InputStream.read hook installed for response capture');
    } catch (e) {
        console.log("[-] InputStream hook failed: " + e);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1649534191 @fdciabdul/frida-tracer
