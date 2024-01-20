
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-765431226 @komen205/hook-javascript-interfaces
Java.perform(function() {

    var webView = Java.use('android.webkit.WebView');
    var webSettings = Java.use('android.webkit.WebSettings');
    webSettings.setJavaScriptEnabled.implementation = function(allow) {
        console.log('[!] Java Script Enabled:' + allow);
        return this.setJavaScriptEnabled(allow);

    }
    webView.addJavascriptInterface.implementation = function(object, name) {
        console.log('[i] Javascript interface detected:' + object.$className + ' instatiated as: ' + name);
        this.addJavascriptInterface(object, name);
    }


    webView.evaluateJavascript.implementation = function(script, resultCallback) {
        console.log('WebView Client: ' + this.getWebViewClient());
        console.log('[i] evaluateJavascript called with the following script: ' + script);
        this.evaluateJavascript(script, resultCallback);
    }
    webView.removeJavascriptInterface.implementation = function(name) {
        console.log('The ' + name + ' Javascript interface removed');
        this.removeJavascriptInterface(name);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-765431226 @komen205/hook-javascript-interfaces
