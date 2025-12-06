
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1547817958 @rparviainen/swift-symmetrickey-dump
/*
 Code to dump symmetric key bytes from Swift apps on iOS using SymmetricKey (https://developer.apple.com/documentation/cryptokit/symmetrickey) by hooking the constructor
 
 Only tested on two apps.
 
 https://github.com/rparviainen/frida-scripts-ios/
 
*/


var someFunc = Module.findExportByName(null, "$s9CryptoKit12SymmetricKeyV4dataACx_tc10Foundation15ContiguousBytesRzlufC");

if (someFunc) {
    console.log("[+] Found $s9CryptoKit12SymmetricKeyV4dataACx_tc10Foundation15ContiguousBytesRzlufC");
    Interceptor.attach(someFunc, {
        onEnter: hooksymmetrickeyenter,
onLeave: hooksymmetrickeyleave
    });
}


function hooksymmetrickeyenter(args) {
console.log("enter")
}


function hooksymmetrickeyleave(args) {
console.log("leave $s9CryptoKit12SymmetricKeyV4dataACx_tc10Foundation15ContiguousBytesRzlufC")
//console.log(JSON.stringify(this.context))

console.log(hexdump(this.context.x0, { offset: 0, length: 64, header: true,ansi: false}));
var p2 = this.context.x0.add(8);
var len = p2.readU16();
console.log("key length (bytes): " + len);
if (len == 8 || len == 16 || len == 32) {
var p2 = this.context.x0.add(24);
var data = new Uint8Array(p2.readByteArray(32));
console.log("key in hex: " + bytesToHex2(data, 32));
} else {
console.log("probably not a key in a recognized format");
}
}

function bytesToHex2(bytes, len) {
  for (var hex = [], i = 0; i < len; i++) {
    hex.push((bytes[i] >>> 4).toString(16));
    hex.push((bytes[i] & 0xF).toString(16));
  }
  return hex.join("");
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1547817958 @rparviainen/swift-symmetrickey-dump
