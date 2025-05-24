
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-352152994 @RadonCoding/frida-okhttp3-tls
// @RadonCoding
// 20/04/2025

Java.perform(function () {
  const OkHttpClient = Java.use("okhttp3.OkHttpClient");
  const originalNewCall = OkHttpClient.newCall.overload("okhttp3.Request");

  OkHttpClient.newCall.overload("okhttp3.Request").implementation = function (
    request
  ) {
    const url = request.url();

    console.log("[Intercepted] URL:", url.toString());

    const redirect = "https://tls.peet.ws/api/all";

    const builder = request.newBuilder();
    const redirected = builder.url(redirect).build();

    const call = originalNewCall.call(this, redirected);

    const response = call.execute();
    const body = response.body().string();

    console.log(`[Redirected] TLS Fingerprint for ${url.toString()}:`);
    console.log(body);

    return originalNewCall.call(this, request);
  };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-352152994 @RadonCoding/frida-okhttp3-tls
