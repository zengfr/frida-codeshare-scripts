
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1391988419 @karim-moftah/ios-sqlite3
// frida-sqlite-prepare-all.js
// Hooks sqlite3_prepare, sqlite3_prepare_v2, sqlite3_prepare_v3,
// sqlite3_prepare16, sqlite3_prepare16_v2, sqlite3_prepare16_v3
// plus helpful surrounding SQLite functions to make output useful.
//
// Usage:
//   frida -U -f <bundle/id> -l frida-sqlite-prepare-all.js
// or attach:
//   frida -U -n <process> -l frida-sqlite-prepare-all.js

'use strict';

const stmts = {}; // map stmtPtr -> { sql: "...", binds: { idx: val } }

function p(ptr) {
    return ptr ? ptr.toString() : "0x0";
}

function safeReadUtf8(ptr) {
    try {
        if (!ptr || ptr.isNull()) return null;
        return Memory.readUtf8String(ptr);
    } catch (e) {
        return null;
    }
}

function safeReadUtf16(ptr) {
    try {
        if (!ptr || ptr.isNull()) return null;
        return Memory.readUtf16String(ptr);
    } catch (e) {
        return null;
    }
}

function backtrace(context) {
    try {
        return Thread.backtrace(context, Backtracer.ACCURATE)
            .map(DebugSymbol.fromAddress)
            .slice(0, 12)
            .join("\n");
    } catch (e) {
        return "(backtrace unavailable)";
    }
}

// utility to store SQL for a statement
function storeStmt(stmtPtr, sql) {
    try {
        const key = p(stmtPtr);
        if (!stmts[key]) stmts[key] = {
            sql: sql,
            binds: {}
        };
    } catch (e) {}
}

// Handler generator for prepare variants
function attachPrepare(symName, opts) {
    // opts: { sqlArgIndex: int, isUtf16: bool, ppStmtIndex: int }
    const ptr = Module.findExportByName(null, symName);
    if (!ptr) {
        // console.log(symName + " not found");
        return;
    }
    Interceptor.attach(ptr, {
        onEnter: function(args) {
            this.sym = symName;
            this.isUtf16 = !!opts.isUtf16;
            this.sqlArg = args[opts.sqlArgIndex];
            this.ppStmt = args[opts.ppStmtIndex];
            this.bt = backtrace(this.context);
            if (this.isUtf16) {
                this.sql = safeReadUtf16(this.sqlArg) || null;
            } else {
                this.sql = safeReadUtf8(this.sqlArg) || null;
            }
        },
        onLeave: function(retval) {
            try {
                const sql = this.sql || "(null)";
                if (!this.ppStmt.isNull()) {
                    const stmtPtr = Memory.readPointer(this.ppStmt);
                    if (!stmtPtr.isNull()) {
                        storeStmt(stmtPtr, sql);
                        console.log("\n== " + this.sym + " ==");
                        console.log("STMT: " + p(stmtPtr));
                        console.log("SQL: " + sql);
                        console.log("Return code: " + retval.toInt32());

                        return;
                    }
                }
                // sometimes prepare variants do not return a stmt (NULL) but still worth logging
                console.log("\n== " + this.sym + " (no stmt) ==");
                console.log("SQL: " + sql);
                console.log("Return code: " + retval.toInt32());

            } catch (e) {
                console.log(this.sym + ".onLeave error: " + e);
            }
        }
    });
}

// Attach all prepare functions you requested
const prepares = [{
        name: "sqlite3_prepare",
        opts: {
            sqlArgIndex: 1,
            isUtf16: false,
            ppStmtIndex: 3
        }
    },
    {
        name: "sqlite3_prepare_v2",
        opts: {
            sqlArgIndex: 1,
            isUtf16: false,
            ppStmtIndex: 3
        }
    },
    {
        name: "sqlite3_prepare_v3",
        opts: {
            sqlArgIndex: 1,
            isUtf16: false,
            ppStmtIndex: 3
        }
    },

    // 16-bit (UTF-16) variants usually have wchar_t* as sql arg
    {
        name: "sqlite3_prepare16",
        opts: {
            sqlArgIndex: 1,
            isUtf16: true,
            ppStmtIndex: 3
        }
    },
    {
        name: "sqlite3_prepare16_v2",
        opts: {
            sqlArgIndex: 1,
            isUtf16: true,
            ppStmtIndex: 3
        }
    },
    {
        name: "sqlite3_prepare16_v3",
        opts: {
            sqlArgIndex: 1,
            isUtf16: true,
            ppStmtIndex: 3
        }
    }
];

prepares.forEach(function(pf) {
    attachPrepare(pf.name, pf.opts);
});

// Also hook sqlite3_exec (convenient for statements executed directly via exec)
const execPtr = Module.findExportByName(null, "sqlite3_exec");
if (execPtr) {
    Interceptor.attach(execPtr, {
        onEnter: function(args) {
            this.db = args[0];
            this.sqlPtr = args[1];
            // try utf8 then utf16 fallback
            this.sql = safeReadUtf8(this.sqlPtr) || safeReadUtf16(this.sqlPtr) || null;
            this.bt = backtrace(this.context);
            console.log("\n== sqlite3_exec ==");
            console.log("DB: " + p(this.db));
            console.log("SQL: " + (this.sql || "(null)"));

        }
    });
}

// sqlite3_step: print bound params and associated SQL if we tracked it
const stepPtr = Module.findExportByName(null, "sqlite3_step");
if (stepPtr) {
    Interceptor.attach(stepPtr, {
        onEnter: function(args) {
            try {
                this.stmt = args[0];
                const key = p(this.stmt);
                const rec = stmts[key];
                if (rec) {
                    this.bt = backtrace(this.context);
                    console.log("\n== sqlite3_step ==");
                    console.log("STMT: " + key);
                    console.log("SQL: " + rec.sql);
                    if (rec.binds && Object.keys(rec.binds).length > 0) {
                        console.log("Bound params:");
                        for (let i in rec.binds) console.log("  [" + i + "] = " + rec.binds[i]);
                    } else {
                        console.log("Bound params: (none)");
                    }

                }
            } catch (e) {}
        }
    });
}

// Bind functions: record values for tracked statements
const bindFns = [{
        name: "sqlite3_bind_text",
        handler: function(args) {
            const stmt = args[0];
            const idx = args[1].toInt32();
            const txt = safeReadUtf8(args[2]) || safeReadUtf16(args[2]) || null;
            const key = p(stmt);
            if (stmts[key]) stmts[key].binds[idx] = txt === null ? "NULL" : '"' + txt + '"';
        }
    },
    {
        name: "sqlite3_bind_text16",
        handler: function(args) {
            const stmt = args[0];
            const idx = args[1].toInt32();
            const txt = safeReadUtf16(args[2]) || null;
            const key = p(stmt);
            if (stmts[key]) stmts[key].binds[idx] = txt === null ? "NULL" : '"' + txt + '"';
        }
    },
    {
        name: "sqlite3_bind_int",
        handler: function(args) {
            const stmt = args[0];
            const idx = args[1].toInt32();
            const v = args[2].toInt32();
            const key = p(stmt);
            if (stmts[key]) stmts[key].binds[idx] = v;
        }
    },
    {
        name: "sqlite3_bind_int64",
        handler: function(args) {
            const stmt = args[0];
            const idx = args[1].toInt32();
            const v = args[2].toInt64();
            const key = p(stmt);
            if (stmts[key]) stmts[key].binds[idx] = v.toString();
        }
    },
    {
        name: "sqlite3_bind_double",
        handler: function(args) {
            const stmt = args[0];
            const idx = args[1].toInt32();
            // read double safely
            let v = null;
            try {
                v = args[2].readDouble();
            } catch (e) {
                try {
                    v = args[2].toDouble();
                } catch (e2) {
                    v = "(double?)";
                }
            }
            const key = p(stmt);
            if (stmts[key]) stmts[key].binds[idx] = v;
        }
    },
    {
        name: "sqlite3_bind_null",
        handler: function(args) {
            const stmt = args[0];
            const idx = args[1].toInt32();
            const key = p(stmt);
            if (stmts[key]) stmts[key].binds[idx] = "NULL";
        }
    },
    {
        name: "sqlite3_bind_blob",
        handler: function(args) {
            const stmt = args[0];
            const idx = args[1].toInt32();
            const n = args[3].toInt32();
            const key = p(stmt);
            if (stmts[key]) stmts[key].binds[idx] = "<blob, " + n + " bytes>";
        }
    }
];

bindFns.forEach(function(item) {
    const ptr = Module.findExportByName(null, item.name);
    if (!ptr) return;
    Interceptor.attach(ptr, {
        onEnter: function(args) {
            try {
                item.handler(args);
            } catch (e) {}
        }
    });
});

// finalize: print final bound params and cleanup
const finalizePtr = Module.findExportByName(null, "sqlite3_finalize");
if (finalizePtr) {
    Interceptor.attach(finalizePtr, {
        onEnter: function(args) {
            try {
                const stmt = args[0];
                const key = p(stmt);
                const rec = stmts[key];
                if (rec) {
                    console.log("\n== sqlite3_finalize ==");
                    console.log("STMT: " + key);
                    console.log("SQL: " + rec.sql);
                    if (rec.binds && Object.keys(rec.binds).length > 0) {
                        console.log("Bound params (final):");
                        for (let i in rec.binds) console.log("  [" + i + "] = " + rec.binds[i]);
                    } else {
                        console.log("Bound params: (none)");
                    }
                    delete stmts[key];
                }
            } catch (e) {}
        }
    });
}

// reset: clear binds (statements may be reused)
const resetPtr = Module.findExportByName(null, "sqlite3_reset");
if (resetPtr) {
    Interceptor.attach(resetPtr, {
        onEnter: function(args) {
            try {
                const key = p(args[0]);
                if (stmts[key]) stmts[key].binds = {};
            } catch (e) {}
        }
    });
}

// defensive log to show script loaded
console.log("[frida] sqlite3 prepare hooks installed for: sqlite3_prepare, sqlite3_prepare_v2, sqlite3_prepare_v3, sqlite3_prepare16, sqlite3_prepare16_v2, sqlite3_prepare16_v3 (plus exec/step/bind/finalize/reset).");
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1391988419 @karim-moftah/ios-sqlite3
