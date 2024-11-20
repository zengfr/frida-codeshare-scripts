
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-51152661 @interference-security/show-ios-app-owned-classes
//Credit: PassionFruit (https://github.com/chaitin/passionfruit/blob/master/agent/app/classdump.js)
//Twitter: https://twitter.com/xploresec
//GitHub: https://github.com/interference-security
function run_show_app_classes_only()
{
    console.log("[*] Started: Find App's Classes")
    var free = new NativeFunction(Module.findExportByName(null, 'free'), 'void', ['pointer'])
    var copyClassNamesForImage = new NativeFunction(Module.findExportByName(null, 'objc_copyClassNamesForImage'), 'pointer', ['pointer', 'pointer'])
    var p = Memory.alloc(Process.pointerSize)
    Memory.writeUInt(p, 0)
    var path = ObjC.classes.NSBundle.mainBundle().executablePath().UTF8String()
    var pPath = Memory.allocUtf8String(path)
    var pClasses = copyClassNamesForImage(pPath, p)
    var count = Memory.readUInt(p)
    var classesArray = new Array(count)
    for (var i = 0; i < count; i++)
    {
        var pClassName = Memory.readPointer(pClasses.add(i * Process.pointerSize))
        classesArray[i] = Memory.readUtf8String(pClassName)
        console.log(classesArray[i])
    }
    free(pClasses)
    console.log("\n[*] App Classes found: " + count);
    console.log("[*] Completed: Find App's Classes")
}

function show_app_classes_only()
{
    setImmediate(run_show_app_classes_only)
}

show_app_classes_only()
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-51152661 @interference-security/show-ios-app-owned-classes
