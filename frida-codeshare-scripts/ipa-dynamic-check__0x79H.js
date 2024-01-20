
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1157394285 @0x79H/ipa-dynamic-check
// 这个脚本是在seclover工作时整合的; blog: https://blog.qwerdf.com/ 
// source: https://gist.github.com/0x79H/0b4c1909d37ea8377664eac107bb93be

function app_info(DEBUG) {
    console.log("")
    console.warn("--------------------------------")
    console.warn("|        待测试应用信息        |")
    console.warn("--------------------------------")
    try {
        console.log("Bundle Name: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleName").toString())
    } catch (err) {
        if (DEBUG) {
            console.error("[!] Error: " + err.message);
        }
    }
    try {
        console.log("Display Name: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleDisplayName").toString())
    } catch (err) {
        if (DEBUG) {
            console.error("[!] Error: " + err.message);
        }
    }
    try {
        console.log("Executable Name: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleExecutable").toString())
    } catch (err) {
        if (DEBUG) {
            console.error("[!] Error: " + err.message);
        }
    }
    try {
        console.log("Bundle Identifier: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleIdentifier").toString())
    } catch (err) {
        if (DEBUG) {
            console.error("[!] Error: " + err.message);
        }
    }
    try {
        console.log("Info Dictionary Version: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleInfoDictionaryVersion").toString())
    } catch (err) {
        if (DEBUG) {
            console.error("[!] Error: " + err.message);
        }
    }
    try {
        console.log("Numeric Version: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleNumericVersion").toString())
    } catch (err) {
        if (DEBUG) {
            console.error("[!] Error: " + err.message);
        }
    }
    try {
        console.log("Short Version: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleShortVersionString").toString())
    } catch (err) {
        if (DEBUG) {
            console.error("[!] Error: " + err.message);
        }
    }
    try {
        console.log("Bundle Version: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleVersion").toString())
    } catch (err) {
        if (DEBUG) {
            console.error("[!] Error: " + err.message);
        }
    }
    try {
        console.log("Minimum OS Version: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("MinimumOSVersion").toString())
    } catch (err) {
        if (DEBUG) {
            console.error("[!] Error: " + err.message);
        }
    }
    try {
        console.log("Bundle Package Type: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundlePackageType").toString())
    } catch (err) {
        if (DEBUG) {
            console.error("[!] Error: " + err.message);
        }
    }
    try {
        console.log("BuildMachineOSBuild: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("BuildMachineOSBuild").toString())
    } catch (err) {
        if (DEBUG) {
            console.error("[!] Error: " + err.message);
        }
    }
    try {
        console.log("Development Region: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleDevelopmentRegion").toString())
    } catch (err) {
        if (DEBUG) {
            console.error("[!] Error: " + err.message);
        }
    }
    try {
        console.log("iPhone Environment Required: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("LSRequiresIPhoneOS").toString())
    } catch (err) {
        if (DEBUG) {
            console.error("[!] Error: " + err.message);
        }
    }

    var mainBundlePath = String(ObjC.classes.NSBundle.mainBundle())
    mainBundlePath = mainBundlePath.substring(0, mainBundlePath.indexOf(">"))
    mainBundlePath = mainBundlePath.substring(mainBundlePath.indexOf("<") + 1)
    console.log("App Bundle Path    : " + mainBundlePath)
}

function raw_app_info_plist(DEBUG) {
    console.log("")
    console.warn("--------------------------------")
    console.warn("|      Info.plist 文件内容     |")
    console.warn("--------------------------------")
    try {
        console.log(ObjC.classes.NSBundle.mainBundle().infoDictionary().toString())
    } catch (err) {
        if (DEBUG) {
            console.error("[!] Error: " + err.message);
        }
    }
}


function app_transport_security(DEBUG) {
    console.log("")
    console.warn("-----------------------------------")
    console.warn("|ATS (App Transport Security) 设置|")
    console.warn("-----------------------------------")
    console.warn("参考资料: https://developer.apple.com/documentation/bundleresources/information_property_list/nsapptransportsecurity")
    var dictKeys = ObjC.classes.NSBundle.mainBundle().infoDictionary().allKeys();
    if (dictKeys.containsObject_("NSAppTransportSecurity")) {
        //console.log("[*] Issue: 在Info.plist中设置了 'NSAppTransportSecurity'")
        //console.log("[*] Detail: 可禁用ATS, 使用不安全的HTTP协议传输数据。")
        //console.log("")
        var atsDictKeys = ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("NSAppTransportSecurity").allKeys();
        for (var i = 0; i < atsDictKeys.count(); i++) {
            if (atsDictKeys.objectAtIndex_(i) == "NSAllowsArbitraryLoads") {
                if (ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("NSAppTransportSecurity").objectForKey_("NSAllowsArbitraryLoads").toString() == "1") {
                    console.log("[*] Issue: 在Info.plist中设置了 'NSAllowsArbitraryLoads'")
                    console.log("[*] Detail: 指示是否为所有网络连接禁用 ATS")
                    console.log("")
                }
            }
            if (atsDictKeys.objectAtIndex_(i) == "NSAllowsArbitraryLoadsForMedia") {
                if (ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("NSAppTransportSecurity").objectForKey_("NSAllowsArbitraryLoadsForMedia").toString() == "1") {
                    console.log("[*] Issue: 在Info.plist中设置了 'NSAllowsArbitraryLoadsForMedia'")
                    console.log("[*] Detail: 指示是否对使用 AV Foundation 框架发出的请求禁用 ATS。")
                    console.log("")
                }
            }
            if (atsDictKeys.objectAtIndex_(i) == "NSAllowsArbitraryLoadsInWebContent") {
                if (ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("NSAppTransportSecurity").objectForKey_("NSAllowsArbitraryLoadsInWebContent").toString() == "1") {
                    console.log("[*] Issue: 在Info.plist中设置了 'NSAllowsArbitraryLoadsInWebContent'")
                    console.log("[*] Detail: 指示是否为从 Web 视图发出的请求禁用 ATS")
                    console.log("")
                }
            }
            if (atsDictKeys.objectAtIndex_(i) == "NSAllowsLocalNetworking") {
                if (ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("NSAppTransportSecurity").objectForKey_("NSAllowsLocalNetworking").toString() == "1") {
                    console.log("[*] Issue: 在Info.plist中设置了 'NSAllowsLocalNetworking'")
                    console.log("[*] Detail: 指示是否允许加载本地资源.")
                    console.log("")
                }
            }
            if (atsDictKeys.objectAtIndex_(i) == "NSExceptionDomains") {
                console.log("[*] Issue: 在Info.plist的 'NSAppTransportSecurity' 块中设置了 'NSExceptionDomains'")
                console.log("[*] Detail: 针对特定域名进行 ATS 例外的设置, 可使用不安全的HTTP协议传输数据")
                console.log("[*] 包含域名:")
                var atsExceptionDomainsDict = ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("NSAppTransportSecurity").objectForKey_("NSExceptionDomains");
                var atsExceptionDomainsDictKeys = ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("NSAppTransportSecurity").objectForKey_("NSExceptionDomains").allKeys();
                for (var i = 0; i < atsExceptionDomainsDictKeys.count(); i++) {
                    console.log("    " + atsExceptionDomainsDictKeys.objectAtIndex_(i));
                }
            }
        }
    }
}

function protected_resources_permissions(DEBUG) {
    console.log("")
    console.warn("-----------------------------------")
    console.warn("|           敏感权限检测          |")
    console.warn("-----------------------------------")
    console.warn("参考资料: https://developer.apple.com/documentation/bundleresources/information_property_list/protected_resources")
    var dictKeys = ObjC.classes.NSBundle.mainBundle().infoDictionary().allKeys();
    var permissionListArray = ["NSBluetoothAlwaysUsageDescription", "NSBluetoothPeripheralUsageDescription", "NSCalendarsUsageDescription", "NSRemindersUsageDescription", "NSCameraUsageDescription", "NSMicrophoneUsageDescription", "NSContactsUsageDescription", "NSFaceIDUsageDescription", "NSDesktopFolderUsageDescription", "NSDocumentsFolderUsageDescription", "NSDownloadsFolderUsageDescription", "NSNetworkVolumesUsageDescription", "NSRemovableVolumesUsageDescription", "NSFileProviderPresenceUsageDescription", "NSFileProviderDomainUsageDescription", "NSHealthClinicalHealthRecordsShareUsageDescription", "NSHealthShareUsageDescription", "NSHealthUpdateUsageDescription", "NSHealthRequiredReadAuthorizationTypeIdentifiers", "NSHomeKitUsageDescription", "NSLocationAlwaysAndWhenInUseUsageDescription", "NSLocationUsageDescription", "NSLocationWhenInUseUsageDescription", "NSLocationAlwaysUsageDescription", "NSAppleMusicUsageDescription", "NSMotionUsageDescription", "NFCReaderUsageDescription", "NSPhotoLibraryAddUsageDescription", "NSPhotoLibraryUsageDescription", "NSAppleScriptEnabled", "NSAppleEventsUsageDescription", "NSSiriUsageDescription", "NSSpeechRecognitionUsageDescription", "NSVideoSubscriberAccountUsageDescription", "UIRequiresPersistentWiFi"]
    var permissionListNameDict = {
        "NSBluetoothAlwaysUsageDescription": "获取蓝牙权限",
        "NSBluetoothPeripheralUsageDescription": "获取蓝牙权限",
        "NSCalendarsUsageDescription": "获取日志权限",
        "NSRemindersUsageDescription": "Reminders Usage Description",
        "NSCameraUsageDescription": "获取相机权限",
        "NSMicrophoneUsageDescription": "获取麦克风权限",
        "NSContactsUsageDescription": "获取联系人权限",
        "NSFaceIDUsageDescription": "获取Face ID权限",
        "NSDesktopFolderUsageDescription": "获取桌面文件夹权限",
        "NSDocumentsFolderUsageDescription": "获取文档文件夹权限",
        "NSDownloadsFolderUsageDescription": "获取下载文件夹权限",
        "NSNetworkVolumesUsageDescription": "获取网络卷权限",
        "NSRemovableVolumesUsageDescription": "获取便携式磁盘权限",
        "NSFileProviderPresenceUsageDescription": "获取 File Provider Presence Usage 权限",
        "NSFileProviderDomainUsageDescription": "获取 File Provider Domain Usage 权限",
        "NSHealthClinicalHealthRecordsShareUsageDescription": "获取健康权限",
        "NSHealthShareUsageDescription": "获取健康权限",
        "NSHealthUpdateUsageDescription": "获取健康权限",
        "NSHealthRequiredReadAuthorizationTypeIdentifiers": "获取HealthKit权限",
        "NSHomeKitUsageDescription": "获取HomeKit权限",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "获取后台定位权限",
        "NSLocationUsageDescription": "获取定位权限",
        "NSLocationWhenInUseUsageDescription": "获取定位权限",
        "NSLocationAlwaysUsageDescription": "获取后台定位权限",
        "NSAppleMusicUsageDescription": "获取媒体库权限",
        "NSMotionUsageDescription": "获取运动权限",
        "NFCReaderUsageDescription": "获取NFC权限",
        "NSPhotoLibraryAddUsageDescription": "获取照片权限",
        "NSPhotoLibraryUsageDescription": "获取照片权限",
        "NSAppleScriptEnabled": "获取AppleScript权限",
        "NSAppleEventsUsageDescription": "获取AppleEvents权限",
        "NSSystemAdministrationUsageDescription": "获取系统管理员权限",
        "ITSAppUsesNonExemptEncryption": "设置使用不被出口限制的加密",
        "ITSEncryptionExportComplianceCode": "设置出口合规代码",
        "NSSiriUsageDescription": "获取siri权限",
        "NSSpeechRecognitionUsageDescription": "获取语音识别权限",
        "NSVideoSubscriberAccountUsageDescription": "获取视频订阅权限",
        "UIRequiresPersistentWiFi": "获取wifi权限"
    };
    var _flag = true;
    for (var i = 0; i < permissionListArray.length; i++) {
        try {
            if (dictKeys.containsObject_(permissionListArray[i])) {
                console.log("Resource : " + permissionListArray[i])
                console.log("Name     : " + permissionListNameDict[permissionListArray[i]])
                console.log("Value    : " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_(permissionListArray[i]).toString())
                console.log("")
                _flag = false;
            }
        } catch (err) {
            if (DEBUG) {
                console.error("[!] Error: " + err.message);
            }
        }
    }
    if (_flag) {
        console.log("[*] 无任何申请权限");
    } else {
        raw_app_info_plist();
    }
}





function set_hook(DEBUG) {
    var _checks = [{
            name: "uname 获取信息", //暂时忽略syscall
            fun_type: "native", //Module.findExportByName(null, 'uname')
            fun_name: "uname",
            fun_class: null,
            onEnter: function(args) {
                console.log("uname 获取信息");
            },
            onLeave: function(ret) {}
        },
        {
            name: "UIDevice localizedModel 获取设备语言",
            fun_type: "ObjC", //ObjC.classes.UIDevice.['- localizedModel']
            fun_name: "- localizedModel",
            fun_class: "UIDevice",
            onEnter: function(args) {
                console.log("UIDevice localizedModel 获取设备语言");
            },
            onLeave: function(ret) {}
        },
        {
            name: "UIDevice systemVersion 获取设备版本",
            fun_type: "ObjC",
            fun_name: "- systemVersion",
            fun_class: "UIDevice",
            onEnter: function(args) {
                console.log("UIDevice systemVersion 获取设备版本");
            },
            onLeave: function(ret) {}
        },
        {
            name: "UIDevice model 获取设备型号",
            fun_type: "ObjC",
            fun_name: "- model",
            fun_class: "UIDevice",
            onEnter: function(args) {
                console.log("UIDevice model 获取设备型号");
            },
            onLeave: function(ret) {}
        },
        {
            name: "UIDevice name 获取设备名称",
            fun_type: "ObjC",
            fun_name: "- name",
            fun_class: "UIDevice",
            onEnter: function(args) {
                console.log("UIDevice name 获取设备名称");
            },
            onLeave: function(ret) {}
        },
        {
            name: "UIDevice systemName 获取设备名称",
            fun_type: "ObjC",
            fun_name: "- systemName",
            fun_class: "UIDevice",
            onEnter: function(args) {
                console.log("UIDevice systemName 获取设备名称");
            },
            onLeave: function(ret) {}
        },
        {
            name: "UIDevice orientation 获取设备名称",
            fun_type: "ObjC",
            fun_name: "- orientation",
            fun_class: "UIDevice",
            onEnter: function(args) {
                console.log("UIDevice orientation 获取设备名称");
            },
            onLeave: function(ret) {}
        },
        {
            name: "UIDevice identifierForVendor 获取设备名称",
            fun_type: "ObjC",
            fun_name: "- identifierForVendor",
            fun_class: "UIDevice",
            onEnter: function(args) {
                console.log("UIDevice identifierForVendor 获取设备名称");
            },
            onLeave: function(ret) {}
        },
        {
            name: "NSProcessInfo hostName 主机名称",
            fun_type: "ObjC",
            fun_name: "- hostName",
            fun_class: "NSProcessInfo",
            onEnter: function(args) {
                console.log("NSProcessInfo hostName 主机名称");
            },
            onLeave: function(ret) {}
        },
        {
            name: "NSProcessInfo operatingSystemVersionString 操作系统版本1",
            fun_type: "ObjC",
            fun_name: "- operatingSystemVersionString",
            fun_class: "NSProcessInfo",
            onEnter: function(args) {
                console.log("NSProcessInfo operatingSystemVersionString 操作系统版本1");
            },
            onLeave: function(ret) {}
        },
        {
            name: "NSProcessInfo operatingSystemVersion 操作系统版本2",
            fun_type: "ObjC",
            fun_name: "- operatingSystemVersion",
            fun_class: "NSProcessInfo",
            onEnter: function(args) {
                console.log("NSProcessInfo operatingSystemVersion 操作系统版本2");
            },
            onLeave: function(ret) {}
        },
        {
            name: "NSProcessInfo processorCount 核心数",
            fun_type: "ObjC",
            fun_name: "- processorCount",
            fun_class: "NSProcessInfo",
            onEnter: function(args) {
                console.log("NSProcessInfo processorCount 核心数");
            },
            onLeave: function(ret) {}
        },
        {
            name: "NSProcessInfo activeProcessorCount 可用核心数",
            fun_type: "ObjC",
            fun_name: "- activeProcessorCount",
            fun_class: "NSProcessInfo",
            onEnter: function(args) {
                console.log("NSProcessInfo activeProcessorCount 可用核心数");
            },
            onLeave: function(ret) {}
        },
        {
            name: "NSProcessInfo physicalMemory 内存总量",
            fun_type: "ObjC",
            fun_name: "- physicalMemory",
            fun_class: "NSProcessInfo",
            onEnter: function(args) {
                console.log("NSProcessInfo physicalMemory 内存总量");
            },
            onLeave: function(ret) {}
        },
        {
            name: "NSProcessInfo systemUptime 系统启动时间",
            fun_type: "ObjC",
            fun_name: "- systemUptime",
            fun_class: "NSProcessInfo",
            onEnter: function(args) {
                console.log("NSProcessInfo systemUptime 系统启动时间");
            },
            onLeave: function(ret) {}
        },
        {
            name: "CTCarrier carrierName SIM卡运营商名称",
            fun_type: "ObjC",
            fun_name: "- carrierName",
            fun_class: "CTCarrier",
            onEnter: function(args) {
                console.log("CTCarrier carrierName SIM卡运营商名称");
            },
            onLeave: function(ret) {}
        },
        {
            name: "CTCarrier mobileCountryCode SIM卡运营商代码1",
            fun_type: "ObjC",
            fun_name: "- mobileCountryCode",
            fun_class: "CTCarrier",
            onEnter: function(args) {
                console.log("CTCarrier mobileCountryCode SIM卡运营商代码1");
            },
            onLeave: function(ret) {}
        },
        {
            name: "CTCarrier mobileNetworkCode SIM卡运营商代码2",
            fun_type: "ObjC",
            fun_name: "- mobileNetworkCode",
            fun_class: "CTCarrier",
            onEnter: function(args) {
                console.log("CTCarrier mobileNetworkCode SIM卡运营商代码2");
            },
            onLeave: function(ret) {}
        },
        {
            name: "CTCarrier isoCountryCode SIM卡运营商代码3",
            fun_type: "ObjC",
            fun_name: "- isoCountryCode",
            fun_class: "CTCarrier",
            onEnter: function(args) {
                console.log("CTCarrier isoCountryCode SIM卡运营商代码3");
            },
            onLeave: function(ret) {}
        },
        {
            name: "NSLocale localeIdentifier 语言环境标识符",
            fun_type: "ObjC",
            fun_name: "- localeIdentifier",
            fun_class: "NSLocale",
            onEnter: function(args) {
                console.log("NSLocale localeIdentifier 语言环境标识符");
            },
            onLeave: function(ret) {}
        },
        {
            name: "NSLocale languageCode 语言环境的语言代码1",
            fun_type: "ObjC",
            fun_name: "- languageCode",
            fun_class: "NSLocale",
            onEnter: function(args) {
                console.log("NSLocale languageCode 语言环境的语言代码1");
            },
            onLeave: function(ret) {}
        },
        {
            name: "NSLocale collatorIdentifier 语言环境的语言代码2",
            fun_type: "ObjC",
            fun_name: "- collatorIdentifier",
            fun_class: "NSLocale",
            onEnter: function(args) {
                console.log("NSLocale collatorIdentifier 语言环境的语言代码2");
            },
            onLeave: function(ret) {}
        },
        {
            name: "NSLocale countryCode 语言环境的语言代码3",
            fun_type: "ObjC",
            fun_name: "- countryCode",
            fun_class: "NSLocale",
            onEnter: function(args) {
                console.log("NSLocale countryCode 语言环境的语言代码3");
            },
            onLeave: function(ret) {}
        },
        {
            name: "NSLocale currencySymbol 语言环境的货币符号",
            fun_type: "ObjC",
            fun_name: "- currencySymbol",
            fun_class: "NSLocale",
            onEnter: function(args) {
                console.log("NSLocale currencySymbol 语言环境的货币符号");
            },
            onLeave: function(ret) {}
        },
        {
            name: "NSLocale currencyCode 语言环境的货币代码",
            fun_type: "ObjC",
            fun_name: "- currencyCode",
            fun_class: "NSLocale",
            onEnter: function(args) {
                console.log("NSLocale currencyCode 语言环境的货币代码");
            },
            onLeave: function(ret) {}
        },
        {
            name: "NSTimeZone systemTimeZone 获取时间信息1",
            fun_type: "ObjC",
            fun_name: "systemTimeZone",
            fun_class: "NSTimeZone",
            onEnter: function(args) {
                console.log("NSTimeZone systemTimeZone 获取时间信息1");
            },
            onLeave: function(ret) {}
        },
        {
            name: "NSTimeZone defaultTimeZone 获取时间信息2",
            fun_type: "ObjC",
            fun_name: "defaultTimeZone",
            fun_class: "NSTimeZone",
            onEnter: function(args) {
                console.log("NSTimeZone defaultTimeZone 获取时间信息2");
            },
            onLeave: function(ret) {}
        },
        {
            name: "NSTimeZone localTimeZone 获取时间信息3",
            fun_type: "ObjC",
            fun_name: "localTimeZone",
            fun_class: "NSTimeZone",
            onEnter: function(args) {
                console.log("NSTimeZone localTimeZone 获取时间信息3");
            },
            onLeave: function(ret) {}
        },
        {
            name: "UIDevice batteryMonitoringEnabled 获取电池信息1",
            fun_type: "ObjC",
            fun_name: "batteryMonitoringEnabled",
            fun_class: "UIDevice",
            onEnter: function(args) {
                console.log("UIDevice batteryMonitoringEnabled 获取电池信息1");
            },
            onLeave: function(ret) {}
        },
        {
            name: "UIDevice batteryState 获取电池信息2",
            fun_type: "ObjC",
            fun_name: "- batteryState",
            fun_class: "UIDevice",
            onEnter: function(args) {
                console.log("UIDevice batteryState 获取电池信息2");
            },
            onLeave: function(ret) {}
        },
        {
            name: "UIDevice batteryLevel 获取电池信息3",
            fun_type: "ObjC",
            fun_name: "- batteryLevel",
            fun_class: "UIDevice",
            onEnter: function(args) {
                console.log("UIDevice batteryLevel 获取电池信息3");
            },
            onLeave: function(ret) {}
        },
    ]

    console.log("")
    console.warn("--------------------------------")
    console.warn("|     App Call Information     |")
    console.warn("--------------------------------")
    for (var i = 0; i < _checks.length; i++) {
        var _tmp_fun = null;
        if (_checks[i]['fun_type'] == "native") {
            _tmp_fun = Module.findExportByName(null, _checks[i].fun_name);
        } else if (_checks[i]['fun_type'] == "ObjC") {
            _tmp_fun = ObjC.classes[_checks[i].fun_class][_checks[i].fun_name];
            if (_tmp_fun) {
                _tmp_fun = _tmp_fun.implementation;
            } else {
                if (DEBUG) {
                    console.log(_checks[i].name);
                }
                continue;
            }
        } else {
            continue;
        }
        Interceptor.attach(_tmp_fun, {
            onEnter: _checks[i].onEnter,
            onLeave: _checks[i].onLeave
        })
    }
}

function _exec() {
    app_info();
    app_transport_security();
    protected_resources_permissions();
    set_hook();
}

setImmediate(_exec);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1157394285 @0x79H/ipa-dynamic-check
