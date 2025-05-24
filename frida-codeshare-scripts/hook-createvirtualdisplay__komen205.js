
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1635769986 @komen205/hook-createvirtualdisplay
Java.perform(function() {

      var DisplayManager = Java.use('android.hardware.display.DisplayManager');

      // Hooking the createVirtualDisplay method with the provided overloads
      var overloadCount = DisplayManager.createVirtualDisplay.overloads.length;
      for (var i = 0; i < overloadCount; i++) {
          DisplayManager.createVirtualDisplay.overloads[i].implementation = function() {
              var args = arguments;
              var methodName = 'createVirtualDisplay';
              var signature = '(';
              for (var j = 0; j < args.length; j++) {
                  signature += typeof args[j];
                  if (j < args.length - 1) {
                      signature += ', ';
                  }
              }
              signature += ')';

              console.log(methodName + signature + ' called');

              // Log or manipulate parameters here
              for (var k = 0; k < args.length; k++) {
                  console.log('Argument ' + k + ': ' + args[k]);
              }

              // Call the original method
              return this.createVirtualDisplay.apply(this, args);
          };
      }
  });
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1635769986 @komen205/hook-createvirtualdisplay
