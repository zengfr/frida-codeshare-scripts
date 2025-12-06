
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1019414376 @YasarKah/viber-26-6-4-0-ssl-pinning
/* 
    Android Viber 26.6.4.0 SSL certificate pinning
by Yasar Kahramaner

Run with:
frida -U -f com.viber.voip -l viber-26-6-4-0-ssl-pinning.js
*/

Java.perform(() => {
    const B = Java.use('org.chromium.net.impl.CronetEngineBuilderImpl');
    B.addPublicKeyPins.overloads.forEach(o => {
        o.implementation = function(host, set, enforce, date) {
            console.log('skip pins for', host);
            return this;
        };
    });

    B.enablePublicKeyPinningBypassForLocalTrustAnchors
        .overload('boolean')
        .implementation = function(_) {
            console.log('force bypass local trust anchors');
            return this.enablePublicKeyPinningBypassForLocalTrustAnchors(true);
        };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1019414376 @YasarKah/viber-26-6-4-0-ssl-pinning
