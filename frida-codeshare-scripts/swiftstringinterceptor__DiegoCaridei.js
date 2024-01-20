
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-647652185 @DiegoCaridei/swiftstringinterceptor
// Function to reverse a string
function reverseString(str) {
    // Split the string into an array of characters, reverse the array, and join it back into a string
    return str.split('').reverse().join('');
}

// Function to convert a hexadecimal string to a reversed string
function hexToString(hex) {
    let str = '';
    // Iterate over the hex string in chunks of 2 characters
    for (let i = 0; i < hex.length; i += 2) {
        // Convert each pair of hex characters to a decimal value and then to a character
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    // Reverse the resulting string
    return reverseString(str);
}

// Function to convert a string to a reversed hexadecimal string with '0x' prefix
function stringToHex(str) {
    // Reverse the input string
    let reversedStr = reverseString(str);
    let hexString = '';
    // Iterate over each character in the reversed string
    for (let i = 0; i < reversedStr.length; i++) {
        // Convert each character to its UTF-16 code unit and then to a hex string
        let hex = reversedStr.charCodeAt(i).toString(16);
        // Ensure each hex value has two digits
        hexString += hex.padStart(2, '0');
    }
    // Return the hex string with '0x' prefix
    return '0x' + hexString;
}

function replaceString(nameOfTheFunction, newString) {
    var someFunc = Module.findExportByName(null, nameOfTheFunction);
    Interceptor.attach(someFunc, {
        onEnter: function(args) {
            var toStringAddr = Module.findExportByName("libswiftFoundation.dylib", "$sSS21_builtinStringLiteral17utf8CodeUnitCount7isASCIISSBp_BwBi1_tcfC");
            Interceptor.attach(toStringAddr, {
                onEnter(args) {
                    var builtinPointer = args[0];
                    var utf8CodeUnitCount = args[1];
                    var isASCII = args[2].toInt32();
                    // console.log('Builtin.RawPointer: ' + builtinPointer.toString());
                    // console.log('UTF8 Code Unit Count: ' + utf8CodeUnitCount);
                    // console.log('Is ASCII: ' + isASCII);
                    args[1] = ptr(0x9)
                },
                onLeave(retVal) {

                    retVal.replace(stringToHex(newString));
                }
            })
        }
    })
}
//Example
// replaceString("$s10ProvaDiego14ViewControllerC4nomeSSyF","Antonio")
// You can read the blog on this topic here  https://www.iprog.it/blog/varie/intercepting-and-modifying-swift-strings-a-hands-on-guide-with-frida/
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-647652185 @DiegoCaridei/swiftstringinterceptor
