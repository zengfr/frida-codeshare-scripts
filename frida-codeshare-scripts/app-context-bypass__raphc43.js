
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1301238455 @raphc43/app-context-bypass
if (Java.available) {
    Java.perform(function() {
        Java.scheduleOnMainThread(function() {
            var WebView = Java.use("android.webkit.WebView");
            WebView.setWebContentsDebuggingEnabled(true);
            console.log(WebView);
            console.log("[+] WebView debug enabled successfully!");
        });
    });
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1301238455 @raphc43/app-context-bypass
