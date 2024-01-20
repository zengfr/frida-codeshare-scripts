
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1596004930 @k7eon/android-full-class-path
// u can change 'Headers' and 'okhttp' as u wish

// example of output:

// com.android.okhttp.internal.http.OkHeaders$1
// com.android.okhttp.Headers
// com.android.okhttp.internal.http.OkHeaders
// okhttp3.Headers$Builder

// then u can do: var Build = Java.use("okhttp3.Headers$Builder");
// and change any method as u want here

Java.enumerateLoadedClasses({
    onMatch: function(classname) {
        if (classname.indexOf('Headers') !== -1 &&
            classname.indexOf('okhttp') !== -1) {
            console.log(classname);
        }
    },
    onComplete: function() {}
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1596004930 @k7eon/android-full-class-path
