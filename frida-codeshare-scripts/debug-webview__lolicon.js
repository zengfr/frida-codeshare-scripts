
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1700355088 @lolicon/debug-webview
Java.perform(() => {
    const WebView = Java.use('android.webkit.WebView')
    const Log = Java.use('android.util.Log')
    const Exception = Java.use('java.lang.Exception')

    WebView.setWebContentsDebuggingEnabled.implementation = function(
        ...args
    ) {
        const exception = Exception.$new(
            `WebView.setWebContentsDebuggingEnabled(${args})`
        )
        Log.e('natsuki', `setWebContentsDebuggingEnabled:${args}`, exception)

        console.log(
            `WebView.setWebContentsDebuggingEnabled: `,
            ...args,
            Log.getStackTraceString(exception)
        )

        return this.setWebContentsDebuggingEnabled(true)
    }

    Java.scheduleOnMainThread(() => {
        Log.e('natsuki', 'initialized to true')
        WebView.setWebContentsDebuggingEnabled(true)
    })
})
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1700355088 @lolicon/debug-webview
