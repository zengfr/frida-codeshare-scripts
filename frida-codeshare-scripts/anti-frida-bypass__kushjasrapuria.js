
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-2091356319 @kushjasrapuria/anti-frida-bypass
// Github: https://github.com/kushjasrapuria

var fgetsPtr = Module.findExportByName("libc.so", "fgets");
var fgets = new NativeFunction(fgetsPtr, 'pointer', ['pointer', 'int', 'pointer']);

Interceptor.replace(fgetsPtr, new NativeCallback(function (buffer, size, fp) {        
  var retval = fgets(buffer, size, fp);
  var bufstr = Memory.readUtf8String(buffer);
  if (bufstr.indexOf("frida") > -1) {
    Memory.writeUtf8String(buffer, "ByeByeFrida:\t0");
  }
  if (bufstr.indexOf("xposed") > -1) {
    Memory.writeUtf8String(buffer, "ByeByeXposed:\t0");
  }
  return retval;
}, 'pointer', ['pointer', 'int', 'pointer']));
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-2091356319 @kushjasrapuria/anti-frida-bypass
