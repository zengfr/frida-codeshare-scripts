
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:334967789 @ahmedMhesham12/proxy-and-sslpinning-bypass
/* 
    Author: Ahmed Hesham (@ahmedMhesham12)
    Make sure you have edited the IP and port
*/

function disable_ssl_pinning_and_proxy() {
    const NSURLSession = ObjC.classes.NSURLSession;
    Interceptor.attach(NSURLSession['- dataTaskWithRequest:completionHandler:'].implementation, {
        onEnter: function(args) {
            console.log('Bypassing proxy detection in NSURLSession');
        }
    });

    const NSURLConnection = ObjC.classes.NSURLConnection;
    Interceptor.attach(NSURLConnection['- initWithRequest:delegate:startImmediately:'].implementation, {
        onEnter: function(args) {
            console.log('Bypassing proxy detection in NSURLConnection');
        }
    });

    const CFNetwork = Module.findExportByName('CFNetwork', 'CFNetworkCopyProxiesForURL');
    if (CFNetwork) {
        Interceptor.replace(CFNetwork, new NativeCallback(function(url, proxies) {
            console.log('Bypassing proxy detection in CFNetworkCopyProxiesForURL');
            return [];
        }, 'pointer', ['pointer', 'pointer']));
    }

    const getaddrinfo = Module.findExportByName(null, 'getaddrinfo');
    if (getaddrinfo) {
        Interceptor.attach(getaddrinfo, {
            onEnter: function(args) {
                console.log('Bypassing proxy detection in getaddrinfo');
            }
        });
    }

    const connect = Module.findExportByName(null, 'connect');
    if (connect) {
        Interceptor.attach(connect, {
            onEnter: function(args) {
                console.log('Bypassing proxy detection in connect');
            }
        });
    }

    const NSURLSessionConfiguration = ObjC.classes.NSURLSessionConfiguration;
    Interceptor.attach(NSURLSessionConfiguration['- setConnectionProxyDictionary:'].implementation, {
        onEnter: function(args) {
            console.log('Bypassing proxy detection in NSURLSessionConfiguration');
            const proxySettings = ObjC.classes.NSMutableDictionary.dictionary();
            proxySettings.setObject_forKey_(ObjC.classes.NSNumber.numberWithInt_(1), 'HTTPEnable');
            proxySettings.setObject_forKey_(ObjC.classes.NSNumber.numberWithInt_(1), 'HTTPSEnable');
            proxySettings.setObject_forKey_(ObjC.classes.NSString.stringWithString_('192.168.100.29'), 'HTTPProxy'); /* Change this ip */
            proxySettings.setObject_forKey_(ObjC.classes.NSNumber.numberWithInt_(8080), 'HTTPPort'); /* Change this port */
            proxySettings.setObject_forKey_(ObjC.classes.NSString.stringWithString_('192.168.100.29'), 'HTTPSProxy'); /* Change this ip */
            proxySettings.setObject_forKey_(ObjC.classes.NSNumber.numberWithInt_(8080), 'HTTPSPort'); /* Change this port */
            args[2] = proxySettings;
        }
    });

    const CFStream = Module.findExportByName('CoreFoundation', 'CFReadStreamCopyProperty');
    if (CFStream) {
        Interceptor.attach(CFStream, {
            onEnter: function(args) {
                console.log('Bypassing proxy detection in CFStream');
            }
        });
    }

    const HTTPProxyDetection = Module.findExportByName('CFNetwork', 'CFNetworkCopySystemProxySettings');
    if (HTTPProxyDetection) {
        Interceptor.replace(HTTPProxyDetection, new NativeCallback(function() {
            console.log('Bypassing HTTP proxy detection');
            return ObjC.classes.NSDictionary.dictionary();
        }, 'pointer', []));
    }

    const SOCKSProxyDetection = Module.findExportByName('CFNetwork', 'CFNetworkCopyProxiesForAutoConfigurationScript');
    if (SOCKSProxyDetection) {
        Interceptor.replace(SOCKSProxyDetection, new NativeCallback(function(script, url, error) {
            console.log('Bypassing SOCKS proxy detection');
            return ObjC.classes.NSArray.array();
        }, 'pointer', ['pointer', 'pointer', 'pointer']));
    }

    const SSLCreateContext = Module.findExportByName(null, 'SSLCreateContext');
    if (SSLCreateContext) {
        Interceptor.attach(SSLCreateContext, {
            onEnter: function(args) {
                console.log('SSLCreateContext hooked');
            },
            onLeave: function(retval) {
                const SSLSetSessionOption = new NativeFunction(Module.findExportByName(null, 'SSLSetSessionOption'), 'int', ['pointer', 'int', 'bool']);
                SSLSetSessionOption(retval, 0, 0);
                console.log('SSL pinning disabled');
            }
        });
    }

    const SecTrustEvaluate = Module.findExportByName(null, 'SecTrustEvaluate');
    if (SecTrustEvaluate) {
        Interceptor.replace(SecTrustEvaluate, new NativeCallback(function(trust, result) {
            console.log('SecTrustEvaluate hooked');
            return 0;
        }, 'int', ['pointer', 'pointer']));
    }

    const SecTrustEvaluateAsync = Module.findExportByName(null, 'SecTrustEvaluateAsync');
    if (SecTrustEvaluateAsync) {
        Interceptor.replace(SecTrustEvaluateAsync, new NativeCallback(function(trust, queue, result, block) {
            console.log('SecTrustEvaluateAsync hooked');
            const completionBlock = new NativeCallback(function(trust, result) {
                console.log('SecTrustEvaluateAsync completion block hooked');
                return 0;
            }, 'void', ['pointer', 'pointer']);
            completionBlock(trust, result);
        }, 'void', ['pointer', 'pointer', 'pointer', 'pointer']));
    }

    const SecTrustEvaluateWithError = Module.findExportByName(null, 'SecTrustEvaluateWithError');
    if (SecTrustEvaluateWithError) {
        Interceptor.replace(SecTrustEvaluateWithError, new NativeCallback(function(trust, error) {
            console.log('SecTrustEvaluateWithError hooked');
            return true;
        }, 'bool', ['pointer', 'pointer']));
    }

    const Security = Module.findExportByName('Security', 'SecCertificateCopySubjectSummary');
    if (Security) {
        Interceptor.replace(Security, new NativeCallback(function(cert) {
            console.log('Bypassing certificate validation');
            return ObjC.classes.NSString.stringWithString_('dummy-cert-summary');
        }, 'pointer', ['pointer']));
    }
}

if (ObjC.available) {
    disable_ssl_pinning_and_proxy();
} else {
    console.log('Objective-C Runtime is not available!');
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:334967789 @ahmedMhesham12/proxy-and-sslpinning-bypass
