
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-591182043 @SahilH4ck4you/iosssl
// iOS Jailbreak Detection & SSL Pinning Bypass Script
if (ObjC.available) {
    try {
        // --- Jailbreak Detection Bypass ---
        const suspiciousPaths = [
            "/Applications/Cydia.app",
            "/Library/MobileSubstrate/MobileSubstrate.dylib",
            "/bin/bash",
            "/usr/sbin/sshd",
            "/etc/apt"
        ];

        // Hook stat()
        var stat = new NativeFunction(Module.findExportByName(null, "stat"), 'int', ['pointer', 'pointer']);
        Interceptor.replace(stat, new NativeCallback(function (pathPtr, statPtr) {
            var path = Memory.readUtf8String(pathPtr);
            for (var i = 0; i < suspiciousPaths.length; i++) {
                if (path.indexOf(suspiciousPaths[i]) !== -1) {
                    console.log("[+] stat() Jailbreak path detected and bypassed: " + path);
                    return -1;
                }
            }
            return stat(pathPtr, statPtr);
        }, 'int', ['pointer', 'pointer']));

        // Hook access()
        var access = new NativeFunction(Module.findExportByName(null, "access"), 'int', ['pointer', 'int']);
        Interceptor.replace(access, new NativeCallback(function (pathPtr, amode) {
            var path = Memory.readUtf8String(pathPtr);
            for (var i = 0; i < suspiciousPaths.length; i++) {
                if (path.indexOf(suspiciousPaths[i]) !== -1) {
                    console.log("[+] access() Jailbreak path detected and bypassed: " + path);
                    return -1;
                }
            }
            return access(pathPtr, amode);
        }, 'int', ['pointer', 'int']));

        // Hook fork()
        var forkPtr = Module.findExportByName(null, "fork");
        if (forkPtr) {
            Interceptor.replace(forkPtr, new NativeCallback(function () {
                console.log("[+] fork() called - returning error to bypass jailbreak detection");
                return -1;
            }, 'int', []));
        }

        console.log("[+] Jailbreak detection hooks applied successfully");

        // --- SSL Pinning Bypass ---
        var SecTrustEvaluate = Module.findExportByName("Security", "SecTrustEvaluate");
        if (SecTrustEvaluate) {
            Interceptor.attach(SecTrustEvaluate, {
                onLeave: function (retval) {
                    console.log("[+] SecTrustEvaluate bypassed");
                    retval.replace(0); // 0 == kSecTrustResultProceed
                }
            });
        }

        var SecTrustEvaluateWithError = Module.findExportByName("Security", "SecTrustEvaluateWithError");
        if (SecTrustEvaluateWithError) {
            Interceptor.attach(SecTrustEvaluateWithError, {
                onLeave: function (retval) {
                    console.log("[+] SecTrustEvaluateWithError bypassed");
                    retval.replace(1); // true == passed evaluation
                }
            });
        }

        console.log("[+] SSL Pinning hooks applied successfully");
    } catch (err) {
        console.log("[-] Exception: " + err.message);
    }
} else {
    console.log("[-] Objective-C Runtime is not available!");
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-591182043 @SahilH4ck4you/iosssl
