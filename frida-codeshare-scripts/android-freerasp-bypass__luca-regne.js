
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1686920056 @luca-regne/android-freerasp-bypass
Java.perform(function() {
    var Intent = Java.use("android.content.Intent");
    Intent.getStringExtra.overload('java.lang.String').implementation = function(str) {
        let extra = this.getStringExtra(str);
        let action = this.getAction();
        if (action == "TALSEC_INFO") {
            console.log(`[+] Hooking getStringExtra("${str}") from ${action}`);
            console.log(`\t Bypassing ${extra} detection`);
            extra = "";
        }
        return extra;
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1686920056 @luca-regne/android-freerasp-bypass
