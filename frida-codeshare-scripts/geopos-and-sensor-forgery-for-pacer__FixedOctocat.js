
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1904477196 @FixedOctocat/geopos-and-sensor-forgery-for-pacer
//https://www.gpsvisualizer.com/draw/
//https://www.maps.ie/map-my-route/

Java.perform(function() {
    var Location = Java.use("android.location.Location");

    var lat_c = 0;
    var lat_flag = 0;
    var lng_c = 0;
    var lng_flag = 0;

    const lat = [];
    const lng = [];

    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    let r_steps = getRandomArbitrary(3987, 5782);
    d["e"].implementation = function() {
        let result = this["e"]();
        this.w.value = r_steps;
        return result;
    };

    Location.getLatitude.implementation = function() {
        lat_flag += 1;

        if (lat_flag == 40) {
            lat_flag = 1;
            lat_c = (lat_c + 1) % 32;
        }

        return lat[lat_c];
    }
    Location.getLongitude.implementation = function() {
        lng_flag += 1;

        if (lng_flag == 40) {
            lng_flag = 1;
            lng_c = (lng_c + 1) % 32;
        }

        return lng[lng_c];
    }
})
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1904477196 @FixedOctocat/geopos-and-sensor-forgery-for-pacer
