
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1408939508 @xiaooojun/ios-list-apps
ObjC.schedule(ObjC.mainQueue, function() {
    var workspace = ObjC.classes.LSApplicationWorkspace.defaultWorkspace();
    var apps = workspace.allApplications();
    var appEnumerator = apps.objectEnumerator();
    var app;
    while ((app = appEnumerator.nextObject()) !== null) {
        console.log(app.localizedName().toString() + ": " + app.applicationIdentifier().toString());
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1408939508 @xiaooojun/ios-list-apps
