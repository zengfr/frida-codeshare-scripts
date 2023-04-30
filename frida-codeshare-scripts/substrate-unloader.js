var dlopen = new NativeFunction(
    Module.findExportByName(null, 'dlopen'),
    'pointer', ['pointer', 'int']);

Interceptor.replace(dlopen, new NativeCallback(function(path, mode) {
    var name = Memory.readUtf8String(path);
    if (name !== null && name.indexOf('SubstrateLoader') !== -1) {
        return NULL;
    }
    return dlopen(path, mode);
}, 'pointer', ['pointer', 'int']));
//https://github.com/zengfr/frida-codeshare-scripts
//1370406505 @mrmacete/substrate-unloader