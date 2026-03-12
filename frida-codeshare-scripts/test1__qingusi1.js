
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-353575934 @qingusi1/test1
// frida_dump_fun_0080bbcc.js
'use strict';

if (Process.arch !== 'arm64') {
    send({
        type: 'error',
        msg: 'Script built for arm64. Current arch: ' + Process.arch
    });
    throw 'Incompatible arch';
}

// Thay địa chỉ hàm tại đây (VA runtime)
const FUNC_ADDR = ptr('0xADDR_FUN_0080bbcc');

function safeReadU64(ptrAddr) {
    try {
        return ptr(ptrAddr).readU64();
    } catch (e) {
        return ptr('0x0');
    }
}

function safeReadU32(ptrAddr) {
    try {
        return ptr(ptrAddr).readU32();
    } catch (e) {
        return 0;
    }
}

function hexdumpSafe(p, len) {
    try {
        return Memory.readByteArray(ptr(p), len);
    } catch (e) {
        return null;
    }
}

Interceptor.attach(FUNC_ADDR, {
    onEnter: function(args) {
        // registers context: x19 and x20 used in decompiled code as unaff_x19/unaff_x20
        this.x19 = this.context.x19;
        this.x20 = this.context.x20;
        send({
            type: 'enter',
            addr: FUNC_ADDR.toString(),
            x19: this.x19.toString(),
            x20: this.x20.toString()
        });

        const left_struct_ptr = ptr(this.x19);
        const right_struct_ptr = ptr(this.x20);

        // lVar8 was computed as *(long *)(*(long *)(unaff_x19 + 0x30) + 0x1d0)
        // We can't recompute exactly, but we can read fields relative to x19/x20 that appear in decompiled code:
        // - right object pointer location appears: *(long *)(x20 + 0x5f0)
        // We'll read that and then access +0x88, +0x100, +0xf8, +0xb0 from that target.
        try {
            const obj_right_base = safeReadU64(this.x20.add(0x5f0));
            send({
                type: 'info',
                msg: 'obj_right_base',
                val: ptr(obj_right_base).toString()
            });

            const right_b88 = safeReadU64(ptr(obj_right_base).add(0x88)); // pointer to array struct
            send({
                type: 'info',
                msg: 'right->+0x88',
                val: ptr(right_b88).toString()
            });

            const right_b100 = safeReadU64(ptr(obj_right_base).add(0x100));
            const right_bf8 = safeReadU64(ptr(obj_right_base).add(0xf8));
            const right_bB0 = safeReadU64(ptr(obj_right_base).add(0xb0));
            send({
                type: 'info',
                msg: 'right fields',
                b100: ptr(right_b100).toString(),
                bf8: ptr(right_bf8).toString(),
                bb0: right_bB0
            });

            // Dump array on right if present
            if (!right_b88.isNull()) {
                const count = safeReadU64(ptr(right_b88).add(0x0)).toNumber(); // *puVar10
                const entries_ptr = safeReadU64(ptr(right_b88).add(0x8)); // puVar10[1]
                send({
                    type: 'info',
                    msg: 'right array',
                    count: count,
                    entries_ptr: ptr(entries_ptr).toString()
                });
                for (let i = 0; i < Math.min(count, 64); i++) {
                    const entry_addr = safeReadU64(ptr(entries_ptr).add(i * 8));
                    if (entry_addr.isNull()) continue;
                    const typeField = safeReadU64(ptr(entry_addr).add(0x10));
                    const dataPtr = safeReadU64(ptr(entry_addr).add(8));
                    let blob = hexdumpSafe(dataPtr, 32);
                    send({
                        type: 'entry_right',
                        idx: i,
                        entry: ptr(entry_addr).toString(),
                        typeField: ptr(typeField).toString(),
                        dataPtr: ptr(dataPtr).toString(),
                        blob: blob
                    });
                }
            }

            // Try to find left table pointer lVar8 by computing: *(long *)(*(long *)(x19 + 0x30) + 0x1d0)
            const p30 = safeReadU64(this.x19.add(0x30));
            const lVar8 = safeReadU64(ptr(p30).add(0x1d0));
            send({
                type: 'info',
                msg: 'computed lVar8',
                val: ptr(lVar8).toString()
            });
            if (!lVar8.isNull()) {
                const left_b88 = safeReadU64(ptr(lVar8).add(0x88));
                send({
                    type: 'info',
                    msg: 'left->+0x88',
                    val: ptr(left_b88).toString()
                });
                if (!left_b88.isNull()) {
                    const countL = safeReadU64(ptr(left_b88).add(0x0)).toNumber();
                    const entriesL = safeReadU64(ptr(left_b88).add(0x8));
                    send({
                        type: 'info',
                        msg: 'left array',
                        count: countL,
                        entries_ptr: ptr(entriesL).toString()
                    });
                    for (let j = 0; j < Math.min(countL, 64); j++) {
                        const entry_addr = safeReadU64(ptr(entriesL).add(j * 8));
                        if (entry_addr.isNull()) continue;
                        const typeField = safeReadU64(ptr(entry_addr).add(0x10));
                        const dataPtr = safeReadU64(ptr(entry_addr).add(8));
                        let blob = hexdumpSafe(dataPtr, 32);
                        send({
                            type: 'entry_left',
                            idx: j,
                            entry: ptr(entry_addr).toString(),
                            typeField: ptr(typeField).toString(),
                            dataPtr: ptr(dataPtr).toString(),
                            blob: blob
                        });
                    }
                }
                // Also dump lVar8 + 0xb0 (the field copied later)
                const lVar8_bB0 = safeReadU64(ptr(lVar8).add(0xb0));
                send({
                    type: 'info',
                    msg: 'lVar8 +0xb0',
                    val: lVar8_bB0
                });
            }
        } catch (e) {
            send({
                type: 'error',
                msg: 'exception reading memory: ' + e
            });
        }
    },
    onLeave: function(retval) {
        send({
            type: 'leave',
            retval: retval
        });
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-353575934 @qingusi1/test1
