
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1404779212 @dvdface/trace-android-binder-call-from-binderproxy
// used to show which binder call did callers made instead of just showing binder transaction/reply in perfetto trace
Java.perform(() => {

    // used to add trace
    const Trace = Java.use('android.os.Trace');
    // used to get callstack
    const Thread = Java.use('java.lang.Thread');
    // used to hook binder call from binder proxy
    const BinderProxy = Java.use('android.os.BinderProxy');
    // hook transact of BinderProxy
    BinderProxy.transact.implementation = function(...args) {

        // get callstacks
        const stacktrace = Thread.currentThread().getStackTrace();
        // the binder call is in the 4th line
        const callingStack = stacktrace[3];
        // begin trace
        Trace.beginSection(callingStack.toString());
        // call
        var result = this.transact(...args);
        // end trace
        Trace.endSection();
        // return
        return result;

    };
})
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1404779212 @dvdface/trace-android-binder-call-from-binderproxy
