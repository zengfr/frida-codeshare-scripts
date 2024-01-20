
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-795527273 @Malfarion/11
function hook_okhttp3() {
    // 1. frida Hook java层的代码必须包裹在Java.perform中，Java.perform会将Hook Java相关API准备就绪。
    Java.perform(function () {


        // 2. 准备相应类库，用于后续调用，前两个库是Android自带类库，后三个是使用Okhttp网络库的情况下才有的类
        var ByteString = Java.use("com.android.okhttp.okio.ByteString");
        var Buffer = Java.use("com.android.okhttp.okio.Buffer");
        var Interceptor = Java.use("okhttp3.Interceptor");
        var ArrayList = Java.use("java.util.ArrayList");
        var OkHttpClient = Java.use("okhttp3.OkHttpClient");


        console.log("hook_okhttp3...");
    });
}


hook_okhttp3();
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-795527273 @Malfarion/11
