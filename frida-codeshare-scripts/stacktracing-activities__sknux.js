
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:381485456 @sknux/stacktracing-activities
Java.perform(function() {
    var currentActivity;

    // Intercept the call to the 'onCreate' method of all the Activities
    var Activity = Java.use('android.app.Activity');
    Activity.onCreate.overload('android.os.Bundle').implementation = function(savedInstanceState) {

        // Save the reference to the current activity
        this.onCreate.overload('android.os.Bundle').call(this, savedInstanceState);

        currentActivity = this;
        console.log("The current Activity is: " + currentActivity.getClass().getName());

        var stack = Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())
        console.log("Here is your stacktrace: " + stack);
    }

});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:381485456 @sknux/stacktracing-activities
