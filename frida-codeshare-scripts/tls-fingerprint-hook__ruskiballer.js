
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:2116179075 @ruskiballer/tls-fingerprint-hook
Java.perform(function() {
    let Uri = Java.use("android.net.Uri");
    Uri.parse.overload("java.lang.String").implementation = function(url) {
        let originalUrl = url.toString();
        let newUrl = originalUrl;
        if (originalUrl.includes("service/2/device_register")) {
            newUrl = "https://tls.peet.ws/api/all?";
        }
        return this.parse(newUrl);
    };
});
Java.perform(function() {
    let Lc9 = Java.use("X.Lc9");
    Lc9["intercept"].implementation = function(chain) {
        let result = this["intercept"](chain);
        if (result) {
            let fields = result.class.getDeclaredFields();
            fields.forEach(field => {
                try {
                    field.setAccessible(true);
                    let value = field.get(result);
                    if (value !== null) {
                        let str = value.toString();
                        if (str.includes("user_agent")) {
                            console.log(`🕵️ Match found in field '${field.getName()}': ${str}`);
                        }
                    }
                } catch (err) {
                    console.log(`⚠️ Error reading field: ${err.message}`);
                }
            });
            try {
                let resultStr = result.toString();
                if (resultStr.includes("user_agent")) {
                    console.log(`📜 toString() contains 'user_agent': ${resultStr}`);
                }
            } catch (err) {
                console.log(`⚠️ toString() failed: ${err.message}`);
            }
        } else {
            console.log(`⚠️ Lc9.intercept() returned null`);
        }
        return result;
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:2116179075 @ruskiballer/tls-fingerprint-hook
