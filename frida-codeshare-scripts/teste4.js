
//https://github.com/zengfr/frida-codeshare-scripts
//-1632874755 @BR92Bruno/teste4
Java.perform(function() {

    console.log("teste1");

    var clazz = Java.use('br.com.mobileexploitation.a003variables.MobileExploitationData');
    clazz.setData.implementation = function() {

        //

        console.log("teste2");

        var b1 = Java.use("java.lang.Boolean").$new("True");
        return b1;
        //return clazz.setData.apply(this, arguments);
    }
});

/*
Java.perform(function() {
    var clazz = Java.use('br.com.mobileexploitation.a003variables.MobileExploitationData');
    clazz.setData3.implementation = function() {

        //

        return clazz.setData3.apply(this, arguments);
    }
});
*/
//https://github.com/zengfr/frida-codeshare-scripts
//-1632874755 @BR92Bruno/teste4
