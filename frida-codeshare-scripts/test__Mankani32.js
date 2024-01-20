
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:722943178 @Mankani32/test
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

(0, _defineProperty["default"])(exports, "__esModule", {
  value: true
});
exports.attach = void 0;

var logger_1 = require("./logger");

function attach() {
  try {
    // Disable Alamofire ServerTrust policy
    // SessionDelegate func attemptServerTrustAuthentication(with challenge: URLAuthenticationChallenge) -> ChallengeEvaluation
    // Alamofire.SessionDelegate.attemptServerTrustAuthentication(with: __C.NSURLAuthenticationChallenge) -> (disposition: __C.NSURLSessionAuthChallengeDisposition, credential: __C.NSURLCredential?, error: Alamofire.AFError?)
    var func_attemptServerTrust = Module.getExportByName(null, '$s9Alamofire15SessionDelegateC32attemptServerTrustAuthentication4withSo36NSURLSessionAuthChallengeDispositionV11disposition_So15NSURLCredentialCSg10credentialAA7AFErrorOSg5errortSo019NSURLAuthenticationK0C_tF'); // remove prefix _ 

    logger_1.log("[HookAFServerTrust] hook func_attemptServerTrust ".concat(func_attemptServerTrust));
    Interceptor.attach(func_attemptServerTrust, {
      onLeave: function onLeave(retval) {
        // force set retval to 0x1 to enable .performDefaultHandling
        var val = retval.toInt32();

        if (val != 0x1) {
          logger_1.log("[HookAFServerTrust] attemptServerTrustAuthentication retval ".concat(retval, ", reset to 0x1"));
          var fakeret = new NativePointer(0x1);
          retval.replace(fakeret);
        }
      }
    });
  } catch (e) {
    logger_1.log("[HookAFServerTrust] fail to hook attemptServerTrustAuthentication !, ".concat(e));
  }
}

exports.attach = attach;

},{"./logger":11,"@babel/runtime-corejs2/core-js/object/define-property":13,"@babel/runtime-corejs2/helpers/interopRequireDefault":17}],2:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _create = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/create"));

var __createBinding = void 0 && (void 0).__createBinding || (_create["default"] ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  (0, _defineProperty["default"])(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (_create["default"] ? function (o, v) {
  (0, _defineProperty["default"])(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

(0, _defineProperty["default"])(exports, "__esModule", {
  value: true
});
exports.attach = void 0;

var logger_1 = require("./logger");

var SDSwiftDataStorage_1 = require("./SDSwiftDataStorage");

var SDNetDump = __importStar(require("./SDNetDump"));

function enterFuncUrlSessionDidReceive(args) {
  // String is parsed by value
  var ptr1 = args[0]; //NSURLSession

  var ptr2 = args[1]; //NSURLSessionDataTask

  var rangePtr = args[2];
  var dataStoragePtr = args[3]; // Foundation.__DataStorage <-> Swift.Data

  var session = new ObjC.Object(ptr1); //NSURLSession

  var sessionDataTask = new ObjC.Object(ptr2); //NSURLSessionDataTask

  var request = sessionDataTask.currentRequest(); //NSURLRequest

  var dataLen = sessionDataTask.response().expectedContentLength(); //log(`1112-> ${request} > ${request.URL().absoluteString()}`)

  var output = SDNetDump.dumpRequest(request); //log(`rangePtr = ${ rangePtr }, dataStoragePtr=${dataStoragePtr}`);
  //log(`dataLen=${dataLen}`);

  var sdata = new SDSwiftDataStorage_1.SDSwiftDataStorage(dataStoragePtr); //log(`   ${ sdata.bytesPtr.readCString() }`);

  var sdataStr = sdata.bytesPtr.readCString(dataLen); // parse the response data, default as string

  output += "\n";
  output += SDNetDump.intent + ">>> ".concat(sdataStr);
  logger_1.log("".concat(output)); //----
  // you can also use the following function to print Data.
  //SwiftRuntime.swiftDataBridgeToObjectiveCByPtr(rangePtr, dataStoragePtr);
}

function attach() {
  try {
    //Alamofire.SessionDelegate.urlSession(_: __C.NSURLSession, dataTask: __C.NSURLSessionDataTask, didReceive: Foundation.Data) -> ()
    var func_urlSessionDidReceive = Module.getExportByName(null, '$s9Alamofire15SessionDelegateC03urlB0_8dataTask10didReceiveySo12NSURLSessionC_So0i4DataF0C10Foundation0J0VtF');
    logger_1.log("[HookAFSessionDelegate] func_urlSession ".concat(func_urlSessionDidReceive));
    Interceptor.attach(func_urlSessionDidReceive, {
      onEnter: enterFuncUrlSessionDidReceive
    });
  } catch (e) {
    logger_1.log("[HookAFSessionDelegate] fail to hook Alamofire.SessionDelegate !, ".concat(e));
  }
}

exports.attach = attach;

},{"./SDNetDump":5,"./SDSwiftDataStorage":6,"./logger":11,"@babel/runtime-corejs2/core-js/object/create":12,"@babel/runtime-corejs2/core-js/object/define-property":13,"@babel/runtime-corejs2/helpers/interopRequireDefault":17}],3:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _create = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/create"));

var __createBinding = void 0 && (void 0).__createBinding || (_create["default"] ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  (0, _defineProperty["default"])(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (_create["default"] ? function (o, v) {
  (0, _defineProperty["default"])(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

(0, _defineProperty["default"])(exports, "__esModule", {
  value: true
});
exports.attach = void 0;

var logger_1 = require("./logger");

var Util = __importStar(require("./Util"));

var SDNetDump = __importStar(require("./SDNetDump"));

function enterFuncDataTaskWithRequest(args) {
  //const ptr = args[0]; 
  var ptr2 = args[2];
  var rqst = new ObjC.Object(ptr2); // rqst=NSMutableURLRequest

  var rqstDesc = SDNetDump.dumpRequest(rqst); // https://github.com/theart42/hack.lu/blob/master/IOS/Notes/02-HTTPS/00-https-hooks.md

  var ptr3 = args[3];

  if (ptr3.toInt32() <= 0) {
    var str = rqstDesc;
    str += "\n";
    str += SDNetDump.intent + "(completionHandler empty)";
    logger_1.log("".concat(str));
    return;
  }

  var completionHandler = new ObjC.Block(args[3]);
  var origCompletionHandlerBlock = completionHandler.implementation;

  completionHandler.implementation = function (data, response, error) {
    var str = rqstDesc;
    str += "\n";
    str += SDNetDump.dumpRspWith(data, response, error);
    logger_1.log("".concat(rqstDesc));
    return origCompletionHandlerBlock(data, response, error);
  };
}

function attach() {
  var hookDataTask = Util.getOCMethodName('NSURLSession', '- dataTaskWithRequest:completionHandler:');
  logger_1.log("hook NSURLSession ".concat(hookDataTask.implementation));
  Interceptor.attach(hookDataTask.implementation, {
    onEnter: enterFuncDataTaskWithRequest
  });
}

exports.attach = attach;

},{"./SDNetDump":5,"./Util":9,"./logger":11,"@babel/runtime-corejs2/core-js/object/create":12,"@babel/runtime-corejs2/core-js/object/define-property":13,"@babel/runtime-corejs2/helpers/interopRequireDefault":17}],4:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _create = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/create"));

var __createBinding = void 0 && (void 0).__createBinding || (_create["default"] ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  (0, _defineProperty["default"])(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (_create["default"] ? function (o, v) {
  (0, _defineProperty["default"])(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

(0, _defineProperty["default"])(exports, "__esModule", {
  value: true
});
exports.attach = void 0;

var logger_1 = require("./logger");

var Util = __importStar(require("./Util"));

var SDSwiftString_1 = require("./SDSwiftString");

function isSmallString(abcdeeee) {
  var abcd = abcdeeee.shr(4).and(0xF);
  var isSmall = abcd.and(0x2).valueOf() > 0;
  return isSmall;
}

function enterFuncDataTaskWithRequest(args) {
  // String is parsed by value
  var ptr1 = args[0];
  var ptr2 = args[1]; //log(`ptr ${ptr1}, ${ptr1.toString()}, ${ptr2.toString()} `);

  var ptr1hex = '0x' + ptr1.toString(16);
  var ptr2hex = '0x' + ptr2.toString(16);
  var ptr1value = new UInt64(ptr1hex);
  var ptr2value = new UInt64(ptr2hex);
  var smallObject = ptr2value.and(0xFF); // the last byte
  // first, try parse smallstring

  if (isSmallString(smallObject)) {
    var smallStr = new SDSwiftString_1.SDSwiftSmallString(ptr1hex, ptr2hex);
    logger_1.log("[Foundation.URL.init] a=".concat(smallStr.desc()));

    if (Util.isPrintableString(smallStr.strValue)) {
      //TODO: filter special char
      logger_1.log("[Foundation.URL.init] ".concat(smallStr.desc()));
      return;
    }
  } // Large String


  var countAndFlagsBitsPtr = args[0]; // 8 bytes(_countAndFlagsBits) 

  var objectPtr = args[1]; // 8 bytes(_object)

  var countAndFlagsBits = new UInt64('0x' + countAndFlagsBitsPtr.toString(16));
  var object = new UInt64('0x' + objectPtr.toString(16)); //log(`[Foundation.URL.init] arg ptr=${countAndFlagsBitsPtr} ,${objectPtr} -> ${objectPtr.toString(16)}`);
  //log(`countAndFlagsBits=0x${countAndFlagsBits.toString(16) } , object=0x${object.toString(16) }`);

  var largeStr = new SDSwiftString_1.SDSwiftLargeString(countAndFlagsBits, object);
  logger_1.log("[Foundation.URL.init] ".concat(largeStr.desc()));
}

function attach() {
  try {
    // s10Foundation3URLV6stringACSgSSh_tcfC ---> Foundation.URL.init(string: __shared Swift.String) -> Foundation.URL?
    var func_Foundation_URL_init = Module.getExportByName(null, '$s10Foundation3URLV6stringACSgSSh_tcfC'); // remove prefix _

    console.log('func_Foundation_URL_init', func_Foundation_URL_init);
    Interceptor.attach(func_Foundation_URL_init, {
      onEnter: enterFuncDataTaskWithRequest
    });
  } catch (e) {
    logger_1.log("[HookURL] fail to hook swift Foundation.URL.init !, ".concat(e));
  }
}

exports.attach = attach;

},{"./SDSwiftString":7,"./Util":9,"./logger":11,"@babel/runtime-corejs2/core-js/object/create":12,"@babel/runtime-corejs2/core-js/object/define-property":13,"@babel/runtime-corejs2/helpers/interopRequireDefault":17}],5:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

(0, _defineProperty["default"])(exports, "__esModule", {
  value: true
});
exports.dumpRspWith = exports.dumpRequest = exports.newline = exports.intent = void 0;

var logger_1 = require("./logger");

exports.intent = "    ";
exports.newline = "\n";

function dumpRequest(rqst) {
  // rqst=NSMutableURLRequest
  // https://developer.apple.com/documentation/foundation/nsmutableurlrequest?language=objc
  var urlstr = rqst.URL().absoluteString();
  var method = rqst.HTTPMethod().toString(); // NSString

  var bodyData = rqst.HTTPBody();
  var allHTTPHeaderFields = rqst.allHTTPHeaderFields().toString();
  var str = "";
  var redMethod = logger_1.colorfulStr("[".concat(method, "]"), logger_1.LogColor.Red);
  str += "".concat(redMethod, " ").concat(urlstr);

  if (allHTTPHeaderFields && allHTTPHeaderFields.length > 0) {
    str += exports.newline;
    str += exports.intent + "[Header] ".concat(allHTTPHeaderFields.replace(exports.newline, ""));
  } // NSData to NSString


  if (bodyData) {
    var bodydataStr = ObjC.classes.NSString.alloc().initWithData_encoding_(bodyData, 4);
    str += exports.newline;
    str += exports.intent + "[Body] " + bodydataStr;
  }

  return str;
}

exports.dumpRequest = dumpRequest;

function dumpRspWith(data, response, error) {
  var rsp = new ObjC.Object(response);
  var dataNSString = ObjC.classes.NSString.alloc().initWithData_encoding_(data, 4);
  var str = exports.intent + ">>> ".concat(dataNSString);
  return str;
}

exports.dumpRspWith = dumpRspWith;

},{"./logger":11,"@babel/runtime-corejs2/core-js/object/define-property":13,"@babel/runtime-corejs2/helpers/interopRequireDefault":17}],6:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

(0, _defineProperty["default"])(exports, "__esModule", {
  value: true
});
exports.SDSwiftDataStorage = void 0;

var SDSwiftDataStorage = /*#__PURE__*/function () {
  function SDSwiftDataStorage(ptr) {
    (0, _classCallCheck2["default"])(this, SDSwiftDataStorage);

    /*
        ----Swift Class Memory Layout----
        var isa: objc_class* (8 bytes)
        var refCount: UInt64 (8 bytes)
        [properties]
    */
    this.__dataStoragePtr = ptr;
    var tmpptr = ptr.add(8 + 8);
    this.bytesPtr = new NativePointer(tmpptr.readU64());
    tmpptr = tmpptr.add(8);
    this.length = tmpptr.readU64();
    tmpptr = tmpptr.add(8);
    this.capacity = tmpptr.readU64();
  }

  (0, _createClass2["default"])(SDSwiftDataStorage, [{
    key: "desc",
    value: function desc() {
      return "<Swift.DataStorage, bytesPtr=".concat(this.bytesPtr, ", length='").concat(this.length, "'>");
    }
  }]);
  return SDSwiftDataStorage;
}();

exports.SDSwiftDataStorage = SDSwiftDataStorage;

},{"@babel/runtime-corejs2/core-js/object/define-property":13,"@babel/runtime-corejs2/helpers/classCallCheck":15,"@babel/runtime-corejs2/helpers/createClass":16,"@babel/runtime-corejs2/helpers/interopRequireDefault":17}],7:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _create = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/create"));

var __createBinding = void 0 && (void 0).__createBinding || (_create["default"] ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  (0, _defineProperty["default"])(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (_create["default"] ? function (o, v) {
  (0, _defineProperty["default"])(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

(0, _defineProperty["default"])(exports, "__esModule", {
  value: true
});
exports.SDSwiftLargeString = exports.SDSwiftSmallString = void 0;

var Util = __importStar(require("./Util"));

var SDSwiftLargeString = /*#__PURE__*/function () {
  function SDSwiftLargeString(inCountAndFlag, inObject) {
    var _cstrPtr$readCString;

    (0, _classCallCheck2["default"])(this, SDSwiftLargeString);
    this._countAndFlagsBits = inCountAndFlag;
    this._object = inObject; // 1. parse _countAndFlagsBits

    var abcd = inCountAndFlag.shr(48).shr(12).and(0xF); // 16bits, 2bytes

    this.isASCII = abcd.and(0x8).valueOf() > 0;
    this.isNFC = abcd.and(0x4).valueOf() > 0;
    this.isNativelyStored = abcd.and(0x2).valueOf() > 0;
    this.isTailAllocated = abcd.and(0x1).valueOf() > 0;
    this.count = inCountAndFlag.and(0xFFFFFFFFFFFF).valueOf(); // 48bits,6bytes
    // 2. parse _object

    var objectFlag = inObject.shr(56).and(0xFF); // abcdeeee

    var tmpaddr = inObject.and('0xFFFFFFFFFFFFFF').toString(16); //console.log('tmpaddr', tmpaddr, inObject, inObject.and( '0xFFFFFFFFFFFFFF' ))

    var strAddress = new UInt64('0x' + tmpaddr); // low 56 bits

    var strPtr = new NativePointer(strAddress);
    var cstrPtr = strPtr.add(32);
    this.strValue = (_cstrPtr$readCString = cstrPtr.readCString()) !== null && _cstrPtr$readCString !== void 0 ? _cstrPtr$readCString : ""; //console.log('str', this.strValue)
    //console.log(hexdump(cstrPtr.readByteArray(32) as ArrayBuffer, { ansi: true }));
  }

  (0, _createClass2["default"])(SDSwiftLargeString, [{
    key: "desc",
    value: function desc() {
      return "<Swift.String(Large), count=".concat(this.count, ", str='").concat(this.strValue, "'>");
    }
  }]);
  return SDSwiftLargeString;
}();

exports.SDSwiftLargeString = SDSwiftLargeString;

var SDSwiftSmallString = /*#__PURE__*/function () {
  function SDSwiftSmallString(h1, h2) {
    (0, _classCallCheck2["default"])(this, SDSwiftSmallString);
    // small string max 15 bytes
    var h1Array = Util.hexStrToUIntArray(h1).reverse();
    var h2Array = Util.hexStrToUIntArray(h2).reverse(); //console.log('h1array', h1,  h1Array)
    //console.log('h2array', h2, h2Array)

    function isValidChar(element, index, array) {
      return element > 0;
    }

    var dataArr = h1Array.concat(h2Array).slice(0, 15);
    var data = dataArr.filter(isValidChar);
    var str = String.fromCharCode.apply(null, data);

    if (Util.isPrintableString(str)) {
      this.strValue = str;
      this.count = str.length;
      this.isHex = false;
    } else {
      this.strValue = Util.uintArrayToHexStr(dataArr);
      this.count = dataArr.length;
      this.isHex = true;
    }
  }

  (0, _createClass2["default"])(SDSwiftSmallString, [{
    key: "desc",
    value: function desc() {
      var hexTip = this.isHex ? "hex" : "str";
      return "<Swift.String(Small), count=".concat(this.count, ", ").concat(hexTip, "='").concat(this.strValue, "'>");
    }
  }]);
  return SDSwiftSmallString;
}();

exports.SDSwiftSmallString = SDSwiftSmallString;

},{"./Util":9,"@babel/runtime-corejs2/core-js/object/create":12,"@babel/runtime-corejs2/core-js/object/define-property":13,"@babel/runtime-corejs2/helpers/classCallCheck":15,"@babel/runtime-corejs2/helpers/createClass":16,"@babel/runtime-corejs2/helpers/interopRequireDefault":17}],8:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

(0, _defineProperty["default"])(exports, "__esModule", {
  value: true
});
exports.swiftDataBridgeToObjectiveCByPtr = exports.swiftDataBridgeToObjectiveC = exports.attach = void 0;

var logger_1 = require("./logger");

var funcptr_data_bridgeToObjectiveC; // bridge Swift DataStorage to __NSSwiftData: NSData

function swiftDataBridgeToObjectiveC(dataStorage) {
  var dataLen = dataStorage.length;
  var rangeValue = dataLen.shl(32); // 0..<dataLen

  var rangePtr = new NativePointer(rangeValue);
  return swiftDataBridgeToObjectiveCByPtr(rangePtr, dataStorage.__dataStoragePtr);
}

exports.swiftDataBridgeToObjectiveC = swiftDataBridgeToObjectiveC;

function swiftDataBridgeToObjectiveCByPtr(rangePtr, dataStoragePtr) {
  var ret = funcptr_data_bridgeToObjectiveC(rangePtr, dataStoragePtr);
  var ocret = new ObjC.Object(ret); // is __NSSwiftData: NSData

  var byteptr = ocret.bytes();
  logger_1.log("ocret = ".concat(ocret.$className, ", ").concat(ocret.description(), ", len=").concat(ocret.length(), ", byteptr=").concat(byteptr));
  var cstr = byteptr.readCString(); //log(`${cstr}, count ${cstr?.length}`)

  return ocret;
}

exports.swiftDataBridgeToObjectiveCByPtr = swiftDataBridgeToObjectiveCByPtr;

function attach() {
  // 1. Foundation.Data._bridgeToObjectiveC() -> __C.NSData
  // arg
  // return: __NSSwiftData: NSData // https://github.com/apple/swift-corelibs-foundation/blob/60fb6984c95b989bb25b3af26accd3a2dc2e2240/Sources/Foundation/Data.swift#L561
  var func_data2nsdata_ptr = Module.getExportByName(null, '$s10Foundation4DataV19_bridgeToObjectiveCSo6NSDataCyF');
  logger_1.log("[SwiftRuntime] func_data2nsdata_ptr ".concat(func_data2nsdata_ptr));
  funcptr_data_bridgeToObjectiveC = new NativeFunction(func_data2nsdata_ptr, 'pointer', ['pointer', 'pointer']);
  logger_1.log("[SwiftRuntime] funcptr_data_bridgeToObjectiveC ".concat(funcptr_data_bridgeToObjectiveC));
}

exports.attach = attach;

},{"./logger":11,"@babel/runtime-corejs2/core-js/object/define-property":13,"@babel/runtime-corejs2/helpers/interopRequireDefault":17}],9:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/parse-int"));

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

(0, _defineProperty["default"])(exports, "__esModule", {
  value: true
});
exports.getOCMethodName = exports.uintArrayToHexStr = exports.hexStrToUIntArray = exports.readUCharHexString = exports.swapInt32 = exports.swapInt16 = exports.hexString = exports.isPrintableString = exports.isPrintableChar = void 0;

function isPrintableChar(val) {
  // [A-Za-z0-9_$ ]
  //0-9  0x30-0x39
  //A-Z  0x41-0x5a
  //a-z  97-122
  //0x5f 0x24 0x20
  var isNumber = val >= 0x30 && val <= 0x39;
  var isUpper = val >= 0x41 && val <= 0x5a;
  var isLower = val >= 0x61 && val <= 0x7a;
  var isSpecial = val == 0x5f || val == 0x24 || val == 0x20;
  return isNumber || isUpper || isLower || isSpecial;
}

exports.isPrintableChar = isPrintableChar;

function isPrintableString(str) {
  for (var i = 0; i < str.length; i++) {
    var val = str.charCodeAt(i);

    if (!isPrintableChar(val)) {
      return false;
    }
  }

  return true;
}

exports.isPrintableString = isPrintableString;

function hexString(str) {
  var ret = "0x";

  for (var i = 0; i < str.length; i++) {
    var val = str.charCodeAt(i);
    var valstr = val.toString(16);

    if (valstr.length == 1) {
      valstr = '0' + valstr;
    }

    ret = ret + valstr;
  }

  return ret;
}

exports.hexString = hexString;

function readUCharHexString(ptr) {
  var maxlen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 128;
  var idx = 0;
  var hexStr = "";

  while (true) {
    var val = ptr.add(idx).readU8();

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

exports.readUCharHexString = readUCharHexString;

function swapInt16(val) {
  return (val & 0xff) << 8 | val >> 8 & 0xff;
}

exports.swapInt16 = swapInt16;

function swapInt32(val) {
  return (val & 0xff) << 24 | (val & 0xff00) << 8 | (val & 0xff0000) >> 8 | val >> 24 & 0xff;
}

exports.swapInt32 = swapInt32;

function hexStrToUIntArray(inputStr) {
  var str = inputStr;

  if (str.startsWith('0x')) {
    str = str.substr(2);
  }

  var hex = str.toString();
  var result = [];

  for (var n = 0; n < hex.length; n += 2) {
    result.push((0, _parseInt2["default"])(hex.substr(n, 2), 16));
  }

  return result;
}

exports.hexStrToUIntArray = hexStrToUIntArray;

function uintArrayToHexStr(array) {
  var str = "";

  for (var n = 0; n < array.length; n += 1) {
    var val = array[n];
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

exports.uintArrayToHexStr = uintArrayToHexStr;

function getOCMethodName(className, funcName) {
  var hook = eval('ObjC.classes.' + className + '["' + funcName + '"]');
  return hook;
}

exports.getOCMethodName = getOCMethodName;

},{"@babel/runtime-corejs2/core-js/object/define-property":13,"@babel/runtime-corejs2/core-js/parse-int":14,"@babel/runtime-corejs2/helpers/interopRequireDefault":17}],10:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _create = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/create"));

var __createBinding = void 0 && (void 0).__createBinding || (_create["default"] ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  (0, _defineProperty["default"])(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (_create["default"] ? function (o, v) {
  (0, _defineProperty["default"])(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

(0, _defineProperty["default"])(exports, "__esModule", {
  value: true
});

var logger_1 = require("./logger"); //import * as Util from "./Util";
//import {SDSwiftLargeString, SDSwiftSmallString} from "./SDSwiftString";
//import {SDSwiftDataStorage} from "./SDSwiftDataStorage";


var HookURL = __importStar(require("./HookURL"));

var HookDataTaskWithRequest = __importStar(require("./HookDataTaskWithRequest"));

var HookAFSessionDelegate = __importStar(require("./HookAFSessionDelegate"));

var HookAFServerTrust = __importStar(require("./HookAFServerTrust"));

var SwiftRuntime = __importStar(require("./SwiftRuntime"));

logger_1.log("\n--- loaded --->");

function hasAlamofireModule() {
  var exePath = ObjC.classes.NSBundle.mainBundle().executablePath();
  var modules = Process.enumerateModules();

  for (var i = 0; i < modules.length; i++) {
    var oneModule = modules[i];

    if (oneModule.path.endsWith('Alamofire')) {
      return true;
    }
  }

  return false;
}

logger_1.log("hasAlamofireModule ".concat(hasAlamofireModule()));
SwiftRuntime.attach();
HookURL.attach();
HookDataTaskWithRequest.attach();
HookAFSessionDelegate.attach();
HookAFServerTrust.attach();

},{"./HookAFServerTrust":1,"./HookAFSessionDelegate":2,"./HookDataTaskWithRequest":3,"./HookURL":4,"./SwiftRuntime":8,"./logger":11,"@babel/runtime-corejs2/core-js/object/create":12,"@babel/runtime-corejs2/core-js/object/define-property":13,"@babel/runtime-corejs2/helpers/interopRequireDefault":17}],11:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

(0, _defineProperty["default"])(exports, "__esModule", {
  value: true
});
exports.colorfulStr = exports.LogColor = exports.log = void 0;

function log(message) {
  console.log(message);
}

exports.log = log;
var LogColor;

(function (LogColor) {
  LogColor["RESET"] = "\x1B[39;49;00m";
  LogColor["Black"] = "0;01";
  LogColor["Blue"] = "4;01";
  LogColor["Cyan"] = "6;01";
  LogColor["Gray"] = "7;11";
  LogColor["Green"] = "2;01";
  LogColor["Purple"] = "5;01";
  LogColor["Red"] = "1;01";
  LogColor["Yellow"] = "3;01";
  /*Light: {
      Black: "0;11", Blue: "4;11", Cyan: "6;11", Gray: "7;01", Green: "2;11", Purple: "5;11", Red: "1;11", Yellow: "3;11"
  }*/
})(LogColor = exports.LogColor || (exports.LogColor = {}));

function colorfulStr(input, color) {
  var colorPrefix = '\x1b[3';
  var colorSuffix = 'm';
  var str = colorPrefix + color + colorSuffix + input + LogColor.RESET;
  return str;
}

exports.colorfulStr = colorfulStr;

},{"@babel/runtime-corejs2/core-js/object/define-property":13,"@babel/runtime-corejs2/helpers/interopRequireDefault":17}],12:[function(require,module,exports){
module.exports = require("core-js/library/fn/object/create");
},{"core-js/library/fn/object/create":18}],13:[function(require,module,exports){
module.exports = require("core-js/library/fn/object/define-property");
},{"core-js/library/fn/object/define-property":19}],14:[function(require,module,exports){
module.exports = require("core-js/library/fn/parse-int");
},{"core-js/library/fn/parse-int":20}],15:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
},{}],16:[function(require,module,exports){
var _Object$defineProperty = require("../core-js/object/define-property");

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;

    _Object$defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
},{"../core-js/object/define-property":13}],17:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],18:[function(require,module,exports){
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D) {
  return $Object.create(P, D);
};

},{"../../modules/_core":25,"../../modules/es6.object.create":58}],19:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};

},{"../../modules/_core":25,"../../modules/es6.object.define-property":59}],20:[function(require,module,exports){
require('../modules/es6.parse-int');
module.exports = require('../modules/_core').parseInt;

},{"../modules/_core":25,"../modules/es6.parse-int":60}],21:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],22:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":39}],23:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"./_to-absolute-index":52,"./_to-iobject":54,"./_to-length":55}],24:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],25:[function(require,module,exports){
var core = module.exports = { version: '2.6.11' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],26:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":21}],27:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],28:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":32}],29:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":33,"./_is-object":39}],30:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],31:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var ctx = require('./_ctx');
var hide = require('./_hide');
var has = require('./_has');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":25,"./_ctx":26,"./_global":33,"./_has":34,"./_hide":35}],32:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],33:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],34:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],35:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":28,"./_object-dp":42,"./_property-desc":47}],36:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":33}],37:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":28,"./_dom-create":29,"./_fails":32}],38:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":24}],39:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],40:[function(require,module,exports){
module.exports = true;

},{}],41:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":22,"./_dom-create":29,"./_enum-bug-keys":30,"./_html":36,"./_object-dps":43,"./_shared-key":48}],42:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":22,"./_descriptors":28,"./_ie8-dom-define":37,"./_to-primitive":56}],43:[function(require,module,exports){
var dP = require('./_object-dp');
var anObject = require('./_an-object');
var getKeys = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

},{"./_an-object":22,"./_descriptors":28,"./_object-dp":42,"./_object-keys":45}],44:[function(require,module,exports){
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"./_array-includes":23,"./_has":34,"./_shared-key":48,"./_to-iobject":54}],45:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":30,"./_object-keys-internal":44}],46:[function(require,module,exports){
var $parseInt = require('./_global').parseInt;
var $trim = require('./_string-trim').trim;
var ws = require('./_string-ws');
var hex = /^[-+]?0[xX]/;

module.exports = $parseInt(ws + '08') !== 8 || $parseInt(ws + '0x16') !== 22 ? function parseInt(str, radix) {
  var string = $trim(String(str), 3);
  return $parseInt(string, (radix >>> 0) || (hex.test(string) ? 16 : 10));
} : $parseInt;

},{"./_global":33,"./_string-trim":50,"./_string-ws":51}],47:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],48:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":49,"./_uid":57}],49:[function(require,module,exports){
var core = require('./_core');
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: require('./_library') ? 'pure' : 'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});

},{"./_core":25,"./_global":33,"./_library":40}],50:[function(require,module,exports){
var $export = require('./_export');
var defined = require('./_defined');
var fails = require('./_fails');
var spaces = require('./_string-ws');
var space = '[' + spaces + ']';
var non = '\u200b\u0085';
var ltrim = RegExp('^' + space + space + '*');
var rtrim = RegExp(space + space + '*$');

var exporter = function (KEY, exec, ALIAS) {
  var exp = {};
  var FORCE = fails(function () {
    return !!spaces[KEY]() || non[KEY]() != non;
  });
  var fn = exp[KEY] = FORCE ? exec(trim) : spaces[KEY];
  if (ALIAS) exp[ALIAS] = fn;
  $export($export.P + $export.F * FORCE, 'String', exp);
};

// 1 -> String#trimLeft
// 2 -> String#trimRight
// 3 -> String#trim
var trim = exporter.trim = function (string, TYPE) {
  string = String(defined(string));
  if (TYPE & 1) string = string.replace(ltrim, '');
  if (TYPE & 2) string = string.replace(rtrim, '');
  return string;
};

module.exports = exporter;

},{"./_defined":27,"./_export":31,"./_fails":32,"./_string-ws":51}],51:[function(require,module,exports){
module.exports = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
  '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

},{}],52:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":53}],53:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],54:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":27,"./_iobject":38}],55:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":53}],56:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":39}],57:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],58:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', { create: require('./_object-create') });

},{"./_export":31,"./_object-create":41}],59:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperty: require('./_object-dp').f });

},{"./_descriptors":28,"./_export":31,"./_object-dp":42}],60:[function(require,module,exports){
var $export = require('./_export');
var $parseInt = require('./_parse-int');
// 18.2.5 parseInt(string, radix)
$export($export.G + $export.F * (parseInt != $parseInt), { parseInt: $parseInt });

},{"./_export":31,"./_parse-int":46}]},{},[10])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9Ib29rQUZTZXJ2ZXJUcnVzdC50cyIsImFnZW50L0hvb2tBRlNlc3Npb25EZWxlZ2F0ZS50cyIsImFnZW50L0hvb2tEYXRhVGFza1dpdGhSZXF1ZXN0LnRzIiwiYWdlbnQvSG9va1VSTC50cyIsImFnZW50L1NETmV0RHVtcC50cyIsImFnZW50L1NEU3dpZnREYXRhU3RvcmFnZS50cyIsImFnZW50L1NEU3dpZnRTdHJpbmcudHMiLCJhZ2VudC9Td2lmdFJ1bnRpbWUudHMiLCJhZ2VudC9VdGlsLnRzIiwiYWdlbnQvaW5kZXgudHMiLCJhZ2VudC9sb2dnZXIudHMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUtY29yZWpzMi9jb3JlLWpzL29iamVjdC9jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUtY29yZWpzMi9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUtY29yZWpzMi9jb3JlLWpzL3BhcnNlLWludC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS1jb3JlanMyL2hlbHBlcnMvY2xhc3NDYWxsQ2hlY2suanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUtY29yZWpzMi9oZWxwZXJzL2NyZWF0ZUNsYXNzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lLWNvcmVqczIvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3BhcnNlLWludC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYS1mdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYW4tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jb3JlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jdHguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2RlZmluZWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19leHBvcnQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2ZhaWxzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19nbG9iYWwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2hhcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faGlkZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faHRtbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faWU4LWRvbS1kZWZpbmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lvYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lzLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fbGlicmFyeS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWRwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZHBzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWtleXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3BhcnNlLWludC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fcHJvcGVydHktZGVzYy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2hhcmVkLWtleS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2hhcmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zdHJpbmctdHJpbS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc3RyaW5nLXdzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1hYnNvbHV0ZS1pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8taW50ZWdlci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8tbGVuZ3RoLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1wcmltaXRpdmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3VpZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmRlZmluZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYucGFyc2UtaW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7QUNBQSxJQUFBLFFBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBOztBQUVBLFNBQVMsTUFBVCxHQUFlO0FBQ1gsTUFBSTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQUksdUJBQXVCLEdBQUcsTUFBTSxDQUFDLGVBQVAsQ0FBdUIsSUFBdkIsRUFBNkIsa05BQTdCLENBQTlCLENBSkEsQ0FJZ1I7O0FBQ2hSLElBQUEsUUFBQSxDQUFBLEdBQUEsNERBQXdELHVCQUF4RDtBQUNBLElBQUEsV0FBVyxDQUFDLE1BQVosQ0FBbUIsdUJBQW5CLEVBQTRDO0FBQ3hDLE1BQUEsT0FEd0MsbUJBQ2hDLE1BRGdDLEVBQ0o7QUFDaEM7QUFFQSxZQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsT0FBUCxFQUFWOztBQUNBLFlBQUksR0FBRyxJQUFJLEdBQVgsRUFBZ0I7QUFDWixVQUFBLFFBQUEsQ0FBQSxHQUFBLHVFQUFtRSxNQUFuRTtBQUNBLGNBQUksT0FBTyxHQUFHLElBQUksYUFBSixDQUFrQixHQUFsQixDQUFkO0FBQ0EsVUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLE9BQWY7QUFDSDtBQUNKO0FBVnVDLEtBQTVDO0FBYUgsR0FuQkQsQ0FtQkUsT0FBTyxDQUFQLEVBQVU7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QUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIifQ==
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:722943178 @Mankani32/test
