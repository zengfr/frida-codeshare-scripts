
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1470177408 @Rablidad/ios-16-location-spoofing
// written in typescript
function spoofLocation(newLat: number, newLong: number) {
    function offsetLocation(lat: number, long: number) {
        var randLat = lat + (Math.random() - 0.5) * 0.01;
        var randLong = long + (Math.random() - 0.5) * 0.01;
        return {
            randLat,
            randLong
        };
    }

    var clLocation = ObjC.classes["CLLocation"]["- coordinate"];
    Interceptor.attach(clLocation.implementation, {
        onLeave: (curLocation) => {
            const {
                randLat,
                randLong
            } = offsetLocation(
                newLat,
                newLong
            );
            var newLocation = new ObjC.Object(curLocation)[
                "- initWithLatitude:longitude:"
            ](randLat, randLong);
            curLocation.replace(newLocation);
        },
    });
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1470177408 @Rablidad/ios-16-location-spoofing
