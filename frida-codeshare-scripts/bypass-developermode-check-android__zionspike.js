
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1476262186 @zionspike/bypass-developermode-check-android
function bypass_developerMode_check() {
    var settingSecure = Java.use('android.provider.Settings$Secure');
    settingSecure.getInt.overload('android.content.ContentResolver', 'java.lang.String', 'int').implementation = function(cr, name, flag) {
        console.log("[!] settingSecure.getInt(cr,name) : " + name);
        console.log('[+] 1.Secure.getInt(' + name + ') Bypassed');
        return 0;
    }
    settingSecure.getInt.overload('android.content.ContentResolver', 'java.lang.String').implementation = function(cr, name) {
        console.log("[!] settingSecure.getInt(cr,name) : " + name);
        console.log('[+] 2.Secure.getInt(' + name + ') Bypassed');
        return 0;
    }
    var settingGlobal = Java.use('android.provider.Settings$Global');
    settingGlobal.getInt.overload('android.content.ContentResolver', 'java.lang.String', 'int').implementation = function(cr, name, flag) {
        console.log("[!] settingGlobal.getInt(cr,name) : " + name);
        console.log('[+] 1.Global.getInt(' + name + ') Bypassed');
        return 0;
    }
    settingGlobal.getInt.overload('android.content.ContentResolver', 'java.lang.String').implementation = function(cr, name) {
        console.log("[!] settingGlobal.getInt(cr,name) : " + name);
        console.log('[+] 2.Global.getInt(' + name + ') Bypassed');
        return 0;
    }
}

// Main
Java.perform(function() {
    bypass_developerMode_check();
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1476262186 @zionspike/bypass-developermode-check-android
