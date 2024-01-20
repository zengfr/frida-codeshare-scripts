
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1608543866 @dvdface/force-open-wechat-xlog
Java.perform(() => {

    Java.choose('com.tencent.mars.xlog.Xlog', {
       
        onMatch: function(instance) {
            console.log('set console xlog open')
            instance.setConsoleLogOpen(0, true)
        },

        onComplete: function() {
         
        }

    })
})
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1608543866 @dvdface/force-open-wechat-xlog
