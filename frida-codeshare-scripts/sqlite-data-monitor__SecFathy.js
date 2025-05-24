
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:343509393 @SecFathy/sqlite-data-monitor
/*
Author: Mohammed Fathy (Secfathy)
 * */

Java.perform(function() {
    var SQLiteDatabase = Java.use("android.database.sqlite.SQLiteDatabase");
    var SQLiteOpenHelper = Java.use("android.database.sqlite.SQLiteOpenHelper");

    var RESET_COLOR = "\x1b[0m";
    var RED_COLOR = "\x1b[31m";
    var GREEN_COLOR = "\x1b[32m";
    var YELLOW_COLOR = "\x1b[33m";
    var BLUE_COLOR = "\x1b[34m";

    SQLiteDatabase.openDatabase.overload('java.lang.String', 'android.database.sqlite.SQLiteDatabase$CursorFactory', 'int').implementation = function(path, factory, flags) {
        console.log(BLUE_COLOR + "Database opened: " + path + RESET_COLOR);
        return this.openDatabase(path, factory, flags);
    };

    SQLiteDatabase.insert.overload('java.lang.String', 'java.lang.String', 'android.content.ContentValues').implementation = function(table, nullColumnHack, values) {
        console.log(GREEN_COLOR + "Insert into table: " + table + " Values: " + values + RESET_COLOR);
        return this.insert(table, nullColumnHack, values);
    };

    SQLiteDatabase.execSQL.overload('java.lang.String').implementation = function(sql) {
        console.log(RED_COLOR + "SQL executed: " + sql + RESET_COLOR);
        this.execSQL(sql);
    };

    SQLiteDatabase.rawQuery.overload('java.lang.String', '[Ljava.lang.String;').implementation = function(sql, selectionArgs) {
        console.log(YELLOW_COLOR + "SQL Query: " + sql + RESET_COLOR);
        return this.rawQuery(sql, selectionArgs);
    };


    SQLiteOpenHelper.getWritableDatabase.implementation = function() {
        var db = this.getWritableDatabase();
        console.log(BLUE_COLOR + "getWritableDatabase called: " + db.getPath() + RESET_COLOR);
        return db;
    };

    SQLiteOpenHelper.getReadableDatabase.implementation = function() {
        var db = this.getReadableDatabase();
        console.log(BLUE_COLOR + "getReadableDatabase called: " + db.getPath() + RESET_COLOR);
        return db;
    };

});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:343509393 @SecFathy/sqlite-data-monitor
