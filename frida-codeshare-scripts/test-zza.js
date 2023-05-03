
//https://github.com/zengfr/frida-codeshare-scripts
//-724354080 @miromiro11/test-zza
Java.perform(function () {
     // Get a reference to the ArrayList class
  var array_list = Java.use("java.util.ArrayList");
  // Get a reference to the TrustManagerImpl class
  var ApiClient = Java.use('com.android.org.conscrypt.TrustManagerImpl');
  // Override the checkTrustedRecursive method
  ApiClient.checkTrustedRecursive.implementation = function(a1, a2, a3, a4, a5, a6) {
    // Create a new ArrayList instance
    var k = array_list.$new();
    // Return the ArrayList
    return k;
  }

  // Get a reference to the CSIPublicKey class
  var CSIPublicKey = Java.use('com.bestbuy.essenceair.ota.CSIPublicKey');

  // Replace the implementation of the getStrippedPublicKey method with our own
  CSIPublicKey.getStrippedPublicKey.implementation = function () {
    // Get the stripped public key using the original implementation
    var strippedPublicKey = this.getStrippedPublicKey();

    // Print the stripped public key
    console.log('Stripped public key:', strippedPublicKey);

    // Return the stripped public key
    return strippedPublicKey;
  }
  
  var eClass = Java.use("u2.e");

  // Override the d method to print out the input string and the encrypted string
  eClass.d.overload("java.lang.String").implementation = function(str) {
    console.log("Encrypting string: " + str);
    var encryptedString = this.d(str);
    console.log("Encrypted string: " + encryptedString);
    return encryptedString;
  }

  // Override the f method to print out a message
  eClass.f.overload().implementation = function() {
    console.log("Checking if public key is expired");
    return this.f();
  }

  // Override the g method to print out the input strings
  eClass.g.overload("java.lang.String", "java.lang.String").implementation = function(str, str2) {
    console.log("Logging error with tag: " + str + " and message: " + str2);
    this.g(str, str2);
  }

  // Override the h method to print out a message
  eClass.h.overload("com.bestbuy.android.restclient.model.xplatform.CSIPublicKey").implementation = function(csiPublicKey) {
    console.log("Updating public key");
    this.h(csiPublicKey);
  }
  
  var q = Java.use('u2.q');
  // Override the a method
  q.a.implementation = function () {
    // Call the original a method
    var result = this.a();
    console.log('a method called: ' + result);
    // Return the original result
    return result;
  };

});
//https://github.com/zengfr/frida-codeshare-scripts
//-724354080 @miromiro11/test-zza
