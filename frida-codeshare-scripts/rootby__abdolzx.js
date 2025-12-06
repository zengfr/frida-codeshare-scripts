
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-983578782 @abdolzx/rootby
Java.perform(function() {
    console.log("[+] SPLASH ACTIVITY BYPASS - Starting");
    
    // 1. تجاوز جميع دوال الفحص في SplashActivity
    var SplashActivity = Java.use("com.nayifat.mobile.SplashActivity");
    
    // تجاوز onCreate
    SplashActivity.onCreate.implementation = function(savedInstanceState) {
        console.log("[+] SplashActivity.onCreate bypassed");
        this.onCreate.call(this, savedInstanceState);
        
        // الانتقال مباشرة إلى الشاشة التالية
        setTimeout(function() {
            Java.perform(function() {
                try {
                    console.log("[+] Attempting to start main activity");
                    // استخدام Intent لبدء Activity الرئيسي
                    var Intent = Java.use("android.content.Intent");
                    var context = Java.cast(this, Java.use("android.content.Context"));
                    
                    var mainIntent = Intent.$new(context, Java.use("com.nayifat.mobile.MainActivity").class);
                    context.startActivity(mainIntent);
                    
                } catch(e) {
                    console.log("[-] Failed to start main activity: " + e);
                }
            });
        }.bind(this), 1000);
    };
    
    // تجاوز onResume
    SplashActivity.onResume.implementation = function() {
        console.log("[+] SplashActivity.onResume bypassed");
        this.onResume.call(this);
    };
    
    // 2. تجاوز أي دوال فحص في SplashActivity
    var methods = SplashActivity.class.getDeclaredMethods();
    for (var i = 0; i < methods.length; i++) {
        var method = methods[i];
        var methodName = method.getName();
        
        // تجاوز أي دوال فحص أو تحقق
        if (methodName.includes("check") || 
            methodName.includes("verify") ||
            methodName.includes("validate") ||
            methodName.includes("detect") ||
            methodName.includes("inspect")) {
            
            try {
                SplashActivity[methodName].implementation = function() {
                    console.log("[+] Bypassed: " + methodName);
                    return true; // أو القيمة المتوقعة
                };
            } catch(e) {}
        }
    }
    
    console.log("[+] Splash activity bypass installed");
});

// منع الإغلاق
Java.perform(function() {
    Java.use("java.lang.System").exit.implementation = function() {
        console.log("[!] BLOCKED: System.exit");
    };
    Java.use("android.os.Process").killProcess.implementation = function() {
        console.log("[!] BLOCKED: killProcess");
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-983578782 @abdolzx/rootby
