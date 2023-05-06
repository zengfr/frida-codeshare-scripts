
//https://github.com/zengfr/frida-codeshare-scripts
//2001985188 @mongolito12345/networking-native
console.log("Loading script...");
/*
Author: https://gist.github.com/zihadmahiuddin
*/

var getaddrinfoPtr = Module.findExportByName(null, 'getaddrinfo')
var connectPtr = Module.findExportByName(null, 'connect')
var sendPtr = Module.findExportByName(null, 'send')
var recvPtr = Module.findExportByName(null, 'recv')

var getaddrinfoFunction = new NativeFunction(getaddrinfoPtr, 'int', ['pointer', 'pointer', 'pointer', 'pointer'])
var connectFunction = new NativeFunction(connectPtr, 'int', ['int', 'pointer', 'int'])
var sendFunction = new NativeFunction(sendPtr, 'int', ['int', 'pointer', 'int', 'int'])
var recvFunction = new NativeFunction(recvPtr, 'int', ['int', 'pointer', 'int', 'int'])

/**
 * Returns hex from an ArrayBuffer object
 * @param {ArrayBuffer} array Array to work with
 * @param {Boolean} hex Whether to convert to hex or plain string
 */
function getReadable(array, hex) {
    var result = new Uint8Array(array.byteLength)
    result.set(array, 0)
    if (hex === false) {
        var str = ''
        for (var i = 0; i < result.length; i++) {
            str += String.fromCharCode(result[i])
        }
        return str
    } else {
        var hexStr = ''
        for (var j = 0; j < result.length; j++) {
            hexStr += result[j].toString(16)
        }
        return hexStr
    }
}

/**
 * Returns a nice formatting of a function with parameters
 * @param {string} functionName The name of the function to format
 * @param {string[]} params The function parameters as strings
 */
function formatFunction(functionName, params, retval) {
    var result = ''
    result += functionName
    result += '('
    for (var i = 0; i < params.length; i++) {
        if (i !== 0) {
            result += ', '
        }
        result += params[i]
    }
    result += ')'
    if (retval) {
        result += ' -> '
        result += retval
    }
    return result
}

function replaceGadp() {
    Interceptor.replace(getaddrinfoPtr, new NativeCallback(function(name, service, req, pai) {
        var nameStr = Memory.readUtf8String(name)
        console.log(formatFunction('getaddrinfo', [nameStr, service, req, pai]))
        return getaddrinfoFunction(name, service, req, pai)
    }, 'int', ['pointer', 'pointer', 'pointer', 'pointer']))
}

function replaceConnect() {
    Interceptor.replace(connectPtr, new NativeCallback(function(socket, address, addressLen) {
        var endpoint = {
            ip: '',
            port: 0
        }
        var portPtr = ptr(parseInt(address) + 2)
        var portHigh = Memory.readU8(portPtr)
        var portLow = Memory.readU8(ptr(parseInt(portPtr) + 1))
        endpoint.port = (portHigh & 0xFF) << 8 | (portLow & 0xFF)

        var ipPtr = ptr(parseInt(address) + 4)
        var ip = []

        ip.push(Memory.readU8(ipPtr))
        ip.push(Memory.readU8(ptr(parseInt(ipPtr) + 1)))
        ip.push(Memory.readU8(ptr(parseInt(ipPtr) + 2)))
        ip.push(Memory.readU8(ptr(parseInt(ipPtr) + 3)))

        endpoint.ip = ip.join('.')

        var result = connectFunction(socket, address, addressLen)

        console.log(formatFunction('connect', [socket, JSON.stringify(endpoint), addressLen], result));
        return result
    }, 'int', ['int', 'pointer', 'int']));
}

function replaceSend() {
    Interceptor.replace(sendPtr, new NativeCallback(function(fd, buf, len, flags) {
        var buffer = Memory.readByteArray(buf, len)
        var result = sendFunction(fd, buf, len, flags)
        console.log(formatFunction('send', [fd, getReadable(buffer, false), len, flags], result))
        return result
    }, 'int', ['int', 'pointer', 'int', 'int']));
}

function replaceRecv() {
    Interceptor.replace(recvPtr, new NativeCallback(function(fd, buf, len, flags) {
        var result = recvFunction(fd, buf, len, flags)
        if (result > -1) {
            var buffer = Memory.readByteArray(buf, result)
            console.log(formatFunction('recv', [fd, getReadable(buffer, false), len, flags], result))
        } else {
            console.log(formatFunction('recv', [fd, null, len, flags], result))
        }
        return result
    }, 'int', ['int', 'pointer', 'int', 'int']));
}

replaceGadp();
replaceConnect();
replaceSend();
replaceRecv();

console.log('Script loaded!');
//https://github.com/zengfr/frida-codeshare-scripts
//2001985188 @mongolito12345/networking-native
