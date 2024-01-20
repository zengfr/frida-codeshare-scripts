
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-320800175 @InvictusNinja/enumerate-library
Module.enumerateExports("libhwui.so", {
    onMatch: function(e) {
        if (e.type == 'function') {
            console.log("name of function = " + e.name);

            if (e.name == "Java_example_decrypt") {
                console.log("Function Decrypt recognized by name");
                Interceptor.attach(e.address, {
                    onEnter: function(args) {
                        console.log("Interceptor attached onEnter...");
                    },
                    onLeave: function(retval) {
                        console.log("Interceptor attached onLeave...");
                    }
                });
            }
        }
    },
    onComplete: function() {}
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-320800175 @InvictusNinja/enumerate-library
