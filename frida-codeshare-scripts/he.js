
//https://github.com/zengfr/frida-codeshare-scripts
//1665705242 @vumail159951/he
Java.perform(function() {
   const StringBuilder = Java.use('java.lang.StringBuilder');
   StringBuilder.toString.implementation = function() {

     var res = this.toString();
       //console.log(res);
    //   var tmp = "";
    //   if (res !== null) {
    //      tmp = res.toString().replace("/n", "");
    //      console.log(tmp);
    //   }
     return res;
   };

 });
//https://github.com/zengfr/frida-codeshare-scripts
//1665705242 @vumail159951/he
