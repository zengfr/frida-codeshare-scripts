
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:415796602 @juliusdeane/censor-hashes-on-write
// PLATFORM: libc based (Linux, *ix).
//[Usage] frida --codeshare juliusdeane/censor-hashes-on-write <your binary>


/* *******************************************************************
 * Just a proof of concept supporting md5 only.
 *
 * Really easy to improve for multi-hashes.
 ******************************************************************* */
// md5, but it is easy to create regex for uuid, sha, blowfish...
const md5_regex = /[a-fA-F0-9]{32}/gi;

// how many chars on the original hash we want to keep (at the end)
const KEEP_ORIGINAL_CHARS = 4;
// which is the replacement character.
const REPLACEMENT_CHAR = '*';

// We pass a string and lenToReplace chars at the end will be replaced
// with the replacementChar.
function replace_string(string, lenToReplace, replacementChar) {
    return string.substring(0, lenToReplace).split("").map(item => item = replacementChar).join("").concat(string.substring(lenToReplace, string.length));

}

// This is a callback that is invoked by string.replace() so it will
// transform the string using replace_string() if matches md5_regex.
function censor_hash(str, p1, offset, s) {
    const lenToReplace = str.length - KEEP_ORIGINAL_CHARS;
    return replace_string(str, lenToReplace, REPLACEMENT_CHAR);
}

// write is the low level call to write to the file.
// Even when using fprintf the system will invoke write.
var write_ptr = Module.findExportByName(null, "write")

Interceptor.attach(write_ptr, {
    onEnter: function(args) {
        // ssize_t write(int fd, const void *buf, size_t count);
        //                   args[0],       args[1],     args[2]

        // Parse a UTF8 string onto source_string.
        const source_string = args[1].readUtf8String();

        // If matches mdg_regex, apply censor_hash.
        var replacement_string = source_string.replace(md5_regex, censor_hash);

        // Use Frida's magic to replace the string in the argument.
        args[1].writeUtf8String(replacement_string);
    },
    onLeave: function(retval) {
        // by now do nothing.
    }
})
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:415796602 @juliusdeane/censor-hashes-on-write
