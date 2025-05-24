
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:739303218 @Hyupai/classloader
Java.perform(function () {
  
    // Verificando ro.preinstall.vendorid para identificar o fornecedor
      var Build = Java.use("android.os.Build");
    var SystemProperties = Java.use("android.os.SystemProperties");
    
    var vendorId = SystemProperties.get("ro.preinstall.vendorid");
    console.log("Vendor ID: " + vendorId);
    if (vendorId && vendorId.includes("stb_vendor")) {
        console.log("Dispositivo é um Set-Top Box!");
    }

    // Verificando debug.second-display.pkg para identificar a presença de uma TV/monitor externo
    var secondDisplayPkg = SystemProperties.get("debug.second-display.pkg");
    console.log("Second Display Package: " + secondDisplayPkg);
    if (secondDisplayPkg) {
        console.log("Dispositivo tem suporte para TV ou segundo display!");
    }

    // Verificando ro.product.firmware para identificar o firmware de STB
    var firmware = SystemProperties.get("ro.product.firmware");
    console.log("Firmware: " + firmware);
    if (firmware && firmware.includes("stb_firmware")) {
        console.log("Dispositivo possui firmware para Set-Top Box!");
    }

    

});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:739303218 @Hyupai/classloader
