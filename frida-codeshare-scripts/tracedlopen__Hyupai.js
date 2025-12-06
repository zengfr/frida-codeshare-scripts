
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:465010325 @Hyupai/tracedlopen
// frida -U -f com.seu.app -l monitor_exec_robust.js --no-pause

var hookedFunctions = [];

function hook_native_exec() {
    // Todas as funções exec*
    ["system", "popen", "execl", "execlp", "execle", "execv", "execvp", "execvpe", "execve", "posix_spawn", "posix_spawnp", "fork"].forEach(function(fnName) {
        var fn = Module.findExportByName(null, fnName);
        if (fn) {
            Interceptor.attach(fn, {
                onEnter: function (args) {
                    try {
                        var path = args[0].isNull ? "" : Memory.readUtf8String(args[0]);
                        console.log("[" + fnName + "] path: " + path);

                        if (fnName.startsWith("execv") || fnName === "execve" || fnName === "posix_spawn" || fnName === "posix_spawnp") {
                            var argv = [];
                            var p = args[1];
                            var i = 0;
                            while (!p.isNull()) {
                                var argPtr = Memory.readPointer(p.add(i * Process.pointerSize));
                                if (argPtr.isNull()) break;
                                argv.push(Memory.readUtf8String(argPtr));
                                i++;
                            }
                            console.log("        argv: " + argv.join(" "));
                        }
                    } catch(e){console.log("Error reading "+fnName+" args: "+e);}
                }
            });
            hookedFunctions.push(fnName);
        }
    });
}

function hook_pipes() {
   var pipe_map = {};

    var pipe = Module.findExportByName(null, "pipe");
    Interceptor.attach(pipe, {
        onLeave: function (retval) {
            console.log("[pipe] returned fds: " + retval.toInt32());
            pipe_map[retval.toInt32()] = "maybe process stdout/stderr";
        }
    });

}

function hook_java_runtime() {
    Java.perform(function () {
        var Runtime = Java.use("java.lang.Runtime");

        Runtime.exec.overloads.forEach(function (ov) {
            ov.implementation = function () {
                console.log("[Runtime.exec] args: " + ov.argumentTypes.map((_,i)=>arguments[i]).join(" "));
                return ov.apply(this, arguments);
            }
        });
        hookedFunctions.push("Runtime.exec");

        var PB = Java.use("java.lang.ProcessBuilder");
       PB.start.implementation = function () {
                try {
                    var cmdList = Java.array('java.lang.String', this.command().toArray());
                    console.log("[ProcessBuilder.start] command: " + cmdList.join(" "));
                } catch(e) {
                    console.log("Error reading ProcessBuilder command: " + e);
                }
                return this.start();
            };
        hookedFunctions.push("ProcessBuilder.start");
    });
}

setImmediate(function () {
    console.log("[*] Starting robust exec hooks...");
    hook_native_exec();
    hook_pipes();
    hook_java_runtime();
    console.log("[*] Hooked functions: " + hookedFunctions.join(", "));
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:465010325 @Hyupai/tracedlopen
