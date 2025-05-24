
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:2049686460 @RadonCoding/frida-okhttp3-intercept
// @RadonCoding
// 20/04/2025

Java.perform(function () {
  Java.use("okhttp3.OkHttpClient");
  const RequestBody = Java.use("okhttp3.RequestBody");
  const Charset = Java.use("java.nio.charset.Charset");

  const ByteArrayInputStream = Java.use("java.io.ByteArrayInputStream");
  const GZIPInputStream = Java.use("java.util.zip.GZIPInputStream");
  const InputStreamReader = Java.use("java.io.InputStreamReader");
  const BufferedReader = Java.use("java.io.BufferedReader");
  const StringBuilder = Java.use("java.lang.StringBuilder");

  const String = Java.use("java.lang.String");

  function gunzip(bytes) {
    const byteArrayInputStream = ByteArrayInputStream.$new(bytes);
    const gzipInputStream = GZIPInputStream.$new(byteArrayInputStream);
    const reader = BufferedReader.$new(
      InputStreamReader.$new(gzipInputStream, Charset.forName("UTF-8"))
    );

    const sb = StringBuilder.$new();

    let line;

    while ((line = reader.readLine()) !== null) {
      sb.append(line);
    }
    return sb.toString();
  }

  let Buffer;

  const RequestBodyMethods = RequestBody.class.getDeclaredMethods();

  let BufferedSink = null;

  for (let i = 0; i < RequestBodyMethods.length; i++) {
    const method = RequestBodyMethods[i];

    if (method.getName() === "writeTo") {
      const paramTypes = method.getParameterTypes();

      if (paramTypes.length === 1) {
        BufferedSink = paramTypes[0].getName();
        break;
      }
    }
  }

  if (!BufferedSink) {
    console.error("[!] Could not find obfuscated name for okio.BufferedSink.");
    return;
  }

  console.log(
    `[+] Found obfuscated name for okio.BufferedSink: ${BufferedSink}`
  );

  Java.enumerateLoadedClasses({
    onMatch: function (className) {
      if (Buffer) return;

      if (!className.startsWith("okio.")) return;

      const clazz = Java.use(className);

      const interfaces = clazz.class.getInterfaces();

      for (let i = 0; i < interfaces.length; i++) {
        if (interfaces[i].getName() === BufferedSink) {
          Buffer = clazz;
          break;
        }
      }
    },
    onComplete: function () {},
  });

  if (!Buffer) {
    console.error("[!] Could not find okio.Buffer.");
    return;
  }

  console.log(`[+] Found okio.Buffer: ${Buffer}`);

  const BufferMethods = Buffer.class.getDeclaredMethods();

  let readByteArray;

  for (let i = 0; i < BufferMethods.length; i++) {
    const method = BufferMethods[i];
    const paramTypes = method.getParameterTypes();
    const returnType = method.getReturnType();

    if (paramTypes.length === 0 && returnType.getName() === "[B") {
      readByteArray = method;
      break;
    }
  }

  if (!readByteArray) {
    console.error("[!] Could not find okio.Buffer::readByteArray.");
    return;
  }

  console.log(`[+] Found okio.Buffer::readByteArray: ${readByteArray}`);

  const RealCall = Java.use("okhttp3.internal.connection.RealCall");

  const originalExecute = RealCall.execute;

  RealCall.execute.implementation = function () {
    const response = originalExecute.call(this);

    try {
      const log = [];

      const request = response.request();

      const method = request.method();
      const url = request.url().toString();
      log.push(`[Intercepted] ${method} ${url}`);

      log.push("[Intercepted] Request Headers:");

      const requestHeaders = request.headers();

      for (let i = 0; i < requestHeaders.size(); i++) {
        log.push(`    ${requestHeaders.name(i)}: ${requestHeaders.value(i)}`);
      }

      const requestBody = request.body();

      if (requestBody) {
        log.push("[Intercepted] Request Body:");

        const buffer = Buffer.$new();
        requestBody.writeTo(buffer);

        const bytes = Java.array("byte", readByteArray.invoke(buffer, []));

        let body;

        const encoding = request.header("Content-Encoding");

        if (encoding === "gzip") {
          body = gunzip(bytes);
        } else {
          body = String.$new(bytes);
        }

        log.push(`    ${body}`);
      }

      console.log(log.join("\n"));
    } catch (err) {
      console.error("Error while intercepting:", err.toString(), err.stack);
    } finally {
      return response;
    }
  };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:2049686460 @RadonCoding/frida-okhttp3-intercept
