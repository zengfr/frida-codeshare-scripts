
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-324489281 @karim-moftah/ios-walk-spoofer
if (ObjC.available) {
    try {
        var CLLocation = ObjC.classes.CLLocation;
        var CLLocationManager = ObjC.classes.CLLocationManager;
        var NSArray = ObjC.classes.NSArray;

        // === Configuration (English variable names) ===
        var centerLatitude = 46.211275;           // center latitude (must be between -90 and 90)
        var centerLongitude = 4.368013;        // center longitude (must be between -180 and 180)
        var maxRadiusMeters = 50;              // max radius in meters (1 km)
        var updateIntervalMs = 1000;             // update interval in milliseconds
        var walkSpeedMetersPerSecond = 10.4;      // walking speed in meters/second
        var allowVerticalMovement = true;       // keep altitude constant unless true

        // sanity check
        function sendError(msg) {
            send("Fake-GPS ERROR: " + msg);
        }
        if (typeof centerLatitude !== 'number' || centerLatitude < -90 || centerLatitude > 90) {
            sendError("centerLatitude invalid. Must be between -90 and 90.");
            throw new Error("Invalid centerLatitude");
        }
        if (typeof centerLongitude !== 'number' || centerLongitude < -180 || centerLongitude > 180) {
            sendError("centerLongitude invalid. Must be between -180 and 180.");
            throw new Error("Invalid centerLongitude");
        }

        // internal state
        var intervals = new WeakMap(); // manager ObjC.Object -> interval id
        var currentPosition = { lat: centerLatitude, lon: centerLongitude }; // start at the center

        // Earth radius (meters)
        var earthRadiusMeters = 6371000.0;

        // utility: degrees <-> radians
        function deg2rad(deg) { return deg * Math.PI / 180.0; }
        function rad2deg(rad) { return rad * 180.0 / Math.PI; }

        // haversine distance (meters)
        function distanceMeters(lat1, lon1, lat2, lon2) {
            var phi1 = deg2rad(lat1);
            var phi2 = deg2rad(lat2);
            var dPhi = deg2rad(lat2 - lat1);
            var dLambda = deg2rad(lon2 - lon1);

            var a = Math.sin(dPhi/2) * Math.sin(dPhi/2) +
                    Math.cos(phi1) * Math.cos(phi2) *
                    Math.sin(dLambda/2) * Math.sin(dLambda/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return earthRadiusMeters * c;
        }

        // destination point given start lat/lon, bearing (radians) and distance (meters)
        // returns {lat, lon}
        function destinationPoint(lat, lon, bearingRad, distanceM) {
            var phi1 = deg2rad(lat);
            var lambda1 = deg2rad(lon);
            var delta = distanceM / earthRadiusMeters; // angular distance in radians
            var theta = bearingRad;

            var sinPhi2 = Math.sin(phi1) * Math.cos(delta) + Math.cos(phi1) * Math.sin(delta) * Math.cos(theta);
            var phi2 = Math.asin(Math.max(-1, Math.min(1, sinPhi2))); // clamp for safety
            var y = Math.sin(theta) * Math.sin(delta) * Math.cos(phi1);
            var x = Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2);
            var lambda2 = lambda1 + Math.atan2(y, x);

            return { lat: rad2deg(phi2), lon: ((rad2deg(lambda2) + 540) % 360) - 180 }; // normalize lon to [-180,180]
        }

        // helper to create CLLocation (uses initWithLatitude:longitude:)
        function makeLocation(lat, lon) {
            try {
                return CLLocation.alloc().initWithLatitude_longitude_(lat, lon);
            } catch (e) {}
            try {
                return CLLocation.alloc().initWithLatitude_longitude_altitude_horizontalAccuracy_verticalAccuracy_course_speed_timestamp_(
                    lat, lon, 0, 5, 5, 0, 0, ObjC.classes.NSDate.date()
                );
            } catch (e) {}
            try {
                return CLLocation.alloc().init();
            } catch (e) {}
            return null;
        }

        // deliver fake location to delegate
        function deliverFakeLocation(manager, delegate, lat, lon) {
            try {
                var loc = makeLocation(lat, lon);
                if (!loc) return;
                var arr = NSArray.arrayWithObject_(loc);

                var sel = ObjC.selector("locationManager:didUpdateLocations:");
                if (delegate && delegate.respondsToSelector_ && delegate.respondsToSelector_(sel)) {
                    delegate["locationManager:didUpdateLocations:"](manager, arr);
                } else {
                    try { delegate.locationManager_didUpdateLocations_(manager, arr); } catch (e) {}
                }
            } catch (e) {
                send("Fake-GPS: delivery error: " + e);
            }
        }

        // compute next walking position: random small move; keep inside maxRadiusMeters
        function computeNextPosition() {
            // step distance: speed * time
            var stepMeters = walkSpeedMetersPerSecond * (updateIntervalMs / 1000.0);

            // randomize speed slightly (±30%)
            var randomFactor = 0.7 + Math.random() * 0.6; // between 0.7 and 1.3
            stepMeters = stepMeters * randomFactor;

            // random bearing
            var bearing = Math.random() * 2 * Math.PI;

            // candidate position after step
            var candidate = destinationPoint(currentPosition.lat, currentPosition.lon, bearing, stepMeters);

            // if inside allowed circle, accept
            var distToCenter = distanceMeters(centerLatitude, centerLongitude, candidate.lat, candidate.lon);
            if (distToCenter <= maxRadiusMeters) {
                currentPosition.lat = candidate.lat;
                currentPosition.lon = candidate.lon;
                return;
            }

            // otherwise, compute bearing from current position toward center and step toward center
            var phi1 = deg2rad(currentPosition.lat);
            var phi2 = deg2rad(centerLatitude);
            var dLambda = deg2rad(centerLongitude - currentPosition.lon);
            var y = Math.sin(dLambda) * Math.cos(phi2);
            var x = Math.cos(phi1)*Math.sin(phi2) - Math.sin(phi1)*Math.cos(phi2)*Math.cos(dLambda);
            var bearingToCenterFromCurrent = Math.atan2(y, x);

            var distanceCurrentToCenter = distanceMeters(currentPosition.lat, currentPosition.lon, centerLatitude, centerLongitude);
            var moveMeters = Math.min(stepMeters, Math.max(0.5, distanceCurrentToCenter)); // avoid overshoot; ensure small nonzero move
            var nextPos = destinationPoint(currentPosition.lat, currentPosition.lon, bearingToCenterFromCurrent, moveMeters);

            // If next position still outside (rare), clamp to the boundary along bearing from center to current
            if (distanceMeters(centerLatitude, centerLongitude, nextPos.lat, nextPos.lon) > maxRadiusMeters + 0.1) {
                var phiC = deg2rad(centerLatitude);
                var lambdaC = deg2rad(centerLongitude);
                var phiCur = deg2rad(currentPosition.lat);
                var lambdaCur = deg2rad(currentPosition.lon);
                var y2 = Math.sin(lambdaCur - lambdaC) * Math.cos(phiCur);
                var x2 = Math.cos(phiC)*Math.sin(phiCur) - Math.sin(phiC)*Math.cos(phiCur)*Math.cos(lambdaCur - lambdaC);
                var bearingCenterToCur = Math.atan2(y2, x2);
                var boundaryPoint = destinationPoint(centerLatitude, centerLongitude, bearingCenterToCur, maxRadiusMeters - 0.5);
                currentPosition.lat = boundaryPoint.lat;
                currentPosition.lon = boundaryPoint.lon;
            } else {
                currentPosition.lat = nextPos.lat;
                currentPosition.lon = nextPos.lon;
            }
        }

        // hook startUpdatingLocation
        var startImpl = CLLocationManager["- startUpdatingLocation"].implementation;
        Interceptor.replace(startImpl, new NativeCallback(function (selfPtr, _cmd) {
            try {
                var manager = new ObjC.Object(selfPtr);
                var delegate = null;
                try { delegate = manager.delegate ? manager.delegate() : null; } catch (e) {}

                if (!intervals.has(manager)) {
                    var id = setInterval(function () {
                        try {
                            computeNextPosition();
                            deliverFakeLocation(manager, delegate, currentPosition.lat, currentPosition.lon);
                        } catch (e) {
                            send("Fake-GPS tick error: " + e);
                        }
                    }, updateIntervalMs);
                    intervals.set(manager, id);
                    send("Fake-GPS: started walking simulator for manager " + manager.toString() +
                         " center=(" + centerLatitude + "," + centerLongitude + ") radius=" + maxRadiusMeters + "m");
                }
            } catch (e) {
                send("Fake-GPS: start hook error: " + e);
            }
            // call original startUpdatingLocation
            var orig = ObjC.classes.CLLocationManager["- startUpdatingLocation"];
            return orig.call(new ObjC.Object(selfPtr));
        }, 'pointer', ['pointer','pointer']));

        // hook stopUpdatingLocation to clear interval
        var stopImpl = CLLocationManager["- stopUpdatingLocation"].implementation;
        Interceptor.replace(stopImpl, new NativeCallback(function (selfPtr, _cmd) {
            try {
                var manager = new ObjC.Object(selfPtr);
                if (intervals.has(manager)) {
                    var id = intervals.get(manager);
                    clearInterval(id);
                    intervals.delete(manager);
                    send("Fake-GPS: stopped updates for manager " + manager.toString());
                }
            } catch (e) {
                send("Fake-GPS: stop hook error: " + e);
            }
            // call original stopUpdatingLocation
            var orig = ObjC.classes.CLLocationManager["- stopUpdatingLocation"];
            return orig.call(new ObjC.Object(selfPtr));
        }, 'pointer', ['pointer','pointer']));

        send("Fake-GPS walking script injected. Center=(" + centerLatitude + "," + centerLongitude + "), maxRadius=" + maxRadiusMeters + "m, updateInterval=" + updateIntervalMs + "ms.");
    } catch (err) {
        send("Fake-GPS: exception: " + err);
    }
} else {
    send("Objective-C runtime is not available!");
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-324489281 @karim-moftah/ios-walk-spoofer
