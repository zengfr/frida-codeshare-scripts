
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1345724263 @luoyesiqiu/android-native-log
function native_log(type,tag,msg){
var tag_new = Memory.allocUtf8String(tag)
var msg_new = Memory.allocUtf8String(msg)
var param_type_list = ["int","pointer","pointer","..."]
var print_ptr = Module.getExportByName("liblog.so","__android_log_print")
const print = new NativeFunction(print_ptr, 'int', param_type_list)
print(type,tag_new,msg_new)
}

function logv(tag,msg){
native_log(2,tag,msg)
}

function logd(tag,msg){
native_log(3,tag,msg)
} 

function logi(tag,msg){
native_log(4,tag,msg)
} 

function logw(tag,msg){
native_log(5,tag,msg)
} 

function loge(tag,msg){
native_log(6,tag,msg)
} 

function logf(tag,msg){
native_log(7,tag,msg)
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1345724263 @luoyesiqiu/android-native-log
