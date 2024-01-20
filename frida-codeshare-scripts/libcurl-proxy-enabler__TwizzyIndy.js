
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:273757828 @TwizzyIndy/libcurl-proxy-enabler
/* 
    libcurl proxy enabler v0.1
    Github: https://github.com/TwizzyIndy/libcurl-proxy-enabler
    
    frida -n SomeApp.exe -l index.js
*/

var curl_easy_setopt = Module.findExportByName("libcurl.dll", "curl_easy_setopt");
console.log(curl_easy_setopt);

var curl_easy_perform = Module.findExportByName("libcurl.dll", "curl_easy_perform");
console.log(curl_easy_perform);

// in my case, it was Fiddler
const PROXY_ADDRESS = 'https://127.0.0.1:8888'
const CURLOPT_PROXY = 10004

Interceptor.attach(curl_easy_perform, {
    onEnter: function(args) {
        console.log('curl_easy_perform: ');
        console.log('arg0: ' + args[0].toString());
        
        var curl_easy_setoptCall = new NativeFunction(
            curl_easy_setopt, 'int', ['pointer', 'uint32', 'uint32']
            );
        
        const proxyAddr = Memory.allocAnsiString(PROXY_ADDRESS);
        
        // 43 = CURLE_BAD_FUNCTION_ARGUMENT
        // 0 = CURLE_OK
        var result = curl_easy_setoptCall(
            args[0], CURLOPT_PROXY, proxyAddr.toInt32()
        );
        
        console.log('result : ' + result.toString());
        console.log('');
    }
})
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:273757828 @TwizzyIndy/libcurl-proxy-enabler
