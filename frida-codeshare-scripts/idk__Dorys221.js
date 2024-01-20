
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1034604524 @Dorys221/idk
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

Interceptor.attach(ObjC.classes.TTNetworkManagerChromium["- setServerCertificate:"].implementation, {
onEnter: function (args) {
var sss = ObjC.classes.NSString.stringWithString_("MIIFXDCCBESgAwIBAgIGAYGOKcYoMA0GCSqGSIb3DQEBCwUAMIGyMUMwQQYDVQQDDDpDaGFybGVzIFByb3h5IENBICgyMyBKdW4gMjAyMiwgWW91c3NlZmRlTWFjQm9vay1Qcm8ubG9jYWwpMSUwIwYDVQQLDBxodHRwczovL2NoYXJsZXNwcm94eS5jb20vc3NsMREwDwYDVQQKDAhYSzcyIEx0ZDERMA8GA1UEBwwIQXVja2xhbmQxETAPBgNVBAgMCEF1Y2tsYW5kMQswCQYDVQQGEwJOWjAeFw0yMjA2MjIwMTI1MTFaFw0yMzA2MjIwMTI1MTFaMIGyMUMwQQYDVQQDDDpDaGFybGVzIFByb3h5IENBICgyMyBKdW4gMjAyMiwgWW91c3NlZmRlTWFjQm9vay1Qcm8ubG9jYWwpMSUwIwYDVQQLDBxodHRwczovL2NoYXJsZXNwcm94eS5jb20vc3NsMREwDwYDVQQKDAhYSzcyIEx0ZDERMA8GA1UEBwwIQXVja2xhbmQxETAPBgNVBAgMCEF1Y2tsYW5kMQswCQYDVQQGEwJOWjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAIIRTyl+TdSJ/+/yjWJi7CYC90jhlSoUAG4jRG9rAMWW2Kow/9uBtNJRLT5sRCgDQrJPxuGC2og8ProvglfbxeERrvE6YMXVdJcTBDZqPfR+lfA+iQi/fC6R4R5QfRF4ojX9DYAR9u62DQ6ZA4cMRyugwkQfaFzBzxLeXFpYq/kZLhd20XhtMrX6DRITh+FPKJcY7Ff67vcN5AdoGtOefJxjAKvmuAeDGOFnANQN6cAyKYxCdumFRofKAg82KkNalJD3gbAJwYyOg+SvFa1WQSRGVWemAqwXXBKJeg2CB2nOMqOFHI3WUZ5HBJBpofJRxXNct9y97uYmAjtAnhuY9W0CAwEAAaOCAXQwggFwMA8GA1UdEwEB/wQFMAMBAf8wggEsBglghkgBhvhCAQ0EggEdE4IBGVRoaXMgUm9vdCBjZXJ0aWZpY2F0ZSB3YXMgZ2VuZXJhdGVkIGJ5IENoYXJsZXMgUHJveHkgZm9yIFNTTCBQcm94eWluZy4gSWYgdGhpcyBjZXJ0aWZpY2F0ZSBpcyBwYXJ0IG9mIGEgY2VydGlmaWNhdGUgY2hhaW4sIHRoaXMgbWVhbnMgdGhhdCB5b3UncmUgYnJvd3NpbmcgdGhyb3VnaCBDaGFybGVzIFByb3h5IHdpdGggU1NMIFByb3h5aW5nIGVuYWJsZWQgZm9yIHRoaXMgd2Vic2l0ZS4gUGxlYXNlIHNlZSBodHRwOi8vY2hhcmxlc3Byb3h5LmNvbS9zc2wgZm9yIG1vcmUgaW5mb3JtYXRpb24uMA4GA1UdDwEB/wQEAwICBDAdBgNVHQ4EFgQU09mFvszseWzHrZbi8QYd4Q3efjMwDQYJKoZIhvcNAQELBQADggEBAHvtkKadKVffLXWVP0n0B+mfJxBAzmTGTn+Cva9/9f9z1zAtyhK5NPx5l1CIHLAUiaC2dPc549G9aAPPOUdsFQvOa2cejQubBwwnVfMpdrV2if6mTA1U5mehQ0PbuiZrA7W2GYaNIBDfpMsTVfDX6zlNq8STf4tOIuAIaWVRaULyu01y8Prk+Kg/EI+K8UJwA9UeZPNmuYQaT1EhETgmuuukLfeUBy75ZrCwgEge8mitl4DWPPEdZja/GIu/hyAZrSJ6zVPkq1kB6W5FGmsRjhvM3rJQEhXbUmxkK58CeNvr1di8ayQ4d68RWV1kpx8EuYOx58eYMVVkZ9Qu8zdxFKE=");
var data = ObjC.classes.NSData.alloc().initWithBase64EncodedString_options_(sss, 0x0);
var array = ObjC.classes.NSMutableArray.arrayWithArray_(new ObjC.Object(args[2]));
array.addObject_(data);
args[2] = array;
},
onLeave: function (retval) {

}
});

console.log('Successfully Initalized SSL Bypass...');
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1034604524 @Dorys221/idk
