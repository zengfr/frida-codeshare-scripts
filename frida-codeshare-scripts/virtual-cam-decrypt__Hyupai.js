
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:330458334 @Hyupai/virtual-cam-decrypt
const utils = {
colors: {
red: function(string) {
return '\x1b[31m' + string + '\x1b[0m';
},

green: function(string) {
return '\x1b[32m' + string + '\x1b[0m';
},

blue: function(string) {
return '\x1b[34m' + string + '\x1b[0m';
},

cyan: function(string) {
return '\x1b[36m' + string + '\x1b[0m';
},
},

backtrace: function(context) {
return 'Backtrace:\n' + Thread.backtrace(context, Backtracer.FUZZY).map(DebugSymbol.fromAddress).join('\n') + '\n';
},

readstring: function(address, index) {
address = ptr(address);
if (index == undefined) {
index = 0;
}
else {
index += 1;
}

try {
var char = address.add(index).readU8();
if ((char >= 0x20) && (char <= 0x7E)) {
return this.readstring(address, index);
}
}
catch (error) {}

if (index < 4) {
return undefined;
}

return address.readUtf8String(index);
},

address_is_readable: function(address) {
address = ptr(address);
var protection = 'r--';
var ranges = Process.enumerateRanges(protection);
for (var index in ranges) {
var start = ranges[index]['base'];
var stop = start.add(ranges[index]['size']);
if ((address >= start) && (address <= stop)) {
// console.log('Range: ' + start + ' - ' + stop);
return true;
}
}
return false;
},

telescope: function(address, stack) {
address = ptr(address);

if (stack == undefined) {
stack = []
stack.push('[' + address + ']');
}
else {
stack.push(address);
}
if (this.address_is_readable(address)) {
var printable = this.readstring(address);
if (printable != undefined) {
stack.push(printable)
}
else {
try {
return this.telescope(address.readPointer(), stack);
}
catch (error) {
//Ignore
}
}
}
return stack.join(' -> ');
}
}


const openssl = {
BIO_new: function(BIO_METHOD) {
var name = "BIO_new";
var address = Module.findExportByName(null, name);
if (address) {
var f = new NativeFunction(address, 'pointer', ['pointer']);
var retval = f(BIO_METHOD);
return retval;
}
else {
throw("Function '" + name + "' not found");
}
},
BIO_free: function(a) {
var name = "BIO_free";
var address = Module.findExportByName(null, name);
if (address) {
var f = new NativeFunction(address, 'int', ['pointer']);
var retval = f(a);
return retval;
}
else {
throw("Function '" + name + "' not found");
}
},
BIO_s_mem: function() {
var name = "BIO_s_mem";
var address = Module.findExportByName(null, name);
if (address) {
var f = new NativeFunction(address, 'pointer', []);
var retval = f();
return retval;
}
else {
throw("Function '" + name + "' not found");
}
},
BIO_gets: function(b, buf, size) {
var name = "BIO_gets";
var address = Module.findExportByName(null, name);
if (address) {
var f = new NativeFunction(address, 'int', ['pointer', 'pointer', 'int']);
var retval = f(b, buf, size);
return retval;
}
else {
throw("Function '" + name + "' not found");
}
},
EVP_PKEY_id: function(pkey) {
var name = "EVP_PKEY_id";
var address = Module.findExportByName(null, name);
if (address) {
var f = new NativeFunction(address, 'int', ['pointer']);
var retval = f(pkey);
return retval;
}
else {
throw("Function '" + name + "' not found");
}
},
EVP_PKEY_get1_RSA: function(pkey) {
var name = "EVP_PKEY_get1_RSA";
var address = Module.findExportByName(null, name);
if (address) {
var f = new NativeFunction(address, 'pointer', ['pointer']);
var retval = f(pkey);
return retval;
}
else {
throw("Function '" + name + "' not found");
}
},
PEM_write_bio_PrivateKey: function(bp, x, enc, kstr, klen, cb, u) {
var name = "PEM_write_bio_PrivateKey";
var address = Module.findExportByName(null, name);
if (address) {
var f = new NativeFunction(address, 'int', ['pointer', 'pointer', 'pointer', 'pointer', 'int', 'pointer', 'pointer']);
var retval = f(bp, x, enc, kstr, klen, cb, u);
return retval;
}
else {
throw("Function '" + name + "' not found");
}
},
PEM_write_bio_PUBKEY: function(bp, x) {
var name = "PEM_write_bio_PUBKEY";
var address = Module.findExportByName(null, name);
if (address) {
var f = new NativeFunction(address, 'int', ['pointer', 'pointer']);
var retval = f(bp, x);
return retval;
}
else {
throw("Function '" + name + "' not found");
}
},
PEM_write_bio_RSAPrivateKey: function(bp, x, enc, kstr, klen, cb, u) {
var name = "PEM_write_bio_RSAPrivateKey";
var address = Module.findExportByName(null, name);
if (address) {
var f = new NativeFunction(address, 'int', ['pointer', 'pointer', 'pointer', 'pointer', 'int', 'pointer', 'pointer']);
var retval = f(bp, x, enc, kstr, klen, cb, u);
return retval;
}
else {
throw("Function '" + name + "' not found");
}
},
PEM_write_bio_RSAPublicKey: function(bp, x) {
var name = "PEM_write_bio_RSAPublicKey";
var address = Module.findExportByName(null, name);
if (address) {
var f = new NativeFunction(address, 'int', ['pointer', 'pointer']);
var retval = f(bp, x);
return retval;
}
else {
throw("Function '" + name + "' not found");
}
},
EVP_PKEY_print_private: function(out, pkey, indent, pctx) {
var name = "EVP_PKEY_print_private";
var address = Module.findExportByName(null, name);
if (address) {
var f = new NativeFunction(address, 'int', ['pointer', 'pointer', 'int', 'pointer']);
var retval = f(out, pkey, indent, pctx);
return retval;
}
else {
throw("Function '" + name + "' not found");
}
},
RSA_print: function(bp, x, offset) {
var name = "RSA_print";
var address = Module.findExportByName(null, name);
if (address) {
var f = new NativeFunction(address, 'int', ['pointer', 'pointer', 'int']);
var retval = f(bp, x, offset);
return retval;
}
else {
throw("Function '" + name + "' not found");
}
},
EVP_CIPHER_CTX_nid: function(ctx) {
var name = "EVP_CIPHER_CTX_nid";
var address = Module.findExportByName(null, name);
if (address) {
var f = new NativeFunction(address, 'int', ['pointer']);
var retval = f(ctx);
return retval;
}
else {
throw("Function '" + name + "' not found");
}
},
OBJ_nid2ln: function(n) {
var name = "OBJ_nid2ln";
var address = Module.findExportByName(null, name);
if (address) {
var f = new NativeFunction(address, 'pointer', ['int']);
var retval = f(n);
return retval;
}
else {
throw("Function '" + name + "' not found");
}
},
}

const easy = {
export_pkey: function(pkey) {
const BUFSIZE = 512;
var buffer = Memory.alloc(BUFSIZE);
var output = '';
//Create memory bio
var mem = openssl.BIO_new(openssl.BIO_s_mem());
//Export the key
openssl.EVP_PKEY_print_private(mem, pkey, 0, ptr(0));

while (openssl.BIO_gets(mem, buffer, BUFSIZE) > 0) {
output += buffer.readUtf8String();
}
if (openssl.PEM_write_bio_PUBKEY(mem, pkey) > 0) {
while (openssl.BIO_gets(mem, buffer, BUFSIZE) > 0) {
output += buffer.readUtf8String();
}
}
if (openssl.PEM_write_bio_PrivateKey(mem, pkey, ptr(0), ptr(0), 0, ptr(0), ptr(0)) > 0) {
while (openssl.BIO_gets(mem, buffer, BUFSIZE) > 0) {
output += buffer.readUtf8String();
}
}
openssl.BIO_free(mem); //Clean up
return output;
},
export_rsa: function(rsa) {
const BUFSIZE = 512;
var buffer = Memory.alloc(BUFSIZE);
var output = '';
var mem = openssl.BIO_new(openssl.BIO_s_mem());
if (rsa != ptr(0)) {
if (openssl.PEM_write_bio_RSAPublicKey(mem, rsa) > 0) {
while (openssl.BIO_gets(mem, buffer, BUFSIZE) > 0) {
output += buffer.readUtf8String();
}
}
if (openssl.PEM_write_bio_RSAPrivateKey(mem, rsa, ptr(0), ptr(0), 0, ptr(0), ptr(0)) > 0) {
while (openssl.BIO_gets(mem, buffer, BUFSIZE) > 0) {
output += buffer.readUtf8String();
}
}
}
openssl.BIO_free(mem); //Clean up
return output;
},

export_pkey_from_ctx: function(ctx) {
//This is a hack, if the structure changes, this will no longer work!
// https://github.com/openssl/openssl/blob/master/include/crypto/evp.h#L21
var pkey = ctx.add(16).readPointer();
// console.log(hexdump(ctx));
// console.log(hexdump(pkey));
return this.export_pkey(pkey);
},

evp_ciper_type_str: function(ctx) {
var pstr = openssl.OBJ_nid2ln(openssl.EVP_CIPHER_CTX_nid(ctx));
if (pstr == null){
return 'Cipher: unknown';
}
else {
return 'Cipher: ' + pstr.readUtf8String();
}
},
}

function hooks() {
(function() {
var name = 'HMAC_Init_ex';
var address = Module.findExportByName(null, name);
if (address != null) {
console.log('[!] Hooking: ' + name + ' @ 0x' + address.toString(16));
try {
Interceptor.attach(address, {
onEnter: function(args) {
this.args = [];
this.args.push(args[0]); this.args.push(args[1]); this.args.push(args[2]); this.args.push(args[3]); this.args.push(args[4]);
},
onLeave: function(result) {
console.log(name + '(' + 'ctx=' + this.args[0] + ', ' + 'key=' + this.args[1] + ', ' + 'len=' + this.args[2] + ', ' + 'md=' + this.args[3] + ', ' + 'impl=' + this.args[4] + ') = ' + result);
console.log(utils.colors.cyan('Key: '));
console.log(utils.colors.cyan(hexdump(ptr(this.args[1]), {length: this.args[2].toInt32()})));
console.log(utils.colors.red(utils.backtrace(this.context)));
},
});
}
catch (error) {
console.error(error);
}
}
})();

(function() {
var name = 'EVP_PKEY_encrypt';
var address = Module.findExportByName(null, name);
if (address != null) {
console.log('[!] Hooking: ' + name + ' @ 0x' + address.toString(16));
try {
Interceptor.attach(address, {
onEnter: function(args) {
this.args = [];
this.args.push(args[0]); this.args.push(args[1]); this.args.push(args[2]); this.args.push(args[3]); this.args.push(args[4]);
},
onLeave: function(result) {
console.log(name + '(' + 'ctx=' + this.args[0] + ', ' + 'out=' + this.args[1] + ', ' + 'outlen=' + this.args[2] + ', ' + 'in=' + this.args[3] + ', ' + 'inlen=' + this.args[4] + ') = ' + result);
console.log(utils.colors.red(easy.export_pkey_from_ctx(this.args[0])));
console.log(utils.colors.cyan('Buffer in: '));
console.log(utils.colors.cyan(hexdump(ptr(this.args[3]), {length: this.args[4].toInt32()})));
},
});
}
catch (error) {
console.error(error);
}
}
})();

(function() {
var name = 'RSA_public_decrypt';
var address = Module.findExportByName(null, name);
if (address != null) {
console.log('[!] Hooking: ' + name + ' @ 0x' + address.toString(16));
try {
Interceptor.attach(address, {
onEnter: function(args) {
this.args = [];
this.args.push(args[0]); this.args.push(args[1]); this.args.push(args[2]); this.args.push(args[3]); this.args.push(args[4]);
},
onLeave: function(result) {
console.log(name + '(' + 'flen=' + this.args[0] + ', ' + 'from=' + this.args[1] + ', ' + 'to=' + this.args[2] + ', ' + 'rsa=' + this.args[3] + ', ' + 'padding=' + this.args[4] + ') = ' + result);
console.log(utils.colors.red(easy.export_rsa(this.args[3])));
console.log(utils.colors.cyan('Buffer to: '));
console.log(utils.colors.cyan(hexdump(ptr(this.args[2]), {length: result.toInt32()})));
},
});
}
catch (error) {
console.error(error);
}
}
})();


(function() {
var name = 'EVP_PKEY_keygen';
var address = Module.findExportByName(null, name);
if (address != null) {
console.log('[!] Hooking: ' + name + ' @ 0x' + address.toString(16));
try {
Interceptor.attach(address, {
onEnter: function(args) {
this.args = [];
this.args.push(args[0]); this.args.push(args[1]);
},
onLeave: function(result) {
console.log(name + '(' + 'ctx=' + this.args[0] + ', ' + 'ppkey=' + this.args[1] + ') = ' + result);
var pkey = this.args[1].readPointer();
console.log(utils.colors.red(easy.export_pkey(pkey)));
},
});
}
catch (error) {
console.error(error);
}
}
})();

(function() {
var name = 'EVP_DecryptInit_ex';
var address = Module.findExportByName(null, name);
if (address != null) {
console.log('[!] Hooking: ' + name + ' @ 0x' + address.toString(16));
try {
Interceptor.attach(address, {
onEnter: function(args) {
this.args = [];
this.args.push(args[0]); this.args.push(args[1]); this.args.push(args[2]); this.args.push(args[3]); this.args.push(args[4]);
},
onLeave: function(result) {
console.log(name + '(' + 'ctx=' + this.args[0] + ', ' + 'cipher=' + this.args[1] + ', ' + 'impl=' + this.args[2] + ', ' + 'key=' + this.args[3] + ', ' + 'iv=' + this.args[4] + ') = ' + result);
console.log(utils.colors.blue(easy.evp_ciper_type_str(this.args[0])));
console.log(utils.colors.blue('Key:'));
console.log(utils.colors.blue(hexdump(this.args[3], {length: 32})));
console.log(utils.colors.blue('IV:'));
console.log(utils.colors.blue(hexdump(this.args[4], {length: 16})));
},
});
}
catch (error) {
console.error(error);
}
}
})();

(function() {
var name = 'EVP_DecryptUpdate';
var address = Module.findExportByName(null, name);
if (address != null) {
console.log('[!] Hooking: ' + name + ' @ 0x' + address.toString(16));
try {
Interceptor.attach(address, {
onEnter: function(args) {
this.args = [];
this.args.push(args[0]); this.args.push(args[1]); this.args.push(args[2]); this.args.push(args[3]); this.args.push(args[4]);
},
onLeave: function(result) {
console.log(name + '(' + 'ctx=' + this.args[0] + ', ' + 'out=' + this.args[1] + ', ' + 'outl=' + this.args[2] + ', ' + 'in=' + this.args[3] + ', ' + 'inl=' + this.args[4] + ') = ' + result);
console.log(utils.colors.cyan('Buffer out: '));
console.log(utils.colors.cyan(hexdump(ptr(this.args[1]), {length: this.args[2].readUInt()})));
},
});
}
catch (error) {
console.error(error);
}
}
})();


(function() {
var name = 'EVP_DecryptFinal_ex';
var address = Module.findExportByName(null, name);
if (address) {
            var module = Process.findModuleByAddress(address);
            console.log('[!] Found', name, '@', address, 'in module', module.name, 'base:', module.base);
        }
if (address != null) {
console.log('[!] Hooking: ' + name + ' @ 0x' + address.toString(16));
try {
Interceptor.attach(address, {
onEnter: function(args) {
this.args = [];
this.args.push(args[0]); this.args.push(args[1]); this.args.push(args[2]);
},
onLeave: function(result) {
console.log(name + '(' + 'ctx=' + this.args[0] + ', ' + 'outm=' + this.args[1] + ', ' + 'outl=' + this.args[2] + ') = ' + result);
console.log(utils.colors.cyan('Buffer out: '));
console.log(utils.colors.cyan(hexdump(ptr(this.args[1]), {length: this.args[2].readUInt()})));
},
});
}
catch (error) {
console.error(error);
}
}
})();

(function() {
var name = 'EVP_EncryptInit_ex';
var address = Module.findExportByName(null, name);
if (address != null) {
console.log('[!] Hooking: ' + name + ' @ 0x' + address.toString(16));
try {
Interceptor.attach(address, {
onEnter: function(args) {
this.args = [];
this.args.push(args[0]); this.args.push(args[1]); this.args.push(args[2]); this.args.push(args[3]); this.args.push(args[4]);
},
onLeave: function(result) {
console.log(name + '(' + 'ctx=' + this.args[0] + ', ' + 'cipher=' + this.args[1] + ', ' + 'impl=' + this.args[2] + ', ' + 'key=' + this.args[3] + ', ' + 'iv=' + this.args[4] + ') = ' + result);
console.log(utils.colors.blue(easy.evp_ciper_type_str(this.args[0])));
console.log(utils.colors.blue('Key:'));
console.log(utils.colors.blue(hexdump(this.args[3], {length: 32})));
console.log(utils.colors.blue('IV:'));
console.log(utils.colors.blue(hexdump(this.args[4], {length: 16})));
},
});
}
catch (error) {
console.error(error);
}
}
})();

(function() {
var name = 'EVP_EncryptUpdate';
var address = Module.findExportByName(null, name);
if (address != null) {
console.log('[!] Hooking: ' + name + ' @ 0x' + address.toString(16));
try {
Interceptor.attach(address, {
onEnter: function(args) {
this.args = [];
this.args.push(args[0]); this.args.push(args[1]); this.args.push(args[2]); this.args.push(args[3]); this.args.push(args[4]);
},
onLeave: function(result) {
console.log(name + '(' + 'ctx=' + this.args[0] + ', ' + 'out=' + this.args[1] + ', ' + 'outl=' + this.args[2] + ', ' + 'in=' + this.args[3] + ', ' + 'inl=' + this.args[4] + ') = ' + result);
console.log(utils.colors.cyan('Buffer in: '));
console.log(utils.colors.cyan(hexdump(ptr(this.args[3]), {length: this.args[4].toInt32()})));
},
});
}
catch (error) {
console.error(error);
}
}
})();

(function() {
var name = 'EVP_EncryptFinal_ex';
var address = Module.findExportByName(null, name);
if (address != null) {
console.log('[!] Hooking: ' + name + ' @ 0x' + address.toString(16));
try {
Interceptor.attach(address, {
onEnter: function(args) {
this.args = [];
this.args.push(args[0]); this.args.push(args[1]); this.args.push(args[2]);
},
onLeave: function(result) {
console.log(name + '(' + 'ctx=' + this.args[0] + ', ' + 'out=' + this.args[1] + ', ' + 'outl=' + this.args[2] + ') = ' + result);
},
});
}
catch (error) {
console.error(error);
}
}
})();

}

function overrides() {
(function() {
var name = 'SSL_set_verify';
var address = Module.findExportByName(null, name);
if (address != null) {
console.log('[!] Hooking: ' + name + ' @ 0x' + address.toString(16));
Interceptor.attach(address, {
onEnter: function(args) {
this.ssl = args[0];
this.mode = args[1];
//Replace the value!
args[1] = ptr(0);
console.log(utils.colors.green('[+] Setting ' + name + ' to mode = ' + args[1]));
},
});
}
})();

(function() {
var name = 'EVP_PKEY_verify';
var address = Module.findExportByName(null, name);
if (address != null) {
console.log('[!] Hooking: ' + name + ' @ 0x' + address.toString(16));
Interceptor.attach(address, {
onLeave: function(result) {
//Replace the value!
result.replace(1);
console.log(utils.colors.green('[+] Setting ' + name + ' to result = ' + result));
}
});
}
})();

}

hooks();
overrides();
console.log(utils.colors.green('[+] Loaded'));
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:330458334 @Hyupai/virtual-cam-decrypt
