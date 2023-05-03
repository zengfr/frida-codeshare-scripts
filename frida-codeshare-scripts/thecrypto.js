
//https://github.com/zengfr/frida-codeshare-scripts
//-592614681 @AnonymousVip/thecrypto
Java.perform(function() {
    function hooking(hook, callback) {
        var Exception = Java.use('java.lang.Exception');
        var toHook;
        try {
            var clazz = hook.clazz;
            var method = hook.method;
            toHook = Java.use(clazz)[method];
            if (!toHook) {
                console.log('[Crypto Monitor] - Cannot find ' + clazz + '.' + method);
                return
            }
        } catch (err) {
            console.log('[Crypto Monitor] - Cannot find ' + clazz + '.' + method);
            return;
        }
        try {
            for (var i = 0; i < toHook.overloads.length; i++) {
                toHook.overloads[i].implementation = function() {
                    var args = [].slice.call(arguments);
                    var retval = this[method].apply(this, arguments);
                    if (callback) {
                        var calledFrom = Exception.$new().getStackTrace().toString().split(',')[1];
                        var to_print = {
                            category: "Crypto",
                            class: clazz,
                            method: method,
                            args: args,
                            returnValue: retval ? retval.toString() : "N/A",
                            calledFrom: calledFrom
                        };
                        retval = callback(retval, to_print);
                    }
                    return retval;
                }

            }
        } catch (err) {
            console.log('[Crypto Monitor] - ERROR: ' + clazz + "." + method + " [\"Error\"] => " + err);
        }
    }
    var hooks = [{
        "clazz": "javax.crypto.spec.SecretKeySpec",
        "method": "$init"
    }, {
        "clazz": "javax.crypto.Cipher",
        "method": "doFinal"
    }, {
        "clazz": "javax.crypto.spec.IvParameterSpec",
        "method": "$init"
    }, {
        "clazz": "java.security.spec.X509EncodedKeySpec",
        "method": "$init"
    }];
    hooks.forEach(function(e) {
        hooking(e, function(realRetval, to_print) {

            console.log('[Crypto Monitor]\n' +
                JSON.stringify(to_print, function(k, v) {
                    if (v instanceof Array)
                        return JSON.stringify(v);
                    return v;
                }, 2) +
                "\n");

            return realRetval;
        });
    });

});
//https://github.com/zengfr/frida-codeshare-scripts
//-592614681 @AnonymousVip/thecrypto
