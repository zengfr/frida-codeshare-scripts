
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:108282083 @jackkongjr/load-from-asset-folder
//Load js files when asset folder has been encrypted on a cordova mobile app

Java.perform(function() {

    var webView = Java.use("android.webkit.WebView");
    webView.loadUrl.overload("java.lang.String").implementation = function(url) {

        var file_path = 'file:///android_asset/www/scripts/index.js'; // path to file to load on webview
        this.loadUrl.overload("java.lang.String").call(this, file_path);

    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:108282083 @jackkongjr/load-from-asset-folder
