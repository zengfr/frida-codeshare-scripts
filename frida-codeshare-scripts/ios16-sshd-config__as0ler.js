
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1235688670 @as0ler/ios16-sshd-config
const SSHD_PLIST = '/Library/LaunchDaemons/com.openssh.sshd.plist';
const FRIDA_PLIST = '/Library/LaunchDaemons/re.frida.server.plist';
const DROPBEAR_RSA = '/private/var/dropbear_rsa_host_key';

const _popen = new NativeFunction(Module.getExportByName(null, 'popen'), 'pointer', ['pointer', 'pointer']);
const pclose = new NativeFunction(Module.getExportByName(null, 'pclose'), 'int', ['pointer']);
const fileno = new NativeFunction(Module.getExportByName(null, 'fileno'), 'int', ['pointer']);

//unloadDropbear();
fixSshd();
fixFrida();
console.log('Reboot the device with palera1n -f to have sshd running on 22/tcp');

function fixFrida() {
  const currentPlist = File.readAllText(FRIDA_PLIST);
  if (!currentPlist.includes('LimitLoadToSessionType')) {
    console.log('[*] Frida looks good');
    return;
  }

  const patchedPlist = currentPlist.replace('\n\t<key>LimitLoadToSessionType</key>\n\t<string>System</string>', '');
  File.writeAllText(FRIDA_PLIST, patchedPlist);
  console.log('[*] Frida Plist patched');
}

function fixSshd() {
  const currentPlist = File.readAllText(SSHD_PLIST);
  if (currentPlist.includes('RunAtLoad')) {
    console.log('[*] SSH Server looks good');
    return;
  }

  const patchedPlist = currentPlist.replace(/^<\/dict>$/m, '\n    <key>RunAtLoad</key>\n    <true/>\n</dict>');
  File.writeAllText(SSHD_PLIST, patchedPlist);
  console.log('[*] SSHd Plist patched');
}

async function unloadDropbear() {
  try {
    await _run(`cp ${DROPBEAR_RSA} /var/root/. 2>&1`);
    await _run(`rm ${DROPBEAR_RSA} 2>&1`);
  } catch (e) {
    console.error(e);
  }
  console.log('[*] Dropbear unloaded');
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
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1235688670 @as0ler/ios16-sshd-config
