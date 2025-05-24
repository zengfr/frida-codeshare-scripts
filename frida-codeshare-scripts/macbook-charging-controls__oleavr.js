
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1562211095 @oleavr/macbook-charging-controls
/*
 * Inject into PowerUIAgent (SIP must be disabled)
 */

const {
  NSAutoreleasePool,
  PowerUISmartChargeManager,
} = ObjC.classes;

let onComplete;

function forceDesktopMode() {
  withManager(manager => {
    manager.setDesktopMode_withHandler_('DesktopMode', onComplete);
    console.log('Forced desktop mode');
  });
}

function resetDesktopMode() {
  withManager(manager => {
    manager.resetDesktopModeWithHandler_(onComplete);
    console.log('Reset desktop mode');
  });
}

onComplete = new ObjC.Block({
  retType: 'void',
  argTypes: ['int64'],
  implementation(result) {
    console.log(`onComplete() result=${result}`);
  }
});

function enableCharging() {
  withManager(manager => {
    manager.enableCharging();
    console.log('Enabled charging');
  });
}

function disableCharging() {
  withManager(manager => {
    manager.disableCharging();
    console.log('Disabled charging');
  });
}

function withManager(work) {
  const pool = NSAutoreleasePool.alloc().init();
  try {
    const manager = PowerUISmartChargeManager.manager();
    ObjC.schedule(manager.queue(), () => {
      work(manager);
    });
  } finally {
    pool.release();
  }
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1562211095 @oleavr/macbook-charging-controls
