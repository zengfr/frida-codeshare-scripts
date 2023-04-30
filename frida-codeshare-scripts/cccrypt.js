var operation = {
    0: "kCCEncrypt",
    1: "kCCDecrypt"
}

var algorithms = {
    0: "kCCAlgorithmAES128",
    1: "kCCAlgorithmDES",
    2: "kCCAlgorithm3DES",
    3: "kCCAlgorithmCAST",
    4: "kCCAlgorithmRC4",
    5: "kCCAlgorithmRC2"
}

var options = {
    1: "kCCOptionPKCS7Padding",
    2: "kCCOptionECBMode",
    3: "kCCOptionECBMode with kCCOptionPKCS7Padding"
}

function base64FromArg(arg, length) {
    var data = ObjC.classes.NSData.dataWithBytes_length_(arg, length);
    return data.base64EncodedStringWithOptions_(0).toString();
}

var cccrypt = Module.findExportByName(null, "CCCrypt");

var outData;
var outputLength;

Interceptor.attach(cccrypt, {
    onEnter: function(args) {
        console.log("\n================CCCrypt Analyzer================")

        var op = args[0].toInt32();
        var algo = args[1].toInt32();
        var opt = args[2].toInt32();
        var keySize = args[4].toInt32();
        var key = base64FromArg(args[3], keySize);
        var iv = Memory.readByteArray(args[5], keySize);
        var ivContent = "None";
        var dataLength = args[7].toInt32();
        var dataIn = base64FromArg(args[6], dataLength);
        outData = args[8];
        outputLength = args[9];


        console.log("Operation => ", operation[op]);
        console.log("Algorithm => ", algorithms[algo]);

        var optionName = options[opt];

        if (optionName !== undefined) {
            console.log("Options => ", optionName);
        } else {
            console.log("Options => kCCOptionCBCMode");
        }

        console.log("Key size => ", keySize);
        console.log("Key => ", key);
        if (iv !== null) {
            var data = ObjC.classes.NSData.dataWithBytes_length_(args[5], keySize);
            ivContent = data.base64EncodedStringWithOptions_(0).toString();
        }
        console.log("IV => ", ivContent);
        console.log("Data input => ", dataIn);
    },
    onLeave: function(ret) {
        var len = outputLength.toInt32();
        var data = base64FromArg(outData, len);
        console.log("Data output => ", data);
    }
})
//https://github.com/zengfr/frida-codeshare-scripts
//-6928544 @lateralusd/cccrypt