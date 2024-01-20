
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1782110778 @lolicon/https-stalker
Java.perform(() => {
    const Log = Java.use('android.util.Log')
    const Exception = Java.use('java.lang.Exception')
    const String = Java.use('java.lang.String')

    function trace(...args) {
        console.log(...args)
    }
    const SSLOutputStream = Java.use(
        'com.android.org.conscrypt.ConscryptEngineSocket$SSLOutputStream'
    )

    SSLOutputStream.write.overload('[B', 'int', 'int').implementation = function(
        ...args
    ) {
        const [bytes, offset, len] = args
        const plain = String.$new(bytes, offset, len)
        Log.e('trace<---', plain, Exception.$new())
        trace('trace<---', plain)
        return this.write(...args)
    }

    const SSLInputStream = Java.use(
        'com.android.org.conscrypt.ConscryptEngineSocket$SSLInputStream'
    )
    SSLInputStream.read.overload('[B', 'int', 'int').implementation = function(
        ...args
    ) {
        const [bytes, offset, len] = args
        const plain = String.$new(bytes, offset, len)
        Log.e('trace--->', plain, Exception.$new())
        trace('trace--->', plain)
        return this.read(...args)
    }
})
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1782110778 @lolicon/https-stalker
