const SSHD_PLIST = '/Library/LaunchDaemons/com.openssh.sshd.plist';

const _popen = new NativeFunction(Module.getExportByName(null, 'popen'), 'pointer', ['pointer', 'pointer']);
const pclose = new NativeFunction(Module.getExportByName(null, 'pclose'), 'int', ['pointer']);
const fileno = new NativeFunction(Module.getExportByName(null, 'fileno'), 'int', ['pointer']);

function fixPlist() {
  const currentPlist = File.readAllText(SSHD_PLIST);
  if (currentPlist.includes('LimitLoadToSessionType')) {
    console.log('[*] Plist looks good');
    return;
  }

  const patchedPlist = currentPlist.replace(/^<\/dict>$/m, '\n    <key>LimitLoadToSessionType</key>\n    <string>System</string>\n</dict>');
  File.writeAllText(SSHD_PLIST, patchedPlist);
  console.log('[*] Plist patched');
}

async function loadSshd() {
  try {
    await _run(`launchctl load ${SSHD_PLIST} 2>&1`);
  } catch (e) {
    console.error(e);
  }
  console.log('[*] Service loaded');
}

async function unloadSshd() {
  try {
    await _run(`launchctl unload ${SSHD_PLIST} 2>&1`);
  } catch (e) {
    console.error(e);
  }
  console.log('[*] Service unloaded');
}

function run(command) {
  _run(command)
      .catch(e => { console.error(e.stack); });
}

async function _run(command) {
  const file = popen(command, 'r');
  try {
    const stream = new UnixInputStream(fileno(file));
    while (true) {
      const chunk = await stream.read(4096);
      const n = chunk.byteLength;
      if (n === 0)
        break;
      console.log(chunk.unwrap().readCString(n).trimEnd());
    }
  } finally {
    pclose(file);
  }
}

function popen(command, mode) {
  const file = _popen(Memory.allocUtf8String(command), Memory.allocUtf8String(mode));
  if (file.isNull())
    throw new Error('Unable to execute command');
  return file;
}
//https://github.com/zengfr/frida-codeshare-scripts
//1668381158 @oleavr/ios-ssh-diagnostics