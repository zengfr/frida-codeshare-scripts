
//https://github.com/zengfr/frida-codeshare-scripts
//-455154755 @minacrissdev/mac-mojave-ssl-bypass
var tls_helper_create_peer_trust;



/* OSStatus nw_tls_create_peer_trust(tls_handshake_t hdsk, bool server, SecTrustRef *trustRef); */
tls_helper_create_peer_trust = new NativeFunction(
Module.findExportByName(null, "nw_tls_create_peer_trust"),
'int', ['pointer', 'bool', 'pointer']
);

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
//https://github.com/zengfr/frida-codeshare-scripts
//-455154755 @minacrissdev/mac-mojave-ssl-bypass
