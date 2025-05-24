
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:727159401 @J-jaeyoung/getchildpid
//[Usage] frida --codeshare J-jaeyoung/getchildpid [bash_pid]

var fork = Module.findExportByName(null, "fork")

Interceptor.attach(fork, {
    onEnter: function(args) {
        console.log("Start fork...")
    },
    onLeave: function(retval) {
        var pid = parseInt(retval.toString(16), 16)
        console.log("[child pid] ", pid)
        console.log("End fork...")
    }
})
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:727159401 @J-jaeyoung/getchildpid
