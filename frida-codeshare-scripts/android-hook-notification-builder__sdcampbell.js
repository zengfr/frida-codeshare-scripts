
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1907795315 @sdcampbell/android-hook-notification-builder
Java.perform(function () {
    var classHooked = false; // Flag to prevent re-hooking

    // Function to attempt hooking
    function tryHooking() {
        if (classHooked) return; // Avoid re-hooking

        try {
            // Attempt to use the class
            var NotificationCompatBuilder = Java.use('androidx.core.app.NotificationCompat$Builder');

            // Hook the setContentTitle method
            NotificationCompatBuilder.setContentTitle.overload('java.lang.CharSequence').implementation = function (title) {
                console.log('setContentTitle called with:', title);
                return this.setContentTitle(title);
            };

            // Hook the setContentText method
            NotificationCompatBuilder.setContentText.overload('java.lang.CharSequence').implementation = function (text) {
                console.log('setContentText called with:', text);
                return this.setContentText(text);
            };

            console.log('Successfully hooked NotificationCompat$Builder methods');
            classHooked = true; // Set flag to prevent re-hooking
        } catch (e) {
            // Class not yet loaded, retry after a delay
            setTimeout(tryHooking, 1000); // Retry every 1 second
        }
    }

    // Start the hooking attempt
    tryHooking();
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1907795315 @sdcampbell/android-hook-notification-builder
