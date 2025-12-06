
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1514547442 @qingusi1/test
// hooks.js
Java.perform(function() {
    try {
        var Activity = Java.use('android.app.Activity');
        var Toast = Java.use('android.widget.Toast');

        // helper: show toast safely
        function showToast(ctx, msg) {
            try {
                Toast.makeText(ctx, Java.use('java.lang.String').$new(msg), 0 /*LENGTH_SHORT*/ ).show();
            } catch (e) {
                try {
                    console.log('[toast error]', e.toString());
                } catch (e) {}
            }
        }

        // onCreate(Bundle)
        try {
            var orig_onCreate = Activity.onCreate.overload('android.os.Bundle').implementation;
            Activity.onCreate.overload('android.os.Bundle').implementation = function(bundle) {
                try {
                    var cname = this.getClass().getName();
                    console.log('[FRIDA] onCreate ->', cname);
                    showToast(this.getApplicationContext(), 'Activity onCreate: ' + cname);
                } catch (e) {
                    console.log(e);
                }
                return orig_onCreate.call(this, bundle);
            };
        } catch (e) { /* ignore */ }

        // onResume()
        try {
            var orig_onResume = Activity.onResume.overload().implementation;
            Activity.onResume.overload().implementation = function() {
                try {
                    var cname = this.getClass().getName();
                    console.log('[FRIDA] onResume ->', cname);
                    showToast(this.getApplicationContext(), 'Activity resumed: ' + cname);
                } catch (e) {
                    console.log(e);
                }
                return orig_onResume.call(this);
            };
        } catch (e) { /* ignore */ }

        // onPause()
        try {
            var orig_onPause = Activity.onPause.overload().implementation;
            Activity.onPause.overload().implementation = function() {
                try {
                    var cname = this.getClass().getName();
                    console.log('[FRIDA] onPause ->', cname);
                    showToast(this.getApplicationContext(), 'Activity paused: ' + cname);
                } catch (e) {
                    console.log(e);
                }
                return orig_onPause.call(this);
            };
        } catch (e) { /* ignore */ }

        // onStart() / onStop() optional
        try {
            var orig_onStart = Activity.onStart.overload().implementation;
            Activity.onStart.overload().implementation = function() {
                try {
                    var cname = this.getClass().getName();
                    console.log('[FRIDA] onStart ->', cname);
                    showToast(this.getApplicationContext(), 'Activity onStart: ' + cname);
                } catch (e) {}
                return orig_onStart.call(this);
            };
        } catch (e) {}

        try {
            var orig_onStop = Activity.onStop.overload().implementation;
            Activity.onStop.overload().implementation = function() {
                try {
                    var cname = this.getClass().getName();
                    console.log('[FRIDA] onStop ->', cname);
                    showToast(this.getApplicationContext(), 'Activity onStop: ' + cname);
                } catch (e) {}
                return orig_onStop.call(this);
            };
        } catch (e) {}

        console.log('[FRIDA] Activity lifecycle hooks installed.');
    } catch (err) {
        console.log('[FRIDA] error installing hooks:', err);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1514547442 @qingusi1/test
