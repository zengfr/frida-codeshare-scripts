
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-7609723 @Hyupai/dumper2
Java.perform(function () {
    var PackageManager = Java.use('android.content.pm.PackageManager');
    console.log("Hookeando hasSystemFeature...");

    // Usando a sobrecarga correta: (java.lang.String)
    PackageManager.hasSystemFeature.overload('java.lang.String').implementation = function(feature) {
        console.log("Feature verificada: " + feature);
        return this.hasSystemFeature(feature);
    };

    // Se precisar hookear a segunda sobrecarga, use a assinatura (java.lang.String, int):
    PackageManager.hasSystemFeature.overload('java.lang.String', 'int').implementation = function(feature, version) {
        console.log("Feature verificada: " + feature + ", Versão: " + version);
        return this.hasSystemFeature(feature, version);
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-7609723 @Hyupai/dumper2
       build.PRODUCT.value = 'o1quew';
        build.HARDWARE.value = 'exynos2100';
        build.FINGERPRINT.value = 'samsung/o1quew/o1q:12/SP1A.210812.016/G991BXXU3AVH1:user/release-keys';
        build.MANUFACTURER.value = 'samsung';
        build.BOOTLOADER.value = 'G991BXXU3AVH1';
        build.BRAND.value = 'Samsung';
        build.HOST.value = '21DHBD44';
        build.ID.value = 'SP1A.210812.016';
        build.DISPLAY.value = 'G991BXXU3AVH1';
        build.TAGS.value = 'release-keys';
        build.SERIAL.value = 'JK57CB2';
        build.TYPE.value = 'user';
        build.USER.value = 'dpi';
        build.UNKNOWN.value = 'unknown';
        
        console.log('[+] buildProperties.MODEL.value = ' + build.MODEL.value);
        console.log('[+] buildProperties.DEVICE.value = ' + build.DEVICE.value);
        console.log('[+] buildProperties.BOARD.value = ' + build.BOARD.value);
        console.log('[+] buildProperties.PRODUCT.value = ' + build.PRODUCT.value);
        console.log('[+] buildProperties.HARDWARE.value = ' + build.HARDWARE.value);
        console.log('[+] buildProperties.FINGERPRINT.value = ' + build.FINGERPRINT.value);
        console.log('[+] buildProperties.MANUFACTURER.value = ' + build.MANUFACTURER.value);
        console.log('[+] buildProperties.BOOTLOADER.value = ' + build.BOOTLOADER.value);
        console.log('[+] buildProperties.BRAND.value = ' + build.BRAND.value);
        console.log('[+] buildProperties.HOST.value = ' + build.HOST.value);
        console.log('[+] buildProperties.ID.value = ' + build.ID.value);
        console.log('[+] buildProperties.DISPLAY.value = ' + build.DISPLAY.value);
        console.log('[+] buildProperties.TAGS.value = ' + build.TAGS.value);
        console.log('[+] buildProperties.SERIAL.value = ' + build.SERIAL.value);
        console.log('[+] buildProperties.TYPE.value = ' + build.TYPE.value);
        console.log('[+] buildProperties.USER.value = ' + build.USER.value);
        console.log('[+] buildProperties.UNKNOWN.value = ' + build.UNKNOWN.value);
        
        // Modificar retorno dos métodos
        build.getSerial.implementation = function() {
            console.log('[+] Build.getSerial() chamado');
            return build.SERIAL.value;
        };
        
        var SystemProperties = Java.use('android.os.SystemProperties');
        
        // Interceptar SystemProperties.get(String)
        SystemProperties.get.overload('java.lang.String').implementation = function(key) {
            console.log('[+] [Chamado] SystemProperties.get("'+ key +'")');
            switch (key) {
                case 'imei':
                    return imei;
                case 'android_id':
                    return android_id;
                case 'ro.product.firmware':
                    return 'G991BXXU3AVH1';
                case 'ro.product.platform':
                    return 'exynos2100';
                case 'ro.build.customer':
                    return 'Samsung';
                case 'ro.product.model':
                    return 'SM-G991B';
                case 'debug.second-display.pkg':
                    return 'com.samsung.android.app.home';
                default:
                    return this.get(key);
            }
        };
  
        var telephonyManager = Java.use('android.telephony.TelephonyManager');
        telephonyManager.getLine1Number.overloads[0].implementation = function() {
            console.log('[+] [Chamado] telephonyManager.getLine1Number();');
            return line1Number;
        };

        telephonyManager.getSubscriberId.overload().implementation = function() {
            console.log('[+] [Chamado] telephonyManager.getSubscriberId();');
            return subscriberId;
        };

        telephonyManager.getSubscriberId.overload('int').implementation = function(slotIndex) {
            console.log('[+] [Chamado] telephonyManager.getSubscriberId(' + slotIndex + ');');
            return subscriberId;
        };

        telephonyManager.getDeviceId.overloads[0].implementation = function() {
            console.log('[+] [Chamado] telephonyManager.getDeviceId();');
            return deviceId;
        };

        telephonyManager.getDeviceId.overloads[1].implementation = function(slotIndex) {
            console.log('[+] [Chamado] telephonyManager.getDeviceId(' + slotIndex + ');');
            return deviceId;
        };

        telephonyManager.getImei.overloads[0].implementation = function() {
            console.log('[+] [Chamado] telephonyManager.getImei();');
            return imei;
        };

        telephonyManager.getImei.overloads[1].implementation = function(slotIndex) {
            console.log('[+] [Chamado] telephonyManager.getImei(' + slotIndex + ');');
            return imei;
        };

        telephonyManager.getSimOperator.overload().implementation = function() {
            console.log('[+] [Chamado] telephonyManager.getSimOperator();');
            return simOperator;
        };

        telephonyManager.getSimOperator.overload('int').implementation = function(slotIndex) {
            console.log('[+] [Chamado] telephonyManager.getSimOperator(' + slotIndex + ');');
            return simOperator;
        };

        var bluetoothAdapter = Java.use('android.bluetooth.BluetoothAdapter');
        bluetoothAdapter.getAddress.implementation = function() {
            console.log('[+] [Chamado] bluetoothAdapter.getAddress();');
            return macAddress;
        };

        var wifiInfo = Java.use('android.net.wifi.WifiInfo');
        wifiInfo.getMacAddress.implementation = function() {
            console.log('[+] [Chamado] wifiInfo.getMacAddress();');
            return macAddress;
        };
        
        
        wifiInfo.getSSID.implementation = function() {
            console.log('[+] [Chamado] wifiInfo.getSSID();');
            return ssid;
        };

        wifiInfo.getBSSID.implementation = function() {
            console.log('[+] [Chamado] wifiInfo.getBSSID();');
            return bssid;
        };

    
        var contentResolver = Java.use('android.content.ContentResolver');
        contentResolver.query.overload('android.net.Uri', '[Ljava.lang.String;', 'android.os.Bundle', 'android.os.CancellationSignal').implementation = function(uri, str, bundle, sig) {
            if (uri.toString() == 'content://com.google.android.gsf.gservicesa') {
                console.log('[+] [Chamado] contentResolver.query("content://com.google.android.gsf.gservicesa")');
                return null;
            } else {
                return this.query(uri, str, bundle, sig);
            }
        };

        contentResolver.query.overload('android.net.Uri', '[Ljava.lang.String;', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String').implementation = function(uri, astr, bstr, cstr, dstr) {
            if (uri.toString() == 'content://com.google.android.gsf.gservicesa') {
                console.log('[+] [Chamado] contentResolver.query("content://com.google.android.gsf.gservicesa")');
                return null;
            } else {
                return this.query(uri, astr, bstr, cstr, dstr);
            }
        };

        contentResolver.query.overload('android.net.Uri', '[Ljava.lang.String;', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String', 'android.os.CancellationSignal').implementation = function(uri, astr, bstr, cstr, sig) {
            if (uri.toString() == 'content://com.google.android.gsf.gservicesa') {
                console.log('[+] [Chamado] contentResolver.query("content://com.google.android.gsf.gservicesa")');
                return null;
            } else {
                return this.query(uri, astr, bstr, cstr, sig);
            }
        };

        var secureSettings = Java.use('android.provider.Settings$Secure');
        secureSettings.getString.implementation = function(contentresolver, query) {
            console.log('[+] [Chamado] secureSettings.getString() com query: ' + query);
            switch (query) {
                case 'android_id':
                    return android_id;
                default:
                    return this.getString(contentresolver, query);
            }
        };

        var context = Java.use('android.content.Context');
        context.getSystemService.implementation = function(service) {
            if (service === 'wifi') {
                console.log('[+] [Chamado] context.getSystemService("wifi")');
                var wifiManager = Java.use('android.net.wifi.WifiManager');
                return wifiManager.$new();
            }
            if (service === 'telephony') {
                console.log('[+] [Chamado] context.getSystemService("telephony")');
                var telephonyManager = Java.use('android.telephony.TelephonyManager');
                return telephonyManager.$new();
            }
            return this.getSystemService(service);
        };
        
      
        console.log('\n--------------------------------------------------------\n');

    } catch (e) {
        console.log(e);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1116959250 @Hyupai/dumper2
