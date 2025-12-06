
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:611279221 @sasasec/freerasp-root-detection-bypass
(function() {
    'use strict';

    // ---- CONFIG ----
    const SLOW_MODE = true;
    const STEP_DELAY_MS = 600;
    const CLASS_NAME = 'com.freeraspreactnative.FreeraspReactNativeModule';
    const LAMBDAS = ['talsecStart$lambda$2', 'talsecStart$lambda$2$lambda$1'];

    const CHECKS_LOG = [
        'Root detection',
        'Hooking detection',
        'Developer mode detection',
        'ADB enabled detection',
    ];

    if (globalThis.__FREERASP_RN_BYPASS__) return;
    globalThis.__FREERASP_RN_BYPASS__ = true;

    function say(msg) {
        console.log(msg);
    }

    let q = Promise.resolve();

    function step(msg) {
        if (!SLOW_MODE) {
            say(msg);
            return;
        }
        q = q.then(() => new Promise(r => {
            say(msg);
            setTimeout(r, STEP_DELAY_MS);
        }));
    }

    if (!Java.available) {
        say('✘ Error: Java runtime not available');
        return;
    }

    Java.perform(function() {
        step('>>> Starting freeRASP RN bypass');

        let Mod = null;
        try {
            Mod = Java.use(CLASS_NAME);
            step('>>> Class loaded: ' + CLASS_NAME);
        } catch (e) {
            say('✘ Error: Class not found: ' + CLASS_NAME + ' :: ' + e);
            return;
        }

        let startOv = null;
        try {
            startOv = Mod.talsecStart.overload(
                'com.facebook.react.bridge.ReadableMap',
                'com.facebook.react.bridge.Promise'
            );
            step('>>> Overload resolved: talsecStart(ReadableMap, Promise)');
        } catch (e) {
            say('✘ Error: Could not resolve talsecStart overload: ' + e);
            return;
        }

        try {
            startOv.implementation = function(options, promise) {
                step('>>> Intercepted call to talsecStart');

                let startedFlagSet = false;
                try {
                    Mod['access$setTalsecStarted$cp'].overload('boolean')(true);
                    step('✔ Bypassed: startup gate (setter)');
                    startedFlagSet = true;
                } catch (e1) {
                    try {
                        Mod.talsecStarted.value = true;
                        step('✔ Bypassed: startup gate (static field)');
                        startedFlagSet = true;
                    } catch (e2) {
                        say('✘ Error: Could not set started flag: ' + e2);
                    }
                }

                try {
                    const JString = Java.use('java.lang.String');
                    promise.resolve(JString.$new('freeRASP started'));
                    step('✔ Bypassed: promise resolved with fake start');
                } catch (e) {
                    say('✘ Error: promise.resolve failed: ' + e);
                }

                if (startedFlagSet) {
                    CHECKS_LOG.forEach(c => step('✔ Bypassed: ' + c));
                    step('>>> All security checks bypassed successfully');
                }

                return;
            };
            step('>>> Hook applied to talsecStart');
        } catch (e) {
            say('✘ Error: Failed to hook talsecStart: ' + e);
            return;
        }

        LAMBDAS.forEach(function(name) {
            try {
                const m = Mod[name];
                if (m && m.implementation === undefined) {
                    m.implementation = function() {
                        step('✔ Neutralized internal lambda: ' + name);
                        return;
                    };
                }
            } catch (_) {
                // ignore if missing
            }
        });
    });
})();
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:611279221 @sasasec/freerasp-root-detection-bypass
