
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-79556905 @federicodotta/okhttp-hostname-verifier-bypass
/* 
 *  Description: OkHttp Hostname Verifier bypass
 *  Authors:  @apps3c
 */

setTimeout(function() {

    Java.perform(function() {
        
        var HostnameVerifierInterface = Java.use('javax.net.ssl.HostnameVerifier')
        const MyHostnameVerifier = Java.registerClass({
          name: 'org.dummyPackage.MyHostnameVerifier',
          implements: [HostnameVerifierInterface],
          methods: {  
            verify: [{
              returnType: 'boolean',
              argumentTypes: ['java.lang.String', 'javax.net.ssl.SSLSession'],
              implementation(hostname, session) {
                console.log('[+] Hostname verification bypass');
                return true;
              }
            }],      
          }
        });

        var hostnameVerifierRef = Java.use('okhttp3.OkHttpClient')['hostnameVerifier'].overload();
        hostnameVerifierRef.implementation = function() {            
            return MyHostnameVerifier.$new();
        }
        console.log("[+] Hostname verifier replaced")

    });
    
}, 0);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-79556905 @federicodotta/okhttp-hostname-verifier-bypass
