
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:2104222128 @0tax00/ios-nsuserdefaultshook
var NSUserDefaults = ObjC.classes.NSUserDefaults;

if (NSUserDefaults) {
    function isInteresting(key, value) {
        var keyLower = key.toLowerCase();
        var valueStr = value.toString();

        var sensitiveWords = [
            'token', 'password', 'secret', 'key', 'auth', 'credential',
            'user', 'login', 'session', 'cookie', 'jwt', 'bearer',
            'server', 'url', 'endpoint', 'api', 'config', 'setting',
            'id', 'email', 'phone', 'name', 'address', 'card', 'bank'
        ];

        for (var i = 0; i < sensitiveWords.length; i++) {
            if (keyLower.indexOf(sensitiveWords[i]) !== -1) {
                return true;
            }
        }

        if (valueStr.length > 20 && (
                valueStr.indexOf('eyJ') === 0 ||
                valueStr.indexOf('http') !== -1 ||
                valueStr.indexOf('@') !== -1 ||
                valueStr.indexOf('{') !== -1 ||
                valueStr.match(/^[A-Za-z0-9+/=]+$/)
            )) {
            return true;
        }

        return false;
    }

    var setObjectForKey = NSUserDefaults['- setObject:forKey:'];
    if (setObjectForKey) {
        Interceptor.attach(setObjectForKey.implementation, {
            onEnter: function(args) {
                var key = ObjC.Object(args[3]).toString();
                var value = ObjC.Object(args[2]).toString();

                if (isInteresting(key, value)) {
                    console.log("[SET] " + key + " = " + value);
                }
            }
        });
    }

    var dictionaryRepresentation = NSUserDefaults['- dictionaryRepresentation'];
    if (dictionaryRepresentation) {
        Interceptor.attach(dictionaryRepresentation.implementation, {
            onLeave: function(retval) {
                if (retval && !retval.isNull()) {
                    var dict = ObjC.Object(retval);
                    var enumerator = dict.keyEnumerator();

                    console.log("\n[NSUserDefaults]");
                    while (true) {
                        var key = enumerator.nextObject();
                        if (!key || key.isNull()) break;

                        var keyStr = key.toString();
                        var value = dict.objectForKey_(key);
                        var valueStr = value.toString();

                        if (isInteresting(keyStr, valueStr)) {
                            console.log(keyStr + " = " + valueStr);
                        }
                    }
                }
            }
        });
    }
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:2104222128 @0tax00/ios-nsuserdefaultshook
