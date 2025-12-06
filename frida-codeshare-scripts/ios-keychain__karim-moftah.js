
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-38986386 @karim-moftah/ios-keychain
if (!ObjC.available) {
    console.log("Objective-C runtime is not available!");
    throw "Objective-C runtime not available";
}

var frameworkName = "Security";
var targets = {
    "SecItemAdd": true,
    "SecItemCopyMatching": true,
    "SecItemUpdate": true,
    "SecItemDelete": true
};

function valueToString(val) {
    if (val === null) return "null";
    try {
        var o = ObjC.Object(val);
    } catch (e) {
        // Might already be an ObjC wrapper or primitive pointer; try to stringify pointer
        try {
            return ptr(val).toString();
        } catch (ee) {
            return String(val);
        }
    }

    if (!o || o.isNull && o.isNull()) return "null";

    var cls = o.$className;
    if (cls === "NSString") return o.toString();
    if (cls === "NSData") {
        try {
            var nsstr = ObjC.classes.NSString.alloc().initWithData_encoding_(o, 4);
            return "[NSData length=" + o.length() + "] utf8: " + nsstr.toString();
        } catch (e) {
            try {
                var len = o.length();
                var bytes = Memory.readByteArray(o.bytes(), Math.min(len, 64));
                var arr = new Uint8Array(bytes);
                var hex = [];
                for (var i = 0; i < arr.length; i++) hex.push(('0' + arr[i].toString(16)).slice(-2));
                return "[NSData length=" + len + "] hex_preview: " + hex.join('');
            } catch (err) {
                return "[NSData length=unknown] (cannot decode)";
            }
        }
    }
    if (cls === "NSDictionary" || cls === "NSMutableDictionary") return dictToString(o);
    if (cls === "NSNumber") return o.toString();
    // default
    try {
        return o.toString();
    } catch (e) {
        return "[" + cls + "]";
    }
}

function dictToString(dict) {
    try {
        var keys = dict.allKeys();
        var n = keys.count();
        var lines = ["{"];
        for (var i = 0; i < n; i++) {
            var keyObj = keys.objectAtIndex_(i);
            var key = keyObj.toString();
            var val = dict.objectForKey_(keyObj);
            lines.push("  '" + key + "': " + valueToString(val));
        }
        lines.push("}");
        return lines.join("\n");
    } catch (e) {
        return "[NSDictionary cannot be read: " + e.message + "]";
    }
}

Module.enumerateExports(frameworkName, {
    onMatch: function(exp) {
        if (exp.type !== "function") return;
        if (!targets[exp.name]) return;

        console.log("Found target:", exp.name, "at", exp.address);

        try {
            Interceptor.attach(ptr(exp.address), {
                onEnter: function(args) {
                    this.funcName = exp.name;
                    // stash second argument pointer for onLeave (if present)
                    // Many SecItem* functions have form (CFDictionaryRef, CFTypeRef *result) or similar
                    try {
                        this.rawArg0 = args[0];
                    } catch (e) {
                        this.rawArg0 = ptr("0x0");
                    }
                    try {
                        this.rawArg1 = args[1];
                    } catch (e) {
                        this.rawArg1 = ptr("0x0");
                    }

                    if (this.funcName === "SecItemAdd") {
                        var attrs = null;
                        try {
                            attrs = ObjC.Object(this.rawArg0);
                        } catch (e) {
                            attrs = null;
                        }
                        console.log("[SecItemAdd] attributes passed:");
                        if (attrs) console.log(dictToString(attrs));
                        else console.log("  <null or not ObjC>");
                    } else if (this.funcName === "SecItemCopyMatching") {
                        var query = null;
                        try {
                            query = ObjC.Object(this.rawArg0);
                        } catch (e) {
                            query = null;
                        }
                        console.log("[SecItemCopyMatching] query passed:");
                        if (query) console.log(dictToString(query));
                        else console.log("  <null or not ObjC>");
                    } else if (this.funcName === "SecItemUpdate") {
                        var query = null,
                            attrs = null;
                        try {
                            query = ObjC.Object(this.rawArg0);
                        } catch (e) {
                            query = null;
                        }
                        try {
                            attrs = ObjC.Object(this.rawArg1);
                        } catch (e) {
                            attrs = null;
                        }
                        console.log("[SecItemUpdate] query:");
                        if (query) console.log(dictToString(query));
                        else console.log("  <null or not ObjC>");
                        console.log("[SecItemUpdate] attributesToUpdate:");
                        if (attrs) console.log(dictToString(attrs));
                        else console.log("  <null or not ObjC>");
                    } else if (this.funcName === "SecItemDelete") {
                        var query = null;
                        try {
                            query = ObjC.Object(this.rawArg0);
                        } catch (e) {
                            query = null;
                        }
                        console.log("[SecItemDelete] query passed:");
                        if (query) console.log(dictToString(query));
                        else console.log("  <null or not ObjC>");
                    }
                },

                onLeave: function(retval) {
                    try {
                        console.log(this.funcName + " OSStatus:", retval.toInt32());

                        // If args[1] was provided as CFTypeRef *result, read it
                        // on many ABIs args[1] points to memory containing result pointer; need to read pointer from that location
                        if (this.funcName === "SecItemAdd" || this.funcName === "SecItemCopyMatching") {
                            try {
                                if (this.rawArg1 && !this.rawArg1.isNull && !ptr(this.rawArg1).isNull()) {
                                    // rawArg1 is an address where CFTypeRef result pointer will be stored
                                    var possibleResultPtr = Memory.readPointer(this.rawArg1);
                                    if (!possibleResultPtr.isNull()) {
                                        try {
                                            var wrapped = ObjC.Object(possibleResultPtr);
                                            console.log("-> Out param result object class:", wrapped.$className);
                                            // Print depending on type: dictionary, data, string, etc.
                                            if (wrapped.$className === "NSDictionary" || wrapped.$className === "NSMutableDictionary") {
                                                console.log("-> result (NSDictionary):");
                                                console.log(dictToString(wrapped));
                                            } else if (wrapped.$className === "NSData") {
                                                console.log("-> result (NSData): " + valueToString(wrapped));
                                            } else if (wrapped.$className === "NSString") {
                                                console.log("-> result (NSString): " + wrapped.toString());
                                            } else {
                                                // Fallback to printing toString
                                                try {
                                                    console.log("-> result toString(): " + wrapped.toString());
                                                } catch (e) {
                                                    console.log("-> result (class=" + wrapped.$className + ")");
                                                }
                                            }
                                        } catch (e) {
                                            console.log("-> Out param present but unable to ObjC.Object() it: " + e.message);
                                        }
                                    } else {
                                        console.log("-> Out param pointer is NULL (no result)");
                                    }
                                } else {
                                    console.log("-> No out-param pointer passed (args[1] null)");
                                }
                            } catch (e) {
                                console.log("-> Error reading out param: " + e.message);
                            }
                        }
                    } catch (e) {
                        console.log("onLeave error: " + e.message);
                    }
                }
            });
        } catch (err) {
            console.log("Ignoring " + exp.name + ": " + err.message);
        }
    },
    onComplete: function() {
        console.log("Finished enumerating Security exports.");
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-38986386 @karim-moftah/ios-keychain
