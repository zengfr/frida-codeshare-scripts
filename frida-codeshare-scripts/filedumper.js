Java.perform(function() {
    var openedfile = "";
    var data = {
        "file": "",
        "content": []
    };
    var isOpen = false;
    var index = 0;

    var fos = Java.use('java.io.FileOutputStream');

    var fos_construct_2 = fos.$init.overload('java.lang.String');
    var fos_construct_3 = fos.$init.overload('java.io.File');
    var fos_construct_4 = fos.$init.overload('java.lang.String', 'boolean');
    var fos_construct_5 = fos.$init.overload('java.io.File', 'boolean');

    var fos_write_1 = fos.write.overload('[B', 'int', 'int');

    var fos_close = fos.close;

    function dump(data) {
        send("Got " + data["content"].length + " bytes!");
        var tmp_name = openedfile.split("/");
        tmp_name = tmp_name[tmp_name.length - 1];
        data["file"] = tmp_name;
        send(data);
        data["content"] = [];
        index = 0;
    }

    fos_construct_2.implementation = function(file) {
        var filename = file;
        if (openedfile != filename) {
            openedfile = filename;
            send("File opened for write " + filename);
            isOpen = true;
        }
        return fos_construct_2.call(this, file);
    }

    fos_construct_3.implementation = function(file) {
        var filename = file.getAbsolutePath();
        if (openedfile != filename) {
            openedfile = filename;
            send("File opened for write " + filename);
            isOpen = true;
        }
        return fos_construct_3.call(this, file);
    }

    fos_construct_4.implementation = function(file, true_false) {
        var filename = file;
        if (openedfile != filename) {
            openedfile = filename;
            send("File opened for write " + filename);
            isOpen = true;
        }
        return fos_construct_4.call(this, file, true_false);
    }

    fos_construct_5.implementation = function(file, true_false) {
        var filename = file.getAbsolutePath()
        if (openedfile != filename) {
            openedfile = filename;
            send("File opened for write " + filename);
            isOpen = true;
        }
        return fos_construct_5.call(this, file, true_false);
    }

    fos_write_1.implementation = function(arr, offset, length) {
        var i = 0;
        for (i = offset; i < length; i = i + 1) {
            data["content"][index] = arr[i];
            index = index + 1;
        }
        return fos_write_1.call(this, arr, offset, length);
    }

    fos_close.implementation = function() {
        dump(data);
        return fos_close.call(this);
    }

});

/*
CUSTOM MESSAGE HANDLER IN PYTHON

def on_message(message, data):
    global index, filename
    if message['type'] == 'send':
        if type(message['payload']) == dict:
            with open(message['payload']["file"], "wb") as d:
                for element in message['payload']["content"]:
                        d.write(chr(element%256))
                d.close()
            print "[*] Successfully dumped to {0}".format(message['payload']["file"])
        else:
            print("[*] {0}".format(message['payload'].encode('utf-8')))
    else:
        print(message)
*/
//https://github.com/zengfr/frida-codeshare-scripts
//1275132226 @dzonerzy/filedumper