
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-627376771 @0tax00/ios-biometricbypass
if (ObjC.available && ObjC.classes.LAContext) {
    const LAContext = ObjC.classes.LAContext;

    function logBypass(tag, message) {
        const now = new Date().toISOString().replace('T', ' ').split('.')[0];
        console.log(`[${now}] [${tag}] ${message}`);
    }
    Interceptor.attach(
        LAContext['- evaluatePolicy:localizedReason:reply:'].implementation, {
            onEnter: function(args) {
                const reason = new ObjC.Object(args[3]);
                const reply = new ObjC.Block(args[4]);

                logBypass("evaluatePolicy", "Call intercepted");
                logBypass("evaluatePolicy", `Presented reason: ${reason.toString()}`);

                setImmediate(function() {
                    try {
                        reply.implementation(true, null);
                        logBypass("evaluatePolicy", "Bypass applied successfully (return: true)");
                    } catch (err) {
                        logBypass("evaluatePolicy", `Error forcing return: ${err.message}`);
                    }
                });
            }
        }
    );
    if (LAContext['- evaluateAccessControl:operation:localizedReason:reply:']) {
        Interceptor.attach(
            LAContext['- evaluateAccessControl:operation:localizedReason:reply:'].implementation, {
                onEnter: function(args) {
                    const reason = new ObjC.Object(args[4]);
                    const reply = new ObjC.Block(args[5]);

                    logBypass("evaluateAccessControl", "Call intercepted");
                    logBypass("evaluateAccessControl", `Presented reason: ${reason.toString()}`);

                    setImmediate(function() {
                        try {
                            reply.implementation(true, null);
                            logBypass("evaluateAccessControl", "Bypass applied successfully (return: true)");
                        } catch (err) {
                            logBypass("evaluateAccessControl", `Error forcing return: ${err.message}`);
                        }
                    });
                }
            }
        );
    }

} else {
    console.warn("[-] LAContext not available or ObjC not loaded.");
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-627376771 @0tax00/ios-biometricbypass
