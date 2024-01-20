
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-694720234 @Linuxinet/fridalab-single-script
/*

Author : Vinay Kumar / Linuxinet

*/
console.warn("wait 10 sec to complete challenges")
Java.perform(function() {
    var MainActivity = Java.use('uk.rossmarks.fridalab.MainActivity');
    var Button = Java.use('android.widget.Button');
    var challenge_01 = Java.use('uk.rossmarks.fridalab.challenge_01');
    var challenge_07 = Java.use('uk.rossmarks.fridalab.challenge_07');

    setTimeout(function() {

        // Challenge 1
        challenge_01.getChall01Int.implementation = function() {
            return 1;
        };
        console.warn("Challenge 1 Completed");

        // Challenge 2
        Java.choose('uk.rossmarks.fridalab.MainActivity', {
            onMatch: function(instance) {
                instance.chall02();
            },
            onComplete: function() {}
        });
        console.warn("Challenge 2 Completed");

        // Challenge 3
        MainActivity.chall03.implementation = function() {
            return true;
        };
        console.warn("Challenge 3 Completed");

        // Challenge 4
        Java.choose('uk.rossmarks.fridalab.MainActivity', {
            onMatch: function(instance) {
                instance.chall04('frida');
            },
            onComplete: function() {}
        });
        console.warn("Challenge 4 Completed");

        // Challenge 5
        Java.choose('uk.rossmarks.fridalab.MainActivity', {
            onMatch: function(instance) {
                instance.chall05.implementation = function() {
                    this.completeArr[4] = 0;
                    this.chall05('frida');
                };
                instance.chall05('frida');

            },
            onComplete: function() {}
        });
        console.warn("Challenge 5 Completed");

        // Challenge 6
        var challenge_06 = Java.use('uk.rossmarks.fridalab.challenge_06');
        Java.choose('uk.rossmarks.fridalab.MainActivity', {
            onMatch: function(instance) {
                instance.chall06(challenge_06.chall06.value);
            },
            onComplete: function() {}
        });
        console.warn("Challenge 6 Completed");

        // Challenge 7
        Java.choose('uk.rossmarks.fridalab.MainActivity', {
            onMatch: function(instance) {
                var chall07Value = challenge_07.chall07.value;
                instance.chall07(chall07Value);
                var isCorrectPin = challenge_07.check07Pin(chall07Value);
                var isMatched = chall07Value === challenge_07.chall07.value;
                console.warn('Expected PIN:', chall07Value);
                console.warn('check07Pin() result:', isCorrectPin);
                console.warn('chall07() match:', isMatched);
            },
            onComplete: function() {}
        });
        console.warn("Challenge 7 Completed");

        // Challenge 8
        Java.choose('uk.rossmarks.fridalab.MainActivity', {
            onMatch: function(instance) {
                var button = instance.findViewById(2131165231); // Replace with the correct button ID
                var check = Java.cast(button, Button);
                var string = Java.use('java.lang.String');
                check.setText(string.$new('Confirm'));
            },
            onComplete: function() {}
        });
        console.warn("Challenge 8 Completed");

    }, 10000);
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-694720234 @Linuxinet/fridalab-single-script
