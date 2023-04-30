Java.perform(function() {
    var Root = Java.use("de.cyberkatze.iroot.IRoot");
    var PluginResult = Java.use("org.apache.cordova.PluginResult")
    var Status = Java.use("org.apache.cordova.PluginResult$Status")

    Root.checkIsRooted.overload('org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(var1, var2) {
        var ok = Java.cast(Status.OK.value, Status)
        var res = PluginResult.$new(ok, false)
        return res
    };
    Root.checkIsRootedWithBusyBox.overload('org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(var1, var2) {
        var ok = Java.cast(Status.OK.value, Status)
        var res = PluginResult.$new(ok, false)
        return res
    };
    Root.checkIsRootedWithEmulator.overload('org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(var1, var2) {
        var ok = Java.cast(Status.OK.value, Status)
        var res = PluginResult.$new(ok, false)
        return res
    };
    Root.checkIsRootedWithBusyBoxWithEmulator.overload('org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(var1, var2) {
        var ok = Java.cast(Status.OK.value, Status)
        var res = PluginResult.$new(ok, false)
        return res
    };
});
//https://github.com/zengfr/frida-codeshare-scripts
//145281795 @JJK96/iroot-root-detection-bypass