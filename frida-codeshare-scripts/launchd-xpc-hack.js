
//https://github.com/zengfr/frida-codeshare-scripts
//-1503241497 @stek29/launchd-xpc-hack
/*
    libxpc is broken in launchd itself, so we have to fix it up manually
    first of all, bootstrap port is needed. there probably is a nicier way to do this,
    but I've just stolen bootstrap_donor_pid's bootstrap port to our process
    
    notice: whatever has pid 20 likekly doesn't have get_task-allow, so see jailbreakd_client
    
    when we have bootstrap port, we set it to xpc's "xpc_global_data.task_bootstrap_port"
    see http://newosxbook.com/articles/jlaunchctl.html
    
    after that we create an xpc_pipe and set it to xpc_global_data.xpc_bootstrap_pipe
    
    and finally we change whatever looks like as initialization flag (different
    from xpc_flags, referred by J as "uint64_t a").
    
    after that bootstrap_look_up should work fine
*/

var bootstrap_donor_pid = 20;

var mach_task_self_ = Memory.readU32(Module.findExportByName(null, "mach_task_self_"))

var task_get_special_port = new NativeFunction(Module.findExportByName(null, "task_get_special_port"), "int", ["int", "int", "pointer"]);
var task_set_special_port = new NativeFunction(Module.findExportByName(null, "task_set_special_port"), "int", ["int", "int", "int"]);
var task_for_pid = new NativeFunction(Module.findExportByName(null, "task_for_pid"), "int", ["int", "int", "pointer"]);
var xpc_pipe_create_from_port = new NativeFunction(Module.findExportByName(null, "xpc_pipe_create_from_port"), "pointer", ["int", "int"]);

var xpg_gd__a = Memory.readPointer(Module.findExportByName(null, "_os_alloc_once_table").add(0x18)).add(0x00);
var xpg_gd__xpc_flags = Memory.readPointer(Module.findExportByName(null, "_os_alloc_once_table").add(0x18)).add(0x08);
var xpg_gd__task_bootstrap_port = Memory.readPointer(Module.findExportByName(null, "_os_alloc_once_table").add(0x18)).add(0x10);
var xpg_gd__xpc_bootstrap_pipe = Memory.readPointer(Module.findExportByName(null, "_os_alloc_once_table").add(0x18)).add(0x18);

task_for_pid(mach_task_self_, bootstrap_donor_pid, xpg_gd__task_bootstrap_port);
var tfp20 = Memory.readU32(xpg_gd__task_bootstrap_port);
task_get_special_port(tfp20, 4, xpg_gd__task_bootstrap_port);
var bp = Memory.readU32(xpg_gd__task_bootstrap_port);

// sync everywhere
task_set_special_port(mach_task_self_, 4, bp);
Memory.writeU32(Module.findExportByName(null, "bootstrap_port"), bp);

var bpipe = xpc_pipe_create_from_port(bp, 0);
Memory.writePointer(xpg_gd__xpc_bootstrap_pipe, bpipe);

Memory.writeU64(xpg_gd__a, 0x1000000); // likely initialization state

// test
var bootstrap_look_up = new NativeFunction(Module.findExportByName(null, "bootstrap_look_up"), "int", ["int", "pointer", "pointer"]);
var jbdp = Memory.alloc(4);
// put some other service here
var jbds = Memory.allocUtf8String("com.apple.uikit.viewservice.frida");
bootstrap_look_up(bp, jbds, jbdp);
//https://github.com/zengfr/frida-codeshare-scripts
//-1503241497 @stek29/launchd-xpc-hack
