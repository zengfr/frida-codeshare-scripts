
//https://github.com/zengfr/frida-codeshare-scripts
//-1849470511 @leolashkevych/ios-enable-webinspector
/*
 * iOS Enable WebInspector
 * 
 * Enable WebView debugging for all iOS apps. Before running the script, enable Web Inspector in Safari settings
 * (see https://github.com/OWASP/owasp-mastg/blob/master/Document/0x06h-Testing-Platform-Interaction.md#safari-web-inspector).
 * Jailbreak required.
 * 
 * Usage: frida -U --codeshare leolashkevych/ios-enable-webinspector webinspectord
 */

// https://developer.apple.com/documentation/corefoundation/1521153-cfrelease
const CFRelease = new NativeFunction(Module.findExportByName(null, 'CFRelease'), 'void', ['pointer']);
const CFStringGetCStringPtr = new NativeFunction(Module.findExportByName(null, 'CFStringGetCStringPtr'),
    'pointer', ['pointer', 'uint32']);
const kCFStringEncodingUTF8 = 0x08000100;

// https://developer.apple.com/documentation/security/1393461-sectaskcopyvalueforentitlement?language=objc
const SecTaskCopyValueForEntitlement = Module.findExportByName(null, 'SecTaskCopyValueForEntitlement');

const entitlements = [
    'com.apple.security.get-task-allow',
    'com.apple.webinspector.allow',
    'com.apple.private.webinspector.allow-remote-inspection',
    'com.apple.private.webinspector.allow-carrier-remote-inspection'
];

Interceptor.attach(SecTaskCopyValueForEntitlement, {
    onEnter: function(args) {
        const pEntitlement = CFStringGetCStringPtr(args[1], kCFStringEncodingUTF8)
        const entitlement = Memory.readUtf8String(pEntitlement)
        if (entitlements.indexOf(entitlement) > -1) {
            this.shouldOverride = true
            this.entitlement = entitlement
        }
    },
    onLeave: function(retVal) {
        if (this.shouldOverride) {
            console.log('Overriding value for entitlement: ', this.entitlement)
            if (!retVal.isNull()) {
                console.log('Old value: ', retVal)
                CFRelease(retVal)
            }
            retVal.replace(ObjC.classes.NSNumber.numberWithBool_(1));
            console.log('New value: ', retVal)
        }
    }
});
//https://github.com/zengfr/frida-codeshare-scripts
//-1849470511 @leolashkevych/ios-enable-webinspector
