
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-528243382 @FixedOctocat/pendingintent-interception
Java.perform(function() {
    var pendingIntent = Java.use('android.app.PendingIntent');

    var getActivity_1 = pendingIntent.getActivity.overload("android.content.Context", "int", "android.content.Intent", "int");
    getActivity_1.implementation = function(context, requestCode, intent, flags) {
        console.log("[*] Calling PendingIntent.getActivity(" + intent.getAction() + ")");
        console.log("\t[-] Base Intent toString: " + intent.toString());
        console.log("\t[-] Base Intent getExtras: " + intent.getExtras());
        console.log("\t[-] Base Intent getFlags: " + intent.getFlags());
        return this.getActivity(context, requestCode, intent, flags);
    }

    var getActivities_1 = pendingIntent.getActivities.overload("android.content.Context", "int", "android.content.Intent", "int");
    getActivities_1.implementation = function(context, requestCode, intent, flags) {
        console.log("[*] Calling PendingIntent.getActivity(" + intent.getAction() + ")");
        console.log("\t[-] Base Intent toString: " + intent.toString());
        console.log("\t[-] Base Intent getExtras: " + intent.getExtras());
        console.log("\t[-] Base Intent getFlags: " + intent.getFlags());
        return this.getActivities(context, requestCode, intent, flags);
    }

    var getBroadcast_1 = pendingIntent.getBroadcast.overload("android.content.Context", "int", "android.content.Intent", "int");
    getBroadcast_1.implementation = function(context, requestCode, intent, flags) {
        console.log("[*] Calling PendingIntent.getActivity(" + intent.getAction() + ")");
        console.log("\t[-] Base Intent toString: " + intent.toString());
        console.log("\t[-] Base Intent getExtras: " + intent.getExtras());
        console.log("\t[-] Base Intent getFlags: " + intent.getFlags());
        return this.getBroadcast(context, requestCode, intent, flags);
    }

    var getService_1 = pendingIntent.getService.overload("android.content.Context", "int", "android.content.Intent", "int");
    getService_1.implementation = function(context, requestCode, intent, flags) {
        console.log("[*] Calling PendingIntent.getActivity(" + intent.getAction() + ")");
        console.log("\t[-] Base Intent toString: " + intent.toString());
        console.log("\t[-] Base Intent getExtras: " + intent.getExtras());
        console.log("\t[-] Base Intent getFlags: " + intent.getFlags());
        return this.getService(context, requestCode, intent, flags);
    }
})
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-528243382 @FixedOctocat/pendingintent-interception
