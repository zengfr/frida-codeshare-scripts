
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-601322067 @Solaree/frida-script-for-discord-stable
const inet_addr = new NativeFunction(Module.findExportByName('libc.so', 'inet_addr'), 'int', ['pointer']);
const ntohs = new NativeFunction(Module.findExportByName('libc.so', 'ntohs'), 'uint16', ['uint16']);
const libc_send = new NativeFunction(Module.findExportByName('libc.so', 'send'), 'int', ['int', 'pointer', 'int', 'int']);
const libc_recv = new NativeFunction(Module.findExportByName('libc.so', 'recv'), 'int', ['int', 'pointer', 'int', 'int']);


const host = "192.168.0.102"; // IP
const port = 9339; // PORT



function toast(toastText) {
Java.perform(function() { 
var javaa = Java.use('android.app.ActivityThread').currentApplication().getApplicationContext();

Java.scheduleOnMainThread(function() {
var toast = Java.use("android.widget.Toast");
toast.makeText(javaa, Java.use("java.lang.String").$new(toastText), 1).show();
});
});
}

function setupConnecting() {
    Interceptor.attach(Module.findExportByName('libc.so', 'connect'), {
        onEnter: function(args) {
            if (ntohs(args[1].add(2).readU16()) == 9339) {
                args[1].add(4).writeInt(inet_addr(Memory.allocUtf8String(host)));
                args[1].add(2).writeInt(ntohs(port));
            }
        }
    });
}

function sendMessage() {
    var msg = `[INFO] Connected to ${host}:${port}`;
    send(msg);
}


function recvMessage(args) {
    const read_inet_addr = inet_addr(args[1].add(4).readInt());
    const read_ntohs_port = ntohs(args[1].add(2).readU16());
    const msg = `[INFO] Recived msg from ${read_inet_addr}:${read_ntohs_port}\nMessage content: `;

    var data = recv(function(data) {
        return data.type === "message";
    });

    setTimeout(function() {
        toast(msg + data.payload);
    }, 0);
}

setupConnecting();
sendMessage();

toast("Client by pon#5973");


Interceptor.attach(libc_recv, {
    onEnter: function(args) {
        if (args[0].toInt32() === 4) { // The file descriptor for the connected socket
            while (true) {
                recvMessage(args);
            }
        }
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-601322067 @Solaree/frida-script-for-discord-stable
