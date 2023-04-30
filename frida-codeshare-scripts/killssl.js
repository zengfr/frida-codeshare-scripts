setImmediate(function() {
    var FBLigerConfig = ObjC.classes.FBLigerConfig;
    console.log(FBLigerConfig);
    // fake facebook ios ssl pinning
    Interceptor.attach(FBLigerConfig['- ligerEnabled'].implementation, {
        onEnter: function(args) {
            console.log(args)
        },
        onLeave: function (retval) {
            retval.replace(0);
        }
      });
});
//https://github.com/zengfr/frida-codeshare-scripts
//-1069017775 @SYM01/killssl