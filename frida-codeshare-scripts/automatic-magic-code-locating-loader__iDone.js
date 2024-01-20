
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1599300893 @iDone/automatic-magic-code-locating-loader
// Created by B.S. 
console.warn("\nFrida.version= " + Frida.version);
console.warn("Process.arch= " + Process.arch);
console.warn("Process.platform = " + Process.platform);
console.log("Java.available= " + Java.available);
//console.log("Java.androidVersion= " + Java.androidVersion);
// Save the js file to 010Editor-MacOS-BS.js
console.error("\\n frida -f /Applications/010\ Editor.app/Contents/MacOS/010\ Editor -l ./010Editor-MacOS-BS.js --no-pause \\n");
// 
function get_rva(module, offset) {
    var base_addr = Module.findBaseAddress(module);
    if (base_addr === null)
        base_addr = enum_to_find_module(module);
    console.log(module + ' base_addr = ' + base_addr);
    var target_addr = base_addr.add(offset);

    return target_addr;
}
// - Registered to 
// 83 F9 4E
// v9.0.1
//var target_addr = get_rva("010 Editor", 0xE9680);
// v9.0.2
//var target_addr = get_rva("010 Editor", 0xE9640);
// v10.0
var target_addr = get_rva("010 Editor", 0xF5820);
//
console.log("target_addr = " + target_addr);
//
console.error("******************************");
console.error("Automatic Magic Code Locating");
console.error("Automatic signature locating");
console.error("******************************");
//
// Auto Finder
var Process = Process.findModuleByName("010 Editor");
var process_base_addr = Process.base;
var process_size = Process.size;
if (process_base_addr === null)
    process_base_addr = enum_to_find_module("010 Editor");
//
console.log("\nprocess path = " + Process.path);
console.log("process name = " + Process.name);
console.log("process base = " + process_base_addr);
console.log("process size = " + process_size);
//
target_addr = process_base_addr.add(0xF5820);
//console.log("\033[1;32;40m+ target_addr CheckSN = " + target_addr + "\033[0m"); // python3 enable
console.log("+ target_addr CheckSN = " + target_addr);
// 83 F9 4E
// 83 f9 4e
// 83 ?? 4e
var pattern = "83 f9 4e";
var searchResult_list = Memory.scanSync(process_base_addr, process_size, pattern);
//
for (var index in searchResult_list) {
    //
    console.warn("+ searchResult_list [" + index + "] = " + searchResult_list[index].address);
}
//
target_addr = ptr(searchResult_list[0].address - 0x37);
//console.log("\033[1;32;40m+ 自动定位到的特征码地址 = " + target_addr +  "\033[0m"); // python3 enable
console.error("+ Magic Code Address = " + target_addr);
// 
//var target_buf = Memory.readByteArray(target_addr, 64);
console.log(hexdump(target_addr, {
    offset: 0,
    length: 64,
    header: true,
    ansi: true
}));
// 
Interceptor.attach(ptr(target_addr), {
    onEnter: function(args) {
        // 
        console.error('Context information:');
        console.error('Context  : ' + JSON.stringify(this.context));
        console.error('Return   : ' + this.returnAddress);
        console.warn('ThreadId : ' + this.threadId);
        console.warn('Depth    : ' + this.depth);
        console.warn('Errornr  : ' + this.err);
        //
        console.log("onEnter CheckSN()");
        // Backtracer.FUZZY  模糊抓取
        // Backtracer.ACCURATE  精准抓取
        console.error("[BS] [!] backtrace:\n" + Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n") + "\n");
        //
        this.context_rdi = args[0];
        // users RBX+0x30    1000
        // C7 43 30 E8 03 00 00      mov     dword ptr [rbx+30h], 03E8h
        console.log("onEnter CheckSN() users= " + Memory.readInt(this.context_rdi.add(48)));
        Memory.writeInt(this.context_rdi.add(48), 1000);
        console.warn("onEnter CheckSN() users= " + Memory.readInt(this.context_rdi.add(48)));
        // check net RBX+0x3C    0
        // C7 43 3C 00 00 00 00      mov     dword ptr [rbx+3Ch], 0
        console.log("onEnter CheckSN() net check= " + Memory.readInt(this.context_rdi.add(60)));
        Memory.writeInt(this.context_rdi.add(60), 0);
        console.warn("onEnter CheckSN() net check= " + Memory.readInt(this.context_rdi.add(60)));
        // left days RBX+0x44    4097088000000    2099-10-31 08:00:00
        // C7 43 44 3B B9 00 00      mov     dword ptr [rbx+44h], 0B93Bh
        console.log("onEnter CheckSN() left days= " + Memory.readInt(this.context_rdi.add(68)));
        Memory.writeInt(this.context_rdi.add(68), 47419);
        console.warn("onEnter CheckSN() left days= " + Memory.readInt(this.context_rdi.add(68)));
    },
    onLeave: function(retval) {
        // left days RBX+0x44    4097088000000    2099-10-31 08:00:00
        // C7 43 44 3B B9 00 00      mov     dword ptr [rbx+44h], 0B93Bh
        console.log("onLeave CheckSN() left days= " + Memory.readInt(this.context_rdi.add(68)));
        Memory.writeInt(this.context_rdi.add(68), 47419);
        console.warn("onLeave CheckSN() left days= " + Memory.readInt(this.context_rdi.add(68)));
        // 
        console.log("onLeave CheckSN() return : " + retval.toInt32());
        // 
        // B8 DB 00 00 00            mov     eax, 0DBh
        // E9 98 00 00 00            jmp     loc_1000E970E
        retval.replace(ptr(0xDB));
        // 
        console.warn("onLeave CheckSN() return : " + retval.toInt32());
    },
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1599300893 @iDone/automatic-magic-code-locating-loader
