
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1158014884 @S03HT3T/fridalab-solution-script
setTimeout(function(){
Java.perform(function(){
var instance;
Java.choose("uk.rossmarks.fridalab.MainActivity",{
onMatch : function(instancee){
instance = instancee;
},
onComplete : function(){}
});


//challenge01
var challenge01 = Java.use("uk.rossmarks.fridalab.challenge_01");
challenge01.chall01.value = 1;
console.log("\n[+] Challenge01 Complete! [+]");

//challenge02
instance.chall02();
console.log("[+] Challenge02 Complete! [+]");

//challenge03
var challenge03 = Java.use("uk.rossmarks.fridalab.MainActivity");
challenge03.chall03.implementation = function(){ //hook chall03 method
console.log("[+] Challenge03 Complete! [+]");
return true; // return chall03's value to ture
}


//challenge04
instance.chall04("frida");
console.log("[+] Challenge04 Complete! [+]");


//challenge05
var challenge05 = Java.use("uk.rossmarks.fridalab.MainActivity");
challenge05.chall05.overload('java.lang.String').implementation = function(s){
this.chall05("frida");
console.log("[+] Challenge05 Complete! [+]");
}

//challenge06
var challenge06 = Java.use("uk.rossmarks.fridalab.challenge_06");
challenge06.chall06.value = 1 ;
challenge06.timeStart.value = challenge06.timeStart.value - 10000 ;
instance.chall06(1);
console.log("[+] Challenge06 Complete! [+]");

//challenge07
var challenge07 = Java.use("uk.rossmarks.fridalab.challenge_07");
for (var i =0 ; i < 9999 ; i++){
if(challenge07.check07Pin(i.toString())){
instance.chall07(i.toString())
console.log("[+] Challenge07 Complete! [+]");
}
}

//challenge08
    var check = Java.cast(instance.findViewById(2131165231), Java.use('android.widget.Button'));
    var string = Java.use('java.lang.String');
    check.setText(string.$new("Confirm"));
    console.log("[+] Challenge08 Complete! [+]");


});
},100);


//https://rossmarks.uk/blog/fridalab/
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1158014884 @S03HT3T/fridalab-solution-script
