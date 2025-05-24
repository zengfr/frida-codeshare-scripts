
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-755982862 @sdcampbell/advanced-codeshare-loader
// advanced-codeshare-loader.js
const platformScripts = {
    android: [
        'sdcampbell/script1',
        'sdcampbell/script2',
        'sdcampbell/script3'
    ],
    ios: [
        'sdcampbell/script4',
        'sdcampbell/script5',
        'sdcampbell/script6'
    ]
};

function loadCodeshareScript(scriptName, platform) {
    return new Promise((resolve, reject) => {
        try {
            if (platform === 'android') {
                Java.perform(() => {
                    const codeshare = require('frida-codeshare');
                    codeshare.load(scriptName)
                        .then(() => {
                            console.log(`[+] Loaded Android script: ${scriptName}`);
                            resolve();
                        })
                        .catch(reject);
                });
            } else if (platform === 'ios') {
                ObjC.schedule(ObjC.mainQueue, () => {
                    const codeshare = require('frida-codeshare');
                    codeshare.load(scriptName)
                        .then(() => {
                            console.log(`[+] Loaded iOS script: ${scriptName}`);
                            resolve();
                        })
                        .catch(reject);
                });
            }
        } catch (error) {
            reject(error);
        }
    });
}

async function determineplatform() {
    try {
        await Java.perform(() => {});
        return 'android';
    } catch (e) {
        try {
            if (ObjC.available) return 'ios';
        } catch (e) {
            throw new Error('Unable to determine platform');
        }
    }
}

async function loadAllScripts() {
    try {
        const platform = await determineplatform();
        console.log(`[+] Detected platform: ${platform}`);

        const scripts = platformScripts[platform];

        for (const script of scripts) {
            try {
                await loadCodeshareScript(script, platform);
            } catch (error) {
                console.log(`[!] Failed to load ${script}: ${error.message}`);
            }
        }

        console.log('[+] Finished loading all codeshare scripts');
    } catch (error) {
        console.log(`[!] Error: ${error.message}`);
    }
}

// Add error handling for script initialization
setTimeout(() => {
    loadAllScripts().catch(error => {
        console.log('[!] Fatal error in script loading:', error);
    });
}, 1000);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-755982862 @sdcampbell/advanced-codeshare-loader
