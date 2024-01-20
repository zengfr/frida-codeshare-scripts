
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1027470750 @Anof-cyber/flutter-windows-ssl-pinning-bypass-
/**

A Frida script that disables Flutter's TLS verification

Modified version to of   https://github.com/NVISOsecurity/disable-flutter-tls-verification/blob/main/disable-flutter-tls.js

to Support Windows Application

*/

// Configuration object containing patterns to locate the ssl_verify_peer_cert function
// for different platforms and architectures.
var config = {
    "windows":{
        "modulename": "flutter_windows.dll",
        "patterns":{
            "x64": [
                "41 57 41 56 41 55 41 54 56 57 53 48 83 ec 40 48 89 cf 48 8b 05 ba a4 ba 00"
                
            ],
        },
    },
    
};

// Flag to check if TLS validation has already been disabled
var TLSValidationDisabled = false;
var flutterLibraryFound = false;
var tries = 0;
var maxTries = 5;
var timeout = 1000;
disableTLSValidation();


// Main function to disable TLS validation for Flutter
function disableTLSValidation() {

    // Stop if ready
    if (TLSValidationDisabled) return;

    tries ++;
    if(tries > maxTries){
        console.log('[!] Max attempts reached, stopping');
        return;
    }
    
    console.log(`[+] Attempting to find and hook ssl_verify_peer_cert (${tries}/${maxTries})`)

    // Get reference to module. Necessary for iOS, and usefull check for Android
    var platformConfig = config["windows"];
    var m = Process.findModuleByName(platformConfig["modulename"]);

    if (m === null) {
        console.log('[!] Flutter library not found');
        setTimeout(disableTLSValidation, timeout);
        return;
    }
    else{
        // reset counter so that searching for ssl_verify_peer_cert also gets x attempts
        if(flutterLibraryFound == false){
            flutterLibraryFound = true;
            tries = 1;
        }
    }

    if (Process.arch in platformConfig["patterns"])
    {
        var ranges;
        ranges = m.enumerateRanges('r-x')
        
        findAndPatch(ranges, platformConfig["patterns"][Process.arch], Java.available && Process.arch == "arm" ? 1 : 0);
    }
    else
    {
        console.log('[!] Processor architecture not supported: ', Process.arch);
    }

    if (!TLSValidationDisabled)
    {        
        if(tries < maxTries){
            console.log(`[!] Flutter library found, but ssl_verify_peer_cert could not be found.`)
        }
        else
        {
            console.log('[!] ssl_verify_peer_cert not found. Please open an issue at https://github.com/Anof-cyber/Flutter-Windows/issues');
        }
    }
}

// Find and patch the method in memory to disable TLS validation
function findAndPatch(ranges, patterns, thumb) {
   
    ranges.forEach(range => {
        patterns.forEach(pattern => {
            var matches = Memory.scanSync(range.base, range.size, pattern);
            matches.forEach(match => {
                var info = DebugSymbol.fromAddress(match.address)
                console.log(`[+] ssl_verify_peer_cert found at offset: ${info.name}`);
                TLSValidationDisabled = true;
                hook_ssl_verify_peer_cert(match.address.add(thumb));
                console.log('[+] ssl_verify_peer_cert has been patched')
    
            });
            if(matches.length > 1){
                console.log('[!] Multiple matches detected. This can have a negative impact and may crash the app. Please open a ticket')
            }
        });
        
    });
    
    // Try again. disableTLSValidation will not do anything if TLSValidationDisabled = true
    setTimeout(disableTLSValidation, timeout);
}

function isFlutterRange(range){
    var address = range.base
    var info = DebugSymbol.fromAddress(address)
    if(info.moduleName != null){
        if(info.moduleName.toLowerCase().includes("flutter")){
            return true;
        }
    }
    return false;
}

// Replace the target function's implementation to effectively disable the TLS check
function hook_ssl_verify_peer_cert(address) {
    Interceptor.replace(address, new NativeCallback((pathPtr, flags) => {
        return 0;
    }, 'int', ['pointer', 'int']));
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1027470750 @Anof-cyber/flutter-windows-ssl-pinning-bypass-
