
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-658652965 @rustyrend107/rusty
/**
 * Safe Delayed SSL Unpinning Script (Codeshare-Safe)
 * Android 8–13
 * Attach-only | No ART | No Native | No Anti-Tamper
 *
 * Author: rustyrend107
 */

'use strict';

const TAG = '[RUSTY-SSL]';
const log = m => console.log(`${TAG} ${m}`);

function waitForJava(callback) {
    if (Java.available) {
        Java.perform(callback);
    } else {
        setTimeout(() => waitForJava(callback), 200);
    }
}

waitForJava(function () {
    log('Java detected');

    /**
     * ------------------------------------------------------
     * 1. Delay hooks until Application is running
     * ------------------------------------------------------
     */
    const ActivityThread = Java.use('android.app.ActivityThread');

    ActivityThread.currentApplication.implementation = function () {
        const app = this.currentApplication();
        if (app) {
            log('Application ready → installing SSL hooks');
            setTimeout(installSSLHooks, 1000);
        }
        return app;
    };

    /**
     * ------------------------------------------------------
     * 2. SSL hooks (SAFE ONLY)
     * ------------------------------------------------------
     */
    function installSSLHooks() {

        /**
         * Conscrypt TrustManager
         */
        try {
            const TrustManagerImpl =
                Java.use('com.android.org.conscrypt.TrustManagerImpl');

            TrustManagerImpl.verifyChain.implementation = function (
                chain,
                trustAnchors,
                host
            ) {
                log('Bypassed TrustManagerImpl for ' + host);
                return chain;
            };

            log('Conscrypt TrustManager hooked');
        } catch (e) {
            log('Conscrypt TrustManager not found');
        }

        /**
         * X509ExtendedTrustManager
         */
        try {
            const X509Ext =
                Java.use('javax.net.ssl.X509ExtendedTrustManager');

            X509Ext.checkServerTrusted.implementation = function () {
                log('X509ExtendedTrustManager bypassed');
            };

            log('X509ExtendedTrustManager hooked');
        } catch (e) {
            log('X509ExtendedTrustManager not present');
        }

        /**
         * HostnameVerifier
         */
        try {
            const HttpsURLConnection =
                Java.use('javax.net.ssl.HttpsURLConnection');

            HttpsURLConnection.setDefaultHostnameVerifier.implementation =
                function () {
                    log('Default HostnameVerifier bypassed');
                };

            log('HostnameVerifier bypassed');
        } catch (e) {}

        /**
         * WebView SSL errors
         */
        try {
            const WebViewClient =
                Java.use('android.webkit.WebViewClient');

            WebViewClient.onReceivedSslError.implementation =
                function (view, handler) {
                    log('WebView SSL error bypassed');
                    handler.proceed();
                };

            log('WebView SSL bypassed');
        } catch (e) {}

        /**
         * OkHttp (optional)
         */
        try {
            const Pinner =
                Java.use('okhttp3.CertificatePinner');

            Pinner.check
                .overload('java.lang.String', 'java.util.List')
                .implementation = function (host) {
                    log('OkHttp pinning bypassed for ' + host);
                };

            log('OkHttp CertificatePinner hooked');
        } catch (e) {
            log('OkHttp not used');
        }

        log('SSL hooks installed (safe mode)');
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-658652965 @rustyrend107/rusty
