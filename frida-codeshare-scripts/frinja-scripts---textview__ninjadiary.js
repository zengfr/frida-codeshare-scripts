
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1614779017 @ninjadiary/frinja-scripts---textview
/*
Author: secretdiary.ninja
License: (CC BY-SA 4.0) 
 * */

setImmediate(function() {
Java.perform(function() {
var textView = Java.use("android.widget.TextView");

// void setInputType(int type)
textView.setInputType.overload('int').implementation = function(var0) {
console.log("[*] TextView.setInputType('int') called with value: " + var0 + "\n");
return this.setInputType(var0);
};

textView.setCustomSelectionActionModeCallback.overload('android.view.ActionMode$Callback').implementation = function(var0) {
console.log("[*] TextView.setCustomSelectionActionModeCallback('ActionMode.Callback') called with value: " + var0 + "\n");
this.setCustomSelectionActionModeCallback(var0);
};

textView.setLongClickable.overload('boolean').implementation = function(var0) {
console.log("[*] TextView.setLongClickable called with value: " + var0 + "\n");
this.setLongClickable(var0);
};

var textViewCallback = Java.use("android.view.ActionMode$Callback");

textViewCallback.onCreateActionMode.overload('android.view.ActionMode', 'android.view.Menu').implementation = function(var0, var1) {
console.log("[*] ActionMode$callback.onCreateActionMode called with value: " + var0 + "\n");
return this.onCreateActionMode(var0, var1);
};

textViewCallback.onPrepareActionMode.overload('android.view.ActionMode', 'android.view.Menu').implementation = function(var0, var1) {
console.log("[*] ActionMode$callback.onCreateActionMode called with value: " + var0 + "\n");
return this.onPrepareActionMode(var0, var1);
};

textViewCallback.onActionItemClicked.overload('android.view.ActionMode', 'android.view.MenuItem').implementation = function(var0, var1) {
console.log("[*] ActionMode$callback.onCreateActionMode called with value: " + var0 + "\n");
return this.onActionItemClicked(var0, var1);
};

textViewCallback.onDestroyActionMode.overload('android.view.ActionMode').implementation = function(var0) {
console.log("[*] ActionMode$callback.onCreateActionMode called with value: " + var0 + "\n");
return this.onDestroyActionMode(var0);
};
});
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1614779017 @ninjadiary/frinja-scripts---textview
