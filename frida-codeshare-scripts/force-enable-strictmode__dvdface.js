
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:254969739 @dvdface/force-enable-strictmode
Java.perform(function() {

// Looper, Handler, Runnable to enable StrictMode on mainthread
const looperClz = Java.use('android.os.Looper')
const handlerClz = Java.use('android.os.Handler')
const runnableIntf = Java.use('java.lang.Runnable')

// StrictMode and related classes to turn on StrictMode
const strictmode = Java.use('android.os.StrictMode')
const tpBuilder = Java.use('android.os.StrictMode$ThreadPolicy$Builder')
const vmpBuilder = Java.use('android.os.StrictMode$VmPolicy$Builder')

var mainLooper = looperClz.getMainLooper()
var handler = handlerClz.$new(mainLooper)

// register new Runnable class to enable StrictMode
// if "Error: java.io.IOException: Permission denied" happens, adb shell setenforce 0 to turn off selinux
var runnableClz = Java.registerClass({
        name: 'EnforceStrictModeRunnable',
        implements: [runnableIntf],
        methods: {
            run: function() {

const tp = tpBuilder.$new().detectAll().penaltyLog().penaltyFlashScreen().build()
const vmp = vmpBuilder.$new().detectAll().penaltyLog().build()
strictmode.setThreadPolicy(tp)
strictmode.setVmPolicy(vmp)
            }
        }
    });
    
    // post runnable class to main looper to enable strictmode
handler.post(runnableClz.$new());
})
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:254969739 @dvdface/force-enable-strictmode
