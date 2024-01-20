
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1977654126 @lolicon/conscrypt-ca
Java.perform(() => {
  const Log = Java.use('android.util.Log')
  const Exception = Java.use('java.lang.Exception')
  Java.use(
    'com.android.org.conscrypt.ConscryptEngineSocket$2'
  ).checkServerTrusted.overloads.forEach((overload) => {
    overload.implementation = function (...args) {
      console.log(...args)
    }
  })
})

console.log(`ready to go`)
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1977654126 @lolicon/conscrypt-ca
