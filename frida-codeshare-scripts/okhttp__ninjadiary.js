
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1705654916 @ninjadiary/okhttp
/*
Author: secretdiary.ninja
License: (CC BY-SA 4.0) 
 * */

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
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1705654916 @ninjadiary/okhttp
