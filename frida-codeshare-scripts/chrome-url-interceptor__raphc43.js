
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:984451036 @raphc43/chrome-url-interceptor
Java.perform(function () {
  let Tab = Java.use("org.chromium.chrome.browser.tab.Tab");
  let previousUrl = null;

  Tab["getUrl"].implementation = function () {
    let result = this["getUrl"]();
    if (result !== previousUrl) {
      console.log(`Current URL: ${result}`);
      previousUrl = result;
    }
    return result;
  };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:984451036 @raphc43/chrome-url-interceptor
