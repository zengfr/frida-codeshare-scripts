
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1008494017 @Thwarakan/hermes-engine-hook-react-native-function-calls
let libhermesBaseAddress = Module.findBaseAddress("libhermes.so");
let hermesRuntimeImplCallAddress = libhermesBaseAddress.add(0x1f3931 - 0x00100000);
let runtimePtr = Module.findExportByName("libhermes.so", "_ZN8facebook6hermes17makeHermesRuntimeERKN6hermes2vm13RuntimeConfigE");
let valueToStringAddr = Module.findExportByName("libjsi.so", "_ZNK8facebook3jsi5Value8toStringERNS0_7RuntimeE");


Interceptor.attach(hermesRuntimeImplCallAddress, {
    onEnter: function(args) {
        console.log("HermesRuntimeImpl::call intercepted");

        // Extracting arguments
        let func = args[1]; // jsi::Function
        let jsThis = args[2]; // jsi::Value
        let jsArgs = args[3]; // jsi::Value
        let count = args[4]; // size_t count

        // Logging arguments
        console.log(`Function: ${func}`);
        console.log(`jsThis: ${jsThis}`);
        console.log(`jsArgs: ${jsArgs}`);
        console.log(`Count: ${count}`);
        console.log(`runtimePtr: ${runtimePtr}`);
        console.log(`valueToStringAddr: ${valueToStringAddr}`);

        // Get the valueToString function address
        let valueToString = new NativeFunction(valueToStringAddr, 'pointer', ['pointer', 'pointer']);

        // Call the valueToString function with jsThis and runtimePtr
        let resultPtr = valueToString(jsThis, runtimePtr);

        // Convert the result pointer to a JavaScript string
        let resultString = Memory.readUtf8String(resultPtr);

        console.log("Value to String Result:", resultString);
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1008494017 @Thwarakan/hermes-engine-hook-react-native-function-calls
