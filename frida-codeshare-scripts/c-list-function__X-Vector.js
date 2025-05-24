
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:359952596 @X-Vector/c-list-function
var moduleName = "Project1.exe"; // Change this if needed

setTimeout(function() {
    var symbols = Module.enumerateSymbols(moduleName);
    console.log("[*] Listing functions in " + moduleName);

    symbols.forEach(function(symbol) {
        if (symbol.type === "function") {
            console.log("[+] Function: " + symbol.name + " at " + symbol.address);
        }
    });
}, 1000);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:359952596 @X-Vector/c-list-function
