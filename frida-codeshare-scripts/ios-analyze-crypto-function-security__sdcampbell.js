
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-679625298 @sdcampbell/ios-analyze-crypto-function-security
// Weakness detection configuration
const weakCiphers = [
    'kCCAlgorithmDES',
    'kCCAlgorithm3DES',
    'kCCAlgorithmRC2',
    'kCCAlgorithmRC4',
    'kCCAlgorithmBlowfish'
];

const weakModes = [
    'kCCModeECB',
    'kCCModeCBC'
];

const weakKeyLengths = {
    'kCCAlgorithmAES128': 128,
    'kCCAlgorithmAES': 128
};

const weakHashes = [
    'CC_SHA1',
    'CC_MD5',
    'CC_MD2',
    'CC_MD4',
    'CommonDigest'
];

const stats = {
    weakCiphersFound: new Set(),
    weakModePairs: new Set(),  // Changed from weakModesFound
    weakHashesFound: new Set(),
    keyReuse: 0,
    ivReuse: 0,
    weakKeyLengthsFound: new Set(),
    totalOperations: 0,
    pbkdf2WeakIterations: 0,
    totalCipherOperations: 0,
    totalHashOperations: 0,
    totalKeyDerivationOperations: 0
};

// Track keys and IVs for reuse detection
const seenKeys = new Set();
const seenIVs = new Set();

function getAlgorithmName(algorithm) {
    const algorithms = {
        0: 'kCCAlgorithmAES128',
        1: 'kCCAlgorithmAES',
        2: 'kCCAlgorithmDES',
        3: 'kCCAlgorithm3DES',
        4: 'kCCAlgorithmCAST',
        5: 'kCCAlgorithmRC4',
        6: 'kCCAlgorithmRC2',
        7: 'kCCAlgorithmBlowfish'
    };
    return algorithms[algorithm] || 'Unknown';
}

function getModeName(mode) {
    const modes = {
        0: 'kCCModeECB',
        1: 'kCCModeCBC',
        2: 'kCCModeCFB',
        3: 'kCCModeCTR',
        4: 'kCCModeF8',
        5: 'kCCModeLRW',
        6: 'kCCModeOFB',
        7: 'kCCModeXTS',
        8: 'kCCModeRC4',
        9: 'kCCModeCFB8'
    };
    return modes[mode] || 'Unknown';
}

function bufferToHex(buffer, length) {
    if (!buffer || buffer.isNull()) return null;
    return Array.from(new Uint8Array(buffer.readByteArray(length)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function isWeak(alg, mode, keyLength) {
    return weakCiphers.includes(alg) || 
           weakModes.includes(mode) || 
           (weakKeyLengths[alg] && keyLength <= weakKeyLengths[alg]);
}

function recordOperation(type, data) {
    stats.totalOperations++;
    switch(type) {
        case 'cipher':
            stats.totalCipherOperations++;
            if(data.isWeak) {
                stats.weakCiphersFound.add(data.algorithm);
                if (weakModes.includes(data.mode)) {
                    stats.weakModePairs.add(`${data.algorithm} with ${data.mode}`);
                }
            }
            if(data.keyReused) stats.keyReuse++;
            if(data.ivReused) stats.ivReuse++;
            break;
        case 'hash':
            stats.totalHashOperations++;
            if(data.isWeak) {
                stats.weakHashesFound.add(data.algorithm);
            }
            break;
        case 'keyderivation':
            stats.totalKeyDerivationOperations++;
            if(data.isWeak) {
                stats.pbkdf2WeakIterations++;
            }
            break;
    }
}

function attachCCCrypt() {
    try {
        Interceptor.attach(Module.findExportByName("libSystem.B.dylib", "CCCrypt"), {
            onEnter: function(args) {
                const op = args[0].toInt32();
                const alg = getAlgorithmName(args[1].toInt32());
                const mode = getModeName(args[2].toInt32());
                const keyLength = args[4].toInt32() * 8;
                const keyPtr = args[3];
                const ivPtr = args[6];
                
                const keyHex = keyPtr.isNull() ? null : bufferToHex(keyPtr, args[4].toInt32());
                const ivHex = ivPtr.isNull() ? null : bufferToHex(ivPtr, 16);
                
                const keyReused = keyHex && seenKeys.has(keyHex);
                const ivReused = ivHex && seenIVs.has(ivHex);
                
                if (keyHex) seenKeys.add(keyHex);
                if (ivHex) seenIVs.add(ivHex);

                recordOperation('cipher', {
                    algorithm: alg,
                    mode: mode,
                    keyLength: keyLength,
                    isWeak: isWeak(alg, mode, keyLength),
                    keyReused: keyReused,
                    ivReused: ivReused
                });
            }
        });
    } catch(err) {}
}

function attachHashingHooks() {
    try {
        const hashFunctions = {
            'CC_SHA1_Init': {size: 20, isWeak: true},
            'CC_MD5_Init': {size: 16, isWeak: true},
            'CC_SHA256_Init': {size: 32, isWeak: false},
            'CC_SHA384_Init': {size: 48, isWeak: false},
            'CC_SHA512_Init': {size: 64, isWeak: false}
        };

        Object.entries(hashFunctions).forEach(([funcName, details]) => {
            const hashPtr = Module.findExportByName("libSystem.B.dylib", funcName);
            if (hashPtr) {
                Interceptor.attach(hashPtr, {
                    onEnter: function(args) {
                        recordOperation('hash', {
                            algorithm: funcName.split('_')[1],
                            isWeak: details.isWeak
                        });
                    }
                });
            }
        });

    } catch(err) {}
}

function attachKeyDerivation() {
    try {
        Interceptor.attach(Module.findExportByName(null, "CCKeyDerivationPBKDF"), {
            onEnter: function(args) {
                const algorithm = args[0].toInt32();
                const iterations = args[5].toInt32();
                
                recordOperation('keyderivation', {
                    algorithm: algorithm === 2 ? 'PBKDF2' : 'Unknown',
                    iterations: iterations,
                    isWeak: (algorithm !== 2 || iterations < 10000)
                });
            }
        });
    } catch(err) {}
}

function printSummary() {
    console.log('\n=== iOS Crypto Security Analysis Summary ===\n');
    
    console.log('Operations Analyzed:');
    console.log(`- Total Cipher Operations: ${stats.totalCipherOperations}`);
    console.log(`- Total Hash Operations: ${stats.totalHashOperations}`);
    console.log(`- Total Key Derivation Operations: ${stats.totalKeyDerivationOperations}`);
    
    if(stats.weakCiphersFound.size > 0) {
        console.log('\nWeak Ciphers Used:');
        stats.weakCiphersFound.forEach(cipher => console.log(`- ${cipher}`));
    }
    
    if(stats.weakModesFound.size > 0) {
        console.log('\nWeak Modes Used:');
        stats.weakModesFound.forEach(mode => console.log(`- ${mode}`));
    }
    
    if(stats.weakHashesFound.size > 0) {
        console.log('\nWeak Hashes Used:');
        stats.weakHashesFound.forEach(hash => console.log(`- ${hash}`));
    }
    
    if(stats.keyReuse > 0 || stats.ivReuse > 0) {
        console.log('\nKey/IV Reuse Detected:');
        console.log(`- Keys reused: ${stats.keyReuse} times`);
        console.log(`- IVs reused: ${stats.ivReuse} times`);
    }
    
    if(stats.pbkdf2WeakIterations > 0) {
        console.log('\nWeak Key Derivation:');
        console.log(`- PBKDF2 with weak iteration count: ${stats.pbkdf2WeakIterations} instances`);
    }

    console.log('\n=======================================');
}

// Initialize hooks
attachCCCrypt();
attachHashingHooks();
attachKeyDerivation();

// Export summary function to global scope
globalThis.summary = function() {
    console.log('\n=== iOS Crypto Security Analysis Summary ===\n');
    
    console.log('Operations Analyzed:');
    console.log(`- Total Cipher Operations: ${stats.totalCipherOperations}`);
    console.log(`- Total Hash Operations: ${stats.totalHashOperations}`);
    console.log(`- Total Key Derivation Operations: ${stats.totalKeyDerivationOperations}`);
    
    if(stats.weakCiphersFound.size > 0) {
        console.log('\nWeak Ciphers Used:');
        stats.weakCiphersFound.forEach(cipher => console.log(`- ${cipher}`));
    }
    
    if(stats.weakModePairs.size > 0) {
        console.log('\nWeak Mode Combinations:');
        stats.weakModePairs.forEach(pair => console.log(`- ${pair}`));
    }
    
    if(stats.weakHashesFound.size > 0) {
        console.log('\nWeak Hashes Used:');
        stats.weakHashesFound.forEach(hash => console.log(`- ${hash}`));
    }
    
    if(stats.keyReuse > 0 || stats.ivReuse > 0) {
        console.log('\nKey/IV Reuse Detected:');
        console.log(`- Keys reused: ${stats.keyReuse} times`);
        console.log(`- IVs reused: ${stats.ivReuse} times`);
    }
    
    if(stats.pbkdf2WeakIterations > 0) {
        console.log('\nWeak Key Derivation:');
        console.log(`- PBKDF2 with weak iteration count: ${stats.pbkdf2WeakIterations} instances`);
    }

    console.log('\n=======================================');
};

console.log("[*] Type 'summary()' to see the crypto analysis results");
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-679625298 @sdcampbell/ios-analyze-crypto-function-security
