
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-702154160 @HCIBO/mobil-framework-detect
Java.perform(function () {
    console.log("Détection des fichiers .so (Flutter) en cours...");

    var flutterSoPattern = /libflutter.so/;
    var detectedSoFiles = [];

    var File = Java.use("java.io.File");
    
    try {
        var System = Java.use("java.lang.System");
        var libraries = System.getProperty("java.library.path");

        var libDirs = libraries.split(":");

        libDirs.forEach(function (libDir) {
            var libFile = File.$new(libDir + "/libflutter.so");
            if (libFile.exists()) {
                detectedSoFiles.push(libFile.getAbsolutePath());
                console.log("Fichier .so Flutter détecté : " + libFile.getAbsolutePath());
            }
        });

        if (detectedSoFiles.length === 0) {
            console.log("Aucun fichier .so Flutter trouvé.");
        }

    } catch (err) {
        console.log("Erreur lors de la vérification des fichiers .so : " + err);
    }

    var frameworkPatterns = {
        "React Native": /com\.facebook\.react|ReactActivity/,
        "Flutter": /io\.flutter\.app\.FlutterActivity|com\.flutter/,
        "Kotlin": /kotlin\./,
        "Angular/Cordova": /org\.apache\.cordova/,
        "Unity": /com\.unity3d\.player|UnityPlayerActivity/,
        "Native Android (Java/Kotlin)": /androidx\.appcompat\.app/,
        "Xamarin": /mono\.android/,
        "Ionic": /io\.ionic/,
        "PhoneGap": /org\.apache\.cordova/,
        "Cocos2d": /org\.cocos2dx/,
        "Titanium": /com\.appcelerator\.titanium/,
        "NativeScript": /org\.nativescript/,
        "GameMaker Studio": /com\.yoyogames/,
        "Apache Cordova": /org\.apache\.cordova/,
        "Qt": /org\.qt/,
        "PWA (Progressive Web Apps)": /org\.mozilla/,
        "Sencha Touch": /com\.sencha\.touch/
    };

    var detectedFrameworks = [];

    Java.enumerateLoadedClasses({
        onMatch: function (className) {
            for (var framework in frameworkPatterns) {
                if (frameworkPatterns[framework].test(className)) {
                    detectedFrameworks.push({ framework: framework, className: className });
                    break;
                }
            }
        },
        onComplete: function () {
            if (detectedFrameworks.length > 0) {
                console.log("\n--- Frameworks détectés ---");
                detectedFrameworks.forEach(function (entry) {
                    console.log("Framework: " + entry.framework);
                    console.log("  - Classe: " + entry.className);
                });
            } else {
                console.log("Aucun framework détecté.");
            }
        }
    });
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-702154160 @HCIBO/mobil-framework-detect
