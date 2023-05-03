
//https://github.com/zengfr/frida-codeshare-scripts
//982424298 @ceres-c/extract-keystore
#!/usr/bin/python3

'''
author: ceres-c
usage: ./frida-extract-keystore.py
       Once the keystore(s) have been exported you have to convert them to PKCS12 using keytool
'''

import frida, sys, time

app_name = 'com.app.mobile'
i = 0
ext = ''

def on_message(message, data):
    global i, ext
    if (message['type'] == 'send' and 'event' in message['payload']):
        if (message['payload']['event'] == '+found'):
            i += 1
            print("\n[+] Hooked keystore" + str(i) + "...")

        elif (message['payload']['event'] == '+type'):
            print("  [+] Cert Type: " + ''.join(message['payload']['certType']))
            if (message['payload']['certType'] == 'PKCS12'):
                ext = '.jks'

        elif (message['payload']['event'] == '+pass'):
            print("  [+] Password: " + ''.join(message['payload']['password']))

        elif (message['payload']['event'] == '+write'):
            print("  [+] Writing to file: keystore" + str(i) + ext)
            f = open('keystore' + str(i) + ext, 'wb')
            f.write(bytes.fromhex(message['payload']['cert']))
            f.close()
    else:
        print(message)

jscode = """
setTimeout(function() {
    Java.perform(function () {
        var keyStoreLoadStream = Java.use('java.security.KeyStore')['load'].overload('java.io.InputStream', '[C');
        /* following function hooks to a Keystore.load(InputStream stream, char[] password) */
        keyStoreLoadStream.implementation = function(stream, charArray) {
            /* sometimes this happen, I have no idea why, tho... */
            if (stream == null) {
                /* just to avoid interfering with app's flow */
                this.load(stream, charArray);
                return;
            }
            /* just to notice the client we've hooked a KeyStore.load */
            send({event: '+found'});
            /* read the buffer stream to a variable */
            var hexString = readStreamToHex (stream);
            /* send KeyStore type to client shell */
            send({event: '+type', certType: this.getType()});
            /* send KeyStore password to client shell */
            send({event: '+pass', password: charArray});
            /* send the string representation to client shell */
            send({event: '+write', cert: hexString});
            /* call the original implementation of 'load' */
            this.load(stream, charArray);
            /* no need to return anything */
        }
    });
},0);
/* following function reads an InputStream and returns an ASCII char representation of it */
function readStreamToHex (stream) {
    var data = [];
    var byteRead = stream.read();
    while (byteRead != -1)
    {
        data.push( ('0' + (byteRead & 0xFF).toString(16)).slice(-2) );
                /* <---------------- binary to hex ---------------> */
        byteRead = stream.read();
    }
    stream.close();
    return data.join('');
}
"""

print("[.] Attaching to device...")
try:
    device = frida.get_usb_device()
except:
    print("[-] Can't attach. Is the device connected?")
    sys.exit()

print("[.] Spawning the app...")
try:
    pid = device.spawn(app_name)
    device.resume(pid)
    time.sleep(1)
except:
    print("[-] Can't spawn the App. Is filename correct?")
    sys.exit()

print("[.] Attaching to process...")
try:
    process = device.attach(pid)
except:
    print("[-] Can't connect to App.")
    sys.exit()

print("[.] Launching js code...")
print("  (run the app until needed, close it and then kill this script)")
script = process.create_script(jscode)
script.on('message', on_message)
script.load()
try:
sys.stdin.read()
except KeyboardInterrupt:
    print ("\nExiting now")
    exit(0)
//https://github.com/zengfr/frida-codeshare-scripts
//982424298 @ceres-c/extract-keystore
