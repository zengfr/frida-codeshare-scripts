
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-12884885 @dki/ios10-ssl-bypass
// translation of https://github.com/nabla-c0d3/ssl-kill-switch2/blob/master/SSLKillSwitch/SSLKillSwitch.m for iOS 10/11

var tls_helper_create_peer_trust;
var version = ObjC.classes.UIDevice.currentDevice().systemVersion().toString();

if (version.startsWith("11.")) { // iOS 11
/* OSStatus nw_tls_create_peer_trust(tls_handshake_t hdsk, bool server, SecTrustRef *trustRef); */
tls_helper_create_peer_trust = new NativeFunction(
Module.findExportByName(null, "nw_tls_create_peer_trust"),
'int', ['pointer', 'bool', 'pointer']
);
} else if (version.startsWith("10.")) { // iOS 10
/* OSStatus tls_helper_create_peer_trust(tls_handshake_t hdsk, bool server, SecTrustRef *trustRef); */
    tls_helper_create_peer_trust = new NativeFunction(
    Module.findExportByName(null, "tls_helper_create_peer_trust"),
    'int', ['pointer', 'bool', 'pointer']
    );
} else {
console.log("Unsupported OS version!");
}

var errSecSuccess = 0;

function bypassSSL() {
    Interceptor.replace(tls_helper_create_peer_trust, new NativeCallback(function(hdsk, server, trustRef) {
        return errSecSuccess;
    }, 'int', ['pointer', 'bool', 'pointer']));
    console.log("SSL certificate validation bypass active");
}

function revertSSL() {
    Interceptor.revert(tls_helper_create_peer_trust);
    console.log("SSL certificate validation bypass disabled");
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-12884885 @dki/ios10-ssl-bypass
