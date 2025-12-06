
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1592974393 @padmadl/null-vector-cbcmode
//python3 frida -f com.test.sampleiOS -U -l ~/Downloads/null.js

const libraryName = "libcommonCrypto.dylib";
const functionName = "CCCrypt";

const CCCryptCreatePtr = Module.findExportByName(libraryName, functionName);

if (CCCryptCreatePtr !== null) {
    console.log("[*] Hooking " + functionName);

    Interceptor.attach(CCCryptCreatePtr, {
        onEnter: function(args) {
this.op = args[0].toInt32(); // 0 = Encrypt, 1 = Decrypt
        this.dataIn = args[6];
        this.dataInLength = args[7].toInt32();
        this.dataOut = args[8];
            console.log("[*] Intercepted CCCryptCreate");
            //console.log(args[1].toInt32());
            //console.log(args[2].toInt32());
            if (args[1].toInt32() == 0){
                if (args[2].toInt32() == 1 || args[2].toInt32() == 3 ) {
                var iv = Memory.readByteArray(args[5], 16);
if (iv == null) {
//console.log(args[2].toInt32());
console.log("mode is kCCOptionPKCS7Padding of CBC used and iv is null");

}
            } 
            }
           
        },
        onLeave: function(retval) {
            console.log("[*] CCCryptorCreate returned:", retval);
    if (this.op === 0) {
               // Encrypting - we capture plaintext input
               var plaintext = Memory.readByteArray(this.dataIn, this.dataInLength);
               console.log("Plaintext input:", hexdump(plaintext));
           }
        }
    });
} else {
    console.log("[-] Unable to find " + functionName + " function to hook.");
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1592974393 @padmadl/null-vector-cbcmode
