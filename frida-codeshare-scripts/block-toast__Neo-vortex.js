
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:2133519970 @Neo-vortex/block-toast
Java.perform(function() {
    var Toast = Java.use("android.widget.Toast");
    var Thread = Java.use("java.lang.Thread");

    var originalMakeText = Toast.makeText.overload('android.content.Context', 'java.lang.CharSequence', 'int');

    Toast.makeText.overload('android.content.Context', 'java.lang.CharSequence', 'int').implementation = function(context, text, duration) {
        var toastText = text.toString();

        if (toastText.includes("امکان باز کردن")) {
            console.log("[!] TARGET TOAST CREATED - BLOCKING: " + toastText);

            var fakeToast = originalMakeText.call(this, context, text, duration);

            fakeToast.show.implementation = function() {
                console.log("[!] Blocked target toast from showing: " + toastText);
                return;
            };

            return fakeToast;
        }

        // For non-target toasts, proceed normally
        return originalMakeText.call(this, context, text, duration);
    };

    console.log("[*] Targeted Toast blocker active for 'امکان باز کردن'");
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:2133519970 @Neo-vortex/block-toast
