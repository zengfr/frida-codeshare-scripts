#!/usr/bin/env python3

import json
import os.path
import sys
from subprocess import run
from tempfile import NamedTemporaryFile

import frida

from pycparser.c_ast import Decl, Enum, Enumerator, IdentifierType, PtrDecl, Struct, TypeDecl, Typedef
from pycparser.c_generator import CGenerator
from pycparser.c_parser import CParser

dev = next(iter(dev for dev in frida.enumerate_devices() if dev.type == 'tether'))
session = dev.attach(sys.argv[1])
script = session.create_script(r"""(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";

/* jshint esnext: true, evil: true */

var _set = require("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _log = require("babel-runtime/core-js/math/log2");

var _log2 = _interopRequireDefault(_log);

var _map2 = require("babel-runtime/core-js/map");

var _map3 = _interopRequireDefault(_map2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var convention = void 0;
if (Process.arch === "arm64" && Process.platform === "darwin") {
    // see swift-llvm/lib/Target/AArch64/AArch64CallingConvention.td
    convention = {
        selfRegister: 'x20',
        errorRegister: 'x21',
        indirectResultRegister: 'x8',
        maxInlineArgument: 128, // TODO: the optional string arg for dump() is much larger and inline!
        maxInlineReturn: 4 * Process.pointerSize, // see shouldPassIndirectlyForSwift in swift-llvm/lib/CodeGen/TargetInfo.cpp
        firstArgRegister: 'x0',
        maxVoluntaryInt: Process.pointerSize,
        maxInt: 8,
        maxIntAlignment: 8
    };
} else if (Process.arch === "arm" && Process.platform === "darwin") {
    // see swift-llvm/lib/Target/ARM/ARMCallingConv.td
    convention = {
        selfRegister: 'r10',
        errorRegister: 'r8',
        indirectResultRegister: undefined, // first argument, not a special register
        maxInlineArgument: 64, // TODO: watchOS uses 128
        maxInlineReturn: 4 * Process.pointerSize, // see shouldPassIndirectlyForSwift in swift-llvm/lib/CodeGen/TargetInfo.cpp
        firstArgRegister: 'r0',
        maxVoluntaryInt: Process.pointerSize,
        maxInt: 8,
        maxIntAlignment: 4
    };
} else {
    throw new Error("unknown platform");
}
//convention.freeze();

var errors = new _map3.default();

var storeError = new NativeCallback(function storeError() {
    errors.set(Process.getCurrentThreadId(), callStack);
}, 'void', ['pointer']);
function checkTrampolineError() {
    var id = Process.getCurrentThreadId();
    var val = errors.get(id, callStack);
    errors.remove(id);
    return val;
}

function makeCallTrampoline(func, withError, self, indirectResult) {
    if (!withError && !self && !indirectResult) return { callAddr: func };

    var buf = Memory.alloc(Process.pageSize);
    var wr = void 0,
        putBlxImm = void 0;
    if (Process.arch === "arm64") {
        wr = new Arm64Writer(buf);
        putBlxImm = 'putBlImm';
    } else {
        wr = new ThumbWriter(buf);
        putBlxImm = 'putBlxImm';
    }

    if (withError) wr.putLdrRegAddress(convention.errorRegister, ptr(0));
    // TODO: we should read the value for 'self' from a global/thread-local variable
    // that way, we don't need to regenerate this function for every call
    if (self) wr.putLdrRegAddress(convention.selfRegister, self);
    if (indirectResult) {
        if (!convention.indirectResultRegister) throw new Error("only provide the indirect result pointer on platforms with a specific register for it!");
        wr.putLdrRegAddress(convention.indirectResultRegister, indirectResult);
    }

    if (withError) {
        wr[putBlxImm](func);

        if (Process.arch === "arm64") wr.putTstRegImm(convention.errorRegister, ptr(0));else wr.putCmpRegImm(convention.errorRegister, ptr(0));

        wr.putBCondLabel('ne', 'err_case');
        wr.putRet(); // return if no error

        wr.putLabel('err_case');
        wr.putMovRegReg(convention.firstArgRegister, convention.errorRegister);
        wr[putBlxImm](storeError);
        wr.putRet();
    } else {
        wr.putBImm(func);
    }

    wr.flush();
    wr.dispose();

    Memory.protect(buf, Process.pageSize, 'r-x');
    var callAddr = void 0;
    if (Process.arch === "arm64") callAddr = buf;else callAddr = buf.or(ptr(1));
    return {
        'callAddr': callAddr,
        '_buf': buf
    };
};

function semanticLowering(signature) {
    function typeNeedsIndirection(t) {
        // TODO: generic arguments are also indirect (but we don't have any way to represent generic types yet)
        // TODO: value types containing generic arguments are also indirect
        // TODO: resilient value types are also indirect
        return t.kind === "Existential";
    }
    function addArg(type, indirect, ownership, target, special) {
        if (!indirect && type.kind === "Tuple") {
            type.tupleElements().forEach(function (e) {
                return addArg(e.type, indirect, ownership, target, special);
            });
        } else {
            indirect = indirect || typeNeedsIndirection(type);
            target.push({ type: type, indirect: indirect, ownership: ownership, special: special });
        }
    }

    var args = [];
    var swiftArgs = signature.getArguments();
    for (var i = 0; i < swiftArgs.length; i++) {
        var indirect = swiftArgs[i].inout;
        var isSelf = i === 0 && false; // TODO
        addArg(swiftArgs[i].type, indirect, args, indirect ? "keep" : "transfer", isSelf ? "self" : null);
    }

    var rets = [];
    addArg(signature.returnType, false, "return_take", rets, null);
    if (signature.flags.doesThrow) {
        addArg(Swift._typesByName.get("Swift.Error"), true, "return_take", rets, "error");
    }

    return { args: args, rets: rets };
}
function physicalLowering(semantic) {
    var legalTypesAndOffsets = [];
    var specialCases = [];

    var pointerType = "int" + Process.pointerSize * 8;
    function nextPowerOf2(val) {
        return Math.pow(2, Math.ceil((0, _log2.default)(val)));
    }
    function minimalInt(numValues) {
        var log2 = Math.ceil((0, _log2.default)(numValues));
        var nextMultipleOf8 = 8 + log2 - log2 % 8;
        return nextPowerOf2(nextMultipleOf8);
    }
    function addEmpty(start, end, res) {
        res.push(["empty", start, end]);
    }

    function addSwiftType(type, offset, res) {
        if (res === undefined) res = [];

        switch (type.kind) {
            case "Class":
            case "ObjCClassWrapper":
            case "ForeignClass":
            case "Metatype":
            case "Existential":
                res.push([pointer, offset, offset + Process.pointerSize]);
                break;
            case "Struct":
                {
                    var prevEnd = offset;
                    type.fields().forEach(function (f) {
                        var offs = offset + f.offset;

                        if (prevEnd < offs) addEmpty(prevEnd, offs, res);

                        if (f.weak) {
                            res.push([pointer, offs, offs + Process.pointerSize]);
                            prevEnd = offs + Process.pointerSize;
                        } else {
                            addSwiftType(f.type, offs, res);
                            prevEnd = offs + f.type.canonicalType.valueWitnessTable.size;
                        }
                    });
                    var end = offset + type.canonicalType.valueWitnessTable.size;
                    if (prevEnd < end) addEmpty(prevEnd, offs, res);
                    break;
                }
            case "Tuple":
                {
                    var _prevEnd = offset;
                    type.tupleElements().forEach(function (e) {
                        var offs = offset + e.offset;
                        if (_prevEnd < offs) addEmpty(_prevEnd, offs, res);

                        addSwiftType(e.type, offs, res);
                        _prevEnd = offs + e.type.canonicalType.valueWitnessTable.size;
                    });
                    var _end = offset + type.canonicalType.valueWitnessTable.size;
                    if (_prevEnd < _end) addEmpty(_prevEnd, offs, res);
                    break;
                }
            case "ErrorObject":
            case "ExistentialMetatype":
            case "Function":
                throw new Error("conversion to legal type for types of '" + type.kind + "' not yet implemented"); // TODO
            case "Optional":
            case "Enum":
                {
                    var numPayloads = type.nominalType.enum_.getNumPayloadCases();
                    var numEmpty = type.nominalType.enum_.getNumEmptyCases();
                    var enumSize = type.canonicalType.valueWitnessTable.size;
                    if (numPayloads === 0) {
                        // C-like enum
                        res.push(["int" + enumSize * 8, offset, offset + enumSize]);
                    } else if (numPayloads === 1) {
                        // single-payload enum
                        var payloadType = type.enumCases()[0].type;
                        addSwiftType(payloadType, offset, res); // payload is always at the beginning, possibly followed by discriminant
                        var payloadVwt = payloadType.canonicalType.valueWitnessTable;
                        var extraInhabitants = payloadVwt.extraInhabitantFlags.getNumExtraInhabitants();
                        if (extraInhabitants < numEmpty) {
                            // there is a tag at the end
                            var tagSize = minimalInt(numEmpty + numPayloads);
                            var _offs = offset + payloadVwt.size;
                            // TODO: verify that the tag does not get padded for alignment
                            res.push(["int" + tagSize, _offs, _offs + tagSize]);
                        } else {
                            // no tag
                            res.push(["opaque", offset, offset + enumSize]);
                        }
                    } else {
                        // multi-payload enum

                        // We can't use metadata to figure out whether the payload cases have enough overlapping
                        // spare bits.
                        // We can approximate by comparing the size of the largest payload with the size of the enum.
                        var enumCases = type.enumCases();
                        var largestSize = enumCases.reduce(function (s, c) {
                            if (c.type) return Math.max(s, c.type.canonicalType.valueWitnessTable.size);else return s;
                        }, 0);

                        // primary tag
                        if (enumSize > largestSize) {
                            res.push(["opaque", offset + largestSize, offset + enumSize]);
                        }

                        // payloads
                        for (var i = 0; i < enumCases.length; i++) {
                            if (enumCases[i].type) {
                                addSwiftType(enumCases[i].type, offset, res);
                            }
                        }

                        // secondary tag for the non-payload cases
                        if (numEmpty > 1) {
                            var _tagSize = minimalInt(numEmpty);
                            res.push(["opaque", offset, offset + _tagSize]);
                        }
                    }
                    break;
                }
            case "Opaque":
                {
                    var t = type.getCType();
                    if (t === undefined) throw new Error("the equivalent C type for type '" + type + "' is not known.");
                    if (t === "pointer") t = pointerType;
                    if (t.startsWith("uint")) t = t.slice(1);
                    if (t.startsWith("int") && parseInt(t.slice(3)) > convention.maxInt) t = "opaque";
                    container.push([t, offset]);
                    break;
                }
            default:
                throw new Error("type '" + type + "' is of unknown kind '" + type.kind + "'");
        }
    }

    for (var i = 0; i < semantic.length; i++) {
        if (semantic[i].special) {
            specialCases.push(semantic[i].special);
            continue;
        }

        if (semantic[i].indirect) legalTypesAndOffsets.push([pointerType, 0, Process.pointerSize]);else legalTypesAndOffsets.push(addSwiftType(semantic[i].type, 0));
    }

    function combineAdjacent() {
        var maps = {
            empty: new _map3.default(),
            opaque: new _map3.default()
        };
        for (var _i = 0; _i < legalTypesAndOffsets.length; _i++) {
            var legalType = legalTypesAndOffsets[_i][0];
            var map = maps[legalType];
            if (map === undefined) continue;
            for (var j = legalTypesAndOffsets[_i][1]; j < legalTypesAndOffsets[_i][2]; j++) {
                if (map.has(j)) {
                    var other = map.get(j);
                    var start = Math.min(legalTypesAndOffsets[_i][1], legalTypesAndOffsets[other][1]);
                    var end = Math.max(legalTypesAndOffsets[_i][2], legalTypesAndOffsets[other][2]);

                    for (var k = legalTypesAndOffsets[other][1]; k < legalTypesAndOffsets[other][1]; k++) {
                        map.delete(k);
                    }

                    legalTypesAndOffsets[other][1] = start;
                    legalTypesAndOffsets[other][2] = end;
                    _i = other - 1; // restart looking for other matches with the new bounds
                    break;
                } else {
                    map.set(j, _i);
                }
            }
        }
    }
    combineAdjacent();

    // find overlapped non-empty memory regions
    var indicesByOffset = new _map3.default();
    for (var _i2 = 0; _i2 < legalTypesAndOffsets.length; _i2++) {
        for (var j = legalTypesAndOffsets[_i2][1]; j < legalTypesAndOffsets[_i2][2]; j++) {
            if (!indicesByOffset.has(j)) indicesByOffset.set(j, []);
            indicesByOffset.get(j).push(_i2);
        }
    }
    // merge overlapped non-empty memory regions
    for (var _iterator = indicesByOffset.entries(), _isArray = Array.isArray(_iterator), _i3 = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
        var _ref;

        if (_isArray) {
            if (_i3 >= _iterator.length) break;
            _ref = _iterator[_i3++];
        } else {
            _i3 = _iterator.next();
            if (_i3.done) break;
            _ref = _i3.value;
        }

        var _ref4 = _ref,
            offset = _ref4[0],
            indices = _ref4[1];

        if (indices.length <= 1) continue;

        for (var _i10 = 1; _i10 < indices.length; _i10++) {
            var t0 = legalTypesAndOffsets[indices[_i10 - 1]];
            var t1 = legalTypesAndOffsets[indices[_i10]];
            if (t0[0] === t1[0]) continue;

            t0[0] = t1[0] = "opaque";
        }
    }

    combineAdjacent();

    // end of typed layout

    /* legal type sequence */

    // change types to opaque when their values have wrong alignment
    for (var _i4 = 0; _i4 < legalTypesAndOffsets.length; _i4++) {
        if (legalTypesAndOffsets[_i4][0] === "empty" || legalTypesAndOffsets[_i4][0] === "opaque") continue;

        var naturalAlignment = void 0;
        var size = legalTypesAndOffsets[_i4][2] - legalTypesAndOffsets[_i4][1];
        if (legalTypesAndOffsets[_i4][0].startsWith("int")) {
            naturalAlignment = Math.min(size, convention.maxVoluntaryInt);
        } else {
            naturalAlignment = size;
        }
        if (legalTypesAndOffsets[_i4][1] % naturalAlignment !== 0) {
            legalTypesAndOffsets[_i4][0] = "opaque";
        }
    }
    combineAdjacent();

    for (var _i5 = 0; _i5 < legalTypesAndOffsets.length; _i5++) {
        var _size = legalTypesAndOffsets[_i5][2] - legalTypesAndOffsets[_i5][1];
        if (legalTypesAndOffsets[_i5][0].startsWith("int") && _size <= convention.maxVoluntaryInt) legalTypesAndOffsets[_i5][0] = "opaque";
    }
    combineAdjacent();

    combineAdjacent = undefined; // make sure we don't combine anything below this point.
    // split opaque values at maximal aligned storage units
    for (var _i6 = 0; _i6 < legalTypesAndOffsets.length; _i6++) {
        if (legalTypesAndOffsets[_i6][0] !== "opaque") continue;
        var start = legalTypesAndOffsets[_i6][1];
        var end = legalTypesAndOffsets[_i6][2];
        var nextBoundary = start - start % convention.maxVoluntaryInt + convention.maxVoluntaryInt;
        while (nextBoundary < end - end % convention.maxVoluntaryInt) {
            legalTypesAndOffsets.push(["opaque", start, nextBoundary]);
            start = nextBoundary;
            nextBoundary += convention.maxVoluntaryInt;
        }
        legalTypesAndOffsets[_i6][1] = start;
    }
    // turn opaques into integers
    var perStorageUnit = new _map3.default();
    var lastStorageUnit = 0;
    for (var _i7 = 0; _i7 < legalTypesAndOffsets.length; _i7++) {
        if (legalTypesAndOffsets[_i7][0] !== "opaque") continue;
        var _start = legalTypesAndOffsets[_i7][1];
        var storageUnit = (_start - _start % convention.maxVoluntaryInt) / convention.maxVoluntaryInt;
        if (!perStorageUnit.has(storageUnit)) perStorageUnit.set(storageUnit, []);
        perStorageUnit.get(storageUnit).push(_i7);
        lastStorageUnit = Math.max(lastStorageUnit, storageUnit);
    }
    var toRemove = [];
    for (var _iterator2 = perStorageUnit.values(), _isArray2 = Array.isArray(_iterator2), _i8 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
        var _ref2;

        if (_isArray2) {
            if (_i8 >= _iterator2.length) break;
            _ref2 = _iterator2[_i8++];
        } else {
            _i8 = _iterator2.next();
            if (_i8.done) break;
            _ref2 = _i8.value;
        }

        var sharedUnit = _ref2;

        var _start2 = Number.POSITIVE_INFINITY;
        var _end2 = Number.NEGATIVE_INFINITY;
        for (var _iterator4 = sharedUnit, _isArray4 = Array.isArray(_iterator4), _i11 = 0, _iterator4 = _isArray4 ? _iterator4 : (0, _getIterator3.default)(_iterator4);;) {
            var _ref5;

            if (_isArray4) {
                if (_i11 >= _iterator4.length) break;
                _ref5 = _iterator4[_i11++];
            } else {
                _i11 = _iterator4.next();
                if (_i11.done) break;
                _ref5 = _i11.value;
            }

            var _i12 = _ref5;

            _start2 = Math.min(legalTypesAndOffsets[_i12][1], _start2);
            _end2 = Math.max(legalTypesAndOffsets[_i12][2], _end2);
        }
        // remove all but one of the opaque values in this storage unit
        toRemove = toRemove.concat(sharedUnit.slice(1));

        var _size2 = void 0;
        for (_size2 = 1; _start2 + _size2 < _end2; _size2 *= 2) {}
        var newStart = _start2 & ~(_size2 - 1);
        if (newStart != _start2) _size2 *= 2;

        var newEnd = newStart + _size2;
        legalTypesAndOffsets[sharedUnit[0]] = ["int" + (_size2 * 8).toString(), newStart, newEnd];
    }
    toRemove.sort().reverse();
    for (var _iterator3 = toRemove, _isArray3 = Array.isArray(_iterator3), _i9 = 0, _iterator3 = _isArray3 ? _iterator3 : (0, _getIterator3.default)(_iterator3);;) {
        var _ref3;

        if (_isArray3) {
            if (_i9 >= _iterator3.length) break;
            _ref3 = _iterator3[_i9++];
        } else {
            _i9 = _iterator3.next();
            if (_i9.done) break;
            _ref3 = _i9.value;
        }

        var _i13 = _ref3;

        legalTypesAndOffsets.splice(_i13, 1);
    }

    legalTypesAndOffsets.sort(function (a, b) {
        return a[1] - b[1];
    });

    return legalTypesAndOffsets;
}

function convertToCParams(signature) {
    var _semanticLowering = semanticLowering(signature),
        semanticArgs = _semanticLowering[0],
        semanticRets = _semanticLowering[1];

    var _map = [semanticArgs, semanticRets].map(physicalLowering),
        physicalArgs = _map[0],
        physicalRets = _map[1];

    // TODO: for generic functions, generic arguments are always passed indirectly, and arguments with the
    // type metadata of those arguments are added at the end of the arg list


    var lowered = [];
    var argInfos = [];

    // expand tuples into their components
    var argTypes = [];
    for (var i = 0; i < method.args.length; i++) {
        var elem = toCheck.shift();
        if (elem.kind === "Tuple") {
            toCheck = elem.elements.map(function (e) {
                return e.type;
            }).concat(toCheck);
        } else {
            argTypes.push(elem);
        }
    }

    // see NativeConventionSchema::getCoercionTypes
    for (var _i14 = 0; _i14 < params.length; _i14++) {
        // TODO: floats/doubles, vectors
        // see classifyArgumentType in swift-clang/lib/CodeGen/TargetInfo.cpp
        var type = method.args[_i14].type;
        var lowering = getLowering(params[_i14]);
        var vwt = type.canonicalType.valueWitnessTable;
        if (vwt.size === 0) // ignore zero-sized types
            continue;

        if (method.args[_i14].inout || vwt.flags.IsNonBitwiseTakable || vwt.size > CC.maxInlineArgument) {
            lowered.push({ size: Process.pointerSize, stride: Process.pointerSize, indirect: true });
        } else {
            lowered.push({ size: vwt.size, stride: vwt.stride, indirect: false });
        }
    }

    // see SwiftAggLowering::finish
    var remainingSpace = 0;
    for (var _i15 = 0; _i15 < lowered.length; _i15++) {}

    var indirectReturn = false;
    var cReturnType = 'void';
    if (method.returnType) {
        var _vwt = method.returnType.valueWitnessTable;
        // TODO: verify these are the right conditions for indirect returns
        if (_vwt.size > CC.maxInlineReturn || _vwt.flags.IsNonPOD) {
            indirectReturn = true;
            lowered.unshift({ size: Process.pointerSize, stride: Process.pointerSize, indirect: true });
        } else {
            var alignedSize = _vwt.size;
            var remaining = 0;
            cReturnType = [];
            var _arr = [8, 4, 2, 1];
            for (var _i16 = 0; _i16 < _arr.length; _i16++) {
                var size = _arr[_i16];
                // TODO: specify larger integers for int types larger than pointers
                while (size <= convention.maxVoluntaryInt && alignedSize > 0 && alignedSize % size === 0) {
                    // TODO: floats/doubles, vectors
                    cReturnType.push('uint' + (size * 8).toString());
                    alignedSize -= size;
                }
            }
        }
    }

    var overlappedWithSuccessor = new _set2.default();
    for (var _i17 = 0; _i17 < params.length; _i17++) {}

    var cParams = [],
        cArgTypes = [];
    for (var _i18 = 0; _i18 < params.length; _i18++) {}

    return { cParams: cParams, lowered: lowered };
}

module.exports = {
    convention: convention,
    makeCallTrampoline: makeCallTrampoline,
    checkTrampolineError: checkTrampolineError
};

},{"babel-runtime/core-js/get-iterator":8,"babel-runtime/core-js/map":10,"babel-runtime/core-js/math/log2":11,"babel-runtime/core-js/set":22}],2:[function(require,module,exports){
'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('../../loader');

function makeJsonCompat(obj) {
    switch (typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) {
        case "number":
        case "string":
        case "boolean":
        case "undefined":
            return obj;
    }
    if (obj === null) return null;
    if (obj instanceof NativePointer || obj instanceof Int64 || obj instanceof UInt64) return obj.toString();

    // use type names in place of type objects
    var res = obj instanceof Array ? [] : {};
    for (var _iterator = (0, _keys2.default)(obj), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
        var _ref;

        if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref = _iterator[_i++];
        } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref = _i.value;
        }

        var prop = _ref;

        if (["canonicalType", "nominalType", "getSize", "fixedName", "_name", "Type", "withoutClassBound", "getObjCObject", "withClassBound"].indexOf(prop) !== -1) continue;

        var val = obj[prop];

        // call through functions
        if (val instanceof Function && !("isGeneric" in val)) {
            if (val.length == 0) val = val.call(obj);else continue;
        }

        // replace type objects with their names
        if (val && typeof val === "function" && "isGeneric" in val) {
            val = val.toString();
        }

        res[prop] = makeJsonCompat(val);
    }
    return res;
}

rpc.exports = {
    run: function run() {
        var types = Swift.enumerateTypesSync();
        var out = {};
        types.forEach(function (t) {
            if (t.isGeneric()) return;

            out[t.toString()] = makeJsonCompat(t);
            if (t.kind === "Existential") out[t.toString()].witnessTableCount = t.canonicalType.flags.getNumWitnessTables();
            if (t.kind != "Class" || t.canonicalType.isTypeMetadata()) out[t.toString()].size = t.canonicalType.valueWitnessTable.size;else out[t.toString()].size = '0x' + Process.pointerSize.toString(16);
        });
        return (0, _stringify2.default)(out);
    },
    demangle: function demangle(str) {
        return Swift.isSwiftName(str) ? Swift.demangle(str) : str;
    },
    pointersize: function pointersize() {
        return Process.pointerSize;
    }
};

},{"../../loader":4,"babel-runtime/core-js/get-iterator":8,"babel-runtime/core-js/json/stringify":9,"babel-runtime/core-js/object/keys":17,"babel-runtime/helpers/typeof":25}],3:[function(require,module,exports){
"use strict";

/* jshint esnext: true, evil: true */

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var metadata = require('./metadata');
var types = require('./types');
var mangling = require('./mangling');
var swiftValue = require('./swift-value');
var CC = require('./calling-convention').convention;

var Swift = void 0;
var _api = null;

var _leakedMemory = []; // some runtime functions take pointers that must remain valid forever

var size_t = Process.pointerSize === 8 ? 'uint64' : Process.pointerSize === 4 ? 'uint32' : "unsupported platform";

Swift = module.exports = {

    get available() {
        return Module.findBaseAddress("libswiftCore.dylib") !== null;
    },

    isSwiftName: function isSwiftName(symbol) {
        var name = symbol.name || symbol;
        return name.startsWith(mangling.MANGLING_PREFIX);
    },


    // like Interceptor.attach, but with type information, so you get nice wrappers around the Swift values
    /*hook(target, callbacks, signature) {
        let interceptorCallbacks = {};
        if ("onEnter" in callbacks) {
            interceptorCallbacks.onEnter = function(args) {
                callbacks.onEnter([]);
            };
        }
        if ("onLeave" in callbacks) {
            interceptorCallbacks.onLeave = function(retval) {
                callbacks.onLeave(null);
            };
        }
        Interceptor.attach(target, interceptorCallbacks);
    },*/

    _mangled: new _map2.default(),

    // does not actually mangle the name, only has a lookup table with all names that have been demangled earlier
    getMangled: function getMangled(name) {
        return this._mangled.get(name);
    },
    demangle: function demangle(name) {
        if (!Swift.isSwiftName(name)) throw new Error("function name '" + name + "' is not a mangled Swift function");

        var cStr = Memory.allocUtf8String(name);
        var demangled = this._api.swift_demangle(cStr, name.length, ptr(0), ptr(0), 0);
        var res = Memory.readUtf8String(demangled);
        if ("free" in this._api) this._api.free(demangled);

        this._mangled.set(res, name);

        return res;
    },


    _typesByName: null,
    enumerateTypesSync: function enumerateTypesSync() {
        var typesByName = types.findAllTypes(this._api);

        this._typesByName = typesByName;
        return (0, _from2.default)(typesByName.values());
    },
    makeTupleType: function makeTupleType(labels, innerTypes) {
        if (innerTypes.length != labels.length) throw new Error("labels array and innerTypes array need the same length!");
        var elements = innerTypes.length ? Memory.alloc(Process.pointerSize * innerTypes.length) : ptr(0);
        var labelsStr = Memory.allocUtf8String(labels.join(" ") + " ");
        for (var i = 0; i < innerTypes.length; i++) {
            Memory.writePointer(elements.add(i * Process.pointerSize), innerTypes[i].canonicalType._ptr);
        }
        var valueWitnesses = ptr(0);
        var pointer = this._api.swift_getTupleTypeMetadata(innerTypes.length, elements, labelsStr, valueWitnesses);
        var canonical = new metadata.TargetMetadata(pointer);

        if (canonical.labels.toString === labelsStr.toString()) _leakedMemory.push(labelsStr); // if the tuple type is new, we must not ever dealllocate this string

        return new types.Type(null, canonical);
    },
    makeFunctionType: function makeFunctionType(args, returnType, flags) {
        var data = Memory.alloc(Process.pointerSize * (2 + args.length));

        var writeFlags = ptr(args.length).and(metadata.TargetFunctionTypeFlags.NumArgumentsMask);
        if (flags && flags.doesThrow) writeFlags = writeFlags.or(ptr(metadata.TargetFunctionTypeFlags.ThrowsMask));
        if (flags && flags.convention) writeFlags = writeFlags.or(ptr(metadata.FunctionMetadataConvention[flags.convention] << metadata.TargetFunctionTypeFlags.ConventionShift));

        Memory.writePointer(data, writeFlags);

        for (var i = 0; i < args.length; i++) {
            var val = void 0;
            if ("canonicalType" in args[i]) val = args[i].canonicalType._ptr;else {
                val = args[i].type.canonicalType._ptr;
                if (args[i].inout) val = val.or(1);
            }
            Memory.writePointer(data.add((i + 1) * Process.pointerSize), val);
        }
        if (returnType === null) returnType = this.makeTupleType([], []); // Void
        Memory.writePointer(data.add((args.length + 1) * Process.pointerSize), returnType.canonicalType._ptr);

        var pointer = this._api.swift_getFunctionTypeMetadata(data);
        return new types.Type(null, new metadata.TargetMetadata(pointer));
    },


    // Create a new types.Type object, from a Metadata*.
    // The name is only used for opaque types (builtins).
    _typeFromCanonical: function _typeFromCanonical(pointer, name) {
        return new types.Type(null, new metadata.TargetMetadata(pointer), name);
    },


    get _api() {
        if (_api !== null) return _api;
        if (!this.available) return null;

        var temporaryApi = {};
        var pending = [{
            module: "libsystem_malloc.dylib",
            functions: {
                "free": ['void', ['pointer']]
            },
            // optionals are functions/variables that might not be available
            optionals: {
                "free": "leaks don't break functionality"
            }
        }, {
            module: "libmacho.dylib",
            functions: {
                "getsectiondata": ['pointer', ['pointer', 'pointer', 'pointer', 'pointer']]
            }
        }, {
            module: "libswiftFoundation.dylib",
            functions: {
                "_T0SS10FoundationE8EncodingV4utf8ACfau": ['pointer', []],
                "_T0s14StringProtocolP10FoundationsAARzSS5IndexVADRtzlE01cA0Says4Int8VGSgSSACE8EncodingV5using_tF": ['pointer', ['pointer', 'pointer', 'pointer']]
            }
        }, {
            module: "CoreFoundation",
            functions: {
                "CFGetRetainCount": ['long', ['pointer']]
            }
        }, {
            module: "Foundation",
            functions: {
                'objc_storeStrong': ['void', ['pointer', 'pointer']]
            }
        }, {
            // see https://github.com/apple/swift/blob/master/docs/Runtime.md
            module: "libswiftCore.dylib",
            variables: new _set2.default(["_T0SSs14StringProtocolsWP", // protocol witness table for Swift.String : Swift.StringProtocol in Swift
            "_T0SSs16TextOutputStreamsWP", // protocol witness table for Swift.String : Swift.TextOutputStream in Swift
            "_T0s19_emptyStringStorages6UInt32Vv", // Swift._emptyStringStorage
            "_swift_release"]),
            functions: {
                "swift_demangle": ['pointer', ['pointer', size_t, 'pointer', 'pointer', 'int32']],

                'swift_unknownRetain': ['void', ['pointer']],
                'swift_unknownRelease': ['void', ['pointer']],
                'swift_bridgeObjectRelease': ['void', ['pointer']],
                'swift_weakLoadStrong': ['pointer', ['pointer']],
                'swift_weakAssign': ['void', ['pointer', 'pointer']],
                'swift_release': ['void', ['pointer']],
                'swift_retain': ['void', ['pointer']],

                //'swift_allocObject': ['pointer', ['pointer', size_t, size_t]],
                //'swift_allocBox': [['pointer', 'pointer'], ['pointer']],
                //'swift_deallocBox': ['void', ['pointer']],
                'swift_projectBox': ['pointer', ['pointer']],
                'swift_stringFromUTF8InRawMemory': ['void', ['pointer', 'pointer', size_t]],

                "swift_getTupleTypeMetadata": ['pointer', [size_t, 'pointer', 'pointer', 'pointer']],
                "swift_getExistentialMetatypeMetadata": ['pointer', ['pointer']],
                "swift_getExistentialTypeMetadata": ['pointer', ['int8', 'pointer', size_t, 'pointer']],
                //'swift_getGenericMetadata': ['pointer', ['pointer', 'pointer']],
                "swift_getObjCClassMetadata": ['pointer', ['pointer']],
                "swift_getFunctionTypeMetadata": ['pointer', ['pointer']],
                "swift_getForeignTypeMetadata": ['pointer', ['pointer']],
                "swift_getMetatypeMetadata": ['pointer', ['pointer']],

                "swift_getEnumCaseSinglePayload": ['int', ['pointer', 'pointer', 'uint']],
                "swift_getEnumCaseMultiPayload": ['uint', ['pointer', 'pointer']],

                'swift_conformsToProtocol': ['pointer', ['pointer', 'pointer']],
                'swift_dynamicCast': ['bool', ['pointer', 'pointer', 'pointer', 'pointer', size_t]],
                "swift_getDynamicType": ['pointer', ['pointer', 'pointer', 'int8']],

                "swift_getTypeByName": ['pointer', ['pointer', size_t]],
                "swift_getTypeName": [['pointer', 'pointer'], ['pointer', 'uchar']],

                "_T0s4dumpxx_q_z2toSSSg4nameSi6indentSi8maxDepthSi0E5Itemsts16TextOutputStreamR_r0_lF": CC.indirectResultRegister === undefined ?
                // no special indirect result register: one more param for indirect result
                ['void', ['pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'int', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer']] :
                // indirect result register must be set by hook
                ['void', ['pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'int', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer']]

            }
        }];
        pending.forEach(function (api) {
            var functions = api.functions || {};
            var variables = api.variables || new _set2.default();
            var optionals = api.optionals || {};

            var exportByName = Module.enumerateExportsSync(api.module).reduce(function (result, exp) {
                result[exp.name] = exp;
                return result;
            }, {});

            (0, _keys2.default)(functions).forEach(function (name) {
                var exp = exportByName[name];
                if (exp !== undefined && exp.type === 'function') {
                    var signature = functions[name];
                    if (typeof signature === 'function') {
                        signature.call(temporaryApi, exp.address);
                    } else {
                        temporaryApi[name] = new NativeFunction(exp.address, signature[0], signature[1], signature[2]);
                    }
                } else if (!(name in optionals)) {
                    throw new Error('missing function \'' + name + '\' in module \'' + api.module);
                }
            });

            variables.forEach(function (name) {
                var exp = exportByName[name];
                if (exp !== undefined && exp.type === 'variable') {
                    temporaryApi[name] = exp.address;
                } else if (!(name in optionals)) {
                    throw new Error('missing variable \'' + name + '\' in module \'' + api.module);
                }
            });
        });

        _api = temporaryApi;
        return _api;
    }
};

},{"./calling-convention":1,"./mangling":5,"./metadata":6,"./swift-value":151,"./types":152,"babel-runtime/core-js/array/from":7,"babel-runtime/core-js/map":10,"babel-runtime/core-js/object/keys":17,"babel-runtime/core-js/set":22}],4:[function(require,module,exports){
(function (global){
'use strict';

// a simple script for manually loading `index.js` into Frida, as well as some test code

global._debug = true;
var Swift = require('./index');
var mangling = require('./mangling');
Object.defineProperty(global, 'Swift', {
    value: Swift,
    configurable: true,
    enumerable: true
});

//console.log(Swift.enumerateTypesSync().filter(x => x.toString().indexOf("Any") !== -1).join("\n"));
//var t = Swift._typesByName.get("Foo.ViewController"); var testVar = new t(Module.findExportByName("Foo", "_T04Foo7testVarAA14ViewControllerCSgv")); console.log(testVar.toString())

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./index":3,"./mangling":5}],5:[function(require,module,exports){
"use strict";

/* jshint esnext: true, evil: true */

module.exports = {
    MANGLING_PREFIX: "_T" // 'old' mangling -- Swift HEAD has switched to using "_S"
};

},{}],6:[function(require,module,exports){
"use strict";

/* jshint esnext: true, evil: true */

var _log = require('babel-runtime/core-js/math/log2');

var _log2 = _interopRequireDefault(_log);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mangling = require('./mangling');

// for all these definitions, look at include/swift/Runtime/Metadata.h and friends in the Swift sources
// based on commit 2035c311736d15c9ef1a7e2e42a925a6ddae098c

function flagsToObject(definition, value) {
    var res = {};
    for (var _iterator = (0, _entries2.default)(definition), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
        var _ref;

        if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref = _iterator[_i++];
        } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref = _i.value;
        }

        var _ref2 = _ref,
            flagName = _ref2[0],
            flagVal = _ref2[1];

        res[flagName] = (value & flagVal) === flagVal;
    }
    return res;
}

var ValueWitnessFlags = {
    AlignmentMask: 0x0000FFFF,
    IsNonPOD: 0x00010000,
    IsNonInline: 0x00020000,
    HasExtraInhabitants: 0x00040000,
    HasSpareBits: 0x00080000,
    IsNonBitwiseTakable: 0x00100000,
    HasEnumWitnesses: 0x00200000
};

function TypeLayout(pointer) {
    this._ptr = pointer;
}
TypeLayout.prototype = {
    // offset 0
    get size() {
        return Memory.readPointer(this._ptr.add(0));
    },
    // offset pointerSize
    get flags() {
        return flagsToObject(ValueWitnessFlags, Memory.readPointer(this._ptr.add(Process.pointerSize)).toInt32());
    },
    // offset 2* pointerSize
    get stride() {
        return Memory.readPointer(this._ptr.add(2 * Process.pointerSize));
    },
    // offset 3* pointerSize
    get extraInhabitantFlags() {
        if (!this.flags.HasExtraInhabitants) return 0;
        return new ExtraInhabitantFlags(this._ptr.add(3 * Process.pointerSize));
    }
};
function ExtraInhabitantFlags(pointer) {
    this._ptr = pointer;
}
ExtraInhabitantFlags.NumExtraInhabitantsMask = 0x7FFFFFFF;
ExtraInhabitantFlags.prototype = {
    get data() {
        return Memory.readPointer(this._ptr);
    },

    getNumExtraInhabitants: function getNumExtraInhabitants() {
        return this.data & ExtraInhabitantFlags.NumExtraInhabitantsMask;
    }
};
function ValueWitnessTable(pointer) {
    TypeLayout.call(this, pointer.add(17 * Process.pointerSize));
    this._vwt = pointer;
}
ValueWitnessTable.prototype = (0, _create2.default)(TypeLayout.prototype, {
    // offset 0
    destroyBuffer: {
        value: function value(buffer, self) {
            // void destroyBuffer(ValueBuffer *buffer, const Metadata *self);
            return new NativeFunction(Memory.readPointer(this._vwt.add(0)), 'void', ['pointer', 'pointer'])(buffer, self);
        },

        enumerable: true
    },
    // offset pointerSize
    initializeBufferWithCopyOfBuffer: {
        value: function value(dest, src, self) {
            // OpaqueValue *initializeBufferWithCopyOfBuffer(ValueBuffer *dest, ValueBuffer *src, const Metadata *self)
            return new NativeFunction(Memory.readPointer(this._vwt.add(1 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(dest, src, self);
        },

        enumerable: true
    },
    // offset 2*pointerSize
    projectBuffer: {
        value: function value(buffer, self) {
            // OpaqueValue *projectBuffer(ValueBuffer *buffer, const Metadata *self)
            return new NativeFunction(Memory.readPointer(this._vwt.add(2 * Process.pointerSize)), 'pointer', ['pointer', 'pointer'])(buffer, self);
        },

        enumerable: true
    },
    // offset 3*pointerSize
    deallocateBuffer: {
        value: function value(buffer, self) {
            // void deallocateBuffer(ValueBuffer *buffer, const Metadata *self)
            return new NativeFunction(Memory.readPointer(this._vwt.add(3 * Process.pointerSize)), 'void', ['pointer', 'pointer'])(buffer, self);
        },

        enumerable: true
    },
    // offset 4*pointerSize
    destroy: {
        value: function value(object, self) {
            // void destroy(OpaqueValue *object, const Metadata *self)
            return new NativeFunction(Memory.readPointer(this._vwt.add(4 * Process.pointerSize)), 'void', ['pointer', 'pointer'])(object, self);
        },

        enumerable: true
    },
    // offset 5*pointerSize
    initializeBufferWithCopy: {
        value: function value(dest, src, self) {
            // OpaqueValue *initializeBufferWithCopy(ValueBuffer *dest, OpaqueValue *src, const Metadata *self)
            return new NativeFunction(Memory.readPointer(this._vwt.add(5 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(dest, src, self);
        },

        enumerable: true
    },
    // offset 6*pointerSize
    initializeWithCopy: {
        value: function value(dest, src, self) {
            // OpaqueValue *initializeWithCopy(OpaqueValue *dest, OpaqueValue *src, const Metadata *self)
            return new NativeFunction(Memory.readPointer(this._vwt.add(6 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(dest, src, self);
        },

        enumerable: true
    },
    // offset 7*pointerSize
    assignWithCopy: {
        value: function value(dest, src, self) {
            // OpaqueValue *assignWithCopy(OpaqueValue *dest, OpaqueValue *src, const Metadata *self)
            return new NativeFunction(Memory.readPointer(this._vwt.add(7 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(dest, src, self);
        },

        enumerable: true
    },
    // offset 8*pointerSize
    initializeBufferWithTake: {
        value: function value(dest, src, self) {
            // OpaqueValue *initializeBufferWithTake(ValueBuffer *dest, OpaqueValue *src, const Metadata *self)
            return new NativeFunction(Memory.readPointer(this._vwt.add(8 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(dest, src, self);
        },

        enumerable: true
    },
    // offset 9*pointerSize
    initializeWithTake: {
        value: function value(dest, src, self) {
            // OpaqueValue *initializeWithTake(OpaqueValue *dest, OpaqueValue *src, const Metadata *self)
            return new NativeFunction(Memory.readPointer(this._vwt.add(9 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(dest, src, self);
        },

        enumerable: true
    },
    // offset 10*pointerSize
    assignWithTake: {
        value: function value(dest, src, self) {
            // OpaqueValue *assignWithTake(OpaqueValue *dest, OpaqueValue *src, const Metadata *self)
            return new NativeFunction(Memory.readPointer(this._vwt.add(10 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(dest, src, self);
        },

        enumerable: true
    },
    // offset 11*pointerSize
    allocateBuffer: {
        value: function value(buffer, self) {
            // OpaqueValue *allocateBuffer(ValueBuffer *buffer, const Metadata *self)
            return new NativeFunction(Memory.readPointer(this._vwt.add(11 * Process.pointerSize)), 'pointer', ['pointer', 'pointer'])(buffer, self);
        },

        enumerable: true
    },
    // offset 12*pointerSize
    initializeBufferWithTakeOfBuffer: {
        value: function value(dest, src, self) {
            // OpaqueValue *initializeBufferWithTakeOfBuffer(ValueBuffer *dest, ValueBuffer *src, const Metadata *self)
            return new NativeFunction(Memory.readPointer(this._vwt.add(12 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(dest, src, self);
        },

        enumerable: true
    },
    // offset 13*pointerSize
    destroyArray: {
        value: function value(array, n, self) {
            // void destroyArray(OpaqueValue *array, size_t n, const Metadata *self)
            return new NativeFunction(Memory.readPointer(this._vwt.add(13 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(array, n, self);
        },

        enumerable: true
    },
    // offset 14*pointerSize
    initializeArrayWithCopy: {
        value: function value(dest, src, n, self) {
            // OpaqueValue *initializeArrayWithCopy(OpaqueValue *dest, OpaqueValue *src, size_t n, const Metadata *self)
            return new NativeFunction(Memory.readPointer(this._vwt.add(14 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer', 'pointer'])(dest, src, n, self);
        },

        enumerable: true
    },
    // offset 15*pointerSize
    initializeArrayWithTakeFrontToBack: {
        value: function value(dest, src, n, self) {
            // OpaqueValue *initializeArrayWithTakeFrontToBack(OpaqueValue *dest, OpaqueValue *src, size_t n, const Metadata *self)
            return new NativeFunction(Memory.readPointer(this._vwt.add(15 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer', 'pointer'])(dest, src, n, self);
        },

        enumerable: true
    },
    // offset 16*pointerSize
    initializeArrayWithTakeBackToFront: {
        value: function value(dest, src, n, self) {
            // OpaqueValue *initializeArrayWithTakeBackToFront(OpaqueValue *dest, OpaqueValue *src, size_t n, const Metadata *self)
            return new NativeFunction(Memory.readPointer(this._vwt.add(16 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer', 'pointer'])(dest, src, n, self);
        },

        enumerable: true
    },
    isValueInline: {
        get: function get() {
            return !this.flags.IsNonInline;
        },

        enumerable: true
    }
});
function ExtraInhabitantsValueWitnessTable(pointer) {
    ValueWitnessTable.call(this, pointer);
}
ExtraInhabitantsValueWitnessTable.prototype = (0, _create2.default)(ValueWitnessTable.prototype, {
    // offset 21*pointerSize
    storeExtraInhabitant: {
        value: function value(dest, index, self) {
            // void storeExtraInhabitant(OpaqueValue *dest, int index, const Metadata *self);
            return new NativeFunction(Memory.readPointer(this._vwt.add(21 * Process.pointerSize)), 'void', ['pointer', 'int', 'pointer'])(dest, index, self);
        },

        enumerable: true
    },
    // offset 22*pointerSize
    getExtraInhabitant: {
        value: function value(src, self) {
            // int getExtraInhabitantIndex(const OpaqueValue *src, const Metadata *self);
            return new NativeFunction(Memory.readPointer(this._vwt.add(22 * Process.pointerSize)), 'int', ['pointer', 'pointer'])(src, self);
        },

        enumerable: true
    }
});
function EnumValueWitnessTable(pointer) {
    ExtraInhabitantsValueWitnessTable.call(this, pointer);
}
EnumValueWitnessTable.prototype = (0, _create2.default)(ExtraInhabitantsValueWitnessTable.prototype, {
    // offset 23*pointerSize
    getEnumTag: {
        value: function value(src, self) {
            // int getEnumTag(const OpaqueValue *src, const Metadata *self);
            return new NativeFunction(Memory.readPointer(this._vwt.add(23 * Process.pointerSize)), 'int', ['pointer', 'pointer'])(src, self);
        },

        enumerable: true
    },
    // offset 24*pointerSize
    destructiveProjectEnumData: {
        value: function value(src, self) {
            // void destructiveProjectEnumData(OpaqueValue *src, const Metadata *self);
            return new NativeFunction(Memory.readPointer(this._vwt.add(24 * Process.pointerSize)), 'void', ['pointer', 'pointer'])(src, self);
        },

        enumerable: true
    },
    // offset 25*pointerSize
    destructiveInjectEnumTag: {
        value: function value(src, tag, self) {
            // void destructiveInjectEnumTag(OpaqueValue *src, int tag, const Metadata *self);
            return new NativeFunction(Memory.readPointer(this._vwt.add(25 * Process.pointerSize)), 'void', ['pointer', 'int', 'pointer'])(src, tag, self);
        },

        enumerable: true
    }
});

function TargetProtocolConformanceRecord(ptr) {
    this._ptr = ptr;
}
TargetProtocolConformanceRecord.prototype = {
    // offset 0
    get protocol() {
        return new TargetProtocolDescriptor(RelativeIndirectablePointer(this._ptr.add(0)));
    },
    // offset 4
    get directType() {
        return RelativeIndirectablePointer(this._ptr.add(4));
    },
    get indirectClass() {
        return RelativeIndirectablePointer(this._ptr.add(4));
    },
    get typeDescriptor() {
        return RelativeIndirectablePointer(this._ptr.add(4));
    },

    // offset 8
    get witnessTable() {
        return RelativeDirectPointer(this._ptr.add(8));
    },
    get witnessTableAccessor() {
        return RelativeDirectPointer(this._ptr.add(8));
    },

    // offset 12
    get flags() {
        return Memory.readU32(this._ptr.add(12));
    },

    getTypeKind: function getTypeKind() {
        var TypeKindMask = 0x0000000F;
        var TypeKindShift = 0;
        return (this.flags & TypeKindMask) >>> TypeKindShift; // see TypeMetadataRecordKind
    },
    getConformanceKind: function getConformanceKind() {
        var ConformanceKindMask = 0x00000010;
        var ConformanceKindShift = 4;
        return (this.flags & ConformanceKindMask) >>> ConformanceKindShift; // see ProtocolConformanceFlags
    },
    getDirectType: function getDirectType() {
        switch (this.getTypeKind()) {
            case TypeMetadataRecordKind.Universal:
                return null;
            case TypeMetadataRecordKind.UniqueDirectType:
            case TypeMetadataRecordKind.NonuniqueDirectType:
                break;

            case TypeMetadataRecordKind.UniqueDirectClass:
            case TypeMetadataRecordKind.UniqueIndirectClass:
            case TypeMetadataRecordKind.UniqueNominalTypeDescriptor:
                throw new Error("not direct type metadata");
        }
        return new TargetMetadata(this.directType);
    },
    getDirectClass: function getDirectClass() {
        switch (this.getTypeKind()) {
            case TypeMetadataRecordKind.Universal:
                return null;
            case TypeMetadataRecordKind.UniqueDirectClass:
                break;

            case TypeMetadataRecordKind.UniqueDirectType:
            case TypeMetadataRecordKind.NonuniqueDirectType:
            case TypeMetadataRecordKind.UniqueNominalTypeDescriptor:
            case TypeMetadataRecordKind.UniqueIndirectClass:
                throw new Error("not direct class object");
        }
        return this.directType;
    },
    getIndirectClass: function getIndirectClass() {
        switch (this.getTypeKind()) {
            case TypeMetadataRecordKind.Universal:
                return null;
            case TypeMetadataRecordKind.UniqueIndirectClass:
                break;

            case TypeMetadataRecordKind.UniqueDirectType:
            case TypeMetadataRecordKind.UniqueDirectClass:
            case TypeMetadataRecordKind.NonuniqueDirectType:
            case TypeMetadataRecordKind.UniqueNominalTypeDescriptor:
                throw new Error("not indirect class object");
        }
        return this.indirectClass;
    },
    getNominalTypeDescriptor: function getNominalTypeDescriptor() {
        switch (this.getTypeKind()) {
            case TypeMetadataRecordKind.Universal:
                return null;

            case TypeMetadataRecordKind.UniqueNominalTypeDescriptor:
                break;

            case TypeMetadataRecordKind.UniqueDirectClass:
            case TypeMetadataRecordKind.UniqueIndirectClass:
            case TypeMetadataRecordKind.UniqueDirectType:
            case TypeMetadataRecordKind.NonuniqueDirectType:
                throw new Error("not generic metadata pattern");
        }

        return new TargetNominalTypeDescriptor(this.typeDescriptor);
    },


    /// Get the directly-referenced static witness table.
    getStaticWitnessTable: function getStaticWitnessTable() {
        switch (this.getConformanceKind()) {
            case ProtocolConformanceReferenceKind.WitnessTable:
                break;

            case ProtocolConformanceReferenceKind.WitnessTableAccessor:
                throw new Error("no witness table");
        }
        return this.witnessTable;
    },
    getWitnessTableAccessor: function getWitnessTableAccessor() {
        switch (this.getConformanceKind()) {
            case ProtocolConformanceReferenceKind.WitnessTableAccessor:
                break;

            case ProtocolConformanceReferenceKind.WitnessTable:
                throw new Error("not witness table accessor");
        }
        return new NativeFunction(this.witnessTableAccessor, 'pointer', ['pointer']);
    },
    getCanonicalTypeMetadata: function getCanonicalTypeMetadata(api) {
        var classMetadata = null;
        switch (this.getTypeKind()) {
            case TypeMetadataRecordKind.UniqueDirectType:
                return this.getDirectType();
            case TypeMetadataRecordKind.NonuniqueDirectType:
                return new TargetMetadata(api.swift_getForeignTypeMetadata(this.getDirectType()._ptr));
            case TypeMetadataRecordKind.UniqueIndirectClass:
                classMetadata = Memory.readPointer(this.getIndirectClass());
                break;
            case TypeMetadataRecordKind.UniqueDirectClass:
                classMetadata = this.getDirectClass();
                break;
            case TypeMetadataRecordKind.UniqueNominalTypeDescriptor:
            case TypeMetadataRecordKind.Universal:
                return null;
        }
        if (classMetadata !== null && !classMetadata.isNull()) return new TargetMetadata(api.swift_getObjCClassMetadata(classMetadata));
        return null;
    },
    getWitnessTable: function getWitnessTable(type) {
        switch (this.getConformanceKind()) {
            case ProtocolConformanceReferenceKind.WitnessTable:
                return this.getStaticWitnessTable();

            case ProtocolConformanceReferenceKind.WitnessTableAccessor:
                return this.getWitnessTableAccessor()(this.type);
        }
    }
};
var ProtocolConformanceReferenceKind = {
    WitnessTable: 0,
    WitnessTableAccessor: 1
};

var FieldTypeFlags = {
    Indirect: 1,
    Weak: 2,

    typeMask: 0x3
};

var TypeMetadataRecordKind = {
    Universal: 0,
    UniqueDirectType: 1,
    NonuniqueDirectType: 2,
    UniqueIndirectClass: 3,
    UniqueNominalTypeDescriptor: 4,
    UniqueDirectClass: 0xF
};

function FlaggedPointer(type, bitPos) {
    var flagMask = 1 << bitPos;
    var pointerBitMask = ~flagMask;
    return function (val) {
        return {
            pointer: new type(val.and(pointerBitMask)),
            flag: !val.and(flagMask).isNull()
        };
    };
}
var Argument = FlaggedPointer(TargetMetadata, 0);

function RelativeDirectPointerIntPair(ptr) {
    var val = Memory.readS32(ptr);
    var offset = val & ~0x3;
    var intVal = val & 0x3;
    return {
        pointer: ptr.add(val & ~0x3),
        intVal: val & 0x3
    };
}
var NominalTypeKind = {
    "0": "Class",
    "1": "Struct",
    "2": "Enum",
    "3": "Optional"
};

var MetadataKind = {
    "0": "Class",
    "1": "Struct",
    "2": "Enum",
    "3": "Optional",

    "8": "Opaque",
    "9": "Tuple",
    "10": "Function",
    "12": "Existential",
    "13": "Metatype",
    "14": "ObjCClassWrapper",
    "15": "ExistentialMetatype",
    "16": "ForeignClass",
    "64": "HeapLocalVariable",
    "65": "HeapGenericLocalVariable",
    "128": "ErrorObject"
};

function TargetMetadata(pointer) {
    this._ptr = pointer;
    switch (this.kind) {
        case "Class":
            return new TargetClassMetadata(pointer);
        case "Struct":
            return new TargetValueMetadata(pointer);
        case "Enum":
        case "Optional":
            return new TargetEnumMetadata(pointer);
        //case "Opaque":
        case "Tuple":
            return new TargetTupleTypeMetadata(pointer);
        case "Function":
            return new TargetFunctionTypeMetadata(pointer);
        case "Existential":
            return new TargetExistentialTypeMetadata(pointer);
        case "Metatype":
            return new TargetMetatypeMetadata(pointer);
        case "ObjCClassWrapper":
            return new TargetObjCClassWrapperMetadata(pointer);
        case "ExistentialMetatype":
            return new TargetExistentialMetatypeMetadata(pointer);
        case "ForeignClass":
            return new TargetForeignTypeMetadata(pointer);
        // case "HeapLocalVariable":
        // case "HeapGenericLocalVariable":
        // case  "ErrorObject":
    }
}
TargetMetadata.prototype = {
    // offset -pointerSize
    get valueWitnessTable() {
        return new ValueWitnessTable(Memory.readPointer(this._ptr.sub(Process.pointerSize)));
    },

    get kind() {
        var val = Memory.readPointer(this._ptr);
        if (val.compare(ptr(4096)) > 0) {
            return "Class";
        }
        return MetadataKind[val.toInt32().toString()];
    },

    getNominalTypeDescriptor: function getNominalTypeDescriptor() {
        return null;
    },
    toString: function toString() {
        return "[TargetMetadata: " + this.kind + "@" + this._ptr + "]";
    }
};
var ClassFlags = {
    IsSwift1: 0x1,
    UsesSwift1Refcounting: 0x2,
    HasCustomObjCName: 0x4
};
function TargetClassMetadata(pointer) {
    this._ptr = pointer;
    if (this.kind !== "Class") throw new Error("type is not a class type");
}
TargetClassMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
    // offset -2 * pointerSize
    destructor: {
        get: function get() {
            if (this.isPureObjC()) throw new Error("destructor not available for ObjC classes");
            return Memory.readPointer(this._ptr.sub(2 * Process.pointerSize));
        },

        enumerable: true
    },
    // offset -1 * pointerSize
    valueWitnessTable: {
        get: function get() {
            if (this.isPureObjC()) throw new Error("valueWitnessTable not available for ObjC classes");
            return new ValueWitnessTable(Memory.readPointer(this._ptr.sub(Process.pointerSize)));
        },

        enumerable: true
    },

    // offset 0
    isa: {
        get: function get() {
            var val = Memory.readPointer(this._ptr);
            if (val.compare(ptr(4096)) <= 0) {
                return null;
            }
            return val;
        },

        enumerable: true
    },
    // offset pointerSize
    superClass: {
        get: function get() {
            if (this.isPureObjC()) return null;
            var val = Memory.readPointer(this._ptr.add(Process.pointerSize));
            return val.isNull() ? null : new TargetClassMetadata(val);
        },

        enumerable: true
    },
    // offset 2*pointerSize
    cacheData: {
        get: function get() {
            return [Memory.readPointer(this._ptr.add(2 * Process.pointerSize)), Memory.readPointer(this._ptr.add(3 * Process.pointerSize))];
        },

        enumerable: true
    },
    // offset 4 * pointerSize
    data: {
        get: function get() {
            return Memory.readPointer(this._ptr.add(4 * Process.pointerSize));
        },

        enumerable: true
    },
    // offset 5 * pointerSize
    flags: {
        get: function get() {
            if (this.isPureObjC()) throw new Error("flags not available for ObjC classes");
            return flagsToObject(ClassFlags, Memory.readU32(this._ptr.add(5 * Process.pointerSize)));
        },

        enumerable: true
    },
    // offset 5 * pointerSize + 4
    instanceAddressPoint: {
        get: function get() {
            if (this.isPureObjC()) throw new Error("instanceAddressPoint not available for ObjC classes");
            return Memory.readU32(this._ptr.add(4 + 5 * Process.pointerSize));
        },

        enumerable: true
    },
    // offset 5 * pointerSize + 8
    instanceSize: {
        get: function get() {
            if (this.isPureObjC()) throw new Error("instanceSize not available for ObjC classes");
            return Memory.readU32(this._ptr.add(8 + 5 * Process.pointerSize));
        },

        enumerable: true
    },
    // offset 5 * pointerSize + 12
    instanceAlignMask: {
        get: function get() {
            if (this.isPureObjC()) throw new Error("instanceAlignMask not available for ObjC classes");
            return Memory.readU16(this._ptr.add(12 + 5 * Process.pointerSize));
        },

        enumerable: true
    },
    // offset 5 * pointerSize + 14: reserved
    // offset 5 * pointerSize + 16
    classSize: {
        get: function get() {
            if (this.isPureObjC()) throw new Error("classSize not available for ObjC classes");
            return Memory.readU32(this._ptr.add(16 + 5 * Process.pointerSize));
        },

        enumerable: true
    },
    // offset 5 * pointerSize + 20
    classAddressPoint: {
        get: function get() {
            if (this.isPureObjC()) throw new Error("classAddressPoint not available for ObjC classes");
            return Memory.readU32(this._ptr.add(20 + 5 * Process.pointerSize));
        },

        enumerable: true
    },
    // offset 5 * pointerSize + 24
    description: {
        get: function get() {
            if (this.isPureObjC()) throw new Error("description not available for ObjC classes");
            return ConstTargetFarRelativeDirectPointer(this._ptr.add(24 + 5 * Process.pointerSize));
        },

        enumerable: true
    },
    // offset 6 * pointerSize + 24
    iVarDestroyer: {
        get: function get() {
            if (this.isPureObjC()) throw new Error("iVarDestroyer not available for ObjC classes");
            return new NativePointer(Memory.readPointer(this._ptr.add(24 + 6 * Process.pointerSize)), 'void', ['pointer']);
        },

        enumerable: true
    },
    // offset 7 * pointerSize + 24: superClass members (then superClass's superClass members...)
    //                          ... metadata reference for parent
    //                          ... generic parameters for this class
    //                          ... class variables
    //                          ... "tabulated" virtual methods

    isTypeMetadata: {
        value: function value() {
            return this.data.and(ptr(1)).equals(ptr(1));
        },
        enumerable: true
    },
    isPureObjC: {
        value: function value() {
            return !this.isTypeMetadata();
        },
        enumerable: true
    },
    isArtificialSubclass: {
        value: function value() {
            return this.description.compare(int64(0)) === 0;
        },
        enumerable: true
    },
    getDescription: {
        value: function value() {
            if (!this.isTypeMetadata()) throw new Error("assertion error");
            if (this.isArtificialSubclass()) throw new Error("assertion error");
            return this.description;
        },
        enumerable: true
    },
    getNominalTypeDescriptor: {
        value: function value() {
            if (this.isTypeMetadata() && !this.isArtificialSubclass()) return new TargetNominalTypeDescriptor(this.getDescription());else return null;
        },

        enumerable: true
    },
    getParentType: {
        value: function value(nominalType) {
            var genericParams = nominalType.genericParams;
            if (!genericParams.flags.HasParent) return null;

            return new TargetMetadata(this._ptr.add((genericParams.offset - 1) * Process.pointerSize));
        },

        enumerable: true
    },
    getGenericArgs: {
        value: function value() {
            return this.getNominalTypeDescriptor().getGenericArgs(this);
        },

        enumerable: true
    }
});
function TargetValueMetadata(pointer) {
    this._ptr = pointer;

    switch (this.kind) {
        case "Struct":
            break;
        default:
            throw new Error("type is not a value type");
    }
}
TargetValueMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
    // offset pointerSize
    description: {
        get: function get() {
            var val = ConstTargetFarRelativeDirectPointer(this._ptr.add(Process.pointerSize));
            if (val.isNull()) return null;
            return val;
        },

        enumerable: true
    },

    getGenericArgs: {
        value: function value() {
            return this.getNominalTypeDescriptor().getGenericArgs(this);
        },

        enumerable: true
    },
    getNominalTypeDescriptor: {
        value: function value() {
            if (this.description.isNull()) return null;
            return new TargetNominalTypeDescriptor(this.description);
        },

        enumerable: true
    }
});
function TargetEnumMetadata(pointer) {
    this._ptr = pointer;

    switch (this.kind) {
        case "Enum":
        case "Optional":
            break;
        default:
            throw new Error("type is not an enum type");
    }
}
TargetEnumMetadata.prototype = (0, _create2.default)(TargetValueMetadata.prototype, {
    valueWitnessTable: {
        get: function get() {
            return new EnumValueWitnessTable(Memory.readPointer(this._ptr.sub(Process.pointerSize)));
        },

        enumerable: true
    },
    payloadSize: {
        get: function get() {
            var nominalType = this.getNominalTypeDescriptor();
            if (!nominalType.enum_.hasPayloadSizeOffset()) return null;

            return Memory.readPointer(this._ptr.add(nominalType.enum_.getPayloadSizeOffset() * Process.pointerSize));
        },

        enumerable: true
    }
});

function TargetGenericMetadata(ptr) {
    this._ptr = ptr;
}
TargetGenericMetadata.prototype = {
    // offset 0
    get createFunction() {
        return new NativeFunction(Memory.readPointer(this._ptr.add(0)), 'pointer', ['pointer', 'pointer']);
    },

    // offset 0+pointerSize
    get metadataSize() {
        return Memory.readU32(this._ptr.add(0 + Process.pointerSize));
    },

    // offset 4+pointerSize
    get numKeyArguments() {
        return Memory.readU16(this._ptr.add(4 + Process.pointerSize));
    },

    // offset 6+pointerSize
    get addressPoint() {
        return Memory.readU16(this._ptr.add(6 + Process.pointerSize));
    },

    // offset 8+pointerSize
    get privateData() {
        return Memory.readByteArray(this._ptr.add(8 + Process.pointerSize), 16 * Process.pointerSize);
    },

    getMetadataTemplate: function getMetadataTemplate() {
        return this._ptr.add(8 + 17 * Process.pointerSize);
    },
    _getMetadata: function _getMetadata() {
        return new TargetMetadata(this.getMetadataTemplate().add(this.addressPoint));
    },
    getTemplateDescription: function getTemplateDescription() {
        var metadata = new TargetMetadata(this.getMetadataTemplate().add(this.addressPoint));
        return metadata.getNominalTypeDescriptor();
    }
};
function TargetTupleTypeMetadata(pointer) {
    this._ptr = pointer;

    if (this.kind != "Tuple") throw new Error("type is not a tuple type");
}
TargetTupleTypeMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
    // offset pointerSize
    numElements: {
        get: function get() {
            return uint64(Memory.readPointer(this._ptr.add(Process.pointerSize)).toString());
        },

        enumerable: true
    },
    // offset 2*pointerSize
    labels: {
        get: function get() {
            return Memory.readPointer(this._ptr.add(2 * Process.pointerSize));
        },

        enumerable: true
    },
    // offset 3*pointerSize
    elements: {
        get: function get() {
            var elems = [];
            var sizeOfTupleElement = 2 * Process.pointerSize;
            for (var i = 0; i < this.numElements; i++) {
                elems.push(new TupleElement(this._ptr.add(3 * Process.pointerSize + i * sizeOfTupleElement)));
            }
            return elems;
        },

        enumerable: true
    }
});
function TupleElement(pointer) {
    this._ptr = pointer;
}
TupleElement.prototype = {
    // offset 0
    get type() {
        return new TargetMetadata(Memory.readPointer(this._ptr));
    },
    // offset pointerSize
    get offset() {
        return Memory.readPointer(this._ptr.add(Process.pointerSize)).toInt32();
    }
};
function TargetFunctionTypeMetadata(pointer) {
    this._ptr = pointer;

    if (this.kind != "Function") throw new Error("type is not a function type");
}
TargetFunctionTypeMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
    // offset pointerSize
    flags: {
        get: function get() {
            var val = Memory.readPointer(this._ptr.add(Process.pointerSize));
            return {
                numArguments: val.and(TargetFunctionTypeFlags.NumArgumentsMask).toInt32(),
                convention: val.and(TargetFunctionTypeFlags.ConventionMask).shr(TargetFunctionTypeFlags.ConventionShift).toInt32(),
                doesThrow: !val.and(TargetFunctionTypeFlags.ThrowsMask).isNull()
            };
        },

        enumerable: true
    },
    // offset 2*pointerSize
    resultType: {
        get: function get() {
            return new TargetMetadata(Memory.readPointer(this._ptr.add(2 * Process.pointerSize)));
        },

        enumerable: true
    },
    // offset 3*pointerSize
    getArguments: {
        value: function value() {
            var count = this.flags.numArguments;
            var args = [];
            var ptr = this._ptr.add(3 * Process.pointerSize);
            for (var i = 0; i < count; i++) {
                var arg = new Argument(Memory.readPointer(ptr.add(i * Process.pointerSize)));
                args.push({
                    inout: arg.flag,
                    type: arg.pointer
                });
            }
            return args;
        },
        enumerable: true
    }
});
var ForeignTypeMetadataFlags = {
    HasInitializationFunction: 1
};
function TargetForeignTypeMetadata(pointer) {
    this._ptr = pointer;

    if (this.kind != "ForeignClass") throw new Error("type is not a foreign class type");
}
TargetForeignTypeMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
    // offset -2 * pointerSize
    flags: {
        get: function get() {
            return flagsToObject(ForeignTypeMetadataFlags, Memory.readPointer(this._ptr.sub(2 * Process.pointerSize)));
        },

        enumerable: true
    },
    // offset -3 * pointerSize
    unique: {
        get: function get() {
            return Memory.readPointer(this._ptr.sub(3 * Process.pointerSize));
        },

        enumerable: true
    },
    // offset -4*pointerSize
    name: {
        get: function get() {
            return Memory.readUtf8String(Memory.readPointer(this._ptr.sub(4 * Process.pointerSize)));
        },

        enumerable: true
    },
    // offset -5*pointerSize
    initializationFunction: {
        get: function get() {
            return new NativeFunction(Memory.readPointer(this._ptr.sub(5 * Process.pointerSize)), 'void', ['pointer']);
        },

        enumerable: true
    }
});
function TargetObjCClassWrapperMetadata(pointer) {
    this._ptr = pointer;

    if (this.kind !== "ObjCClassWrapper") throw new Error("type is not a ObjC class wrapper type");
}
TargetObjCClassWrapperMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
    // offset pointerSize
    class_: {
        get: function get() {
            return Memory.readPointer(this._ptr.add(Process.pointerSize));
        },

        enumerable: true
    }
});
function ExistentialTypeFlags(val) {
    this._val = val;
}
ExistentialTypeFlags.prototype = {
    NumWitnessTablesMask: 0x00FFFFFF,
    ClassConstraintMask: 0x80000000,
    HasSuperclassMask: 0x40000000,
    SpecialProtocolMask: 0x3F000000,
    SpecialProtocolShift: 24,

    getNumWitnessTables: function getNumWitnessTables() {
        return this._val & this.NumWitnessTablesMask;
    },
    getClassConstraint: function getClassConstraint() {
        return !!(this._val & this.ClassConstraintMask) ? "Any" : "Class";
    },
    hasSuperclassConstraint: function hasSuperclassConstraint() {
        return !!(this._val & this.HasSuperclassMask);
    },
    getSpecialProtocol: function getSpecialProtocol() {
        var SpecialProtocol = ["None", "Error"];
        return SpecialProtocol[(this._val & this.SpecialProtocolMask) >> this.SpecialProtocolShift];
    }
};
function TargetExistentialTypeMetadata(pointer) {
    this._ptr = pointer;

    if (this.kind != "Existential") throw new Error("type is not a existential type");
}
TargetExistentialTypeMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
    // offset pointerSize
    flags: {
        get: function get() {
            return new ExistentialTypeFlags(Memory.readPointer(this._ptr.add(Process.pointerSize)));
        },

        enumerable: true
    },
    // offset 2*pointerSize
    protocols: {
        get: function get() {
            return new TargetProtocolDescriptorList(this._ptr.add(2 * Process.pointerSize));
        },

        enumerable: true
    },

    getRepresentation: {
        value: function value() {
            // Some existentials use special containers.
            switch (this.flags.getSpecialProtocol()) {
                case "Error":
                    return "Error";
                case "None":
                    break;
            }
            // The layout of standard containers depends on whether the existential is
            // class-constrained.
            if (this.isClassBounded()) return "Class";
            return "Opaque";
        },

        enumerable: true
    },
    isObjC: {
        value: function value() {
            return this.isClassBounded() && this.flags.getNumWitnessTables() == 0;
        },

        enumerable: true
    },
    isClassBounded: {
        value: function value() {
            return this.flags.getClassConstraint() == "Class";
        },

        enumerable: true
    },
    getSuperclassConstraint: {
        value: function value() {
            if (this.isObjC() || !this.flags.hasSuperclassConstraint()) return null;

            // Get a pointer to tail-allocated storage for this metadata record.
            // The superclass immediately follows the list of protocol descriptors.
            var ptr = this._ptr.add(Process.pointerSize * (3 + this.protocols.length));

            return new TargetMetadata(Memory.readPointer(ptr));
        },

        enumerable: true
        /*mayTakeValue*/
        /*deinitExistentialContainer*/
        /*projectValue*/
        /*getDynamicType*/
        /*getWitnessTable*/
    } });
function TargetExistentialMetatypeMetadata(pointer) {
    this._ptr = pointer;
    if (this.kind !== "ExistentialMetatype") throw new Error("type is not a metatype");
}
TargetExistentialMetatypeMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
    // offset pointerSize
    instanceType: {
        get: function get() {
            return new TargetMetadata(Memory.readPointer(this._ptr.add(Process.pointerSize)));
        },

        enumerable: true
    },
    // offset 2*pointerSize
    flags: {
        get: function get() {
            return new ExistentialTypeFlags(Memory.readPointer(this._ptr.add(2 * Process.pointerSize)));
        },

        enumerable: true
    },

    isObjC: {
        value: function value() {
            return this.isClassBounded() && this.flags.getNumWitnessTables() == 0;
        },

        enumerable: true
    },
    isClassBounded: {
        value: function value() {
            return this.flags.getClassConstraint() == "Class";
        },

        enumerable: true
    }
});
function TargetMetatypeMetadata(pointer) {
    this._ptr = pointer;
    if (this.kind !== "Metatype") throw new Error("type is not a metatype");
}
TargetMetatypeMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
    // offset pointerSize
    instanceType: {
        get: function get() {
            return new TargetMetadata(Memory.readPointer(this._ptr.add(Process.pointerSize)));
        },

        enumerable: true
    }
});

function TargetProtocolDescriptorList(pointer) {
    if (pointer.isNull()) return [];
    var numProtocols = Memory.readPointer(pointer).toInt32();
    var res = [];
    for (var i = 0; i < numProtocols; i++) {
        res.push(new TargetProtocolDescriptor(Memory.readPointer(pointer.add((i + 1) * Process.pointerSize))));
    }
    res.arrayLocation = pointer.add(Process.pointerSize);
    return res;
}
function TargetProtocolDescriptor(pointer) {
    this._ptr = pointer;
}
TargetProtocolDescriptor.prototype = {
    // offset 0
    get _ObjC_Isa() {
        return Memory.readPointer(this._ptr.add(0));
    },
    // offset pointerSize
    get name() {
        return Memory.readUtf8String(Memory.readPointer(this._ptr.add(Process.pointerSize)));
    },
    // offset 2*pointerSize
    get inheritedProtocols() {
        return new TargetProtocolDescriptorList(Memory.readPointer(this._ptr.add(2 * Process.pointerSize)));
    },
    // offset 3*pointerSize
    get _ObjC_InstanceMethods() {
        return Memory.readPointer(this._ptr.add(3 * Process.pointerSize));
    },
    // offset 4*pointerSize
    get _ObjC_ClassMethods() {
        return Memory.readPointer(this._ptr.add(4 * Process.pointerSize));
    },
    // offset 5*pointerSize
    get _ObjC_OptionalInstanceMethods() {
        return Memory.readPointer(this._ptr.add(5 * Process.pointerSize));
    },
    // offset 6*pointerSize
    get _ObjC_OptionalClassMethods() {
        return Memory.readPointer(this._ptr.add(6 * Process.pointerSize));
    },
    // offset 7*pointerSize
    get _ObjC_InstanceProperties() {
        return Memory.readPointer(this._ptr.add(7 * Process.pointerSize));
    },
    // offset 8*pointerSize
    get descriptorSize() {
        return Memory.readU32(this._ptr.add(8 * Process.pointerSize));
    },
    // offset 8*pointerSize + 4
    get flags() {
        return flagsToObject(ProtocolDescriptorFlags, Memory.readU32(this._ptr.add(8 * Process.pointerSize + 4)));
    },
    // offset 8*pointerSize + 8
    get minimumWitnessTableSizeInWords() {
        if (!this.flags.IsResilient) throw new Error("minimum witness table size not known!");
        return Memory.readU16(this._ptr.add(8 * Process.pointerSize + 8));
    },
    // offset 8*pointerSize + 10
    get defaultWitnessTableSizeInWords() {
        if (!this.flags.IsResilient) throw new Error("default witness table size not known!");
        return Memory.readU16(this._ptr.add(8 * Process.pointerSize + 8));
    },
    // offset 8*pointerSize + 12
    get reserved() {
        return Memory.readU32(this._ptr.add(8 * Process.pointerSize + 12));
    },

    // offset 8*pointerSize + 16
    getDefaultWitnesses: function getDefaultWitnesses() {
        if (!this.flags.IsResilient) throw new Error("default witness table not known!");
        // table with minimum size + default size entries
        return this._ptr.add(8 * Process.pointerSize + 16);
    }
};
var ProtocolDescriptorFlags = {
    IsSwift: 1,
    ClassConstraint: 2,
    DispatchStrategyMask: 0x3c,
    DispatchStrategyShift: 2,
    SpecialProtocolMask: 0x3C0,
    SpecialProtocolShift: 6,
    IsResilient: 0x400,
    _ObjCReserved: 0xFFFF0000
};

var TargetFunctionTypeFlags = {
    NumArgumentsMask: 0x00FFFFFF,
    ConventionMask: 0x0F000000,
    ConventionShift: 24,
    ThrowsMask: 0x10000000
};
var FunctionMetadataConvention = {
    Swift: 0,
    Block: 1,
    Thin: 2,
    CFunctionPointer: 3
};
var FunctionConventionStrings = ["swift", "block", "thin", "c"];

function RelativeIndirectablePointer(addr) {
    var relativeOffsetPlusIndirect = Memory.readS32(addr);
    var offset = relativeOffsetPlusIndirect & ~1;

    var val = addr.add(offset);
    if ((relativeOffsetPlusIndirect & 1) === 0) {
        // direct reference
        return val;
    } else {
        // indirect reference
        return Memory.readPointer(val);
    }
}
function ConstTargetFarRelativeDirectPointer(ptr) {
    var offset = Memory.readPointer(ptr);
    return ptr.add(offset);
}
function TargetRelativeDirectPointerRuntime(ptr, nullable) {
    var offset = Memory.readS32(ptr);
    if (nullable && offset === 0) return null;
    return ptr.add(offset);
}
var GenericParameterDescriptorFlags = {
    HasParent: 1,
    HasGenericParent: 2
};
function TargetNominalTypeDescriptor(ptr) {
    this._ptr = ptr;
}
TargetNominalTypeDescriptor.prototype = {
    // offset 0
    get mangledName() {
        var addr = TargetRelativeDirectPointerRuntime(this._ptr, true);
        return mangling.MANGLING_PREFIX + "0" + Memory.readUtf8String(addr);
    },
    // offset 4
    get clas() {
        if (this.getKind() !== "Class" && this.getKind() !== "Struct") throw new Error('this nominal type descriptor has no class or struct metadata');

        var ptr = this._ptr.add(4);
        return {
            _ptr: ptr,

            // offset 0
            get numFields() {
                return Memory.readU32(ptr.add(0));
            },
            // offset 4
            get fieldOffsetVectorOffset() {
                return Memory.readU32(ptr.add(4));
            },
            // offset 8
            // doubly-null-terminated list of strings
            get fieldNames() {
                return TargetRelativeDirectPointerRuntime(ptr.add(8), true);
            },
            // offset 12
            get getFieldTypes() {
                return TargetRelativeDirectPointerRuntime(ptr.add(12), true);
            },
            hasFieldOffsetVector: function hasFieldOffsetVector() {
                return this.fieldOffsetVectorOffset !== 0;
            }
        };
    },

    // offset 4
    get struct() {
        if (this.getKind() !== "Struct") throw new Error('this nominal type descriptor has no enum metadata');

        return this.clas;
    },

    // offset 4
    get enum_() {
        var ptr = this._ptr.add(4);
        if (this.getKind() !== "Enum" && this.getKind() !== "Optional") throw new Error('this nominal type descriptor has no enum metadata');

        return {
            // offset 0
            get numPayloadCasesAndPayloadSizeOffset() {
                return Memory.readU32(ptr.add(0));
            },
            // offset 4
            get numEmptyCases() {
                return Memory.readU32(ptr.add(4));
            },
            // offset 8
            // doubly-null-terminated list of strings
            get caseNames() {
                return TargetRelativeDirectPointerRuntime(ptr.add(8), true);
            },
            // offset 12
            get getCaseTypes() {
                return TargetRelativeDirectPointerRuntime(ptr.add(12), true);
            },

            getNumPayloadCases: function getNumPayloadCases() {
                return this.numPayloadCasesAndPayloadSizeOffset & 0x00FFFFFF;
            },
            getNumCases: function getNumCases() {
                return this.getNumPayloadCases() + this.numEmptyCases;
            },
            getPayloadSizeOffset: function getPayloadSizeOffset() {
                return (this.numPayloadCasesAndPayloadSizeOffset & 0xFF000000) >> 24;
            },
            hasPayloadSizeOffset: function hasPayloadSizeOffset() {
                return this.getPayloadSizeOffset() !== 0;
            }
        };
    },

    // offset 20
    get genericMetadataPatternAndKind() {
        return RelativeDirectPointerIntPair(this._ptr.add(20));
    },

    // offset 24
    get accessFunction() {
        return TargetRelativeDirectPointerRuntime(this._ptr.add(24), true);
    },

    getGenericMetadataPattern: function getGenericMetadataPattern() {
        return new TargetGenericMetadata(this.genericMetadataPatternAndKind.pointer);
    },
    getKind: function getKind() {
        return NominalTypeKind[this.genericMetadataPatternAndKind.intVal];
    },
    offsetToNameOffset: function offsetToNameOffset() {
        return 0;
    },


    // offset 28
    get genericParams() {
        var ptr = this._ptr.add(28);
        return {
            // offset 0
            get offset() {
                if (!this.isGeneric()) throw new Error("not generic!");
                return Memory.readU32(ptr.add(0));
            },
            // offset 4
            get numGenericRequirements() {
                return Memory.readU32(ptr.add(4));
            },
            // offset 8
            get numPrimaryParams() {
                return Memory.readU32(ptr.add(8));
            },
            // offset 12
            get flags() {
                return flagsToObject(GenericParameterDescriptorFlags, Memory.readU32(ptr.add(12)));
            },

            hasGenericRequirements: function hasGenericRequirements() {
                return this.numGenericRequirements > 0;
            },
            isGeneric: function isGeneric() {
                return this.hasGenericRequirements() || this.flags.HasGenericParent;
            }
        };
    },

    toString: function toString() {
        return "[TargetNominalType@" + this._ptr + ": " + this.mangledName + "]";
    },
    getGenericArgs: function getGenericArgs(canon) {
        var params = this.genericParams;
        var args = [];
        if (params.hasGenericRequirements()) {
            // the shift acts on signed 32bit numbers, like we need here
            var offset = params.offset << (0, _log2.default)(Process.pointerSize);
            for (var i = 0; i < params.numPrimaryParams; i++) {
                var _ptr = Memory.readPointer(canon._ptr.add(offset));
                if (_ptr.isNull()) args.push(null);else args.push(new TargetMetadata(_ptr));
                offset += Process.pointerSize;
            }
        }
        return args;
    }
};

function TargetTypeMetadataRecord(record) {
    this._record = record;
}
TargetTypeMetadataRecord.prototype = {
    get _directType() {
        return TargetRelativeDirectPointerRuntime(this._record, true);
    },
    get _typeDescriptor() {
        return TargetRelativeDirectPointerRuntime(this._record, true);
    },

    get _flags() {
        return Memory.readUInt(this._record.add(4));
    },

    getTypeKind: function getTypeKind() {
        var TypeKindMask = 0x0000000F;
        var TypeKindShift = 0;
        return (this._flags & TypeKindMask) >>> TypeKindShift; // see TypeMetadataRecordKind
    },
    getDirectType: function getDirectType() {
        switch (this.getTypeKind()) {
            case TypeMetadataRecordKind.Universal:
                return null;

            case TypeMetadataRecordKind.UniqueDirectType:
            case TypeMetadataRecordKind.NonuniqueDirectType:
            case TypeMetadataRecordKind.UniqueDirectClass:
                break;

            case TypeMetadataRecordKind.UniqueIndirectClass:
            case TypeMetadataRecordKind.UniqueNominalTypeDescriptor:
                throw new Error("not direct type metadata");

            default:
                throw new Error("invalid type kind");
        }

        return this._directType;
    },
    getNominalTypeDescriptor: function getNominalTypeDescriptor() {
        switch (this.getTypeKind()) {
            case TypeMetadataRecordKind.Universal:
                return null;

            case TypeMetadataRecordKind.UniqueNominalTypeDescriptor:
                break;

            case TypeMetadataRecordKind.UniqueDirectClass:
            case TypeMetadataRecordKind.UniqueIndirectClass:
            case TypeMetadataRecordKind.UniqueDirectType:
            case TypeMetadataRecordKind.NonuniqueDirectType:
                throw new Error("not generic metadata pattern");

            default:
                throw new Error("invalid type kind");
        }

        return new TargetNominalTypeDescriptor(this._typeDescriptor);
    },
    getCanonicalTypeMetadata: function getCanonicalTypeMetadata(api) {
        // returns a Metadata* for non-generic types
        var res = null;
        switch (this.getTypeKind()) {
            case TypeMetadataRecordKind.UniqueDirectType:
                res = this.getDirectType();
                break;
            case TypeMetadataRecordKind.NonuniqueDirectType:
                res = api.swift_getForeignTypeMetadata(this.getDirectType());
                break;
            case TypeMetadataRecordKind.UniqueDirectClass:
                var directType = this.getDirectType();
                if (directType) {
                    res = api.swift_getObjCClassMetadata(directType);
                }
                break;
            default:
                break;
        }
        return res === null ? null : new TargetMetadata(res);
    }
};

function OpaqueExistentialContainer(pointer) {
    this._ptr = pointer;
}
OpaqueExistentialContainer.prototype = {
    // offset 0
    get fixedSizeBuffer0() {
        return Memory.readPointer(this._ptr.add(0));
    },
    set fixedSizeBuffer0(value) {
        Memory.writePointer(this._ptr.add(0), value);
    },
    // class types have a pointer in the fixedSizeBuffer
    get heapObject() {
        return new HeapObject(this.fixedSizeBuffer0);
    },
    // offset 1*pointerSize
    get fixedSizeBuffer1() {
        return Memory.readPointer(this._ptr.add(Process.pointerSize));
    },
    // offset 2*pointerSize
    get fixedSizeBuffer2() {
        return Memory.readPointer(this._ptr.add(2 * Process.pointerSize));
    },
    // offset 3*pointerSize
    get type() {
        return new TargetMetadata(Memory.readPointer(this._ptr.add(3 * Process.pointerSize)));
    },
    set type(value) {
        Memory.writePointer(this._ptr.add(3 * Process.pointerSize), value._ptr);
    },
    // offset 4*pointerSize
    getWitnessTable: function getWitnessTable(index) {
        return Memory.readPointer(this._ptr.add((4 + index) * Process.pointerSize));
    },
    setWitnessTable: function setWitnessTable(index, val) {
        return Memory.writePointer(this._ptr.add((4 + index) * Process.pointerSize), val);
    }
};
function ClassExistentialContainer(pointer) {
    this._ptr = pointer;
}
ClassExistentialContainer.prototype = {
    // offset 0
    get heapObject() {
        return new HeapObject(Memory.readPointer(this._ptr.add(0)));
    },
    // offset pointerSize
    getWitnessTable: function getWitnessTable(index) {
        return Memory.readPointer(this._ptr.add((1 + index) * Process.pointerSize));
    }
};

function HeapObject(pointer) {
    this._ptr = pointer;
}
HeapObject.prototype = {
    // offset 0
    get heapMetadata() {
        return new TargetMetadata(Memory.readPointer(this._ptr.add(0)));
    }
};

var ProtocolClassConstraint = {
    Class: 0,
    Any: 1
};

module.exports = {
    TargetMetadata: TargetMetadata,
    TargetClassMetadata: TargetClassMetadata,
    TargetProtocolConformanceRecord: TargetProtocolConformanceRecord,
    TargetTypeMetadataRecord: TargetTypeMetadataRecord,
    TargetNominalTypeDescriptor: TargetNominalTypeDescriptor,
    TargetFunctionTypeFlags: TargetFunctionTypeFlags,
    NominalTypeKind: NominalTypeKind,
    TypeMetadataRecordKind: TypeMetadataRecordKind,
    FieldTypeFlags: FieldTypeFlags,
    FunctionMetadataConvention: FunctionMetadataConvention,
    FunctionConventionStrings: FunctionConventionStrings,
    MetadataKind: MetadataKind,
    OpaqueExistentialContainer: OpaqueExistentialContainer,
    ClassExistentialContainer: ClassExistentialContainer,
    ProtocolClassConstraint: ProtocolClassConstraint,
    TargetProtocolDescriptor: TargetProtocolDescriptor
};

},{"./mangling":5,"babel-runtime/core-js/get-iterator":8,"babel-runtime/core-js/math/log2":11,"babel-runtime/core-js/object/create":12,"babel-runtime/core-js/object/entries":15}],7:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/array/from"), __esModule: true };
},{"core-js/library/fn/array/from":26}],8:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":27}],9:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/json/stringify"), __esModule: true };
},{"core-js/library/fn/json/stringify":28}],10:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/map"), __esModule: true };
},{"core-js/library/fn/map":29}],11:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/math/log2"), __esModule: true };
},{"core-js/library/fn/math/log2":30}],12:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":31}],13:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-properties"), __esModule: true };
},{"core-js/library/fn/object/define-properties":32}],14:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":33}],15:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/entries"), __esModule: true };
},{"core-js/library/fn/object/entries":34}],16:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptors"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptors":35}],17:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/keys"), __esModule: true };
},{"core-js/library/fn/object/keys":36}],18:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/prevent-extensions"), __esModule: true };
},{"core-js/library/fn/object/prevent-extensions":37}],19:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/reflect/define-property"), __esModule: true };
},{"core-js/library/fn/reflect/define-property":38}],20:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/reflect/delete-property"), __esModule: true };
},{"core-js/library/fn/reflect/delete-property":39}],21:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/reflect/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/reflect/set-prototype-of":40}],22:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/set"), __esModule: true };
},{"core-js/library/fn/set":41}],23:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":42}],24:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":43}],25:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _iterator = require("../core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require("../core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"../core-js/symbol":23,"../core-js/symbol/iterator":24}],26:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
module.exports = require('../../modules/_core').Array.from;

},{"../../modules/_core":58,"../../modules/es6.array.from":124,"../../modules/es6.string.iterator":138}],27:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');

},{"../modules/core.get-iterator":123,"../modules/es6.string.iterator":138,"../modules/web.dom.iterable":150}],28:[function(require,module,exports){
var core = require('../../modules/_core');
var $JSON = core.JSON || (core.JSON = { stringify: JSON.stringify });
module.exports = function stringify(it) { // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};

},{"../../modules/_core":58}],29:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.map');
require('../modules/es7.map.to-json');
require('../modules/es7.map.of');
require('../modules/es7.map.from');
module.exports = require('../modules/_core').Map;

},{"../modules/_core":58,"../modules/es6.map":126,"../modules/es6.object.to-string":133,"../modules/es6.string.iterator":138,"../modules/es7.map.from":140,"../modules/es7.map.of":141,"../modules/es7.map.to-json":142,"../modules/web.dom.iterable":150}],30:[function(require,module,exports){
require('../../modules/es6.math.log2');
module.exports = require('../../modules/_core').Math.log2;

},{"../../modules/_core":58,"../../modules/es6.math.log2":127}],31:[function(require,module,exports){
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D) {
  return $Object.create(P, D);
};

},{"../../modules/_core":58,"../../modules/es6.object.create":128}],32:[function(require,module,exports){
require('../../modules/es6.object.define-properties');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperties(T, D) {
  return $Object.defineProperties(T, D);
};

},{"../../modules/_core":58,"../../modules/es6.object.define-properties":129}],33:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};

},{"../../modules/_core":58,"../../modules/es6.object.define-property":130}],34:[function(require,module,exports){
require('../../modules/es7.object.entries');
module.exports = require('../../modules/_core').Object.entries;

},{"../../modules/_core":58,"../../modules/es7.object.entries":143}],35:[function(require,module,exports){
require('../../modules/es7.object.get-own-property-descriptors');
module.exports = require('../../modules/_core').Object.getOwnPropertyDescriptors;

},{"../../modules/_core":58,"../../modules/es7.object.get-own-property-descriptors":144}],36:[function(require,module,exports){
require('../../modules/es6.object.keys');
module.exports = require('../../modules/_core').Object.keys;

},{"../../modules/_core":58,"../../modules/es6.object.keys":131}],37:[function(require,module,exports){
require('../../modules/es6.object.prevent-extensions');
module.exports = require('../../modules/_core').Object.preventExtensions;

},{"../../modules/_core":58,"../../modules/es6.object.prevent-extensions":132}],38:[function(require,module,exports){
require('../../modules/es6.reflect.define-property');
module.exports = require('../../modules/_core').Reflect.defineProperty;

},{"../../modules/_core":58,"../../modules/es6.reflect.define-property":134}],39:[function(require,module,exports){
require('../../modules/es6.reflect.delete-property');
module.exports = require('../../modules/_core').Reflect.deleteProperty;

},{"../../modules/_core":58,"../../modules/es6.reflect.delete-property":135}],40:[function(require,module,exports){
require('../../modules/es6.reflect.set-prototype-of');
module.exports = require('../../modules/_core').Reflect.setPrototypeOf;

},{"../../modules/_core":58,"../../modules/es6.reflect.set-prototype-of":136}],41:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.set');
require('../modules/es7.set.to-json');
require('../modules/es7.set.of');
require('../modules/es7.set.from');
module.exports = require('../modules/_core').Set;

},{"../modules/_core":58,"../modules/es6.object.to-string":133,"../modules/es6.set":137,"../modules/es6.string.iterator":138,"../modules/es7.set.from":145,"../modules/es7.set.of":146,"../modules/es7.set.to-json":147,"../modules/web.dom.iterable":150}],42:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
require('../../modules/es7.symbol.async-iterator');
require('../../modules/es7.symbol.observable');
module.exports = require('../../modules/_core').Symbol;

},{"../../modules/_core":58,"../../modules/es6.object.to-string":133,"../../modules/es6.symbol":139,"../../modules/es7.symbol.async-iterator":148,"../../modules/es7.symbol.observable":149}],43:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks-ext').f('iterator');

},{"../../modules/_wks-ext":120,"../../modules/es6.string.iterator":138,"../../modules/web.dom.iterable":150}],44:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],45:[function(require,module,exports){
module.exports = function () { /* empty */ };

},{}],46:[function(require,module,exports){
module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

},{}],47:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":77}],48:[function(require,module,exports){
var forOf = require('./_for-of');

module.exports = function (iter, ITERATOR) {
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

},{"./_for-of":68}],49:[function(require,module,exports){
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

},{"./_to-absolute-index":111,"./_to-iobject":113,"./_to-length":114}],50:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx = require('./_ctx');
var IObject = require('./_iobject');
var toObject = require('./_to-object');
var toLength = require('./_to-length');
var asc = require('./_array-species-create');
module.exports = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || asc;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IObject(O);
    var f = ctx(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

},{"./_array-species-create":52,"./_ctx":60,"./_iobject":74,"./_to-length":114,"./_to-object":115}],51:[function(require,module,exports){
var isObject = require('./_is-object');
var isArray = require('./_is-array');
var SPECIES = require('./_wks')('species');

module.exports = function (original) {
  var C;
  if (isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};

},{"./_is-array":76,"./_is-object":77,"./_wks":121}],52:[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = require('./_array-species-constructor');

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};

},{"./_array-species-constructor":51}],53:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof');
var TAG = require('./_wks')('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

},{"./_cof":54,"./_wks":121}],54:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],55:[function(require,module,exports){
'use strict';
var dP = require('./_object-dp').f;
var create = require('./_object-create');
var redefineAll = require('./_redefine-all');
var ctx = require('./_ctx');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var $iterDefine = require('./_iter-define');
var step = require('./_iter-step');
var setSpecies = require('./_set-species');
var DESCRIPTORS = require('./_descriptors');
var fastKey = require('./_meta').fastKey;
var validate = require('./_validate-collection');
var SIZE = DESCRIPTORS ? '_s' : 'size';

var getEntry = function (that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index];
  // frozen object case
  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

module.exports = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, NAME, '_i');
      that._t = NAME;         // collection type
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = validate(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = validate(this, NAME);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        validate(this, NAME);
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while (entry && entry.r) entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(validate(this, NAME), key);
      }
    });
    if (DESCRIPTORS) dP(C.prototype, 'size', {
      get: function () {
        return validate(this, NAME)[SIZE];
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var entry = getEntry(that, key);
    var prev, index;
    // change existing entry
    if (entry) {
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++;
      // add to index
      if (index !== 'F') that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function (C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function (iterated, kind) {
      this._t = validate(iterated, NAME); // target
      this._k = kind;                     // kind
      this._l = undefined;                // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l;
      // revert to the last existing entry
      while (entry && entry.r) entry = entry.p;
      // get next entry
      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if (kind == 'keys') return step(0, entry.k);
      if (kind == 'values') return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};

},{"./_an-instance":46,"./_ctx":60,"./_descriptors":62,"./_for-of":68,"./_iter-define":80,"./_iter-step":82,"./_meta":85,"./_object-create":86,"./_object-dp":87,"./_redefine-all":101,"./_set-species":106,"./_validate-collection":118}],56:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = require('./_classof');
var from = require('./_array-from-iterable');
module.exports = function (NAME) {
  return function toJSON() {
    if (classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};

},{"./_array-from-iterable":48,"./_classof":53}],57:[function(require,module,exports){
'use strict';
var global = require('./_global');
var $export = require('./_export');
var meta = require('./_meta');
var fails = require('./_fails');
var hide = require('./_hide');
var redefineAll = require('./_redefine-all');
var forOf = require('./_for-of');
var anInstance = require('./_an-instance');
var isObject = require('./_is-object');
var setToStringTag = require('./_set-to-string-tag');
var dP = require('./_object-dp').f;
var each = require('./_array-methods')(0);
var DESCRIPTORS = require('./_descriptors');

module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};
  if (!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    C = wrapper(function (target, iterable) {
      anInstance(target, C, NAME, '_c');
      target._c = new Base();
      if (iterable != undefined) forOf(iterable, IS_MAP, target[ADDER], target);
    });
    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','), function (KEY) {
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if (KEY in proto && !(IS_WEAK && KEY == 'clear')) hide(C.prototype, KEY, function (a, b) {
        anInstance(this, C, KEY);
        if (!IS_ADDER && IS_WEAK && !isObject(a)) return KEY == 'get' ? undefined : false;
        var result = this._c[KEY](a === 0 ? 0 : a, b);
        return IS_ADDER ? this : result;
      });
    });
    IS_WEAK || dP(C.prototype, 'size', {
      get: function () {
        return this._c.size;
      }
    });
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F, O);

  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

  return C;
};

},{"./_an-instance":46,"./_array-methods":50,"./_descriptors":62,"./_export":66,"./_fails":67,"./_for-of":68,"./_global":69,"./_hide":71,"./_is-object":77,"./_meta":85,"./_object-dp":87,"./_redefine-all":101,"./_set-to-string-tag":107}],58:[function(require,module,exports){
var core = module.exports = { version: '2.5.1' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],59:[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp');
var createDesc = require('./_property-desc');

module.exports = function (object, index, value) {
  if (index in object) $defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};

},{"./_object-dp":87,"./_property-desc":100}],60:[function(require,module,exports){
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

},{"./_a-function":44}],61:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],62:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":67}],63:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":69,"./_is-object":77}],64:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],65:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};

},{"./_object-gops":92,"./_object-keys":95,"./_object-pie":96}],66:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var ctx = require('./_ctx');
var hide = require('./_hide');
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
    if (own && key in exports) continue;
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

},{"./_core":58,"./_ctx":60,"./_global":69,"./_hide":71}],67:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],68:[function(require,module,exports){
var ctx = require('./_ctx');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var anObject = require('./_an-object');
var toLength = require('./_to-length');
var getIterFn = require('./core.get-iterator-method');
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;

},{"./_an-object":47,"./_ctx":60,"./_is-array-iter":75,"./_iter-call":78,"./_to-length":114,"./core.get-iterator-method":122}],69:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],70:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],71:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":62,"./_object-dp":87,"./_property-desc":100}],72:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":69}],73:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":62,"./_dom-create":63,"./_fails":67}],74:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":54}],75:[function(require,module,exports){
// check on default Array iterator
var Iterators = require('./_iterators');
var ITERATOR = require('./_wks')('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};

},{"./_iterators":83,"./_wks":121}],76:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

},{"./_cof":54}],77:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],78:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};

},{"./_an-object":47}],79:[function(require,module,exports){
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

},{"./_hide":71,"./_object-create":86,"./_property-desc":100,"./_set-to-string-tag":107,"./_wks":121}],80:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var has = require('./_has');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

},{"./_export":66,"./_has":70,"./_hide":71,"./_iter-create":79,"./_iterators":83,"./_library":84,"./_object-gpo":93,"./_redefine":102,"./_set-to-string-tag":107,"./_wks":121}],81:[function(require,module,exports){
var ITERATOR = require('./_wks')('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};

},{"./_wks":121}],82:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],83:[function(require,module,exports){
module.exports = {};

},{}],84:[function(require,module,exports){
module.exports = true;

},{}],85:[function(require,module,exports){
var META = require('./_uid')('meta');
var isObject = require('./_is-object');
var has = require('./_has');
var setDesc = require('./_object-dp').f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !require('./_fails')(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};

},{"./_fails":67,"./_has":70,"./_is-object":77,"./_object-dp":87,"./_uid":117}],86:[function(require,module,exports){
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

},{"./_an-object":47,"./_dom-create":63,"./_enum-bug-keys":64,"./_html":72,"./_object-dps":88,"./_shared-key":108}],87:[function(require,module,exports){
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

},{"./_an-object":47,"./_descriptors":62,"./_ie8-dom-define":73,"./_to-primitive":116}],88:[function(require,module,exports){
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

},{"./_an-object":47,"./_descriptors":62,"./_object-dp":87,"./_object-keys":95}],89:[function(require,module,exports){
var pIE = require('./_object-pie');
var createDesc = require('./_property-desc');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var has = require('./_has');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};

},{"./_descriptors":62,"./_has":70,"./_ie8-dom-define":73,"./_object-pie":96,"./_property-desc":100,"./_to-iobject":113,"./_to-primitive":116}],90:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject');
var gOPN = require('./_object-gopn').f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":91,"./_to-iobject":113}],91:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};

},{"./_enum-bug-keys":64,"./_object-keys-internal":94}],92:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],93:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

},{"./_has":70,"./_shared-key":108,"./_to-object":115}],94:[function(require,module,exports){
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

},{"./_array-includes":49,"./_has":70,"./_shared-key":108,"./_to-iobject":113}],95:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":64,"./_object-keys-internal":94}],96:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],97:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export');
var core = require('./_core');
var fails = require('./_fails');
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};

},{"./_core":58,"./_export":66,"./_fails":67}],98:[function(require,module,exports){
var getKeys = require('./_object-keys');
var toIObject = require('./_to-iobject');
var isEnum = require('./_object-pie').f;
module.exports = function (isEntries) {
  return function (it) {
    var O = toIObject(it);
    var keys = getKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) if (isEnum.call(O, key = keys[i++])) {
      result.push(isEntries ? [key, O[key]] : O[key]);
    } return result;
  };
};

},{"./_object-keys":95,"./_object-pie":96,"./_to-iobject":113}],99:[function(require,module,exports){
// all object keys, includes non-enumerable and symbols
var gOPN = require('./_object-gopn');
var gOPS = require('./_object-gops');
var anObject = require('./_an-object');
var Reflect = require('./_global').Reflect;
module.exports = Reflect && Reflect.ownKeys || function ownKeys(it) {
  var keys = gOPN.f(anObject(it));
  var getSymbols = gOPS.f;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};

},{"./_an-object":47,"./_global":69,"./_object-gopn":91,"./_object-gops":92}],100:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],101:[function(require,module,exports){
var hide = require('./_hide');
module.exports = function (target, src, safe) {
  for (var key in src) {
    if (safe && target[key]) target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};

},{"./_hide":71}],102:[function(require,module,exports){
module.exports = require('./_hide');

},{"./_hide":71}],103:[function(require,module,exports){
'use strict';
// https://tc39.github.io/proposal-setmap-offrom/
var $export = require('./_export');
var aFunction = require('./_a-function');
var ctx = require('./_ctx');
var forOf = require('./_for-of');

module.exports = function (COLLECTION) {
  $export($export.S, COLLECTION, { from: function from(source /* , mapFn, thisArg */) {
    var mapFn = arguments[1];
    var mapping, A, n, cb;
    aFunction(this);
    mapping = mapFn !== undefined;
    if (mapping) aFunction(mapFn);
    if (source == undefined) return new this();
    A = [];
    if (mapping) {
      n = 0;
      cb = ctx(mapFn, arguments[2], 2);
      forOf(source, false, function (nextItem) {
        A.push(cb(nextItem, n++));
      });
    } else {
      forOf(source, false, A.push, A);
    }
    return new this(A);
  } });
};

},{"./_a-function":44,"./_ctx":60,"./_export":66,"./_for-of":68}],104:[function(require,module,exports){
'use strict';
// https://tc39.github.io/proposal-setmap-offrom/
var $export = require('./_export');

module.exports = function (COLLECTION) {
  $export($export.S, COLLECTION, { of: function of() {
    var length = arguments.length;
    var A = Array(length);
    while (length--) A[length] = arguments[length];
    return new this(A);
  } });
};

},{"./_export":66}],105:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object');
var anObject = require('./_an-object');
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};

},{"./_an-object":47,"./_ctx":60,"./_is-object":77,"./_object-gopd":89}],106:[function(require,module,exports){
'use strict';
var global = require('./_global');
var core = require('./_core');
var dP = require('./_object-dp');
var DESCRIPTORS = require('./_descriptors');
var SPECIES = require('./_wks')('species');

module.exports = function (KEY) {
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};

},{"./_core":58,"./_descriptors":62,"./_global":69,"./_object-dp":87,"./_wks":121}],107:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":70,"./_object-dp":87,"./_wks":121}],108:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":109,"./_uid":117}],109:[function(require,module,exports){
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});
module.exports = function (key) {
  return store[key] || (store[key] = {});
};

},{"./_global":69}],110:[function(require,module,exports){
var toInteger = require('./_to-integer');
var defined = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

},{"./_defined":61,"./_to-integer":112}],111:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":112}],112:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],113:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":61,"./_iobject":74}],114:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":112}],115:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":61}],116:[function(require,module,exports){
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

},{"./_is-object":77}],117:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],118:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it, TYPE) {
  if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};

},{"./_is-object":77}],119:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var LIBRARY = require('./_library');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-dp').f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};

},{"./_core":58,"./_global":69,"./_library":84,"./_object-dp":87,"./_wks-ext":120}],120:[function(require,module,exports){
exports.f = require('./_wks');

},{"./_wks":121}],121:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":69,"./_shared":109,"./_uid":117}],122:[function(require,module,exports){
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

},{"./_classof":53,"./_core":58,"./_iterators":83,"./_wks":121}],123:[function(require,module,exports){
var anObject = require('./_an-object');
var get = require('./core.get-iterator-method');
module.exports = require('./_core').getIterator = function (it) {
  var iterFn = get(it);
  if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};

},{"./_an-object":47,"./_core":58,"./core.get-iterator-method":122}],124:[function(require,module,exports){
'use strict';
var ctx = require('./_ctx');
var $export = require('./_export');
var toObject = require('./_to-object');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var toLength = require('./_to-length');
var createProperty = require('./_create-property');
var getIterFn = require('./core.get-iterator-method');

$export($export.S + $export.F * !require('./_iter-detect')(function (iter) { Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = getIterFn(O);
    var length, result, step, iterator;
    if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for (result = new C(length); length > index; index++) {
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":59,"./_ctx":60,"./_export":66,"./_is-array-iter":75,"./_iter-call":78,"./_iter-detect":81,"./_to-length":114,"./_to-object":115,"./core.get-iterator-method":122}],125:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"./_add-to-unscopables":45,"./_iter-define":80,"./_iter-step":82,"./_iterators":83,"./_to-iobject":113}],126:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');
var validate = require('./_validate-collection');
var MAP = 'Map';

// 23.1 Map Objects
module.exports = require('./_collection')(MAP, function (get) {
  return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key) {
    var entry = strong.getEntry(validate(this, MAP), key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value) {
    return strong.def(validate(this, MAP), key === 0 ? 0 : key, value);
  }
}, strong, true);

},{"./_collection":57,"./_collection-strong":55,"./_validate-collection":118}],127:[function(require,module,exports){
// 20.2.2.22 Math.log2(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  log2: function log2(x) {
    return Math.log(x) / Math.LN2;
  }
});

},{"./_export":66}],128:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', { create: require('./_object-create') });

},{"./_export":66,"./_object-create":86}],129:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperties: require('./_object-dps') });

},{"./_descriptors":62,"./_export":66,"./_object-dps":88}],130:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperty: require('./_object-dp').f });

},{"./_descriptors":62,"./_export":66,"./_object-dp":87}],131:[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./_to-object');
var $keys = require('./_object-keys');

require('./_object-sap')('keys', function () {
  return function keys(it) {
    return $keys(toObject(it));
  };
});

},{"./_object-keys":95,"./_object-sap":97,"./_to-object":115}],132:[function(require,module,exports){
// 19.1.2.15 Object.preventExtensions(O)
var isObject = require('./_is-object');
var meta = require('./_meta').onFreeze;

require('./_object-sap')('preventExtensions', function ($preventExtensions) {
  return function preventExtensions(it) {
    return $preventExtensions && isObject(it) ? $preventExtensions(meta(it)) : it;
  };
});

},{"./_is-object":77,"./_meta":85,"./_object-sap":97}],133:[function(require,module,exports){

},{}],134:[function(require,module,exports){
// 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
var dP = require('./_object-dp');
var $export = require('./_export');
var anObject = require('./_an-object');
var toPrimitive = require('./_to-primitive');

// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
$export($export.S + $export.F * require('./_fails')(function () {
  // eslint-disable-next-line no-undef
  Reflect.defineProperty(dP.f({}, 1, { value: 1 }), 1, { value: 2 });
}), 'Reflect', {
  defineProperty: function defineProperty(target, propertyKey, attributes) {
    anObject(target);
    propertyKey = toPrimitive(propertyKey, true);
    anObject(attributes);
    try {
      dP.f(target, propertyKey, attributes);
      return true;
    } catch (e) {
      return false;
    }
  }
});

},{"./_an-object":47,"./_export":66,"./_fails":67,"./_object-dp":87,"./_to-primitive":116}],135:[function(require,module,exports){
// 26.1.4 Reflect.deleteProperty(target, propertyKey)
var $export = require('./_export');
var gOPD = require('./_object-gopd').f;
var anObject = require('./_an-object');

$export($export.S, 'Reflect', {
  deleteProperty: function deleteProperty(target, propertyKey) {
    var desc = gOPD(anObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  }
});

},{"./_an-object":47,"./_export":66,"./_object-gopd":89}],136:[function(require,module,exports){
// 26.1.14 Reflect.setPrototypeOf(target, proto)
var $export = require('./_export');
var setProto = require('./_set-proto');

if (setProto) $export($export.S, 'Reflect', {
  setPrototypeOf: function setPrototypeOf(target, proto) {
    setProto.check(target, proto);
    try {
      setProto.set(target, proto);
      return true;
    } catch (e) {
      return false;
    }
  }
});

},{"./_export":66,"./_set-proto":105}],137:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');
var validate = require('./_validate-collection');
var SET = 'Set';

// 23.2 Set Objects
module.exports = require('./_collection')(SET, function (get) {
  return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value) {
    return strong.def(validate(this, SET), value = value === 0 ? 0 : value, value);
  }
}, strong);

},{"./_collection":57,"./_collection-strong":55,"./_validate-collection":118}],138:[function(require,module,exports){
'use strict';
var $at = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

},{"./_iter-define":80,"./_string-at":110}],139:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global = require('./_global');
var has = require('./_has');
var DESCRIPTORS = require('./_descriptors');
var $export = require('./_export');
var redefine = require('./_redefine');
var META = require('./_meta').KEY;
var $fails = require('./_fails');
var shared = require('./_shared');
var setToStringTag = require('./_set-to-string-tag');
var uid = require('./_uid');
var wks = require('./_wks');
var wksExt = require('./_wks-ext');
var wksDefine = require('./_wks-define');
var enumKeys = require('./_enum-keys');
var isArray = require('./_is-array');
var anObject = require('./_an-object');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var createDesc = require('./_property-desc');
var _create = require('./_object-create');
var gOPNExt = require('./_object-gopn-ext');
var $GOPD = require('./_object-gopd');
var $DP = require('./_object-dp');
var $keys = require('./_object-keys');
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !require('./_library')) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    if (it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    replacer = args[1];
    if (typeof replacer == 'function') $replacer = replacer;
    if ($replacer || !isArray(replacer)) replacer = function (key, value) {
      if ($replacer) value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);

},{"./_an-object":47,"./_descriptors":62,"./_enum-keys":65,"./_export":66,"./_fails":67,"./_global":69,"./_has":70,"./_hide":71,"./_is-array":76,"./_library":84,"./_meta":85,"./_object-create":86,"./_object-dp":87,"./_object-gopd":89,"./_object-gopn":91,"./_object-gopn-ext":90,"./_object-gops":92,"./_object-keys":95,"./_object-pie":96,"./_property-desc":100,"./_redefine":102,"./_set-to-string-tag":107,"./_shared":109,"./_to-iobject":113,"./_to-primitive":116,"./_uid":117,"./_wks":121,"./_wks-define":119,"./_wks-ext":120}],140:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
require('./_set-collection-from')('Map');

},{"./_set-collection-from":103}],141:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
require('./_set-collection-of')('Map');

},{"./_set-collection-of":104}],142:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export = require('./_export');

$export($export.P + $export.R, 'Map', { toJSON: require('./_collection-to-json')('Map') });

},{"./_collection-to-json":56,"./_export":66}],143:[function(require,module,exports){
// https://github.com/tc39/proposal-object-values-entries
var $export = require('./_export');
var $entries = require('./_object-to-array')(true);

$export($export.S, 'Object', {
  entries: function entries(it) {
    return $entries(it);
  }
});

},{"./_export":66,"./_object-to-array":98}],144:[function(require,module,exports){
// https://github.com/tc39/proposal-object-getownpropertydescriptors
var $export = require('./_export');
var ownKeys = require('./_own-keys');
var toIObject = require('./_to-iobject');
var gOPD = require('./_object-gopd');
var createProperty = require('./_create-property');

$export($export.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = toIObject(object);
    var getDesc = gOPD.f;
    var keys = ownKeys(O);
    var result = {};
    var i = 0;
    var key, desc;
    while (keys.length > i) {
      desc = getDesc(O, key = keys[i++]);
      if (desc !== undefined) createProperty(result, key, desc);
    }
    return result;
  }
});

},{"./_create-property":59,"./_export":66,"./_object-gopd":89,"./_own-keys":99,"./_to-iobject":113}],145:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
require('./_set-collection-from')('Set');

},{"./_set-collection-from":103}],146:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
require('./_set-collection-of')('Set');

},{"./_set-collection-of":104}],147:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export = require('./_export');

$export($export.P + $export.R, 'Set', { toJSON: require('./_collection-to-json')('Set') });

},{"./_collection-to-json":56,"./_export":66}],148:[function(require,module,exports){
require('./_wks-define')('asyncIterator');

},{"./_wks-define":119}],149:[function(require,module,exports){
require('./_wks-define')('observable');

},{"./_wks-define":119}],150:[function(require,module,exports){
require('./es6.array.iterator');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var TO_STRING_TAG = require('./_wks')('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}

},{"./_global":69,"./_hide":71,"./_iterators":83,"./_wks":121,"./es6.array.iterator":125}],151:[function(require,module,exports){
'use strict';

var _defineProperty = require('babel-runtime/core-js/reflect/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _preventExtensions = require('babel-runtime/core-js/object/prevent-extensions');

var _preventExtensions2 = _interopRequireDefault(_preventExtensions);

var _deleteProperty = require('babel-runtime/core-js/reflect/delete-property');

var _deleteProperty2 = _interopRequireDefault(_deleteProperty);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _defineProperty3 = require('babel-runtime/core-js/object/define-property');

var _defineProperty4 = _interopRequireDefault(_defineProperty3);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _defineProperties = require('babel-runtime/core-js/object/define-properties');

var _defineProperties2 = _interopRequireDefault(_defineProperties);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var metadata = require('./metadata');

var _require = require('./calling-convention'),
    CC = _require.convention,
    makeCallTrampoline = _require.makeCallTrampoline,
    checkTrampolineError = _require.checkTrampolineError,
    convertToCParams = _require.convertToCParams;

var selfPointers = new _map2.default();
// We need to hook this function at startup, because hooking it seems to happen asynchronously
// (maybe because this is basically self-modifying code?) and we don't want to run into race-conditions.
var toCStringPtr = Module.findExportByName("libswiftFoundation.dylib", "_T0s14StringProtocolP10FoundationsAARzSS5IndexVADRtzlE01cA0Says4Int8VGSgSSACE8EncodingV5using_tF");
if (toCStringPtr) {
    Interceptor.attach(toCStringPtr, {
        onEnter: function onEnter() {
            if (selfPointers.has(this.threadId)) {
                this.context[CC.selfRegister] = selfPointers.get(this.threadId);
                selfPointers.delete(this.threadId);
            }
        }
    });
}
var dumpPtr = Module.findExportByName("libswiftCore.dylib", "_T0s4dumpxx_q_z2toSSSg4nameSi6indentSi8maxDepthSi0E5Itemsts16TextOutputStreamR_r0_lF");
var indirectResults = void 0;
if (dumpPtr && CC.indirectResultRegister !== undefined) {
    indirectResults = new _map2.default();
    Interceptor.attach(dumpPtr, {
        onEnter: function onEnter() {
            if (indirectResults.has(this.threadId)) {
                this.context[CC.indirectResultRegister] = indirectResults.get(this.threadId)[1];
                indirectResults.delete(this.threadId);
            }
        }
    });
}

function swiftToString(obj) {
    // TODO: debug crash on 32bit
    var type = obj.$type;
    var pointer = obj.$pointer;
    /*
     * built by disassembling the code for this snippet:
     *
        var str = String()
        dump(x, to: &str)
        let arr : [CChar] = str.cString(using: String.Encoding.utf8)!
        let ptr = UnsafePointer<CChar>(arr)
        strlen(ptr)
     */
    function __swift_destroy_boxed_opaque_existential_0(pointer) {
        var opaque = new metadata.OpaqueExistentialContainer(pointer);
        var type = opaque.type;
        var vwt = opaque.type.valueWitnessTable;
        if (vwt.flags.IsNonInline) {
            var _swift_release_ = new NativeFunction(Memory.readPointer(Swift._api._swift_release), 'void', ['pointer']);
            _swift_release_(opaque.fixedSizeBuffer0);
        } else {
            vwt.destroy(pointer, type._ptr);
        }
    }

    var SwiftString = Swift._typesByName.get("Swift.String");
    if (!SwiftString.canonicalType) SwiftString = SwiftString.withGenericParams();

    var dynamicType = void 0;

    var copy = Memory.alloc(4 * Process.pointerSize);
    var copyFn = void 0;
    var vwt = type.canonicalType.valueWitnessTable;
    if (type.kind === "Existential" && type.canonicalType.getRepresentation() === "Opaque") {
        dynamicType = Swift._api.swift_getDynamicType(pointer, type.canonicalType._ptr, 1);
        copyFn = vwt.initializeBufferWithCopyOfBuffer;
    } else {
        dynamicType = type.canonicalType._ptr;
        copyFn = vwt.initializeBufferWithCopy;
    }
    copyFn.call(vwt, copy, pointer, dynamicType);
    Memory.writePointer(copy.add(3 * Process.pointerSize), dynamicType);

    var stringResult = Memory.alloc(Process.pointerSize * 3);
    Memory.writePointer(stringResult, Swift._api._T0s19_emptyStringStorages6UInt32Vv);
    Memory.writePointer(stringResult.add(Process.pointerSize), ptr(0));
    Memory.writePointer(stringResult.add(2 * Process.pointerSize), ptr(0));

    var textOutputStreamWitnessTableForString = Swift._api._T0SSs16TextOutputStreamsWP;
    var Any = Swift._api.swift_getExistentialTypeMetadata(1, ptr(0), 0, ptr(0));

    var dump = Swift._api._T0s4dumpxx_q_z2toSSSg4nameSi6indentSi8maxDepthSi0E5Itemsts16TextOutputStreamR_r0_lF;

    var LONG_MAX = ptr(0).not().shr(1);

    var returnAlloc = Memory.alloc(4 * Process.pointerSize);
    // TODO: default arguments should in theory be retrieved via generator functions
    var params = [
    /*value*/copy,
    /*to*/stringResult,
    /*name*/ptr(0), ptr(0), ptr(0), 1, // nil
    /*indent*/ptr(0),
    /*maxDepth*/LONG_MAX,
    /*maxItems*/LONG_MAX,
    /*static type of `value`*/Any,
    /*static type of `to`*/SwiftString.canonicalType._ptr,
    /*how to use `to` as a TextOutputStream*/textOutputStreamWitnessTableForString];
    if (CC.indirectResultRegister === undefined) {
        // indirect return value is just another parameter
        params.unshift(returnAlloc);
    } else {
        // indirect return value is set by the installed hook
        indirectResults.set(threadId, returnAlloc);
    }

    dump.apply(null, params);

    // Destroy the return value (a copy of the existential container for the dumped value).
    __swift_destroy_boxed_opaque_existential_0(returnAlloc);

    var encoding = Memory.readPointer(Swift._api._T0SS10FoundationE8EncodingV4utf8ACfau());

    var witnessTableStringProtocol = Swift._api._T0SSs14StringProtocolsWP;
    var listener = void 0;
    var threadId = Process.getCurrentThreadId();
    var toCString = new NativeFunction(toCStringPtr, 'pointer', ['pointer', 'pointer', 'pointer']);

    selfPointers.set(threadId, stringResult);
    var array = toCString(encoding, SwiftString.canonicalType._ptr, witnessTableStringProtocol);

    // the `BridgeObject` this `[CChar]?` contains somewhere deep down is Opaque, so we can't use type
    // metadata to find this offset
    var str = Memory.readUtf8String(array.add(8 + 3 * Process.pointerSize));

    Swift._api.swift_unknownRelease(Memory.readPointer(stringResult.add(2 * Process.pointerSize)));
    Swift._api.swift_bridgeObjectRelease(array);

    return str;
}

function isClassType(t) {
    return t.kind === "Class" || t.kind === "Existential" && t.canonicalType.getRepresentation() === "Class";
}

function makeFunctionWrapper(type, pointer) {
    if (type.kind !== "Function") throw new TypeError("this value has a non-function type, so it cannot be called");

    return function () {
        var flags = type.functionFlags;

        for (var _len = arguments.length, argList = Array(_len), _key = 0; _key < _len; _key++) {
            argList[_key] = arguments[_key];
        }

        if (argList.length < flags.numArguments) {
            throw new TypeError("missing arguments: " + flags.numArguments + " arguments required");
        } else if (argList.length > flags.numArguments) {
            throw new TypeError("too many arguments: " + flags.numArguments + " arguments required");
        }

        if (flags.doesThrow) {
            throw new Error("calling a function that can throw is not yet supported"); // TODO
        }

        switch (flags.convention) {
            case metadata.FunctionMetadataConvention.Swift:
                {
                    if (params.length !== method.args.length) throw new Error("wrong number of parameters");
                    var converted = [];

                    // see NativeConventionSchema::getCoercionTypes
                    for (var i = 0; i < params.length; i++) {
                        // TODO: floats/doubles, vectors
                        // see classifyArgumentType in swift-clang/lib/CodeGen/TargetInfo.cpp
                        var _type = method.args[i].type;
                        var vwt = _type.canonicalType.valueWitnessTable;
                        if (vwt.size === 0) continue;

                        // TODO: verify these are the right conditions for indirect args
                        if (method.args[i].inout || vwt.flags.IsNonBitwiseTakable || vwt.size > CC.maxInlineArgument) {
                            var val = Memory.alloc(Process.pointerSize);
                            val.writePointer(method.args[i].$pointer);
                            // TODO: conversion from JS types
                            converted.push({ val: val, size: Process.pointerSize, stride: Process.pointerSize });
                        } else {
                            var _val = Memory.alloc(vwt.size);
                            if ("$pointer" in params[i] || !('fromJS' in _type) || !_type.fromJS(_val, params[i])) vwt.initializeWithCopy(_val, params[i].$pointer, _type.canonicalType._ptr);
                            converted.push({ val: _val, size: vwt.size, stide: vwt.stride });
                        }
                    }
                    var self = pointer;
                    var indirectReturn = false;
                    var cReturnType = 'void';
                    if (method.returnType) {
                        var _vwt = method.returnType.valueWitnessTable;
                        // TODO: verify these are the right conditions for indirect returns
                        if (_vwt.size > CC.maxInlineReturn || _vwt.flags.IsNonPOD) {
                            indirectReturn = true;
                            var _val2 = Memory.alloc(_vwt.size);
                            converted.unshift({ val: _val2, size: Process.pointerSize, stride: Process.pointerSize });
                        } else {
                            var alignedSize = _vwt.size + _vwt.stride;
                            var _cReturnType = [];
                            var maxVoluntaryInt = Process.pointerSize;
                            var _arr = [8, 4, 2, 1];
                            for (var _i = 0; _i < _arr.length; _i++) {
                                var size = _arr[_i];
                                // TODO: specify larger integers for int types larger than pointers
                                while (size <= maxVoluntaryInt && alignedSize > 0 && alignedSize % size === 0) {
                                    // TODO: floats/doubles, vectors
                                    _cReturnType.push('uint' + (size * 8).toString());
                                    alignedSize -= size;
                                }
                            }
                        }
                    }

                    var indirectResultPointer = undefined;
                    if (indirectReturn && CC.indirectResultRegister) indirectResultPointer = converted.shift()[0];

                    cParams = convertToCParams(params);

                    var trampoline = makeCallTrampoline(method.address, method.doesThrow, self, indirectResultPointer);
                    var trampolineFn = new NativeFunction(trampoline.callAddr, cReturnType, cArgTypes);
                    trampolineFn.apply(undefined, cParams);

                    var err = void 0;
                    if (method.doesThrow) {
                        err = checkTrampolineError();
                        if (err !== undefined) {
                            // TODO: swift_getErrorValue
                            throw new Error("handling errors not yet implemented");
                            return err;
                        }
                    }

                    var retVal = undefined;
                    if (method.returnType) {
                        var _vwt2 = method.returnType.valueWitnessTable;
                        var loc = void 0;
                        if (indirectReturn) {
                            loc = converted[0][0];
                        } else {
                            loc = Memory.alloc(_vwt2.size);
                            for (var _i2 = 0; _i2 < _vwt2.size; _i2 += Process.pointerSize) {
                                Memory.writePointer(loc.add(_i2), registerState[CC.returnRegisters[_i2]]);
                            }
                        }
                        if ('toJS' in method.returnType) retVal = field.type.toJS(loc);

                        if (retVal === undefined) retVal = makeWrapper(method.returnType, loc, true);else _vwt2.destroy(loc, method.returnType.canonicalType._ptr);
                    }
                    return retVal;
                }
            case metadata.FunctionMetadataConvention.Block:
                {
                    var block = new ObjC.Block(pointer);
                    return block.implementation.apply(block, params);
                }
            case metadata.FunctionMetadataConvention.Thin:
                throw new Error("calling thin functions not yet supported");
            case metadata.FunctionMetadataConvention.CFunctionPointer:
                {
                    var convertType = function convertType(swiftType, swiftOrJSVal) {
                        var fridaType = void 0,
                            jsVal = void 0;
                        jsVal = "toJS" in argType ? argType.toJS(swiftOrJSVal.$pointer) : swiftOrJSVal;
                        switch (argType.toString()) {
                            case "Builtin.Int8":
                            case "Swift.Int8":
                                fridaType = "int8";
                                break;
                            case "Builtin.UInt8":
                            case "Swift.UInt8":
                                fridaType = "uint8";
                                break;
                            case "Builtin.Int16":
                            case "Swift.Int16":
                                fridaType = "int16";
                                break;
                            case "Builtin.UInt16":
                            case "Swift.UInt16":
                                fridaType = "uint16";
                                break;
                            case "Builtin.Int32":
                            case "Swift.Int32":
                                fridaType = "int32";
                                break;
                            case "Builtin.UInt32":
                            case "Swift.UInt32":
                                fridaType = "uint32";
                                break;
                            case "Builtin.Int64":
                            case "Swift.Int64":
                                fridaType = "int64";
                                break;
                            case "Builtin.UInt64":
                            case "Swift.UInt64":
                                fridaType = "uint64";
                                break;
                            case "Swift.Double":
                                fridaType = "double";
                                break;
                            case "Swift.Float":
                                fridaType = "float";
                                break;
                            case "()":
                                fridaType = "void";
                                jsVal = undefined;
                                break;
                            default:
                                if (argType.nominalType && argType.nominalType.mangledName === "_T0SP") {
                                    fridaType = "pointer";
                                    if (swiftOrJsVal instanceof NativePointer) jsVal = swiftOrJsVal;else if (jsVal !== undefined) jsVal = Memory.readPointer(swiftOrJsVal.$pointer);
                                } else {
                                    throw new Error("don't know how to convert a '" + argType.toString() + "' to a C value!");
                                }
                        }

                        return { fridaType: fridaType, jsVal: jsVal };
                    };

                    var _params = [];
                    var fridaTypes = [];
                    var argTypes = type.getArguments();

                    for (var _i3 = 0; _i3 < flags.numArguments; _i3++) {
                        var res = convertType(argTypes[_i3], argList[_i3]);
                        if (res.jsVal === undefined && res.fridaType !== "void") {
                            throw new Error("argument " + _i3 + " must not be undefined");
                        }
                        fridaTypes.push(res.fridaType);
                        _params.push(res.jsVal);
                    }

                    var returnType = convertType(type.returnType, undefined);
                    var func = new NativeFunction(Memory.readPointer(pointer), returnType, fridaTypes);
                    return func.apply(undefined, _params);
                }
        }
    };
}

function escapeName(name, obj) {
    if (name.startsWith("$")) name = "$" + name;
    while (name in obj) {
        if (!name.startsWith("$")) name = "$" + name;
        name = "$" + name;
    }
    return obj;
}

function makeWrapper(type, pointer, owned) {
    if (!pointer || pointer.isNull()) {
        throw new Error("value can't be located at NULL");
    }

    var staticType = type;
    if ("$kind" in type) {
        // an ObjC type
        // TODO: check the `owned` variable
        return ObjC.Object(Memory.readPointer(pointer));
    }

    var wrapperObject = {};
    if (type.kind === "Function") {
        wrapperObject = makeFunctionWrapper(type, pointer);
    } else if (isClassType(type)) {
        var object = Memory.readPointer(pointer);
        var canonical = ObjC.api.object_getClass(object);
        type = Swift._typeFromCanonical(canonical);
    }

    wrapperObject.$staticType = staticType;
    wrapperObject.$type = type;
    wrapperObject.$pointer = pointer;

    wrapperObject.toString = swiftToString.bind(undefined, wrapperObject);

    if (isClassType(type)) {
        (0, _defineProperties2.default)(wrapperObject, {
            '$isa': {
                enumerable: true,
                get: function get() {
                    var object = Memory.readPointer(pointer);
                    return Memory.readPointer(object.add(0));
                }
            },
            '$retainCounts': {
                enumerable: true,
                get: function get() {
                    var object = Memory.readPointer(pointer);
                    return Swift._api.CFGetRetainCount(object);
                }
            }
        });
    }

    if ('enumCases' in type) {
        var enumCases = type.enumCases();
        if (enumCases.length === 1) {
            wrapperObject.$enumCase = 0;
        } else if (enumCases.length !== 0) {
            var numPayloads = type.nominalType.enum_.getNumPayloadCases();
            Object.defineProperty(wrapperObject, '$enumCase', {
                enumerable: true,
                get: function get() {
                    var tag = void 0;
                    if (numPayloads === 0) {
                        // a C-like enum: an integer just large enough to represent all cases
                        if (enumCases.length < 1 << 8) tag = Memory.readU8(pointer);else if (enumCases.length < 1 << 16) tag = Memory.readU16(pointer);else if (enumCases.length < 1 << 32) tag = Memory.readU32(pointer);else if (enumCases.length < 1 << 64) tag = Memory.readU64(pointer);else throw new Error("impossibly large number of enum cases");
                    } else if (numPayloads === 1) {
                        // single-payload enum: tag is after the value, or in spare bits if available
                        var opaqueVal = pointer;
                        var payloadType = enumCases[0].type.canonicalType._ptr;
                        tag = Swift._api.swift_getEnumCaseSinglePayload(opaqueVal, payloadType, enumCases.length - numPayloads);
                    } else {
                        // multi-payload enum:
                        // - all non-payload cases are collapsed into a single tag, secondary tag to
                        //   differentiate them is stored in place of value
                        // - tag is stored in spare bits shared by all values
                        // - all remaining bits of tag (that don't fit in spare bits) are appended to the value
                        var _opaqueVal = pointer;
                        tag = Swift._api.swift_getEnumCaseMultiPayload(_opaqueVal, type.nominalType._ptr);
                    }
                    // tag is in range [-ElementsWithPayload..ElementsWithNoPayload-1]
                    // but we want an index into the array returned by enumCases()
                    return tag + numPayloads;
                }
            });
            if (numPayloads > 0) {
                Object.defineProperty(wrapperObject, '$enumPayloadCopy', {
                    enumerable: true,
                    value: function value() {
                        var curCase = enumCases[this.$enumCase];
                        if (curCase.type === null) return undefined;

                        // TODO: Maybe we should copy the whole enum, and then remove the tag
                        // instead of removing the tag, copying the payload, then adding the tag back.

                        var enumVwt = type.canonicalType.valueWitnessTable;
                        var payloadVwt = curCase.type.canonicalType.valueWitnessTable;
                        enumVwt.destructiveProjectEnumData(pointer, type.canonicalType._ptr);

                        var payload = Memory.alloc(payloadVwt.size.toInt32());
                        var address = curCase.indirect ? Swift._api.swift_projectBox(pointer) : pointer;
                        payloadVwt.initializeWithCopy(payload, pointer, curCase.type.canonicalType._ptr);

                        enumVwt.destructiveInjectEnumTag(pointer, curCase.tag, type.canonicalType._ptr);

                        return makeWrapper(curCase.type, payload, true);
                    }
                });
            }
            // TODO: add a way to change current enum case + payload
        }
    }

    if ("fields" in type) {
        var _loop = function _loop() {
            if (_isArray) {
                if (_i4 >= _iterator.length) return 'break';
                _ref = _iterator[_i4++];
            } else {
                _i4 = _iterator.next();
                if (_i4.done) return 'break';
                _ref = _i4.value;
            }

            var field = _ref;

            var getAddr = function getAddr() {
                var addr = void 0;
                if (type.kind === "Struct") {
                    addr = pointer.add(field.offset);
                } else {
                    // Class
                    var _object = Memory.readPointer(pointer);
                    addr = _object.add(field.offset);
                }
                return addr;
            };
            var fieldName = escapeName(field.name, wrapperObject);

            (0, _defineProperty4.default)(wrapperObject, fieldName, {
                enumerable: true,
                get: function get() {
                    var addr = getAddr();
                    var pointer = addr;
                    if (field.weak) {
                        var strong = Swift._api.swift_weakLoadStrong(addr);
                        if (strong.isNull()) return null;
                        // weakLoadStrong() just incremented the strong reference count, undo that.
                        // If the user wants to keep this alive longer than right now, they need to manually increase
                        // the reference count for such a variable just like they'd have to for anything else.
                        // TODO: we probably should register a finalizer and release things there instead.
                        Swift._api.swift_release(strong);
                        pointer = strong;
                        // TODO: does this really work? I have a feeling we need to write this pointer to memory and pass that around.
                    }

                    if ("toJS" in field.type) {
                        var val = field.type.toJS(pointer);
                        if (val !== undefined) return val;
                    }
                    return new field.type(pointer);
                },
                set: function set(newVal) {
                    var addr = getAddr();
                    if (field.weak) {
                        Swift._api.swift_weakAssign(addr, newVal.$pointer);
                    } else {
                        var assigned = false;
                        if ("fromJS" in field.type && !("$pointer" in newVal)) assigned = field.type.fromJS(pointer, newVal);
                        if (!assigned) {
                            type.valueWitnessTable.assignWithCopy(addr, newVal.$pointer, newVal.$type.canonicalType._ptr);
                        }
                    }
                }
            });
        };

        for (var _iterator = type.fields(), _isArray = Array.isArray(_iterator), _i4 = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
            var _ref;

            var _ret = _loop();

            if (_ret === 'break') break;
        }
    }

    if (type.kind === "Existential" && type.canonicalType.getRepresentation() === "Opaque") {
        Object.defineProperty(wrapperObject, '$value', {
            enumerable: true,
            get: function get() {
                var cont = new metadata.OpaqueExistentialContainer(pointer);
                var dynType = Swift._typeFromCanonical(cont.type._ptr);
                if (isClassType(dynType) || !dynType.canonicalType.valueWitnessTable.isValueInline) {
                    return makeWrapper(dynType, pointer, false);
                } else {
                    return makeWrapper(dynType, cont.heapObject, false);
                }
            },
            set: function set(newVal) {
                var witnesses = [];
                var protocols = staticType.canonicalType.protocols.protocols;
                for (var i = 0; i < protocols.length; i++) {
                    var proto = protocols[i];
                    var conformance = Swift._api.swift_conformsToProtocol(newVal.$type.canonicalType._ptr, proto._ptr);
                    if (conformance.isNull()) throw new Error('this value does not implement the required protocol \'' + proto.name + '\'');
                    witnesses.push(conformance);
                }

                var cont = new metadata.OpaqueExistentialContainer(pointer);
                var oldVwt = cont.type.canonicalType.valueWitnessTable;
                // TODO: support assigning ObjC.Object
                if (isClassType(cont.type)) Swift._api.swift_release(cont.heapObject);else if (oldVwt.isValueInline) oldVwt.destroy(pointer);else oldVwt.destroy(cont.heapObject);

                var newVwt = newVal.$type.canonicalType.valueWitnessTable;
                newVwt.initializeBufferWithCopy(pointer, newVal.$pointer, newVal.$type.canonicalType._ptr);
                cont.type = newVal.$type;
                for (var _i5 = 0; _i5 < witnesses.length; _i5++) {
                    cont.setWitnessTable(_i5, witnesses[_i5]);
                }
            }
        });
    }

    if ("tupleElements" in type) {
        var cnt = 0;

        var _loop2 = function _loop2() {
            if (_isArray2) {
                if (_i6 >= _iterator2.length) return 'break';
                _ref2 = _iterator2[_i6++];
            } else {
                _i6 = _iterator2.next();
                if (_i6.done) return 'break';
                _ref2 = _i6.value;
            }

            var elem = _ref2;

            (0, _defineProperty4.default)(wrapperObject, cnt.toString(), {
                enumerable: true,
                get: function get() {
                    // TODO: call toJS() like struct/class fields
                    return elem.type(pointer.add(elem.offset));
                },
                set: function set(val) {
                    // TODO: call fromJS() like struct/class fields
                    wrapperObject[curCnt].$assignWithCopy(val);
                }
            });
            cnt++;
        };

        for (var _iterator2 = type.tupleElements(), _isArray2 = Array.isArray(_iterator2), _i6 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
            var _ref2;

            var _ret2 = _loop2();

            if (_ret2 === 'break') break;
        }
        cnt = 0;

        var _loop3 = function _loop3() {
            if (_isArray3) {
                if (_i7 >= _iterator3.length) return 'break';
                _ref3 = _iterator3[_i7++];
            } else {
                _i7 = _iterator3.next();
                if (_i7.done) return 'break';
                _ref3 = _i7.value;
            }

            var elem = _ref3;

            var curCnt = cnt;
            if (elem.label !== null) {
                (0, _defineProperty4.default)(wrapperObject, escapeName(elem.label, wrapperObject), {
                    enumerable: true,
                    get: function get() {
                        return wrapperObject[curCnt];
                    },
                    set: function set(val) {
                        wrapperObject[curCnt] = val;
                    }
                });
            }
            cnt++;
        };

        for (var _iterator3 = type.tupleElements(), _isArray3 = Array.isArray(_iterator3), _i7 = 0, _iterator3 = _isArray3 ? _iterator3 : (0, _getIterator3.default)(_iterator3);;) {
            var _ref3;

            var _ret3 = _loop3();

            if (_ret3 === 'break') break;
        }
    }

    /*if ('_methods' in type) {
        for (let [name, method] of type._methods.entries()) {
            Object.defineProperty(wrapperObject, name, {
                enumerable: true,
                value(...params) {
                    return makeFunctionWrapper(method.type, method.address)(...params);
                },
            });
        }
    }*/

    var invalidateWrapper = function invalidateWrapper() {
        (0, _keys2.default)(wrapperObject).forEach(function (key) {
            return (0, _deleteProperty2.default)(wrapperObject, key);
        });
        pointer = undefined;
        type = undefined;
    };
    if (owned) {
        wrapperObject.$destroy = function () {
            type.canonicalType.valueWitnessTable._destroy(pointer, type.canonicalType._ptr);
            invalidateWrapper();
        };
        var destruct = function destruct() {
            try {
                if (pointer !== undefined) wrapperObject.$destroy();
            } catch (e) {
                console.log('unhandled error while cleaning up owned Swift value: ' + e);
            }
        };
        var oldFin = Duktape.fin(pointer);
        Duktape.fin(pointer, function (obj, heapDestruction) {
            // not calling destructor during heap destruction -- variables we require for this may already be gone
            if (!heapDestruction) destruct();
            oldFin(obj, heapDestruction);
        });
    }
    wrapperObject.$assignWithCopy = function (val) {
        if ("$kind" in val) {
            // ObjC type
            throw new Error("ObjC types not yet supported"); // TODO
        } else if ("fromJS" in type && !("$pointer" in val)) {
            type.fromJS(pointer, val);
            return this;
        } else {
            // TODO: check that types are compatible
            staticType.canonicalType.valueWitnessTable.assignWithCopy(pointer, val.$pointer, staticType.canonicalType._ptr);
            var newWrapper = makeWrapper(val.$type, pointer, owned);
            invalidateWrapper();
            return newWrapper;
        }
    };
    wrapperObject.$allocCopy = function () {
        var vwt = type.canonicalType.valueWitnessTable;
        var mem = Memory.alloc(vwt.size.toInt32());
        vwt.initializeWithCopy(mem, pointer, type.canonicalType._ptr);
        return makeWrapper(type, mem, true);
    };

    (0, _preventExtensions2.default)(wrapperObject);

    return wrapperObject;
}

function makeSwiftValue(type) {
    if (!type.canonicalType) {
        throw new Error("the type of a value must have a canonical type descriptor!");
    }

    var _SwiftValue = void 0;
    _SwiftValue = function SwiftValue(pointer) {
        return makeWrapper(_SwiftValue, pointer, false);
    };
    (0, _defineProperty2.default)(_SwiftValue, 'name', { value: type.toString() });

    return _SwiftValue;
}

module.exports = {
    makeSwiftValue: makeSwiftValue
};

},{"./calling-convention":1,"./metadata":6,"babel-runtime/core-js/get-iterator":8,"babel-runtime/core-js/map":10,"babel-runtime/core-js/object/define-properties":13,"babel-runtime/core-js/object/define-property":14,"babel-runtime/core-js/object/keys":17,"babel-runtime/core-js/object/prevent-extensions":18,"babel-runtime/core-js/reflect/define-property":19,"babel-runtime/core-js/reflect/delete-property":20}],152:[function(require,module,exports){
'use strict';

var _setPrototypeOf = require('babel-runtime/core-js/reflect/set-prototype-of');

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _getOwnPropertyDescriptors = require('babel-runtime/core-js/object/get-own-property-descriptors');

var _getOwnPropertyDescriptors2 = _interopRequireDefault(_getOwnPropertyDescriptors);

var _defineProperties = require('babel-runtime/core-js/object/define-properties');

var _defineProperties2 = _interopRequireDefault(_defineProperties);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var metadata = require('./metadata');
var swiftValue = require('./swift-value');
var mangling = require('./mangling');

function strlen(pointer) {
    var i = void 0;
    for (i = 0; Memory.readU8(pointer.add(i)) !== 0; i++) {}
    return i;
}

var _leakedMemory = []; // some runtime functions take pointers that must remain valid forever

var typesByCanonical = new _map2.default();
var protocolTypes = new _map2.default();
function getOrMakeProtocolType(proto) {
    var existing = protocolTypes.get(proto._ptr.toString());
    if (existing) {
        return existing;
    }

    var arr = Memory.alloc(Process.pointerSize);
    Memory.writePointer(arr, proto._ptr);

    var canonical = Swift._api.swift_getExistentialTypeMetadata(metadata.ProtocolClassConstraint.Any,
    /*superClass*/ptr(0), /*numProtocols*/1, arr);
    canonical = new metadata.TargetMetadata(canonical);

    if (canonical.protocols.arrayLocation.toString() === arr.toString()) {
        _leakedMemory.push(arr);
    }

    var name = Swift.isSwiftName(proto.name) ? Swift.demangle(proto.name) : proto.name;
    var type = new Type(null, canonical, name);
    protocolTypes.set(proto._ptr.toString(), type);
    return type;
}

function Type(nominalType, canonicalType, name, accessFunction) {
    var _this = this;

    if (canonicalType && typesByCanonical.has(canonicalType._ptr.toString())) {
        var unique = typesByCanonical.get(canonicalType._ptr.toString());
        if (name && !unique.fixedName) unique.fixedName = name;
        return unique;
    }

    if (accessFunction) {
        if (nominalType || canonicalType || !name) throw new Error("type access function must only be provided if the type is not known");
        this.fixedName = name;
        this.accessFunction = accessFunction;
    }

    this.nominalType = nominalType;
    if (!nominalType && canonicalType) {
        this.nominalType = canonicalType.getNominalTypeDescriptor();
        if (canonicalType.kind === "Class") {
            var clsType = canonicalType;
            // ignore artificial subclasses
            while (this.nominalType === null && clsType.isTypeMetadata() && clsType.isArtificialSubclass() && clsType.superClass !== null) {
                clsType = clsType.superClass;
                this.nominalType = clsType.getNominalTypeDescriptor();
            }
        }
    }

    if (canonicalType && (canonicalType.kind === "Class" && canonicalType.isTypeMetadata() && !canonicalType.flags.UsesSwift1Refcounting || canonicalType.kind === "ObjCClassWrapper")) {
        this.toJS = function (pointer) {
            return ObjC.Object(Memory.readPointer(pointer));
        };
        this.fromJS = function (address, value) {
            Swift._api.objc_storeStrong(address, value);return true;
        };
        this.getSize = function getSize() {
            return Process.pointerSize;
        };
    }

    this.canonicalType = canonicalType;
    this.kind = canonicalType ? canonicalType.kind : accessFunction ? "Unknown" : null;

    if (this.nominalType && !canonicalType) accessFunction = this.nominalType.accessFunction;
    if (accessFunction) {
        this.withGenericParams = function withGenericParams() {
            for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
                params[_key] = arguments[_key];
            }

            // when there is a generic parent, we don't know the number of generic parameters
            if (this.nominalType && !this.nominalType.genericParams.flags.HasGenericParent && params.length != this.nominalType.genericParams.numGenericRequirements) {
                throw new Error("wrong number of generic parameters");
            }

            var args = [];
            var names = [];
            for (var _iterator = params, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
                var _ref;

                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref = _iterator[_i++];
                } else {
                    _i = _iterator.next();
                    if (_i.done) break;
                    _ref = _i.value;
                }

                var param = _ref;

                if (param.isGeneric() || !param.canonicalType) throw new Error("generic type parameter needs all own type parameters filled!");
                args.push('pointer');
                names.push(param.toString());
            }
            var name = this.toString();
            if (names.length !== 0) name += "<" + names.join(", ") + ">";
            var accessFunc = new NativeFunction(accessFunction, 'pointer', args);
            var canonical = accessFunc.apply(null, params.map(function (t) {
                return t.canonicalType._ptr;
            }));
            return new Type(this.nominalType, new metadata.TargetMetadata(canonical), name);
        };
    }
    if (this.nominalType && canonicalType && (this.kind === "Enum" || this.kind === "Optional")) {
        this.enumCases = function enumCases() {
            var info = this.nominalType.enum_;
            var count = info.getNumCases();
            var payloadCount = info.getNumPayloadCases();
            var cases = [];
            var names = info.caseNames;
            var caseTypeAccessor = new NativeFunction(info.getCaseTypes, 'pointer', ['pointer']);
            var caseTypes = caseTypeAccessor(canonicalType._ptr);
            for (var i = 0; i < count; i++) {
                var type = null;
                var typeFlags = 0;
                if (i < payloadCount) {
                    type = Memory.readPointer(caseTypes.add(i * Process.pointerSize));
                    typeFlags = type.and(metadata.FieldTypeFlags.typeMask);
                    type = new metadata.TargetMetadata(type.and(~metadata.FieldTypeFlags.typeMask));
                }
                cases.push({
                    tag: i - payloadCount,
                    name: names === null ? null : Memory.readUtf8String(names),
                    type: type === null ? null : new Type(null, type, 'case ' + (i - payloadCount) + ' of ' + this),
                    indirect: (typeFlags & metadata.FieldTypeFlags.Indirect) === metadata.FieldTypeFlags.Indirect,
                    weak: (typeFlags & metadata.FieldTypeFlags.Weak) === metadata.FieldTypeFlags.Weak
                });
                names = names === null ? null : names.add(strlen(names) + 1);
            }
            return cases;
        };
    }
    if (["Class", "Struct"].indexOf(this.kind) !== -1 && canonicalType) {
        this.fields = function fields() {
            var results = [];
            var hierarchy = [canonicalType];
            // TODO: use getParentType()
            while (hierarchy[hierarchy.length - 1].superClass) {
                hierarchy.push(hierarchy[hierarchy.length - 1].superClass);
            }
            var offset = ptr(0);
            for (var i = hierarchy.length; i--;) {
                var canon = hierarchy[i];
                var nomin = ["Class", "Struct"].indexOf(canon.kind) != -1 ? canon.getNominalTypeDescriptor() : null;
                if (!nomin) continue;
                var info = nomin.getKind() === "Class" ? nomin.clas : nomin.struct;
                if (!info.hasFieldOffsetVector()) throw new Error("fields without offset vector not implemented");

                var fieldTypeAccessor = new NativeFunction(info.getFieldTypes, 'pointer', ['pointer']);
                var fieldTypes = fieldTypeAccessor(canon._ptr);

                var fieldName = info.fieldNames;
                var fieldOffsets = canon._ptr.add(info.fieldOffsetVectorOffset * Process.pointerSize);
                for (var j = 0; j < info.numFields; j++) {
                    var type = Memory.readPointer(fieldTypes.add(j * Process.pointerSize));
                    var typeFlags = type.and(metadata.FieldTypeFlags.typeMask);
                    type = new metadata.TargetMetadata(type.and(ptr(metadata.FieldTypeFlags.typeMask).not()));
                    var curOffset = Memory.readPointer(fieldOffsets.add(j * Process.pointerSize));
                    var fieldNameStr = Memory.readUtf8String(fieldName);

                    var weak = (typeFlags & metadata.FieldTypeFlags.Weak) === metadata.FieldTypeFlags.Weak;
                    var xtype = new Type(null, type, '?Unknown type of ' + this + '.' + fieldNameStr);
                    results.push({
                        name: fieldNameStr,
                        offset: offset.add(curOffset),
                        type: new Type(null, type, '?Unknown type of ' + this + '.' + fieldNameStr),
                        weak: (typeFlags & metadata.FieldTypeFlags.Weak) === metadata.FieldTypeFlags.Weak
                    });
                    fieldName = fieldName.add(strlen(fieldName) + 1);
                }
            }
            return results;
        };
    }
    if (this.kind === "Existential" && canonicalType) {
        this.protocols = function protocols() {
            return canonicalType.protocols.map(getOrMakeProtocolType);
        };
        this.combineWith = function combineWith(other) {
            if (other.kind !== "Existential") throw new Error("can only combine existential types with each other");
            var protos = canonicalType.protocols.concat(other.canonicalType.protocols);
            // TODO: this is wrong, at least for protocols defined in nested contexts (see TypeDecl::compare)
            protos.sort(function (p1, p2) {
                if (p1.name < p2.name) return -1;
                if (p1.name > p2.name) return 1;
                return p1._ptr.compare(p2._ptr);
            });
            for (var i = 1; i < protos.length; i++) {
                if (protos[i - 1]._ptr.toString() === protos[i]._ptr.toString()) {
                    protos.splice(i, 1);
                    i--;
                }
            }

            var arr = Memory.alloc(protos.length * Process.pointerSize);
            _leakedMemory.push(arr);
            var names = [];
            for (var _i2 = 0; _i2 < protos.length; _i2++) {
                Memory.writePointer(arr.add(_i2 * Process.pointerSize), protos[_i2]._ptr);
                names.push(protos[_i2].name);
            }

            var bound = canonicalType.isClassBounded() || other.canonicalType.isClassBounded() ? "Class" : "Any";
            bound = metadata.ProtocolClassConstraint[bound];

            var superClass = canonicalType.getSuperclassConstraint();
            superClass = superClass === null ? ptr(0) : superClass._ptr;

            var canon = Swift._api.swift_getExistentialTypeMetadata(bound, superClass, protos.length, arr);
            return new Type(null, new metadata.TargetMetadata(canon), names.join(" + "));
        };
        if (canonicalType.isClassBounded()) {
            this.isClassBounded = true;
            this.getSuperclassConstraint = function getSuperclassConstraint() {
                var superClass = canonicalType.getSuperclassConstraint();
                if (superClass) return new Type(null, superClass);
                return null;
            };
            this.withoutClassBound = function withoutClassBound() {
                var protocols = canonicalType.protocols;
                var canon = Swift._api.swift_getExistentialTypeMetadata(metadata.ProtocolClassConstraint.Any, ptr(0), protocols.length, protocols.arrayLocation);
                return new Type(null, new metadata.TargetMetadata(canon));
            };
        } else {
            this.isClassBounded = false;
            this.withClassBound = function withClassBound() {
                var protocols = canonicalType.protocols;
                var canon = Swift._api.swift_getExistentialTypeMetadata(metadata.ProtocolClassConstraint.Class, ptr(0), protocols.length, protocols.arrayLocation);
                return new Type(null, new metadata.TargetMetadata(canon));
            };
        }
        if (canonicalType.isObjC()) {
            this.isObjC = true;
        } else {
            this.isObjC = false;
            if (canonicalType.getSuperclassConstraint()) {
                this.withoutSuperclassConstraint = function withoutSuperclassConstraint() {
                    var protocols = canonicalType.protocols;
                    var canon = Swift._api.swift_getExistentialTypeMetadata(metadata.ProtocolClassConstraint.Class, ptr(0), protocols.length, protocols.arrayLocation);
                    return new Type(null, new metadata.TargetMetadata(canon));
                };
            } else {
                this.withSuperclassConstraint = function withSuperclassConstraint(superType) {
                    var protocols = canonicalType.protocols;
                    var canon = Swift._api.swift_getExistentialTypeMetadata(metadata.ProtocolClassConstraint.Class, superType.canonicalType._ptr, protocols.length, protocols.arrayLocation);
                    return new Type(null, new metadata.TargetMetadata(canon));
                };
            }
        }
    }
    if (this.kind === "Tuple") {
        this.tupleElements = function tupleElements() {
            var labels = canonicalType.labels;
            if (labels.isNull()) labels = null;else labels = Memory.readUtf8String(labels).split(" ");
            var infos = [];
            var elements = canonicalType.elements;
            for (var i = 0; i < canonicalType.numElements; i++) {
                infos.push({
                    label: labels && labels[i] ? labels[i] : null,
                    type: new Type(null, elements[i].type),
                    offset: elements[i].offset
                });
            }
            return infos;
        };
    }
    if (this.kind === "Function") {
        this.returnType = function returnType() {
            return new Type(null, canonicalType.resultType);
        };
        this.functionFlags = function functionFlags() {
            return canonicalType.flags;
        };
        this.getArguments = function getArguments() {
            return canonicalType.getArguments().map(function (arg) {
                return {
                    inout: arg.inout,
                    type: new Type(null, arg.type)
                };
            });
        };
    }
    if (this.kind == "Opaque") {
        if (!name) throw new Error("a name is required when creating Opaque types");
        this.fixedName = name;

        this.getCType = function getCType() {
            var knownTypes = {
                "Builtin.Int8": "int8",
                "Builtin.Int16": "int16",
                "Builtin.Int32": "int32",
                "Builtin.Int64": "int64",
                "Builtin.UInt8": "uint8",
                "Builtin.UInt16": "uint16",
                "Builtin.UInt32": "uint32",
                "Builtin.UInt64": "uint64",
                "Builtin.RawPointer": "pointer"
                // TODO: others (git grep -wE 'Builtin\.\w+' | grep -owE 'Builtin\.[A-Z]\w+' | sort -u)
            };
            return knownTypes[this.fixedName];
        };
        this.getSize = function getSize() {
            var knownSizes = {
                "Builtin.Int8": 1,
                "Builtin.Int16": 2,
                "Builtin.Int32": 4,
                "Builtin.Int64": 8,
                "Builtin.Int128": 16,
                "Builtin.Int256": 32,
                "Builtin.Int512": 64,
                "Builtin.UInt8": 1,
                "Builtin.UInt16": 2,
                "Builtin.UInt32": 4,
                "Builtin.UInt64": 8,
                "Builtin.UInt128": 16,
                "Builtin.UInt256": 32,
                "Builtin.UInt512": 64,
                "Builtin.RawPointer": Process.pointerSize
                // TODO: others (git grep -wE 'Builtin\.\w+' | grep -owE 'Builtin\.[A-Z]\w+' | sort -u)
            };
            return knownSizes[this.fixedName];
        };
        this.toJS = function toJS(pointer) {
            if (this.fixedName === "Builtin.RawPointer") {
                return Memory.readPointer(pointer);
            }

            var size = this.getSize();
            if (size === undefined || size > 8) return undefined;
            if (this.fixedName.indexOf("Builtin.Int") === 0) {
                return Memory['readS' + size * 8](pointer);
            } else if (this.fixedName.indexOf("Builtin.UInt") === 0) {
                return Memory['readU' + size * 8](pointer);
            }

            return undefined;
        };
        this.fromJS = function fromJS(address, value) {
            if (this.fixedName === "Builtin.RawPointer") {
                Memory.writePointer(address, value);
                return true;
            }

            var size = this.getSize();
            if (size === undefined || size > 8) return false;
            if (this.fixedName.indexOf("Builtin.Int") === 0) {
                Memory['writeS' + size * 8](address, value);
                return true;
            } else if (this.fixedName.indexOf("Builtin.UInt") === 0) {
                Memory['writeU' + size * 8](address, value);
                return true;
            }

            return false;
        };
    }
    if (canonicalType && this.kind === "Class") {
        // TODO: use getParentType()
        this.superClass = function superClass() {
            var canon = canonicalType.superClass;
            if (canon === null) return null;
            return new Type(null, canon, '?superClass of ' + this);
        };
    }

    if (canonicalType && (this.kind !== "Class" || canonicalType.isTypeMetadata())) {
        var size = Process.pointerSize; // TODO: Swift doesn't count the static overhead of classes here
        if (canonicalType.valueWitnessTable.flags.IsNonInline) size = canonicalType.valueWitnessTable.size;

        this.getSize = function () {
            return size;
        };

        if ("getGenericArgs" in canonicalType) {
            this.getGenericParams = function getGenericParams() {
                return canonicalType.getGenericArgs().map(function (t) {
                    if (t === null) return null;else {
                        return new Type(null, t);
                    }
                });
            };
        }
    }
    if (this.kind === "ObjCClassWrapper") {
        this.getObjCObject = function getObjCObject() {
            return ObjC.Object(canonicalType.class_);
        };
    }
    if (["ExistentialMetatype", "Metatype"].indexOf(this.kind) !== -1) {
        this.instanceType = function instanceType() {
            return new Type(null, canonicalType.instanceType);
        };
    }

    // TODO: implement me
    /*if (canonicalType && ["Class", "Struct", "Enum"].indexOf(this.kind) !== -1) {
        // This allows you to define a method on this type.
        this.defineMethod = function defineMethod(address, name, type) {
            // TODO: mutating or normal method?
            if (type.kind !== "Function")
                throw new Error("invalid type to act as method signature");
            this._methods.set(name, {'address': address, 'returnType': type.returnType(), 'args': type.getArguments(),
                'doesThrow': type.flags.doesThrow});
        };
        this._methods = new Map();
    }*/

    // due to the toString() this needs to happen last
    if (canonicalType) {
        switch (this.toString()) {
            case "Swift.String":
                this.fromJS = function (address, value) {
                    // TODO: fromJS needs a parameter telling it whether it is initializing or assigning
                    canonicalType.valueWitnessTable.destroy(address, canonicalType._ptr);
                    var cStr = Memory.allocUtf8String(value);
                    api.swift_stringFromUTF8InRawMemory(address, cStr, value.length);
                    return true;
                };
            case "Swift.Bool":
                this.toJS = function (address) {
                    return Memory.readU8(address) !== 0;
                };
                this.fromJS = function (address, value) {
                    Memory.writeU8(address, value ? 1 : 0);return true;
                };
                this.getSize = function getSize() {
                    return 1;
                };
                break;
            case "Swift.UInt":
                this.toJS = function (pointer) {
                    return Memory.readULong(pointer);
                };
                this.fromJS = function (pointer, value) {
                    Memory.writeULong(pointer, value);return true;
                };
                this.getSize = function () {
                    return Process.pointerSize;
                };
                break;
            case "Swift.Int":
                this.toJS = function (pointer) {
                    return Memory.readLong(pointer);
                };
                this.fromJS = function (pointer, value) {
                    Memory.writeLong(pointer, value);return true;
                };
                this.getSize = function () {
                    return Process.pointerSize;
                };
                break;
            case "Swift.Int8":
            case "Swift.Int16":
            case "Swift.Int32":
            case "Swift.Int64":
            case "Swift.Int128":
            case "Swift.Int256":
            case "Swift.Int512":
            case "Swift.UInt8":
            case "Swift.UInt16":
            case "Swift.UInt32":
            case "Swift.UInt64":
            case "Swift.UInt128":
            case "Swift.UInt256":
            case "Swift.UInt512":
            case "Swift.RawPointer":
                this.toJS = function (pointer) {
                    return _this.fields()[0].type.toJS(pointer);
                };
                this.fromJS = function (pointer, value) {
                    return _this.fields()[0].type.fromJS(pointer, value);
                };
                this.getSize = function () {
                    return _this.fields()[0].type.getSize();
                };
                break;
        }

        Object.defineProperty(this, 'Type', {
            enumerable: true,
            get: function get() {
                var meta = void 0;
                if (this.kind === "Existential" || this.kind === "ExistentialMetatype") {
                    meta = Swift._api.swift_getExistentialMetatypeMetadata(canonicalType._ptr);
                } else {
                    meta = Swift._api.swift_getMetatypeMetadata(canonicalType._ptr);
                }
                return new Type(null, new metadata.TargetMetadata(meta), this.toString() + ".Type");
            }
        });
    }

    if (!this.isGeneric()) {
        if (!canonicalType) {
            return this.withGenericParams();
        } else {
            var func = swiftValue.makeSwiftValue(this);
            (0, _defineProperties2.default)(func, (0, _getOwnPropertyDescriptors2.default)(this));
            (0, _setPrototypeOf2.default)(func, Type.prototype);
            typesByCanonical.set(this.canonicalType._ptr.toString(), func);
            return func;
        }
    }
}
Type.prototype = {
    constructor: Type,
    isGeneric: function isGeneric() {
        if (this.accessFunction) return true;

        if (!this.nominalType || this.canonicalType) return false;
        return this.nominalType.genericParams.isGeneric();
    },
    toString: function toString() {
        if ("_name" in this) return this._name;

        if (this.canonicalType) {
            var _Swift$_api$swift_get = Swift._api.swift_getTypeName(this.canonicalType._ptr, /* qualified? */1),
                pointer = _Swift$_api$swift_get[0],
                len = _Swift$_api$swift_get[1];

            var str = Memory.readUtf8String(pointer, len.toInt32());
            if (str.length !== 0 && str !== "<<< invalid type >>>") {
                this._name = str;
                return str;
            }
            switch (this.kind) {
                case "Tuple":
                    this._name = "(" + this.tupleElements().map(function (e) {
                        return (e.label === null ? "" : e.label + ": ") + e.type.toString();
                    }).join(", ") + ")";
                    return this._name;
                case "Function":
                    this._name = "@convention(" + metadata.FunctionConventionStrings[this.functionFlags().convention] + ") (" + this.getArguments().map(function (a) {
                        return (a.inout ? "inout " : "") + a.type.toString();
                    }).join(", ") + ") -> " + this.returnType().toString();
                    return this._name;
                case "ObjCClassWrapper":
                    this._name = Memory.readUtf8String(ObjC.api.class_getName(this.canonicalType.class_));
                    return this._name;
                case "ExistentialMetatype":
                case "Metatype":
                    this._name = this.instanceType().toString() + ".Type";
                    return this._name;
                case "ForeignClass":
                    this._name = Swift.demangle(mangling.MANGLING_PREFIX + "0" + this.canonicalType.name);
                    return this._name;
                case "Class":
                    if (this.canonicalType.isPureObjC()) {
                        this._name = Memory.readUtf8String(ObjC.api.class_getName(this.canonicalType._ptr));
                        return this._name;
                    }
                    break;
                case "Existential":
                    {
                        var protocols = this.canonicalType.protocols.map(function (p) {
                            return Swift.isSwiftName(p.name) ? Swift.demangle(p.name) : p.name;
                        });
                        var _str = protocols.join(" & ");
                        if (this.canonicalType.getSuperclassConstraint()) _str += " : " + new Type(null, this.canonicalType.getSuperclassConstraint()).toString();
                        this._name = _str;
                        return _str;
                    }
            }
        }

        if (this.nominalType) {
            var name = Swift.demangle(this.nominalType.mangledName);
            if (this.nominalType.genericParams.isGeneric()) {
                var params = [];
                if ("getGenericParams" in this) {
                    params = this.getGenericParams().map(function (arg) {
                        return arg.toString();
                    });
                } else {
                    if (this.nominalType.genericParams.flags.HasGenericParent) {
                        params.push("[inherited generic parameters]");
                    }
                    var cnt = this.nominalType.genericParams.numPrimaryParams;
                    for (var i = 0; i < cnt; i++) {
                        params.push("_T" + i);
                    }
                }
                name += "<" + params.join(", ") + ">";
            }
            this._name = name;
            return name;
        }

        if (this.fixedName) {
            this._name = this.fixedName;
            return this.fixedName;
        }
        //this._name = "<<< invalid type >>>" + this.canonicalType + this.nominalType;
        //return this._name;
        throw new Error('cannot get string representation for type without nominal or canonical type information');
    }
};

function findAllTypes(api) {
    var sizeAlloc = Memory.alloc(8);
    var __TEXT = Memory.allocUtf8String("__TEXT");

    var sectionNames = [Memory.allocUtf8String("__swift2_types"), Memory.allocUtf8String("__swift2_proto")];
    var recordSizes = [8, 16];
    var typesByName = new _map2.default();

    function getTypePrio(t) {
        if (t.canonicalType) return 0;
        if (t.nominalType) return 1;
        if (t.accessFunction) return 2;
        throw new Error("invalid state of type object");
    }
    var newTypes = [];
    function addType(t) {
        if (t === null) return;

        var name = t.toString();
        var other = typesByName.get(name);
        if (!other || getTypePrio(t) < getTypePrio(other)) {
            typesByName.set(name, t);
            newTypes.push(t);
        }
    }

    for (var _iterator2 = Process.enumerateModulesSync(), _isArray2 = Array.isArray(_iterator2), _i3 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
        var _ref2;

        if (_isArray2) {
            if (_i3 >= _iterator2.length) break;
            _ref2 = _iterator2[_i3++];
        } else {
            _i3 = _iterator2.next();
            if (_i3.done) break;
            _ref2 = _i3.value;
        }

        var mod = _ref2;

        for (var section = 0; section < sectionNames.length; section++) {
            // we don't have to use the name _mh_execute_header to refer to the mach-o header -- it's the module header
            var pointer = api.getsectiondata(mod.base, __TEXT, sectionNames[section], sizeAlloc);
            if (pointer.isNull()) continue;

            var sectionSize = Memory.readULong(sizeAlloc);
            for (var i = 0; i < sectionSize; i += recordSizes[section]) {
                var record = void 0;
                var _proto = null;
                if (section === 0) {
                    record = new metadata.TargetTypeMetadataRecord(pointer.add(i));
                } else {
                    record = new metadata.TargetProtocolConformanceRecord(pointer.add(i));
                    _proto = getOrMakeProtocolType(record.protocol);
                    addType(_proto);
                }
                var nominalType = null;
                if (record.getTypeKind() === metadata.TypeMetadataRecordKind.UniqueNominalTypeDescriptor) nominalType = record.getNominalTypeDescriptor();

                var canonicalType = record.getCanonicalTypeMetadata(api);

                if (nominalType || canonicalType) {
                    addType(new Type(nominalType, canonicalType));
                } else {
                    console.log('metadata record without nominal or canonical type?! @' + pointer.add(i) + ' of section ' + section + ' in ' + mod.name + ' ' + record.getTypeKind() + ' ' + _proto);
                }
            }
        }

        // TODO: it kind of sucks that we rely on symbol information here.
        // we should see if there is some other way to find the nominal types for generic data types
        var METADATA_PREFIX = "type metadata for ";
        var METADATA_ACCESSOR_PREFIX = "type metadata accessor for ";
        var NOMINAL_PREFIX = "nominal type descriptor for ";
        for (var _iterator5 = Module.enumerateExportsSync(mod.name), _isArray5 = Array.isArray(_iterator5), _i6 = 0, _iterator5 = _isArray5 ? _iterator5 : (0, _getIterator3.default)(_iterator5);;) {
            var _ref5;

            if (_isArray5) {
                if (_i6 >= _iterator5.length) break;
                _ref5 = _iterator5[_i6++];
            } else {
                _i6 = _iterator5.next();
                if (_i6.done) break;
                _ref5 = _i6.value;
            }

            var exp = _ref5;

            if (Swift.isSwiftName(exp.name)) {
                var demangled = Swift.demangle(exp.name);
                if (demangled.startsWith(METADATA_PREFIX)) {
                    var name = demangled.substr(METADATA_PREFIX.length);
                    // type metadata sometimes can have members at negative indices, so we need to
                    // iterate until we find something that looks like the beginning of a Metadata object
                    // (Sadly, that doesn't work for class metadata with ISA pointers, but it should be no
                    // problem to find ObjC metadata for such classes.)
                    for (var _i7 = 0; _i7 < 2; _i7++) {
                        var _ptr = exp.address.add(Process.pointerSize * _i7);
                        if (Memory.readPointer(_ptr).toString(10) in metadata.MetadataKind) {
                            addType(new Type(null, new metadata.TargetMetadata(_ptr), name));
                            break;
                        }
                    }
                } else if (demangled.startsWith(NOMINAL_PREFIX)) {
                    var _name = demangled.substr(NOMINAL_PREFIX.length);
                    addType(new Type(new metadata.TargetNominalTypeDescriptor(exp.address), null, _name));
                } else if (demangled.startsWith(METADATA_ACCESSOR_PREFIX)) {
                    var _name2 = demangled.substr(METADATA_ACCESSOR_PREFIX.length);
                    addType(new Type(null, null, _name2, exp.address));
                }
            }
        }
    }

    if (!typesByName.has("Any")) {
        var Any = Swift._api.swift_getExistentialTypeMetadata(metadata.ProtocolClassConstraint.Any, /*superClass*/ptr(0), /*numProtocols*/0, /*protcols*/ptr(0));
        Any = new Type(null, new metadata.TargetMetadata(Any), "Any");
        typesByName.set("Any", Any);
    }
    if (!typesByName.has("Swift.AnyObject")) {
        var AnyObject = Swift._api.swift_getExistentialTypeMetadata(metadata.ProtocolClassConstraint.Class, /*superClass*/ptr(0), /*numProtocols*/0, /*protcols*/ptr(0));
        AnyObject = new Type(null, new metadata.TargetMetadata(AnyObject), "Swift.AnyObject");
        typesByName.set("Swift.AnyObject", AnyObject);
    }
    if (!typesByName.has("Swift.AnyObject.Type")) {
        var _AnyObject = typesByName.get("Swift.AnyObject");
        var AnyClass = _AnyObject.Type;
        typesByName.set("Swift.AnyObject.Type", AnyClass);
        typesByName.set("Swift.AnyClass", AnyClass);
    }
    typesByName.set("()", Swift.makeTupleType([], []));
    typesByName.set("Void", typesByName.get("()"));

    while (newTypes.length) {
        var type = newTypes.pop();
        if ('enumCases' in type) type.enumCases().forEach(function (i) {
            return addType(i.type);
        });
        if ('fields' in type) type.fields().forEach(function (i) {
            return addType(i.type);
        });
        if ('tupleElements' in type) type.tupleElements().forEach(function (i) {
            return addType(i.type);
        });
        if ('getArguments' in type) type.getArguments().forEach(function (i) {
            return addType(i.type);
        });
        if ('returnType' in type) addType(type.returnType());
        if ('superClass' in type) addType(type.superClass());
        if ('instanceType' in type) addType(type.instanceType());
        if ('getGenericParams' in type) type.getGenericParams().forEach(addType);
        if ('getSuperclassConstraint' in type) addType(type.getSuperclassConstraint());
        if (type.kind === "Existential" && type.canonicalType) {
            for (var _iterator3 = type.canonicalType.protocols, _isArray3 = Array.isArray(_iterator3), _i4 = 0, _iterator3 = _isArray3 ? _iterator3 : (0, _getIterator3.default)(_iterator3);;) {
                var _ref3;

                if (_isArray3) {
                    if (_i4 >= _iterator3.length) break;
                    _ref3 = _iterator3[_i4++];
                } else {
                    _i4 = _iterator3.next();
                    if (_i4.done) break;
                    _ref3 = _i4.value;
                }

                var proto = _ref3;

                addType(getOrMakeProtocolType(proto));
                for (var _iterator4 = proto.inheritedProtocols, _isArray4 = Array.isArray(_iterator4), _i5 = 0, _iterator4 = _isArray4 ? _iterator4 : (0, _getIterator3.default)(_iterator4);;) {
                    var _ref4;

                    if (_isArray4) {
                        if (_i5 >= _iterator4.length) break;
                        _ref4 = _iterator4[_i5++];
                    } else {
                        _i5 = _iterator4.next();
                        if (_i5.done) break;
                        _ref4 = _i5.value;
                    }

                    var inherited = _ref4;

                    addType(getOrMakeProtocolType(inherited));
                }
            }
        }
    }

    return typesByName;
}

module.exports = {
    findAllTypes: findAllTypes,
    Type: Type
};

},{"./mangling":5,"./metadata":6,"./swift-value":151,"babel-runtime/core-js/get-iterator":8,"babel-runtime/core-js/map":10,"babel-runtime/core-js/object/define-properties":13,"babel-runtime/core-js/object/get-own-property-descriptors":16,"babel-runtime/core-js/reflect/set-prototype-of":21}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjYWxsaW5nLWNvbnZlbnRpb24uanMiLCJleGFtcGxlcy9jX2hlYWRlcl9nZW4vY19oZWFkZXJfZ2VuLmpzIiwiaW5kZXguanMiLCJsb2FkZXIuanMiLCJtYW5nbGluZy5qcyIsIm1ldGFkYXRhLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9hcnJheS9mcm9tLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9nZXQtaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL2pzb24vc3RyaW5naWZ5LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9tYXAuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL21hdGgvbG9nMi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2NyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0aWVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZW50cmllcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcnMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvcHJldmVudC1leHRlbnNpb25zLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9yZWZsZWN0L2RlZmluZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvcmVmbGVjdC9kZWxldGUtcHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL3JlZmxlY3Qvc2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvc2V0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9zeW1ib2wuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL3N5bWJvbC9pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvdHlwZW9mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9hcnJheS9mcm9tLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9nZXQtaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL2pzb24vc3RyaW5naWZ5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9tYXAuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL21hdGgvbG9nMi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2NyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0aWVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZW50cmllcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcnMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvcHJldmVudC1leHRlbnNpb25zLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9yZWZsZWN0L2RlZmluZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vcmVmbGVjdC9kZWxldGUtcHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3JlZmxlY3Qvc2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vc2V0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9zeW1ib2wvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3N5bWJvbC9pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYS1mdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYWRkLXRvLXVuc2NvcGFibGVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hbi1pbnN0YW5jZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYW4tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1mcm9tLWl0ZXJhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYXJyYXktbWV0aG9kcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYXJyYXktc3BlY2llcy1jb25zdHJ1Y3Rvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYXJyYXktc3BlY2llcy1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NsYXNzb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NvZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29sbGVjdGlvbi1zdHJvbmcuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NvbGxlY3Rpb24tdG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29sbGVjdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29yZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY3JlYXRlLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jdHguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2RlZmluZWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19lbnVtLWtleXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2V4cG9ydC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZmFpbHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2Zvci1vZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZ2xvYmFsLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19oYXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2hpZGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2h0bWwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2llOC1kb20tZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pcy1hcnJheS1pdGVyLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pcy1hcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXMtb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyLWNhbGwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyLWRlZmluZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1kZXRlY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItc3RlcC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlcmF0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19saWJyYXJ5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19tZXRhLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZHAuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1kcHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1nb3BkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZ29wbi1leHQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1nb3BuLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZ29wcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWdwby5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWtleXMtaW50ZXJuYWwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtcGllLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3Qtc2FwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtdG8tYXJyYXkuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX293bi1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19wcm9wZXJ0eS1kZXNjLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19yZWRlZmluZS1hbGwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3JlZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtY29sbGVjdGlvbi1mcm9tLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtY29sbGVjdGlvbi1vZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2V0LXByb3RvLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtc3BlY2llcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2V0LXRvLXN0cmluZy10YWcuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NoYXJlZC1rZXkuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NoYXJlZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc3RyaW5nLWF0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1hYnNvbHV0ZS1pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8taW50ZWdlci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8tbGVuZ3RoLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLXByaW1pdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdWlkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL192YWxpZGF0ZS1jb2xsZWN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL193a3MtZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL193a3MtZXh0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL193a3MuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2NvcmUuZ2V0LWl0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5hcnJheS5mcm9tLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5hcnJheS5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYubWFwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5tYXRoLmxvZzIuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5kZWZpbmUtcHJvcGVydGllcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmRlZmluZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmtleXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5wcmV2ZW50LWV4dGVuc2lvbnMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnJlZmxlY3QuZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5yZWZsZWN0LmRlbGV0ZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYucmVmbGVjdC5zZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5zZXQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc3ltYm9sLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5tYXAuZnJvbS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczcubWFwLm9mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5tYXAudG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczcub2JqZWN0LmVudHJpZXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM3Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5zZXQuZnJvbS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczcuc2V0Lm9mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5zZXQudG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczcuc3ltYm9sLmFzeW5jLWl0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5zeW1ib2wub2JzZXJ2YWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlLmpzIiwic3dpZnQtdmFsdWUuanMiLCJ0eXBlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdBLElBQUEsQUFBSTtBQUNKLElBQUksUUFBQSxBQUFRLFNBQVIsQUFBaUIsV0FBVyxRQUFBLEFBQVEsYUFBeEMsQUFBcUQsVUFBVSxBQUMzRDtBQUNBOztzQkFBYSxBQUNLLEFBQ2Q7dUJBRlMsQUFFTSxBQUNmO2dDQUhTLEFBR2UsQUFDeEI7MkJBSlMsQUFJVSxLQUFLLEFBQ3hCO3lCQUFpQixJQUFJLFFBTFosQUFLb0IsYUFBYSxBQUMxQzswQkFOUyxBQU1TLEFBQ2xCO3lCQUFpQixRQVBSLEFBT2dCLEFBQ3pCO2dCQVJTLEFBUUQsQUFDUjt5QkFUSixBQUFhLEFBU1EsQUFFeEI7QUFYZ0IsQUFDVDtBQUhSLFdBYVcsUUFBQSxBQUFRLFNBQVIsQUFBaUIsU0FBUyxRQUFBLEFBQVEsYUFBdEMsQUFBbUQsVUFBVSxBQUNoRTtBQUNBOztzQkFBYSxBQUNLLEFBQ2Q7dUJBRlMsQUFFTSxBQUNmO2dDQUhTLEFBR2UsV0FBVyxBQUNuQzsyQkFKUyxBQUlVLElBQUksQUFDdkI7eUJBQWlCLElBQUksUUFMWixBQUtvQixhQUFhLEFBQzFDOzBCQU5TLEFBTVMsQUFDbEI7eUJBQWlCLFFBUFIsQUFPZ0IsQUFDekI7Z0JBUlMsQUFRRCxBQUNSO3lCQVRKLEFBQWEsQUFTUSxBQUV4QjtBQVhnQixBQUNUO0FBSEQsQ0FBQSxNQWFBLEFBQ0g7VUFBTSxJQUFBLEFBQUksTUFBVixBQUFNLEFBQVUsQUFDbkI7O0FBQ0Q7O0FBRUEsSUFBSSxTQUFKLEFBQWEs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Q1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBOztBQ0RBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFJLGtCQUFKLEFBQXNCLE1BQ2xCLFFBQVEsS0FBUixBQUFRLEFBQUssQUFDakI7WUFBSSxzQkFBSixBQUEwQixNQUN0QixLQUFBLEFBQUssbUJBQUwsQUFBd0IsUUFBeEIsQUFBZ0MsQUFDcEM7WUFBSSw2QkFBSixBQUFpQyxNQUM3QixRQUFRLEtBQVIsQUFBUSxBQUFLLEFBQ2pCO1lBQUksS0FBQSxBQUFLLFNBQUwsQUFBYyxpQkFBaUIsS0FBbkMsQUFBd0MsZUFBZSxBQUNuRDtBQUFLLGtDQUFhLEtBQUEsQUFBSyxjQUF2QixBQUFxQztBQUFXLEFBQzVDOzs7Ozs7Ozs7OztvQkFESixBQUFTOzt3QkFDRyxzQkFBUixBQUFRLEFBQXNCLEFBQzlCO0FBQUssc0NBQWlCLE1BQXRCLEFBQTRCO0FBQW9CLEFBQzVDOzs7Ozs7Ozs7Ozt3QkFESixBQUFTOzs0QkFDRyxzQkFBUixBQUFRLEFBQXNCLEFBQ2pDO0FBQ0o7QUFDSjtBQUNKO0FBRUQ7O1dBQUEsQUFBTyxBQUNWOzs7QUFFRCxPQUFBLEFBQU87QUFBVSxBQUViO0FBRkosQUFBaUI7QUFBQSxBQUNiIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIifQ==
""")


def recv(message, data):
    if message['type'] == 'error':
        session.detach()
        print(message['description'], file=sys.stderr)
        print(message['stack'], file=sys.stderr)
        sys.exit(1)

def top_sort(dag):
    empty = set()
    no_incoming = set(dag.keys())
    rev_dag = {}
    for source_node, target_nodes in dag.items():
        for target_node in target_nodes:
            no_incoming.discard(target_node)
            rev_dag.setdefault(target_node, set()).add(source_node)
    while no_incoming:
        node = no_incoming.pop()
        yield node
        for target_node in list(dag.get(node, [])):
            rev_dag[target_node].remove(node)
            dag[node].remove(target_node)
            if not dag[node]:
                del dag[node]
            if not rev_dag[target_node]:
                del rev_dag[target_node]
                no_incoming.add(target_node)

    assert not rev_dag



def remove_generic(name):
    if not name.endswith(">"):
        return name

    closed = 1
    generic_params = []
    for i in range(len(name) -2, -1, -1):
        if name[i] == '>' and name[i-1] != '-':
            closed += 1
        elif name[i] == '<':
            closed -= 1

        if closed == 0:
            return name[:i]
    raise Exception("invalid type declaration: " + repr(name))


def print_header(message):
    generator = CGenerator()
    parser = CParser()

    def del_spaces(name):
        if name.startswith('(extension in '):
            idx = name.index('):')
            name = '_extension_in_' + name[14:idx] + "__" + name[idx+2:]

        # file private types
        if ' in _' in name:
            idx = name.index(' in _')
            end = name.index(')', idx)
            start = name.rindex('(', None, idx)
            namespace = name[:start]
            if '>' in namespace:
                namespace = mangle_name(namespace[:-1]) + '.'
            name = namespace + name[start+1:idx] + name[end+1:]
        return name

    def mangle_name(human):
        if human in ('void*', 'voidp', 'Metadata*'):
            return human
        if human == '()':
            return 'void'

        info = types[human]
        if 'getGenericParams' in info and info['getGenericParams']:
            name = remove_generic(human)
        else:
            name = human

        if name.startswith("Static #"):
            spl = name.split(' ', 4)
            return "_static_no" + spl[1][1:] + "_in_" + spl[3] + "__func" + str(hash(spl[4]))[1:]
        name = del_spaces(name)

        outp = f'swift_{info["kind"]}__'

        if info['kind'] == "Tuple":
            elems = []
            for e in info['tupleElements']:
                name = mangle_name(e['type'])
                if e['label']:
                    name += "__as_" + e['label']
                elems.append(name)
            outp += "with__" + "__and__".join(elems)
        elif info['kind'] == "Existential":
            protos = []
            for p in info['protocols']:
                protos.append(del_spaces(script.exports.demangle(p)).replace(".", "__"))
            if info['isClassBounded']:
                protos.append("Swift__AnyObject")
            outp += "conforming_to__" + "__and__".join(protos)
            if info.get('getSuperclassConstraint'):
                outp += "__inheriting_from_" + mangle_name(info['getSuperclassConstraint'])
        elif info['kind'] == 'Function':
            return "func_" + str(hash(name))[1:]
        else:
            outp += name.replace(".", "_")

        if 'getGenericParams' in info and info['getGenericParams']:
            gen_params = [mangle_name(param) for param in info['getGenericParams']]
            outp += "__of__" + "__and__".join(gen_params)

        return outp


    def make_decl(name, offset, type_name):
        nonlocal decls, pad_count, parser, prev_end

        if isinstance(offset, str):
            assert offset[:2] == '0x'
            offset = int(offset, 16)

        if prev_end < offset:
            pad_str = f"char _padding{pad_count}[{offset - prev_end}];"
            decls.append(parser.parse(pad_str).ext[0])
            pad_count += 1

        type_decl = TypeDecl(name.replace(".", "__"), None, IdentifierType([mangle_name(type_name)]))
        decls.append(Decl(None, None, None, None, type_decl, None, None))

        req_graph.setdefault(type_name, set()).add(parent_name)

        if offset != -1:
            size = pointer_size if type_name.endswith('*') else int(types[type_name]['size'], 16)
            prev_end = offset + size

    print("#include <stdint.h>")
    print("#pragma pack(1)")
    print("typedef void *voidp;")
    print("typedef struct Metadata_s Metadata;")
    types = json.loads(message)

    req_graph = {}
    ptr_types = {'void*', 'voidp', 'Metadata*'}
    ctypes = {}

    for name, info in types.items():
        pad_count = 0
        decls = []
        prev_end = 0
        ctype = None
        parent_name = name
        if info['kind'] == "Tuple":
            for i, elem in enumerate(info['tupleElements']):
                make_decl(elem['label'] or f'_{i}', elem['offset'], elem['type'])
            ctype = Struct(mangle_name(name) + "_s", decls)
        elif info['kind'] == "ObjCClassWrapper":
            print(f'typedef struct {mangle_name(name)}_s *{mangle_name(name)};')
        elif info['kind'] in ("Struct", "Class"):
            if info['kind'] == 'Class':
                make_decl('_isa', '0x0', 'Metadata*')
                #make_decl('_refCounts', hex(pointer_size), 'size_t')

            for i, field in enumerate(info['fields']):
                make_decl(field['name'], field['offset'], field['type'])
            ctype = Struct(mangle_name(name) + "_s", decls)

            if info['kind'] == 'Class':
                ctype = PtrDecl(None, ctype)
        elif info['kind'] == "Existential":
            if info['isClassBounded'] or info.get('getSuperclassConstraint'):  # class existential container
                make_decl(f'heap_object', -1, 'void*')
            else:  # opaque existential container
                union = "union { void *heapObject; void *fixedSizeBuffer[3]; };"
                decls.append(parser.parse(union).ext[0])
                make_decl("dynamicType", -1, "Metadata*")
            for i in range(info['witnessTableCount']):
                make_decl(f'_witnessTable{i + 1}', -1, 'void*')
            ctype = Struct(mangle_name(name) + "_s", decls)
        elif info['kind'] in ("Enum", "Optional"):
            if info['enumCases'] and info['enumCases'][0]['name'] is None:
                # C-like enum
                # we don't have case names or values, so just generate a typedef to an int type
                print(f"typedef uint{int(info['size'], 16) * 8}_t {mangle_name(name)};")
            elif len(info['enumCases']) == 0:
                ctype = Struct(mangle_name(name) + "_s", decls)
            elif len(info['enumCases']) == 1 and info['enumCases'][0]['type']:
                make_decl(info['enumCases'][0]['name'], 0, info['enumCases'][0]['type'])
                ctype = Struct(mangle_name(name) + "_s", decls)
            else:
                print(f'typedef struct {mangle_name(name)}_s {{ char _data[{info["size"]}]; }} {mangle_name(name)};')
        elif info['kind'] == 'Opaque':
            if 'getCType' in info:
                ctype_names = {
                    'pointer': 'void*',
                    'int8': 'int8_t',
                    'int16': 'int16_t',
                    'int32': 'int32_t',
                    'int64': 'int64_t',
                    'int64': 'int64_t',
                }
                print(f'typedef {ctype_names[info["getCType"]]} {mangle_name(name)};')
            elif name == 'Builtin.NativeObject':
                print(f'typedef void *{mangle_name(name)};')
            else:
                print(f'typedef char {mangle_name(name)}[{info["size"]}];')
        elif info['kind'] == 'Function':
            print(f"typedef void *func_{str(hash(name))[1:]};")  # TODO: proper names
        else:
            print(f'typedef char {mangle_name(name)}[{info["size"]}];')

        if ctype:
            type_decl = TypeDecl(mangle_name(name), None, ctype)
            ctypes[name] = type_decl
            type_decl_forward = Struct(mangle_name(name) + "_s", [])
            if isinstance(type_decl, PtrDecl):
                ptr_types.add(name)
                type_decl_forward = PtrDecl(None, type_decl_forward)
                print(generator.visit(Typedef(mangle_name(name), None, ['typedef'], type_decl_forward)) + ";")

    for name in ptr_types:
        req_graph.pop(name, None)

    for name in top_sort(req_graph):
        if name in ctypes:
            print(f"\n// {name}")
            print(generator.visit(Typedef(mangle_name(name), None, ['typedef'], ctypes[name])) + ";")

script.on('message', recv)
script.load()
pointer_size = script.exports.pointerSize()
print_header(script.exports.run())
session.detach()
sys.exit(0)
//https://github.com/zengfr/frida-codeshare-scripts
//2037679868 @maltek/generate-c-header-for-swift-data-types