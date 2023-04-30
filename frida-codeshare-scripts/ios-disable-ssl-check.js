ObjC.schedule(ObjC.mainQueue, function() {
    var version = ObjC.classes.UIDevice.currentDevice().systemVersion().toString();
    var mainVersion = parseInt(version.split('.')[0]);
    var fname = 'nw_tls_create_peer_trust';
    if (mainVersion < 11) {
        fname = 'tls_helper_create_peer_trust';
    }
    var hookFucntion = Module.findExportByName(null, fname);

    Interceptor.replace(hookFucntion, new NativeCallback(function(hdsk, server, trustRef) {
        console.log('[i] ' + fname + ' invoked!');
        return ptr(0);
    }, 'int', ['pointer', 'bool', 'pointer']));
});
//https://github.com/zengfr/frida-codeshare-scripts
//-1972218842 @SYM01/ios-disable-ssl-check