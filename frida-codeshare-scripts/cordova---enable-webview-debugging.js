// Usage : frida -U -f bundle_id -l enable_debug.js --no-pause 
// Blog link to be added 
// Written by @67616d654661636 and @sunnyrockzzs

Java.perform(function() {
    var Webview = Java.use("android.webkit.WebView")
    Webview.loadUrl.overload("java.lang.String").implementation = function(url) {
        console.log("\n[+]Loading URL from", url);
        console.log("[+]Setting the value of setWebContentsDebuggingEnabled() to TRUE");
        this.setWebContentsDebuggingEnabled(true);
        this.loadUrl.overload("java.lang.String").call(this, url);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts
//-608405739 @gameFace22/cordova---enable-webview-debugging