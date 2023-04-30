function getStackTrace(){
    var Exception = Java.use("java.lang.Exception");
    var ins = Exception.$new("Exception");
    var straces = ins.getStackTrace();
    if (undefined == straces || null == straces) {
        return;
    }
    var result = "";
    for (var i = 0; i < straces.length; i++) {
        var str = "   " + straces[i].toString();
        result += str + "\r\n";
    }
    Exception.$dispose();
    return result;
}

function linkedHashMapPut(){
    var calledFilter = ''
    // var calledFilter = 'com.xxx.xxx'
    var targetClass='java.util.LinkedHashMap';
    var methodName='put';
    var gclass = Java.use(targetClass);
    gclass[methodName].overload('java.lang.Object', 'java.lang.Object').implementation = function(arg0,arg1) {
        var i=this[methodName](arg0,arg1);
        var stackStr = getStackTrace();
        if(calledFilter != "" && stackStr.indexOf(calledFilter) >= 0){
            console.log('\n[java.util.LinkedHashMap.put]'+'\n\targ0= '+arg0+ ", arg1=  "+arg1+'\n\treturn = '+i);
            console.log("==============Stack Start===============");
            console.log(stackStr);
            console.log("==============Stack  End================");
        }
        return i;
    }
}

function MapPut(){
    // var calledFilter = 'com.xxx.xxx'
    var calledFilter = ''
    var targetClass='java.util.Map';
    var methodName='put';
    var gclass = Java.use(targetClass);
    gclass[methodName].overload('java.lang.Object', 'java.lang.Object').implementation = function(arg0,arg1) {
        var i=this[methodName](arg0,arg1);
        var stackStr = getStackTrace();
        if(calledFilter != "" && stackStr.indexOf(calledFilter) >= 0){
            console.log('\n[java.util.Map.put]'+'\n\targ0= '+arg0+ ", arg1=  "+arg1+'\n\treturn = '+i);
            console.log("==============Stack Start===============");
            console.log(stackStr);
            console.log("==============Stack  End================");
        }
        return i;
    }
}


function main(){
    Java.perform(function (){
        linkedHashMapPut();
        MapPut();
    })
}
//https://github.com/zengfr/frida-codeshare-scripts
//-493031532 @007panda/hookjavamaps