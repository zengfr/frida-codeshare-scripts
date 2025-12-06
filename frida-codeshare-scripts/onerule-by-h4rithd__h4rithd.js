
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1165616621 @h4rithd/onerule-by-h4rithd
/*
    Frida Script for Android Application Instrumentation
    ------------ One Rule to Rule Them All -------------

    Description:
    This script dynamically instruments Android applications using Frida to bypass security checks,
    root detection, debugger detection, and alter network information.

    Functionalities:
    1. Bypasses security checks by returning fake values for settings providers.
    2. Masks root detection mechanisms in PackageManager and file existence checks.
    3. Prevents debugger detection by always returning false.
    4. Masks system properties related to root detection.
    5. Filters command execution to bypass root detection or return fake results.
    6. Modifies file read operations to replace test-keys with release-keys.
    7. Intercepts native functions like fopen and system to bypass root checks.
    8. Alters network information retrieval to simulate a connected LTE mobile network.
    9. Overrides network capabilities check to always indicate availability of mobile network.
    10. Bypass all ssl certificate
    11. Add JailMonky all checks bypass

    Usage:
    frida -U --codeshare h4rithd/onerule-by-h4rithd -f YOUR_BINARY

    Author: Harith Dilshan | h4rithd.com
    Date: 22-March-2024
*/

// Root detection paths
const commonPaths = [
"/data/local/bin/su", "/data/local/su", "/data/local/xbin/su",
"/dev/com.koushikdutta.superuser.daemon/", "/sbin/su",
"/system/app/Superuser.apk", "/system/bin/failsafe/su", "/system/bin/su",
"/su/bin/su", "/system/etc/init.d/99SuperSUDaemon", "/system/sd/xbin/su",
"/system/xbin/busybox", "/system/xbin/daemonsu", "/system/xbin/su",
"/system/sbin/su", "/vendor/bin/su", "/cache/su", "/data/su", "/dev/su",
"/system/bin/.ext/su", "/system/usr/we-need-root/su",
"/system/app/Kinguser.apk", "/data/adb/magisk", "/sbin/.magisk",
"/cache/.disable_magisk", "/dev/.magisk.unblock", "/cache/magisk.log",
"/data/adb/magisk.img", "/data/adb/magisk.db", "/data/adb/magisk_simple",
"/init.magisk.rc", "/system/xbin/ku.sud", "/data/adb/ksu", "/data/adb/ksud"
];

const RootPackages = [
"com.noshufou.android.su", "com.noshufou.android.su.elite",
"eu.chainfire.supersu", "com.koushikdutta.superuser",
"com.thirdparty.superuser", "com.yellowes.su", "com.koushikdutta.rommanager",
"com.koushikdutta.rommanager.license", "com.dimonvideo.luckypatcher",
"com.chelpus.lackypatch", "com.ramdroid.appquarantine",
"com.ramdroid.appquarantinepro", "com.devadvance.rootcloak",
"com.devadvance.rootcloakplus", "de.robv.android.xposed.installer",
"com.saurik.substrate", "com.zachspong.temprootremovejb",
"com.amphoras.hidemyroot", "com.amphoras.hidemyrootadfree",
"com.formyhm.hiderootPremium", "com.formyhm.hideroot", "me.phh.superuser",
"eu.chainfire.supersu.pro", "com.kingouser.com", "com.topjohnwu.magisk",
"me.weishu.kernelsu"
];

const RootBinaries = [
"su", "busybox", "supersu", "Superuser.apk", "KingoUser.apk",
"SuperSu.apk", "magisk"
];

const RootProperties = {
"ro.build.selinux": "1",
"ro.debuggable": "0",
"service.adb.root": "0",
"ro.secure": "1"
};

const androidSettings = ['adb_enabled'];

// Flutter SSL pinning config
const config = {
"ios": {
"modulename": "Flutter",
"patterns": {
"arm64": [
"FF 83 01 D1 FA 67 01 A9 F8 5F 02 A9 F6 57 03 A9 F4 4F 04 A9 FD 7B 05 A9 FD 43 01 91 F? 03 00 AA ?? 0? 40 F9 ?8 1? 40 F9 15 ?? 4? F9 B5 00 00 B4",
"FF 43 01 D1 F8 5F 01 A9 F6 57 02 A9 F4 4F 03 A9 FD 7B 04 A9 FD 03 01 91 F3 03 00 AA 14 00 40 F9 88 1A 40 F9 15 E9 40 F9 B5 00 00 B4 B6 46 40 F9"
]
}
},
"android": {
"modulename": "libflutter.so",
"patterns": {
"arm64": [
"F? 0F 1C F8 F? 5? 01 A9 F? 5? 02 A9 F? ?? 03 A9 ?? ?? ?? ?? 68 1A 40 F9",
"F? 43 01 D1 FE 67 01 A9 F8 5F 02 A9 F6 57 03 A9 F4 4F 04 A9 13 00 40 F9 F4 03 00 AA 68 1A 40 F9",
"FF 43 01 D1 FE 67 01 A9 ?? ?? 06 94 ?? 7? 06 94 68 1A 40 F9 15 15 41 F9 B5 00 00 B4 B6 4A 40 F9"
],
"arm": ["2D E9 F? 4? D0 F8 00 80 81 46 D8 F8 18 00 D0 F8 ??"],
"x64": [
"55 41 57 41 56 41 55 41 54 53 50 49 89 f? 4c 8b 37 49 8b 46 30 4c 8b a? ?? 0? 00 00 4d 85 e? 74 1? 4d 8b",
"55 41 57 41 56 41 55 41 54 53 48 83 EC 18 49 89 FF 48 8B 1F 48 8B 43 30 4C 8B A0 28 02 00 00 4D 85 E4 74",
"55 41 57 41 56 41 55 41 54 53 48 83 EC 38 C6 02 50 48 8B AF A? 00 00 00 48 85 ED 74 7? 48 83 7D 00 00 74"
]
}
}
};

Java.perform(function() {
var tries = 0;
var maxTries = 5;
var errDict = {};
var timeout = 1000;
var useKeyInfo = false;
var useProcessManager = false;
var TLSValidationDisabled = false;
var flutterLibraryFound = false;
var RootPropertiesKeys = Object.keys(RootProperties);
var loaded_classes = Java.enumerateLoadedClassesSync();

// Java classes
var Debug = Java.use('android.os.Debug');
var NativeFile = Java.use('java.io.File');
var String = Java.use('java.lang.String');
var Runtime = Java.use('java.lang.Runtime');
var BufferedReader = Java.use('java.io.BufferedReader');
var ProcessBuilder = Java.use('java.lang.ProcessBuilder');
var SystemProperties = Java.use('android.os.SystemProperties');
var settingSecure = Java.use('android.provider.Settings$Secure');
var settingGlobal = Java.use('android.provider.Settings$Global');
var PackageManager = Java.use("android.app.ApplicationPackageManager");
var classa = Java.use("android.net.ConnectivityManager");
var classb = Java.use("android.net.NetworkCapabilities");
var Build = Java.use("android.os.Build");
var sdkVersion = Java.use('android.os.Build$VERSION');
var UnixFileSystem = Java.use("java.io.UnixFileSystem");

// Runtime.exec overloads
var exec = Runtime.exec.overload('[Ljava.lang.String;');
var exec1 = Runtime.exec.overload('java.lang.String');
var exec2 = Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;');
var exec3 = Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;');
var exec4 = Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;', 'java.io.File');
var exec5 = Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;', 'java.io.File');

console.log("SDK Version: " + sdkVersion.SDK_INT.value);
console.log("Loaded " + loaded_classes.length + " classes!");

// ============= UTILITY FUNCTIONS =============
function logError(err, targetClass, targetFunc) {
console.log('Error intercepted:');
console.log('Target class:', targetClass);
console.log('Target function:', targetFunc);
console.log('Error:', err);
}

function bypassPinning(targetClass, targetFunc, returnType) {
try {
var clazz = Java.use(targetClass);
var func = clazz[targetFunc];
var overloads = func.overloads;
for (var i = 0; i < overloads.length; i++) {
overloads[i].implementation = function() {
console.log('Bypassing pinning for:', targetClass + '.' + targetFunc);
return (returnType === 'boolean') ? true : null;
};
}
} catch (err) {
errDict[err] = [targetClass, targetFunc];
}
}

function stackTraceHere(isLog) {
var Exception = Java.use("java.lang.Exception");
var Log = Java.use("android.util.Log");
var stackinfo = Log.getStackTraceString(Exception.$new());
if (isLog) {
console.log(stackinfo);
} else {
return stackinfo;
}
}

// ============= SETTINGS BYPASS =============
if (sdkVersion.SDK_INT.value <= 16) {
settingSecure.getInt.overload('android.content.ContentResolver', 'java.lang.String').implementation = function(cr, name) {
if (name == androidSettings[0]) {
console.log('[+] Secure.getInt(cr, name) Bypassed');
return 0;
}
return this.getInt(cr, name);
};
settingSecure.getInt.overload('android.content.ContentResolver', 'java.lang.String', 'int').implementation = function(cr, name, def) {
if (name == androidSettings[0]) {
console.log('[+] Secure.getInt(cr, name, def) Bypassed');
return 0;
}
return this.getInt(cr, name, def);
};
}

if (sdkVersion.SDK_INT.value >= 17) {
settingGlobal.getInt.overload('android.content.ContentResolver', 'java.lang.String').implementation = function(cr, name) {
if (name == androidSettings[0]) {
console.log('[+] Global.getInt(cr, name) Bypassed');
return 0;
}
return this.getInt(cr, name);
};
settingGlobal.getInt.overload('android.content.ContentResolver', 'java.lang.String', 'int').implementation = function(cr, name, def) {
if (name == androidSettings[0]) {
console.log('[+] Global.getInt(cr, name, def) Bypassed');
return 0;
}
return this.getInt(cr, name, def);
};
}

// ============= EMULATOR DETECTION BYPASS =============
Build.PRODUCT.value = "gracerltexx";
Build.MANUFACTURER.value = "samsung";
Build.BRAND.value = "samsung";
Build.DEVICE.value = "gracerlte";
Build.MODEL.value = "SM-N935F";
Build.HARDWARE.value = "samsungexynos8890";
Build.FINGERPRINT.value = "samsung/gracerltexx/gracerlte:8.0.0/R16NW/N935FXXS4BRK2:user/release-keys";

try {
var Activity = Java.use("com.learnium.RNDeviceInfo.RNDeviceModule");
Activity.isEmulator.implementation = function() {
return Promise.resolve(false);
};
} catch (error) {}

// ============= DEBUGGER DETECTION BYPASS =============
Debug.isDebuggerConnected.implementation = function() {
return false;
};

// ============= ROOT DETECTION BYPASS =============
PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
var shouldFakePackage = (RootPackages.indexOf(pname) > -1);
if (shouldFakePackage) {
console.log("Bypass root check for package: " + pname);
pname = "set.package.name.to.a.fake.one.so.we.can.bypass.it";
}
return this.getPackageInfo.overload('java.lang.String', 'int').call(this, pname, flags);
};

NativeFile.exists.implementation = function() {
var name = NativeFile.getName.call(this);
var shouldFakeReturn = (RootBinaries.indexOf(name) > -1);
if (shouldFakeReturn) {
console.log("Bypass return value for binary: " + name);
return false;
}
return this.exists.call(this);
};

UnixFileSystem.checkAccess.implementation = function(file, access) {
const filename = file.getAbsolutePath();
if (filename.indexOf("magisk") >= 0 || commonPaths.indexOf(filename) >= 0) {
console.log("Anti Root Detect - check file: " + filename);
return false;
}
return this.checkAccess(file, access);
};

// ============= COMMAND EXECUTION BYPASS =============
function shouldBypassCommand(cmd) {
return cmd.indexOf("getprop") != -1 || cmd == "mount" || 
       cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh";
}

function getFakeCommand(cmd) {
if (cmd == "su") {
return "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled";
}
return "grep";
}

exec1.implementation = function(cmd) {
if (shouldBypassCommand(cmd) || cmd == "su") {
console.log("Bypass " + cmd + " command");
return exec1.call(this, getFakeCommand(cmd));
}
return exec1.call(this, cmd);
};

exec2.implementation = function(cmd, env) {
if (shouldBypassCommand(cmd) || cmd == "su") {
console.log("Bypass " + cmd + " command");
return exec1.call(this, getFakeCommand(cmd));
}
return exec2.call(this, cmd, env);
};

exec3.implementation = function(cmdarr, envp) {
for (var i = 0; i < cmdarr.length; i++) {
var tmp_cmd = cmdarr[i];
if (shouldBypassCommand(tmp_cmd) || tmp_cmd == "su") {
console.log("Bypass " + cmdarr + " command");
return exec1.call(this, getFakeCommand(tmp_cmd));
}
}
return exec3.call(this, cmdarr, envp);
};

exec4.implementation = function(cmdarr, env, file) {
for (var i = 0; i < cmdarr.length; i++) {
var tmp_cmd = cmdarr[i];
if (shouldBypassCommand(tmp_cmd) || tmp_cmd == "su") {
console.log("Bypass " + cmdarr + " command");
return exec1.call(this, getFakeCommand(tmp_cmd));
}
}
return exec4.call(this, cmdarr, env, file);
};

exec5.implementation = function(cmd, env, dir) {
if (shouldBypassCommand(cmd) || cmd == "su") {
console.log("Bypass " + cmd + " command");
return exec1.call(this, getFakeCommand(cmd));
}
return exec5.call(this, cmd, env, dir);
};

exec.implementation = function(cmd) {
for (var i = 0; i < cmd.length; i++) {
var tmp_cmd = cmd[i];
if (shouldBypassCommand(tmp_cmd) || tmp_cmd == "su") {
console.log("Bypass " + cmd + " command");
return exec1.call(this, getFakeCommand(tmp_cmd));
}
}
return exec.call(this, cmd);
};

// ProcessBuilder bypass
ProcessBuilder.start.implementation = function() {
var cmd = this.command.call(this);
var shouldModifyCommand = false;
for (var i = 0; i < cmd.size(); i++) {
var tmp_cmd = cmd.get(i).toString();
if (shouldBypassCommand(tmp_cmd)) {
shouldModifyCommand = true;
}
}
if (shouldModifyCommand) {
console.log("Bypass ProcessBuilder " + cmd);
this.command.call(this, ["grep"]);
return this.start.call(this);
}
if (cmd.indexOf("su") != -1) {
console.log("Bypass ProcessBuilder " + cmd);
this.command.call(this, ["justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled"]);
return this.start.call(this);
}
return this.start.call(this);
};

// ============= SYSTEM PROPERTIES BYPASS =============
String.contains.implementation = function(name) {
if (name == "test-keys") {
console.log("Bypass test-keys check");
return false;
}
return this.contains.call(this, name);
};

var get = SystemProperties.get.overload('java.lang.String');
get.implementation = function(name) {
if (RootPropertiesKeys.indexOf(name) != -1) {
console.log("Bypass " + name);
return RootProperties[name];
}
return this.get.call(this, name);
};

BufferedReader.readLine.overload('boolean').implementation = function() {
var text = this.readLine.overload('boolean').call(this);
if (text !== null) {
var shouldFakeRead = (text.indexOf("ro.build.tags=test-keys") > -1);
if (shouldFakeRead) {
console.log("Bypass build.prop file read");
text = text.replace("ro.build.tags=test-keys", "ro.build.tags=release-keys");
}
}
return text;
};

// ============= NATIVE HOOKS =============
Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
onEnter: function(args) {
var path = Memory.readCString(args[0]);
this.inputPath = path;
var pathArray = path.split("/");
var executable = pathArray[pathArray.length - 1];
var shouldFakeReturn = (RootBinaries.indexOf(executable) > -1);
if (shouldFakeReturn || commonPaths.indexOf(path) >= 0) {
Memory.writeUtf8String(args[0], "/notexists");
console.log("Bypass native fopen: " + path);
}
},
onLeave: function(retval) {
if (retval.toInt32() != 0 && commonPaths.indexOf(this.inputPath) >= 0) {
console.log("Anti Root Detect - fopen: " + this.inputPath);
retval.replace(ptr(0x0));
}
}
});

Interceptor.attach(Module.findExportByName("libc.so", "system"), {
onEnter: function(args) {
var cmd = Memory.readCString(args[0]);
if (shouldBypassCommand(cmd)) {
console.log("Bypass native system: " + cmd);
Memory.writeUtf8String(args[0], "grep");
}
if (cmd == "su") {
console.log("Bypass native system: " + cmd);
Memory.writeUtf8String(args[0], "justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled");
}
},
onLeave: function(retval) {}
});

var access = Module.findExportByName("libc.so", "access");
if (access) {
Interceptor.attach(access, {
onEnter: function(args) {
this.inputPath = args[0].readUtf8String();
},
onLeave: function(retval) {
if (retval.toInt32() == 0 && commonPaths.indexOf(this.inputPath) >= 0) {
console.log("Anti Root Detect - access: " + this.inputPath);
retval.replace(ptr(-1));
}
}
});
}

var system_property_get = Module.findExportByName("libc.so", "__system_property_get");
if (system_property_get) {
Interceptor.attach(system_property_get, {
onEnter(args) {
this.key = args[0].readCString();
this.ret = args[1];
},
onLeave(ret) {
if (this.key == "ro.build.fingerprint") {
var tmp = "google/crosshatch/crosshatch:10/QQ3A.200805.001/6578210:user/release-keys";
var p = Memory.allocUtf8String(tmp);
Memory.copy(this.ret, p, tmp.length + 1);
}
}
});
}

var android_getCpuFamily = Module.findExportByName(null, "android_getCpuFamily");
if (android_getCpuFamily) {
Interceptor.attach(android_getCpuFamily, {
onLeave: function(retval) {
if ([2, 5].indexOf(retval) > -1) {
retval.replace(4);
}
}
});
}

// ============= NETWORK INFO BYPASS =============
var networkInfo = classa.getActiveNetworkInfo;
networkInfo.implementation = function(args) {
var networkInfo_class = Java.use("android.net.NetworkInfo");
var networkInfo2 = networkInfo_class.$new(0, 0, "MOBILE", "LTE");
var netDetailedState = Java.use("android.net.NetworkInfo$DetailedState");
networkInfo2.mIsAvailable.value = true;
networkInfo2.setDetailedState(netDetailedState.CONNECTED.value, null, null);
return networkInfo2;
};

var hasTransport = classb.hasTransport;
hasTransport.implementation = function(args) {
if (args == 0) {
return true;
}
return false;
};

// ============= SSL PINNING BYPASS =============
function bypassUnverifiedException() {
var UnverifiedCertError = Java.use('javax.net.ssl.SSLPeerUnverifiedException');
UnverifiedCertError.$init.implementation = function(reason) {
try {
var stackTrace = Java.use('java.lang.Thread').currentThread().getStackTrace();
var exceptionStackIndex = stackTrace.findIndex(stack =>
stack.getClassName() === "javax.net.ssl.SSLPeerUnverifiedException"
);
var callingFunctionStack = stackTrace[exceptionStackIndex + 1];
var className = callingFunctionStack.getClassName();
var methodName = callingFunctionStack.getMethodName();
var callingClass = Java.use(className);
var callingMethod = callingClass[methodName];
if (className == 'com.android.org.conscrypt.ActiveSession' || 
    className == 'com.google.android.gms.org.conscrypt.ActiveSession') {
throw 'Reason: skipped SSLPeerUnverifiedException bypass';
} else {
var retTypeName = callingMethod.returnType.type;
if (!(callingMethod.implementation)) {
callingMethod.implementation = function() {
return (retTypeName === 'boolean') ? true : null;
};
}
}
} catch (err2) {
if (!String(err2).includes('.overload') && !String(err2).includes('SSLPeerUnverifiedException')) {
console.error(err2);
}
}
return this.$init(reason);
};
}

function disableTLSValidation() {
if (TLSValidationDisabled) return;
tries++;
if (tries > maxTries) {
console.log('[!] Max attempts reached for Flutter SSL bypass');
return;
}

var platformConfig = config[Java.available ? "android" : "ios"];
var m = Process.findModuleByName(platformConfig["modulename"]);

if (m === null) {
setTimeout(disableTLSValidation, timeout);
return;
} else {
if (flutterLibraryFound == false) {
flutterLibraryFound = true;
tries = 1;
}
}

if (Process.arch in platformConfig["patterns"]) {
var ranges = Java.available ? 
Process.enumerateRanges({protection: 'r-x'}).filter(isFlutterRange) : 
m.enumerateRanges('r-x');
findAndPatch(ranges, platformConfig["patterns"][Process.arch], Java.available && Process.arch == "arm" ? 1 : 0);
}

if (!TLSValidationDisabled && tries < maxTries) {
setTimeout(disableTLSValidation, timeout);
}
}

function findAndPatch(ranges, patterns, thumb) {
ranges.forEach(range => {
patterns.forEach(pattern => {
var matches = Memory.scanSync(range.base, range.size, pattern);
matches.forEach(match => {
console.log('[+] ssl_verify_peer_cert found and patched');
TLSValidationDisabled = true;
hook_ssl_verify_peer_cert(match.address.add(thumb));
});
});
});
}

function isFlutterRange(range) {
var info = DebugSymbol.fromAddress(range.base);
return info.moduleName != null && info.moduleName.toLowerCase().includes("flutter");
}

function hook_ssl_verify_peer_cert(address) {
Interceptor.replace(address, new NativeCallback((pathPtr, flags) => {
return 0;
}, 'int', ['pointer', 'int']));
}

// Standard SSL pinning bypasses
bypassPinning('javax.net.ssl.X509TrustManager', 'checkClientTrusted');
bypassPinning('javax.net.ssl.X509TrustManager', 'checkServerTrusted');
bypassPinning('okhttp3.CertificatePinner', 'check', 'void');

disableTLSValidation();
bypassUnverifiedException();

console.log("=== Combined Security Bypass Script Loaded ===");
console.log("[+] Root detection bypass: Active");
console.log("[+] Emulator detection bypass: Active");
console.log("[+] Debugger detection bypass: Active");
console.log("[+] SSL pinning bypass: Active");
console.log("[+] Network info masking: Active");
console.log("==============================================");
});

// Additional SSL Pinning Comprehensive Bypass (Delayed)
setTimeout(function() {
Java.perform(function() {
console.log("---");
console.log("Loading comprehensive SSL unpinning...");

// SSLPeerUnverifiedException auto-patcher
try {
const UnverifiedCertError = Java.use("javax.net.ssl.SSLPeerUnverifiedException");
UnverifiedCertError.$init.implementation = function(str) {
console.log("  --> SSL verification failure detected, patching...");
try {
const stackTrace = Java.use("java.lang.Thread").currentThread().getStackTrace();
const exceptionStackIndex = stackTrace.findIndex(stack =>
stack.getClassName() === "javax.net.ssl.SSLPeerUnverifiedException"
);
const callingFunctionStack = stackTrace[exceptionStackIndex + 1];
const className = callingFunctionStack.getClassName();
const methodName = callingFunctionStack.getMethodName();
const callingClass = Java.use(className);
const callingMethod = callingClass[methodName];

if (callingMethod.implementation) return;

const returnTypeName = callingMethod.returnType.type;
callingMethod.implementation = function() {
console.log(`  --> Bypassing ${className}->${methodName}`);
return (returnTypeName === "void") ? undefined : null;
};
} catch (e) {}
return this.$init(str);
};
console.log("[+] SSLPeerUnverifiedException auto-patcher");
} catch (err) {
console.log("[ ] SSLPeerUnverifiedException auto-patcher");
}

// HttpsURLConnection
try {
const HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");
HttpsURLConnection.setDefaultHostnameVerifier.implementation = function(hostnameVerifier) {
console.log("  --> Bypassing HttpsURLConnection (setDefaultHostnameVerifier)");
return;
};
HttpsURLConnection.setSSLSocketFactory.implementation = function(SSLSocketFactory) {
console.log("  --> Bypassing HttpsURLConnection (setSSLSocketFactory)");
return;
};
HttpsURLConnection.setHostnameVerifier.implementation = function(hostnameVerifier) {
console.log("  --> Bypassing HttpsURLConnection (setHostnameVerifier)");
return;
};
console.log("[+] HttpsURLConnection");
} catch (err) {
console.log("[ ] HttpsURLConnection");
}

// SSLContext
try {
const X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
const SSLContext = Java.use("javax.net.ssl.SSLContext");
const TrustManager = Java.registerClass({
name: "dev.asd.test.TrustManager",
implements: [X509TrustManager],
methods: {
checkClientTrusted: function(chain, authType) {},
checkServerTrusted: function(chain, authType) {},
getAcceptedIssuers: function() { return []; }
}
});
const TrustManagers = [TrustManager.$new()];
const SSLContext_init = SSLContext.init.overload(
"[Ljavax.net.ssl.KeyManager;",
"[Ljavax.net.ssl.TrustManager;",
"java.security.SecureRandom"
);
SSLContext_init.implementation = function(keyManager, trustManager, secureRandom) {
console.log("  --> Bypassing SSLContext");
SSLContext_init.call(this, keyManager, TrustManagers, secureRandom);
};
console.log("[+] SSLContext");
} catch (err) {
console.log("[ ] SSLContext");
}

// TrustManagerImpl (Android > 7)
try {
const array_list = Java.use("java.util.ArrayList");
const TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
TrustManagerImpl.checkTrustedRecursive.implementation = function(a1, a2, a3, a4, a5, a6) {
console.log("  --> Bypassing TrustManagerImpl checkTrusted");
return array_list.$new();
};
TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
console.log("  --> Bypassing TrustManagerImpl verifyChain: " + host);
return untrustedChain;
};
console.log("[+] TrustManagerImpl");
} catch (err) {
console.log("[ ] TrustManagerImpl");
}

// OkHTTPv3
try {
const okhttp3_Activity = Java.use("okhttp3.CertificatePinner");
okhttp3_Activity.check.overload("java.lang.String", "java.util.List").implementation = function(a, b) {
console.log("  --> Bypassing OkHTTPv3 (list): " + a);
};
okhttp3_Activity.check.overload("java.lang.String", "java.security.cert.Certificate").implementation = function(a, b) {
console.log("  --> Bypassing OkHTTPv3 (cert): " + a);
};
okhttp3_Activity.check.overload("java.lang.String", "[Ljava.security.cert.Certificate;").implementation = function(a, b) {
console.log("  --> Bypassing OkHTTPv3 (cert array): " + a);
};
okhttp3_Activity["check$okhttp"].implementation = function(a, b) {
console.log("  --> Bypassing OkHTTPv3 ($okhttp): " + a);
};
console.log("[+] OkHTTPv3");
} catch (err) {
console.log("[ ] OkHTTPv3");
}

// Trustkit
try {
const trustkit_Activity = Java.use("com.datatheorem.android.trustkit.pinning.OkHostnameVerifier");
trustkit_Activity.verify.overload("java.lang.String", "javax.net.ssl.SSLSession").implementation = function(a, b) {
console.log("  --> Bypassing Trustkit OkHostnameVerifier(SSLSession): " + a);
return true;
};
trustkit_Activity.verify.overload("java.lang.String", "java.security.cert.X509Certificate").implementation = function(a, b) {
console.log("  --> Bypassing Trustkit OkHostnameVerifier(cert): " + a);
return true;
};
const trustkit_PinningTrustManager = Java.use("com.datatheorem.android.trustkit.pinning.PinningTrustManager");
trustkit_PinningTrustManager.checkServerTrusted.implementation = function() {
console.log("  --> Bypassing Trustkit PinningTrustManager");
};
console.log("[+] Trustkit");
} catch (err) {
console.log("[ ] Trustkit");
}

// Appcelerator Titanium
try {
const appcelerator_PinningTrustManager = Java.use("appcelerator.https.PinningTrustManager");
appcelerator_PinningTrustManager.checkServerTrusted.implementation = function() {
console.log("  --> Bypassing Appcelerator PinningTrustManager");
};
console.log("[+] Appcelerator PinningTrustManager");
} catch (err) {
console.log("[ ] Appcelerator PinningTrustManager");
}

// OpenSSLSocketImpl Conscrypt
try {
const OpenSSLSocketImpl = Java.use("com.android.org.conscrypt.OpenSSLSocketImpl");
OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certRefs, JavaObject, authMethod) {
console.log("  --> Bypassing OpenSSLSocketImpl Conscrypt");
};
console.log("[+] OpenSSLSocketImpl Conscrypt");
} catch (err) {
console.log("[ ] OpenSSLSocketImpl Conscrypt");
}

// OpenSSLEngineSocketImpl Conscrypt
try {
const OpenSSLEngineSocketImpl_Activity = Java.use("com.android.org.conscrypt.OpenSSLEngineSocketImpl");
OpenSSLEngineSocketImpl_Activity.verifyCertificateChain.overload("[Ljava.lang.Long;", "java.lang.String").implementation = function(a, b) {
console.log("  --> Bypassing OpenSSLEngineSocketImpl Conscrypt: " + b);
};
console.log("[+] OpenSSLEngineSocketImpl Conscrypt");
} catch (err) {
console.log("[ ] OpenSSLEngineSocketImpl Conscrypt");
}

// OpenSSLSocketImpl Apache Harmony
try {
const OpenSSLSocketImpl_Harmony = Java.use("org.apache.harmony.xnet.provider.jsse.OpenSSLSocketImpl");
OpenSSLSocketImpl_Harmony.verifyCertificateChain.implementation = function(asn1DerEncodedCertificateChain, authMethod) {
console.log("  --> Bypassing OpenSSLSocketImpl Apache Harmony");
};
console.log("[+] OpenSSLSocketImpl Apache Harmony");
} catch (err) {
console.log("[ ] OpenSSLSocketImpl Apache Harmony");
}

// PhoneGap sslCertificateChecker
try {
const phonegap_Activity = Java.use("nl.xservices.plugins.sslCertificateChecker");
phonegap_Activity.execute.overload("java.lang.String", "org.json.JSONArray", "org.apache.cordova.CallbackContext").implementation = function(a, b, c) {
console.log("  --> Bypassing PhoneGap sslCertificateChecker: " + a);
return true;
};
console.log("[+] PhoneGap sslCertificateChecker");
} catch (err) {
console.log("[ ] PhoneGap sslCertificateChecker");
}

// IBM MobileFirst
try {
const WLClient_Activity = Java.use("com.worklight.wlclient.api.WLClient");
WLClient_Activity.getInstance().pinTrustedCertificatePublicKey.overload("java.lang.String").implementation = function(cert) {
console.log("  --> Bypassing IBM MobileFirst pinTrustedCertificatePublicKey: " + cert);
};
WLClient_Activity.getInstance().pinTrustedCertificatePublicKey.overload("[Ljava.lang.String;").implementation = function(cert) {
console.log("  --> Bypassing IBM MobileFirst pinTrustedCertificatePublicKey (array): " + cert);
};
console.log("[+] IBM MobileFirst");
} catch (err) {
console.log("[ ] IBM MobileFirst");
}

// IBM WorkLight
try {
const worklight_Activity = Java.use("com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning");
worklight_Activity.verify.overload("java.lang.String", "javax.net.ssl.SSLSocket").implementation = function(a, b) {
console.log("  --> Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning");
};
worklight_Activity.verify.overload("java.lang.String", "java.security.cert.X509Certificate").implementation = function(a, b) {
console.log("  --> Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning");
};
worklight_Activity.verify.overload("java.lang.String", "javax.net.ssl.SSLSession").implementation = function(a, b) {
console.log("  --> Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning");
return true;
};
console.log("[+] IBM WorkLight");
} catch (err) {
console.log("[ ] IBM WorkLight");
}

// Conscrypt CertPinManager
try {
const conscrypt_CertPinManager_Activity = Java.use("com.android.org.conscrypt.CertPinManager");
conscrypt_CertPinManager_Activity.isChainValid.overload("java.lang.String", "java.util.List").implementation = function(a, b) {
console.log("  --> Bypassing Conscrypt CertPinManager: " + a);
return true;
};
console.log("[+] Conscrypt CertPinManager");
} catch (err) {
console.log("[ ] Conscrypt CertPinManager");
}

// CWAC-Netsecurity
try {
const cwac_CertPinManager_Activity = Java.use("com.commonsware.cwac.netsecurity.conscrypt.CertPinManager");
cwac_CertPinManager_Activity.isChainValid.overload("java.lang.String", "java.util.List").implementation = function(a, b) {
console.log("  --> Bypassing CWAC-Netsecurity CertPinManager: " + a);
return true;
};
console.log("[+] CWAC-Netsecurity CertPinManager");
} catch (err) {
console.log("[ ] CWAC-Netsecurity CertPinManager");
}

// Worklight Androidgap
try {
const androidgap_WLCertificatePinningPlugin_Activity = Java.use("com.worklight.androidgap.plugin.WLCertificatePinningPlugin");
androidgap_WLCertificatePinningPlugin_Activity.execute.overload("java.lang.String", "org.json.JSONArray", "org.apache.cordova.CallbackContext").implementation = function(a, b, c) {
console.log("  --> Bypassing Worklight Androidgap WLCertificatePinningPlugin: " + a);
return true;
};
console.log("[+] Worklight Androidgap WLCertificatePinningPlugin");
} catch (err) {
console.log("[ ] Worklight Androidgap WLCertificatePinningPlugin");
}

// Netty FingerprintTrustManagerFactory
try {
const netty_FingerprintTrustManagerFactory = Java.use("io.netty.handler.ssl.util.FingerprintTrustManagerFactory");
netty_FingerprintTrustManagerFactory.checkTrusted.implementation = function(type, chain) {
console.log("  --> Bypassing Netty FingerprintTrustManagerFactory");
};
console.log("[+] Netty FingerprintTrustManagerFactory");
} catch (err) {
console.log("[ ] Netty FingerprintTrustManagerFactory");
}

// Squareup CertificatePinner [OkHTTP<v3]
try {
const Squareup_CertificatePinner_Activity = Java.use("com.squareup.okhttp.CertificatePinner");
Squareup_CertificatePinner_Activity.check.overload("java.lang.String", "java.security.cert.Certificate").implementation = function(a, b) {
console.log("  --> Bypassing Squareup CertificatePinner: " + a);
};
Squareup_CertificatePinner_Activity.check.overload("java.lang.String", "java.util.List").implementation = function(a, b) {
console.log("  --> Bypassing Squareup CertificatePinner: " + a);
};
console.log("[+] Squareup CertificatePinner");
} catch (err) {
console.log("[ ] Squareup CertificatePinner");
}

// Squareup OkHostnameVerifier
try {
const Squareup_OkHostnameVerifier_Activity = Java.use("com.squareup.okhttp.internal.tls.OkHostnameVerifier");
Squareup_OkHostnameVerifier_Activity.verify.overload("java.lang.String", "java.security.cert.X509Certificate").implementation = function(a, b) {
console.log("  --> Bypassing Squareup OkHostnameVerifier: " + a);
return true;
};
Squareup_OkHostnameVerifier_Activity.verify.overload("java.lang.String", "javax.net.ssl.SSLSession").implementation = function(a, b) {
console.log("  --> Bypassing Squareup OkHostnameVerifier: " + a);
return true;
};
console.log("[+] Squareup OkHostnameVerifier");
} catch (err) {
console.log("[ ] Squareup OkHostnameVerifier");
}

// Android WebViewClient
try {
const AndroidWebViewClient_Activity = Java.use("android.webkit.WebViewClient");
AndroidWebViewClient_Activity.onReceivedSslError.overload("android.webkit.WebView", "android.webkit.SslErrorHandler", "android.net.http.SslError").implementation = function(obj1, obj2, obj3) {
console.log("  --> Bypassing Android WebViewClient (SslErrorHandler)");
obj2.proceed();
};
console.log("[+] Android WebViewClient");
} catch (err) {
console.log("[ ] Android WebViewClient");
}

// Apache Cordova WebViewClient
try {
const CordovaWebViewClient_Activity = Java.use("org.apache.cordova.CordovaWebViewClient");
CordovaWebViewClient_Activity.onReceivedSslError.overload("android.webkit.WebView", "android.webkit.SslErrorHandler", "android.net.http.SslError").implementation = function(obj1, obj2, obj3) {
console.log("  --> Bypassing Apache Cordova WebViewClient");
obj2.proceed();
};
console.log("[+] Apache Cordova WebViewClient");
} catch (err) {
console.log("[ ] Apache Cordova WebViewClient");
}

// Boye AbstractVerifier
try {
const boye_AbstractVerifier = Java.use("ch.boye.httpclientandroidlib.conn.ssl.AbstractVerifier");
boye_AbstractVerifier.verify.implementation = function(host, ssl) {
console.log("  --> Bypassing Boye AbstractVerifier: " + host);
};
console.log("[+] Boye AbstractVerifier");
} catch (err) {
console.log("[ ] Boye AbstractVerifier");
}

// Appmattus
try {
const appmatus_Activity = Java.use("com.appmattus.certificatetransparency.internal.verifier.CertificateTransparencyInterceptor");
appmatus_Activity["intercept"].implementation = function(a) {
console.log("  --> Bypassing Appmattus (Transparency)");
return a.proceed(a.request());
};
const CertificateTransparencyTrustManager = Java.use("com.appmattus.certificatetransparency.internal.verifier.CertificateTransparencyTrustManager");
CertificateTransparencyTrustManager["checkServerTrusted"].overload("[Ljava.security.cert.X509Certificate;", "java.lang.String").implementation = function(x509CertificateArr, str) {
console.log("  --> Bypassing Appmattus (CertificateTransparencyTrustManager)");
};
CertificateTransparencyTrustManager["checkServerTrusted"].overload("[Ljava.security.cert.X509Certificate;", "java.lang.String", "java.lang.String").implementation = function(x509CertificateArr, str, str2) {
console.log("  --> Bypassing Appmattus (CertificateTransparencyTrustManager)");
return Java.use("java.util.ArrayList").$new();
};
console.log("[+] Appmattus");
} catch (err) {
console.log("[ ] Appmattus");
}

console.log("Comprehensive SSL unpinning completed");
console.log("---");
});
}, 500);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1165616621 @h4rithd/onerule-by-h4rithd
