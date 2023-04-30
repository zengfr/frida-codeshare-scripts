function hookOverloads(className, func) {
  var clazz = Java.use(className);
  var overloads = clazz[func].overloads;
  for (var i in overloads) {
    if (overloads[i].hasOwnProperty('argumentTypes')) {
      var parameters = [];

      var curArgumentTypes = overloads[i].argumentTypes, args = [], argLog = '[';
      for (var j in curArgumentTypes) {
        var cName = curArgumentTypes[j].className;
        parameters.push(cName);
        argLog += "'(" + cName + ") ' + v" + j + ",";
        args.push('v' + j);
      }
      argLog += ']';

      var script = "var ret = this." + func + '(' + args.join(',') + ") || '';\n"
        + "console.log(JSON.stringify(" + argLog + "));\n"
        + "return ret;"

      args.push(script);
      clazz[func].overload.apply(this, parameters).implementation = Function.apply(null, args);
    }
  }
}

Java.perform(function() {
  hookOverloads('java.lang.StringBuilder', '$init');
})
//https://github.com/zengfr/frida-codeshare-scripts
//658473834 @vumail159951/string