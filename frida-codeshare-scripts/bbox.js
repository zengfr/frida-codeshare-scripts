Java.perform(function() {
let HelperJNI = Java.use("cn.tongdun.android.shell.common.HelperJNI");
HelperJNI.base64encode.implementation = function(bArr){
    let ret = this.base64encode(bArr);
    console.log(JSON.stringify(bArr));
    return ret;
}
});
//https://github.com/zengfr/frida-codeshare-scripts
//1856240326 @AnonymousVip/bbox