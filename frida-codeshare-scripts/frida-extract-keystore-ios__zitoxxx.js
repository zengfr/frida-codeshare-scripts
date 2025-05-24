
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1395096061 @zitoxxx/frida-extract-keystore-ios
/*
author: zitoxxx
usage: frida -U -f com.app.example -l frida-extract-keystore-ios
       Hooks the iOS function 'SecPKCS12Import' to extract and dump the certificate file and its corresponding password
       */
const security = Module.findExportByName(null, 'SecPKCS12Import');
if (security !== null) {
    Interceptor.attach(security, {
        onEnter: function(args) {
            const certData = new ObjC.Object(args[0]);
            const password = new ObjC.Object(args[1]);

            const dataLength = certData.length();
            const dataPtr = certData.bytes();

            const dataByteArray = Memory.readByteArray(dataPtr, dataLength);

            const tmpDir = ObjC.classes.NSFileManager.defaultManager().temporaryDirectory().path();
            const filePath = tmpDir.stringByAppendingPathComponent_('cert.p12');

            try {
                const file = new File(filePath.toString(), "wb");
                file.write(dataByteArray);
                file.flush();
                file.close();

                console.log('\r\n');
                console.log('Certificate data: ' + certData.toString());
                console.log('Certificate password: ' + JSON.stringify(password.toString(), null, 2));
                console.log('Certificate Data dumped to ' + filePath);
            } catch (error) {
                console.error('Error when writing data to file: ', error);
            }
        },
        onLeave: function(retval) {
            // console.log('SecPKCS12Import returned: ' + retval.toString());
        }
    });
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1395096061 @zitoxxx/frida-extract-keystore-ios
