
//https://github.com/zengfr/frida-codeshare-scripts
//1411399661 @tiiime/android-network-security-config-bypass
// frida -U -l network-security-config-bypass.js --no-pause -f your.package.name
Java.perform(function() {
    NetworkSecurityConfig_Builder = Java.use("android.security.net.config.NetworkSecurityConfig$Builder")
    CertificatesEntryRef = Java.use("android.security.net.config.CertificatesEntryRef")
    CertificateSource = Java.use("android.security.net.config.CertificateSource")
    UserCertificateSource = Java.use("android.security.net.config.UserCertificateSource")

    NetworkSecurityConfig_Builder.getEffectiveCertificatesEntryRefs.implementation = function() {
        origin = this.getEffectiveCertificatesEntryRefs()

        source = UserCertificateSource.getInstance()
        userCert = CertificatesEntryRef.$new(source, true)
        origin.add(userCert)

        return origin
    }
})
//https://github.com/zengfr/frida-codeshare-scripts
//1411399661 @tiiime/android-network-security-config-bypass
