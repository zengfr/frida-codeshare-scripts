
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:560773458 @Hyupai/teste
Java.perform(function() {

    console.log('\n-----Log4j check by @Ch0pin-----------------\n');
    console.log('-----https://github.com/Ch0pin/log4JFrida---\n');

    try {
        var networkInterface = Java.use('java.net.NetworkInterface');
        var secureSettings = Java.use('android.provider.Settings$Secure');
        var contentResolver = Java.use('android.content.ContentResolver');
        var wifiInfo = Java.use('android.net.wifi.WifiInfo');
        var bluetoothAdapter = Java.use('android.bluetooth.BluetoothAdapter');
        var mediaDrm = Java.use('android.media.MediaDrm');
        var telephonyManager = Java.use('android.telephony.TelephonyManager');
        var build = Java.use('android.os.Build');
        var systemProperties = Java.use('android.os.SystemProperties');
        var buildProperties = Java.use('android.os.Build');

        // Valores diferentes para cada propriedade
        var payloads = {
            MODEL: "new_model",
            DEVICE: "new_device",
            BOARD: "new_board",
            PRODUCT: "new_product",
            HARDWARE: "new_hardware",
            FINGERPRINT: "new_fingerprint",
            MANUFACTURER: "new_manufacturer",
            BOOTLOADER: "new_bootloader",
            BRAND: "new_brand",
            HOST: "new_host",
            ID: "new_id",
            DISPLAY: "new_display",
            TAGS: "new_tags",
            SERIAL: "new_serial",
            TYPE: "new_type",
            USER: "new_user",
            UNKNOWN: "new_unknown"
        };

        // Função auxiliar para substituir valores e mostrar o original
        function replaceAndLog(property, newValue) {
            console.log(`[+] Substituindo ${property} de: ${buildProperties[property].value} para: ${newValue}`);
            buildProperties[property].value = newValue;
        }

        // Substituindo os valores
        Object.keys(payloads).forEach(function(key) {
            replaceAndLog(key, payloads[key]);
        });

        var payl0ad = "payload";

        console.log("Payload: " + payl0ad);

        systemProperties.get.overload('java.lang.String').implementation = function(key) {
            var originalValue = this.get(key);
            console.log('[+] Get system properties called using key: ' + key + ', original value: ' + originalValue + ', returning ' + payl0ad);
            return payl0ad;
        };

        build.getSerial.implementation = function() {
            var originalSerial = this.getSerial();
            console.log('[+] Application is fetching the OS serial, original value: ' + originalSerial + ', returning ' + payl0ad);
            return payl0ad;
        };

        telephonyManager.getLine1Number.overloads[0].implementation = function() {
            var originalNumber = this.getLine1Number();
            console.log('[+] Application is fetching the phone number, original value: ' + originalNumber + ', returning ' + payl0ad);
            return payl0ad;
        };

        telephonyManager.getSubscriberId.overload().implementation = function() {
            var originalImsi = this.getSubscriberId();
            console.log('[i] Application asks for device IMSI, original value: ' + originalImsi + ', returning: ' + payl0ad);
            return payl0ad;
        };

        telephonyManager.getSubscriberId.overload('int').implementation = function() {
            var originalImsi = this.getSubscriberId();
            console.log('[i] Application asks for device IMSI, original value: ' + originalImsi + ', returning: ' + payl0ad);
            return payl0ad;
        };

        telephonyManager.getDeviceId.overloads[0].implementation = function() {
            var originalImei = this.getDeviceId();
            console.log('[i] Application asks for device IMEI, original value: ' + originalImei + ', returning: ' + payl0ad);
            return payl0ad;
        };

        telephonyManager.getDeviceId.overloads[1].implementation = function(slot) {
            var originalImei = this.getDeviceId(slot);
            console.log('[i] Application asks for device IMEI, original value: ' + originalImei + ', returning: ' + payl0ad);
            return payl0ad;
        };

        telephonyManager.getImei.overloads[0].implementation = function() {
            var originalImei = this.getImei();
            console.log('[i] Application asks for device IMEI, original value: ' + originalImei + ', returning: ' + payl0ad);
            return payl0ad;
        };

        telephonyManager.getImei.overloads[1].implementation = function(slot) {
            var originalImei = this.getImei(slot);
            console.log('[i] Application asks for device IMEI, original value: ' + originalImei + ', returning: ' + payl0ad);
            return payl0ad;
        };

        telephonyManager.getSimOperator.overload().implementation = function() {
            var originalSimOperator = this.getSimOperator();
            console.log('[+] getSimOperator call detected, original value: ' + originalSimOperator + ', returning: ' + payl0ad);
            return payl0ad;
        };

        telephonyManager.getSimOperator.overload('int').implementation = function(sm) {
            var originalSimOperator = this.getSimOperator(sm);
            console.log('[+] getSimOperator call detected, original value: ' + originalSimOperator + ', returning: ' + payl0ad);
            return payl0ad;
        };

        bluetoothAdapter.getAddress.implementation = function() {
            var originalBtAddress = this.getAddress();
            console.log("[+] Cloaking BT Mac Address, original value: " + originalBtAddress + ', returning: ' + payl0ad);
            return payl0ad;
        };

        wifiInfo.getMacAddress.implementation = function() {
            var originalMacAddress = this.getMacAddress();
            console.log("[+] Cloaking wifi Mac Address, original value: " + originalMacAddress + ', returning: ' + payl0ad);
            return payl0ad;
        };

        wifiInfo.getSSID.implementation = function() {
            var originalSsid = this.getSSID();
            console.log("[+] Cloaking SSID, original value: " + originalSsid + ', returning: ' + payl0ad);
            return payl0ad;
        };

        wifiInfo.getBSSID.implementation = function() {
            var originalBssid = this.getBSSID();
            console.log("[+] Cloaking Router Mac Address, original value: " + originalBssid + ', returning: ' + payl0ad);
            return payl0ad;
        };

        contentResolver.query.overload('android.net.Uri', '[Ljava.lang.String;', 'android.os.Bundle', 'android.os.CancellationSignal').implementation = function(uri, str, bundle, sig) {
            if (uri == 'content://com.google.android.gsf.gservicesa') {
                console.log('[+] Cloaking Google Services Framework Identifier Query, returning null');
                return null;
            } else {
                var originalResult = this.query(uri, str, bundle, sig);
                console.log('[+] Original query result: ' + originalResult + ', returning modified value.');
                return payl0ad;
            }
        };

        contentResolver.query.overload('android.net.Uri', '[Ljava.lang.String;', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String').implementation = function(uri, astr, bstr, cstr, dstr) {
            if (uri == 'content://com.google.android.gsf.gservicesa') {
                console.log('[+] Cloaking Google Services Framework Identifier Query, returning null');
                return null;
            } else {
                var originalResult = this.query(uri, astr, bstr, cstr, dstr);
                console.log('[+] Original query result: ' + originalResult + ', returning modified value.');
                return payl0ad;
            }
        };

        contentResolver.query.overload('android.net.Uri', '[Ljava.lang.String;', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String', 'android.os.CancellationSignal').implementation = function(uri, astr, bstr, cstr, sig) {
            if (uri == 'content://com.google.android.gsf.gservicesa') {
                console.log('[+] Cloaking Google Services Framework Identifier Query, returning null');
                return null;
            } else {
                var originalResult = this.query(uri, astr, bstr, cstr, sig);
                console.log('[+] Original query result: ' + originalResult + ', returning modified value.');
                return payl0ad;
            }
        };

        secureSettings.getString.implementation = function(contentresolver, query) {
            var originalValue = this.getString(contentresolver, query);
            console.log('[+] Cloaking Android ID, original value: ' + originalValue + ', returning dummy value: ' + payl0ad);
            if (query == 'android_id')
                return payl0ad;
            else
                return originalValue;
        };
    } catch (error) {
        console.log(error);
    }

});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:560773458 @Hyupai/teste
