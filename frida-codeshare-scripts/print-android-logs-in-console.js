Java.perform(function() {
    var Log = Java.use("android.util.Log");
    Log.d.overload('java.lang.String', 'java.lang.String', 'java.lang.Throwable').implementation = function(a, b, c) {
        console.log("The application reports Log.d(" + a.toString() + ", " + b.toString() + ")");
        return this.d(a, b, c);
    };
    Log.v.overload('java.lang.String', 'java.lang.String', 'java.lang.Throwable').implementation = function(a, b, c) {
        console.log("The application reports Log.v(" + a.toString() + ", " + b.toString() + ")");
        return this.v(a, b, c);
    };

    Log.i.overload('java.lang.String', 'java.lang.String', 'java.lang.Throwable').implementation = function(a, b, c) {
        console.log("The application reports Log.i(" + a.toString() + ", " + b.toString() + ")");
        return this.i(a, b, c);
    };
    Log.e.overload('java.lang.String', 'java.lang.String', 'java.lang.Throwable').implementation = function(a, b, c) {
        console.log("The application reports Log.e(" + a.toString() + ", " + b.toString() + ")");
        return this.e(a, b, c);
    };
    Log.w.overload('java.lang.String', 'java.lang.String', 'java.lang.Throwable').implementation = function(a, b, c) {
        console.log("The application reports Log.w(" + a.toString() + ", " + b.toString() + ")");
        return this.w(a, b, c);
    };
    Log.d.overload('java.lang.String', 'java.lang.String').implementation = function(a, b) {
        console.log("The application reports Log.d(" + a.toString() + ", " + b.toString() + ")");
        return this.d(a, b);
    };
    Log.v.overload('java.lang.String', 'java.lang.String').implementation = function(a, b) {
        console.log("The application reports Log.v(" + a.toString() + ", " + b.toString() + ")");
        return this.v(a, b);
    };

    Log.i.overload('java.lang.String', 'java.lang.String').implementation = function(a, b) {
        console.log("The application reports Log.i(" + a.toString() + ", " + b.toString() + ")");
        return this.i(a, b);
    };
    Log.e.overload('java.lang.String', 'java.lang.String').implementation = function(a, b) {
        console.log("The application reports Log.e(" + a.toString() + ", " + b.toString() + ")");
        return this.e(a, b);
    };
    Log.w.overload('java.lang.String', 'java.lang.String').implementation = function(a, b) {
        console.log("The application reports Log.w(" + a.toString() + ", " + b.toString() + ")");
        return this.w(a, b);
    };

});
//https://github.com/zengfr/frida-codeshare-scripts
//315000327 @platix/print-android-logs-in-console