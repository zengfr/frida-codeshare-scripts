
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1535818017 @oleavr/unix-socket-peer-pid-observer
'use strict';

var pids = {};

Interceptor.attach(Module.findExportByName(null, 'accept'), {
  onLeave: function (retval) {
    var fd = retval.toInt32();
    if (fd !== -1)
      onFileDescriptorActivity(fd);
  }
});

['read', 'write', 'recv', 'recvfrom', 'send', 'sendto'].forEach(function (name) {
  Interceptor.attach(Module.findExportByName(null, name), {
    onEnter: function (args) {
      var fd = args[0].toInt32();
      onFileDescriptorActivity(fd);
    }
  });
});

function onFileDescriptorActivity (fd) {
  if (Socket.type(fd) !== 'unix:stream')
    return;

  var pid = tryGetPeerPid(fd);
  if (pid === null)
    return;
  if (pids[pid] === undefined) {
    pids[pid] = true;
    console.log('New peer PID: ' + pid);
  }
}

var SOL_LOCAL = 0;
var LOCAL_PEERPID = 2;

var getsockopt = new SystemFunction(
    Module.findExportByName(null, 'getsockopt'),
    'int',
    ['int', 'int', 'int', 'pointer', 'pointer']);

function tryGetPeerPid (fd) {
  var buf = Memory.alloc(8);

  var pidPtr = buf;

  var sizePtr = buf.add(4);
  Memory.writeU32(sizePtr, 4);

  const result = getsockopt(fd, SOL_LOCAL, LOCAL_PEERPID, pidPtr, sizePtr);
  if (result.value !== 0)
    return null;

  return Memory.readU32(pidPtr);
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1535818017 @oleavr/unix-socket-peer-pid-observer
