Java.performNow(function(){
        var target = Java.use("com.pacakge.myClass")
        var threadef = Java.use('java.lang.Thread')
        var threadinstance = ThreadDef.$new()

        function Where(stack){
            var at = ""
            for(var i = 0; i < stack.length; ++i){
                at += stack[i].toString() + "\n"
            }
            return at
        }

        target.foo.overload("java.lang.String").implementation = function(obfuscated_str){
            var ret = this.foo(obfuscated_str)
            var stack = threadinstance.currentThread().getStackTrace()
            var full_call_stack = Where(stack)
            send("Deobfuscated " + ret + " @ " + stack[3].toString() + "\n\t Full call stack:" + full_call_stack) 
            return ret
        }
    })
//https://github.com/zengfr/frida-codeshare-scripts
//-2066478028 @razaina/get-a-stack-trace-in-your-hook