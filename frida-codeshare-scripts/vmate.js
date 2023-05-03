
//https://github.com/zengfr/frida-codeshare-scripts
//686678543 @AnonymousVip/vmate
Java.perform(function() {
let DecorativePacket = Java.use("com.ushareit.core.algo.DecorativePacket");
DecorativePacket.b.overload('java.lang.String').implementation = function(ok){
    let ret = this.b(ok);
    console.log(ok);
    return ret;
};
});
//https://github.com/zengfr/frida-codeshare-scripts
//686678543 @AnonymousVip/vmate
