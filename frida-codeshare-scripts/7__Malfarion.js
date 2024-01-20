
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1466325343 @Malfarion/7
setTimeout(function(){
Java.perform(function(){
console.log("Loaded!!");

var req = Java.use("okhttp3.Request");

req.method.overload().implementation = function(){
var ret = req.method.overload().call(this);
console.log(" -- Method -- ");
if (ret != null)
console.log(ret.toString());
console.log("--------------");
return ret;
}

req.url.overload().implementation = function(){
var ret = req.url.overload().call(this);
console.log(" -- url -- ");
if (ret != null)
console.log(ret.toString());
console.log("--------------");
return ret;
}

req.headers.overload().implementation = function(){
var ret = req.headers.overload().call(this);
console.log(" -- headers -- ");
if (ret != null)
console.log(ret.toString());
console.log("--------------");
return ret;
}


var rb = Java.use("okhttp3.RequestBody");
rb.create.overload('okhttp3.MediaType', 'java.lang.String').implementation = function(mtype, str){
console.log(" -- body --");
console.log("Type: "+mtype);
console.log("String: "+str);
console.log("--------------");
var ret = rb.create.overload('okhttp3.MediaType', 'java.lang.String').call(this, mtype, str);
return ret;
}

rb.create.overload('okhttp3.MediaType', 'okio.ByteString').implementation = function(mtype, str){
console.log(" -- body --");
console.log("Type: "+mtype);
console.log("Byte-String: "+str.toString());
console.log("--------------");
var ret = rb.create.overload('okhttp3.MediaType', 'okio.ByteString').call(this, mtype, str);
return ret;
}

rb.create.overload('okhttp3.MediaType', '[B', 'int', 'int').implementation = function(mtype, bytes, offset, bytecount){
console.log(" -- body --");
console.log("Type: "+mtype);
var buffer = Java.array('byte', bytes);
var result = "";
//for(var i = offset; i < bytecount; ++i){
//result+= (String.fromCharCode(buffer[i]));
//}
console.log("Bytes: " + result);
console.log("--------------");
var ret = rb.create.overload('okhttp3.MediaType', '[B', 'int', 'int').call(this, mtype, bytes, offset, bytecount);
return ret;
}

rb.create.overload('okhttp3.MediaType', 'java.io.File').implementation = function(mtype, file){
console.log(" -- body --");
console.log("Type: "+mtype);
console.log("File: "+file.toString());
console.log("--------------");
var ret = rb.create.overload('okhttp3.MediaType', 'java.io.File').call(this, mtype, file);
return ret;
}

rb.create.overload('okhttp3.MediaType', '[B').implementation = function(mtype, bytes){
console.log(" -- body --");
console.log("Type: "+mtype);
var buffer = Java.array('byte', bytes);
var result = "";
//for(var i = 0; i < buffer.length; ++i){
//result+= (String.fromCharCode(buffer[i]));
//}
console.log("Bytes: " + result);
console.log("--------------");
var ret = rb.create.overload('okhttp3.MediaType', '[B').call(this, mtype, bytes);
return ret;
}

var resp = Java.use("okhttp3.Response");
resp.message.overload().implementation = function(){
var ret = resp.message.overload.call(this);
console.log("Message from Response: "+message);
return ret;
}

// in case returned but never used
Java.choose("okhttp3.Headers" , {
  onMatch : function(instance){ //This function will be called for every instance found by frida
console.log("Found instance: "+instance.toString());
  },
  onComplete:function(){console.log("Scan Completed");}
});
});
},2000);

setTimeout(function() {
    Java.perform(function () {
 
var okhttp3_CertificatePinner_class = null;
try {
            okhttp3_CertificatePinner_class = Java.use('okhttp3.CertificatePinner');    
        } catch (err) {
            console.log('[-] OkHTTPv3 CertificatePinner class not found. Skipping.');
            okhttp3_CertificatePinner_class = null;
        }
 
        if(okhttp3_CertificatePinner_class != null) {
 
        try{
            okhttp3_CertificatePinner_class.check.overload('java.lang.String', 'java.util.List').implementation = function (str,list) {
                console.log('[+] Bypassing OkHTTPv3 1: ' + str);
                return true;
            };
            console.log('[+] Loaded OkHTTPv3 hook 1');
        } catch(err) {
        console.log('[-] Skipping OkHTTPv3 hook 1');
        }
 
        try{
            okhttp3_CertificatePinner_class.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function (str,cert) {
                console.log('[+] Bypassing OkHTTPv3 2: ' + str);
                return true;
            };
            console.log('[+] Loaded OkHTTPv3 hook 2');
        } catch(err) {
        console.log('[-] Skipping OkHTTPv3 hook 2');
        }
 
        try {
            okhttp3_CertificatePinner_class.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function (str,cert_array) {
                console.log('[+] Bypassing OkHTTPv3 3: ' + str);
                return true;
            };
            console.log('[+] Loaded OkHTTPv3 hook 3');
        } catch(err) {
        console.log('[-] Skipping OkHTTPv3 hook 3');
        }
 
        try {
            okhttp3_CertificatePinner_class['check$okhttp'].implementation = function (str,obj) {
            console.log('[+] Bypassing OkHTTPv3 4 (4.2+): ' + str);
        };
        console.log('[+] Loaded OkHTTPv3 hook 4 (4.2+)');
    } catch(err) {
        console.log('[-] Skipping OkHTTPv3 hook 4 (4.2+)');
        }
 
}
 
});
    
}, 0);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1466325343 @Malfarion/7
