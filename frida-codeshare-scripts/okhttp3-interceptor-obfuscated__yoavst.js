
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:580399815 @yoavst/okhttp3-interceptor-obfuscated
var SHOULD_PRINT_RAW = true

function getMethodByName(cls, name) {
    for (var method of cls.getDeclaredMethods()) {
        if (method.getName() == name)
            return method;
    }
    return null;
}

function hex(arr) {
    var buffer = Java.array('byte', arr);
    var result = "";
    if (SHOULD_PRINT_RAW) {
        for (var i = 0; i < buffer.length; ++i) {
            result += (String.fromCharCode(buffer[i] & 0xff));
        }
    } else {
        for (var i = 0; i < buffer.length; ++i) {
            result += "" + (buffer[i] & 0xff);
        }
    }
    return result
}

function hook_okhttp3() {
    Java.perform(function() {
        var JavaByteArray = Java.use('[B').class


        var BufferCls = getMethodByName(Java.use('okhttp3.internal.http2.Http2Stream$FramingSource').class, "read").getParameterTypes()[0]
        var Buffer = Java.use(getMethodByName(Java.use('okhttp3.internal.http2.Http2Stream$FramingSource').class, "read").getParameterTypes()[0].getName())
        var BufferGetByteArray = null
        for (var method of BufferCls.getDeclaredMethods()) {
            if (method.getReturnType().equals(JavaByteArray) && method.getParameterTypes().length == 0) {
                BufferGetByteArray = method
                break
            }
        }



        var ByteString = Java.use(getMethodByName(Java.use('okhttp3.CertificatePinner').class, "sha1").getReturnType().getName())


        var Interceptor = Java.use("okhttp3.Interceptor");
        var MyInterceptor = Java.registerClass({
            name: "okhttp3.MyInterceptor",
            implements: [Interceptor],
            methods: {
                intercept: function(chain) {
                    var request = chain.request();
                    try {
                        console.log("MyInterceptor.intercept onEnter:", request, "\nrequest headers:\n", request.headers());
                        var requestBody = request.body();
                        var contentLength = 0
                        if (requestBody != null) {
                            contentLength = requestBody.contentLength();
                        }
                        console.log("Content length is", contentLength)

                        if (contentLength > 0) {
                            var BufferObj = Buffer.$new();
                            requestBody.writeTo(BufferObj);
                            try {
                                console.log("\nrequest body String:\n", BufferObj.readString(), "\n");
                            } catch (error) {
                                try {
                                    console.log("\nrequest body ByteString:\n", ByteString.of(BufferObj.readByteArray()).hex(), "\n");
                                } catch (error) {
                                    try {
                                        console.log("\nrequest body String:\n", hex(BufferGetByteArray.invoke(BufferObj, [])), "\n");
                                    } catch (error) {
                                        console.log("error 1:", error, BufferObj);
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        console.log("error 2:", error);
                    }
                    var response = chain.proceed(request);
                    try {
                        console.log("MyInterceptor.intercept onLeave:", response, "\nresponse headers:\n", response.headers());
                        var responseBody = response.body();
                        var contentLength = responseBody ? responseBody.contentLength() : 0;
                        if (contentLength > 0) {
                            console.log("\nresponse contentLength:", contentLength, "responseBody:", responseBody, "\n");
                            var ContentType = response.headers().get("Content-Type");
                            console.log("ContentType:", ContentType);
                            if (ContentType.indexOf("video") == -1) {
                                if (ContentType.indexOf("application") == 0) {
                                    var source = responseBody.source();
                                    if (ContentType.indexOf("application/zip") != 0) {
                                        try {
                                            console.log("\nresponse.body StringClass\n", source.readUtf8(), "\n");
                                        } catch (error) {
                                            try {
                                                console.log("\nresponse.body ByteString\n", source.readByteString().hex(), "\n");
                                            } catch (error) {
                                                source = Java.cast(source, Java.use('java.lang.Object'))
                                                var success = false
                                                for (var method of source.getClass().getDeclaredMethods()) {
                                                    if (method.getReturnType().equals(JavaByteArray) && method.getParameterTypes().length == 0) {
                                                        console.log("\nresponse.body ByteString\n", hex(method.invoke(source, [])), "\n");
                                                        success = true
                                                        break
                                                    }
                                                }
                                                if (!success)
                                                    console.log("error 4:", error);
                                            }
                                        }
                                    }
                                }

                            }

                        }

                    } catch (error) {
                        console.log("error 3:", error);
                    }
                    return response;
                }
            }
        });
        var ArrayList = Java.use("java.util.ArrayList");
        var OkHttpClient = Java.use("okhttp3.OkHttpClient");
        console.log(OkHttpClient);
        OkHttpClient.$init.overload('okhttp3.OkHttpClient$Builder').implementation = function(Builder) {
            console.log("OkHttpClient.$init:", this, Java.cast(Builder.interceptors(), ArrayList));
            this.$init(Builder);
        };

        var MyInterceptorObj = MyInterceptor.$new();
        var Builder = Java.use("okhttp3.OkHttpClient$Builder");
        console.log(Builder);
        Builder.build.implementation = function() {
            this.interceptors().clear();
            //var MyInterceptorObj = MyInterceptor.$new();
            this.interceptors().add(MyInterceptorObj);
            var result = this.build();
            return result;
        };

        Builder.addInterceptor.implementation = function(interceptor) {
            this.interceptors().clear();
            //var MyInterceptorObj = MyInterceptor.$new();
            this.interceptors().add(MyInterceptorObj);
            return this;
            //return this.addInterceptor(interceptor);
        };

        console.log("hook_okhttp3...");
    });
}
hook_okhttp3()
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:580399815 @yoavst/okhttp3-interceptor-obfuscated
