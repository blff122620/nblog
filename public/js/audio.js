(function(){
    $.addLoadEvent(function(){
        var mPlayers = $A('.m-player');
        /*
            {
                album:dom,
                waveform:dom,
                wavesurfer:WaveSurfer.create()
            }
        */
        var wavesurfers = [];//当前页面所有的播放器
        mPlayers.forEach(function(item){
            item.waveform = $$('.waveform',item);
            item.wavesurfer = WaveSurfer.create({
                container: item.waveform,
                waveColor: '#2196f3',
                progressColor: 'purple',
                // barWidth: 2,
                cursorWidth: 1,
                cursorColor: 'rgba(0,0,0,.3)',
                height:60
            });
            wavesurfers.push(item.wavesurfer);
            item.album = $$('.album',item);
            item.rotateDeg = 0;//唱片转动角度
            item.playPause = $$('.play-pause',item);//暂停播放按钮
            item.loading = $$('.loading',item);//loading图片
        });
        
        mPlayers.forEach(function(player){
            player.wavesurfer.load(player.wavesurfer.container.dataset.music);
            player.wavesurfer.on('ready', function () {
                player.loading.classList.remove('vv');
                player.loading.classList.add('vh');//删除loading动画
                player.wavesurfer.container.classList.remove('vh');//显示音乐进度条
            });
            player.album.addEventListener('click',function(event){
                wavesurfers.forEach(function(item){
                //暂停其他的播放器
                    if(player.wavesurfer===item){
                        return;
                    }
                    if(item.isPlaying()){
                        item.stop();
                    }
                    
                });
                mPlayers.forEach(function(player){
                    //暂停所有播放器动画
                    clearTimeout(player.rotateAnimationId);
                    //改变为暂停状态
                    player.playPause.style.backgroundPositionX = '0';
                });
                player.wavesurfer.isPlaying() ? 
                    (function(){
                        player.wavesurfer.pause();
                        clearTimeout(player.rotateAnimationId);
                        //改变为暂停状态
                        player.playPause.style.backgroundPositionX = '0';
                    })()
                    : 
                    (function(){
                        player.wavesurfer.play();
                        //调用唱片旋转动画
                        player.rotateAnimationId = setTimeout(rotateAlbum,time,player);
                        //改变播放状态
                        player.playPause.style.backgroundPositionX = '-28px';
                    })();
                
            });
        });   
    });

    var step = .6, //旋转角度步长
        time = 40; //调用动画间隔
    function rotateAlbum(mplayer){
        mplayer.album.style.transform = 'rotate(' + mplayer.rotateDeg + 'deg)';
        mplayer.playPause.style.transform = 'translate(-50%,-50%) rotate(' + -mplayer.rotateDeg + 'deg)';
        mplayer.rotateDeg += step;
        mplayer.rotateDeg = mplayer.rotateDeg % 360;//限制角度大小
        mplayer.rotateAnimationId = setTimeout(rotateAlbum,time,mplayer);
    }
})();