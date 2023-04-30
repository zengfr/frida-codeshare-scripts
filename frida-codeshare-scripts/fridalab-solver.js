"use strict";

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

// Change class challenge_01's variable 'chall01' to 1
// Run chall02()
// Make chall03() return true
// Send "frida" to chall04()
// Always send "frida" to chall05()
// Run chall06() after 10 seconds with correct value
// Bruteforce check07Pin() then confirm with chall07()
// Change 'check' button's text value to 'Confirm'
// ---------------------------------------------------

console.warn("Run")
console.warn("Wait 10 seconds to solve Chall06")

if (Java.available) {
    // Wait until MainActivity is available
    setTimeout(function () {
        Java.perform(function() {
    var main;
    Java.choose('uk.rossmarks.fridalab.MainActivity', {
                onMatch: function(instance) {
    main = instance;
                },
                onComplete: function() {}
            });
    
    // Chall01
    var challenge_01 = Java.use('uk.rossmarks.fridalab.challenge_01');
    challenge_01.chall01.value = 1;
    
    // Chall02
    main.chall02();
    
    // Chall03
    main.chall03.overload().implementation = function () {
    return true;
    }
    
    // Chall04
    main.chall04('frida');
    
    // Chall05
    main.chall05.overload('java.lang.String').implementation = function (arg0) {
    this.chall05.overload('java.lang.String').call(this,'frida');
    return;
    }
    
    // Chall07
    var challenge_07 = Java.use('uk.rossmarks.fridalab.challenge_07');
    console.log("Target PIN: " + challenge_07.chall07.value);
    for (var i = 9999; i >= 0; i--) {
    if (challenge_07.check07Pin(pad(i, 4))) {
    main.chall07(pad(i,4));
    break;
    }
    }
    
    // Chall08
    var button = Java.use('android.widget.Button');
    var checkid = main.findViewById(2131165231);
    var check = Java.cast(checkid.$handle, button);
    var string = Java.use('java.lang.String');
    check.setText(string.$new("Confirm"));
    
    // Bonus Track
    var textview = Java.use('android.widget.TextView');
    var description = main.findViewById(2131165328);
    var desc = Java.cast(description.$handle, textview);
    var string = Java.use('java.lang.String');
    desc.setText(string.$new("App made by Ross Marks.\nWriteup by Shielder. :)"));
    
    console.warn('Done');
    });
    }, 3000);

setTimeout(function () {
Java.perform(function () {
// Chall06
var challenge_06 = Java.use('uk.rossmarks.fridalab.challenge_06');
challenge_06.addChall06.overload('int').implementation = function (arg0) {
console.warn("Solved Challenge 06\nYou can now click the 'Confirm'/'Check' button");
Java.choose('uk.rossmarks.fridalab.MainActivity', {
            onMatch: function(instance) {
instance.chall06(challenge_06.chall06.value);
            },
            onComplete: function() {}
        });
}
})
}, 10000);
} else {
    console.log("Java not available in this process");
}
//https://github.com/zengfr/frida-codeshare-scripts
//347813136 @TheZ3ro/fridalab-solver