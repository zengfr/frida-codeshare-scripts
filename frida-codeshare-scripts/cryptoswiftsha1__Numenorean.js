
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:27237063 @Numenorean/cryptoswiftsha1
console.log("[+] script started...")
if (ObjC.available) {
    if (Process.isDebuggerAttached() === true) {
        console.log("[+] Debugger attached, in addition to Frida.");
    }
    var a = Process.arch.toString()
sha1Func()
    console.log("[+] Device chip: " + a);

    
} else {
    console.log("[+] Objective-C Runtime not available!");
}
console.log("[+] ...script completed")



function sha1Func(){
var sha1 = Module.findExportByName(null, "$sSS11CryptoSwiftE4sha1SSyF");

    if (sha1) {
        console.log("[+] Found sha1: " + sha1);
        Interceptor.attach(sha1, {
            onEnter: hookSha1,

onLeave: function (retval) {
console.log("=====================================")
}
        });
    }
}


function hookSha1(args) {
console.log("=================SHA1=================")
    // String is parsed by value
    let ptr1 = args[0];
    let ptr2 = args[1];

     
    let ptr1hex = '0x' + ptr1.toString(16);
    let ptr2hex = '0x' + ptr2.toString(16);

    let ptr1value = BigInt(ptr1hex);
    let ptr2value = BigInt(ptr2hex);
    let smallObject = ptr2value & 0xFFn; // the last byte
    
    // first, try parse smallstring
    if (isSmallString(smallObject)) {
        let smallStr = new SDSwiftSmallString(ptr1hex, ptr2hex);
        console.log(`${smallStr.desc()}`)
return
    }
    
    // Large String
    let largeStr = new SDSwiftLargeString(ptr1value, ptr2value);
    console.log(`${largeStr.desc()}`)
}


function isSmallString(value) {
    let smth = (value >> 4n) & 0xFn;
    return (smth & 2n) > 0n;
}


class SDSwiftSmallString { 
    strValue;
    count;
    isHex;
    constructor(h1, h2) {
        // max small string length is 15 bytes
        let h1Array = hexStrToUIntArray(h1).reverse();
        let h2Array = hexStrToUIntArray(h2).reverse();
        function isValidChar(element, index, array) { 
            return (element > 0); 
        }
        let dataArr = h1Array.concat(h2Array).slice(0, 15);
        
        let data = dataArr.filter(isValidChar);
        let str = String.fromCharCode.apply(null, data);
        if (isPrintableString(str)) {
            this.strValue = str;
            this.count = str.length;
            this.isHex = false;
        } else {
            this.strValue = uintArrayToHexStr(dataArr)
            this.count = dataArr.length;
            this.isHex = true;
        }
        
    }

    desc() {
        let hexTip = this.isHex ? "hex" : "str";
        return `<Swift.String(Small), count=${this.count}, ${hexTip}='${this.strValue}'>`;
    }
}


class SDSwiftLargeString {
    // https://github.com/TannerJin/Swift-MemoryLayout/blob/master/SwiftCore/String.swift

    _countAndFlagsBits;
    _object;

    isASCII;
    isNFC;
    isNativelyStored;
    isTailAllocated;

    count;
    strValue;

    constructor(inCountAndFlag, inObject) {
        this._countAndFlagsBits = inCountAndFlag;
        this._object = inObject;

        // 1. parse _countAndFlagsBits
        let abcd = inCountAndFlag >> 48n >> 12n & 0xFn; // 16bits, 2bytes
        this.isASCII = (abcd & 0x8n) > 0n;
        this.isNFC = (abcd & 0x4n) > 0n;
        this.isNativelyStored = (abcd & 0x2n) > 0n;
        this.isTailAllocated = (abcd & 0x1n) > 0n;

        this.count = inCountAndFlag & 0xFFFFFFFFFFFFn ; // 48bits,6bytes

        // 2. parse _object
        let objectFlag = inObject >> 56n & 0xFFn;
        let strAddress = '0x' + (inObject & 0xFFFFFFFFFFFFFFn).toString(16); // low 56 bits
        
        let strPtr = new NativePointer(strAddress);
        let cstrPtr = strPtr.add(32);
        this.strValue = cstrPtr.readCString() ?? "";
    }

    desc() {
        return `<Swift.String(Large), count=${this.count}, str='${this.strValue}'>`;
    }
}


function isPrintableChar(val) {
    // [A-Za-z0-9_$ ]
    //0-9  0x30-0x39
    //A-Z  0x41-0x5a
    //a-z  97-122
    //0x5f 0x24 0x20
    let isNumber = (val >= 0x30 && val <= 0x39);
    let isUpper = (val >= 0x41 && val <= 0x5a);
    let isLower = (val >= 0x61 && val <= 0x7a);
    let isSpecial = (val == 0x5f) || (val == 0x24) || (val == 0x20);
    return isNumber || isUpper || isLower || isSpecial;
}

function isPrintableString(str) {
    for(var i = 0; i < str.length; i++) {
        let val = str.charCodeAt(i);
        if (!isPrintableChar(val)) {
            return false;
        }
    }
    return true;
}


function hexString(str) {
    var ret = "0x";
    for(var i = 0; i < str.length; i++) {
        let val = str.charCodeAt(i);
        var valstr = val.toString(16);
        if (valstr.length == 1) {
            valstr = '0' + valstr;
        }
        ret = ret + valstr;
    }
    return ret;
}

function readUCharHexString(ptr, maxlen) {
    var idx = 0;
    var hexStr = "";
    while (true) {
        let val = ptr.add(idx).readU8()
        if (val == 0) {
            break;
        }
        var valstr = val.toString(16);
        if (valstr.length == 1) {
            valstr = '0' + valstr;
        }
        hexStr += valstr;
        idx++;
        if (idx >= maxlen) {
            break;
        }
    }

    if (hexStr.length > 0) {
        hexStr = "0x" + hexStr;
    }

    return hexStr;
}

function swapInt16(val) {
    return ((val & 0xff) << 8) | ((val >> 8) & 0xff);
}

function swapInt32(val) {
    return (
        ((val & 0xff) << 24) |
        ((val & 0xff00) << 8) |
        ((val & 0xff0000) >> 8) |
        ((val >> 24) & 0xff)
    );
}

function hexStrToUIntArray(inputStr) {
    var str = inputStr
    if (str.startsWith('0x')) {
        str = str.substr(2);
    }
    var hex = str.toString();
    var result = [];
    for (var n = 0; n < hex.length; n += 2) {
        result.push(parseInt(hex.substr(n, 2), 16));
    }
    return result;
}
  
function uintArrayToHexStr(array) {
    var str = "";

    for (var n = 0; n < array.length; n += 1) {
        let val = array[n];
        var valstr = array[n].toString(16);
        if (valstr.length == 1) {
            valstr = '0' + valstr;
        }
        str += valstr;
    }
    if (str.length > 0) {
        str = "0x" + str;
    }
    return str;
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:27237063 @Numenorean/cryptoswiftsha1
