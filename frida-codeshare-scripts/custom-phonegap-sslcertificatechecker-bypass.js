/* Script start */

Java.perform(function x() {

    var SSLCertificateChecker = Java.use("nl.xservices.plugins.SSLCertificateChecker");
    SSLCertificateChecker.execute.implementation = function(str, jSONArray, callbackContext) {
        console.log('execute is called');

        Java.choose("org.apache.cordova.CallbackContext", {
            onMatch: function(instance) { //This function will be called for every instance found by frida
                console.log("Found instance: " + instance);
                console.log("Sending success");
                instance.success('CONNECTION_SECURE');
            },
            onComplete: function() {}
        });

        //var ret = this.execute(str, jSONArray, callbackContext); // Return value before modification
        var ret = true
        //console.log('execute ret value is ' + ret);
        return ret;
    };
});
//https://github.com/zengfr/frida-codeshare-scripts
//-1421946648 @gchib297/custom-phonegap-sslcertificatechecker-bypass