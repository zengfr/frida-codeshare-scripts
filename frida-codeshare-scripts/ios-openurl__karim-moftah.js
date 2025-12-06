
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:806619367 @karim-moftah/ios-openurl
if (ObjC.available) {
    var UIApplication = ObjC.classes.UIApplication;

    function tryAttach(methodName, label) {
        var m = UIApplication[methodName];
        if (!m) {
            console.log('[*] ' + methodName + ' not found on UIApplication');
            return;
        }
        Interceptor.attach(m.implementation, {
            onEnter: function(args) {
                try {
                    // args[0] = self, args[1] = _cmd, args[2] = NSURL *
                    if (args[2].isNull()) {
                        console.log(label + ' called with NULL url');
                        return;
                    }
                    var url = new ObjC.Object(args[2]);
                    // absoluteString is the most reliable readable form
                    var s = (typeof url.absoluteString === 'function') ? url.absoluteString().toString() : url.toString();
                    console.log(label + ' -> ' + s);
                } catch (e) {
                    console.log(label + ' -> error reading url: ' + e);
                }
            }
        });
        console.log('[*] Attached to UIApplication ' + methodName);
    }

    tryAttach('- openURL:', '[openURL:]');
    tryAttach('- openURL:options:completionHandler:', '[openURL:options:completionHandler:]');

} else {
    console.log('Objective-C runtime is not available!');
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:806619367 @karim-moftah/ios-openurl
