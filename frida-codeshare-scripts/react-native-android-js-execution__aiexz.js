
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1058782702 @aiexz/react-native-android-js-execution
// all taken from https://pilfer.github.io/mobile-reverse-engineering/react-native/

// This is the app identifier you're trying to hook
const package_name = 'com.example.app';

// Write the hermes-hook.js payload to file
const f = new File(`/data/data/${package_name}/files/hermes-hook.js`, 'w');
f.write(`console.log(JSON.stringify(this.process)); console.log('hello from React Native!');`);
f.close();

if (Java.available) {
    Java.perform(() => {
        const waitForClass = (className, callback) => {
            const interval = setInterval(() => {
                try {
                    Java.use(className);
                    clearInterval(interval);
                    callback();
                } catch (e) {
                    // Class not yet available, keep waiting
                }
            }, 10);
        };


        const hookJS = () => {
            try {
                const func = Java.use('com.facebook.react.bridge.CatalystInstanceImpl').loadScriptFromAssets;

                func.implementation = function(assetManager, assetURL, z) {
                    // Store for later I guess

                    this.loadScriptFromAssets(assetManager, assetURL, z);
                    this.loadScriptFromFile(`/data/data/${package_name}/files/hermes-hook.js`, `/data/data/${package_name}/files/hermes-hook.js`, z);
                };
            } catch (e) {
                console.error(e);
            }
        };

        // We have to wait for SoLoader.init to be called before we can hook into the JS runtime.
        // There's a few overloads, so we have to hook into all of them and then call our hookJS function.
        waitForClass('com.facebook.soloader.SoLoader', () => {
            let SoLoader = Java.use('com.facebook.soloader.SoLoader');
            SoLoader.init.overload('android.content.Context', 'int').implementation = function(context, i) {
                this.init(context, i);
                hookJS();
            };

            SoLoader.init.overload('android.content.Context', 'int', 'com.facebook.soloader.SoFileLoader').implementation = function(context, i, soFileLoader) {
                this.init(context, i, soFileLoader);
                hookJS();
            };

            SoLoader.init.overload('android.content.Context', 'int', 'com.facebook.soloader.SoFileLoader', '[Ljava.lang.String;').implementation = function(context, i, soFileLoader, strArr) {
                this.init(context, i, soFileLoader, strArr);
                hookJS();
            };

            SoLoader.init.overload('android.content.Context', 'boolean').implementation = function(context, z) {
                this.init(context, z);
                hookJS();
            };
        });
    });
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1058782702 @aiexz/react-native-android-js-execution
