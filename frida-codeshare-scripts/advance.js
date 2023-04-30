Java.perform(function() {
    let cuf = Java.use("bc.cuf");
    cuf.a.overload('[B', '[B').implementation = function(bArr, bArr2) {
        let ret = this.a(bArr, bArr2);
        console.log("-" + JSON.stringify(bArr));
        console.log("+" + JSON.stringify(bArr2));
        console.log("=" + JSON.stringify(ret));
        return ret;
    };
    let cuk = Java.use("bc.cuk");
    cuk.a.overload('[B', 'java.lang.String').implementation = function(bArr, str) {
        let ret = this.a(bArr, str);
        console.log("--" + JSON.stringify(bArr));
        console.log("-+" + str);
        return ret;
    };
    let Utils = Java.use("com.ushareit.core.utils.Utils");
    Utils.a.overload('int').implementation = function(i) {
        let ret = this.a(i);
        console.log("-+-" + i);
        console.log("-+-+" + JSON.stringify(ret));
        return ret;
    };

    let cug = Java.use("bc.cug");
    cug.a.overload('[B').implementation = function(bArr) {
        let ret = this.a(bArr);
        console.log("+!!" + JSON.stringify(bArr));
        console.log("=!!" + JSON.stringify(ret));
        return ret;
    };
});
//https://github.com/zengfr/frida-codeshare-scripts
//-1752233496 @AnonymousVip/advance