
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-961174881 @sdcampbell/list-ios-apps
/* Lists all installed apps on iOS
   Example: frida --codeshare sdcampbell/list-ios-apps -U -n SpringBoard
*/

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
//hash:-961174881 @sdcampbell/list-ios-apps
