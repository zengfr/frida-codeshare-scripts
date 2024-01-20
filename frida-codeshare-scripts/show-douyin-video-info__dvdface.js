
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-994988580 @dvdface/show-douyin-video-info
Java.perform(function() {




    // by override toString of simVideo , we can see the video url the douyin playing(not include live video)
    // by compare resolution of layer by command "dumpsys SurfaceFlinger  | grep -i "^ SurfaceView\[com.ss" -A 3" to video resolution , we can tell if douyin enable Super Resolution. 
    /**
     SimVideo{
        playAddr=SimVideoUrlModel{
                sourceId=7392471712748571919,
                uri=v0300fg10000cqblbdfog65v2friif00,
                duration=176380.0,
                createTime=93831418,
                codecType=1,
                urlList.lastUrl=https://api-play.amemv.com/aweme/v1/play/?video_id=v0300fg10000cqblbdfog65v2friif00&line=0&file_id=dd495302081d4c55bb8c6fd3e9c61049&sign=ca2d7225f09938e6fdc618524b3cd480&is_play_url=1&source=PackSourceEnum_FOLLOW_FEED,
                bitRate=[
                    {
                        bitRate=102554,
                        gearName='ame_gear_cold_r3_adapt_lower_540_2',
                        qualityType=21,
                        codecType=2,
                        hdrType='0',
                        bitrateFormat='mp4',
                        playAddr={
                           urlKey='v0300fg10000cqblbdfog65v2friif00_bytevc2_540p_102554',
                           urlList.size=4
                        }
                    }, {
                        bitRate=94661,
                        gearName='ame_gear_cold_r3_adapt_lowest_540_2',
                        qualityType=29,
                        codecType=2,
                        hdrType='0',
                        bitrateFormat='mp4',
                        playAddr={
                            urlKey='v0300fg10000cqblbdfog65v2friif00_bytevc2_540p_94661',
                            urlList.size=4
                        }
                    }]},
        height=576,
        width=1024,
        ratio='540p,
        videoLength=176380,
        needSetCookie=false
     }
     **/
    var simVideo = Java.use('com.ss.android.ugc.playerkit.simapicommon.model.SimVideo');
    simVideo.toString.implementation = function() {

        var str = this.toString();
        console.log(str);

        return str;
    }
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-994988580 @dvdface/show-douyin-video-info
