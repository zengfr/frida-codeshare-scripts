
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1632332887 @sdcampbell/ios-list-apps
/* Lists all installed apps on iOS
   Example: 

ObjC.schedule(ObjC.mainQueue, function() {
    var workspace = ObjC.classes.LSApplicationWorkspace.defaultWorkspace();
    var apps = workspace.allApplications();
    var appEnumerator = apps.objectEnumerator();
    var app;
    while ((app = appEnumerator.nextObject()) !== null) {
        console.log(app.applicationIdentifier().toString() + ": " + app.localizedName().toString());
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1632332887 @sdcampbell/ios-list-apps
