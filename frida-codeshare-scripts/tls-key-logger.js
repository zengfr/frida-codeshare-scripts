/*
Thanks for Andy Davies inspiration
https://andydavies.me/blog/2019/12/12/capturing-and-decrypting-https-traffic-from-ios-apps/

The code here is using for extract tiktok app sslkey on iOS14.2.1
Callback offset for different iOS system is here

iOS12 #0x2a8
iOS13 #0x2c0
iOS14 #0x2b8
iOS15 #0x2f8

To delay the script running is because the libboringssl.dylib is not loaded when we using frida -f command to spawn the tiktok app
Any question is welcome to fllfxx@icloud.com
*/

var CALLBACK_OFFSET = 0x2b8;

function key_logger(ssl, line) {
    console.log(new NativePointer(line).readCString());
}

function test() {
var key_log_callback = new NativeCallback(key_logger, 'void', ['pointer', 'pointer']);
var SSL_CTX_set_info_callback = Module.findExportByName('libboringssl.dylib', 'SSL_CTX_set_info_callback');

Interceptor.attach(SSL_CTX_set_info_callback, {
    onEnter: function(args) {
       var ssl = new NativePointer(args[0]);
       var callback = new NativePointer(ssl).add(CALLBACK_OFFSET);

        callback.writePointer(key_log_callback);
    }
});
}

Interceptor.attach(ObjC.classes.TTHttpTask["- skipSSLCertificateError"].implementation, {
onEnter: function (args) {

},
onLeave: function (retval) {
retval.replace(0x1);
}
});

Interceptor.attach(ObjC.classes.TTNetworkManager["- ServerCertificate"].implementation, {
onEnter: function (args) {

},
onLeave: function (retval) {
retval.replace(0x0);
}
});

Interceptor.attach(ObjC.classes.TTNetworkManagerChromium["- ServerCertificate"].implementation, {
onEnter: function (args) {

},
onLeave: function (retval) {
retval.replace(0x0);
}
});

// no need
// Interceptor.attach(ObjC.classes.TTNetworkManagerChromium["- setServerCertificate:"].implementation, {
// onEnter: function (args) {
// var sss = ObjC.classes.NSString.stringWithString_("MIIFXDCCBESgAwIBAgIGAYGOKcYoMA0GCSqGSIb3DQEBCwUAMIGyMUMwQQYDVQQDDDpDaGFybGVzIFByb3h5IENBICgyMyBKdW4gMjAyMiwgWW91c3NlZmRlTWFjQm9vay1Qcm8ubG9jYWwpMSUwIwYDVQQLDBxodHRwczovL2NoYXJsZXNwcm94eS5jb20vc3NsMREwDwYDVQQKDAhYSzcyIEx0ZDERMA8GA1UEBwwIQXVja2xhbmQxETAPBgNVBAgMCEF1Y2tsYW5kMQswCQYDVQQGEwJOWjAeFw0yMjA2MjIwMTI1MTFaFw0yMzA2MjIwMTI1MTFaMIGyMUMwQQYDVQQDDDpDaGFybGVzIFByb3h5IENBICgyMyBKdW4gMjAyMiwgWW91c3NlZmRlTWFjQm9vay1Qcm8ubG9jYWwpMSUwIwYDVQQLDBxodHRwczovL2NoYXJsZXNwcm94eS5jb20vc3NsMREwDwYDVQQKDAhYSzcyIEx0ZDERMA8GA1UEBwwIQXVja2xhbmQxETAPBgNVBAgMCEF1Y2tsYW5kMQswCQYDVQQGEwJOWjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAIIRTyl+TdSJ/+/yjWJi7CYC90jhlSoUAG4jRG9rAMWW2Kow/9uBtNJRLT5sRCgDQrJPxuGC2og8ProvglfbxeERrvE6YMXVdJcTBDZqPfR+lfA+iQi/fC6R4R5QfRF4ojX9DYAR9u62DQ6ZA4cMRyugwkQfaFzBzxLeXFpYq/kZLhd20XhtMrX6DRITh+FPKJcY7Ff67vcN5AdoGtOefJxjAKvmuAeDGOFnANQN6cAyKYxCdumFRofKAg82KkNalJD3gbAJwYyOg+SvFa1WQSRGVWemAqwXXBKJeg2CB2nOMqOFHI3WUZ5HBJBpofJRxXNct9y97uYmAjtAnhuY9W0CAwEAAaOCAXQwggFwMA8GA1UdEwEB/wQFMAMBAf8wggEsBglghkgBhvhCAQ0EggEdE4IBGVRoaXMgUm9vdCBjZXJ0aWZpY2F0ZSB3YXMgZ2VuZXJhdGVkIGJ5IENoYXJsZXMgUHJveHkgZm9yIFNTTCBQcm94eWluZy4gSWYgdGhpcyBjZXJ0aWZpY2F0ZSBpcyBwYXJ0IG9mIGEgY2VydGlmaWNhdGUgY2hhaW4sIHRoaXMgbWVhbnMgdGhhdCB5b3UncmUgYnJvd3NpbmcgdGhyb3VnaCBDaGFybGVzIFByb3h5IHdpdGggU1NMIFByb3h5aW5nIGVuYWJsZWQgZm9yIHRoaXMgd2Vic2l0ZS4gUGxlYXNlIHNlZSBodHRwOi8vY2hhcmxlc3Byb3h5LmNvbS9zc2wgZm9yIG1vcmUgaW5mb3JtYXRpb24uMA4GA1UdDwEB/wQEAwICBDAdBgNVHQ4EFgQU09mFvszseWzHrZbi8QYd4Q3efjMwDQYJKoZIhvcNAQELBQADggEBAHvtkKadKVffLXWVP0n0B+mfJxBAzmTGTn+Cva9/9f9z1zAtyhK5NPx5l1CIHLAUiaC2dPc549G9aAPPOUdsFQvOa2cejQubBwwnVfMpdrV2if6mTA1U5mehQ0PbuiZrA7W2GYaNIBDfpMsTVfDX6zlNq8STf4tOIuAIaWVRaULyu01y8Prk+Kg/EI+K8UJwA9UeZPNmuYQaT1EhETgmuuukLfeUBy75ZrCwgEge8mitl4DWPPEdZja/GIu/hyAZrSJ6zVPkq1kB6W5FGmsRjhvM3rJQEhXbUmxkK58CeNvr1di8ayQ4d68RWV1kpx8EuYOx58eYMVVkZ9Qu8zdxFKE=");
// var data = ObjC.classes.NSData.alloc().initWithBase64EncodedString_options_(sss, 0x0);
// var array = ObjC.classes.NSMutableArray.arrayWithArray_(new ObjC.Object(args[2]));
// array.addObject_(data);
// args[2] = array;
// },
// onLeave: function (retval) {

// }
// });

// future plan, find more certification verify logic in tiktok app class dump

setImmediate(function() {
setTimeout(test, 400)
});
//https://github.com/zengfr/frida-codeshare-scripts
//-516916910 @fanglian/tls-key-logger