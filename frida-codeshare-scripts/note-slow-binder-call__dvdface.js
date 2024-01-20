
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:769119364 @dvdface/note-slow-binder-call
Java.perform(function() {

const strictmode = Java.use('android.os.StrictMode')
//【Note Slow Call】
// 1. ContextWrapper(cover IActivityManager 80% slow binder call)
const contextWrapper = Java.use("android.content.ContextWrapper")
// 1.1 sendBroadcast
contextWrapper.sendBroadcast.overload('android.content.Intent').implementation = function(intent) {

strictmode.noteSlowCall("sendBroadcast(Intent)")
return this.sendBroadcast(intent);
}

contextWrapper.sendBroadcast.overload('android.content.Intent', 'java.lang.String').implementation = function(intent, permission) {


strictmode.noteSlowCall("sendBroadcast(Intent, String)")
this.sendBroadcast(intent, permission)
}

contextWrapper.sendBroadcast.overload('android.content.Intent', 'java.lang.String', 'android.os.Bundle').implementation = function(intent, permission, bundle) {

strictmode.noteSlowCall("sendBroadcast(Intent, String, Bundle)")
return this.sendBroadcast(intent, permission, bundle)
}

// 1.2 registerReceiver
contextWrapper.registerReceiver.overload('android.content.BroadcastReceiver', 'android.content.IntentFilter', 'java.lang.String', 'android.os.Handler').implementation = function(recv, filter, permission, handler) {

strictmode.noteSlowCall("registerReceiver(BroadcastReceiver, IntentFilter, String, Handler)")
return this.registerReceiver(recv, filter, permission, handler)
}

contextWrapper.registerReceiver.overload('android.content.BroadcastReceiver', 'android.content.IntentFilter', 'java.lang.String', 'android.os.Handler', 'int').implementation = function(recv, filter, permission, handler, flags) {

strictmode.noteSlowCall("registerReceiver(BroadcastReceiver, IntentFilter, String, Handler, int)")
return this.registerReceiver(recv, filter, permission, handler, flags)
}

contextWrapper.registerReceiver.overload('android.content.BroadcastReceiver', 'android.content.IntentFilter', 'int').implementation = function(recv, filter, flags) {

strictmode.noteSlowCall("registerReceiver(BroadcastReceiver, IntentFilter, int)")
return this.registerReceiver(recv, filter, flags)
}

contextWrapper.registerReceiver.overload('android.content.BroadcastReceiver', 'android.content.IntentFilter').implementation = function(recv, filter) {

strictmode.noteSlowCall("registerReceiver(BroadcastReceiver, IntentFilter)")
return this.registerReceiver(recv, filter)
}

// 1.3 updateServiceGroup
contextWrapper.updateServiceGroup.overload('android.content.ServiceConnection', 'int', 'int').implementation = function(conn, group, importance) {

strictmode.noteSlowCall("updateServiceGroup(ServiceConnection, group, importance)")
return this.updateServiceGroup(conn, group, importance)
}

// 1.4 startService
contextWrapper.startService.overload('android.content.Intent').implementation = function(intent) {

strictmode.noteSlowCall("startService(Intent)")
return this.startService(intent)
}

// 1.5 bindService
contextWrapper.bindService.overload('android.content.Intent', 'android.content.ServiceConnection', 'int').implementation = function(service, conn, flags)  {

strictmode.noteSlowCall("bindService(Intent, ServiceConnection, int)")
return this.bindService(service, conn, flags)
}

contextWrapper.bindService.overload('android.content.Intent', 'android.content.ServiceConnection',  'android.content.Context$BindServiceFlags').implementation = function(service, conn, flags) {

strictmode.noteSlowCall("bindService(Intent, ServiceConnection, Context.BindServiceFlags)")
return this.bindService(service, conn, flags)
}

contextWrapper.bindService.overload('android.content.Intent', 'int', 'java.util.concurrent.Executor', 'android.content.ServiceConnection').implementation = function(intent, flags, executor, conn) {

strictmode.noteSlowCall("bindService(Intent, int, Executor, ServiceConnection)")
return this.bindService(intent, flags, executor, conn)
}

contextWrapper.bindService.overload('android.content.Intent', 'android.content.Context$BindServiceFlags', 'java.util.concurrent.Executor', 'android.content.ServiceConnection').implementation = function(intent, flags, executor, conn) {

strictmode.noteSlowCall("bindService(Intent, Context.BindServiceFlags, Executor, ServiceConnection)")
return this.bindService(intent, flags, executor, conn)
}

// 1.6 unbindService
contextWrapper.unbindService.overload('android.content.ServiceConnection').implementation = function(conn) {

strictmode.noteSlowCall("unbindService(ServiceConnection)")
return this.unbindService(conn)
}

// 2. PackageManager(cover IPackageManager 80% slow binder call)
const packageManager = Java.use("android.content.pm.PackageManager")

// 2.1 getApplicationInfo
packageManager.getApplicationInfo.overload('java.lang.String', 'int').implementation = function(name, flags) {

strictmode.noteSlowCall("getApplicationInfo(String, int)")
return this.getApplicationInfo(name, flags)
}

packageManager.getApplicationInfo.overload('java.lang.String', 'android.content.pm.PackageManager$ApplicationInfoFlags').implementation = function(name, flags) {

strictmode.noteSlowCall("getApplicationInfo(ApplicationInfoFlags, int)")
return this.getApplicationInfo(name, flags)
}

// 2.2 getPackageInfo
packageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(packageName, flags) {

strictmode.noteSlowCall("getPackageInfo(String, int)")
return this.getPackageInfo(packageName, flags)
}

packageManager.getPackageInfo.overload('java.lang.String', 'android.content.pm.PackageManager$PackageInfoFlags').implementation = function(packageName, flags) {

strictmode.noteSlowCall("getPackageInfo(String, PackageInfoFlags)")
return this.getPackageInfo(packageName, flags)
}

packageManager.getPackageInfo.overload('android.content.pm.VersionedPackage', 'android.content.pm.PackageManager$PackageInfoFlags').implementation = function(versionedPackage, flags) {

strictmode.noteSlowCall("getPackageInfo(VersionedPackage, PackageInfoFlags)")
return this.getPackageInfo(versionedPackage, flags)
}

packageManager.getPackageInfo.overload('android.content.pm.VersionedPackage', 'int').implementation = function(versionedPackage, flags) {

strictmode.noteSlowCall("getPackageInfo(VersionedPackage, int)")
return this.getPackageInfo(versionedPackage, flags)
}

// 2.3 getActivityInfo
packageManager.getActivityInfo.overload("android.content.ComponentName", "int").implementation = function(componentName, flags) {

strictmode.noteSlowCall("getActivityInfo(ComponentName, int)")
return this.getActivityInfo(componentName, flags)
}

packageManager.getActivityInfo.overload("android.content.ComponentName", "android.content.pm.PackageManager$ComponentInfoFlags").implementation = function(componentName, flags) {

strictmode.noteSlowCall("getActivityInfo(ComponentName, ComponentInfoFlags)")
return this.getActivityInfo(componentName, flags)
}

// 2.4 queryIntentActivities
packageManager.queryIntentActivities.overload('android.content.Intent', 'android.content.pm.PackageManager$ResolveInfoFlags').implementation = function(intent, flags) {

strictmode.noteSlowCall("queryIntentActivities(Intent, ResolveInfoFlags)")
return this.queryIntentActivities(intent, flags)
}

packageManager.queryIntentActivities.overload('android.content.Intent', 'int').implementation = function(intent, flags) {

strictmode.noteSlowCall("queryIntentActivities(Intent, int)")
return this.queryIntentActivities(intent, flags)
}

// 2.5 queryIntentServices
packageManager.queryIntentServices.overload('android.content.Intent', 'int').implementation = function(intent, flags) {

strictmode.noteSlowCall("queryIntentServices(Intent,  int)")
return this.queryIntentServices(intent, flags)
}

packageManager.queryIntentServices.overload('android.content.Intent', 'android.content.pm.PackageManager$ResolveInfoFlags').implementation = function(intent, flags) {

strictmode.noteSlowCall("queryIntentServices(Intent,  ResolveInfoFlags)")
return this.queryIntentServices(intent, flags)
}

// 3 android.net.ConnectivityManager
const connectivityManager = Java.use("android.net.ConnectivityManager")

// 3.1 getActiveNetworkInfo
connectivityManager.getActiveNetworkInfo.implementation = function() {

strictmode.noteSlowCall("getActiveNetworkInfo()")
return this.getActiveNetworkInfo()
}

// 3.2 getNetworkInfo
connectivityManager.getNetworkInfo.overload('int').implementation = function(networkType) {

strictmode.noteSlowCall("getNetworkInfo(int)")
return this.getNetworkInfo(networkType)
}

connectivityManager.getNetworkInfo.overload('android.net.Network').implementation = function(network) {

strictmode.noteSlowCall("getNetworkInfo(Network)")
return this.getNetworkInfo(network)
}

// 3.3 getNetworkCapabilities(Network network)
connectivityManager.getNetworkCapabilities.overload('android.net.Network').implementation = function(network) {

strictmode.noteSlowCall("getNetworkCapabilities(Network)")
return this.getNetworkCapabilities(network)
}

// 3.4 getActiveNetwork
connectivityManager.getActiveNetwork.implementation = function() {

strictmode.noteSlowCall("getActiveNetwork()")
return this.getActiveNetwork()
}

// 【enable StrictMode】
// Looper, Handler, Runnable to enable StrictMode on mainthread
const looperClz = Java.use('android.os.Looper')
const handlerClz = Java.use('android.os.Handler')
const runnableIntf = Java.use('java.lang.Runnable')

// StrictMode and related classes to turn on StrictMode
const tpBuilder = Java.use('android.os.StrictMode$ThreadPolicy$Builder')
const androidBlockGuardPolicy = Java.use('android.os.StrictMode$AndroidBlockGuardPolicy')

var mainLooper = looperClz.getMainLooper()
var handler = handlerClz.$new(mainLooper)

/* used to debug noteSlowCall, comment out
  
strictmode.noteSlowCall.implementation = function(name) {

this.noteSlowCall(name)
}

strictmode.tooManyViolationsThisLoop.implementation = function() {

var ret = this.tooManyViolationsThisLoop()

return ret
}

androidBlockGuardPolicy.onNoteSlowCall.implementation = function(name) {


return this.onNoteSlowCall()
}
*/

// register new Runnable class to enable StrictMode
// if "Error: java.io.IOException: Permission denied" happens, adb shell setenforce 0 to turn off selinux
var runnableClz = Java.registerClass({
        name: 'EnforceStrictModeRunnable',
        implements: [runnableIntf],
        methods: {
            run: function() {

// enable log and flash screen for thread policy

const tp = tpBuilder.$new().detectCustomSlowCalls().penaltyLog().penaltyFlashScreen().build()
strictmode.setThreadPolicy(tp)
            }
        }
    });
    
    // post runnable class to main looper to enable strictmode
handler.post(runnableClz.$new());
})
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:769119364 @dvdface/note-slow-binder-call
