
//https://github.com/zengfr/frida-codeshare-scripts
//-70845927 @xperylab/ios-sqlite3
var func_sqlite3_prepare_v2 = Module.findExportByName('libsqlite3.dylib', 'sqlite3_prepare_v2');

Interceptor.attach(func_sqlite3_prepare_v2, {
    onEnter: function(args) {
        var sqlite3_stmt = args[1];
        console.log('SQL: ' + sqlite3_stmt.readCString());
    },

    onLeave: function(retval) {}

});
//https://github.com/zengfr/frida-codeshare-scripts
//-70845927 @xperylab/ios-sqlite3
