
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1065246354 @ercu/root-and-bypass-ssl
/* 
   Android SSL Re-pinning frida script v0.1 @masbog 
   $ frida -U -f it.app.mobile -l frida-android-unpinning-ssl.js
   $ [Samsung GT-I9500::it.app.mobile]-> %resume
   
   or
   
   $ frida --codeshare masbog/frida-android-unpinning-ssl
   $ [Samsung GT-I9500::it.app.mobile]-> %resume
   
   TODO: bypass kony android application
   
   original source code from: https://github.com/sensepost/objection/blob/8974d37733d108762184bb41fe8d0a4f1fffb591/objection/hooks/android/pinning/disable.js
   
*/

setTimeout(function() {


    Java.perform(function() {




        console.log('');
        console.log('======');
        console.log('[#] Android OKHttp logging by M4v3r1ck [#]');
        console.log('======');


        //Create a new instance of HttpLoggingInterceptor class
        function getInterceptor() {
            try {

                const HttpLoggingInterceptor = Java.use('okhttp3.logging.HttpLoggingInterceptor');
                const Level = Java.use('okhttp3.logging.HttpLoggingInterceptor$Level');

                const MyLogger = Java.registerClass({
                    name: 'MyLogger',
                    superClass: Java.use('java.lang.Object'),
                    implements: [Java.use('okhttp3.logging.HttpLoggingInterceptor$Logger')],
                    methods: {
                        log: [{
                            returnType: 'void',
                            argumentTypes: ['java.lang.String'],
                            implementation: function(message) {
                                console.log('    [LOG] ' + message);
                            }
                        }]
                    },
                });

                var logInstance = HttpLoggingInterceptor.$new(MyLogger.$new());

                //If you want to log at the logcat just change to the line bellow
                //var logInstance = HttpLoggingInterceptor.$new();

                logInstance.setLevel(Level.BODY.value);

                return logInstance;

            } catch (err) {
                console.log("[-] Error creating interceptor")
                console.log(err);
                console.log(err.stack)
                return null;
            }
        }


        try {
            var Builder = Java.use('okhttp3.OkHttpClient$Builder')
            var build = Builder.build.overload();
            build.implementation = function() {
                console.log('[+] OkHttpClient$Builder ==> Adding log interceptor')

                //Add the new interceptor before call the 'build' function
                try {
                    this.addInterceptor(getInterceptor());
                } catch (err) {
                    console.log('[-] OkHttpClient$Builder.addInterceptor error');
                    //console.log(err);
                }

                return build.call(this);
            }

        } catch (err) {
            console.log('[-] OkHttpClient$Builder error');
            //console.log(err);
        }
        try {
            console.log("Patching javax.net.ssl.SSLHandshakeException...");
            var _SSLHandshakeException = Java.use("javax.net.ssl.SSLHandshakeException");
            _SSLHandshakeException.$init.overload('java.lang.String').implementation = function() {

                console.log("_SSLHandshakeException.init.");
                console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

            };

            console.log('* HOOKED SSLHandshakeException ');


        } catch (e) {
            console.log("[E:] SSLHandshakeException:" + e);
        }







        try {
            console.log("Patching javax.net.ssl.SSLPeerUnverifiedException...");
            var SSLPeerUnverifiedException = Java.use("javax.net.ssl.SSLPeerUnverifiedException");
            SSLPeerUnverifiedException.$init.overload('java.lang.String').implementation = function() {

                console.log("SSLPeerUnverifiedException.init.");
                console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

            };

            console.log('* HOOKED SSLPeerUnverifiedException ');


        } catch (e) {
            console.log("[E:] SSLPeerUnverifiedException:" + e);
        }










        try {
            console.log("Patching java.security.cert.CertificateException...");
            var _CertificateException = Java.use("java.security.cert.CertificateException");
        } catch (e) {
            console.log("[E:] CertificateException:" + e);
        }




        try {

            _CertificateException.$init.overload('java.lang.String').implementation = function(a) {

                console.log("CertificateException.init.");
                console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

            };
        } catch (e) {
            console.log("[E:] CertificateException:" + e);
        }


        try {
            _CertificateException.$init.overload('java.lang.Throwable').implementation = function(a) {

                console.log("_CertificateException.init.");
                console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

            };
        } catch (e) {
            console.log("[E:] CertificateException:" + e);
        }


        try {
            _CertificateException.$init.overload('java.lang.String', 'java.lang.Throwable').implementation = function(a, b) {

                console.log("_CertificateException.init.");
                console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

            };
        } catch (e) {
            console.log("[E:] CertificateException:" + e);
        }


        try {
            _CertificateException.$init.overload().implementation = function() {

                console.log("_CertificateException.init.");
                console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

            };

            console.log('* HOOKED CertificateException ');

        } catch (e) {
            console.log("[E:] CertificateException:" + e);
        }





        var _CertPathValidatorException = Java.use("java.security.cert.CertPathValidatorException");



        try {

            _CertPathValidatorException.$init.overload('java.lang.String').implementation = function(a) {

                console.log("CertificateException.init.");
                console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

            };
        } catch (e) {
            console.log("[E:] CertificateException:" + e);
        }


        try {
            _CertificateException.$init.overload('java.lang.Throwable').implementation = function(a) {

                console.log("_CertificateException.init.");
                console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

            };
        } catch (e) {
            console.log("[E:] CertificateException:" + e);
        }


        try {
            _CertPathValidatorException.$init.overload('java.lang.String', 'java.lang.Throwable').implementation = function(a, b) {

                console.log("_CertificateException.init.");
                console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

            };
        } catch (e) {
            console.log("[E:] CertificateException:" + e);
        }


        try {
            _CertPathValidatorException.$init.overload().implementation = function() {

                console.log("_CertificateException.init.");
                console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

            };

            console.log('* HOOKED CertificateException ');

        } catch (e) {
            console.log("[E:] CertificateException:" + e);
        }





        var JavaxNetSSLException = Java.use("javax.net.ssl.SSLException");




        try {

            JavaxNetSSLException.$init.overload('java.lang.String').implementation = function(a) {

                console.log("javax.net.ssl.SSLException.init.");
                console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

            };
        } catch (e) {
            console.log("[E:] javax.net.ssl.SSLException:" + e);
        }


        try {
            JavaxNetSSLException.$init.overload('java.lang.Throwable').implementation = function(a) {

                console.log("javax.net.ssl.SSLException.init.");
                console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

            };
        } catch (e) {
            console.log("[E:] javax.net.ssl.SSLException:" + e);
        }


        try {
            JavaxNetSSLException.$init.overload('java.lang.String', 'java.lang.Throwable').implementation = function(a, b) {

                console.log("javax.net.ssl.SSLException.init.");
                console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

            };
        } catch (e) {
            console.log("[E:] javax.net.ssl.SSLException:" + e);
        }




        ///


        console.log("[*] SSL Pinning Bypasses");
        console.log(`[*] Your frida version: ${Frida.version}`);
        console.log(`[*] Your script runtime: ${Script.runtime}`);

        /**
         * by incogbyte
         * Common functions 
         * thx apkunpacker, NVISOsecurity, TheDauntless
         * Remember that sslpinning can be custom, and sometimes u need to reversing using ghidra,IDA or something like that.
         * !!! THIS SCRIPT IS NOT A SILVER BULLET !!
         */

        function disableFlutterPinningv2() {
            var config = {
                "ios": {
                    "modulename": "Flutter",
                    "patterns": {
                        "arm64": [
                            "FF 83 01 D1 FA 67 01 A9 F8 5F 02 A9 F6 57 03 A9 F4 4F 04 A9 FD 7B 05 A9 FD 43 01 91 F? 03 00 AA ?? 0? 40 F9 ?8 1? 40 F9 15 ?? 4? F9 B5 00 00 B4",
                        ],
                    },
                },
                "android": {
                    "modulename": "libflutter.so",
                    "patterns": {
                        "arm64": [
                            "F? 0F 1C F8 F? 5? 01 A9 F? 5? 02 A9 F? ?? 03 A9 ?? ?? ?? ?? 68 1A 40 F9",
                            "F? 43 01 D1 FE 67 01 A9 F8 5F 02 A9 F6 57 03 A9 F4 4F 04 A9 13 00 40 F9 F4 03 00 AA 68 1A 40 F9",
                            "FF 43 01 D1 FE 67 01 A9 ?? ?? 06 94 ?? 7? 06 94 68 1A 40 F9 15 15 41 F9 B5 00 00 B4 B6 4A 40 F9",
                        ],
                        "arm": [
                            "2D E9 F? 4? D0 F8 00 80 81 46 D8 F8 18 00 D0 F8 ??",
                        ],
                        "x64": [
                            "55 41 57 41 56 41 55 41 54 53 50 49 89 f? 4c 8b 37 49 8b 46 30 4c 8b a? ?? 0? 00 00 4d 85 e? 74 1? 4d 8b",
                            "55 41 57 41 56 41 55 41 54 53 48 83 EC 18 49 89 FF 48 8B 1F 48 8B 43 30 4C 8B A0 28 02 00 00 4D 85 E4 74"
                        ]
                    }
                }
            };

            var TLSValidationDisabled = false;
            if (Java.available) {
                console.log("[+] Java environment detected");
                Java.perform(hookSystemLoadLibrary);
            } else if (ObjC.available) {
                console.log("[+] iOS environment detected");
            }
            disableTLSValidation();
            setTimeout(disableTLSValidation, 2000, true);

            function hookSystemLoadLibrary() {
                const System = Java.use('java.lang.System');
                const Runtime = Java.use('java.lang.Runtime');
                const SystemLoad_2 = System.loadLibrary.overload('java.lang.String');
                const VMStack = Java.use('dalvik.system.VMStack');

                SystemLoad_2.implementation = function(library) {
                    try {
                        const loaded = Runtime.getRuntime().loadLibrary0(VMStack.getCallingClassLoader(), library);
                        if (library === 'flutter') {
                            console.log("[+] libflutter.so loaded");
                            disableTLSValidation();
                        }
                        return loaded;
                    } catch (ex) {
                        console.log(ex);
                    }
                };
            }

            function disableTLSValidation(fallback = false) {
                if (TLSValidationDisabled) return;

                var platformConfig = config[Java.available ? "android" : "ios"];
                var m = Process.findModuleByName(platformConfig["modulename"]);

                // If there is no loaded Flutter module, the setTimeout may trigger a second time, but after that we give up
                if (m === null) {
                    if (fallback) console.log("[!] Flutter module not found.");
                    return;
                }

                if (Process.arch in platformConfig["patterns"]) {
                    findAndPatch(m, platformConfig["patterns"][Process.arch], Java.available && Process.arch == "arm" ? 1 : 0, fallback);
                } else {
                    console.log("[!] Processor architecture not supported: ", Process.arch);
                }

                if (!TLSValidationDisabled) {
                    if (fallback) {
                        if (m.enumerateRanges('r-x').length == 0) {
                            console.log('[!] No memory ranges found in Flutter library. This is either a Frida bug, or the application is using some kind of RASP.');
                        } else {
                            console.log('[!] ssl_verify_peer_cert not found. Please open an issue at https://github.com/NVISOsecurity/disable-flutter-tls-verification/issues');
                        }
                    } else {
                        console.log('[!] ssl_verify_peer_cert not found. Trying again...');
                    }
                }
            }

            function findAndPatch(m, patterns, thumb, fallback) {
                console.log("[+] Flutter library found");
                var ranges = m.enumerateRanges('r-x');
                ranges.forEach(range => {
                    patterns.forEach(pattern => {
                        Memory.scan(range.base, range.size, pattern, {
                            onMatch: function(address, size) {
                                console.log('[+] ssl_verify_peer_cert found at offset: 0x' + (address - m.base).toString(16));
                                TLSValidationDisabled = true;
                                hook_ssl_verify_peer_cert(address.add(thumb));
                            }
                        });
                    });
                });
            }

            function hook_ssl_verify_peer_cert(address) {
                Interceptor.replace(address, new NativeCallback((pathPtr, flags) => {
                    return 0;
                }, 'int', ['pointer', 'int']));
            }
        }


        function hook_ssl_verify_result(address) {
            Interceptor.attach(address, {
                onEnter: function(args) {
                    console.log("Disabling SSL validation")
                },
                onLeave: function(retval) {
                    console.log("Retval: " + retval)
                    retval.replace(0x1);
                }
            });
        }

        function disablePinning() {
            try {
                var m = Process.findModuleByName("libflutter.so");
                var pattern = "2d e9 f0 4f a3 b0 82 46 50 20 10 70"
                var res = Memory.scan(m.base, m.size, pattern, {
                    onMatch: function(address, size) {
                        console.log('[+] ssl_verify_result found at: ' + address.toString());
                        hook_ssl_verify_result(address.add(0x01));
                    },
                    onError: function(reason) {
                        console.log('[!] There was an error scanning memory');
                    },
                    onComplete: function() {
                        console.log("All done")
                    }
                });
            } catch (e) {
                console.warn("Not A Flutter App");
            }
        }


        function CommonMethods() {
            try {
                const HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");
                HttpsURLConnection.setDefaultHostnameVerifier.implementation = function(hostnameVerifier) {
                    console.log('[*] Bypassing HttpsURLConnection (setDefaultHostnameVerifier)');
                    return;
                };
                console.log('[+] HttpsURLConnection (setDefaultHostnameVerifier)');
            } catch (err) {
                console.log('[!] HttpsURLConnection (setDefaultHostnameVerifier)');
            }
            try {
                const HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");
                HttpsURLConnection.setSSLSocketFactory.implementation = function(SSLSocketFactory) {
                    console.log('[*] Bypassing HttpsURLConnection (setSSLSocketFactory)');
                    return;
                };
                console.log('[+] HttpsURLConnection (setSSLSocketFactory)');
            } catch (err) {
                console.log('[!] HttpsURLConnection (setSSLSocketFactory)');
            }
            try {
                const HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");
                HttpsURLConnection.setHostnameVerifier.implementation = function(hostnameVerifier) {
                    console.log('[*] Bypassing HttpsURLConnection (setHostnameVerifier)');
                    return;
                };
                console.log('[+] HttpsURLConnection (setHostnameVerifier)');
            } catch (err) {
                console.log('[!] HttpsURLConnection (setHostnameVerifier)');
            }
            try {
                const X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
                const SSLContext = Java.use('javax.net.ssl.SSLContext');
                const TrustManager = Java.registerClass({
                    name: 'incogbyte.bypass.test.TrustManager',
                    implements: [X509TrustManager],
                    methods: {
                        checkClientTrusted: function(chain, authType) {},
                        checkServerTrusted: function(chain, authType) {},
                        getAcceptedIssuers: function() {
                            return [];
                        }
                    }
                });
                const TrustManagers = [TrustManager.$new()];
                const SSLContext_init = SSLContext.init.overload('[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom');
                SSLContext_init.implementation = function(keyManager, trustManager, secureRandom) {
                    console.log('[*] Bypassing Trustmanager (Android < 7) request');
                    SSLContext_init.call(this, keyManager, TrustManagers, secureRandom);
                };
                console.log('[+] SSLContext');
            } catch (err) {
                console.log('[!] SSLContext');
            }
            try {
                const array_list = Java.use("java.util.ArrayList");
                const TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
                TrustManagerImpl.checkTrustedRecursive.implementation = function(a1, a2, a3, a4, a5, a6) {
                    console.log('[*] Bypassing TrustManagerImpl checkTrusted ');
                    return array_list.$new();
                }
                TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
                    console.log('[*] Bypassing TrustManagerImpl verifyChain: ' + host);
                    return untrustedChain;
                };
                console.log('[+] TrustManagerImpl');
            } catch (err) {
                console.log('[!] TrustManagerImpl');
            }
            try {
                const okhttp3_Activity_1 = Java.use('okhttp3.CertificatePinner');
                okhttp3_Activity_1.check.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
                    console.log('[*] Bypassing OkHTTPv3 (list): ' + a);
                };
                console.log('[+] OkHTTPv3 (list)');
            } catch (err) {
                console.log('[!] OkHTTPv3 (list)');
            }
            try {
                const okhttp3_Activity_2 = Java.use('okhttp3.CertificatePinner');
                okhttp3_Activity_2.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(a, b) {
                    console.log('[*] Bypassing OkHTTPv3 (cert): ' + a);
                    return true;
                };
                console.log('[+] OkHTTPv3 (cert)');
            } catch (err) {
                console.log('[!] OkHTTPv3 (cert)');
            }
            try {
                const okhttp3_Activity_3 = Java.use('okhttp3.CertificatePinner');
                okhttp3_Activity_3.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function(a, b) {
                    console.log('[*] Bypassing OkHTTPv3 (cert array): ' + a);
                    return true;
                };
                console.log('[+] OkHTTPv3 (cert array)');
            } catch (err) {
                console.log('[!] OkHTTPv3 (cert array)');
            }
            try {
                const okhttp3_Activity_4 = Java.use('okhttp3.CertificatePinner');
                okhttp3_Activity_4['check$okhttp'].implementation = function(a, b) {
                    console.log('[*] Bypassing OkHTTPv3 ($okhttp): ' + a);
                };
                console.log('[+] OkHTTPv3 ($okhttp)');
            } catch (err) {
                console.log('[!] OkHTTPv3 ($okhttp)');
            }
            try {
                const trustkit_Activity_1 = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
                trustkit_Activity_1.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
                    console.log('[*] Bypassing Trustkit OkHostnameVerifier(SSLSession): ' + a);
                    return true;
                };
                console.log('[+] Trustkit OkHostnameVerifier(SSLSession)');
            } catch (err) {
                console.log('[!] Trustkit OkHostnameVerifier(SSLSession)');
            }
            try {
                const trustkit_Activity_2 = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
                trustkit_Activity_2.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
                    console.log('[*] Bypassing Trustkit OkHostnameVerifier(cert): ' + a);
                    return true;
                };
                console.log('[+] Trustkit OkHostnameVerifier(cert)');
            } catch (err) {
                console.log('[!] Trustkit OkHostnameVerifier(cert)');
            }
            try {
                const trustkit_PinningTrustManager = Java.use('com.datatheorem.android.trustkit.pinning.PinningTrustManager');
                trustkit_PinningTrustManager.checkServerTrusted.implementation = function() {
                    console.log('[*] Bypassing Trustkit PinningTrustManager');
                };
                console.log('[+] Trustkit PinningTrustManager');
            } catch (err) {
                console.log('[!] Trustkit PinningTrustManager');
            }
            try {
                const appcelerator_PinningTrustManager = Java.use('appcelerator.https.PinningTrustManager');
                appcelerator_PinningTrustManager.checkServerTrusted.implementation = function() {
                    console.log('[*] Bypassing Appcelerator PinningTrustManager');
                };
                console.log('[+] Appcelerator PinningTrustManager');
            } catch (err) {
                console.log('[!] Appcelerator PinningTrustManager');
            }
            try {
                const OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
                OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certRefs, JavaObject, authMethod) {
                    console.log('[*] Bypassing OpenSSLSocketImpl Conscrypt');
                };
                console.log('[+] OpenSSLSocketImpl Conscrypt');
            } catch (err) {
                console.log('[!] OpenSSLSocketImpl Conscrypt');
            }
            try {
                const OpenSSLEngineSocketImpl_Activity = Java.use('com.android.org.conscrypt.OpenSSLEngineSocketImpl');
                OpenSSLEngineSocketImpl_Activity.verifyCertificateChain.overload('[Ljava.lang.Long;', 'java.lang.String').implementation = function(a, b) {
                    console.log('[*] Bypassing OpenSSLEngineSocketImpl Conscrypt: ' + b);
                };
                console.log('[+] OpenSSLEngineSocketImpl Conscrypt');
            } catch (err) {
                console.log('[!] OpenSSLEngineSocketImpl Conscrypt');
            }
            try {
                const OpenSSLSocketImpl_Harmony = Java.use('org.apache.harmony.xnet.provider.jsse.OpenSSLSocketImpl');
                OpenSSLSocketImpl_Harmony.verifyCertificateChain.implementation = function(asn1DerEncodedCertificateChain, authMethod) {
                    console.log('[*] Bypassing OpenSSLSocketImpl Apache Harmony');
                };
                console.log('[+] OpenSSLSocketImpl Apache Harmony');
            } catch (err) {
                console.log('[!] OpenSSLSocketImpl Apache Harmony');
            }
            try {
                const phonegap_Activity = Java.use('nl.xservices.plugins.sslCertificateChecker');
                phonegap_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(a, b, c) {
                    console.log('[*] Bypassing PhoneGap sslCertificateChecker: ' + a);
                    return true;
                };
                console.log('[+] PhoneGap sslCertificateChecker');
            } catch (err) {
                console.log('[!] PhoneGap sslCertificateChecker');
            }
            try {
                const WLClient_Activity_1 = Java.use('com.worklight.wlclient.api.WLClient');
                WLClient_Activity_1.getInstance().pinTrustedCertificatePublicKey.overload('java.lang.String').implementation = function(cert) {
                    console.log('[*] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey (string): ' + cert);
                    return;
                };
                console.log('[+] IBM MobileFirst pinTrustedCertificatePublicKey (string)');
            } catch (err) {
                console.log('[!] IBM MobileFirst pinTrustedCertificatePublicKey (string)');
            }
            try {
                const WLClient_Activity_2 = Java.use('com.worklight.wlclient.api.WLClient');
                WLClient_Activity_2.getInstance().pinTrustedCertificatePublicKey.overload('[Ljava.lang.String;').implementation = function(cert) {
                    console.log('[*] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey (string array): ' + cert);
                    return;
                };
                console.log('[+] IBM MobileFirst pinTrustedCertificatePublicKey (string array)');
            } catch (err) {
                console.log('[!] IBM MobileFirst pinTrustedCertificatePublicKey (string array)');
            }
            try {
                const worklight_Activity_1 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
                worklight_Activity_1.verify.overload('java.lang.String', 'javax.net.ssl.SSLSocket').implementation = function(a, b) {
                    console.log('[*] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning (SSLSocket): ' + a);
                    return;
                };
                console.log('[+] IBM WorkLight HostNameVerifierWithCertificatePinning (SSLSocket)');
            } catch (err) {
                console.log('[!] IBM WorkLight HostNameVerifierWithCertificatePinning (SSLSocket)');
            }
            try {
                const worklight_Activity_2 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
                worklight_Activity_2.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
                    console.log('[*] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning (cert): ' + a);
                    return;
                };
                console.log('[+] IBM WorkLight HostNameVerifierWithCertificatePinning (cert)');
            } catch (err) {
                console.log('[!] IBM WorkLight HostNameVerifierWithCertificatePinning (cert)');
            }
            try {
                const worklight_Activity_3 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
                worklight_Activity_3.verify.overload('java.lang.String', '[Ljava.lang.String;', '[Ljava.lang.String;').implementation = function(a, b) {
                    console.log('[*] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning (string string): ' + a);
                    return;
                };
                console.log('[+] IBM WorkLight HostNameVerifierWithCertificatePinning (string string)');
            } catch (err) {
                console.log('[!] IBM WorkLight HostNameVerifierWithCertificatePinning (string string)');
            }
            try {
                const worklight_Activity_4 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
                worklight_Activity_4.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
                    console.log('[*] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning (SSLSession): ' + a);
                    return true;
                };
                console.log('[+] IBM WorkLight HostNameVerifierWithCertificatePinning (SSLSession)');
            } catch (err) {
                console.log('[!] IBM WorkLight HostNameVerifierWithCertificatePinning (SSLSession)');
            }
            try {
                const conscrypt_CertPinManager_Activity = Java.use('com.android.org.conscrypt.CertPinManager');
                conscrypt_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
                    console.log('[*] Bypassing Conscrypt CertPinManager: ' + a);
                    return true;
                };
                console.log('[+] Conscrypt CertPinManager');
            } catch (err) {
                console.log('[!] Conscrypt CertPinManager');
            }
            try {
                const cwac_CertPinManager_Activity = Java.use('com.commonsware.cwac.netsecurity.conscrypt.CertPinManager');
                cwac_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
                    console.log('[*] Bypassing CWAC-Netsecurity CertPinManager: ' + a);
                    return true;
                };
                console.log('[+] CWAC-Netsecurity CertPinManager');
            } catch (err) {
                console.log('[!] CWAC-Netsecurity CertPinManager');
            }
            try {
                const androidgap_WLCertificatePinningPlugin_Activity = Java.use('com.worklight.androidgap.plugin.WLCertificatePinningPlugin');
                androidgap_WLCertificatePinningPlugin_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(a, b, c) {
                    console.log('[*] Bypassing Worklight Androidgap WLCertificatePinningPlugin: ' + a);
                    return true;
                };
                console.log('[+] Worklight Androidgap WLCertificatePinningPlugin');
            } catch (err) {
                console.log('[!] Worklight Androidgap WLCertificatePinningPlugin');
            }
            try {
                const netty_FingerprintTrustManagerFactory = Java.use('io.netty.handler.ssl.util.FingerprintTrustManagerFactory');
                netty_FingerprintTrustManagerFactory.checkTrusted.implementation = function(type, chain) {
                    console.log('[*] Bypassing Netty FingerprintTrustManagerFactory');
                };
                console.log('[+] Netty FingerprintTrustManagerFactory');
            } catch (err) {
                console.log('[!] Netty FingerprintTrustManagerFactory');
            }
            try {
                const Squareup_CertificatePinner_Activity_1 = Java.use('com.squareup.okhttp.CertificatePinner');
                Squareup_CertificatePinner_Activity_1.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(a, b) {
                    console.log('[*] Bypassing Squareup CertificatePinner (cert): ' + a);
                    return;
                };
                console.log('[+] Squareup CertificatePinner (cert)');
            } catch (err) {
                console.log('[!] Squareup CertificatePinner (cert)');
            }
            try {
                const Squareup_CertificatePinner_Activity_2 = Java.use('com.squareup.okhttp.CertificatePinner');
                Squareup_CertificatePinner_Activity_2.check.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
                    console.log('[*] Bypassing Squareup CertificatePinner (list): ' + a);
                    return null;
                };
                console.log('[+] Squareup CertificatePinner (list)');
            } catch (err) {
                console.log('[!] Squareup CertificatePinner (list)');
            }
            try {
                const Squareup_OkHostnameVerifier_Activity_1 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
                Squareup_OkHostnameVerifier_Activity_1.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
                    console.log('[*] Bypassing Squareup OkHostnameVerifier (cert): ' + a);
                    return true;
                };
                console.log('[+] Squareup OkHostnameVerifier (cert)');
            } catch (err) {
                console.log('[!] Squareup OkHostnameVerifier (cert)');
            }
            try {
                const Squareup_OkHostnameVerifier_Activity_2 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
                Squareup_OkHostnameVerifier_Activity_2.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
                    console.log('[*] Bypassing Squareup OkHostnameVerifier (SSLSession): ' + a);
                    return true;
                };
                console.log('[+] Squareup OkHostnameVerifier (SSLSession)');
            } catch (err) {
                console.log('[!] Squareup OkHostnameVerifier (SSLSession)');
            }
            try {
                const AndroidWebViewClient_Activity_1 = Java.use('android.webkit.WebViewClient');
                AndroidWebViewClient_Activity_1.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
                    console.log('[*] Bypassing Android WebViewClient (SslErrorHandler)');
                };
                console.log('[+] Android WebViewClient (SslErrorHandler)');
            } catch (err) {
                console.log('[!] Android WebViewClient (SslErrorHandler)');
            }
            try {
                const AndroidWebViewClient_Activity_2 = Java.use('android.webkit.WebViewClient');
                AndroidWebViewClient_Activity_2.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.WebResourceRequest', 'android.webkit.WebResourceError').implementation = function(obj1, obj2, obj3) {
                    console.log('[*] Bypassing Android WebViewClient (WebResourceError)');
                };
                console.log('[+] Android WebViewClient (WebResourceError)');
            } catch (err) {
                console.log('[!] Android WebViewClient (WebResourceError)');
            }
            try {
                const CordovaWebViewClient_Activity = Java.use('org.apache.cordova.CordovaWebViewClient');
                CordovaWebViewClient_Activity.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
                    console.log('[*] Bypassing Apache Cordova WebViewClient');
                    obj3.proceed();
                };
            } catch (err) {
                console.log('[!] Apache Cordova WebViewClient');
            }
            try {
                const boye_AbstractVerifier = Java.use('ch.boye.httpclientandroidlib.conn.ssl.AbstractVerifier');
                boye_AbstractVerifier.verify.implementation = function(host, ssl) {
                    console.log('[*] Bypassing Boye AbstractVerifier: ' + host);
                };
            } catch (err) {
                console.log('[!] Boye AbstractVerifier');
            }
        }

        function dynamicPatching() {
            var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
            var SSLContext = Java.use('javax.net.ssl.SSLContext');
            var TrustManager = Java.registerClass({
                name: 'incogbyte.bypass.test.TrustManager',
                implements: [X509TrustManager],
                methods: {
                    checkClientTrusted: function(chain, authType) {},
                    checkServerTrusted: function(chain, authType) {},
                    getAcceptedIssuers: function() {
                        return [];
                    }
                }
            });
            try {
                var okhttp3_Activity_1 = Java.use('okhttp3.CertificatePinner');
                okhttp3_Activity_1.check.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
                    console.log('[+] Bypassing OkHTTPv3 {1}: ' + a);
                    return;
                };
            } catch (err) {
                console.log('[-] OkHTTPv3 {1} pinner not found');
            }
            try {
                var okhttp3_Activity_2 = Java.use('okhttp3.CertificatePinner');
                okhttp3_Activity_2.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(a, b) {
                    console.log('[+] Bypassing OkHTTPv3 {2}: ' + a);
                    return;
                };
            } catch (err) {
                console.log('[-] OkHTTPv3 {2} pinner not found');
            }
            try {
                var okhttp3_Activity_3 = Java.use('okhttp3.CertificatePinner');
                okhttp3_Activity_3.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function(a, b) {
                    console.log('[+] Bypassing OkHTTPv3 {3}: ' + a);
                    return;
                };
            } catch (err) {
                console.log('[-] OkHTTPv3 {3} pinner not found');
            }
            try {
                var okhttp3_Activity_4 = Java.use('okhttp3.CertificatePinner');
                okhttp3_Activity_4.check$okhttp.overload('java.lang.String', 'kotlin.jvm.functions.Function0').implementation = function(a, b) {
                    console.log('[+] Bypassing OkHTTPv3 {4}: ' + a);
                    return;
                };
            } catch (err) {
                console.log('[-] OkHTTPv3 {4} pinner not found');
            }
            try {
                var trustkit_Activity_1 = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
                trustkit_Activity_1.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
                    console.log('[+] Bypassing Trustkit {1}: ' + a);
                    return true;
                };
            } catch (err) {
                console.log('[-] Trustkit {1} pinner not found');
            }
            try {
                var trustkit_Activity_2 = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
                trustkit_Activity_2.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
                    console.log('[+] Bypassing Trustkit {2}: ' + a);
                    return true;
                };
            } catch (err) {
                console.log('[-] Trustkit {2} pinner not found');
            }
            try {
                var trustkit_PinningTrustManager = Java.use('com.datatheorem.android.trustkit.pinning.PinningTrustManager');
                trustkit_PinningTrustManager.checkServerTrusted.overload('[Ljava.security.cert.X509Certificate;', 'java.lang.String').implementation = function(chain, authType) {
                    console.log('[+] Bypassing Trustkit {3}');
                };
            } catch (err) {
                console.log('[-] Trustkit {3} pinner not found');
            }
            try {
                var array_list = Java.use("java.util.ArrayList");
                var TrustManagerImpl_Activity_1 = Java.use('com.android.org.conscrypt.TrustManagerImpl');
                TrustManagerImpl_Activity_1.checkTrustedRecursive.implementation = function(certs, ocspData, tlsSctData, host, clientAuth, untrustedChain, trustAnchorChain, used) {
                    console.log('[+] Bypassing TrustManagerImpl (Android > 7) checkTrustedRecursive check: ' + host);
                    return array_list.$new();
                };
            } catch (err) {
                console.log('[-] TrustManagerImpl (Android > 7) checkTrustedRecursive check not found');
            }
            try {
                var TrustManagerImpl_Activity_2 = Java.use('com.android.org.conscrypt.TrustManagerImpl');
                TrustManagerImpl_Activity_2.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
                    console.log('[+] Bypassing TrustManagerImpl (Android > 7) verifyChain check: ' + host);
                    return untrustedChain;
                };
            } catch (err) {
                console.log('[-] TrustManagerImpl (Android > 7) verifyChain check not found');
            }
            try {
                var appcelerator_PinningTrustManager = Java.use('appcelerator.https.PinningTrustManager');
                appcelerator_PinningTrustManager.checkServerTrusted.implementation = function(chain, authType) {
                    console.log('[+] Bypassing Appcelerator PinningTrustManager');
                    return;
                };
            } catch (err) {
                console.log('[-] Appcelerator PinningTrustManager pinner not found');
            }
            try {
                var fabric_PinningTrustManager = Java.use('io.fabric.sdk.android.services.network.PinningTrustManager');
                fabric_PinningTrustManager.checkServerTrusted.implementation = function(chain, authType) {
                    console.log('[+] Bypassing Fabric PinningTrustManager');
                    return;
                };
            } catch (err) {
                console.log('[-] Fabric PinningTrustManager pinner not found');
            }
            try {
                var OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
                OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certRefs, JavaObject, authMethod) {
                    console.log('[+] Bypassing OpenSSLSocketImpl Conscrypt {1}');
                };
            } catch (err) {
                console.log('[-] OpenSSLSocketImpl Conscrypt {1} pinner not found');
            }
            try {
                var OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
                OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certChain, authMethod) {
                    console.log('[+] Bypassing OpenSSLSocketImpl Conscrypt {2}');
                };
            } catch (err) {
                console.log('[-] OpenSSLSocketImpl Conscrypt {2} pinner not found');
            }

            try {
                var OpenSSLEngineSocketImpl_Activity = Java.use('com.android.org.conscrypt.OpenSSLEngineSocketImpl');
                OpenSSLEngineSocketImpl_Activity.verifyCertificateChain.overload('[Ljava.lang.Long;', 'java.lang.String').implementation = function(a, b) {
                    console.log('[+] Bypassing OpenSSLEngineSocketImpl Conscrypt: ' + b);
                };
            } catch (err) {
                console.log('[-] OpenSSLEngineSocketImpl Conscrypt pinner not found');
            }

            try {
                var OpenSSLSocketImpl_Harmony = Java.use('org.apache.harmony.xnet.provider.jsse.OpenSSLSocketImpl');
                OpenSSLSocketImpl_Harmony.verifyCertificateChain.implementation = function(asn1DerEncodedCertificateChain, authMethod) {
                    console.log('[+] Bypassing OpenSSLSocketImpl Apache Harmony');
                };
            } catch (err) {
                console.log('[-] OpenSSLSocketImpl Apache Harmony pinner not found');
            }

            try {
                var phonegap_Activity = Java.use('nl.xservices.plugins.sslCertificateChecker');
                phonegap_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(a, b, c) {
                    console.log('[+] Bypassing PhoneGap sslCertificateChecker: ' + a);
                    return true;
                };
            } catch (err) {
                console.log('[-] PhoneGap sslCertificateChecker pinner not found');
            }

            try {
                var WLClient_Activity_1 = Java.use('com.worklight.wlclient.api.WLClient');
                WLClient_Activity_1.getInstance().pinTrustedCertificatePublicKey.overload('java.lang.String').implementation = function(cert) {
                    console.log('[+] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey {1}: ' + cert);
                    return;
                };
            } catch (err) {
                console.log('[-] IBM MobileFirst pinTrustedCertificatePublicKey {1} pinner not found');
            }
            try {
                var WLClient_Activity_2 = Java.use('com.worklight.wlclient.api.WLClient');
                WLClient_Activity_2.getInstance().pinTrustedCertificatePublicKey.overload('[Ljava.lang.String;').implementation = function(cert) {
                    console.log('[+] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey {2}: ' + cert);
                    return;
                };
            } catch (err) {
                console.log('[-] IBM MobileFirst pinTrustedCertificatePublicKey {2} pinner not found');
            }

            try {
                var worklight_Activity_1 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
                worklight_Activity_1.verify.overload('java.lang.String', 'javax.net.ssl.SSLSocket').implementation = function(a, b) {
                    console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {1}: ' + a);
                    return;
                };
            } catch (err) {
                console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {1} pinner not found');
            }
            try {
                var worklight_Activity_2 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
                worklight_Activity_2.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
                    console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {2}: ' + a);
                    return;
                };
            } catch (err) {
                console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {2} pinner not found');
            }
            try {
                var worklight_Activity_3 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
                worklight_Activity_3.verify.overload('java.lang.String', '[Ljava.lang.String;', '[Ljava.lang.String;').implementation = function(a, b) {
                    console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {3}: ' + a);
                    return;
                };
            } catch (err) {
                console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {3} pinner not found');
            }
            try {
                var worklight_Activity_4 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
                worklight_Activity_4.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
                    console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {4}: ' + a);
                    return true;
                };
            } catch (err) {
                console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {4} pinner not found');
            }

            try {
                var conscrypt_CertPinManager_Activity = Java.use('com.android.org.conscrypt.CertPinManager');
                conscrypt_CertPinManager_Activity.checkChainPinning.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
                    console.log('[+] Bypassing Conscrypt CertPinManager: ' + a);
                    return true;
                };
            } catch (err) {
                console.log('[-] Conscrypt CertPinManager pinner not found');
            }

            try {
                var legacy_conscrypt_CertPinManager_Activity = Java.use('com.android.org.conscrypt.CertPinManager');
                legacy_conscrypt_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
                    console.log('[+] Bypassing Conscrypt CertPinManager (Legacy): ' + a);
                    return true;
                };
            } catch (err) {
                console.log('[-] Conscrypt CertPinManager (Legacy) pinner not found');
            }

            try {
                var cwac_CertPinManager_Activity = Java.use('com.commonsware.cwac.netsecurity.conscrypt.CertPinManager');
                cwac_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
                    console.log('[+] Bypassing CWAC-Netsecurity CertPinManager: ' + a);
                    return true;
                };
            } catch (err) {
                console.log('[-] CWAC-Netsecurity CertPinManager pinner not found');
            }

            try {
                var androidgap_WLCertificatePinningPlugin_Activity = Java.use('com.worklight.androidgap.plugin.WLCertificatePinningPlugin');
                androidgap_WLCertificatePinningPlugin_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(a, b, c) {
                    console.log('[+] Bypassing Worklight Androidgap WLCertificatePinningPlugin: ' + a);
                    return true;
                };
            } catch (err) {
                console.log('[-] Worklight Androidgap WLCertificatePinningPlugin pinner not found');
            }

            try {
                var netty_FingerprintTrustManagerFactory = Java.use('io.netty.handler.ssl.util.FingerprintTrustManagerFactory');
                //var netty_FingerprintTrustManagerFactory = Java.use('org.jboss.netty.handler.ssl.util.FingerprintTrustManagerFactory');
                netty_FingerprintTrustManagerFactory.checkTrusted.implementation = function(type, chain) {
                    console.log('[+] Bypassing Netty FingerprintTrustManagerFactory');
                };
            } catch (err) {
                console.log('[-] Netty FingerprintTrustManagerFactory pinner not found');
            }

            try {
                var Squareup_CertificatePinner_Activity_1 = Java.use('com.squareup.okhttp.CertificatePinner');
                Squareup_CertificatePinner_Activity_1.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(a, b) {
                    console.log('[+] Bypassing Squareup CertificatePinner {1}: ' + a);
                    return;
                };
            } catch (err) {
                console.log('[-] Squareup CertificatePinner {1} pinner not found');
            }
            try {
                var Squareup_CertificatePinner_Activity_2 = Java.use('com.squareup.okhttp.CertificatePinner');
                Squareup_CertificatePinner_Activity_2.check.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
                    console.log('[+] Bypassing Squareup CertificatePinner {2}: ' + a);
                    return;
                };
            } catch (err) {
                console.log('[-] Squareup CertificatePinner {2} pinner not found');
            }

            try {
                var Squareup_OkHostnameVerifier_Activity_1 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
                Squareup_OkHostnameVerifier_Activity_1.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
                    console.log('[+] Bypassing Squareup OkHostnameVerifier {1}: ' + a);
                    return true;
                };
            } catch (err) {
                console.log('[-] Squareup OkHostnameVerifier check not found');
            }
            try {
                var Squareup_OkHostnameVerifier_Activity_2 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
                Squareup_OkHostnameVerifier_Activity_2.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
                    console.log('[+] Bypassing Squareup OkHostnameVerifier {2}: ' + a);
                    return true;
                };
            } catch (err) {
                console.log('[-] Squareup OkHostnameVerifier check not found');
            }

            try {
                var AndroidWebViewClient_Activity_1 = Java.use('android.webkit.WebViewClient');
                AndroidWebViewClient_Activity_1.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
                    console.log('[+] Bypassing Android WebViewClient check {1}');
                };
            } catch (err) {
                console.log('[-] Android WebViewClient {1} check not found');
            }
            try {
                var AndroidWebViewClient_Activity_2 = Java.use('android.webkit.WebViewClient');
                AndroidWebViewClient_Activity_2.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.WebResourceRequest', 'android.webkit.WebResourceError').implementation = function(obj1, obj2, obj3) {
                    console.log('[+] Bypassing Android WebViewClient check {2}');
                };
            } catch (err) {
                console.log('[-] Android WebViewClient {2} check not found');
            }
            try {
                var AndroidWebViewClient_Activity_3 = Java.use('android.webkit.WebViewClient');
                AndroidWebViewClient_Activity_3.onReceivedError.overload('android.webkit.WebView', 'int', 'java.lang.String', 'java.lang.String').implementation = function(obj1, obj2, obj3, obj4) {
                    console.log('[+] Bypassing Android WebViewClient check {3}');
                };
            } catch (err) {
                console.log('[-] Android WebViewClient {3} check not found');
            }
            try {
                var AndroidWebViewClient_Activity_4 = Java.use('android.webkit.WebViewClient');
                AndroidWebViewClient_Activity_4.onReceivedError.overload('android.webkit.WebView', 'android.webkit.WebResourceRequest', 'android.webkit.WebResourceError').implementation = function(obj1, obj2, obj3) {
                    console.log('[+] Bypassing Android WebViewClient check {4}');
                };
            } catch (err) {
                console.log('[-] Android WebViewClient {4} check not found');
            }

            try {
                var CordovaWebViewClient_Activity = Java.use('org.apache.cordova.CordovaWebViewClient');
                CordovaWebViewClient_Activity.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
                    console.log('[+] Bypassing Apache Cordova WebViewClient check');
                    obj3.proceed();
                };
            } catch (err) {
                console.log('[-] Apache Cordova WebViewClient check not found');
            }

            try {
                var boye_AbstractVerifier = Java.use('ch.boye.httpclientandroidlib.conn.ssl.AbstractVerifier');
                boye_AbstractVerifier.verify.implementation = function(host, ssl) {
                    console.log('[+] Bypassing Boye AbstractVerifier check: ' + host);
                };
            } catch (err) {
                console.log('[-] Boye AbstractVerifier check not found');
            }

            try {
                var apache_AbstractVerifier = Java.use('org.apache.http.conn.ssl.AbstractVerifier');
                apache_AbstractVerifier.verify.implementation = function(a, b, c, d) {
                    console.log('[+] Bypassing Apache AbstractVerifier check: ' + a);
                    return;
                };
            } catch (err) {
                console.log('[-] Apache AbstractVerifier check not found');
            }

            try {
                var CronetEngineBuilderImpl_Activity = Java.use("org.chromium.net.impl.CronetEngineBuilderImpl");
                CronetEngine_Activity.enablePublicKeyPinningBypassForLocalTrustAnchors.overload('boolean').implementation = function(a) {
                    console.log("[+] Disabling Public Key pinning for local trust anchors in Chromium Cronet");
                    var cronet_obj_1 = CronetEngine_Activity.enablePublicKeyPinningBypassForLocalTrustAnchors.call(this, true);
                    return cronet_obj_1;
                };
                CronetEngine_Activity.addPublicKeyPins.overload('java.lang.String', 'java.util.Set', 'boolean', 'java.util.Date').implementation = function(hostName, pinsSha256, includeSubdomains, expirationDate) {
                    console.log("[+] Bypassing Chromium Cronet pinner: " + hostName);
                    var cronet_obj_2 = CronetEngine_Activity.addPublicKeyPins.call(this, hostName, pinsSha256, includeSubdomains, expirationDate);
                    return cronet_obj_2;
                };
            } catch (err) {
                console.log('[-] Chromium Cronet pinner not found')
            }

            try {
                var HttpCertificatePinning_Activity = Java.use('diefferson.http_certificate_pinning.HttpCertificatePinning');
                HttpCertificatePinning_Activity.checkConnexion.overload("java.lang.String", "java.util.List", "java.util.Map", "int", "java.lang.String").implementation = function(a, b, c, d, e) {
                    console.log('[+] Bypassing Flutter HttpCertificatePinning : ' + a);
                    return true;
                };
            } catch (err) {
                console.log('[-] Flutter HttpCertificatePinning pinner not found');
            }
            try {
                var SslPinningPlugin_Activity = Java.use('com.macif.plugin.sslpinningplugin.SslPinningPlugin');
                SslPinningPlugin_Activity.checkConnexion.overload("java.lang.String", "java.util.List", "java.util.Map", "int", "java.lang.String").implementation = function(a, b, c, d, e) {
                    console.log('[+] Bypassing Flutter SslPinningPlugin: ' + a);
                    return true;
                };
            } catch (err) {
                console.log('[-] Flutter SslPinningPlugin pinner not found');
            }

            function rudimentaryFix(typeName) {
                if (typeName === undefined) {
                    return;
                } else if (typeName === 'boolean') {
                    return true;
                } else {
                    return null;
                }
            }
            try {
                var UnverifiedCertError = Java.use('javax.net.ssl.SSLPeerUnverifiedException');
                UnverifiedCertError.$init.implementation = function(str) {
                    console.log('[!] Unexpected SSLPeerUnverifiedException occurred, trying to patch it dynamically...!');
                    try {
                        var stackTrace = Java.use('java.lang.Thread').currentThread().getStackTrace();
                        var exceptionStackIndex = stackTrace.findIndex(stack => stack.getClassName() === "javax.net.ssl.SSLPeerUnverifiedException");
                        var callingFunctionStack = stackTrace[exceptionStackIndex + 1];
                        var className = callingFunctionStack.getClassName();
                        var methodName = callingFunctionStack.getMethodName();
                        var callingClass = Java.use(className);
                        var callingMethod = callingClass[methodName];
                        console.log('[!] Attempting to bypass uncommon SSL Pinning method on: ' + className + '.' + methodName + '!');
                        if (callingMethod.implementation) {
                            return;
                        }
                        var returnTypeName = callingMethod.returnType.type;
                        callingMethod.implementation = function() {
                            rudimentaryFix(returnTypeName);
                        };
                    } catch (e) {
                        if (String(e).includes(".overload")) {
                            var splittedList = String(e).split(".overload");
                            for (let i = 2; i < splittedList.length; i++) {
                                var extractedOverload = splittedList[i].trim().split("(")[1].slice(0, -1).replaceAll("'", "");
                                if (extractedOverload.includes(",")) {
                                    var argList = extractedOverload.split(", ");
                                    console.log('[!] Attempting overload of ' + className + '.' + methodName + ' with arguments: ' + extractedOverload + '!');
                                    if (argList.length == 2) {
                                        callingMethod.overload(argList[0], argList[1]).implementation = function(a, b) {
                                            rudimentaryFix(returnTypeName);
                                        }
                                    } else if (argNum == 3) {
                                        callingMethod.overload(argList[0], argList[1], argList[2]).implementation = function(a, b, c) {
                                            rudimentaryFix(returnTypeName);
                                        }
                                    } else if (argNum == 4) {
                                        callingMethod.overload(argList[0], argList[1], argList[2], argList[3]).implementation = function(a, b, c, d) {
                                            rudimentaryFix(returnTypeName);
                                        }
                                    } else if (argNum == 5) {
                                        callingMethod.overload(argList[0], argList[1], argList[2], argList[3], argList[4]).implementation = function(a, b, c, d, e) {
                                            rudimentaryFix(returnTypeName);
                                        }
                                    } else if (argNum == 6) {
                                        callingMethod.overload(argList[0], argList[1], argList[2], argList[3], argList[4], argList[5]).implementation = function(a, b, c, d, e, f) {
                                            rudimentaryFix(returnTypeName);
                                        }
                                    }
                                } else {
                                    callingMethod.overload(extractedOverload).implementation = function(a) {
                                        rudimentaryFix(returnTypeName);
                                    }
                                }
                            }
                        } else {
                            console.log('[-] Failed to dynamically patch SSLPeerUnverifiedException ' + e + '!');
                        }
                    }
                    return this.$init(str);
                };
            } catch (err) {}
        }

        /**
         * 
         * 
         * Main function
         * 
         */


        var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
        var SSLContext = Java.use('javax.net.ssl.SSLContext');
        var TrustManager = Java.registerClass({
            name: 'incogbyte.bypass.test.TrustManager',
            implements: [X509TrustManager],
            methods: {
                checkClientTrusted: function(chain, authType) {},
                checkServerTrusted: function(chain, authType) {},
                getAcceptedIssuers: function() {
                    return [];
                }
            }
        });

        console.log("[*] Flutter testing");
        setTimeout(disablePinning, 1000);
        disableFlutterPinningv2();
        console.log("[*] Dynamic patching");
        dynamicPatching();
        console.log("[*] CommonMethods");
        CommonMethods();
        console.log("[*] Testing OKHTTP methods");

        try {
            var okhttp3_Activity = Java.use('okhttp3.CertificatePinner');
            okhttp3_Activity.check.overload('java.lang.String', 'java.util.List').implementation = function(str) {
                console.log('[+] Bypassing OkHTTPv3 {1}: ' + str);
                return true;
            };
            okhttp3_Activity.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(str) {
                console.log('[+] Bypassing OkHTTPv3 {2}: ' + str);
                return true;
            };
        } catch (err) {
            console.log('[-] OkHTTPv3 pinner not found');
        }
        try {
            var trustkit_Activity = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
            trustkit_Activity.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(str) {
                console.log('[+] Bypassing Trustkit {1}: ' + str);
                return true;
            };
            trustkit_Activity.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(str) {
                console.log('[+] Bypassing Trustkit {2}: ' + str);
                return true;
            };
            var trustkit_PinningTrustManager = Java.use('com.datatheorem.android.trustkit.pinning.PinningTrustManager');
            trustkit_PinningTrustManager.checkServerTrusted.implementation = function() {
                console.log('[+] Bypassing Trustkit {3}');
            };
        } catch (err) {
            console.log('[-] Trustkit pinner not found');
        }
        try {
            var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
            TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
                console.log('[+] Bypassing TrustManagerImpl (Android > 7): ' + host);
                return untrustedChain;
            };
        } catch (err) {
            console.log('[-] TrustManagerImpl (Android > 7) pinner not found');
        }
        try {
            var appcelerator_PinningTrustManager = Java.use('appcelerator.https.PinningTrustManager');
            appcelerator_PinningTrustManager.checkServerTrusted.implementation = function() {
                console.log('[+] Bypassing Appcelerator PinningTrustManager');
            };
        } catch (err) {
            console.log('[-] Appcelerator PinningTrustManager pinner not found');
        }
        try {
            var OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
            OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certRefs, JavaObject, authMethod) {
                console.log('[+] Bypassing OpenSSLSocketImpl Conscrypt');
            };
        } catch (err) {
            console.log('[-] OpenSSLSocketImpl Conscrypt pinner not found');
        }
        try {
            var OpenSSLEngineSocketImpl_Activity = Java.use('com.android.org.conscrypt.OpenSSLEngineSocketImpl');
            OpenSSLSocketImpl_Activity.verifyCertificateChain.overload('[Ljava.lang.Long;', 'java.lang.String').implementation = function(str1, str2) {
                console.log('[+] Bypassing OpenSSLEngineSocketImpl Conscrypt: ' + str2);
            };
        } catch (err) {
            console.log('[-] OpenSSLEngineSocketImpl Conscrypt pinner not found');
        }
        try {
            var OpenSSLSocketImpl_Harmony = Java.use('org.apache.harmony.xnet.provider.jsse.OpenSSLSocketImpl');
            OpenSSLSocketImpl_Harmony.verifyCertificateChain.implementation = function(asn1DerEncodedCertificateChain, authMethod) {
                console.log('[+] Bypassing OpenSSLSocketImpl Apache Harmony');
            };
        } catch (err) {
            console.log('[-] OpenSSLSocketImpl Apache Harmony pinner not found');
        }
        try {
            var phonegap_Activity = Java.use('nl.xservices.plugins.sslCertificateChecker');
            phonegap_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(str) {
                console.log('[+] Bypassing PhoneGap sslCertificateChecker: ' + str);
                return true;
            };
        } catch (err) {
            console.log('[-] PhoneGap sslCertificateChecker pinner not found');
        }
        try {
            var WLClient_Activity = Java.use('com.worklight.wlclient.api.WLClient');
            WLClient_Activity.getInstance().pinTrustedCertificatePublicKey.overload('java.lang.String').implementation = function(cert) {
                console.log('[+] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey {1}: ' + cert);
                return;
            };
            WLClient_Activity.getInstance().pinTrustedCertificatePublicKey.overload('[Ljava.lang.String;').implementation = function(cert) {
                console.log('[+] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey {2}: ' + cert);
                return;
            };
        } catch (err) {
            console.log('[-] IBM MobileFirst pinTrustedCertificatePublicKey pinner not found');
        }
        try {
            var worklight_Activity = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
            worklight_Activity.verify.overload('java.lang.String', 'javax.net.ssl.SSLSocket').implementation = function(str) {
                console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {1}: ' + str);
                return;
            };
            worklight_Activity.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(str) {
                console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {2}: ' + str);
                return;
            };
            worklight_Activity.verify.overload('java.lang.String', '[Ljava.lang.String;', '[Ljava.lang.String;').implementation = function(str) {
                console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {3}: ' + str);
                return;
            };
            worklight_Activity.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(str) {
                console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {4}: ' + str);
                return true;
            };
        } catch (err) {
            console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning pinner not found');
        }
        try {
            var conscrypt_CertPinManager_Activity = Java.use('com.android.org.conscrypt.CertPinManager');
            conscrypt_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function(str) {
                console.log('[+] Bypassing Conscrypt CertPinManager: ' + str);
                return true;
            };
        } catch (err) {
            console.log('[-] Conscrypt CertPinManager pinner not found');
        }
        try {
            var cwac_CertPinManager_Activity = Java.use('com.commonsware.cwac.netsecurity.conscrypt.CertPinManager');
            cwac_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function(str) {
                console.log('[+] Bypassing CWAC-Netsecurity CertPinManager: ' + str);
                return true;
            };
        } catch (err) {
            console.log('[-] CWAC-Netsecurity CertPinManager pinner not found');
        }
        try {
            var androidgap_WLCertificatePinningPlugin_Activity = Java.use('com.worklight.androidgap.plugin.WLCertificatePinningPlugin');
            androidgap_WLCertificatePinningPlugin_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(str) {
                console.log('[+] Bypassing Worklight Androidgap WLCertificatePinningPlugin: ' + str);
                return true;
            };
        } catch (err) {
            console.log('[-] Worklight Androidgap WLCertificatePinningPlugin pinner not found');
        }
        try {
            var Squareup_CertificatePinner_Activity = Java.use('com.squareup.okhttp.CertificatePinner');
            Squareup_CertificatePinner_Activity.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(str1, str2) {
                console.log('[+] Bypassing Squareup CertificatePinner {1}: ' + str1);
                return;
            };
            Squareup_CertificatePinner_Activity.check.overload('java.lang.String', 'java.util.List').implementation = function(str1, str2) {
                console.log('[+] Bypassing Squareup CertificatePinner {2}: ' + str1);
                return;
            };
        } catch (err) {
            console.log('[-] Squareup CertificatePinner pinner not found');
        }
        try {
            var Squareup_OkHostnameVerifier_Activity = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
            Squareup_OkHostnameVerifier_Activity.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(str1, str2) {
                console.log('[+] Bypassing Squareup OkHostnameVerifier {1}: ' + str1);
                return true;
            };
            Squareup_OkHostnameVerifier_Activity.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(str1, str2) {
                console.log('[+] Bypassing Squareup OkHostnameVerifier {2}: ' + str1);
                return true;
            };
        } catch (err) {
            console.log('[-] Squareup OkHostnameVerifier pinner not found');
        }
        try {
            var AndroidWebViewClient_Activity = Java.use('android.webkit.WebViewClient');
            AndroidWebViewClient_Activity.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
                console.log('[+] Bypassing Android WebViewClient');
            };
        } catch (err) {
            console.log('[-] Android WebViewClient pinner not found');
        }
        try {
            var CordovaWebViewClient_Activity = Java.use('org.apache.cordova.CordovaWebViewClient');
            CordovaWebViewClient_Activity.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
                console.log('[+] Bypassing Apache Cordova WebViewClient');
                obj3.proceed();
            };
        } catch (err) {
            console.log('[-] Apache Cordova WebViewClient pinner not found');
        }
        try {
            var boye_AbstractVerifier = Java.use('ch.boye.httpclientandroidlib.conn.ssl.AbstractVerifier');
            boye_AbstractVerifier.verify.implementation = function(host, ssl) {
                console.log('[+] Bypassing Boye AbstractVerifier: ' + host);
            };
        } catch (err) {
            console.log('[-] Boye AbstractVerifier pinner not found');
        }

        /***
    android 7.0+ network_security_config TrustManagerImpl hook
    apache httpclient partly
    ***/
        var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
        // try {
        //     var Arrays = Java.use("java.util.Arrays");
        //     //apache http client pinning maybe baypass
        //     //https://github.com/google/conscrypt/blob/c88f9f55a523f128f0e4dace76a34724bfa1e88c/platform/src/main/java/org/conscrypt/TrustManagerImpl.java#471
        //     TrustManagerImpl.checkTrusted.implementation = function (chain, authType, session, parameters, authType) {
        //         quiet_send("TrustManagerImpl checkTrusted called");
        //         //Generics currently result in java.lang.Object
        //         return Arrays.asList(chain);
        //     }
        //
        // } catch (e) {
        //     quiet_send("TrustManagerImpl checkTrusted nout found");
        // }

        try {
            // Android 7+ TrustManagerImpl
            TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
                console.log("TrustManagerImpl verifyChain called");
                // Skip all the logic and just return the chain again :P
                //https://www.nccgroup.trust/uk/about-us/newsroom-and-events/blogs/2017/november/bypassing-androids-network-security-configuration/
                // https://github.com/google/conscrypt/blob/c88f9f55a523f128f0e4dace76a34724bfa1e88c/platform/src/main/java/org/conscrypt/TrustManagerImpl.java#L650
                return untrustedChain;
            }
        } catch (e) {
            console.log("TrustManagerImpl verifyChain nout found below 7.0");
        }
        // OpenSSLSocketImpl
        try {
            var OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
            OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certRefs, authMethod) {
                console.log('OpenSSLSocketImpl.verifyCertificateChain');
            }

            console.log('OpenSSLSocketImpl pinning')
        } catch (err) {
            console.log('OpenSSLSocketImpl pinner not found');
        }
        // Trustkit
        try {
            var Activity = Java.use("com.datatheorem.android.trustkit.pinning.OkHostnameVerifier");
            Activity.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(str) {
                console.log('Trustkit.verify1: ' + str);
                return true;
            };
            Activity.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(str) {
                console.log('Trustkit.verify2: ' + str);
                return true;
            };

            console.log('Trustkit pinning')
        } catch (err) {
            console.log('Trustkit pinner not found')
        }

        try {
            //cronet pinner hook
            //weibo don't invoke

            var netBuilder = Java.use("org.chromium.net.CronetEngine$Builder");

            //https://developer.android.com/guide/topics/connectivity/cronet/reference/org/chromium/net/CronetEngine.Builder.html#enablePublicKeyPinningBypassForLocalTrustAnchors(boolean)
            netBuilder.enablePublicKeyPinningBypassForLocalTrustAnchors.implementation = function(arg) {

                //weibo not invoke
                console.log("Enables or disables public key pinning bypass for local trust anchors = " + arg);

                //true to enable the bypass, false to disable.
                var ret = netBuilder.enablePublicKeyPinningBypassForLocalTrustAnchors.call(this, true);
                return ret;
            };

            netBuilder.addPublicKeyPins.implementation = function(hostName, pinsSha256, includeSubdomains, expirationDate) {
                console.log("cronet addPublicKeyPins hostName = " + hostName);

                //var ret = netBuilder.addPublicKeyPins.call(this,hostName, pinsSha256,includeSubdomains, expirationDate);
                //this 是调用 addPublicKeyPins 前的对象吗? Yes,CronetEngine.Builder
                return this;
            };

        } catch (err) {
            console.log('[-] Cronet pinner not found')
        }


        ///
        var RootPackages = ["com.noshufou.android.su", "com.noshufou.android.su.elite", "eu.chainfire.supersu",
            "com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su", "com.koushikdutta.rommanager",
            "com.koushikdutta.rommanager.license", "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch",
            "com.ramdroid.appquarantine", "com.ramdroid.appquarantinepro", "com.devadvance.rootcloak", "com.devadvance.rootcloakplus",
            "de.robv.android.xposed.installer", "com.saurik.substrate", "com.zachspong.temprootremovejb", "com.amphoras.hidemyroot",
            "com.amphoras.hidemyrootadfree", "com.formyhm.hiderootPremium", "com.formyhm.hideroot", "me.phh.superuser",
            "eu.chainfire.supersu.pro", "com.kingouser.com", "com.topjohnwu.magisk"
        ];

        var RootBinaries = ["su", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk", "magisk"];

        var RootProperties = {
            "ro.build.selinux": "1",
            "ro.debuggable": "0",
            "service.adb.root": "0",
            "ro.secure": "1"
        };

        var RootPropertiesKeys = [];

        for (var k in RootProperties) RootPropertiesKeys.push(k);

        var PackageManager = Java.use("android.app.ApplicationPackageManager");

        var Runtime = Java.use('java.lang.Runtime');

        var NativeFile = Java.use('java.io.File');

        var String = Java.use('java.lang.String');

        var SystemProperties = Java.use('android.os.SystemProperties');

        var BufferedReader = Java.use('java.io.BufferedReader');

        var ProcessBuilder = Java.use('java.lang.ProcessBuilder');

        var StringBuffer = Java.use('java.lang.StringBuffer');

        var loaded_classes = Java.enumerateLoadedClassesSync();

        send("Loaded " + loaded_classes.length + " classes!");

        var useKeyInfo = false;

        var useProcessManager = false;

        send("loaded: " + loaded_classes.indexOf('java.lang.ProcessManager'));

        if (loaded_classes.indexOf('java.lang.ProcessManager') != -1) {
            try {
                //useProcessManager = true;
                //var ProcessManager = Java.use('java.lang.ProcessManager');
            } catch (err) {
                send("ProcessManager Hook failed: " + err);
            }
        } else {
            send("ProcessManager hook not loaded");
        }

        var KeyInfo = null;

        if (loaded_classes.indexOf('android.security.keystore.KeyInfo') != -1) {
            try {
                //useKeyInfo = true;
                //var KeyInfo = Java.use('android.security.keystore.KeyInfo');
            } catch (err) {
                send("KeyInfo Hook failed: " + err);
            }
        } else {
            send("KeyInfo hook not loaded");
        }

        PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
            var shouldFakePackage = (RootPackages.indexOf(pname) > -1);
            if (shouldFakePackage) {
                send("Bypass root check for package: " + pname);
                pname = "set.package.name.to.a.fake.one.so.we.can.bypass.it";
            }
            return this.getPackageInfo.overload('java.lang.String', 'int').call(this, pname, flags);
        };

        NativeFile.exists.implementation = function() {
            var name = NativeFile.getName.call(this);
            var shouldFakeReturn = (RootBinaries.indexOf(name) > -1);
            if (shouldFakeReturn) {
                send("Bypass return value for binary: " + name);
                return false;
            } else {
                return this.exists.call(this);
            }
        };

        var exec = Runtime.exec.overload('[Ljava.lang.String;');
        var exec1 = Runtime.exec.overload('java.lang.String');
        var exec2 = Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;');
        var exec3 = Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;');
        var exec4 = Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;', 'java.io.File');
        var exec5 = Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;', 'java.io.File');

        exec5.implementation = function(cmd, env, dir) {
            if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh") {
                var fakeCmd = "grep";
                send("Bypass " + cmd + " command");
                return exec1.call(this, fakeCmd);
            }
            if (cmd == "su") {
                var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                send("Bypass " + cmd + " command");
                return exec1.call(this, fakeCmd);
            }
            return exec5.call(this, cmd, env, dir);
        };

        exec4.implementation = function(cmdarr, env, file) {
            for (var i = 0; i < cmdarr.length; i = i + 1) {
                var tmp_cmd = cmdarr[i];
                if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id" || tmp_cmd == "sh") {
                    var fakeCmd = "grep";
                    send("Bypass " + cmdarr + " command");
                    return exec1.call(this, fakeCmd);
                }

                if (tmp_cmd == "su") {
                    var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                    send("Bypass " + cmdarr + " command");
                    return exec1.call(this, fakeCmd);
                }
            }
            return exec4.call(this, cmdarr, env, file);
        };

        exec3.implementation = function(cmdarr, envp) {
            for (var i = 0; i < cmdarr.length; i = i + 1) {
                var tmp_cmd = cmdarr[i];
                if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id" || tmp_cmd == "sh") {
                    var fakeCmd = "grep";
                    send("Bypass " + cmdarr + " command");
                    return exec1.call(this, fakeCmd);
                }

                if (tmp_cmd == "su") {
                    var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                    send("Bypass " + cmdarr + " command");
                    return exec1.call(this, fakeCmd);
                }
            }
            return exec3.call(this, cmdarr, envp);
        };

        exec2.implementation = function(cmd, env) {
            if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh") {
                var fakeCmd = "grep";
                send("Bypass " + cmd + " command");
                return exec1.call(this, fakeCmd);
            }
            if (cmd == "su") {
                var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                send("Bypass " + cmd + " command");
                return exec1.call(this, fakeCmd);
            }
            return exec2.call(this, cmd, env);
        };

        exec.implementation = function(cmd) {
            for (var i = 0; i < cmd.length; i = i + 1) {
                var tmp_cmd = cmd[i];
                if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id" || tmp_cmd == "sh") {
                    var fakeCmd = "grep";
                    send("Bypass " + cmd + " command");
                    return exec1.call(this, fakeCmd);
                }

                if (tmp_cmd == "su") {
                    var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                    send("Bypass " + cmd + " command");
                    return exec1.call(this, fakeCmd);
                }
            }

            return exec.call(this, cmd);
        };

        exec1.implementation = function(cmd) {
            if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh") {
                var fakeCmd = "grep";
                send("Bypass " + cmd + " command");
                return exec1.call(this, fakeCmd);
            }
            if (cmd == "su") {
                var fakeCmd = "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
                send("Bypass " + cmd + " command");
                return exec1.call(this, fakeCmd);
            }
            return exec1.call(this, cmd);
        };

        String.contains.implementation = function(name) {
            if (name == "test-keys") {
                send("Bypass test-keys check");
                return false;
            }
            return this.contains.call(this, name);
        };

        var get = SystemProperties.get.overload('java.lang.String');

        get.implementation = function(name) {
            if (RootPropertiesKeys.indexOf(name) != -1) {
                send("Bypass " + name);
                return RootProperties[name];
            }
            return this.get.call(this, name);
        };

        Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
            onEnter: function(args) {
                var path = Memory.readCString(args[0]);
                path = path.split("/");
                var executable = path[path.length - 1];
                var shouldFakeReturn = (RootBinaries.indexOf(executable) > -1)
                if (shouldFakeReturn) {
                    Memory.writeUtf8String(args[0], "/notexists");
                    send("Bypass native fopen");
                }
            },
            onLeave: function(retval) {

            }
        });

        Interceptor.attach(Module.findExportByName("libc.so", "system"), {
            onEnter: function(args) {
                var cmd = Memory.readCString(args[0]);
                send("SYSTEM CMD: " + cmd);
                if (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id") {
                    send("Bypass native system: " + cmd);
                    Memory.writeUtf8String(args[0], "grep");
                }
                if (cmd == "su") {
                    send("Bypass native system: " + cmd);
                    Memory.writeUtf8String(args[0], "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled");
                }
            },
            onLeave: function(retval) {

            }
        });

        /*

        TO IMPLEMENT:

        Exec Family

        int execl(const char *path, const char *arg0, ..., const char *argn, (char *)0);
        int execle(const char *path, const char *arg0, ..., const char *argn, (char *)0, char *const envp[]);
        int execlp(const char *file, const char *arg0, ..., const char *argn, (char *)0);
        int execlpe(const char *file, const char *arg0, ..., const char *argn, (char *)0, char *const envp[]);
        int execv(const char *path, char *const argv[]);
        int execve(const char *path, char *const argv[], char *const envp[]);
        int execvp(const char *file, char *const argv[]);
        int execvpe(const char *file, char *const argv[], char *const envp[]);

        */


        BufferedReader.readLine.overload('boolean').implementation = function() {
            var text = this.readLine.overload('boolean').call(this);
            if (text === null) {
                // just pass , i know it's ugly as hell but test != null won't work :(
            } else {
                var shouldFakeRead = (text.indexOf("ro.build.tags=test-keys") > -1);
                if (shouldFakeRead) {
                    send("Bypass build.prop file read");
                    text = text.replace("ro.build.tags=test-keys", "ro.build.tags=release-keys");
                }
            }
            return text;
        };

        var executeCommand = ProcessBuilder.command.overload('java.util.List');

        ProcessBuilder.start.implementation = function() {
            var cmd = this.command.call(this);
            var shouldModifyCommand = false;
            for (var i = 0; i < cmd.size(); i = i + 1) {
                var tmp_cmd = cmd.get(i).toString();
                if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd.indexOf("mount") != -1 || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd.indexOf("id") != -1) {
                    shouldModifyCommand = true;
                }
            }
            if (shouldModifyCommand) {
                send("Bypass ProcessBuilder " + cmd);
                this.command.call(this, ["grep"]);
                return this.start.call(this);
            }
            if (cmd.indexOf("su") != -1) {
                send("Bypass ProcessBuilder " + cmd);
                this.command.call(this, ["justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled"]);
                return this.start.call(this);
            }

            return this.start.call(this);
        };

        if (useProcessManager) {
            var ProcManExec = ProcessManager.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;', 'java.io.File', 'boolean');
            var ProcManExecVariant = ProcessManager.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;', 'java.lang.String', 'java.io.FileDescriptor', 'java.io.FileDescriptor', 'java.io.FileDescriptor', 'boolean');

            ProcManExec.implementation = function(cmd, env, workdir, redirectstderr) {
                var fake_cmd = cmd;
                for (var i = 0; i < cmd.length; i = i + 1) {
                    var tmp_cmd = cmd[i];
                    if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id") {
                        var fake_cmd = ["grep"];
                        send("Bypass " + cmdarr + " command");
                    }

                    if (tmp_cmd == "su") {
                        var fake_cmd = ["justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled"];
                        send("Bypass " + cmdarr + " command");
                    }
                }
                return ProcManExec.call(this, fake_cmd, env, workdir, redirectstderr);
            };

            ProcManExecVariant.implementation = function(cmd, env, directory, stdin, stdout, stderr, redirect) {
                var fake_cmd = cmd;
                for (var i = 0; i < cmd.length; i = i + 1) {
                    var tmp_cmd = cmd[i];
                    if (tmp_cmd.indexOf("getprop") != -1 || tmp_cmd == "mount" || tmp_cmd.indexOf("build.prop") != -1 || tmp_cmd == "id") {
                        var fake_cmd = ["grep"];
                        send("Bypass " + cmdarr + " command");
                    }

                    if (tmp_cmd == "su") {
                        var fake_cmd = ["justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled"];
                        send("Bypass " + cmdarr + " command");
                    }
                }
                return ProcManExecVariant.call(this, fake_cmd, env, directory, stdin, stdout, stderr, redirect);
            };
        }

        if (useKeyInfo) {
            KeyInfo.isInsideSecureHardware.implementation = function() {
                send("Bypass isInsideSecureHardware");
                return true;
            }
        }


        console.log("");
        console.log("[.] Cert Pinning Bypass/Re-Pinning");

        var CertificateFactory = Java.use("java.security.cert.CertificateFactory");
        var FileInputStream = Java.use("java.io.FileInputStream");
        var BufferedInputStream = Java.use("java.io.BufferedInputStream");
        var X509Certificate = Java.use("java.security.cert.X509Certificate");
        var KeyStore = Java.use("java.security.KeyStore");
        var TrustManagerFactory = Java.use("javax.net.ssl.TrustManagerFactory");
        var SSLContext = Java.use("javax.net.ssl.SSLContext");

        // Load CAs from an InputStream
        console.log("[+] Loading our CA...")
        var cf = CertificateFactory.getInstance("X.509");

        try {
            var fileInputStream = FileInputStream.$new("/data/local/tmp/cert-der.crt");
        } catch (err) {
            console.log("[o] " + err);
        }

        var bufferedInputStream = BufferedInputStream.$new(fileInputStream);
        var ca = cf.generateCertificate(bufferedInputStream);
        bufferedInputStream.close();

        var certInfo = Java.cast(ca, X509Certificate);
        console.log("[o] Our CA Info: " + certInfo.getSubjectDN());

        // Create a KeyStore containing our trusted CAs
        console.log("[+] Creating a KeyStore for our CA...");
        var keyStoreType = KeyStore.getDefaultType();
        var keyStore = KeyStore.getInstance(keyStoreType);
        keyStore.load(null, null);
        keyStore.setCertificateEntry("ca", ca);

        // Create a TrustManager that trusts the CAs in our KeyStore
        console.log("[+] Creating a TrustManager that trusts the CA in our KeyStore...");
        var tmfAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
        var tmf = TrustManagerFactory.getInstance(tmfAlgorithm);
        tmf.init(keyStore);
        console.log("[+] Our TrustManager is ready...");

        console.log("[+] Hijacking SSLContext methods now...")
        console.log("[-] Waiting for the app to invoke SSLContext.init()...")

        SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom").implementation = function(a, b, c) {
            console.log("[o] App invoked javax.net.ssl.SSLContext.init...");
            SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom").call(this, a, tmf.getTrustManagers(), c);
            console.log("[+] SSLContext initialized with our custom TrustManager!");
        }

        //----------


        var HostnameVerifierInterface = Java.use('javax.net.ssl.HostnameVerifier')
        const MyHostnameVerifier = Java.registerClass({
            name: 'org.dummyPackage.MyHostnameVerifier',
            implements: [HostnameVerifierInterface],
            methods: {
                verify: [{
                    returnType: 'boolean',
                    argumentTypes: ['java.lang.String', 'javax.net.ssl.SSLSession'],
                    implementation(hostname, session) {
                        console.log('[+] Hostname verification bypass');
                        return true;
                    }
                }],
            }
        });

        var hostnameVerifierRef = Java.use('okhttp3.OkHttpClient')['hostnameVerifier'].overload();
        hostnameVerifierRef.implementation = function() {
            return MyHostnameVerifier.$new();
        }
        console.log("[+] Hostname verifier replaced")





        var okhttp3_CertificatePinner_class = null;
        try {
            okhttp3_CertificatePinner_class = Java.use('okhttp3.CertificatePinner');
        } catch (err) {
            console.log('[-] OkHTTPv3 CertificatePinner class not found. Skipping.');
            okhttp3_CertificatePinner_class = null;
        }

        if (okhttp3_CertificatePinner_class != null) {

            try {
                okhttp3_CertificatePinner_class.check.overload('java.lang.String', 'java.util.List').implementation = function(str, list) {
                    console.log('[+] Bypassing OkHTTPv3 1: ' + str);
                    return true;
                };
                console.log('[+] Loaded OkHTTPv3 hook 1');
            } catch (err) {
                console.log('[-] Skipping OkHTTPv3 hook 1');
            }

            try {
                okhttp3_CertificatePinner_class.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(str, cert) {
                    console.log('[+] Bypassing OkHTTPv3 2: ' + str);
                    return true;
                };
                console.log('[+] Loaded OkHTTPv3 hook 2');
            } catch (err) {
                console.log('[-] Skipping OkHTTPv3 hook 2');
            }

            try {
                okhttp3_CertificatePinner_class.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function(str, cert_array) {
                    console.log('[+] Bypassing OkHTTPv3 3: ' + str);
                    return true;
                };
                console.log('[+] Loaded OkHTTPv3 hook 3');
            } catch (err) {
                console.log('[-] Skipping OkHTTPv3 hook 3');
            }

            try {
                okhttp3_CertificatePinner_class['check$okhttp'].implementation = function(str, obj) {
                    console.log('[+] Bypassing OkHTTPv3 4 (4.2+): ' + str);
                };
                console.log('[+] Loaded OkHTTPv3 hook 4 (4.2+)');
            } catch (err) {
                console.log('[-] Skipping OkHTTPv3 hook 4 (4.2+)');
            }

        }







    });
}, 0);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1065246354 @ercu/root-and-bypass-ssl
