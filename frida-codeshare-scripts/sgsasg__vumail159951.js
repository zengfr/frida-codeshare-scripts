
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1172280059 @vumail159951/sgsasg
Java.perform(function() {
    const System = Java.use('java.lang.System');
    const Runtime = Java.use('java.lang.Runtime');
    const SystemLoad_2 = System.loadLibrary.overload('java.lang.String');
    const VMStack = Java.use('dalvik.system.VMStack');

    SystemLoad_2.implementation = function(library) {
        console.log("Loading dynamic library => " + library);
        try {
            const loaded = Runtime.getRuntime().loadLibrary0(VMStack.getCallingClassLoader(), library);
            if(library.includes("taInterface")) {
                // do stuff
            }
            return loaded;
        } catch(ex) {
            console.log(ex);
        }
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1172280059 @vumail159951/sgsasg
