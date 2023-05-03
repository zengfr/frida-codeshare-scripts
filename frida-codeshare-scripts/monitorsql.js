
//https://github.com/zengfr/frida-codeshare-scripts
//1690277131 @Alkeraithe/monitorsql
// Nawaf Alkerithe 
// https://github.com/Alkeraithe
// Alkeraithe@gmail.com
Java.perform(function() {

    console.log("Monitoring SQL executions from SQLiteDatabase");

    //Unencrypted database 

    var SQLiteDatabase = Java.use("android.database.sqlite.SQLiteDatabase");

    SQLiteDatabase.execPerConnectionSQL.overload('java.lang.String', '[Ljava.lang.Object;').implementation = function(sql, bind_args) {
        console.log("---------------------------------------------------------------------------");
        console.log("execPerConnectionSQL(" + sql + "," + bind_args + ")");
        console.log("---------------------------------------------------------------------------");
        return this.execPerConnectionSQL(sql, bind_args);
    };

    SQLiteDatabase.execSQL.overload('java.lang.String').implementation = function(sql) {
        console.log("---------------------------------------------------------------------------");
        console.log("execSQL(" + sql + ")");
        console.log("---------------------------------------------------------------------------");
        return this.execSQL(sql);
    };

    SQLiteDatabase.execSQL.overload('java.lang.String', '[Ljava.lang.Object;').implementation = function(sql, bind_args) {
        console.log("---------------------------------------------------------------------------");
        console.log("execSQL(" + sql + "," + bind_args + ")");
        console.log("---------------------------------------------------------------------------");
        return this.execSQL(sql, bind_args);
    };

    SQLiteDatabase.rawQuery.overload('java.lang.String', '[Ljava.lang.String;', 'android.os.CancellationSignal').implementation = function(sql, selectionArgs, canellationSignal) {
        console.log("---------------------------------------------------------------------------");
        console.log("rawQuery(" + sql + "," + selectionArgs + "," + "canellationSignal" + ")");
        console.log("---------------------------------------------------------------------------");
        return this.rawQuery(sql, selectionArgs, canellationSignal);
    };

    SQLiteDatabase.rawQuery.overload('java.lang.String', '[Ljava.lang.String;').implementation = function(sql, selectionArgs) {
        console.log("---------------------------------------------------------------------------");
        console.log("rawQuery(" + sql + "," + selectionArgs + ")");
        console.log("---------------------------------------------------------------------------");
        return this.rawQuery(sql, selectionArgs);
    };

    SQLiteDatabase.rawQueryWithFactory.overload('android.database.sqlite.SQLiteDatabase$CursorFactory', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String', 'android.os.CancellationSignal').implementation = function(cursorFactory, sql, selectionArgs, editTable, canellationSignal) {
        console.log("---------------------------------------------------------------------------");
        console.log("rawQueryWithFactory(" + "cursorFactory," + "," + sql + "," + selectionArgs + "," + editTable + "," + "canellationSignal" + ")");
        console.log("---------------------------------------------------------------------------");
        return this.rawQueryWithFactory(cursorFactory, sql, selectionArgs, editTable, canellationSignal);
    };

    SQLiteDatabase.rawQueryWithFactory.overload('android.database.sqlite.SQLiteDatabase$CursorFactory', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String').implementation = function(cursorFactory, sql, selectionArgs, editTable) {
        console.log("---------------------------------------------------------------------------");
        console.log("rawQueryWithFactory(" + "cursorFactory," + "," + sql + "," + selectionArgs + "," + editTable + ")");
        console.log("---------------------------------------------------------------------------");
        return this.rawQueryWithFactory(cursorFactory, sql, selectionArgs, editTable);
    };


    //Encrypted database 

    var encSQLiteDatabase = Java.use("net.sqlcipher.database.SQLiteDatabase");

    encSQLiteDatabase.execSQL.overload('java.lang.String').implementation = function(sql) {
        console.log("---------------------------------------------------------------------------");
        console.log("encrypted execSQL(" + sql + ")");
        console.log("---------------------------------------------------------------------------");
        return this.execSQL(sql);
    };

    encSQLiteDatabase.rawExecSQL.overload('java.lang.String').implementation = function(sql) {
        console.log("---------------------------------------------------------------------------");
        console.log("encrypted rawExecSQL(" + sql + ")");
        console.log("---------------------------------------------------------------------------");
        return this.rawExecSQL(sql);
    };

    encSQLiteDatabase.execSQL.overload('java.lang.String', '[Ljava.lang.Object;').implementation = function(sql, bind_args) {
        console.log("---------------------------------------------------------------------------");
        console.log("encrypted execSQL(" + sql + "," + bind_args + ")");
        console.log("---------------------------------------------------------------------------");
        return this.execSQL(sql, bind_args);
    };


    encSQLiteDatabase.rawQuery.overload('java.lang.String', '[Ljava.lang.String;', 'int', 'int').implementation = function(sql, selectionArgs, initialRead, maxRead) {
        console.log("---------------------------------------------------------------------------");
        console.log("encrypted rawQuery(" + sql + "," + selectionArgs + "," + initialRead + "," + maxRead);
        console.log("---------------------------------------------------------------------------");
        return this.rawQuery(sql, selectionArgs, initialRead, maxRead);
    };

    encSQLiteDatabase.rawQuery.overload('java.lang.String', '[Ljava.lang.String;').implementation = function(sql, selectionArgs) {
        console.log("---------------------------------------------------------------------------");
        console.log("encrypted rawQuery(" + sql + "," + selectionArgs + ")");
        console.log("---------------------------------------------------------------------------");
        return this.rawQuery(sql, selectionArgs);
    };

    encSQLiteDatabase.rawQueryWithFactory.overload('net.sqlcipher.database.SQLiteDatabase$CursorFactory', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String').implementation = function(cursorFactory, sql, selectionArgs, editTable) {
        console.log("---------------------------------------------------------------------------");
        console.log("encrypted rawQueryWithFactory(" + "cursorFactory," + sql + "," + selectionArgs + "," + editTable + ")");
        console.log("---------------------------------------------------------------------------");
        return this.rawQueryWithFactory(cursorFactory, sql, selectionArgs, editTable);
    };
});
//https://github.com/zengfr/frida-codeshare-scripts
//1690277131 @Alkeraithe/monitorsql
