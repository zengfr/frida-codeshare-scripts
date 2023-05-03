
//https://github.com/zengfr/frida-codeshare-scripts
//-1299561551 @AnonymousVip/free
Java.perform(function() {
let BoxUtil = Java.use("cn.tongdun.android.shell.utils.BoxUtil");
BoxUtil.limitBox.implementation = function(jSONObject, i){
    let ret = this.limitBox(jSONObject, i);
    console.log(JSON.stringify(ret));
    return ret;
};
});
//https://github.com/zengfr/frida-codeshare-scripts
//-1299561551 @AnonymousVip/free
