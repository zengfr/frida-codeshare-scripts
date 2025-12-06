
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1729937345 @muhammadhikmahhusnuzon/bypass-talsec-rasp-and-root-detection
console.log("[.] Starting Flutter Talsec Bypass Script...");

Java.perform(function() {

    /**
     * ───────────────────────────────────────────────
     * 1. BYPASS EVENT CHANNEL TALSEC (Flutter Plugin)
     * ───────────────────────────────────────────────
     * Neutralizes 'talsec.app/freerasp/events' EventChannel
     * so no threat events are propagated to Dart side.
     */
    try {
        const EventChannel = Java.use('io.flutter.plugin.common.EventChannel');
        const StreamHandler = Java.use('io.flutter.plugin.common.EventChannel$StreamHandler');

        EventChannel.setStreamHandler.implementation = function(handler) {
            let channelName = null;
            let obfuscatedFieldName = null;

            try {
                const fields = this.getClass().getDeclaredFields();
                for (let i = 0; i < fields.length; i++) {
                    const field = fields[i];
                    field.setAccessible(true);
                    const potentialName = field.get(this);
                    if (potentialName && potentialName.toString() === 'talsec.app/freerasp/events') {
                        channelName = potentialName.toString();
                        obfuscatedFieldName = field.getName();
                        break;
                    }
                }
            } catch (e) {
                console.log('[-] Failed to inspect EventChannel fields: ' + e.message);
            }

            if (channelName) {
                console.log(`[+] Found Talsec event channel ('${obfuscatedFieldName}'). Neutralizing stream handler.`);

                const MyStreamHandler = Java.registerClass({
                    name: 'com.example.MyStreamHandler',
                    implements: [StreamHandler],
                    methods: {
                        onListen: function(args, events) {
                            console.log('[+] Talsec StreamHandler.onListen called. Swallowing events.');
                        },
                        onCancel: function(args) {
                            console.log('[+] Talsec StreamHandler.onCancel called.');
                        }
                    }
                });

                this.setStreamHandler(MyStreamHandler.$new());
                return;
            }

            // If not Talsec, proceed as usual
            this.setStreamHandler(handler);
        };
    } catch (err) {
        console.log('[-] Failed to hook EventChannel: ' + err.message);
    }


    /**
     * ───────────────────────────────────────────────
     * 2. ROOT DETECTION BYPASS - FILE PATHS
     * ───────────────────────────────────────────────
     * Override File(String path) constructor to fake
     * existence of known root binaries.
     */
    try {
        var File = Java.use('java.io.File');
        var suPaths = [
            "/system/app/Superuser.apk", "/sbin/su", "/system/bin/su",
            "/system/xbin/su", "/data/local/xbin/su", "/data/local/bin/su",
            "/system/sd/xbin/su", "/system/bin/failsafe/su", "/data/local/su",
            "/su/bin/su", "/su/xbin/su", "/su/sbin/su", "/system/su",
            "/system/usr/we-need-root/su", "/cache/su", "/data/su", "/dev/su"
        ];

        File.$init.overload('java.lang.String').implementation = function(path) {
            if (suPaths.indexOf(path) > -1) {
                console.log('[+] Bypassing root check for file: ' + path);
                return this.$init.call(this, '/nonexistent');
            }
            return this.$init.call(this, path);
        };
    } catch (err) {
        console.log('[-] Root detection bypass (File) failed: ' + err.message);
    }


    /**
     * ───────────────────────────────────────────────
     * 3. DEBUGGER DETECTION BYPASS
     * ───────────────────────────────────────────────
     * Prevent app from detecting attached debugger.
     */
    try {
        var Debug = Java.use('android.os.Debug');
        Debug.isDebuggerConnected.implementation = function() {
            console.log('[+] Bypassing Debug.isDebuggerConnected()');
            return false;
        };
    } catch (err) {
        console.log('[-] Debugger detection bypass failed: ' + err.message);
    }


    /**
     * ───────────────────────────────────────────────
     * 4. EXIT PREVENTION HOOKS
     * ───────────────────────────────────────────────
     * Prevent the app from forcefully exiting.
     */
    try {
        const System = Java.use('java.lang.System');
        System.exit.implementation = function(status) {
            console.log(`[+] Bypassing System.exit(${status})`);
        };
    } catch (err) {
        console.log('[-] System.exit bypass failed: ' + err.message);
    }

    try {
        const Process = Java.use('android.os.Process');
        Process.killProcess.implementation = function(pid) {
            console.log(`[+] Bypassing Process.killProcess(${pid})`);
        };
    } catch (err) {
        console.log('[-] Process.killProcess bypass failed: ' + err.message);
    }


    /**
     * ───────────────────────────────────────────────
     * 5. ROOT DETECTION BYPASS - RUNTIME EXEC
     * ───────────────────────────────────────────────
     * Prevent Runtime.exec("su") from succeeding.
     */
    try {
        const Runtime = Java.use('java.lang.Runtime');
        const exec = Runtime.exec.overload('java.lang.String');

        exec.implementation = function(command) {
            if (command.includes('su')) {
                console.log(`[+] Bypassing root check (Runtime.exec): ${command}`);
                throw Java.use('java.io.IOException').$new('Cannot run program "su", no such file or directory');
            }
            return exec.call(this, command);
        };
    } catch (err) {
        console.log('[-] Runtime.exec bypass failed: ' + err.message);
    }

});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1729937345 @muhammadhikmahhusnuzon/bypass-talsec-rasp-and-root-detection
