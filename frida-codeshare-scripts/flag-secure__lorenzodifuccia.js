
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:192155498 @lorenzodifuccia/flag-secure
/**
* FLAG_SECURE Bypass for Android
* Author: github.com/lorenzodifuccia
* 
* Disables FLAG_SECURE to allow screenshots/screen recording.
* Hooks `Window.setFlags`/`addFlags` to strip the flag, and uses `ActivityThread.mActivities` to clear it on already running activities via UI thread.
*/

Java.perform(function () {
    var FLAG_SECURE = 0x2000;

    Java.scheduleOnMainThread(function () {
        try {
            var ActivityThread = Java.use("android.app.ActivityThread");
            var currentActivity = ActivityThread.currentActivityThread().mActivities.value;

            var it = currentActivity.values().iterator();
            while (it.hasNext()) {
                var record = Java.cast(it.next(), Java.use("android.app.ActivityThread$ActivityClientRecord"));
                var activity = record.activity.value;
                if (activity !== null) {
                    var win = activity.getWindow();
                    win.clearFlags(FLAG_SECURE);
                    var params = win.getAttributes();
                    params.flags.value &= ~FLAG_SECURE;
                    win.setAttributes(params);
                    console.log("[+] Cleared on: " + activity.getClass().getName());
                }
            }
        } catch (e) {
            console.log("[-] Error: " + e, e.stack);
        }
    });

    // Hook Window.setFlags to prevent FLAG_SECURE from being set
    var Window = Java.use("android.view.Window");

    Window.setFlags.implementation = function (flags, mask) {
        console.log("[*] setFlags called with flags: " + flags + ", mask: " + mask);

        if ((flags & FLAG_SECURE) != 0) {
            console.log("[+] Removing FLAG_SECURE from setFlags");
            flags &= ~FLAG_SECURE;
            mask &= ~FLAG_SECURE;
        }

        this.setFlags(flags, mask);
    };

    Window.addFlags.implementation = function (flags) {
        console.log("[*] addFlags called with flags: " + flags);

        if ((flags & FLAG_SECURE) != 0) {
            console.log("[+] Removing FLAG_SECURE from addFlags");
            flags &= ~FLAG_SECURE;
        }

        this.addFlags(flags);
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:192155498 @lorenzodifuccia/flag-secure
