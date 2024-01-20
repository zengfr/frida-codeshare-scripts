
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:876924166 @yodiaditya/simple-android-toast
/* 
   Simple Android Toast
   https://www.yodiw.com/frida-android-make-toast-non-rooted-device/
*/

Java.perform(function() {
    var context = Java.use('android.app.ActivityThread').currentApplication().getApplicationContext();

    Java.scheduleOnMainThread(function() {
        var toast = Java.use("android.widget.Toast");
        toast.makeText(context, Java.use("java.lang.String").$new("This is works!"), 1).show();
    });

});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:876924166 @yodiaditya/simple-android-toast
