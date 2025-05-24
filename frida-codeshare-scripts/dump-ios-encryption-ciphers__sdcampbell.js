
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-232929061 @sdcampbell/dump-ios-encryption-ciphers
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

// Track keys, IVs and nonces for reuse detection
const seenKeys = new Set();
const seenIVs = new Set();
const seenNonces = new Set();

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
    return Array.from(new Uint8Array(buffer.readByteArray(length)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function extractNonce(ivBuffer) {
    // For CTR mode, first 8 bytes are typically nonce
    return bufferToHex(ivBuffer, 8);
}

function isWeak(alg, mode, keyLength) {
    return weakCiphers.includes(alg) || 
           weakModes.includes(mode) || 
           (weakKeyLengths[alg] && keyLength <= weakKeyLengths[alg]);
}

Interceptor.attach(Module.findExportByName(null, 'CCCrypt'), {
    onEnter: function (args) {
        const op = args[0].toInt32();
        const alg = getAlgorithmName(args[1].toInt32());
        const mode = getModeName(args[2].toInt32());
        const keyLength = args[4].toInt32() * 8;
        const keyPtr = args[3];
        const ivPtr = args[6];
        
        const keyHex = bufferToHex(keyPtr, args[4].toInt32());
        const ivHex = ivPtr.isNull() ? null : bufferToHex(ivPtr, 16);
        const nonce = (mode === 'kCCModeCTR' && ivPtr) ? extractNonce(ivPtr) : null;
        
        const keyReused = seenKeys.has(keyHex);
        const ivReused = ivHex && seenIVs.has(ivHex);
        const nonceReused = nonce && seenNonces.has(nonce);
        
        seenKeys.add(keyHex);
        if (ivHex) seenIVs.add(ivHex);
        if (nonce) seenNonces.add(nonce);

        console.log('[*] Cipher detected:');
        console.log(`    Algorithm: ${alg}`);
        console.log(`    Mode: ${mode}`);
        console.log(`    Key Length: ${keyLength} bits`);
        console.log(`    Operation: ${op === 0 ? 'Encrypt' : 'Decrypt'}`);
        console.log(`    Key: ${keyHex}`);
        console.log(`    IV: ${ivHex || 'None'}`);
        if (nonce) {
            console.log(`    Nonce: ${nonce}`);
            console.log(`    Nonce Reused: ${nonceReused}`);
        }
        console.log(`    Key Reused: ${keyReused}`);
        console.log(`    IV Reused: ${ivReused}`);
        console.log(`    Strength: ${isWeak(alg, mode, keyLength) ? 'Weak' : 'Strong'}`);
        console.log('--------------------');
    }
});

Interceptor.attach(Module.findExportByName(null, 'CCKeyDerivationPBKDF'), {
    onEnter: function (args) {
        const algorithm = args[0].toInt32();
        const iterations = args[5].toInt32();

        console.log('[*] Key Derivation detected:');
        console.log(`    Algorithm: ${algorithm === 2 ? 'PBKDF2' : 'Unknown'}`);
        console.log(`    Iterations: ${iterations}`);
        console.log(`    Strength: ${(algorithm !== 2 || iterations < 10000) ? 'Potentially Weak' : 'Strong'}`);
        console.log('--------------------');
    }
});

console.log('Frida script loaded. Monitoring crypto operations with key/IV/nonce tracking...');
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-232929061 @sdcampbell/dump-ios-encryption-ciphers
