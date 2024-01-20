
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-996202087 @oleavr/read-std-string
/*
 * Note: Only compatible with libc++, though libstdc++'s std::string is a lot simpler.
 */

function readStdString (str) {
  const isTiny = (str.readU8() & 1) === 0;
  if (isTiny) {
    return str.add(1).readUtf8String();
  }

  return str.add(2 * Process.pointerSize).readPointer().readUtf8String();
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-996202087 @oleavr/read-std-string
