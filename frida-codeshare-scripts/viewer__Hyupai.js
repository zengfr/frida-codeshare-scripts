
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:43869484 @Hyupai/viewer
Java.perform(function() {
    console.log('\n----------- Métodos de Identificação On Pix -----------\n');
    
    try {
        var build = Java.use('android.os.Build');
        var SystemProperties = Java.use('android.os.SystemProperties');
        var telephonyManager = Java.use('android.telephony.TelephonyManager');
        var bluetoothAdapter = Java.use('android.bluetooth.BluetoothAdapter');
        var wifiInfo = Java.use('android.net.wifi.WifiInfo');
        var contentResolver = Java.use('android.content.ContentResolver');
        var secureSettings = Java.use('android.provider.Settings$Secure');
        var context = Java.use('android.content.Context');

        // Interceptar e debugar os métodos
        build.getSerial.implementation = function() {
            
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
            
            var originalSerial = this.getSerial();
            console.log('[Original] Build.getSerial(): ' + originalSerial);
            return originalSerial;  // Retorna o valor original
        };

        SystemProperties.get.overload('java.lang.String').implementation = function(key) {
            var originalValue = this.get(key);
            console.log('[Original] SystemProperties.get("' + key + '"): ' + originalValue);
            return originalValue;  // Retorna o valor original
        };

        telephonyManager.getLine1Number.overloads[0].implementation = function() {
            var originalLine1Number = this.getLine1Number();
            console.log('[Original] telephonyManager.getLine1Number(): ' + originalLine1Number);
            return originalLine1Number;  // Retorna o valor original
        };

        telephonyManager.getSubscriberId.overload().implementation = function() {
            var originalSubscriberId = this.getSubscriberId();
            console.log('[Original] telephonyManager.getSubscriberId(): ' + originalSubscriberId);
            return originalSubscriberId;  // Retorna o valor original
        };

        telephonyManager.getDeviceId.overloads[0].implementation = function() {
            var originalDeviceId = this.getDeviceId();
            console.log('[Original] telephonyManager.getDeviceId(): ' + originalDeviceId);
            return originalDeviceId;  // Retorna o valor original
        };

        bluetoothAdapter.getAddress.implementation = function() {
            var originalMacAddress = this.getAddress();
            console.log('[Original] bluetoothAdapter.getAddress(): ' + originalMacAddress);
            return originalMacAddress;  // Retorna o valor original
        };

        wifiInfo.getMacAddress.implementation = function() {
            var originalMacAddress = this.getMacAddress();
            console.log('[Original] wifiInfo.getMacAddress(): ' + originalMacAddress);
            return originalMacAddress;  // Retorna o valor original
        };

        wifiInfo.getSSID.implementation = function() {
            var originalSSID = this.getSSID();
            console.log('[Original] wifiInfo.getSSID(): ' + originalSSID);
            return originalSSID;  // Retorna o valor original
        };

        wifiInfo.getBSSID.implementation = function() {
            var originalBSSID = this.getBSSID();
            console.log('[Original] wifiInfo.getBSSID(): ' + originalBSSID);
            return originalBSSID;  // Retorna o valor original
        };

        contentResolver.query.overload('android.net.Uri', '[Ljava.lang.String;', 'android.os.Bundle', 'android.os.CancellationSignal').implementation = function(uri, str, bundle, sig) {
            console.log('[Original] contentResolver.query("' + uri.toString() + '")');
            return this.query(uri, str, bundle, sig);  // Executa o método original
        };

        secureSettings.getString.implementation = function(contentresolver, query) {
            var originalAndroidId = this.getString(contentresolver, query);
            console.log('[Original] secureSettings.getString() com query: ' + query + ' -> ' + originalAndroidId);
            return originalAndroidId;  // Retorna o valor original
        };

        context.getSystemService.implementation = function(service) {
            console.log('[Original] context.getSystemService("' + service + '")');
            return this.getSystemService(service);  // Executa o método original
        };

        console.log('\n--------------------------------------------------------\n');

    } catch (e) {
        console.log(e);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:43869484 @Hyupai/viewer
