
//https://github.com/zengfr/frida-codeshare-scripts
//1919198871 @jthuraisamy/titanium-asset-extractor
#!/usr/bin/python
# -*- coding: utf-8 -*-

"""
titanium-asset-extractor.py: Dump encrypted assets from Titanium-built iOS apps via Frida.

Author:  Jackson Thuraisamy (2016)
Licence: MIT
"""

import re
import os
import sys
import time
import argparse

import frida


class TitaniumAssetDumper:

    def __init__(self, app_name, output_dir):
        self.app_name = app_name
        self.output_dir = output_dir
        self.session = self._init_session()
        self._range_data = None

    def _init_session(self):
        try:
            return frida.get_usb_device().attach(self.app_name)
        except frida.ProcessNotFoundError:
            print("Waiting for %s...  Is the app open?" % self.app_name)
            time.sleep(0.5)
            return self._init_session()
        except frida.TimedOutError:
            print("Timed out.  Is the device connected?")
            sys.exit(1)

    def dump_static(self, index=0):
        if not self._range_data:
            for mem_range in self.session.enumerate_ranges('r-x'):
                range_data = self.session.read_bytes(mem_range.base_address, mem_range.size)
                if 'VbackfillEnd' in range_data:
                    self._range_data = range_data
                    break

        file_name, index = self._get_filename_from_memory(self._range_data, index)

        if not hasattr(self, '_has_file_hnd') or self._has_file_hnd:
            self._download_asset(file_name)
            self.dump_static(index)

    @staticmethod
    def _get_filename_from_memory(data, index=0):
        index = data.index('VbackfillEnd') if not index else index
        start = data.index('\x00', index) + 1
        end = data.index('\x00', start)
        file_name = data[start:end]
        next_index = end
        return file_name, next_index

    def dump_dynamic(self):
        script = self.session.create_script('''
            var resolveAppAsset = ObjC.classes.ApplicationRouting["+ resolveAppAsset:"];
            Interceptor.attach(ptr(resolveAppAsset.implementation), {
              onEnter: function (args) {
                send({fileName: ObjC.Object(args[2]).toString()});
              }
            });
        ''')
        script.on('message', self._on_load_asset)
        script.load()

    def _on_load_asset(self, message, data):
        file_name = message['payload']['fileName']
        self._download_asset(file_name)

    def _download_asset(self, file_name):
        session = frida.get_usb_device().attach(self.app_name)
        script = session.create_script('''
            var fileName = "''' + file_name + '''";
            var fileData = ObjC.classes.ApplicationRouting["+ resolveAppAsset:"](fileName);
            var fileString = ObjC.classes.NSString.alloc().initWithData_encoding_(fileData, 4);

            send({
                fileName: fileName,
                fileData: fileString.toString(),
                fileHandle: fileData !== null
            });
        ''')
        script.on('message', self._on_recv_asset)
        script.load()
        session.detach()

    def _on_recv_asset(self, message, data):
        self._has_file_hnd = True if message['payload']['fileHandle'] else False
        if not self._has_file_hnd:
            return

        file_name = message['payload']['fileName']
        file_name = os.path.normpath(os.path.join(self.output_dir, file_name))
        file_name = file_name.replace('_js', '.js')
        file_data = message['payload']['fileData'].encode('utf-8')
        file_dir = os.path.dirname(file_name)

        if not os.path.exists(file_dir):
            os.makedirs(file_dir)

        with open(file_name, 'w') as file_hnd:
            file_hnd.write(file_data)

        print('Received: %s' % file_name)


def main():
    parser = argparse.ArgumentParser(description='Dump encrypted assets from Titanium-built iOS apps via Frida.')
    parser.add_argument('-a', '--app', required=True, help='Application name')
    parser.add_argument('-o', '--dir', required=False, help='Output directory')
    args = parser.parse_args()

    if not args.dir:
        args.dir = "".join([c for c in args.app.replace(' ', '_') if re.match(r'\w', c)])

    tad = TitaniumAssetDumper(args.app, args.dir)
    tad.dump_static()


if __name__ == '__main__':
    main()
//https://github.com/zengfr/frida-codeshare-scripts
//1919198871 @jthuraisamy/titanium-asset-extractor
