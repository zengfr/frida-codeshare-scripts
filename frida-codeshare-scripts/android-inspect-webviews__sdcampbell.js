
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1038092699 @sdcampbell/android-inspect-webviews
Java.perform(function () {
    var WebView = Java.use('android.webkit.WebView');

    // Hook the loadUrl() method to capture URLs being loaded in WebViews
    WebView.loadUrl.overload('java.lang.String').implementation = function (url) {
        console.log("Loading URL: " + url);
        return this.loadUrl(url);
    };

    // Hook loadUrl() with additional params
    WebView.loadUrl.overload('java.lang.String', 'java.util.Map').implementation = function (url, additionalHttpHeaders) {
        console.log("Loading URL with headers: " + url);
        return this.loadUrl(url, additionalHttpHeaders);
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1038092699 @sdcampbell/android-inspect-webviews
