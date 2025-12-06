
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:321945923 @Neo-vortex/block-toast-with-stacktrace
Java.perform(function() {
    var Toast = Java.use("android.widget.Toast");
    var Thread = Java.use("java.lang.Thread");
    
    var originalMakeText = Toast.makeText.overload('android.content.Context', 'java.lang.CharSequence', 'int');
    
    Toast.makeText.overload('android.content.Context', 'java.lang.CharSequence', 'int').implementation = function(context, text, duration) {
        var toastText = text.toString();
        
        if (toastText.includes("امکان باز کردن")) {
            console.log("[!] TARGET TOAST CREATED - BLOCKING: " + toastText);
            var stackTrace = Thread.currentThread().getStackTrace();
            console.log("=== CALL STACK ===");
            for (var i = 3; i < Math.min(stackTrace.length, 15); i++) {
                var frame = stackTrace[i];
                console.log("  -> " + frame.getClassName() + "." + frame.getMethodName());
            }
            
            var fakeToast = originalMakeText.call(this, context, text, duration);

            fakeToast.show.implementation = function() {
                console.log("[!] Blocked target toast from showing: " + toastText);
                return;
            };
            
            return fakeToast;
        }
        
        return originalMakeText.call(this, context, text, duration);
    };
    
    console.log("[*] Targeted Toast blocker active for 'امکان باز کردن'");
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:321945923 @Neo-vortex/block-toast-with-stacktrace
