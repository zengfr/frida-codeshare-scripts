
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1132760908 @SecFathy/ios-application-information
// Define colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function showBanner() {
    console.log(colors.magenta + `
    ███████╗██████╗ ██╗██████╗  █████╗     ██████╗ ██╗   ██╗███╗   ███╗██████╗ ███████╗██████╗ 
    ██╔════╝██╔══██╗██║██╔══██╗██╔══██╗    ██╔══██╗██║   ██║████╗ ████║██╔══██╗██╔════╝██╔══██╗
    █████╗  ██████╔╝██║██║  ██║███████║    ██║  ██║██║   ██║██╔████╔██║██████╔╝█████╗  ██████╔╝
    ██╔══╝  ██╔══██╗██║██║  ██║██╔══██║    ██║  ██║██║   ██║██║╚██╔╝██║██╔═══╝ ██╔══╝  ██╔══██╗
    ██║     ██║  ██║██║██████╔╝██║  ██║    ██████╔╝╚██████╔╝██║ ╚═╝ ██║██║     ███████╗██║  ██║
    ╚═╝     ╚═╝  ╚═╝╚═╝╚═════╝ ╚═╝  ╚═╝    ╚═════╝  ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝` + colors.reset);
    console.log(colors.cyan + "                                  iOS Memory Analysis Tool v1.0" + colors.reset);
    console.log(colors.green + "                                     Created with ♥ by secfathy" + colors.reset);
    console.log("\n");
}

function getAppInfo() {
    const NSBundle = ObjC.classes.NSBundle;
    const mainBundle = NSBundle.mainBundle();
    const NSProcessInfo = ObjC.classes.NSProcessInfo;
    const processInfo = NSProcessInfo.processInfo();
    
    console.log(colors.yellow + "\n=== Application Info ===" + colors.reset);
    console.log(colors.cyan + "[*] Bundle ID: " + colors.green + mainBundle.bundleIdentifier().toString() + colors.reset);
    console.log(colors.cyan + "[*] App Name: " + colors.green + mainBundle.infoDictionary().objectForKey_('CFBundleName').toString() + colors.reset);
    console.log(colors.cyan + "[*] Version: " + colors.green + mainBundle.infoDictionary().objectForKey_('CFBundleShortVersionString').toString() + colors.reset);
    console.log(colors.cyan + "[*] Build: " + colors.green + mainBundle.infoDictionary().objectForKey_('CFBundleVersion').toString() + colors.reset);
    console.log(colors.cyan + "[*] Process Name: " + colors.green + processInfo.processName().toString() + colors.reset);
    console.log(colors.cyan + "[*] Process ID: " + colors.green + processInfo.processIdentifier() + colors.reset);
}

function getEnvironment() {
    console.log(colors.yellow + "\n=== Environment Variables ===" + colors.reset);
    const NSProcessInfo = ObjC.classes.NSProcessInfo;
    const processInfo = NSProcessInfo.processInfo();
    const env = processInfo.environment();
    const keys = env.allKeys();
    const count = keys.count();
    for (let i = 0; i < count; i++) {
        const key = keys.objectAtIndex_(i);
        const value = env.objectForKey_(key);
        console.log(colors.cyan + `[*] ${key}: ` + colors.green + `${value}` + colors.reset);
    }
}

function monitorNetwork() {
    console.log(colors.yellow + "\n=== Network Monitor Started ===" + colors.reset);
    Interceptor.attach(ObjC.classes.NSURLSession['- dataTaskWithRequest:completionHandler:'].implementation, {
        onEnter: function(args) {
            const request = new ObjC.Object(args[2]);
            console.log(colors.cyan + "[*] URL: " + colors.green + request.URL().toString() + colors.reset);
            console.log(colors.cyan + "[*] Method: " + colors.green + request.HTTPMethod().toString() + colors.reset);
        }
    });
}

function listModules() {
    console.log(colors.yellow + "\n=== Loaded Modules ===" + colors.reset);
    Process.enumerateModules({
        onMatch: function(module) {
            console.log(colors.cyan + "[*] Name: " + colors.green + module.name + colors.reset);
            console.log(colors.cyan + "    Base: " + colors.green + module.base + colors.reset);
            console.log(colors.cyan + "    Size: " + colors.green + module.size + colors.reset);
            console.log(colors.cyan + "    Path: " + colors.green + module.path + colors.reset);
        },
        onComplete: function() {}
    });
}

function getAppPaths() {
    const NSBundle = ObjC.classes.NSBundle;
    const mainBundle = NSBundle.mainBundle();
    const NSFileManager = ObjC.classes.NSFileManager;
    const fileManager = NSFileManager.defaultManager();
    
    console.log(colors.yellow + "\n=== Application Paths ===" + colors.reset);
    const bundlePath = mainBundle.bundlePath().toString();
    console.log(colors.cyan + "[*] Bundle Path: " + colors.green + bundlePath + colors.reset);
    
    const appContainer = bundlePath.substring(0, bundlePath.lastIndexOf('/'));
    const documentsPath = appContainer + "/Documents";
    const libraryPath = appContainer + "/Library";
    const cachesPath = libraryPath + "/Caches";
    
    console.log(colors.cyan + "[*] Documents Path: " + colors.green + documentsPath + colors.reset);
    console.log(colors.cyan + "[*] Library Path: " + colors.green + libraryPath + colors.reset);
    console.log(colors.cyan + "[*] Caches Path: " + colors.green + cachesPath + colors.reset);
    
    console.log(colors.yellow + "\n=== Documents Contents ===" + colors.reset);
    const documentsContents = fileManager.contentsOfDirectoryAtPath_error_(documentsPath, NULL);
    if (documentsContents) {
        const count = documentsContents.count();
        for (let i = 0; i < count; i++) {
            console.log(colors.cyan + "[*] File: " + colors.magenta + documentsContents.objectAtIndex_(i).toString() + colors.reset);
        }
    }
}

function getMemoryInfo() {
    const NSProcessInfo = ObjC.classes.NSProcessInfo;
    const processInfo = NSProcessInfo.processInfo();
    
    console.log(colors.yellow + "\n=== Memory Usage ===" + colors.reset);
    console.log(colors.cyan + "[*] Physical Memory: " + colors.green + (processInfo.physicalMemory() / 1024 / 1024).toFixed(2) + " MB" + colors.reset);

    Process.enumerateRanges('r--', {
        onMatch: function(range) {
            console.log(colors.cyan + "\n[*] Memory Range: " + colors.green + range.base + " - " + range.base.add(range.size) + colors.reset);
            console.log(colors.cyan + "[*] Size: " + colors.green + (range.size / 1024).toFixed(2) + " KB" + colors.reset);
            console.log(colors.cyan + "[*] Protection: " + colors.green + range.protection + colors.reset);
        }
    });
}

function dumpMemory() {
    const NSBundle = ObjC.classes.NSBundle;
    const mainBundle = NSBundle.mainBundle();
    const appContainer = mainBundle.bundlePath().toString().substring(0, mainBundle.bundlePath().toString().lastIndexOf('/'));
    
    console.log(colors.yellow + "\n=== Memory Dump ===" + colors.reset);
    console.log(colors.cyan + "[*] Starting memory dump..." + colors.reset);

    try {
        const date = new Date();
        const timestamp = date.toISOString().replace(/[:.]/g, '-');
        const filename = `memory_dump_${timestamp}.txt`;
        const dumpPath = `${appContainer}/Documents/${filename}`;
        
        let memoryDump = '';
        Process.enumerateRanges('r--', {
            onMatch: function(range) {
                memoryDump += `\n[*] Memory Range: ${range.base} - ${range.base.add(range.size)}\n`;
                memoryDump += `[*] Size: ${range.size} bytes\n`;
                memoryDump += `[*] Protection: ${range.protection}\n`;
                
                try {
                    const bytes = Memory.readByteArray(range.base, Math.min(range.size, 1024));
                    if (bytes !== null) {
                        const hex = Array.from(new Uint8Array(bytes))
                            .map(b => b.toString(16).padStart(2, '0'))
                            .join(' ');
                        memoryDump += "First 1KB Hex dump:\n";
                        memoryDump += hex + "\n";
                    }
                } catch (e) {
                    memoryDump += `[!] Error reading memory: ${e.message}\n`;
                }
                memoryDump += "----------------------------------------\n";
            },
            onComplete: function() {
                const NSString = ObjC.classes.NSString;
                const dump_content = NSString.stringWithString_(memoryDump);
                dump_content.writeToFile_atomically_encoding_error_(dumpPath, true, 4, NULL);
                
                console.log(colors.green + "[*] Memory dump completed successfully!" + colors.reset);
                console.log(colors.cyan + "[*] Saved to: " + colors.green + dumpPath + colors.reset);
            }
        });
        
    } catch(e) {
        console.log(colors.red + "[!] Error during memory dump: " + e.message + colors.reset);
    }
}

function getCurrentActivity() {
    console.log(colors.yellow + "\n=== Current View Information ===" + colors.reset);
    
    ObjC.choose(ObjC.classes.UIWindow, {
        onMatch: function(window) {
            if (window.isKeyWindow()) {
                const rootVC = window.rootViewController();
                if (rootVC) {
                    let currentVC = rootVC;
                    while (currentVC.presentedViewController()) {
                        currentVC = currentVC.presentedViewController();
                    }

                    console.log(colors.cyan + "[*] Current View Controller: " + colors.green + currentVC.$className + colors.reset);
                    
                    const mainView = currentVC.view();
                    if (mainView) {
                        console.log(colors.cyan + "[*] Main View Class: " + colors.green + mainView.$className + colors.reset);
                        console.log(colors.cyan + "\n[*] View Hierarchy:" + colors.reset);
                        listSubviews(mainView, 1);
                    }

                    if (currentVC.$className.indexOf("Navigation") !== -1) {
                        const navVC = currentVC;
                        const viewControllers = navVC.viewControllers();
                        const count = viewControllers.count();
                        
                        console.log(colors.cyan + "\n[*] Navigation Stack:" + colors.reset);
                        for (let i = 0; i < count; i++) {
                            const vc = viewControllers.objectAtIndex_(i);
                            console.log(colors.green + "   └─ " + vc.$className + colors.reset);
                        }
                    }
                }
            }
        },
        onComplete: function() {}
    });
}

function listSubviews(view, depth) {
    const subviews = view.subviews();
    const count = subviews.count();
    const indent = "  ".repeat(depth);
    
    for (let i = 0; i < count; i++) {
        const subview = subviews.objectAtIndex_(i);
        console.log(colors.green + indent + "└─ " + subview.$className + colors.reset);
        
        if (subview.$className === "UIButton") {
            const title = subview.titleLabel().text();
            if (title) {
                console.log(colors.magenta + indent + "   └─ Title: " + title + colors.reset);
            }
        } else if (subview.$className === "UILabel") {
            const text = subview.text();
            if (text) {
                console.log(colors.magenta + indent + "   └─ Text: " + text + colors.reset);
            }
        }
        
        listSubviews(subview, depth + 1);
    }
}

function clearConsole() {
    console.log('\x1Bc');
    console.log(colors.green + "[*] Console cleared!" + colors.reset);
}

// Make commands globally available
global.info = getAppInfo;
global.path = getAppPaths;
global.memory = getMemoryInfo;
global.env = getEnvironment;
global.network = monitorNetwork;
global.modules = listModules;
global.dump = dumpMemory;
global.current = getCurrentActivity;
global.clear = clearConsole;

// Show banner and welcome message
showBanner();
console.log(colors.yellow + "[*] iOS App Inspector Loaded!" + colors.reset);
console.log(colors.cyan + "[*] Available commands:" + colors.reset);
console.log(colors.green + "[*] info() " + colors.reset + "- Show app information");
console.log(colors.green + "[*] path() " + colors.reset + "- Show app paths and list files");
console.log(colors.green + "[*] memory() " + colors.reset + "- Show memory usage");
console.log(colors.green + "[*] env() " + colors.reset + "- Show environment variables");
console.log(colors.green + "[*] network() " + colors.reset + "- Monitor network activity");
console.log(colors.green + "[*] modules() " + colors.reset + "- List loaded modules");
console.log(colors.green + "[*] dump() " + colors.reset + "- Dump memory to file");
console.log(colors.green + "[*] current() " + colors.reset + "- Show current view information");
console.log(colors.green + "[*] clear() " + colors.reset + "- Clear console");
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1132760908 @SecFathy/ios-application-information
