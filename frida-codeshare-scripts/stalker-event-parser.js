'use strict';

/*
 * Sample parser for Stalker events. It's intended as an example
 * to understand the format, it's possible to optimize it more.
 * It produces disassembly for block, compile and exec events - which
 * is totally unnecessary but it's useful for debugging.
 *
 * parseEvents(events, callback);
 *
 * Parameters:
 *
 *   events - the events as got from onReceive()
 *   callback - a callback to be executed for each parsed event
 *
 * Example:

  Stalker.follow({
    events: {
      call: false,
      ret: false,
      exec: false,
      block: false,
      compile: true
    },
    onReceive: function (events) {
      console.log('[' + tid + '] onReceive!');
      parseEvents(events, function (event) {
        if (event.type === 'compile' || event.type === 'block') {
          console.log('\n' + event.begin + ' -> ' + event.end);
          console.log(event.code + '\n');
        }
      });
    }
  });
*/

var threads = {};

var EV_TYPE_NOTHING = 0;
var EV_TYPE_CALL = 1;
var EV_TYPE_RET = 2;
var EV_TYPE_EXEC = 4;
var EV_TYPE_BLOCK = 8;
var EV_TYPE_COMPILE = 16;

var intSize = Process.pointerSize;
var EV_STRUCT_SIZE = 2 * Process.pointerSize + 2 * intSize;

function parseEvents(blob, callback) {
    var len = getLen(blob);
    for (var i = 0; i !== len; i++) {
        var type = getType(blob, i);
        switch (type) {
            case EV_TYPE_CALL:
                callback(parseCallEvent(blob, i));
                break;
            case EV_TYPE_RET:
                callback(parseRetEvent(blob, i));
                break;
            case EV_TYPE_EXEC:
                callback(parseExecEvent(blob, i));
                break;
            case EV_TYPE_BLOCK:
                callback(parseBlockEvent(blob, i));
                break;
            case EV_TYPE_COMPILE:
                callback(parseCompileEvent(blob, i));
                break;
            default:
                console.log('Unsupported type ' + type);
                break;
        }
    }
}

function getType(blob, idx) {
    return parseInteger(blob, idx, 0);
}

function getLen(blob) {
    return blob.byteLength / EV_STRUCT_SIZE;
}

function parseCallEvent(blob, idx) {
    return {
        type: 'call',
        location: parsePointer(blob, idx, intSize),
        target: parsePointer(blob, idx, intSize + Process.pointerSize),
        depth: parseInteger(blob, idx, intSize + 2 * Process.pointerSize)
    };
}

function parseRetEvent(blob, idx) {
    var ev = parseCallEvent(blob, idx);
    ev.type = 'ret';
    return ev;
}

function parseExecEvent(blob, idx) {
    var loc = parsePointer(blob, idx, intSize);
    return {
        type: 'exec',
        location: loc,
        code: Instruction.parse(loc).toString()
    };
}

function parseBlockEvent(blob, idx) {
    var begin = parsePointer(blob, idx, intSize);
    var end = parsePointer(blob, idx, intSize + Process.pointerSize);
    var i = begin.add(0);
    var code = [];
    while (i.compare(end) < 0) {
        var instr = Instruction.parse(i);
        code.push(i.toString() + '    ' + instr.toString());
        i = instr.next;
    }
    return {
        type: 'block',
        begin: begin,
        end: end,
        code: code.join('\n')
    };
}

function parseCompileEvent(blob, idx) {
    var parsed = parseBlockEvent(blob, idx);
    parsed.type = 'compile';
    return parsed;
}

function parseInteger(blob, idx, offset) {
    return new Int32Array(blob, idx * EV_STRUCT_SIZE + offset, 1)[0];
}

function parsePointer(blob, idx, offset) {
    var view = new Uint8Array(blob, idx * EV_STRUCT_SIZE + offset, Process.pointerSize);
    var stringed = [];
    for (var i = 0; i < Process.pointerSize; i++) {
        var x = view[i];
        var conv = x.toString(16);
        if (conv.length === 1) {
            conv = '0' + conv;
        }
        stringed.push(conv);
    }
    return ptr('0x' + stringed.reverse().join(''));
}

function reverse(arr) {
    var result = [];
    for (var i = arr.length - 1; i >= 0; i--) {
        result.push(arr[i]);
    }
    return result;
}
//https://github.com/zengfr/frida-codeshare-scripts
//-1292983183 @mrmacete/stalker-event-parser