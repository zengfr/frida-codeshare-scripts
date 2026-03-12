
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-408355611 @AhmedGamal0011/ios-protections-bypass
// ─── BANNER ────────────────────────────────────────────────────────────────
const Banner = `
 _____                        _       _ _  
|__  /___ _ __ ___  ___ _ __ | | ___ (_) |_
  / // _ \\ '__/ _ \\/ __| '_ \\| |/ _ \\| | __|
 / /|  __/ | | (_) \\__ \\ |_) | | (_) | | |_ 
/____\\___|_|  \\___/|___/ .__/|_|\\___/|_|\\__|
                       |_|                  
Red Team
`;

console.log(Banner);
if (ObjC.available) {

    // ─── SIGNAL MASKING ───────────────────────────────────────────────────────
    try {
        const sigactionSym = Module.findExportByName('libSystem.B.dylib', 'sigaction');
        const SIG_IGN = ptr(1);
        const sa = Memory.alloc(16);
        sa.writePointer(SIG_IGN);
        sa.add(8).writeU32(0);
        sa.add(12).writeU32(0);
        const sigactionFn = new NativeFunction(sigactionSym, 'int', ['int', 'pointer', 'pointer']);
        [5, 6, 11].forEach(s => sigactionFn(s, sa, ptr(0)));
        console.log('[*] Signals masked');
    } catch (e) {
        console.log('[-] Signal masking: ' + e);
    }

    const JB_PATHS = [
        '/Applications/Cydia.app', '/Applications/blackra1n.app', '/Applications/FakeCarrier.app',
        '/Applications/Icy.app', '/Applications/IntelliScreen.app', '/Applications/MxTube.app',
        '/Applications/RockApp.app', '/Applications/SBSettings.app', '/Applications/WinterBoard.app',
        '/Applications/Snoop-itConfig.app', '/Applications/terminal.app', '/Applications/Terminal.app',
        '/Applications/iFile.app', '/Applications/Activator.app', '/Applications/checkra1n.app',
        '/Applications/Sileo.app', '/Applications/FlyJB.app', '/Applications/Zebra.app',
        '/Applications/MewSeek.app', '/Applications/OmniStat.app', '/Applications/Poof.app',
        '/var/checkra1n.dmg', '/Library/MobileSubstrate', '/Library/BawAppie',
        '/Library/PreferenceBundles', '/Library/Frameworks/CydiaSubstrate.framework',
        '/private/var/lib/apt', '/private/var/lib/cydia', '/private/var/stash',
        '/private/var/tmp/cydia.log', '/private/var/mobile/Library/SBSettings',
        '/private/var/Users/', '/private/var/cache/apt', '/private/var/log/syslog',
        '/private/var/root/Media/Cydia', '/private/etc/apt', '/private/etc/dpkg',
        '/private/etc/ssh', '/var/lib/cydia', '/var/lib/apt', '/var/lib/dpkg',
        '/var/log/apt', '/var/cache/apt', '/var/binpack', '/var/tmp/cydia.log',
        '/usr/sbin/sshd', '/usr/sbin/frida-server', '/usr/bin/ssh', '/usr/bin/sshd',
        '/usr/bin/cycript', '/usr/bin/checkra1n', '/usr/bin/frida-server',
        '/usr/lib/libcycript.dylib', '/usr/lib/libjailbreak.dylib',
        '/usr/lib/libhooker.dylib', '/usr/lib/libsubstitute.dylib',
        '/usr/lib/substrate', '/usr/lib/TweakInject', '/usr/lib/ABDYLD.dylib',
        '/usr/lib/ABSubLoader.dylib', '/usr/lib/libfrida-core.dylib',
        '/usr/libexec/cydia', '/usr/libexec/sftp-server', '/usr/libexec/ssh-keysign',
        '/usr/local/bin/cycript', '/usr/share/jailbreak',
        '/bin/bash', '/bin/sh', '/bin/su', '/etc/apt', '/etc/ssh',
        '/.bootstrapped_electra', '/.installed_unc0ver', '/.cydia_no_stash',
        '/jb/', '/var/jb',
        '/System/Library/LaunchDaemons/com.ikey.bbot.plist',
        '/System/Library/LaunchDaemons/com.saurik.Cydia.Startup.plist',
        '/System/Library/Caches/apticket.der',
        '/var/mobile/Library/Preferences/me.jjolano.shadow.plist',
        '/var/mobile/Library/Preferences/ABPattern',
        '/var/mobile/Library/Preferences/com.saurik.CyDelete.plist',
    ];
    const READONLY_PATHS = ['/', '/private', '/bin', '/usr', '/etc', '/lib', '/sbin'];

    function isJBPath(p) {
        if (!p) return false;
        for (let i = 0; i < JB_PATHS.length; i++)
            if (p.indexOf(JB_PATHS[i]) !== -1) return true;
        return false;
    }

    function isRootFSPath(p) {
        if (!p) return false;
        for (let i = 0; i < READONLY_PATHS.length; i++)
            if (p === READONLY_PATHS[i] || p.indexOf(READONLY_PATHS[i] + '/') === 0) return true;
        return false;
    }

    function safeReadPath(p) {
        try {
            if (!p || p.isNull()) return null;
            const v = p.toInt32();
            if (v === -1 || v === -2) return null;
            return p.readUtf8String();
        } catch (_) {
            return null;
        }
    }

    const replacedAddrs = new Set();

    function safeReplace(sym, name, cb, ret, args) {
        try {
            const addr = sym.toString();
            if (replacedAddrs.has(addr)) return;
            replacedAddrs.add(addr);
            Interceptor.replace(sym, new NativeCallback(cb, ret, args));
            console.log('[*] Replaced ' + name);
        } catch (e) {
            console.log('[-] Failed ' + name + ': ' + e);
        }
    }


    // ─── TARGET: jailbreak_root_detection Swift plugin — ALL symbols ──────────
    // Replace every exported symbol from the framework so nothing executes
    try {
        const jbModule = Process.findModuleByName('jailbreak_root_detection');
        if (jbModule) {
            console.log('[*] Found jailbreak_root_detection @ ' + jbModule.base);
            jbModule.enumerateExports().forEach(exp => {
                if (exp.type !== 'function') return;
                try {
                    const addr = exp.address.toString();
                    if (replacedAddrs.has(addr)) return;
                    replacedAddrs.add(addr);

                    // For the handle(_:result:) function — call result with false
                    if (exp.name.indexOf('handle') !== -1 && exp.name.indexOf('result') !== -1) {
                        Interceptor.attach(exp.address, {
                            onEnter(args) {
                                // args[1] = FlutterMethodCall, args[2] = result block
                                // We'll intercept in onLeave via the result block approach
                                this.resultBlock = args[2];
                                try {
                                    const call = ObjC.Object(args[1]);
                                    this.methodName = call.method().toString();
                                    console.log('[+] JB plugin handle() method: ' + this.methodName);
                                } catch (_) {}
                            },
                            onLeave(retval) {
                                // Result already sent by now; nothing to do here
                            }
                        });
                        console.log('[*] Attached to JB handle: ' + exp.name);
                        return;
                    }

                    // For register(with:) — the one that kills us — replace entirely with no-op
                    // But we MUST still register a method channel handler, otherwise Flutter crashes
                    // Solution: replace with a stub that sets up a channel returning false
                    if (exp.name.indexOf('register') !== -1 && exp.name.indexOf('with') !== -1) {
                        Interceptor.replace(exp.address, new NativeCallback(function(registrar) {
                            console.log('[+] JB register(with:) — replaced with safe stub');
                            // Set up a fake FlutterMethodChannel that always returns false
                            try {
                                const FlutterMethodChannel = ObjC.classes.FlutterMethodChannel;
                                const NSString = ObjC.classes.NSString;

                                // Get the messenger from registrar
                                const reg = ObjC.Object(registrar);
                                const messenger = reg.messenger();

                                const channelName = NSString.stringWithString_('jailbreak_root_detection');
                                const codec = ObjC.classes.FlutterStandardMethodCodec.sharedInstance();
                                const channel = FlutterMethodChannel.methodChannelWithName_binaryMessenger_codec_(
                                    channelName, messenger, codec
                                );

                                // Register a handler that always returns false for any method call
                                const handler = new ObjC.Block({
                                    retType: 'void',
                                    argTypes: ['object', 'pointer'],
                                    implementation: function(call, resultPtr) {
                                        try {
                                            const methodCall = ObjC.Object(call);
                                            const method = methodCall.method().toString();
                                            console.log('[+] JB channel call intercepted: ' + method + ' -> returning false');
                                            // Call result(false) — NSNumber false = @0
                                            const resultBlock = new ObjC.Block(ptr(resultPtr));
                                            const nsNum = ObjC.classes.NSNumber.numberWithBool_(0);
                                            resultBlock.implementation(nsNum);
                                        } catch (e) {
                                            console.log('[-] Handler error: ' + e);
                                        }
                                    }
                                });

                                channel.setMethodCallHandler_(handler);
                                console.log('[+] Fake JB channel registered — always returns false');
                            } catch (e) {
                                console.log('[-] Stub setup error: ' + e);
                            }
                        }, 'void', ['pointer']));
                        console.log('[*] Replaced JB register: ' + exp.name);
                        return;
                    }

                    // All other functions in the framework — replace with no-ops
                    Interceptor.replace(exp.address, new NativeCallback(function() {
                        // Silent no-op for all other JB detection functions
                    }, 'void', []));

                } catch (_) {}
            });
        } else {
            console.log('[-] jailbreak_root_detection module not found — trying by path');
        }
    } catch (e) {
        console.log('[-] JB module hooks: ' + e);
    }


    // ─── TARGET: safe_device framework ───────────────────────────────────────
    try {
        const sdModule = Process.findModuleByName('safe_device');
        if (sdModule) {
            console.log('[*] Found safe_device @ ' + sdModule.base);
            sdModule.enumerateExports().forEach(exp => {
                if (exp.type !== 'function') return;
                try {
                    const addr = exp.address.toString();
                    if (replacedAddrs.has(addr)) return;
                    replacedAddrs.add(addr);

                    if (exp.name.indexOf('register') !== -1 && exp.name.indexOf('with') !== -1) {
                        Interceptor.replace(exp.address, new NativeCallback(function(registrar) {
                            console.log('[+] safe_device register(with:) — no-op stub');
                            try {
                                const FlutterMethodChannel = ObjC.classes.FlutterMethodChannel;
                                const reg = ObjC.Object(registrar);
                                const messenger = reg.messenger();
                                const channelName = ObjC.classes.NSString.stringWithString_('safe_device');
                                const codec = ObjC.classes.FlutterStandardMethodCodec.sharedInstance();
                                const channel = FlutterMethodChannel.methodChannelWithName_binaryMessenger_codec_(
                                    channelName, messenger, codec
                                );
                                const handler = new ObjC.Block({
                                    retType: 'void',
                                    argTypes: ['object', 'pointer'],
                                    implementation: function(call, resultPtr) {
                                        try {
                                            const resultBlock = new ObjC.Block(ptr(resultPtr));
                                            resultBlock.implementation(ObjC.classes.NSNumber.numberWithBool_(0));
                                            console.log('[+] safe_device channel call -> false');
                                        } catch (_) {}
                                    }
                                });
                                channel.setMethodCallHandler_(handler);
                            } catch (e) {
                                console.log('[-] safe_device stub: ' + e);
                            }
                        }, 'void', ['pointer']));
                        return;
                    }

                    Interceptor.replace(exp.address, new NativeCallback(function() {}, 'void', []));
                } catch (_) {}
            });
        }
    } catch (e) {}


    // ─── TARGET: DTTJailbreakDetection ───────────────────────────────────────
    try {
        const dttModule = Process.findModuleByName('DTTJailbreakDetection');
        if (dttModule) {
            console.log('[*] Found DTTJailbreakDetection @ ' + dttModule.base);
            dttModule.enumerateExports().forEach(exp => {
                if (exp.type !== 'function') return;
                try {
                    const addr = exp.address.toString();
                    if (replacedAddrs.has(addr)) return;
                    replacedAddrs.add(addr);
                    Interceptor.replace(exp.address, new NativeCallback(function() {
                        return 0;
                    }, 'int', []));
                } catch (_) {}
            });
        }
    } catch (e) {}


    // ─── IOSSecuritySuite ─────────────────────────────────────────────────────
    [
        '$s16IOSSecuritySuiteAAC13amIJailbrokenSbyFZ',
        '$s16IOSSecuritySuiteAAC10amIDebuggedSbyFZ',
        '$s16IOSSecuritySuiteAAC20amIReverseEngineeredSbyFZ',
        '$s16IOSSecuritySuiteAAC15amIRunInEmulatorSbyFZ',
        '$s16IOSSecuritySuiteAAC30amIJailbrokenWithFailMessageSbSStyFZ',
        '$s16IOSSecuritySuiteAAC16amIRuntimeIntegrityCorruptedSbyFZ',
    ].forEach(sym => {
        ['_' + sym, sym].forEach(s => {
            try {
                const addr = Module.findExportByName(null, s);
                if (addr) safeReplace(addr, s.substring(0, 40), function() {
                    return 0;
                }, 'bool', []);
            } catch (_) {}
        });
    });

    try {
        const DTT = ObjC.classes.DTTJailbreakDetection;
        if (DTT) Interceptor.attach(DTT['+ isJailbroken'].implementation, {
            onLeave(r) {
                r.replace(ptr(0));
            }
        });
    } catch (e) {}


    // ─── C-LEVEL HOOKS ────────────────────────────────────────────────────────
    ['stat', 'lstat', 'stat64', 'lstat64'].forEach(fn => {
        const sym = Module.findExportByName('libSystem.B.dylib', fn) || Module.findExportByName(null, fn);
        if (!sym) return;
        const orig = new NativeFunction(sym, 'int', ['pointer', 'pointer']);
        safeReplace(sym, fn, function(pp, bp) {
            const path = safeReadPath(pp);
            if (path && isJBPath(path)) {
                try {
                    if (!bp.isNull()) bp.writeByteArray(new Array(144).fill(0));
                } catch (_) {}
                return -1;
            }
            return orig(pp, bp);
        }, 'int', ['pointer', 'pointer']);
    });

    const accessSym = Module.findExportByName('libSystem.B.dylib', 'access');
    if (accessSym) {
        const origA = new NativeFunction(accessSym, 'int', ['pointer', 'int']);
        safeReplace(accessSym, 'access', function(pp, mode) {
            const path = safeReadPath(pp);
            if (!path) return origA(pp, mode);
            if (isJBPath(path)) return -1;
            if (mode === 2 && isRootFSPath(path)) return -1;
            return origA(pp, mode);
        }, 'int', ['pointer', 'int']);
    }

    const faccessatSym = Module.findExportByName('libSystem.B.dylib', 'faccessat');
    if (faccessatSym) {
        const origFa = new NativeFunction(faccessatSym, 'int', ['int', 'pointer', 'int', 'int']);
        safeReplace(faccessatSym, 'faccessat', function(d, pp, mode, flags) {
            const path = safeReadPath(pp);
            if (!path) return origFa(d, pp, mode, flags);
            if (isJBPath(path)) return -1;
            if (mode === 2 && isRootFSPath(path)) return -1;
            return origFa(d, pp, mode, flags);
        }, 'int', ['int', 'pointer', 'int', 'int']);
    }

    ['open', 'open$NOCANCEL'].forEach(fn => {
        const sym = Module.findExportByName('libSystem.B.dylib', fn);
        if (!sym) return;
        const orig = new NativeFunction(sym, 'int', ['pointer', 'int']);
        safeReplace(sym, fn, function(pp, flags) {
            const path = safeReadPath(pp);
            if (path && isJBPath(path)) return -1;
            return orig(pp, flags);
        }, 'int', ['pointer', 'int']);
    });

    ['openat', 'openat$NOCANCEL'].forEach(fn => {
        const sym = Module.findExportByName('libSystem.B.dylib', fn);
        if (!sym) return;
        const orig = new NativeFunction(sym, 'int', ['int', 'pointer', 'int']);
        safeReplace(sym, fn, function(d, pp, flags) {
            const path = safeReadPath(pp);
            if (path && isJBPath(path)) return -1;
            return orig(d, pp, flags);
        }, 'int', ['int', 'pointer', 'int']);
    });

    const fopenSym = Module.findExportByName('libSystem.B.dylib', 'fopen');
    if (fopenSym) {
        const origFopen = new NativeFunction(fopenSym, 'pointer', ['pointer', 'pointer']);
        safeReplace(fopenSym, 'fopen', function(pp, mp) {
            const path = safeReadPath(pp);
            if (path && isJBPath(path)) return ptr(0);
            return origFopen(pp, mp);
        }, 'pointer', ['pointer', 'pointer']);
    }

    ['exit', 'abort'].forEach(fn => {
        const sym = Module.findExportByName('libSystem.B.dylib', fn);
        if (sym) safeReplace(sym, fn, function() {
            console.log('[!] ' + fn + ' BLOCKED');
        }, 'void', fn === 'exit' ? ['int'] : []);
    });

    const raiseSym = Module.findExportByName('libSystem.B.dylib', 'raise');
    if (raiseSym) {
        const origR = new NativeFunction(raiseSym, 'int', ['int']);
        safeReplace(raiseSym, 'raise', function(sig) {
            if ([6, 9, 15].indexOf(sig) !== -1) {
                console.log('[!] raise(' + sig + ') BLOCKED');
                return 0;
            }
            return origR(sig);
        }, 'int', ['int']);
    }

    const killSym = Module.findExportByName('libSystem.B.dylib', 'kill');
    if (killSym) {
        const origK = new NativeFunction(killSym, 'int', ['int', 'int']);
        safeReplace(killSym, 'kill', function(pid, sig) {
            if ([6, 9, 15].indexOf(sig) !== -1) {
                console.log('[!] kill BLOCKED');
                return 0;
            }
            return origK(pid, sig);
        }, 'int', ['int', 'int']);
    }

    const pthreadKillSym = Module.findExportByName('libSystem.B.dylib', 'pthread_kill');
    if (pthreadKillSym) {
        const origPK = new NativeFunction(pthreadKillSym, 'int', ['pointer', 'int']);
        safeReplace(pthreadKillSym, 'pthread_kill', function(t, sig) {
            if ([6, 9, 15].indexOf(sig) !== -1) {
                console.log('[!] pthread_kill BLOCKED');
                return 0;
            }
            return origPK(t, sig);
        }, 'int', ['pointer', 'int']);
    }

    const abortRSym = Module.findExportByName(null, 'abort_with_reason');
    if (abortRSym) safeReplace(abortRSym, 'abort_with_reason', function() {
        console.log('[!] abort_with_reason BLOCKED');
    }, 'void', ['int', 'uint64', 'pointer', 'uint64']);

    const assertSym = Module.findExportByName(null, '__assert_rtn');
    if (assertSym) safeReplace(assertSym, '__assert_rtn', function() {}, 'void', ['pointer', 'pointer', 'int', 'pointer']);

    const sysctlSym = Module.findExportByName('libSystem.B.dylib', 'sysctl');
    if (sysctlSym) {
        const origSysctl = new NativeFunction(sysctlSym, 'int', ['pointer', 'uint', 'pointer', 'pointer', 'pointer', 'size_t']);
        safeReplace(sysctlSym, 'sysctl', function(name, namelen, oldp, oldlenp, newp, newlen) {
            const ret = origSysctl(name, namelen, oldp, oldlenp, newp, newlen);
            try {
                if (!name.isNull() && namelen >= 3 && name.readS32() === 1 && name.add(4).readS32() === 14 && !oldp.isNull()) {
                    const fp = oldp.add(8);
                    const f = fp.readU32();
                    if (f & 0x800) {
                        fp.writeU32(f & ~0x800);
                        console.log('[+] sysctl P_TRACED cleared');
                    }
                }
            } catch (_) {}
            return ret;
        }, 'int', ['pointer', 'uint', 'pointer', 'pointer', 'pointer', 'size_t']);
    }


    // ─── NSFileManager ────────────────────────────────────────────────────────
    try {
        const FM = ObjC.classes.NSFileManager;
        ['- fileExistsAtPath:', '- fileExistsAtPath:isDirectory:',
            '- isWritableFileAtPath:', '- isReadableFileAtPath:',
            '- attributesOfItemAtPath:error:'
        ].forEach(sel => {
            try {
                Interceptor.attach(FM[sel].implementation, {
                    onEnter(args) {
                        try {
                            this.path = ObjC.Object(args[2]).toString();
                        } catch (_) {
                            this.path = '';
                        }
                    },
                    onLeave(retval) {
                        if (!this.path) return;
                        if (sel.indexOf('isWritable') !== -1 && isRootFSPath(this.path)) {
                            retval.replace(ptr(0));
                            return;
                        }
                        if (isJBPath(this.path)) retval.replace(ptr(0));
                    }
                });
            } catch (_) {}
        });
    } catch (e) {}

    try {
        Interceptor.attach(ObjC.classes.UIApplication['- canOpenURL:'].implementation, {
            onEnter(args) {
                try {
                    this.url = ObjC.Object(args[2]).toString();
                } catch (_) {
                    this.url = '';
                }
            },
            onLeave(retval) {
                if (this.url && this.url.toLowerCase().indexOf('cydia') !== -1) retval.replace(ptr(0));
            }
        });
    } catch (e) {}

    const MASK_KW = ['substrate', 'cycript', 'libhooker', 'substitute', 'frida', 'gadget', 'jailbreak'];
    const dylibSym = Module.findExportByName(null, '_dyld_get_image_name');
    if (dylibSym) {
        Interceptor.attach(dylibSym, {
            onLeave(retval) {
                if (retval.isNull()) return;
                try {
                    const n = retval.readUtf8String().toLowerCase();
                    if (MASK_KW.some(k => n.indexOf(k) !== -1))
                        retval.replace(Memory.allocUtf8String('/usr/lib/libobjc.A.dylib'));
                } catch (_) {}
            }
        });
    }

    console.log('[*] All hooks installed');

} else {
    console.log('[-] ObjC runtime not available');
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-408355611 @AhmedGamal0011/ios-protections-bypass
