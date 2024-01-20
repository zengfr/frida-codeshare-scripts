
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1546388760 @apkunpacker/hideroot
/*
Created By @ApkUnpacke
https://github.com/apkunpacker/Root_Bypass
*/
var ProName = ProcessName();
//var ProName = "Define Your Package Name Here in case 1st line not work";
function ProcessName() {
    var openPtr = Module.getExportByName('libc.so', 'open');
    var open = new NativeFunction(openPtr, 'int', ['pointer', 'int']);
    var readPtr = Module.getExportByName('libc.so', 'read');
    var read = new NativeFunction(readPtr, 'int', ['int', 'pointer', 'int']);
    var closePtr = Module.getExportByName('libc.so', 'close');
    var close = new NativeFunction(closePtr, 'int', ['int']);
    var path = Memory.allocUtf8String('/proc/self/cmdline');
    var fd = open(path, 0);
    if (fd != -1) {
        var buffer = Memory.alloc(0x1000);
        var result = read(fd, buffer, 0x1000);
        close(fd);
        result = ptr(buffer).readCString();
        return result;
    }
    return -1;
}

var FakeMaps = "/data/data/" + ProName + "/maps";
var FakeMounts = "/data/data/" + ProName + "/mounts";
var FakeMountInfo = "/data/data/" + ProName + "/mountinfo";
var MapsFile = new File(FakeMaps, "w");
var FMountFile = new File(FakeMounts, "w");
var FMInfo = new File(FakeMountInfo, "w");
var MapsBuffer = Memory.alloc(512);
var MountBuffer = Memory.alloc(512);
var MountInfoBuffer = Memory.alloc(512);
var RootPath = new Array("fstab.andy", "ueventd.andy.rc", "ueventd.android_x86.rc", "x86.prop", "ueventd.ttVM_x86.rc", "init.ttVM_x86.rc", "fstab.ttVM_x86", "fstab.vbox86", "init.vbox86.rc", "ueventd.vbox86.rc", "fstab.nox", "init.nox.rc", "ueventd.nox.rc", "/dev/socket/genyd", "/dev/socket/baseband_genyd", "/proc/net/tcp", "/proc/net/udp", "busybox", "resetprop", "supolicy", "magiskpolicy", "%s/magisk", "/sdcard/Download/magisk_patched.img", "ro.boot.verifiedbootstate", "init.svc.flash_recovery", "init.svc.flash_recovery_sec", "/proc/%d/ns/mnt", "/system/bin/bu", "libriru", "zygisk", "projekt.substratum", "init.svc.", "/dev/ptmx", "/proc/sys/kernel/random/boot_id", "de/robv/android/xposed/XposedBridge", "init.rc", "magisk.version", "init.svc.magisk_pfs", "persist.magisk.hide", "init.svc.magisk_pfsd", "init.svc.magisk_service", "ro.magisk.disable", "/vendor/bin/su", "/odm/bin/su", "/product/bin/su", "/system/bin/.su", "/system/xbin/.su", "/system/xbin", "/system/bin", "/system/sd/xbin", "/system/bin/failsafe", "/data/local", "/system/bin/.ext", "/data/local/xbin", "/data/local/bin", "/system/etc/security/cacerts/", "/system/app/Superuser.apk", "/sbin/su", "/sbin/", "/sbin", "/system/bin/su", "/system/xbin/su", "/data/local/xbin/su", "/data/local/su", "/su/bin/su", "/data/local/su", "/data/local/bin/su", "/data/local/xbin/su", "/sbin/su", "/su/bin/su", "/system/bin/.ext/su", "/system/bin/failsafe/su", "/system/sd/xbin/su", "/system/usr/we-need-root/su", "/cache/su", "/data/su", "/dev/su", "com.noshufou.android.su", "com.noshufou.android.su.elite", "eu.chainfire.supersu", "com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su", "com.koushikdutta.rommanager", "com.koushikdutta.rommanager.license", "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch", "com.ramdroid.appquarantine", "com.ramdroid.appquarantinepro", "com.devadvance.rootcloak", "com.devadvance.rootcloakplus", "de.robv.android.xposed.installer", "com.saurik.substrate", "com.zachspong.temprootremovejb", "com.amphoras.hidemyroot", "com.amphoras.hidemyrootadfree", "com.formyhm.hiderootPremium", "com.formyhm.hideroot", "me.phh.superuser", "eu.chainfire.supersu.pro", "com.kingouser.com", "cc.madkite.freedom", "com.android.vending.billing.InAppBillingService.COIN", "/data/adb/", "/sbin/.magisk/", "/sbin/magiskpolicy", "/sbin/magiskhide", "/sbin/.core/mirror", "/sbin/.core/img", "/sbin/.core/db-0/magisk.db", "magisk", "/sbin/magiskinit", "/dev/.magisk.unblock", "/sbin/magisk", "/data/adb/magisk.img", "/data/adb/magisk.db", "/data/adb/.boot_count", "/data/adb/magisk_simple", "/cache/.disable_magisk", "/cache/magisk.log", "/init.magisk.rc", "/data/adb/riru/api_version", "/data/adb/riru/bin/rirud", "/data/adb/edxp/misc_path", "/data/data/com.topjohnwu.magisk", "/storage/emulated/0/Android/data/com.topjohnwu.magisk", "/storage/emulated/0/Android/media/com.topjohnwu.magisk", "/storage/emulated/0/Android/obb/com.topjohnwu.magisk", "/data/app/com.topjohnwu.magisk", "/data/data/kingoroot.supersu/files/supersu.cfg", "/data/user/%d/kingoroot.supersu/files/supersu.cfg", "/data/data/kingoroot.supersu/logs/", "/data/user/%d/kingoroot.supersu/logs/", "/data/data/kingoroot.supersu/requests/", "/data/data/supersu/", "/data/data/supersu/system/", "/data/data/kingoroot.supersu/connections/", "/data/data/kingoroot.supersu/connections/system/", "/data/data/kingoroot.supersu", "/data/user_de/%d/eu.chainfire.supersu/files/supersu.cfg", "/data/user/%d/eu.chainfire.supersu/files/supersu.cfg", "/data/data/eu.chainfire.supersu/files/supersu.cfg", "/data/user_de/%d/eu.chainfire.supersu/logs/", "/data/user/%d/eu.chainfire.supersu/logs/", "/data/data/eu.chainfire.supersu/logs/", "/data/user_de/0/eu.chainfire.supersu/requests/", "/data/data/eu.chainfire.supersu/requests/", "/data/data/eu.chainfire.supersu/connections/", "/data/data/eu.chainfire.supersu/connections/system/", "/data/data/eu.chainfire.supersu", "com.noshufou.android.su", "com.noshufou.android.su.elite", "eu.chainfire.supersu", "com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su", "com.topjohnwu.magisk", "com.kingroot.kinguser", "com.kingo.root", "com.smedialink.oneclickroot", "com.zhiqupk.root.global", "com.alephzain.framaroot", "com.koushikdutta.rommanager", "com.koushikdutta.rommanager.license", "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch", "com.ramdroid.appquarantine", "com.ramdroid.appquarantinepro", "com.android.vending.billing.InAppBillingService.COIN", "com.android.vending.billing.InAppBillingService.LUCK", "com.chelpus.luckypatcher", "com.blackmartalpha", "org.blackmart.market", "com.allinone.free", "com.repodroid.app", "org.creeplays.hack", "coMod.baseappfull.fwd", "com.zmapp", "com.dv.marketmod.installer", "org.mobilism.android", "com.android.wp.net.log", "com.android.camera.update", "cc.madkite.freedom", "com.solohsu.android.edxp.manager", "org.meowcat.edxposed.manager", "com.xmodgame", "com.cih.game_cih", "com.charles.lpoqasert", "catch_.me_.if_.you_.can_", "com.devadvance.rootcloak", "com.devadvance.rootcloakplus", "de.robv.android.xposed.installer", "com.saurik.substrate", "com.zachspong.temprootremovejb", "com.amphoras.hidemyroot", "com.amphoras.hidemyrootadfree", "com.formyhm.hiderootPremium", "com.formyhm.hideroot", "catch_.me_.if_.you_.can_", "com.sidheinteractive.slf.DR", "com.landlordgames.tycoon", "air.com.hypa.io.slither", "com.landlordgames.tycoon", "com.nanoo.darkswords", "com.android.vending.billing.InAppBillingService.LOCK", "com.android.vending.billing.InAppBillingService.LACKplus", "cc.madkite.freedom", "com.xmodgame", "com.cyjh.gundam", "net.aisence.Touchelper", "com.zhangkongapp.joke.bamenshenqi", "com.xxAssistant", "com.huluxia.gametools", "com.iplay.assistant", "com.vqs.iphoneassess", "com.x0.strai.frep", "idv.aqua.bulldog", "com.cyjh.mobileanjian", "cn.mm.gk", "com.frapeti.androidbotmaker", "com.chaozhuo", "sbgamehacker.net", "net.hackerbot.hbsiteapp", "org.cheatengine.cegui", "com.wondershare.drfone", "com.ram.memory.booster.cpu.saver", "com.toptools.rootactivitymonitorbooster", "eu.chainfire.supersu.pro", "eu.chainfire.supersu", "com.pace.cpubooster", "net.aldycew.goroot", "us.sifitich.root.all.devices", "com.joeykrim.rootcheck", "com.in.parallel.accounts", "com.parallelspace.multipleaccounts.appclone", "com.dualspace.multipleaccounts.parallelspace", "jp.clonespace.plum", "com.multipleaccounts.parallelspace", "com.thinkmobile.accountmaster", "multiple.multiple.parallel.accounts.cloner.mochat", "com.trendmicro.tmas", "com.yy.multi", "com.excelliance.multiaccounts", "com.enflick.android.tn2ndLine", "com.parallel.space.lite", "com.excelliance.multiaccounts.b64", "com.excean.parallelspace", "app.cloner.clone.parallel.multiple.account", "com.polestar.domultiple", "com.excelliance.multiaccount", "com.jumobile.smartapp", "com.polestar.superclone", "foster.parallelspace.dualspace", "com.jiubang.commerce.gomultiple", "whatschat.parallelspace.cloneapp.multipleaccounts", "lbe.parallel.intl.excelliance.multiaccount", "com.ludashi.dualspace", "com.multiple.space", "com.ludashi.multspace", "com.ludashi.superboost", "com.aura.oobe.samsung", "com.lbe.parallel.intl", "org.cheatengine.cegui", "cn.mm.gk", "catch_.me_.if_.you_.can_", "org.sbtools.gamehack", "net.missingtricks.gbwhatsappdownloades", "com.xmodgame", "com.cih.game_cih", "com.sbgamehacker", "com.chelp.inc.appversion", "com.devadvance.rootcloak", "de.robv.android.xposed.installer", "com.saurik.substrate", "com.devadvance.rootcloakplus", "com.zachspong.temprootremovejb", "com.amphoras.hidemyroot", "com.formyhm.hideroot", "com.noshufou.android.su", "com.noshufou.android.su.elite", "eu.chainfire.supersu", "com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su", "com.topjohnwu.magisk", "net.kdl.tesline01", "net.kdl.teslinekeyboard", "net.kidlogger.kidloggerkeyboard", "net.kidlogger.kidloggerlight", "net.teslineservice.kidl5", "net.kdl.talkbackts", "com.retina22.ms6", "com.spinXbackup.backupApp", "cn.smartfire.remote", "com.vmlite.vncserver", "org.onaips.vnc", "net.xdevelop.rm", "tw.euudlm.mon", "com.schumi.vncs", "org.ajeje.fakelocation", "in.introkun.setmacaddress", "berserker.android.apps.sshdroidpro", "me.shkschneider.dropbearserver", "com.teslacoilsw.quicksshd", "org.digimead.digi.ctrl.sshd", "be.rosoco", "berserker.android.apps.sshdroid", "br.com.bott.droidsshd", "com.mwr.mercury", "com.icecoldapps.sshserver", "com.theolivetree.sshserver", "org.digimead.digi.ctrl", "com.icecoldapps.serversultimatepro", "com.icecoldapps.vncserverultimate", "com.nickc.pixel_vnc", "com.schumi.vncs", "cn.xt800.support", "com.Network_Remote_Control_Phone_2", "com.my.fake.location", "jp.netart.armoving", "jp.netart.arstalking", "com.forgottenprojects.mocklocations", "com.iapplize.locationmockup", "com.app.and.mobile.locationspoofer", "org.ajeje.locationspooferpro", "com.appandmobile.locationspooferfree", "locationPlay.GPSCheat", "locationPlay.GPSCheatFree", "com.android.preference.help.mole", "com.system.dbprocess", "de.robv.android.xposed.installer", "com.saurik.substrate", "com.mwr.dz", "com.arachnoid.sshelper", "com.anydesk.anydeskandroid", "com.sppsap_mlabss.alarm", "ait.com.locationfaker", "brickstudios.gpsHack", "com.cxdeberry.geotag", "com.merlich.gpssimulator_free", "com.mjhdev.fakelocationfree", "com.ocd.dev.gpsforger", "com.polliapps.fakelocation", "com.shankarlabs.teleport", "com.tim.apps.mockgps", "com.tistory.maxxgreen.app.virtuallocation", "com.wifi99.android.locationcheater", "com.yedapps.fakelocation.app.app.fakelocation", "de.russcity.movemygpstb", "fr.dvilleneuve.lockito", "kr.woot0pia.gps", "ru.gavrikov.mocklocations", "sinhhuynh.map.fakelocation", "/sys/fs/selinux/enforce", "/system/bin/nox-prop", "/system/bin/noxd", "/system/bin/nox-vbox-sf", "/system/bin/noxspeedup", "/system/lib/libnoxspeedup.so", "/system/lib/libnoxd.so", "/fstab.andy", "/ueventd.andy.rc", "/system/bin/andy-prop", "/system/etc/init.andy.sh", "/system/lib/egl/libEGL_andy.so", "/sys/devices/virtual/misc/bst_gps", "/sys/devices/virtual/misc/bst_ime", "/sys/devices/virtual/misc/bstpgaipc", "/sys/devices/platform/hd_power", "/mnt/windows/BstSharedFolder", "/proc/irq/20/vboxguest", "/system/bin/bstfolderd", "/system/bin/bstsyncfs", "/data/.bluestacks.prop", "/system/lib/egl/libGLES_bst.so", "/data/misc/profiles/cur/0/com.android.ld.appstore", "/data/misc/profiles/cur/0/com.ldmnq.launcher3", "/data/user_de/0/com.android.ld.appstore", "/data/user_de/0/com.ldmnq.launcher3", "/data/user/0/com.android.ld.appstore", "/data/user/0/com.ldmnq.launcher3", "//system/priv-app/LDAppStore", "/system/etc/init.leapdroid.sh", "/data/misc/profiles/cur/0/com.microvirt.memuime", "/data/misc/profiles/ref/com.microvirt.memuime", "/data/user_de/0/com.microvirt.memuime", "/system/app/com.mumu.launcher", "/system/app/com.mumu.store", "/system/etc/mumu-configs", "/system/bin/nox-prop", "/system/bin/nox-vbox-sf", "/data/misc/profiles/cur/0/com.bignox.appcenter", "/data/misc/profiles/ref/com.bignox.appcenter", "/data/user_de/0/com.bignox.appcenter", "/data/user/0/com.bignox.appcenter", "/sys/devices/virtual/redfinger_camera", "/sys/devices/virtual/redfinger_audio", "/sys/devices/virtual/redfinger_sensor", "/sys/devices/virtual/redfinger_gps", "/sys/class/redfinger_camera", "/sys/class/redfinger_audio", "/sys/class/redfinger_sensor", "/sys/class/redfinger_gps", "/sys/bus/platform/drivers/vfb_redfinger", "/sys/devices/platform/vfb_redfinger.0", "/sys/module/redfinger_audio", "/storage/emulated/0/Android/data/com.redfinger.appstore", "/sys/module/redfinger_audio", "/init.remixos.keymap.rc", "/init.remixos.rc", "/system/etc/init.tiantian.sh", "/system/lib/egl/libEGL_tiantianVM.so", "/system/lib/egl/libGLESv1_CM_tiantianVM.so", "/system/lib/egl/libGLESv2_tiantianVM.so", "/sys/devices/virtual/misc/vboxuser", "/sys/devices/virtual/misc/vboxguest", "/sys/bus/pci/drivers/vboxguest", "/sys/devices/virtual/misc/vboxuser/dev", "/sys/devices/virtual/misc/vboxuser/power", "/sys/devices/virtual/misc/vboxuser/uevent", "/sys/devices/virtual/misc/vboxguest/dev", "/sys/devices/virtual/misc/vboxguest/power", "/sys/devices/virtual/misc/vboxguest/uevent", "/sys/bus/pci/drivers/vboxguest/bind", "/sys/bus/pci/drivers/vboxguest/uevent", "/sys/bus/pci/drivers/vboxguest/unbind", "/sys/module/vboxsf/srcversion", "/sys/module/vboxsf/notes", "/sys/module/vboxsf/coresize", "/sys/module/vboxsf/sections", "/sys/module/vboxsf/uevent", "//sys/devices/virtual/misc/vboxuser", "//sys/devices/virtual/misc/vboxguest", "//sys/module/vboxsf", "/data/adb/magisk", "/system/xbin/daemonsu", "/su/xbin/su", "/su/bin/daemonsu", "/sbin/.magisk", "/system/app/SuperUser.apk", "/system/etc/init.d/99SuperSUDaemon", "/magisk/xposed/system/lib/libsigchain.so", "/magisk/xposed/system/lib/libsigchain.so", "/magisk/xposed/system/lib/libart.so", "/magisk/xposed/system/lib/libart.so", "/magisk/xposed/system/lib/libart-disassembler.so", "/magisk/xposed/system/lib/libart-disassembler.so", "/magisk/xposed/system/lib/libart-compiler.so", "/magisk/xposed/system/lib/libart-compiler.so", "/data/.supersu", "/data/.supersu", "/data/misc/profiles/ref/eu.chainfire.suhide", "/data/misc/profiles/ref/eu.chainfire.suhide", "/data/misc/profiles/cur/0/eu.chainfire.suhide", "/data/misc/profiles/cur/0/eu.chainfire.suhide", "/data/data/eu.chainfire.suhide", "/data/data/eu.chainfire.suhide", "/data/user_de/0/eu.chainfire.suhide", "/data/user_de/0/eu.chainfire.suhide", "/subin/su", "/subin/su", "/subin/daemonsu", "/subin/daemonsu", "/su", "/su", "/data/su.img", "/data/su.img", "/system/bin/.ext/.su", "/system/bin/.ext/.su", "/system/etc/.installed_su_daemon", "/system/etc/.installed_su_daemon", "/system/lib64/libsupol.so", "/system/lib64/libsupol.so", "/system/xbin/.tmpsu", "/system/xbin/.tmpsu", "/dev/.su.d", "/dev/.su.d", "/subin", "/subin", "/system/lib/libsupol.so", "/system/lib/libsupol.so", "/system/xbin/sugote", "/system/xbin/sugote", "/.subackup", "/.subackup", "/system/addon.d/51-addonsu.sh", "/system/addon.d/51-addonsu.sh", "/system/xbin/sugote-mksh", "/system/xbin/sugote-mksh");
var Executable = ["busybox", "resetprop", "supolicy", "magiskpolicy", "magisk", "sh", "getprop", "which", "mount", "build.prop", "id", "su", "ps", "getenforce", "/system/bin/sh", "pm", "path", "PATH"];
var readPtr = Module.findExportByName("libc.so", "read");
var read = new NativeFunction(readPtr, 'int', ['int', 'pointer', "int"]);
var openPtr = Module.findExportByName("libc.so", "open");
var open = new NativeFunction(openPtr, 'int', ['pointer', 'int']);
Interceptor.replace(openPtr, new NativeCallback(function(pathname, flag) {
    var FD = open(pathname, flag);
    // console.log("open : ",FD);
    var Path = pathname.readCString();
    if (Path.indexOf("/proc/") >= 0 && Path.indexOf("maps") >= 0) {
        /* 
          No Idea Why it crash on some apk, feel fee to change "maps" to something else if crash occurred 
        */
        console.log("open : ", Path)
        while (parseInt(read(FD, MapsBuffer, 512)) !== 0) {
            var MBuffer = MapsBuffer.readCString();
            MBuffer = MBuffer.replaceAll(" /system/", "FakingMaps");
            MBuffer = MBuffer.replaceAll(" /vendor/", "FakingMaps");
            MBuffer = MBuffer.replaceAll(" /product/", "FakingMaps");
            MBuffer = MBuffer.replaceAll(" /system_ext/", "FakingMaps");
            MBuffer = MBuffer.replaceAll(" /data/", "FakingMaps");
            MBuffer = MBuffer.replaceAll("libriru", "FakingMaps");
            MBuffer = MBuffer.replaceAll("frida", "FakingMaps");
            MBuffer = MBuffer.replaceAll("magisk", "FakingMaps");
            MapsFile.write(MBuffer);
        }

        var filename = Memory.allocUtf8String(FakeMaps);
        return open(filename, flag);
    }
    if (Path.indexOf("/proc/") >= 0 && Path.indexOf("mounts") >= 0) {
        console.log("open : ", Path)
        while (parseInt(read(FD, MountBuffer, 512)) !== 0) {
            var MNTBuffer = MountBuffer.readCString();
            MNTBuffer = MNTBuffer.replaceAll("magisk", "MadeBy@ApkUnpacker");
            MNTBuffer = MNTBuffer.replaceAll("/sbin/.magisk", "MadeBy@ApkUnpacker");
            MNTBuffer = MNTBuffer.replaceAll("libriru", "MadeBy@ApkUnpacker");
            MNTBuffer = MNTBuffer.replaceAll("xposed", "MadeBy@ApkUnpacker");
            MNTBuffer = MNTBuffer.replaceAll("mirror", "MadeBy@ApkUnpacker");
            MNTBuffer = MNTBuffer.replaceAll("system_root", "MadeBy@ApkUnpacker");
            MNTBuffer = MNTBuffer.replaceAll("xposed", "MadeBy@ApkUnpacker")
            FMountFile.write(MNTBuffer);
        }
        var mountname = Memory.allocUtf8String(FakeMounts);
        return open(mountname, flag);
    }
    if (Path.indexOf("/proc/") >= 0 && Path.indexOf("mountinfo") >= 0) {
        console.log("open : ", Path)
        while (parseInt(read(FD, MountInfoBuffer, 512)) !== 0) {
            var MInfo = MountInfoBuffer.readCString();
            MInfo = MInfo.replaceAll("magisk", "MadeBy@ApkUnpacker");
            MInfo = MInfo.replaceAll("/sbin/.magisk", "MadeBy@ApkUnpacker");
            MInfo = MInfo.replaceAll("libriru", "MadeBy@ApkUnpacker");
            MInfo = MInfo.replaceAll("xposed", "MadeBy@ApkUnpacker");
            MInfo = MInfo.replaceAll("mirror", "MadeBy@ApkUnpacker");
            MInfo = MInfo.replaceAll("system_root", "MadeBy@ApkUnpacker");
            MInfo = MInfo.replaceAll("xposed", "MadeBy@ApkUnpacker")
            FMInfo.write(MInfo);
        }
        var mountinfoname = Memory.allocUtf8String(FakeMountInfo);
        return open(mountinfoname, flag);
    }
    if (Path.indexOf("/proc/") >= 0 && Path.indexOf("cmdline") < 0 && Path.indexOf("timer") < 0) {
        console.log("Opening interesting Path : ", Path);
    }
    var Hide = (RootPath.indexOf(Path) > -1);
    if (Hide) {
        console.log("Open : ", Path);
        pathname.writeUtf8String("MadeBy@ApkUnpacker");
        return open(pathname, flag);
    }
    return FD;
}, 'int', ['pointer', 'int']))

var popenPtr = Module.findExportByName("libc.so", "popen");
var popen = new NativeFunction(popenPtr, 'pointer', ['pointer', 'pointer']);
Interceptor.replace(popenPtr, new NativeCallback(function(path, type) {
    var exe = path.readCString();
    var Hide = (Executable.indexOf(exe) > -1);
    console.log("popen : ", exe);
    if (Hide) {
        console.log("popen : ", exe);
        path.writeUtf8String("pm path com.android.settings");
        return popen(path, type);
    }
    return popen(path, type);
}, 'pointer', ['pointer', 'pointer']))
var fopenPtr = Module.findExportByName("libc.so", "fopen");
var fopen = new NativeFunction(fopenPtr, 'pointer', ['pointer', 'pointer']);
Interceptor.replace(fopenPtr, new NativeCallback(function(fname, mode) {
    var retval = fopen(fname, mode);
    var Path = fname.readCString();
    var Hide = (RootPath.indexOf(Path) > -1);
    if (Hide) {
        console.log("fopen : ", Path);
        fname.writeUtf8String("MadeBy@ApkUnpacker");
        return fopen(fname, flag);
    }
    return retval;
}, 'pointer', ['pointer', 'pointer']))
var inotifyPtr = Module.findExportByName(null, "inotify_add_watch");
var inotify = new NativeFunction(inotifyPtr, 'int', ['int', 'pointer', 'uint']);
Interceptor.replace(inotifyPtr, new NativeCallback(function(fd, pathname, mask) {
    var retval = inotify(fd, pathname, mask);
    var name = pathname.readCString();
    console.log("inotify_add_watch : ", fd, pathname.readCString(), mask, retval);
    if (name.indexOf("/proc") >= 0) {
        // console.log("inotify_add_watch : ",fd,pathname.readCString(),mask,retval);  
        //  return -1;  
    }
    return retval;
    // return -1;  
}, 'int', ['int', 'pointer', 'uint']))

var accessPtr = Module.findExportByName("libc.so", "access");
var access = new NativeFunction(accessPtr, 'int', ['pointer', 'int']);
Interceptor.replace(accessPtr, new NativeCallback(function(pathname, mode) {
    var FN = access(pathname, mode);
    var Path = pathname.readCString();
    var Hide = (RootPath.indexOf(Path) > -1);
    if (Hide) {
        console.log("access : ", Path);
        pathname.writeUtf8String("MadeBy@ApkUnpacker");
        return access(pathname, mode);
    }
    return access(pathname, mode);
}, 'int', ['pointer', 'int']))
var systemPtr = Module.findExportByName("libc.so", "system");
var system = new NativeFunction(systemPtr, 'int', ['pointer']);
Interceptor.replace(systemPtr, new NativeCallback(function(command) {
    var cmd = command.readCString();
    var Hide = (Executable.indexOf(cmd) > -1);
    if (Hide) {
        console.log("system : ", command);
        command.writeUtf8String("MadeBy@ApkUnpacker");
        return system(command);
    }
    return system(command);
}, 'int', ['pointer']))
var statPtr = Module.findExportByName("libc.so", "stat");
var stat = new NativeFunction(statPtr, 'int', ['pointer', 'pointer']);
Interceptor.replace(statPtr, new NativeCallback(function(pathname, statbuf) {
    var PH = pathname.readCString();
    var Hide = (RootPath.indexOf(PH) > -1);
    if (Hide) {
        console.log("stat : ", PH);
        pathname.writeUtf8String("MadeBy@ApkUnpacker");
        return stat(pathname, statbuf);
    }
    return stat(pathname, statbuf);
}, 'int', ['pointer', 'pointer']))
Interceptor.attach(Module.findExportByName(null, "strstr"), {
    onEnter: function(args) {
        this.root = false;
        var str1 = args[0].readCString();
        var str2 = args[1].readCString();
        var Hide = (RootPath.indexOf(str1) > -1);
        var Hide2 = (RootPath.indexOf(str2) > -1);
        if (Hide == true || Hide2 == true) {
            this.root = true;
            // console.log("strstr : ", str1, str2);
        }
        if (str1.indexOf(" /system/") !== -1 || str2.indexOf(" /system/") !== -1 || str1.indexOf(" /vendor/") !== -1 || str2.indexOf(" /vendor/") !== -1 || str1.indexOf(" /product/") !== -1 || str2.indexOf(" /product/") !== -1 || str1.indexOf(" /system_ext/") !== -1 || str2.indexOf(" /system_ext/") !== -1 || str1.indexOf("linker") !== -1 || str2.indexOf("linker") !== -1) {
            this.root = true;
            console.log("strstr : ", str1, str2);
        }
    },
    onLeave: function(retval) {
        if (this.root) {
            retval.replace(0);
        }
    }
});

var systemPropFindPtr = Module.findExportByName("libc.so", "__system_property_find");
var systemPropFind = new NativeFunction(systemPropFindPtr, 'pointer', ['pointer']);
Interceptor.replace(systemPropFindPtr, new NativeCallback(function(command) {
    var cmd = command.readCString();
    var Hide = (RootPath.indexOf(cmd) > -1);
    if (Hide) {
        console.warn("system_Prop_Find: ", cmd, systemPropFind(command));
        command.writeUtf8String("cp");
        return systemPropFind(command);
    }
    return systemPropFind(command);
}, 'pointer', ['pointer']))

var strtokPtr = Module.findExportByName("libc.so", "strtok");
var strtok = new NativeFunction(strtokPtr, 'pointer', ['pointer', 'pointer']);
Interceptor.replace(strtokPtr, new NativeCallback(function(str, delim) {
    var exe = str.readCString();
    var exe2 = delim.readCString();
    var Hide = (Executable.indexOf(exe) > -1);
    var Hide2 = (Executable.indexOf(exe) > -1);
    if (Hide) {
        console.log("strtok : ", exe);
        str.writeUtf8String("pm path com.android.settings");
        return strtok(str, delim);
    }
    if (Hide2) {
        console.log("strtok : ", delim);
        delim.writeUtf8String("pm path com.android.settings");
        return strtok(str, delim);
    }
    return strtok(str, delim);
}, 'pointer', ['pointer', 'pointer']))

var faccessatPtr = Module.findExportByName("libc.so", "faccessat");
var faccessat = new NativeFunction(faccessatPtr, 'int', ['int', 'pointer', 'int', 'int']);
Interceptor.replace(faccessatPtr, new NativeCallback(function(dirfd, path, mode, flag) {
    var retval = faccessat(dirfd, path, mode, flag);
    var PN = path.readCString();
    var Hide = (RootPath.indexOf(PN) > -1);
    if (Hide) {
        console.log("faccessat : ", PN);
        path.writeUtf8String("MadeBy@ApkUnpacker");
        return faccessat(dirfd, path, mode, flag);
    }
    return faccessat(dirfd, path, mode, flag);
}, 'int', ['int', 'pointer', 'int', 'int']))
try {
    var getenvPtr = Module.findExportByName("libc.so", "getenv");
    var getenv = new NativeFunction(getenvPtr, 'pointer', ['pointer']);
    Interceptor.replace(getenvPtr, new NativeCallback(function(command) {
        var cmd = command.readCString();
        var Hide = (Executable.indexOf(cmd) > -1);
        if (Hide) {
            console.log("getenv: ", cmd, getenv(command));
            command.writeUtf8String("time");
            return getenv(command);
        }
        return getenv(command);
    }, 'pointer', ['pointer']))

} catch (e) {}
var pathconfPtr = Module.findExportByName("libc.so", "pathconf");
var pathconf = new NativeFunction(pathconfPtr, 'long', ['pointer', 'int']);
Interceptor.replace(pathconfPtr, new NativeCallback(function(path, name) {
    var PN = path.readCString();
    var Hide = (RootPath.indexOf(PN) > -1);
    if (Hide) {
        console.log("pathconf : ", PN);
        pathname.writeUtf8String("MadeBy@ApkUnpacker");
        return pathconf(path, name);
    }
    return pathconf(path, name);
}, 'long', ['pointer', 'int']))

/*
 Other Exec* Method also there but not covered them because of less use
*/
try {
    var execvPtr = Module.findExportByName("libc.so", "execv");
    var execv = new NativeFunction(execvPtr, 'int', ['pointer', 'pointer']);
    Interceptor.replace(execvPtr, new NativeCallback(function(pathname, argv) {
        var PH = pathname.readCString();
        var Hide = (Executable.indexOf(PH) > -1);
        console.log("execv : ", PH);
        if (Hide) {
            console.log("execv : ", PH);
            pathname.writeUtf8String("/system/bin/cp");
            return execvPtr(pathname, statbuf);
        }
        return execvPtr(pathname, statbuf);
    }, 'int', ['pointer', 'pointer']))
} catch (e) {
    console.error(e);
}
try {
    var execvpPtr = Module.findExportByName("libc.so", "execvp");
    var execvp = new NativeFunction(execvpPtr, 'int', ['pointer', 'pointer']);
    Interceptor.replace(execvpPtr, new NativeCallback(function(pathname, argv) {
        var PH = pathname.readCString();
        var Hide = (Executable.indexOf(PH) > -1);
        console.log("execvp : ", PH);
        if (Hide) {
            console.log("execvp : ", PH);
            pathname.writeUtf8String("/system/bin/cp");
            return execvp(pathname, argv);
        }
        return execvp(pathname, argv);
    }, 'int', ['pointer', 'pointer']))
} catch (e) {
    console.error(e);
}
try {
    var execvpePtr = Module.findExportByName("libc.so", "execvpe");
    var execvpe = new NativeFunction(execvpePtr, 'int', ['pointer', 'pointer', 'pointer']);
    Interceptor.replace(execvpePtr, new NativeCallback(function(pathname, argv, envp) {
        var PH = pathname.readCString();
        var Hide = (Executable.indexOf(PH) > -1);
        if (Hide) {
            console.log("execvpe : ", PH);
            pathname.writeUtf8String("/system/bin/cp");
            return execvpe(pathname, argv, envp);
        }
        return execvpe(pathname, argv, envp);
    }, 'int', ['pointer', 'pointer', 'pointer']))
} catch (e) {
    console.error(e);
}
Java.performNow(function() {
    try {
        var NewPKG = "com.that.package.which.not.exist";
        var PackageManagerC = Java.use("android.content.pm.PackageManager");
        var PackageManager = Java.use("android.app.ApplicationPackageManager");
        PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pkgname, flags) {
            var Hide = (RootPath.indexOf(pkgname) > -1);
            if (Hide) {
                console.log("Bypass Package: " + pkgname);
                var newpkgname = "this.is.funny.package.name";
                return this.getPackageInfo.call(this, newpkgname, flags);
            }
            return this.getPackageInfo.call(this, pkgname, flags);
        }
        PackageManager.getApplicationInfo.overload("java.lang.String", "int").implementation = function(str, flag) {
            var PKInfo = this.getApplicationInfo(str, flag);
            var Hide = (RootPath.indexOf(str) > -1);
            if (Hide) {
                console.log("AppInfo By getApplicationInfo 2", str);
                return this.getApplicationInfo.call(this, NewPKG, flag);
            }
            return PKInfo;
        }

        var APM = Java.use("android.app.ApplicationPackageManager");
        APM.getLaunchIntentForPackage.overload("java.lang.String").implementation = function(pkg) {
            var Hide = (RootPath.indexOf(pkg) > -1);
            if (Hide) {
                console.log("getLaunchIntentForPackage : ", pkg);
                var fix = "com.google.play.store";
                return this.getLaunchIntentForPackage.call(this, fix);
            }
            return this.getLaunchIntentForPackage(pkg);

        }
        APM.getPackageUidAsUser.overload("java.lang.String", "int").implementation = function(pkg, one) {
            var Hide = (RootPath.indexOf(pkg) > -1);
            if (Hide) {
                console.log("getPackageUidAsUser :", pkg);
                var fix = "com.google.play.store";
                return this.getPackageUidAsUser.call(this, fix, one);
            }
            return this.getPackageUidAsUser(pkg, one);

        }
        APM.getPackageUidAsUser.overload("java.lang.String", "int", "int").implementation = function(pkg, one, two) {
            var Hide = (RootPath.indexOf(pkg) > -1);
            if (Hide) {
                console.log("getPackageUidAsUser : ", pkg);
                var fix = "com.google.play.store";
                return this.getPackageUidAsUser.call(this, fix, one, two);
            }
            return this.getPackageUidAsUser(pkg, one, two);

        }
        APM.getPackageUid.overload("java.lang.String", "int").implementation = function(pkg, one) {
            var Hide = (RootPath.indexOf(pkg) > -1);
            if (Hide) {
                console.log("getPackageUid :", pkg);
                var fix = "com.google.play.store";
                return this.getPackageUid.call(this, fix, one);
            }
            return this.getPackageUid(pkg, one);

        }

        APM.getPackageInfoAsUser.overload("java.lang.String", "int", "int").implementation = function(pkg, one, two) {
            var Hide = (RootPath.indexOf(pkg) > -1);
            if (Hide) {
                console.log("getPackageInfoAsUser : ", pkg);
                var fix = "com.google.play.store";
                return this.getPackageInfoAsUser.call(this, fix, one, two);
            }
            return this.getPackageInfoAsUser(pkg, one, two);

        }

        APM.getApplicationInfoAsUser.overload("java.lang.String", "int", "int").implementation = function(pkg, one, two) {
            var Hide = (RootPath.indexOf(pkg) > -1);
            if (Hide) {
                console.log("getApplicationInfoAsUser : ", pkg);
                var fix = "com.google.play.store";
                return this.getApplicationInfoAsUser.call(this, fix, one, two);
            }
            return this.getApplicationInfoAsUser(pkg, one, two);

        }

        APM.getApplicationInfo.overload("java.lang.String", "int").implementation = function(pkg, one) {
            var Hide = (RootPath.indexOf(pkg) > -1);
            if (Hide) {
                console.log("getApplicationInfo : ", pkg);
                var fix = "com.google.play.store";
                return this.getApplicationInfo.call(this, fix, one);
            }
            return this.getApplicationInfo(pkg, one);

        }

        PackageManagerC.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pkgname, flags) {
            var Hide = (RootPath.indexOf(pkgname) > -1);
            if (Hide) {
                console.log("Bypass Package: " + pkgname);
                var newpkgname = "this.is.funny.package.name";
                return this.getPackageInfo.call(this, newpkgname, flags);
            }
            return this.getPackageInfo.call(this, pkgname, flags);
        }

        var StubProxy = Java.use("android.content.pm.IPackageManager$Stub$Proxy");
        StubProxy.getPackageInfo.overload("java.lang.String", "int", "int").implementation = function(Str, Flag, Flag2) {
            var PKInfo = this.getPackageInfo(Str, Flag, Flag2);
            var Hide = (RootPath.indexOf(Str) > -1);
            if (Hide) {
                console.log("app Info By getPackageInfo", Str);
                return this.getPackageInfo.call(this, NewMagisk, Flag, Flag2);
            }
            return PKInfo;
        }
        StubProxy.getApplicationInfo.overload("java.lang.String", "int", "int").implementation = function(Str, Flag, Flag2) {
            var PKInfo = this.getApplicationInfo(Str, Flag, Flag2);
            var Hide = (RootPath.indexOf(Str) > -1);
            if (Hide) {
                console.log("app Info By getApplicationInfo", Str);
                return this.getApplicationInfo.call(this, NewMagisk, Flag, Flag2);
            }
            return PKInfo;
        }



        var ioFile = Java.use('java.io.File');
        ioFile.exists.implementation = function() {
            var name = ioFile.getName.call(this);
            var FakeReturn = (RootPath.indexOf(name) > -1);
            var FakeReturn2 = (Executable.indexOf(name) > -1);
            if (FakeReturn) {
                console.log("Binary : ", name, " Check Found");
                return false;
            }
            if (FakeReturn2) {
                console.log("Binary 2 : ", name, " Check Found");
                return false;
            }
            return this.exists.call(this);
        };
        var Context = Java.use('android.app.ContextImpl');
        Context.bindIsolatedService.overload("android.content.Intent", "int", "java.lang.String", "java.util.concurrent.Executor", "android.content.ServiceConnection").implementation = function(intent, i, str, current, service) {
            var ToS = intent.toString();
            if (ToS.indexOf("com.google.android.webview") < 0) {
                console.warn("Isolated Service Started , Probably Checks : ", intent);
            }
            return this.bindIsolatedService(intent, i, str, current, service);
        }
        var BufferedReader = Java.use('java.io.BufferedReader');
        BufferedReader.readLine.overload().implementation = function() {
            var text = this.readLine.call(this);
            if (text === null) {} else {
                var Hide = (RootPath.indexOf(text) > -1);
                if (Hide) {
                    console.log("Bypass readline : ", text);
                    var cool = "we.from.other.universe";
                    return cool;
                }
            }
            return text;
        };
    } catch (e) {
        console.error(e);
    }
})
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1546388760 @apkunpacker/hideroot
