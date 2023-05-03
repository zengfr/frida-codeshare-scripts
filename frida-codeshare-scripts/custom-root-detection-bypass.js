
//https://github.com/zengfr/frida-codeshare-scripts
//1005028785 @gchib297/custom-root-detection-bypass
/* IMPORTANT - Edit class names before using this script */

console.log("Script loaded successfully ");

Java.perform(function x() {
    console.log("Inside java perform log function");
    var my_class2 = Java.use("com.ph1.retail.ph2.utils.phLog");
    my_class2.printLog.implementation = function(x, y) { //hooking the new function
        console.log("Hooked printLog:" + x + "\n" + y)

    };

});

/* Hook show error dialog */
Java.perform(function m() {
    console.log("Inside java perform log function");
    var my_class3 = Java.use("com.ph1.retail.ph2.phBank");
    my_class3.showErrorDialog.overload('java.lang.String').implementation = function(m) { //hooking the new function
        console.log("Hooked showErrorDialog")
    };

});

/* Hook isRootedDevice */
Java.perform(function r() {
    console.log("Inside java perform isRootedDevice function");
    var my_class7 = Java.use("com.ph1.retail.ph2.utils.UiUtils");
    my_class7.isRootedDevice.implementation = function(r) { //hooking the new function
        console.log("Hooked isRootedDevice")
        return Java.use("java.lang.Boolean").$new(false);
    };

});

/* Hook checkIfDeviceRooted */

Java.perform(function z() {
    console.log("Inside java perform function");
    var my_class = Java.use("com.ph1.retail.ph2.phBank");
    my_class.checkIfDeviceRooted.implementation = function(z) { //hooking the new function
        console.log("Hooked checkifDeviceRooted")


        Java.choose("com.ph1.retail.ph2.phBank", {
            onMatch: function(instance) { //This function will be called for every instance found by frida
                console.log("Found instance: " + instance);
                console.log("Invoking showLoginPage: ");
                instance.showLoginPage();
            },
            onComplete: function() {}
        });

    };

});
//https://github.com/zengfr/frida-codeshare-scripts
//1005028785 @gchib297/custom-root-detection-bypass
