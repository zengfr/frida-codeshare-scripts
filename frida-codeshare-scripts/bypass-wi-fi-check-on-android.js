function bypass_wifi_check() {
    var classx = Java.use("android.net.ConnectivityManager");
    var networkInfo = classx.getActiveNetworkInfo;
    networkInfo.implementation = function(args) {
        console.log('[!] Hook getActiveNetworkInfo()');
        var netInfo = networkInfo.call(this);
        // console.log('\t[!] netInfo1: ' + netInfo);
        // when use SIM
        // [!] returnVal:[type: MOBILE[LTE], state: CONNECTED/CONNECTED, reason: (unspecified), extra: internet, failover: false, available: true, roaming: false]
        // return  networkInfo.call(this);

        var networkInfo_class = Java.use("android.net.NetworkInfo");
        // var networkInfo2 = networkInfo2.$new(1, 0, "WIFI", "subWifi");
        var networkInfo2 = networkInfo_class.$new(0, 0, "MOBILE", "LTE");
        var netDetailedState = Java.use("android.net.NetworkInfo$DetailedState");
        networkInfo2.mIsAvailable.value = true;
        networkInfo2.setDetailedState(netDetailedState.CONNECTED.value, null, null);
        console.log('\t[!] return modified networkInfo');
        // console.log('\t[!] netInfo2: ' + networkInfo2);
        return networkInfo2;
    };

    var classx = Java.use("android.net.NetworkCapabilities");
    var hasTransport = classx.hasTransport;
    hasTransport.implementation = function(args) {
        console.log('[!] Hook NetworkCapabilities.hasTransport(i)');
        console.log("\t[!] Hook hasTransport(" + args + ")");
        var oldResult = hasTransport.call(this, args);
        console.log("\t[!] oldResult: " + oldResult);
        if (args == 0) {
            var newResult = true;
            console.log("\t[!] newResult: " + newResult);
            return newResult;
        } else {
            return false;
        }
        return false;
    };
}
//https://github.com/zengfr/frida-codeshare-scripts
//-1033556661 @zionspike/bypass-wi-fi-check-on-android