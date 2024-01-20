
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1600396960 @ibadfawa/bypass-decrypted-rom-integrity-checks---frida
Java.perform(function() {
    var Storage = Java.use("android.os.storage.StorageManager");
    Storage.isEncrypted.overload()
        .implementation = function() {
            console.warn("isEncrypted:", this.isEncrypted());
            return true;
        }
})
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1600396960 @ibadfawa/bypass-decrypted-rom-integrity-checks---frida
