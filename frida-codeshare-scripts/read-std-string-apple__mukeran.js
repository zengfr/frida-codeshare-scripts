
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-228918199 @mukeran/read-std-string-apple
function readStdStringForApple(str) {
    const isLong = (str.add(3 * Process.pointerSize - 1).readU8() & 0b10000000) === 0b10000000;
    if (isLong) {
        return str.readPointer().readUtf8String();
    }

    return str.readUtf8String();
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-228918199 @mukeran/read-std-string-apple
