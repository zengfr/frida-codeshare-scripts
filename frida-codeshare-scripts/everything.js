
//https://github.com/zengfr/frida-codeshare-scripts
//-948163967 @snooze6/everything
// Are we debugging it?
var DEBUG = false;

function ios_pinning() {
// Get SecTrustEvaluate address
var SecTrustEvaluate_prt = Module.findExportByName("Security", "SecTrustEvaluate");
if (SecTrustEvaluate_prt == null) {
console.log("[!] Security!SecTrustEvaluate(...) not found!");
return;
}

// Create native function wrappers for SecTrustEvaluate
var SecTrustEvaluate = new NativeFunction(SecTrustEvaluate_prt, "int", ["pointer", "pointer"]);

// Hook SecTrustEvaluate
Interceptor.replace(SecTrustEvaluate_prt, new NativeCallback(function(trust, result) {
// Show "hit!" message if we are in debugging mode
if (DEBUG) console.log("[*] SecTrustEvaluate(...) hit!");
// Call original function
var osstatus = SecTrustEvaluate(trust, result);
// Change the result to kSecTrustResultProceed
Memory.writeU8(result, 1);
// Return errSecSuccess
return 0;
}, "int", ["pointer", "pointer"]));
// It's done!
console.log("[*] SecTrustEvaluate(...) hooked. SSL should be pinning disabled.");
}

function android_pinning(){
    Java.perform(function() {
        var array_list = Java.use("java.util.ArrayList");
        var ApiClient = Java.use('com.android.org.conscrypt.TrustManagerImpl');
    
        ApiClient.checkTrustedRecursive.implementation = function(a1, a2, a3, a4, a5, a6) {
            if (DEBUG) console.log('[*] Bypassing SSL Pinning');
            var k = array_list.$new();
            return k;
        }
    }, 0);
}

function ios_appInfo() {
    var output = {};
    output["Name"] = infoLookup("CFBundleName");
    output["Bundle ID"] = ObjC.classes.NSBundle.mainBundle().bundleIdentifier().toString();
    output["Version"] = infoLookup("CFBundleVersion");
    output["Bundle"] = ObjC.classes.NSBundle.mainBundle().bundlePath().toString();
    output["Data"] = ObjC.classes.NSProcessInfo.processInfo().environment().objectForKey_("HOME").toString();
    output["Binary"] = ObjC.classes.NSBundle.mainBundle().executablePath().toString();
    return output;
}

function android_appInfo(){
    var res;
    Java.performNow(function () {
        // https://developer.android.com/reference/android/os/Build.html
        const Build = Java.use('android.os.Build');
    
        const ActivityThread = Java.use('android.app.ActivityThread');
    
        var currentApplication = ActivityThread.currentApplication();
        var context = currentApplication.getApplicationContext();
    
        res = {
            application_name: context.getPackageName(),
            filesDirectory: context.getFilesDir().getAbsolutePath().toString(),
            cacheDirectory: context.getCacheDir().getAbsolutePath().toString(),
            externalCacheDirectory: context.getExternalCacheDir().getAbsolutePath().toString(),
            codeCacheDirectory: context.getCodeCacheDir().getAbsolutePath().toString(),
            obbDir: context.getObbDir().getAbsolutePath().toString(),
            packageCodePath: context.getPackageCodePath().toString()
        };
    })
    
    return res
}

function enumerateModules(){
    var modules = Process.enumerateModulesSync()
    for (var i=0; i < modules.length; i++){
        var m = modules[i];
        console.log('Module name: '+m.name+" - Path: "+m.path+" - Base Address: "+m.base.toString());
    }
}

function android_webview_loadURL(url){
    Java.perform(function(){
        var obj = [];
        Java.choose('android.webkit.WebView',{
            onMatch: function (instance) {
                console.log("Found instance: " + instance);
                console.log("URL: "+instance.getUrl());
            },
            onComplete: function () {
                console.log('Finished')
            }
        });
        return obj
    })
}

function meh(){
    Java.perform(function() {
        var Webview = Java.use("android.webkit.WebView")
        Webview.loadUrl.overload("java.lang.String").implementation = function(url) {
            console.log("[+]Loading URL from", url);
            this.loadUrl.overload("java.lang.String").call(this, url);
        }
    });
}

// Helpers
    function dictFromNSDictionary(nsDict) {
        var jsDict = {};
        var keys = nsDict.allKeys();
        var count = keys.count();
        for (var i = 0; i < count; i++) {
            var key = keys.objectAtIndex_(i);
            var value = nsDict.objectForKey_(key);
            jsDict[key.toString()] = value.toString();
        }
    
        return jsDict;
    }
    
    function arrayFromNSArray(nsArray) {
        var jsArray = [];
        var count = nsArray.count();
        for (var i = 0; i < count; i++) {
            jsArray[i] = nsArray.objectAtIndex_(i).toString();
        }
        return jsArray;
    }
    
    function infoDictionary() {
        if (ObjC.available && "NSBundle" in ObjC.classes) {
            var info = ObjC.classes.NSBundle.mainBundle().infoDictionary();
            return dictFromNSDictionary(info);
        }
        return null;
    }
    
    function infoLookup(key) {
        if (ObjC.available && "NSBundle" in ObjC.classes) {
            var info = ObjC.classes.NSBundle.mainBundle().infoDictionary();
            var value = info.objectForKey_(key);
            if (value === null) {
                return value;
            } else if (value.class().toString() === "__NSCFArray") {
                return arrayFromNSArray(value);
            } else if (value.class().toString() === "__NSCFDictionary") {
                return dictFromNSDictionary(value);
            } else {
                return value.toString();
            }
        }
        return null;
    }
    
    function print(o){
        return JSON.stringify(o, null, 2);
    }
//https://github.com/zengfr/frida-codeshare-scripts
//-948163967 @snooze6/everything
