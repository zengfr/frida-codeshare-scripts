
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:664766103 @marcohald/supportsqlitestatement
let SupportSQLiteDatabase = Java.use("androidx.sqlite.db.SupportSQLiteDatabase");
SupportSQLiteDatabase["delete"].implementation = function (str, str2, objArr) {
    console.log(`SupportSQLiteDatabase.delete is called: str=${str}, str2=${str2}, objArr=${objArr}`);
    let result = this["delete"](str, str2, objArr);
    console.log(`SupportSQLiteDatabase.delete result=${result}`);
    return result;
};


SupportSQLiteDatabase["execSQL"].overload('java.lang.String').implementation = function (str) {
    console.log(`SupportSQLiteDatabase.execSQL is called: str=${str}`);
    this["execSQL"](str);
};


SupportSQLiteDatabase["execSQL"].overload('java.lang.String', '[Ljava.lang.Object;').implementation = function (str, objArr) {
    console.log(`SupportSQLiteDatabase.execSQL is called: str=${str}, objArr=${objArr}`);
    this["execSQL"](str, objArr);
};
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:664766103 @marcohald/supportsqlitestatement
