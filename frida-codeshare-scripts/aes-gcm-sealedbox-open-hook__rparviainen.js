
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:2144391537 @rparviainen/aes-gcm-sealedbox-open-hook
/*
 Code to dump plaintext from Swift apps on iOS using AES.GCM.SealedBox (https://developer.apple.com/documentation/cryptokit/aes/gcm/sealedbox) by hooking the open method.
 
 Dumps the plaintext using built in hexdump, as hex for easy copying and as raw text.

 Relies on the memory layout of the returned Foundation.Data object 
 
 https://github.com/rparviainen/frida-scripts-ios/

*/


function hookAESGCMopen1(){
var someFunc = Module.findExportByName(null, "$s9CryptoKit3AESO3GCMO4open_5using10Foundation4DataVAE9SealedBoxV_AA12SymmetricKeyVtKFZ");
    if (someFunc) {
        console.log("[+] Found $s9CryptoKit3AESO3GCMO4open_5using10Foundation4DataVAE9SealedBoxV_AA12SymmetricKeyVtKFZ");
        Interceptor.attach(someFunc, {
            onEnter: hookAESGCMopenEnter,
onLeave: hookAESGCMopenLeave
        });
    }
}

function hookAESGCMopen2(){
var someFunc = Module.findExportByName(null, "$s9CryptoKit3AESO3GCMO4open_5using14authenticating10Foundation4DataVAE9SealedBoxV_AA12SymmetricKeyVxtKAI0I8ProtocolRzlFZ");
    if (someFunc) {
        console.log("[+] Found $s9CryptoKit3AESO3GCMO4open_5using14authenticating10Foundation4DataVAE9SealedBoxV_AA12SymmetricKeyVxtKAI0I8ProtocolRzlFZ");
        Interceptor.attach(someFunc, {
            onEnter: hookAESGCMopenEnter,
onLeave: hookAESGCMopenLeave
        });
    }
}


function hookAESGCMopenEnter(args) {
console.log("enter 1");
}



function bytesToHex2(bytes, len) {
  for (var hex = [], i = 0; i < len; i++) {
    hex.push((bytes[i] >>> 4).toString(16));
    hex.push((bytes[i] & 0xF).toString(16));
  }
  return hex.join("");
}


function hookAESGCMopenLeave(args) {
console.log("leave 1")
//console.log(JSON.stringify(this.context))

// Debug
// console.log(hexdump(this.context.x1, { offset: 0, length: 32, header: true, ansi: false }));
// Data object is returned via the x1 register. Pointer to slice is 16 bytes in: 
var p2 = this.context.x1.add(16);
// Debug
// console.log(hexdump(p2, { offset: 0, length: 16, header: true, ansi: false }));
// Slice
var p3 = p2.readPointer();
// length of data is at p4
var p4 = p2.add(8);
// read length
var len = p4.readU16();
console.log("buffer length: " + len);
// dump buffer - should be plaintext
console.log(hexdump(p3, { offset: 0, length: len, header: true, ansi: false }));
var data = new Uint8Array(p3.readByteArray(len));
// dump buffer as hex string for easy copy&paste- should be plaintext
console.log(bytesToHex2(data, len));
// dump buffer as string as well by converting via NSString
var nsd = nsdata(p3, len)
var nss = nsdata2nsstr(nsd)
console.log(nss);
}

function nsdata2nsstr(nsdata) {
    return ObjC.classes.NSString.alloc().initWithData_encoding_(nsdata, 4);
}

function nsdata(b, len) {
    return ObjC.classes.NSData.alloc().initWithBytes_length_(b, len);
}

hookAESGCMopen1();
hookAESGCMopen2();
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:2144391537 @rparviainen/aes-gcm-sealedbox-open-hook
