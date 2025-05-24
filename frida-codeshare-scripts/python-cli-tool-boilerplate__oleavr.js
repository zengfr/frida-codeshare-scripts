
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-95780373 @oleavr/python-cli-tool-boilerplate
import codecs
from frida.application import ConsoleApplication

class MyApp(ConsoleApplication):
    def __init__(self):
        ConsoleApplication.__init__(self)

    def _usage(self):
        return "usage: %prog [options] target"

    def _initialize(self, parser, options, args):
        pass

    def _needs_target(self):
        return True

    def _start(self):
        # If you want to use V8 instead of Duktape
        #self._session.enable_jit()
        with codecs.open('agent.js', 'r', 'utf-8') as f:
            source = f.read()
        self._script = self._session.create_script(source)
        self._script.on('message', self._on_message)
        self._script.load()
        # If you want to call a method you exported through https://www.frida.re/docs/javascript-api/#rpc
        #self._update_status("Initializing...")
        #self._script.exports.init()
        self._update_status("Ready")

    def _on_message(self, message, data):
        if message['type'] == 'send':
            print(message['payload'])
        else:
            print('on_message:', message)


if __name__ == '__main__':
    app = MyApp()
    app.run()
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-95780373 @oleavr/python-cli-tool-boilerplate
