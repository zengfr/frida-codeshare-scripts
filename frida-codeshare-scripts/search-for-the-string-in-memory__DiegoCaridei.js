
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-2083268189 @DiegoCaridei/search-for-the-string-in-memory
function stringToBytesHex(str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
        var byteHex = str.charCodeAt(i).toString(16).toUpperCase();
        if (byteHex.length === 1) {
            byteHex = '0' + byteHex;
        }
        bytes.push(byteHex);
    }
    return bytes.join(' ');
}

function findString(string, indexModule) {
    // You need to provide the index of the module 
    var m = Process.enumerateModules()[indexModule];
    var pattern = stringToBytesHex(string)
    var results = Memory.scanSync(m.base, m.size, pattern);
    console.log(hexdump(ptr(results[0].address)))
}

//Usage example
//findString("password",43)
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-2083268189 @DiegoCaridei/search-for-the-string-in-memory
