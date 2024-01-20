
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1668390170 @xiaooojun/ios-change-location
/**
eg: changeLocation(30.616347, 103.992081)
*/
function changeLocation(newLat, newLong) {
    var clLocation = ObjC.classes["CLLocation"]["- coordinate"];
    Interceptor.attach(clLocation.implementation, {
        onLeave: (curLocation) => {
            var newLocation = new ObjC.Object(curLocation)[
                "- initWithLatitude:longitude:"
            ](newLat, newLong);
            curLocation.replace(newLocation);
        },
    });
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1668390170 @xiaooojun/ios-change-location
