
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1937663949 @realgam3/dynamichooks
// https://github.com/realgam3/ReversingAutomation/edit/master/Frida/Android-DynamicHooks/DynamicHooks.js
// runtime-engine: v8
// version: 2

const LogLevel = {
    None: 0,
    Informational: 1,
    Debug: 2
}

function hook(func, options) {
    let klass, funk;
    let Exception = Java.use("java.lang.Exception");

    function getClassAndFunction(classFuncName) {
        let klass = classFuncName.split(".");
        let funk = klass.pop();
        klass = klass.join(".");
        return [klass, funk]
    }

    function defaultFunction(funcArgs, context, originalResult) {
        return originalResult;
    }

    options = options || {
        logLevel: LogLevel.None,
        callOriginal: true,
        stackTrace: false,
        callback: defaultFunction,
        stringifyArguments: {},
        stringifyResult: null,
    };
    let logLevel = options.logLevel || LogLevel.None;
    let stackTrace = options.stackTrace || false;
    let callOriginal = options.callOriginal || true;
    let stringifyArguments = options.stringifyArguments || {};
    let stringifyResult = options.stringifyResult || null;
    let args = options.arguments || [];
    let callback = options.callback || defaultFunction;
    try {
        [klass, funk] = getClassAndFunction(func);
    } catch (error) {
        func += ".$init";
        [klass, funk] = getClassAndFunction(func);
    }

    try {
        let functionSignature = Java.use(klass)[funk];
        functionSignature.overload.apply(functionSignature, args).implementation = function () {
            let context = this;
            let funcArgs = [].slice.call(arguments);
            let result = null, originalResult = null;
            let toStringArguments = [];
            for (let i = 0; i < funcArgs.length; i++) {
                let argType = args[i];
                let toStringFunc = stringifyArguments[argType];
                toStringArguments.push(toStringFunc ? toStringFunc(funcArgs[i]) : funcArgs[i]);
            }
            let message = {
                stage: "calling",
                function: func,
                argumentTypes: args,
                arguments: toStringArguments,
            };

            if (stackTrace) {
                message.stackTrace = Exception.$new().getStackTrace().toString().split(",").slice(1);
            }

            if (logLevel >= LogLevel.Debug) {
                console.log(JSON.stringify(message));
            }

            if (callOriginal) {
                originalResult = functionSignature.overload.apply(functionSignature, args).apply(context, funcArgs);
            }
            result = callback(funcArgs, context, originalResult);

            message.stage = "return"
            if (callOriginal && callback !== defaultFunction) {
                message.originalResult = stringifyResult ? stringifyResult(originalResult, context) : originalResult;
            }
            message.result = stringifyResult ? stringifyResult(result, context) : result;

            if (logLevel >= LogLevel.Informational) {
                console.log(JSON.stringify(message));
            }

            return result;
        };
    } catch (error) {
        if (logLevel >= LogLevel.Informational) {
            console.error(JSON.stringify({
                stage: "error",
                function: func,
                argumentTypes: args,
                error: error.toString(),
            }));
        }
    }
}

Java.perform(function () {
    hook("java.security.MessageDigest.update", {
        logLevel: 1,
        arguments: ["[B"],
        stringifyArguments: {
            "[B": function (arg) {
                let byteArray = Java.array("byte", arg);
                return Array.from(byteArray).map(byte => (byte & 0xFF).toString(16).padStart(2, "0")).join("");
            }
        },
        stackTrace: true,
        callOriginal: true,
    });
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1937663949 @realgam3/dynamichooks
