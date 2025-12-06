
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1102305039 @axhlzy/fridadebugger
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BP_TYPE = exports.BPStatus = void 0;
const logger_1 = require("../logger");
class BPStatus {
    static toString() {
        let disp = '';
        disp += `CurrentThreadId : ${BPStatus.currentThreadId}`;
        disp += `CurrentPC : ${BPStatus.currentPC}`;
        disp += `Breakpoints size : ${BPStatus.breakpoints.size}`;
        disp += `\t${BPStatus.breakpoints.entries()}`;
        disp += `threadContextMap size : ${BPStatus.threadContextMap.size}`;
        disp += `\t${BPStatus.threadContextMap.entries()}`;
        return disp;
    }
}
exports.BPStatus = BPStatus;
// is stuck at breakpoint
BPStatus.isPaused = new Map();
// current using thread id
BPStatus.currentThreadId = 0;
// record current pc
BPStatus.currentPC = new Map();
// record breakpoints
BPStatus.breakpoints = new Set();
// map bp type
BPStatus.bpType = new Map();
// map action step function to thread
BPStatus.actionStep = new Map();
// map thread to contextMap
BPStatus.threadContextMap = new Map();
BPStatus.addBp = (bp, type) => {
    BPStatus.breakpoints.add(bp);
    BPStatus.bpType.set(bp, type);
};
BPStatus.removeBp = (bp) => {
    BPStatus.breakpoints.delete(bp);
    BPStatus.bpType.delete(bp);
};
BPStatus.getBpType = (bp) => {
    const ret = BPStatus.bpType.get(bp);
    if (ret == null)
        throw new Error("bp type is null");
    return ret;
};
BPStatus.setPaused = (thread_id, paused) => {
    BPStatus.isPaused.set(thread_id, paused);
    BPStatus.currentThreadId = thread_id;
};
BPStatus.hasPausedThread = () => {
    for (const [_key, value] of BPStatus.isPaused) {
        if (value)
            return true;
    }
    return false;
};
BPStatus.addStepAction = (action, thread_id = BPStatus.currentThreadId) => {
    let actions = BPStatus.actionStep.get(thread_id);
    if (actions == undefined) {
        actions = new Array();
        BPStatus.actionStep.set(thread_id, actions);
    }
    actions.push(action);
};
BPStatus.listStepAction = (thread_id = BPStatus.currentThreadId) => {
    let index = -1;
    (0, logger_1.logw)(`selectd thread_id: ${thread_id}`);
    BPStatus.actionStep.forEach((value, _key) => {
        (0, logger_1.logd)(`[${++index}]\n\taction: ${value}`);
    });
};
BPStatus.getStepActions = (thread_id = BPStatus.currentThreadId) => {
    const actions = BPStatus.actionStep.get(thread_id);
    if (actions == undefined)
        return [];
    return actions;
};
BPStatus.removeAllStepAction = (thread_id = BPStatus.currentThreadId) => {
    const actions = BPStatus.actionStep.get(thread_id);
    if (actions == undefined)
        throw new Error("actions is null");
    actions.splice(0, actions.length);
};
BPStatus.removeIndexStepAction = (index, thread_id = BPStatus.currentThreadId) => {
    const actions = BPStatus.actionStep.get(thread_id);
    if (actions == undefined)
        throw new Error("actions is null");
    actions.splice(index, 1);
};
BPStatus.addThreadContext = (thread_id, address, context) => {
    let contextMap = BPStatus.threadContextMap.get(thread_id);
    if (contextMap == undefined) {
        contextMap = new Map();
        BPStatus.threadContextMap.set(thread_id, contextMap);
    }
    contextMap.set(address, context);
};
BPStatus.getCurrentContext = (thread_id = BPStatus.currentThreadId) => {
    const contextMap = BPStatus.threadContextMap.get(thread_id);
    if (contextMap == undefined)
        throw new Error("contextMap is null");
    const address = BPStatus.currentPC.get(BPStatus.currentThreadId);
    if (address == undefined)
        throw new Error("address is null");
    let context = undefined;
    for (const [key, value] of contextMap) {
        if (key.equals(address)) {
            context = value;
            break;
        }
    }
    // contextMap.forEach((value, key) => logd(`key = ${key} value = ${value}`))
    if (context == undefined)
        throw new Error("context is null");
    return context;
};
var BP_TYPE;
(function (BP_TYPE) {
    BP_TYPE[BP_TYPE["LR"] = 0] = "LR";
    BP_TYPE[BP_TYPE["SP"] = 1] = "SP";
    BP_TYPE[BP_TYPE["RANGE"] = 2] = "RANGE";
    BP_TYPE[BP_TYPE["Function"] = 3] = "Function";
})(BP_TYPE = exports.BP_TYPE || (exports.BP_TYPE = {}));
Reflect.set(globalThis, "BPStatus", BPStatus);
Reflect.set(globalThis, "bps", BPStatus);
},{"../logger":9}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackTrace = void 0;
const logger_1 = require("../logger");
const BPStatus_1 = require("./BPStatus");
class BackTrace {
    constructor() { }
}
exports.BackTrace = BackTrace;
// impl by frida
BackTrace.BackTraceByFrida = (ctx = BPStatus_1.BPStatus.getCurrentContext(), fuzzy = false, retText = false, slice = 6) => {
    let tmpText = Thread.backtrace(ctx, fuzzy ? Backtracer.FUZZY : Backtracer.ACCURATE)
        .slice(0, slice)
        .map(DebugSymbol.fromAddress)
        .map((sym, index) => {
        let strRet = `${PD(`[${index}]`, 5)} ${sym}`;
        return strRet;
    })
        .join(`\n`);
    return !retText ? (0, logger_1.logd)(tmpText) : tmpText;
};
// impl by system
BackTrace.BackTraceBySystem = () => {
    /**
     * typedef enum {
        _URC_NO_REASON = 0,
        #if defined(__arm__) && !defined(__USING_SJLJ_EXCEPTIONS__) && \
            !defined(__ARM_DWARF_EH__)
        _URC_OK = 0, // used by ARM EHABI
        #endif
        _URC_FOREIGN_EXCEPTION_CAUGHT = 1,

        _URC_FATAL_PHASE2_ERROR = 2,
        _URC_FATAL_PHASE1_ERROR = 3,
        _URC_NORMAL_STOP = 4,

        _URC_END_OF_STACK = 5,
        _URC_HANDLER_FOUND = 6,
        _URC_INSTALL_CONTEXT = 7,
        _URC_CONTINUE_UNWIND = 8,
        #if defined(__arm__) && !defined(__USING_SJLJ_EXCEPTIONS__) && \
        !defined(__ARM_DWARF_EH__)
        _URC_FAILURE = 9 // used by ARM EHABI
        #endif
     */
    let _Unwind_Reason_Code;
    (function (_Unwind_Reason_Code) {
        _Unwind_Reason_Code[_Unwind_Reason_Code["_URC_NO_REASON"] = 0] = "_URC_NO_REASON";
        _Unwind_Reason_Code[_Unwind_Reason_Code["_URC_FOREIGN_EXCEPTION_CAUGHT"] = 1] = "_URC_FOREIGN_EXCEPTION_CAUGHT";
        _Unwind_Reason_Code[_Unwind_Reason_Code["_URC_FATAL_PHASE2_ERROR"] = 2] = "_URC_FATAL_PHASE2_ERROR";
        _Unwind_Reason_Code[_Unwind_Reason_Code["_URC_FATAL_PHASE1_ERROR"] = 3] = "_URC_FATAL_PHASE1_ERROR";
        _Unwind_Reason_Code[_Unwind_Reason_Code["_URC_NORMAL_STOP"] = 4] = "_URC_NORMAL_STOP";
        _Unwind_Reason_Code[_Unwind_Reason_Code["_URC_END_OF_STACK"] = 5] = "_URC_END_OF_STACK";
        _Unwind_Reason_Code[_Unwind_Reason_Code["_URC_HANDLER_FOUND"] = 6] = "_URC_HANDLER_FOUND";
        _Unwind_Reason_Code[_Unwind_Reason_Code["_URC_INSTALL_CONTEXT"] = 7] = "_URC_INSTALL_CONTEXT";
        _Unwind_Reason_Code[_Unwind_Reason_Code["_URC_CONTINUE_UNWIND"] = 8] = "_URC_CONTINUE_UNWIND";
    })(_Unwind_Reason_Code || (_Unwind_Reason_Code = {}));
    // using _Unwind_Backtrace
    const _Unwind_Backtrace = new NativeFunction(DebugSymbol.fromName("_Unwind_Backtrace").address, 'int', ['pointer', 'pointer']);
    // _Unwind_Word _Unwind_GetIP(struct _Unwind_Context *);
    const _Unwind_GetIP = new NativeFunction(DebugSymbol.fromName("_Unwind_GetIP").address, 'pointer', ['pointer']);
    // void _Unwind_SetIP(struct _Unwind_Context *, _Unwind_Word);
    const _Unwind_SetIP = new NativeFunction(DebugSymbol.fromName("_Unwind_SetIP").address, 'void', ['pointer', 'pointer']);
    // _Unwind_Word _Unwind_GetGR(struct _Unwind_Context *, int);
    const _Unwind_GetGR = new NativeFunction(DebugSymbol.fromName("_Unwind_GetGR").address, 'pointer', ['pointer', 'int']);
    // void _Unwind_SetGR(struct _Unwind_Context *, int, _Unwind_Word);
    const _Unwind_SetGR = new NativeFunction(DebugSymbol.fromName("_Unwind_SetGR").address, 'void', ['pointer', 'int', 'pointer']);
    // _Unwind_Word _Unwind_GetIPInfo(struct _Unwind_Context *, int *);
    const _Unwind_GetIPInfo = new NativeFunction(DebugSymbol.fromName("_Unwind_GetIPInfo").address, 'pointer', ['pointer', 'pointer']);
    // _Unwind_Word _Unwind_GetCFA(struct _Unwind_Context *);
    const _Unwind_GetCFA = new NativeFunction(DebugSymbol.fromName("_Unwind_GetCFA").address, 'pointer', ['pointer']);
    // _Unwind_Word _Unwind_GetBSP(struct _Unwind_Context *);
    const _Unwind_GetBSP = new NativeFunction(DebugSymbol.fromName("_Unwind_GetBSP").address, 'pointer', ['pointer']);
    // _Unwind_Ptr _Unwind_GetDataRelBase(struct _Unwind_Context *);
    const _Unwind_GetDataRelBase = new NativeFunction(DebugSymbol.fromName("_Unwind_GetDataRelBase").address, 'pointer', ['pointer']);
    // _Unwind_Ptr _Unwind_GetTextRelBase(struct _Unwind_Context *);
    const _Unwind_GetTextRelBase = new NativeFunction(DebugSymbol.fromName("_Unwind_GetTextRelBase").address, 'pointer', ['pointer']);
    (0, logger_1.logd)(`DataRelBase ${_Unwind_GetDataRelBase} | TextRelBase ${_Unwind_GetTextRelBase}`);
    var count = 0;
    _Unwind_Backtrace(new NativeCallback((ctx, _arg) => {
        try {
            const ip = _Unwind_GetIP(ctx); // lr
            (0, logger_1.logd)(`Frame ${PD(`# ${++count}`, 5)}\n\t${DebugSymbol.fromAddress(ip)} | ${Instruction.parse(ip)}`);
            // InstructionParser.printCurrentInstruction(ip, 5)
            if (Process.arch == 'arm64') {
                // x19 - x31 (64-bit) Non-Volatile Register
                const x19 = _Unwind_GetGR(ctx, 19);
                const x20 = _Unwind_GetGR(ctx, 20);
                const x21 = _Unwind_GetGR(ctx, 21);
                const x22 = _Unwind_GetGR(ctx, 22);
                const x23 = _Unwind_GetGR(ctx, 23);
                const x24 = _Unwind_GetGR(ctx, 24);
                const x25 = _Unwind_GetGR(ctx, 25);
                const x26 = _Unwind_GetGR(ctx, 26);
                const x27 = _Unwind_GetGR(ctx, 27);
                const x28 = _Unwind_GetGR(ctx, 28);
                const fp = _Unwind_GetGR(ctx, 29);
                const lr = _Unwind_GetGR(ctx, 30);
                // const sp: NativePointer = _Unwind_GetGR(ctx, 31) // misapplication  
                const cfa = _Unwind_GetCFA(ctx);
                // const bsp: NativePointer = _Unwind_GetBSP(ctx)
                (0, logger_1.logz)(`\t${PD(`x19: ${x19}`)} ${PD(`x20: ${x20}`)} ${PD(`x21: ${x21}`)} ${PD(`x22: ${x22}`)} ${PD(`x23: ${x23}`)} ${PD(`x24: ${x24}`)}\n\t${PD(`x25: ${x25}`)} ${PD(`x26: ${x26}`)} ${PD(`x27: ${x27}`)} ${PD(`x28: ${x28}`)}`);
                (0, logger_1.logz)(`\t${PD(`fp: ${fp}`)} ${PD(`lr: ${lr}`)} ${PD(`sp: ${cfa}`)}`);
            }
        }
        catch { /* end of stack */ }
        newLine();
        return _Unwind_Reason_Code._URC_NO_REASON;
    }, 'int', ['pointer', 'pointer']), NULL);
};
// backtrace
Reflect.set(globalThis, "bt", BackTrace.BackTraceByFrida);
Reflect.set(globalThis, "btf", BackTrace.BackTraceByFrida);
Reflect.set(globalThis, "bts", BackTrace.BackTraceBySystem);
},{"../logger":9,"./BPStatus":1}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreakPoint = void 0;
const instruction_1 = require("../instructions/instruction");
const BPStatus_1 = require("./BPStatus");
const logger_1 = require("../logger");
const utils_1 = require("../utils");
const debugger_1 = require("../debugger");
const signal_1 = require("../signal");
const DebugType = false;
class BreakPoint {
    static InnerAttach(localPtr) {
        Interceptor.attach(localPtr, {
            onEnter(_args) {
                Stalker.follow(Process.getCurrentThreadId(), {
                    events: {
                        call: false,
                        ret: false,
                        exec: true,
                        block: false,
                        compile: false,
                    },
                    transform: function (iterator) {
                        let instruction = iterator.next();
                        do {
                            if (debugger_1.Debugger.getModule(Process.getCurrentThreadId()).has(instruction.address)) {
                                if (DebugType)
                                    (0, logger_1.logz)(`${DebugSymbol.fromAddress(instruction?.address)} ${instruction}`);
                                iterator.putCallout(BreakPoint.CalloutInner);
                            }
                            iterator.keep();
                        } while ((instruction = iterator.next()) !== null);
                    }
                });
            },
            // only function bp need unfollow here
            onLeave: BPStatus_1.BPStatus.getBpType(localPtr) != BPStatus_1.BP_TYPE.Function ? undefined : function (_retval) {
                Stalker.unfollow(Process.getCurrentThreadId());
            }
        });
    }
}
exports.BreakPoint = BreakPoint;
BreakPoint.continueThread = (thread_id = BPStatus_1.BPStatus.currentThreadId) => {
    if (!BPStatus_1.BPStatus.hasPausedThread())
        throw new Error("no paused thread");
    Stalker.unfollow(thread_id);
    signal_1.Signal.sem_post_thread_id(thread_id);
    BPStatus_1.BPStatus.breakpoints.delete(BPStatus_1.BPStatus.currentPC.get(thread_id));
    BPStatus_1.BPStatus.currentThreadId = 0;
    BPStatus_1.BPStatus.setPaused(thread_id, false);
};
BreakPoint.attchByFunction = (mPtr = NULL, mdName = null) => {
    let localPtr = NULL;
    if (mPtr instanceof NativePointer)
        localPtr = mPtr;
    else {
        if (typeof mPtr === 'string') {
            localPtr = typeof mPtr === 'string' ? (mPtr.startsWith("0x") ? ptr(mPtr) : (function () {
                const md = Module.findExportByName(mdName, mPtr);
                if (md == null)
                    throw new Error("md is null");
                return md;
            })()) : mPtr;
        }
        else
            localPtr = BreakPoint.checkArgs(mPtr);
    }
    BPStatus_1.BPStatus.addBp(localPtr, BPStatus_1.BP_TYPE.Function);
    BreakPoint.InnerAttach(localPtr);
};
BreakPoint.checkArgs = (mPtr = NULL) => {
    let localPtr = NULL;
    if (mPtr instanceof NativePointer)
        return localPtr;
    if (typeof mPtr === 'number') {
        localPtr = ptr(mPtr);
    }
    else {
        throw new Error("mPtr must be number");
    }
    if (localPtr == null)
        throw new Error("mPtr is null");
    return localPtr;
};
// inlinehook unfollow by pc == lr
BreakPoint.attachByLR = (mPtr = NULL) => {
    let localPtr = BreakPoint.checkArgs(mPtr);
    BPStatus_1.BPStatus.addBp(localPtr, BPStatus_1.BP_TYPE.LR);
    BreakPoint.InnerAttach(localPtr);
    throw new Error("not implement");
};
// inlinehook unfollow by stack < 0
BreakPoint.attachBySP = (mPtr = NULL) => {
    let localPtr = BreakPoint.checkArgs(mPtr);
    BPStatus_1.BPStatus.addBp(localPtr, BPStatus_1.BP_TYPE.SP);
    BreakPoint.InnerAttach(localPtr);
    throw new Error("not implement");
};
// inlinehook unfollow by RANGE
BreakPoint.attachByRange = (mPtr = NULL) => {
    let localPtr = BreakPoint.checkArgs(mPtr);
    BPStatus_1.BPStatus.addBp(localPtr, BPStatus_1.BP_TYPE.RANGE);
    BreakPoint.InnerAttach(localPtr);
    throw new Error("not implement");
};
BreakPoint.CalloutInner = (context) => {
    // clear()
    const currentPC = context.pc;
    // todo moduleFilters implement
    const thread_id = Process.getCurrentThreadId();
    BPStatus_1.BPStatus.addThreadContext(thread_id, context.pc, context);
    BPStatus_1.BPStatus.currentPC.set(thread_id, currentPC);
    // check hit
    BPStatus_1.BPStatus.setPaused(thread_id, true);
    if (BPStatus_1.BPStatus.breakpoints.has(currentPC.sub(4 * 4))) {
        (0, logger_1.logw)(`Hit breakpoint at ${DebugSymbol.fromAddress(currentPC)} | ${Instruction.parse(currentPC)}`);
        signal_1.Signal.sem_post_thread_id(thread_id);
    }
    if (Process.arch == "arm64") {
        BreakPoint.callOutInnerArm64(context);
    }
    else if (Process.arch == "arm") {
        BreakPoint.callOutInnerArm(context);
    }
};
BreakPoint.printRegs = (context) => {
    if (Process.arch == "arm64") {
        const tc = context;
        (0, logger_1.logw)(`${(0, utils_1.padding)(`X0: ${tc.x0}`)} ${(0, utils_1.padding)(`X1: ${tc.x1}`)} ${(0, utils_1.padding)(`X2: ${tc.x2}`)} ${(0, utils_1.padding)(`X3: ${tc.x3}`)} ${(0, utils_1.padding)(`X4: ${tc.x4}`)} ${(0, utils_1.padding)(`X5: ${tc.x5}`)} ${(0, utils_1.padding)(`X6: ${tc.x6}`)} ${(0, utils_1.padding)(`X7: ${tc.x7}`)}`);
        (0, logger_1.logw)(`${(0, utils_1.padding)(`x8(XR): ${tc.x8}`)} ${(0, utils_1.padding)(`X9: ${tc.x9}`)} ${(0, utils_1.padding)(`X10: ${tc.x10}`)} ${(0, utils_1.padding)(`X11: ${tc.x11}`)} ${(0, utils_1.padding)(`X12: ${tc.x12}`)} ${(0, utils_1.padding)(`X13: ${tc.x13}`)} ${(0, utils_1.padding)(`X14: ${tc.x14}`)} ${(0, utils_1.padding)(`X15: ${tc.x15}`)}`);
        (0, logger_1.logw)(`${(0, utils_1.padding)(`X19: ${tc.x19}`)} ${(0, utils_1.padding)(`X20: ${tc.x20}`)} ${(0, utils_1.padding)(`X21: ${tc.x21}`)} ${(0, utils_1.padding)(`X22: ${tc.x22}`)} ${(0, utils_1.padding)(`X23: ${tc.x23}`)}`);
        (0, logger_1.logw)(`${(0, utils_1.padding)(`X24: ${tc.x24}`)} ${(0, utils_1.padding)(`X25: ${tc.x25}`)} ${(0, utils_1.padding)(`X26: ${tc.x26}`)} ${(0, utils_1.padding)(`X27: ${tc.x27}`)} ${(0, utils_1.padding)(`X28: ${tc.x28}`)}`);
        (0, logger_1.logw)(`${(0, utils_1.padding)(`FP(X29): ${tc.fp}`)}  ${(0, utils_1.padding)(`LR(X30): ${tc.lr}`)}  ${(0, utils_1.padding)(`SP(X31): ${tc.sp}`)}  |  ${(0, utils_1.padding)(`PC: ${tc.pc}`)}`);
    }
    else if (Process.arch == "arm") {
        const tc = context;
        (0, logger_1.logw)(`R0: ${(0, utils_1.padding)(tc.r0)} R1: ${(0, utils_1.padding)(tc.r1)} R2: ${(0, utils_1.padding)(tc.r2)} R3: ${(0, utils_1.padding)(tc.r3)}`);
        (0, logger_1.logw)(`R4: ${(0, utils_1.padding)(tc.r4)} R5: ${(0, utils_1.padding)(tc.r5)} R6: ${(0, utils_1.padding)(tc.r6)} R7: ${(0, utils_1.padding)(tc.r7)}`);
        (0, logger_1.logw)(`R8: ${(0, utils_1.padding)(tc.r8)} R9: ${(0, utils_1.padding)(tc.r9)} R10: ${(0, utils_1.padding)(tc.r10)} R11: ${(0, utils_1.padding)(tc.r11)}`);
        (0, logger_1.logw)(`IP(R12): ${(0, utils_1.padding)(tc.r12)} SP(R13): ${(0, utils_1.padding)(tc.sp)} LR(R14): ${(0, utils_1.padding)(tc.lr)} PC(R15): ${(0, utils_1.padding)(tc.pc)}`);
    }
};
BreakPoint.callOutInnerArm64 = (context) => {
    const tc = context;
    const currentThread = Process.getCurrentThreadId();
    (0, logger_1.logd)(`\n[ ${getThreadName(currentThread)} @ ${currentThread} }\n`);
    BreakPoint.printRegs(context);
    instruction_1.InstructionParser.printCurrentInstruction(tc.pc);
    BPStatus_1.BPStatus.getStepActions(currentThread).forEach((action) => action(tc));
    // BreakPoint.BackTraceBySystem() // recommend using in StepAction not there
    signal_1.Signal.sem_wait_threadid(currentThread);
};
BreakPoint.callOutInnerArm = (context) => {
    throw new Error("not implement");
};
Reflect.set(globalThis, "BreakPoint", BreakPoint);
Reflect.set(globalThis, "bp", BreakPoint);
Reflect.set(globalThis, "b", BreakPoint.attchByFunction); // breakpoint
Reflect.set(globalThis, "c", BreakPoint.continueThread); // continue
},{"../debugger":6,"../instructions/instruction":8,"../logger":9,"../signal":19,"../utils":20,"./BPStatus":1}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./BPStatus");
require("./breakpoint");
require("./backtrace");
},{"./BPStatus":1,"./backtrace":2,"./breakpoint":3}],5:[function(require,module,exports){
"use strict";
},{}],6:[function(require,module,exports){
"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Debugger = void 0;
const BPStatus_1 = require("./breakpoint/BPStatus");
const logger_1 = require("./logger");
class Debugger {
}
exports.Debugger = Debugger;
_a = Debugger;
Debugger.moduleFilters = new Set(["libil2cpp.so"]);
Debugger.CacheByThreadId = new Map();
Debugger.getModule = (thread_id = BPStatus_1.BPStatus.currentThreadId) => {
    if (Debugger.CacheByThreadId.has(thread_id)) {
        return Debugger.CacheByThreadId.get(thread_id);
    }
    else {
        const ret = new ModuleMap((md) => Debugger.moduleFilters.has(md.name));
        Debugger.CacheByThreadId.set(thread_id, ret);
        return ret;
    }
};
Debugger.getModuleMapByAddress = (mPtr) => {
    const dbgInfo = DebugSymbol.fromAddress(mPtr);
    if (dbgInfo == null || dbgInfo.moduleName == null) {
        (0, logger_1.loge)(`dbgInfo is null`);
        return _a.getModule();
    }
    Debugger.addModuleName(dbgInfo.moduleName);
    return Debugger.getModule();
};
Debugger.addModuleName = (name) => {
    Debugger.moduleFilters.add(name);
};
Reflect.set(globalThis, "Debugger", Debugger);
},{"./breakpoint/BPStatus":1,"./logger":9}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./instruction");
},{"./instruction":8}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructionParser = void 0;
const BPStatus_1 = require("../breakpoint/BPStatus");
const logger_1 = require("../logger");
class InstructionParser {
    constructor() { }
    static InsParser(address) {
        try {
            const ins = Instruction.parse(address);
            if (ins.mnemonic == "bl") {
                const opstr = ins.opStr;
                const op = opstr.split("#")[1];
                const sym = DebugSymbol.fromAddress(ptr(op));
                return sym.toString();
            }
        }
        catch (error) {
            return '';
        }
        return '';
    }
}
exports.InstructionParser = InstructionParser;
InstructionParser.printCurrentInstruction = (pc = BPStatus_1.BPStatus.currentPC.get(BPStatus_1.BPStatus.currentThreadId), extraIns = 8, ret = false) => {
    if (!ret)
        newLine();
    if (typeof pc === 'number')
        pc = ptr(pc);
    let count = extraIns;
    // fake start
    let instruction_start = pc.sub(4 * ((extraIns / 2)));
    const arrayRet = [];
    // got real start
    let offset = 0;
    do {
        try {
            const ins = Instruction.parse(instruction_start.add(offset * 4));
            instruction_start = ins.address;
            break;
        }
        catch (error) {
            ++offset;
        }
    } while (true);
    var ins = Instruction.parse(instruction_start);
    do {
        // // error ins
        // if (ins.toString().includes('udf')) {
        //     logl(`   ${DebugSymbol.fromAddress(ins.address)} | [ ${getErrorDisc(ins.address)} ]`)
        //     ins = Instruction.parse(ins.address.add(0x4))
        //     continue
        // }
        let ins_str = `${DebugSymbol.fromAddress(ins.address)} | ${ins.toString()}`;
        const ins_op = InstructionParser.InsParser(ins.address);
        if (ins_op.length != 0)
            ins_str += `\t| ${ins_op}`;
        ins.address.equals(pc) ? (0, logger_1.loge)(`-> ${ins_str}`) : (0, logger_1.logz)(`   ${ins_str}`);
        if (ret)
            arrayRet.push({ address: ins.address, dis: ins_str });
        try {
            ins = Instruction.parse(ins.next);
        }
        catch (error) {
            (0, logger_1.logl)(`   ${DebugSymbol.fromAddress(ins.next)} | [ ${getErrorDisc(ins.next)} ]`);
            ins = Instruction.parse(ins.address.add(0x4));
        }
    } while (--count > 0);
    if (!ret)
        newLine();
    if (ret)
        return arrayRet;
    function getErrorDisc(mPtr) {
        const bt_array = mPtr.readByteArray(4);
        const bt_array_str = Array.from(new Uint8Array(bt_array)).map((item) => item.toString(16).padStart(2, '0')).join(' ');
        return bt_array_str;
    }
};
Reflect.set(globalThis, "InstructionParser", InstructionParser);
Reflect.set(globalThis, "ins", InstructionParser);
Reflect.set(globalThis, "dism", (mPtr, extraIns) => { InstructionParser.printCurrentInstruction(mPtr, extraIns); }); // dism
Reflect.set(globalThis, "pi", (mPtr, extraIns) => { InstructionParser.printCurrentInstruction(mPtr, extraIns); }); // dism
},{"../breakpoint/BPStatus":1,"../logger":9}],9:[function(require,module,exports){
(function (__filename){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logcat = exports.log = exports.logz = exports.logh = exports.logd = exports.logn = exports.logl = exports.logo = exports.logg = exports.loge = exports.logf = exports.logm = exports.logt = exports.logw = exports.LogColor = exports.android_LogPriority = exports.LogRedirect = void 0;
const utils_1 = require("./utils");
var LogRedirect;
(function (LogRedirect) {
    LogRedirect[LogRedirect["LOGCAT"] = 0] = "LOGCAT";
    LogRedirect[LogRedirect["CMD"] = 1] = "CMD";
    LogRedirect[LogRedirect["BOTH"] = 2] = "BOTH";
    LogRedirect[LogRedirect["TOAST"] = 3] = "TOAST";
    LogRedirect[LogRedirect["NOP"] = 4] = "NOP";
})(LogRedirect = exports.LogRedirect || (exports.LogRedirect = {}));
var android_LogPriority;
(function (android_LogPriority) {
    /** For internal use only.  */
    android_LogPriority[android_LogPriority["ANDROID_LOG_UNKNOWN"] = 0] = "ANDROID_LOG_UNKNOWN";
    /** The default priority, for internal use only.  */
    android_LogPriority[android_LogPriority["ANDROID_LOG_DEFAULT"] = 1] = "ANDROID_LOG_DEFAULT";
    /** Verbose logging. Should typically be disabled for a release apk. */
    android_LogPriority[android_LogPriority["ANDROID_LOG_VERBOSE"] = 2] = "ANDROID_LOG_VERBOSE";
    /** Debug logging. Should typically be disabled for a release apk. */
    android_LogPriority[android_LogPriority["ANDROID_LOG_DEBUG"] = 3] = "ANDROID_LOG_DEBUG";
    /** Informational logging. Should typically be disabled for a release apk. */
    android_LogPriority[android_LogPriority["ANDROID_LOG_INFO"] = 4] = "ANDROID_LOG_INFO";
    /** Warning logging. For use with recoverable failures. */
    android_LogPriority[android_LogPriority["ANDROID_LOG_WARN"] = 5] = "ANDROID_LOG_WARN";
    /** Error logging. For use with unrecoverable failures. */
    android_LogPriority[android_LogPriority["ANDROID_LOG_ERROR"] = 6] = "ANDROID_LOG_ERROR";
    /** Fatal logging. For use when aborting. */
    android_LogPriority[android_LogPriority["ANDROID_LOG_FATAL"] = 7] = "ANDROID_LOG_FATAL";
    /** For internal use only.  */
    android_LogPriority[android_LogPriority["ANDROID_LOG_SILENT"] = 8] = "ANDROID_LOG_SILENT"; /* only for SetMinPriority(); must be last */
})(android_LogPriority = exports.android_LogPriority || (exports.android_LogPriority = {}));
var LogColor;
(function (LogColor) {
    LogColor[LogColor["TRACE"] = 0] = "TRACE";
    LogColor[LogColor["MARK"] = 1] = "MARK";
    LogColor[LogColor["FATAL"] = 2] = "FATAL";
    LogColor[LogColor["WHITE"] = 0] = "WHITE";
    LogColor[LogColor["RED"] = 1] = "RED";
    LogColor[LogColor["YELLOW"] = 3] = "YELLOW";
    LogColor[LogColor["C31"] = 31] = "C31";
    LogColor[LogColor["C32"] = 32] = "C32";
    LogColor[LogColor["C33"] = 33] = "C33";
    LogColor[LogColor["C34"] = 34] = "C34";
    LogColor[LogColor["C35"] = 35] = "C35";
    LogColor[LogColor["C36"] = 36] = "C36";
    LogColor[LogColor["C41"] = 41] = "C41";
    LogColor[LogColor["C42"] = 42] = "C42";
    LogColor[LogColor["C43"] = 43] = "C43";
    LogColor[LogColor["C44"] = 44] = "C44";
    LogColor[LogColor["C45"] = 45] = "C45";
    LogColor[LogColor["C46"] = 46] = "C46";
    LogColor[LogColor["C90"] = 90] = "C90";
    LogColor[LogColor["C91"] = 91] = "C91";
    LogColor[LogColor["C92"] = 92] = "C92";
    LogColor[LogColor["C93"] = 93] = "C93";
    LogColor[LogColor["C94"] = 94] = "C94";
    LogColor[LogColor["C95"] = 95] = "C95";
    LogColor[LogColor["C96"] = 96] = "C96";
    LogColor[LogColor["C97"] = 97] = "C97";
    LogColor[LogColor["C100"] = 100] = "C100";
    LogColor[LogColor["C101"] = 101] = "C101";
    LogColor[LogColor["C102"] = 102] = "C102";
    LogColor[LogColor["C103"] = 103] = "C103";
    LogColor[LogColor["C104"] = 104] = "C104";
    LogColor[LogColor["C105"] = 105] = "C105";
    LogColor[LogColor["C106"] = 106] = "C106";
    LogColor[LogColor["C107"] = 107] = "C107";
})(LogColor = exports.LogColor || (exports.LogColor = {}));
const logw = (message, fileName = __filename) => log(message, fileName, LogColor.YELLOW);
exports.logw = logw;
const logt = (message, fileName = __filename) => log(message, fileName, LogColor.TRACE);
exports.logt = logt;
const logm = (message, fileName = __filename) => log(message, fileName, LogColor.MARK);
exports.logm = logm;
const logf = (message, fileName = __filename) => log(message, fileName, LogColor.FATAL);
exports.logf = logf;
const loge = (message, fileName = __filename) => log(message, fileName, LogColor.RED);
exports.loge = loge;
const logg = (message, fileName = __filename) => log(message, fileName, LogColor.C32);
exports.logg = logg;
const logo = (message, fileName = __filename) => log(message, fileName, LogColor.C33);
exports.logo = logo;
const logl = (message, fileName = __filename) => log(message, fileName, LogColor.C34);
exports.logl = logl;
const logn = (message, fileName = __filename) => log(message, fileName, LogColor.C35);
exports.logn = logn;
const logd = (message, fileName = __filename) => log(message, fileName, LogColor.C36);
exports.logd = logd;
const logh = (message, fileName = __filename) => log(message, fileName, LogColor.C96);
exports.logh = logh;
const logz = (message, fileName = __filename) => log(message, fileName, LogColor.C90);
exports.logz = logz;
const LOG_TO = LogRedirect.CMD;
const LOG_COUNT_MAX = 20;
function log(message, _filename = '', type = LogColor.WHITE, filter = false) {
    if (LOG_TO == LogRedirect.NOP)
        return;
    if (filter && !(0, utils_1.filterDuplicateOBJ)(message, LOG_COUNT_MAX))
        return;
    switch (LOG_TO) {
        case LogRedirect.CMD:
            switch (type) {
                case LogColor.WHITE:
                    console.debug(message);
                    break;
                case LogColor.RED:
                    console.error(message);
                    break;
                case LogColor.YELLOW:
                    console.warn(message);
                    break;
                case LogColor.TRACE:
                    console.trace(message);
                    break;
                case LogColor.MARK:
                    console.debug(message);
                    break;
                case LogColor.FATAL:
                    console.error(message);
                    break;
                default:
                    console.log(`\x1b[${type}m${message}\x1b[0m`);
                    break;
            }
            break;
        case LogRedirect.LOGCAT:
            (0, exports.logcat)(message);
            break;
        case LogRedirect.TOAST:
            showToast(message);
            break;
        default:
            console.log(`\x1b[${type}m${message}\x1b[0m`);
            break;
    }
}
exports.log = log;
const logcat = (msg) => {
    Java.perform(() => {
        const jstr = Java.use("java.lang.String");
        Java.use("android.util.Log").d(jstr.$new("ZZZ"), jstr.$new(msg));
    });
};
exports.logcat = logcat;
const showToast = (message) => {
    Java.perform(() => {
        let Toast = Java.use("android.widget.Toast");
        let context = Java.use("android.app.ActivityThread").currentApplication().getApplicationContext();
        // .overload('android.content.Context', 'java.lang.CharSequence', 'int')
        Java.scheduleOnMainThread(() => Toast.makeText(context, Java.use("java.lang.String").$new(message), 1).show());
    });
};
}).call(this)}).call(this,"/agent/logger.ts")

},{"./utils":20}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./logger");
require("./utils");
require("./debugger");
require("./signal");
require("./breakpoint/include");
require("./instructions/include");
require("./cmoudles/include");
require("./parser/include");
},{"./breakpoint/include":4,"./cmoudles/include":5,"./debugger":6,"./instructions/include":7,"./logger":9,"./parser/include":18,"./signal":19,"./utils":20}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtParser = void 0;
const ParserBase_1 = require("./ParserBase");
class ArtParser extends ParserBase_1.ParserBase {
    from(handle) {
        this.handle = handle;
    }
    asArtMethod() {
        return this.handle;
    }
    asString() {
        //todo
        return '';
    }
}
exports.ArtParser = ArtParser;
Reflect.set(globalThis, "ArtParser", ArtParser);
},{"./ParserBase":14}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicParser = void 0;
const ParserBase_1 = require("./ParserBase");
class DynamicParser extends ParserBase_1.ParserBase {
    constructor() { super(); }
}
exports.DynamicParser = DynamicParser;
Reflect.set(globalThis, "DynamicParser", DynamicParser);
},{"./ParserBase":14}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Il2cppParser = void 0;
const ParserBase_1 = require("./ParserBase");
class Il2cppParser extends ParserBase_1.ParserBase {
}
exports.Il2cppParser = Il2cppParser;
// export class GameObject extends Il2Cpp.Object {
// }
// export class Transform extends Il2Cpp.Object {
// }
Reflect.set(globalThis, "Il2cppParser", Il2cppParser);
},{"./ParserBase":14}],14:[function(require,module,exports){
"use strict";
// import 'frida-il2cpp-bridge'
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserBase = void 0;
class ParserBase {
    constructor() {
        this.handle = NULL;
    }
    from(handle) {
        this.handle = handle;
    }
    toString() {
        return this.constructor.name;
    }
}
exports.ParserBase = ParserBase;
},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StdString = exports.StringParser = void 0;
const ParserBase_1 = require("./ParserBase");
class StringParser extends ParserBase_1.ParserBase {
    asU16String() {
        return this.handle.readUtf16String();
    }
    asU8String() {
        return this.handle.readUtf8String();
    }
    asStdSting() {
        return new StdString(this.handle).toString();
    }
    asCString() {
        return this.handle.readCString();
    }
    asUnityString() {
        // return new Il2Cpp.String(this.handle).content
        return '';
    }
}
exports.StringParser = StringParser;
Reflect.set(globalThis, "StringParser", StringParser);
class StdString {
    constructor(mPtr = Memory.alloc(StdString.STD_STRING_SIZE)) {
        this.handle = mPtr;
    }
    dispose() {
        const [data, isTiny] = this._getData();
        if (!isTiny)
            Java.api.$delete(data);
    }
    static fromPointer(ptrs) {
        return StdString.fromPointers([ptrs, ptrs.add(Process.pointerSize), ptrs.add(Process.pointerSize * 2)]);
    }
    static fromPointers(ptrs) {
        if (ptrs.length != 3)
            return '';
        return StdString.fromPointersRetInstance(ptrs).disposeToString();
    }
    static from(pointer) {
        try {
            return pointer.add(Process.pointerSize * 2).readCString();
        }
        catch (error) {
            // LOGE("StdString.from ERROR" + error)
            return 'ERROR';
        }
    }
    static fromPointersRetInstance(ptrs) {
        if (ptrs.length != 3)
            return new StdString();
        const stdString = new StdString();
        stdString.handle.writePointer(ptrs[0]);
        stdString.handle.add(Process.pointerSize).writePointer(ptrs[1]);
        stdString.handle.add(2 * Process.pointerSize).writePointer(ptrs[2]);
        return stdString;
    }
    disposeToString() {
        const result = this.toString();
        this.dispose();
        return result;
    }
    toString() {
        try {
            const data = this._getData()[0];
            return data.readUtf8String();
        }
        catch (error) {
            return StdString.from(this.handle.add(Process.pointerSize * 2));
        }
    }
    _getData() {
        const str = this.handle;
        const isTiny = (str.readU8() & 1) === 0;
        const data = isTiny ? str.add(1) : str.add(2 * Process.pointerSize).readPointer();
        return [data, isTiny];
    }
}
exports.StdString = StdString;
StdString.STD_STRING_SIZE = 3 * Process.pointerSize;
Reflect.set(globalThis, 'StdString', StdString);
},{"./ParserBase":14}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructParser = void 0;
const ParserBase_1 = require("./ParserBase");
class StructParser extends ParserBase_1.ParserBase {
    constructor() { super(); }
    asCStruct(c_code) {
        const cmd = new CModule(c_code);
        //todo
        return '';
    }
}
exports.StructParser = StructParser;
Reflect.set(globalThis, "StructParser", StructParser);
},{"./ParserBase":14}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolParser = void 0;
const ParserBase_1 = require("./ParserBase");
class SymbolParser extends ParserBase_1.ParserBase {
    constructor() { super(); }
    asDebugSymbol() {
        return DebugSymbol.fromAddress(this.handle);
    }
    asMapString(map) {
        return map.get(this.handle) || '';
    }
}
exports.SymbolParser = SymbolParser;
Reflect.set(globalThis, "SymbolParser", SymbolParser);
},{"./ParserBase":14}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ParserBase");
require("./ArtParser");
require("./DynamicParser");
require("./SymbolParser");
require("./StructParser");
require("./Il2cppParser");
require("./StringParser");
},{"./ArtParser":11,"./DynamicParser":12,"./Il2cppParser":13,"./ParserBase":14,"./StringParser":15,"./StructParser":16,"./SymbolParser":17}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signal = void 0;
const BPStatus_1 = require("./breakpoint/BPStatus");
var Signal;
(function (Signal) {
    var semlock_global = Memory.alloc(0x10);
    var semlock_thread_ids = new Map();
    const func_sem_init = new NativeFunction(Module.findExportByName("libc.so", "sem_init"), "int", ["pointer", "int", "uint"]);
    const func_sem_destroy = new NativeFunction(Module.findExportByName("libc.so", "sem_destroy"), "int", ["pointer"]);
    const func_sem_wait = new NativeFunction(Module.findExportByName("libc.so", "sem_wait"), "int", ["pointer"]);
    const func_sem_post = new NativeFunction(Module.findExportByName("libc.so", "sem_post"), "int", ["pointer"]);
    Signal.sem_post = () => {
        func_sem_post(semlock_global);
        func_sem_destroy(semlock_global);
    };
    Signal.sem_wait = () => {
        func_sem_init(semlock_global, 0, 0);
        func_sem_wait(semlock_global);
    };
    Signal.sem_post_thread_id = (thread_id) => {
        if (semlock_thread_ids.has(thread_id)) {
            func_sem_post(semlock_thread_ids.get(thread_id));
            func_sem_destroy(semlock_thread_ids.get(thread_id));
        }
    };
    Signal.sem_wait_threadid = (thread_id) => {
        if (!semlock_thread_ids.has(thread_id)) {
            var mem = Memory.alloc(0x10);
            semlock_thread_ids.set(thread_id, mem);
            func_sem_init(semlock_thread_ids.get(thread_id), 0, 0);
        }
        func_sem_wait(semlock_thread_ids.get(thread_id));
    };
    Signal.continue_instruction = (thread_id = BPStatus_1.BPStatus.currentThreadId) => {
        Signal.sem_post_thread_id(thread_id);
        newLine();
    };
})(Signal = exports.Signal || (exports.Signal = {}));
Reflect.set(globalThis, "Signal", Signal);
Reflect.set(globalThis, "step", Signal.continue_instruction);
Reflect.set(globalThis, "si", Signal.continue_instruction);
},{"./breakpoint/BPStatus":1}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packApiResove = exports.padding = exports.demangleName = exports.getThreadName = exports.filterDuplicateOBJ = void 0;
const logger_1 = require("./logger");
globalThis.clear = () => console.log('\x1Bc');
globalThis.newLine = (lines = 1) => {
    for (let i = 0; i < lines; i++)
        console.log('\n');
};
globalThis.d = () => { Interceptor.detachAll(); };
var nameCountMap = new Map();
const filterDuplicateOBJ = (objstr, maxCount = 10) => {
    let count = nameCountMap.get(objstr.toString());
    if (count == undefined)
        count = 0;
    if (count < maxCount) {
        nameCountMap.set(objstr.toString(), count + 1);
        return true;
    }
    return false;
};
exports.filterDuplicateOBJ = filterDuplicateOBJ;
function getThreadName(tid) {
    let threadName = "unknown";
    try {
        var file = new File("/proc/self/task/" + tid + "/comm", "r");
        threadName = file.readLine().toString().trimEnd();
        file.close();
    }
    catch (e) {
        throw e;
    }
    // var threadNamePtr: NativePointer = Memory.alloc(0x40)
    // var tid_p: NativePointer = Memory.alloc(p_size).writePointer(ptr(tid))
    // var pthread_getname_np = new NativeFunction(Module.findExportByName("libc.so", 'pthread_getname_np')!, 'int', ['pointer', 'pointer', 'int'])
    // pthread_getname_np(ptr(tid), threadNamePtr, 0x40)
    // threadName = threadNamePtr.readCString()!
    return threadName;
}
exports.getThreadName = getThreadName;
function demangleName(expName) {
    let demangleAddress = Module.findExportByName("libc++.so", '__cxa_demangle');
    if (demangleAddress == null)
        demangleAddress = Module.findExportByName("libunwindstack.so", '__cxa_demangle');
    if (demangleAddress == null)
        demangleAddress = Module.findExportByName("libbacktrace.so", '__cxa_demangle');
    if (demangleAddress == null)
        demangleAddress = Module.findExportByName(null, '__cxa_demangle');
    if (demangleAddress == null)
        throw Error("can not find export function -> __cxa_demangle");
    let demangle = new NativeFunction(demangleAddress, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer']);
    let mangledName = Memory.allocUtf8String(expName);
    let outputBuffer = NULL;
    let length = NULL;
    let status = Memory.alloc(Process.pageSize);
    let result = demangle(mangledName, outputBuffer, length, status);
    if (status.readInt() === 0) {
        let resultStr = result.readUtf8String();
        return (resultStr == null || resultStr == expName) ? "" : resultStr;
    }
    else
        return "";
}
exports.demangleName = demangleName;
const padding = (str, len = 18, pad = ' ', end = true) => {
    if (str instanceof NativePointer)
        str = str.toString();
    if (str.length >= len)
        return str;
    if (end)
        return str.padEnd(len, pad);
    else
        return str.padStart(len, pad);
};
exports.padding = padding;
const packApiResove = (patter = "exports:*!*Unwind*") => {
    let index = 0;
    new ApiResolver("module").enumerateMatches(patter).forEach((exp) => {
        (0, logger_1.logd)(`${(0, exports.padding)(`[${++index}]`, 5)}${exp.name} ${exp.address}`);
        (0, logger_1.logz)(`\t${demangleName(exp.name.split("!")[1])}`);
    });
};
exports.packApiResove = packApiResove;
globalThis.clear = clear;
globalThis.newLine = newLine;
globalThis.filterDuplicateOBJ = exports.filterDuplicateOBJ;
globalThis.getThreadName = getThreadName;
globalThis.demangleName = demangleName;
globalThis.padding = exports.padding;
globalThis.PD = exports.padding;
globalThis.d = d;
},{"./logger":9}]},{},[10])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhZ2VudC9icmVha3BvaW50L0JQU3RhdHVzLnRzIiwiYWdlbnQvYnJlYWtwb2ludC9iYWNrdHJhY2UudHMiLCJhZ2VudC9icmVha3BvaW50L2JyZWFrcG9pbnQudHMiLCJhZ2VudC9icmVha3BvaW50L2luY2x1ZGUudHMiLCJhZ2VudC9jbW91ZGxlcy9pbmNsdWRlLnRzIiwiYWdlbnQvZGVidWdnZXIudHMiLCJhZ2VudC9pbnN0cnVjdGlvbnMvaW5jbHVkZS50cyIsImFnZW50L2luc3RydWN0aW9ucy9pbnN0cnVjdGlvbi50cyIsImFnZW50L2xvZ2dlci50cyIsImFnZW50L21haW4udHMiLCJhZ2VudC9wYXJzZXIvQXJ0UGFyc2VyLnRzIiwiYWdlbnQvcGFyc2VyL0R5bmFtaWNQYXJzZXIudHMiLCJhZ2VudC9wYXJzZXIvSWwyY3BwUGFyc2VyLnRzIiwiYWdlbnQvcGFyc2VyL1BhcnNlckJhc2UudHMiLCJhZ2VudC9wYXJzZXIvU3RyaW5nUGFyc2VyLnRzIiwiYWdlbnQvcGFyc2VyL1N0cnVjdFBhcnNlci50cyIsImFnZW50L3BhcnNlci9TeW1ib2xQYXJzZXIudHMiLCJhZ2VudC9wYXJzZXIvaW5jbHVkZS50cyIsImFnZW50L3NpZ25hbC50cyIsImFnZW50L3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0FDQUEsc0NBQXNDO0FBRXRDLE1BQWEsUUFBUTtJQWlIakIsTUFBTSxDQUFDLFFBQVE7UUFDWCxJQUFJLElBQUksR0FBVyxFQUFFLENBQUE7UUFDckIsSUFBSSxJQUFJLHFCQUFxQixRQUFRLENBQUMsZUFBZSxFQUFFLENBQUE7UUFDdkQsSUFBSSxJQUFJLGVBQWUsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQzNDLElBQUksSUFBSSxzQkFBc0IsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUN6RCxJQUFJLElBQUksS0FBSyxR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Q0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLElBQUEsZUFBRSxFQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBQSxlQUFFLEVBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxJQUFBLGVBQUUsRUFBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLElBQUEsZUFBRSxFQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZNLElBQUEsYUFBSSxFQUFDLEdBQUcsSUFBQSxlQUFFLEVBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxJQUFBLGVBQUUsRUFBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLElBQUEsZUFBRSxFQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBQSxlQUFFLEVBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxJQUFBLGVBQUUsRUFBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUMvSCxJQUFBLGFBQUksRUFBQyxHQUFHLElBQUEsZUFBRSxFQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBQSxlQUFFLEVBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxJQUFBLGVBQUUsRUFBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLElBQUEsZUFBRSxFQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBQSxlQUFFLEVBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDL0gsSUFBQSxhQUFJLEVBQUMsR0FBRyxJQUFBLGVBQUUsRUFBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLElBQUEsZUFBRSxFQUFDLFlB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
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1102305039 @axhlzy/fridadebugger
