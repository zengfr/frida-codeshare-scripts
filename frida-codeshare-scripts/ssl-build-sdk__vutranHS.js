
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1095937718 @vutranHS/ssl-build-sdk
/*  Android ssl certificate pinning bypass script for various methods
by Maurizio Siddu

Run with:
frida -U -f [APP_ID] -l frida_multiple_unpinning.js --no-pause
*/

setTimeout(function() {
  Java.perform(function() {
    console.log('');
    console.log('======');
    console.log('[#] Android Bypass for various Certificate Pinning methods [#]');
    console.log('======');
    
      var ver = Java.use('android.os.Build$VERSION');
      //console.log("Version before: "+ver.SDK_INT.value);
      ver.SDK_INT.value = 15;

    var sslEncrypt = Java.use('com.lpb.lienviet24h.util.ha');
    sslEncrypt.b.overload('java.lang.String','java.lang.String').implementation = function(a, b) {
      console.log('ENCRYPTTTTTTTTTTTTTTTTTTTTTT' + b);
      console.log('RETURNNNNNNNNNNNNNNNNN', this.b(a,b));
      return this.b(a, b);

    }


    var sslEncrypt1 = Java.use('com.lpb.lienviet24h.util.ha');
    sslEncrypt1.e.overload('java.lang.String').implementation = function(a) {
      console.log('ENCRYPTTTTTTTTTTTTTTTTTTTTTT' + a);
      console.log('RETURNNNNNNNNNNNNNNNNN', this.e(a));
      return this.e(a);

    }


    var sslEncrypt2 = Java.use('com.lpb.lienviet24h.util.ha');
    sslEncrypt2.f.overload('java.lang.String').implementation = function(a) {
      console.log('ENCRYPTTTTTTTTTTTTTTTTTTTTTT' + a);
      console.log('RETURNNNNNNNNNNNNNNNNN', this.f(a));
      return this.f(a);

    }

    try {
      // Bypass TrustManagerImpl (Android > 7) {1}
      var array_list = Java.use("java.util.ArrayList");
      var TrustManagerImpl_Activity_1 = Java.use('com.android.org.conscrypt.TrustManagerImpl');
      TrustManagerImpl_Activity_1.checkTrustedRecursive.implementation = function(certs, ocspData, tlsSctData, host, clientAuth, untrustedChain, trustAnchorChain, used) {
        console.log('[+] Bypassing TrustManagerImpl (Android > 7) checkTrustedRecursive check: ' + host);
        return array_list.$new();
      };
    } catch (err) {
      console.log('[-] TrustManagerImpl (Android > 7) checkTrustedRecursive check not found');
      //console.log(err);
    }
    try {
      // Bypass TrustManagerImpl (Android > 7) {2} (probably no more necessary)
      var TrustManagerImpl_Activity_2 = Java.use('com.android.org.conscrypt.TrustManagerImpl');
      TrustManagerImpl_Activity_2.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
        console.log('[+] Bypassing TrustManagerImpl (Android > 7) verifyChain check: ' + host);
        return untrustedChain;
      };
    } catch (err) {
      console.log('[-] TrustManagerImpl (Android > 7) verifyChain check not found');
      //console.log(err);
    }



  });

}, 0);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1095937718 @vutranHS/ssl-build-sdk
