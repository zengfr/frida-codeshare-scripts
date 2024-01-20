
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-300436879 @zeroinside/tracesslexceptions
/*
A PoC Frida script to trace the android SSL exception constructors. Helps a lot with searching the code tree for the certificate pinning functions and exception sources.
$ frida -U  -l trace_sslexceptions.js -f app.app.app
(c) zeroinside
*/

Java.perform(function() {

    try {
        console.log("Patching javax.net.ssl.SSLHandshakeException...");
        var _SSLHandshakeException = Java.use("javax.net.ssl.SSLHandshakeException");
        _SSLHandshakeException.$init.overload('java.lang.String').implementation = function() {

            console.log("_SSLHandshakeException.init.");
            console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

        };

        console.log('* HOOKED SSLHandshakeException ');


    } catch (e) {
        console.log("[E:] SSLHandshakeException:" + e);
    }







    try {
        console.log("Patching javax.net.ssl.SSLPeerUnverifiedException...");
        var SSLPeerUnverifiedException = Java.use("javax.net.ssl.SSLPeerUnverifiedException");
        SSLPeerUnverifiedException.$init.overload('java.lang.String').implementation = function() {

            console.log("SSLPeerUnverifiedException.init.");
            console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

        };

        console.log('* HOOKED SSLPeerUnverifiedException ');


    } catch (e) {
        console.log("[E:] SSLPeerUnverifiedException:" + e);
    }










    try {
        console.log("Patching java.security.cert.CertificateException...");
        var _CertificateException = Java.use("java.security.cert.CertificateException");
    } catch (e) {
        console.log("[E:] CertificateException:" + e);
    }




    try {

        _CertificateException.$init.overload('java.lang.String').implementation = function(a) {

            console.log("CertificateException.init.");
            console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

        };
    } catch (e) {
        console.log("[E:] CertificateException:" + e);
    }


    try {
        _CertificateException.$init.overload('java.lang.Throwable').implementation = function(a) {

            console.log("_CertificateException.init.");
            console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

        };
    } catch (e) {
        console.log("[E:] CertificateException:" + e);
    }


    try {
        _CertificateException.$init.overload('java.lang.String', 'java.lang.Throwable').implementation = function(a, b) {

            console.log("_CertificateException.init.");
            console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

        };
    } catch (e) {
        console.log("[E:] CertificateException:" + e);
    }


    try {
        _CertificateException.$init.overload().implementation = function() {

            console.log("_CertificateException.init.");
            console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

        };

        console.log('* HOOKED CertificateException ');

    } catch (e) {
        console.log("[E:] CertificateException:" + e);
    }





    var _CertPathValidatorException = Java.use("java.security.cert.CertPathValidatorException");



    try {

        _CertPathValidatorException.$init.overload('java.lang.String').implementation = function(a) {

            console.log("CertificateException.init.");
            console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

        };
    } catch (e) {
        console.log("[E:] CertificateException:" + e);
    }


    try {
        _CertificateException.$init.overload('java.lang.Throwable').implementation = function(a) {

            console.log("_CertificateException.init.");
            console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

        };
    } catch (e) {
        console.log("[E:] CertificateException:" + e);
    }


    try {
        _CertPathValidatorException.$init.overload('java.lang.String', 'java.lang.Throwable').implementation = function(a, b) {

            console.log("_CertificateException.init.");
            console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

        };
    } catch (e) {
        console.log("[E:] CertificateException:" + e);
    }


    try {
        _CertPathValidatorException.$init.overload().implementation = function() {

            console.log("_CertificateException.init.");
            console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

        };

        console.log('* HOOKED CertificateException ');

    } catch (e) {
        console.log("[E:] CertificateException:" + e);
    }





    var JavaxNetSSLException = Java.use("javax.net.ssl.SSLException");




    try {

        JavaxNetSSLException.$init.overload('java.lang.String').implementation = function(a) {

            console.log("javax.net.ssl.SSLException.init.");
            console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

        };
    } catch (e) {
        console.log("[E:] javax.net.ssl.SSLException:" + e);
    }


    try {
        JavaxNetSSLException.$init.overload('java.lang.Throwable').implementation = function(a) {

            console.log("javax.net.ssl.SSLException.init.");
            console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

        };
    } catch (e) {
        console.log("[E:] javax.net.ssl.SSLException:" + e);
    }


    try {
        JavaxNetSSLException.$init.overload('java.lang.String', 'java.lang.Throwable').implementation = function(a, b) {

            console.log("javax.net.ssl.SSLException.init.");
            console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));

        };
    } catch (e) {
        console.log("[E:] javax.net.ssl.SSLException:" + e);
    }


});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-300436879 @zeroinside/tracesslexceptions
