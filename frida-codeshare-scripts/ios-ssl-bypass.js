
//https://github.com/zengfr/frida-codeshare-scripts
//1798867153 @lichao890427/ios-ssl-bypass
// https://github.com/lichao890427/personal_script/blob/master/Frida_script/utils.js
// Submit bugs on git

function forcetrustcert() {
    Interceptor.replace(Module.findExportByName(null, 'SecTrustEvaluate'),
        new NativeCallback(function(trust, result) {
            Memory.writePointer(result, ptr('0x1'));
            console.log('pass SecTrustEvaluate');
            return 0;
        }, 'int', ['pointer', 'pointer'])
    );
    if (typeof(ObjC.classes.AFSecurityPolicy) !== 'undefined') {
        Interceptor.attach(ObjC.classes.AFSecurityPolicy['- evaluateServerTrust:forDomain:'].implementation, {
            onEnter: function(args) {
                console.log('pass -[AFSecurityPolicy evaluateServerTrust:forDomain:]')
            },
            onLeave: function(retval) {
                retval.replace(ptr('0x1'));
            }
        });

        Interceptor.attach(ObjC.classes.AFSecurityPolicy['- setAllowInvalidCertificates:'].implementation, {
            onEnter: function(args) {
                args[2] = ptr('0x1');
                console.log('pass -[AFSecurityPolicy setAllowInvalidCertificates:]')
            },
            onLeave: function(retval) {}
        });
        Interceptor.attach(ObjC.classes.AFSecurityPolicy['- allowInvalidCertificates'].implementation, {
            onEnter: function(args) {
                console.log('pass -[AFSecurityPolicy setAllowInvalidCertificates:]')
            },
            onLeave: function(retval) {
                retval.replace(ptr('0x1'));
            }
        });
    };
    if (typeof(ObjC.classes.MKNetworkOperation) !== 'undefined') {
        Interceptor.attach(ObjC.classes.MKNetworkOperation['- setShouldContinueWithInvalidCertificate:'].implementation, {
            onEnter: function(args) {
                args[2] = ptr('0x1');
                console.log('pass -[MKNetworkOperation setShouldContinueWithInvalidCertificate:]')
            },
            onLeave: function(retval) {}
        });
        Interceptor.attach(ObjC.classes.MKNetworkOperation['- shouldContinueWithInvalidCertificate'].implementation, {
            onEnter: function(args) {
                console.log('pass -[MKNetworkOperation shouldContinueWithInvalidCertificate]')
            },
            onLeave: function(retval) {
                retval.replace(ptr('0x1'));
            }
        });
    }
}
//https://github.com/zengfr/frida-codeshare-scripts
//1798867153 @lichao890427/ios-ssl-bypass
