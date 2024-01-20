
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1290625178 @neil-wu/fridanslogger
/*
This tool depends on a modified MacOS app NSLogger as the log viewer. 
You can download from my github. https://github.com/neil-wu/FridaNSLogger
The original project was written by TypeScript. You can also find the demo on the github project.
*/

"use strict";
exports.__esModule = true;

function swapInt16(val) {
    return ((val & 0xff) << 8) | ((val >> 8) & 0xff);
}
exports.swapInt16 = swapInt16;

function swapInt32(val) {
    return (((val & 0xff) << 24) |
        ((val & 0xff00) << 8) |
        ((val & 0xff0000) >> 8) |
        ((val >> 24) & 0xff));
}
exports.swapInt32 = swapInt32;

function swapInt64(val) {
    var vh = val.and(0xffffffff).toNumber();
    var vl = val.shr(32).and(0xffffffff).toNumber();
    var reth = new Int64(swapInt32(vh)).shl(32);
    var retl = new Int64(swapInt32(vl));
    return reth.add(retl);
}
exports.swapInt64 = swapInt64;
var LogMessage = /** @class */ (function() {
    function LogMessage() {
        //this.name = name;
        this.logParts = [];
        this.partTotoalBytes = 0;
    }
    LogMessage.prototype.add = function(part) {
        this.logParts.push(part);
        this.partTotoalBytes += part.getBytes();
    };
    LogMessage.prototype.addTimestampPart = function() {
        var timestamp = Date.now();
        this.add(new LogMessagePart(1 /* TimestampS */ , 4 /* Int64 */ , timestamp / 1000));
        this.add(new LogMessagePart(2 /* TimestampMS */ , 4 /* Int64 */ , timestamp % 1000));
    };
    LogMessage.prototype.pack = function() {
        var partNum = this.logParts.length;
        var bufLen = 4 + 2 + this.partTotoalBytes;
        var buf = Memory.alloc(bufLen);
        var bufPtr = buf
            .writeS32(swapInt32(2 + this.partTotoalBytes))
            .add(4)
            .writeS16(swapInt16(partNum))
            .add(2);
        var i = 0;
        for (i = 0; i < partNum; i++) {
            var part = this.logParts[i];
            bufPtr = bufPtr.writeByteArray(part.toArrayBuffer()).add(part.getBytes());
        }
        return buf.readByteArray(bufLen);
    };
    return LogMessage;
}());
exports.LogMessage = LogMessage;
var LogMessagePart = /** @class */ (function() {
    function LogMessagePart(key, type, value) {
        //build
        var valueLen = this.getTypeValueLen(type, value);
        this.bytes = 2 + valueLen;
        this.buf = Memory.alloc(this.bytes);
        var bufPtr = this.buf.writeS8(key).add(1).writeS8(type).add(1);
        this.packTypeValue(bufPtr, type, value);
    }
    LogMessagePart.prototype.getBytes = function() {
        return this.bytes;
    };
    LogMessagePart.prototype.toArrayBuffer = function() {
        return this.buf.readByteArray(this.bytes);
    };
    LogMessagePart.prototype.dump = function(prefix) {
        if (prefix === void 0) {
            prefix = "";
        }
        console.log(prefix + hexdump(this.buf, {
            offset: 0,
            length: this.bytes
        }));
    };
    LogMessagePart.prototype.getTypeValueLen = function(type, value) {
        var valueLen = 0;
        if (type === 0 /* String */ ) {
            var str = value;
            valueLen = 4 + str.length;
        } else if (type === 2 /* Int16 */ ) {
            valueLen = 2;
        } else if (type === 3 /* Int32 */ ) {
            valueLen = 4;
        } else if (type === 4 /* Int64 */ ) {
            valueLen = 8;
        } else if (type === 1 /* Binary */ ) {
            valueLen = 4 + value.byteLength;
        }
        //TODO: Image
        return valueLen;
    };
    LogMessagePart.prototype.packTypeValue = function(bufPtr, type, value) {
        var retPtr = bufPtr;
        if (type === 0 /* String */ ) {
            var str = value;
            retPtr = bufPtr
                .writeS32(swapInt32(str.length))
                .add(4)
                .writeUtf8String(str)
                .add(str.length);
        } else if (type === 2 /* Int16 */ ) {
            retPtr = bufPtr.writeS16(swapInt16(value)).add(2);
        } else if (type === 3 /* Int32 */ ) {
            retPtr = bufPtr.writeS32(swapInt32(value)).add(4);
        } else if (type === 4 /* Int64 */ ) {
            var sval = "";
            if (typeof value === "number") {
                sval = "0x" + value.toString(16);
            } else {
                sval = value;
            }
            var tmp = new Int64(sval); // must init from hex string ('0x01020304')
            retPtr = bufPtr.writeS64(swapInt64(tmp)).add(8);
        } else if (type === 1 /* Binary */ ) {
            var arrBuf = value;
            var arrBufLen = arrBuf.byteLength;
            retPtr = bufPtr
                .writeS32(swapInt32(arrBufLen))
                .add(4)
                .writeByteArray(arrBuf)
                .add(arrBufLen);
        }
        //TODO: Image
        return retPtr;
    };
    return LogMessagePart;
}());
exports.LogMessagePart = LogMessagePart;
//---------------------------
function buildDeviceInfo() {
    var msg = new LogMessage();
    msg.addTimestampPart();
    msg.add(new LogMessagePart(0 /* MessageType */ , 3 /* Int32 */ , 3 /* Clientinfo */ )); //client info
    msg.add(new LogMessagePart(21 /* ClientVersion */ , 0 /* String */ , "Frida" + Frida.version));
    msg.add(new LogMessagePart(20 /* ClientName */ , 0 /* String */ , "pid" + Process.id));
    msg.add(new LogMessagePart(22 /* OSName */ , 0 /* String */ , Process.platform + "_" + Process.arch));
    var buffer = msg.pack();
    //log(hexdump(buffer, { ansi: true }));
    return buffer;
}
var Logger = /** @class */ (function() {
    function Logger(host, port) {
        this.host = host;
        this.port = port;
        this.cachePkgs = [];
        this.state = 0 /* Disconnect */ ;
        this.seq = 0;
        this.prePkgSendDone = true;
    }
    Logger.prototype.tryConnect = function() {
        var _this = this;
        if (this.state == 0 /* Disconnect */ ) {
            this.state = 1 /* Connecting */ ;
            console.log("Logger tryConnect to " + this.host + ":" + this.port + "...");
            Socket.connect({
                    family: "ipv4",
                    host: this.host,
                    port: this.port,
                    tls: false
                })
                .then(function(connect) {
                    _this.socket = connect;
                    _this.state = 2 /* Connected */ ;
                    console.log("Logger connect success");
                    var deviceBuf = buildDeviceInfo();
                    _this.send(deviceBuf);
                })["catch"](function(err) {
                    _this.socket = undefined;
                    _this.state = 0 /* Disconnect */ ;
                    console.log("Logger connect fail, err?", err);
                });
        }
    };
    Logger.prototype.logStr = function(str) {
        var pkg = this.buildLog(str);
        this.logPkg(pkg);
    };
    Logger.prototype.logBinary = function(data) {
        var pkg = this.buildLog(data);
        this.logPkg(pkg);
    };
    Logger.prototype.logPkg = function(pkg) {
        if (this.socket == undefined) {
            this.tryConnect();
            //cache pkg
            this.cachePkgs.push(pkg);
        } else {
            this.send(pkg);
        }
    };
    Logger.prototype.send = function(pkg) {
        var _this = this;
        if (this.socket == undefined || pkg == undefined) {
            return;
        }
        if (!this.prePkgSendDone) {
            this.cachePkgs.push(pkg);
            return;
        }
        this.prePkgSendDone = false;
        this.socket.output
            .write(pkg)
            .then(function(val) {
                _this.prePkgSendDone = true;
                var first = _this.cachePkgs.shift();
                _this.send(first); //send next pkg
            })["catch"](function(err) {
                console.log("send fail:", err); //Error: Error sending data: Broken pipe
                _this.socket = undefined;
                _this.state = 0 /* Disconnect */ ;
                _this.prePkgSendDone = true; //reset
            });
    };
    Logger.prototype.buildLog = function(data) {
        var msg = new LogMessage();
        msg.addTimestampPart();
        msg.add(new LogMessagePart(0 /* MessageType */ , 3 /* Int32 */ , 0 /* Log */ )); //log message
        msg.add(new LogMessagePart(5 /* Tag */ , 0 /* String */ , "FridaLog"));
        msg.add(new LogMessagePart(10 /* MessageSeq */ , 3 /* Int32 */ , this.seq++));
        msg.add(new LogMessagePart(6 /* Level */ , 4 /* Int64 */ , 3 /* Info */ )); //3=info
        //
        if (typeof data === "string") {
            var str = data;
            msg.add(new LogMessagePart(7 /* Message */ , 0 /* String */ , str));
        } else {
            var arrBuf = data;
            msg.add(new LogMessagePart(7 /* Message */ , 1 /* Binary */ , arrBuf));
        }
        var buffer = msg.pack();
        //log(hexdump(buffer, { ansi: true }));
        return buffer;
    };
    return Logger;
}());
exports.Logger = Logger;
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1290625178 @neil-wu/fridanslogger
