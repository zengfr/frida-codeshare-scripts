
//https://github.com/zengfr/frida-codeshare-scripts
//-265076880 @unexpectedBy/webviewinspect
/**
@author linkedin@isdebuggerpresent
*/

// Attach to the target process
const targetApp = "my.bank.demo";
const session = Device.attach(targetApp);

// Define the script to be injected
const script =
    `Interceptor.attach(Java.use("android.webkit.WebView").loadUrl.overload("java.lang.String").implementation, {
    onLeave: function(retval) {
        const WebViewClient = Java.use("android.webkit.WebViewClient");
        const webViewClient = WebViewClient.$new();

        webViewClient.onPageFinished.implementation = function(view, url) {
            const inputFields = view.$$('input[type="text"], input[type="password"], input[type="email"], input[type="tel"], textarea');
            inputFields.forEach(function(inputField) {
                console.log('Input field value:', inputField.value);
            });
        }
        view.setWebViewClient(webViewClient);
    }
});`

// Load and run the script
const scriptId = session.createScript(script);
session.enableDebugger();
scriptId.load();
//https://github.com/zengfr/frida-codeshare-scripts
//-265076880 @unexpectedBy/webviewinspect
