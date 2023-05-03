
//https://github.com/zengfr/frida-codeshare-scripts
//950898106 @P0r0/very-early-instrumentation-of-native-code
var test = false;
Interceptor.attach(Module.findExportByName("libc.so", "open"), {
    onEnter: function() {
        var what = Memory.readUtf8String(this.context.x0); //x0 or r0
        if (what.indexOf("libnative.so") >= 0) {
            test = true;
        }
    }, 
    onLeave: function(ret) {
        if (test) {
            test = false;
            var symb = Module.enumerateSymbolsSync("linker64"); //linker64 or linker
            var prelink_image = null;
            var baseaddr = null;

            for (var sym in symb) {
                if (symb[sym].name.indexOf("phdr_table_get_dynamic_section") >= 0) {
                    console.log("SYMBOL NAME = " + symb[sym].name)
                    prelink_image = symb[sym].address
                }
            }

            if(prelink_image != null)
            {
                Interceptor.attach(prelink_image, function() {
                    //console.log(JSON.stringify(this.context))
                    var x2_load_bias = parseInt(this.context.x2.toString(), "16"); // x2 or r2
                    var thumb = 0 //1 for thumb
                    var _init_offset = 0x15a8 + thumb
                    var _init = x2_load_bias + _init_offset; 

                    Interceptor.attach(ptr(_init), {
                        onEnter: function(args){
                            console.log("Calling global constructor")
                        },
                        onLeave: function(retval){
                        }
                    });
                });
            }
        }            
    }
});
//https://github.com/zengfr/frida-codeshare-scripts
//950898106 @P0r0/very-early-instrumentation-of-native-code
