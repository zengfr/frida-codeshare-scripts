
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1299658813 @padmadl/ecb-algojs
//python3 frida -f com.test.sampleiOS -U -l ~/Downloads/algo.js

const libraryName = "libcommonCrypto.dylib";
const functionName = "CCCryptorCreate";

const CCCryptorCreatePtr = Module.findExportByName(libraryName, functionName);

if (CCCryptorCreatePtr !== null) {
    console.log("[*] Hooking " + functionName);

    Interceptor.attach(CCCryptorCreatePtr, {
        onEnter: function(args) {
            console.log("[*] Intercepted CCCryptorCreate");
            //console.log(args[1].toInt32());
            //console.log(args[2].toInt32());
            if (args[1].toInt32() == 0 && args[2].toInt32() == 2) {
                console.log("Algorithm used is kCCAlgorithmAES128 and used in kCCOptionECBMode")
            }
        },
        onLeave: function(retval) {
            //console.log("[*] CCCryptorCreate returned:", retval);
        }
    });
} else {
    console.log("[-] Unable to find " + functionName + " function to hook.");
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1299658813 @padmadl/ecb-algojs
