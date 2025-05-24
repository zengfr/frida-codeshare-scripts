
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:605790418 @oleavr/apple-boringssl
/*
 * Example usage:
 *
 * [Remote::remotepairingdeviced ]-> sessions = enumerateSessions()
 * [
 *     "0x93291b6c0"
 * ]
 * [Remote::remotepairingdeviced ]-> dumpSession(sessions[0])
 * {
 *     "protocol": "RemotePairingTunnelProtocol",
 *     "secrets": {
 *         "master": "10 ce 17 55 e4 1a d3 6a 4d 9d 98 6f 6e dc f5 07 95 76 26 3c 3b 60 80 f1 85 95 c5 99 17 a6 0d 7a d8 1c d9 cf bf f5 61 8a f9 91 b3 ee ae 48 33 27"
 *     },
 *     "serverName": null,
 *     "suite": "TLS_AES_128_GCM_SHA256"
 * }
 * [Remote::remotepairingdeviced ]->
 */

const SESSION_MAGIC = 0xb551b551;

const exportSecret = new NativeFunction(
  DebugSymbol.getFunctionByName('boringssl_session_export_secret_with_context'),
  'pointer',
  [
    'pointer',  // boringssl_session_t * session
    'size_t',   // size_t llen
    'pointer',  // const char * label
    'size_t',   // size_t contextlen,
    'pointer',  // const uint8_t * context
    'size_t',   // size_t maxlen
  ]);
const getNegotiatedProtocol = new NativeFunction(
  DebugSymbol.getFunctionByName('boringssl_session_get_negotiated_protocol'),
  'pointer',
  ['pointer', 'pointer']);
const getNegotiatedCiphersuiteName = new NativeFunction(
  DebugSymbol.getFunctionByName('boringssl_session_get_negotiated_ciphersuite_name'),
  'pointer',
  ['pointer']);
const getServerName = new NativeFunction(
  DebugSymbol.getFunctionByName('boringssl_session_get_server_name'),
  'pointer',
  ['pointer']);
const free = new NativeFunction(
  Module.getExportByName('/usr/lib/system/libsystem_malloc.dylib', 'free'),
  'void',
  ['pointer']);

const { pointerSize } = Process;

function enumerateSessions() {
  return Process.enumerateMallocRanges()
      .filter(({ base }) => base.readU32() === SESSION_MAGIC)
      .map(({ base }) => base);
}

function dumpSession(session) {
  const lenBuf = Memory.alloc(pointerSize);
  const protocolBuf = getNegotiatedProtocol(session, lenBuf);
  const protocol = !protocolBuf.isNull() ? protocolBuf.readUtf8String(lenBuf.readPointer().toUInt32()) : null;

  const suiteBuf = getNegotiatedCiphersuiteName(session);
  const suite = !suiteBuf.isNull() ? suiteBuf.readUtf8String() : null;

  const serverNameBuf = getServerName(session);
  const serverName = !serverNameBuf.isNull() ? serverNameBuf.readUtf8String() : null;

  const secrets = {};

  let masterSecret = null;
  const labelBuf = Memory.allocUtf8String('master secret');
  const labelLen = 13;
  const secret = exportSecret(session, labelLen, labelBuf, 0, NULL, 48);
  if (!secret.isNull()) {
    const length = secret.readPointer().toUInt32();
    const data = secret.add(pointerSize).readPointer();
    secrets.master = hexifyArrayBuffer(data.readByteArray(length));

    free(data);
    free(secret);
  }

  return {
    protocol,
    suite,
    serverName,
    secrets
  };
}

function hexifyArrayBuffer(buf) {
  return Array.from(new Uint8Array(buf)).map(hexifyNumber).join(' ');
}

function hexifyNumber(n) {
  const str = n.toString(16);
  return (str.length === 1) ? '0' + str : str;
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:605790418 @oleavr/apple-boringssl
