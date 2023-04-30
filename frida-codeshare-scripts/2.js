Java.perform(function() {
var res2 = Java.use('com.android.okhttp.Response$Builder');
    res2.build.implementation = function() {

        var response = this.build();
var base64 = Java.use('android.util.Base64');

        console.log(response.headers())
        console.log(response.message())
        console.log("## REQ ### ");
        console.log(response.request());
        console.log(response.request().headers());



        console.log("## -REQ- ### ");
        return response;
    };
    

});
//https://github.com/zengfr/frida-codeshare-scripts
//-342135627 @vumail159951/2