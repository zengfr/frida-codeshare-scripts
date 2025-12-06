
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1360068977 @sdcampbell/android-codeshare-loader
// android-codeshare-loader.js
function loadCodeshareScript(scriptName) {
    return new Promise((resolve, reject) => {
        try {
            Java.perform(() => {  // For Android
                const codeshare = require('frida-codeshare');
                codeshare.load(scriptName)
                    .then(() => {
                        console.log(`[+] Loaded codeshare script: ${scriptName}`);
                        resolve();
                    })
                    .catch(error => {
                        console.log(`[!] Error loading ${scriptName}: ${error.message}`);
                        reject(error);
                    });
            });
        } catch(error) {
            reject(error);
        }
    });
}

// List your codeshare scripts here
const codeshareScripts = [
    'sdcampbell/script1',
    'sdcampbell/script2',
    'sdcampbell/script3'
];

// Load all scripts sequentially
async function loadAllScripts() {
    for (const script of codeshareScripts) {
        try {
            await loadCodeshareScript(script);
        } catch(error) {
            console.log(`[!] Failed to load ${script}: ${error.message}`);
        }
    }
    console.log('[+] Finished loading all codeshare scripts');
}

loadAllScripts();
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1360068977 @sdcampbell/android-codeshare-loader
