var dragMobile = function(result){
    //手机截图用
    var mobileBaseimg = $$('#js-mobile-baseimg'),
        mobileClipimg = $$('#js-mobile-clipimg');
    var mobileClip = $$('#js-mobile-clip');
    var mobileClipHeight ;
    var mobilePortion;
    var mBaseimgWidth;//img的当前宽度
    var loadFlag = 0;
    if(!$.isPc()){
        //首先判断初始状态，如果不是竖屏的，那么返回，啥也不做
        if(window.matchMedia("(orientation: landscape)").matches){
            $$('#js-mobile-wrap-tips').classList.add('df');
            $$('#js-mobile-wrap-tips').classList.remove('dn');
            $$('#js-mobile-wrap-tips').dataset.firstshow = 'true';
            
            return true;
        }
        $$('#js-mobile-wrap').classList.add('df');
        $$('#js-mobile-wrap').classList.remove('dn');
        //手机的裁剪头像图片，在这里编写
        document.body.style.overflow = "hidden";
        $.toggleTouchMove(true);//禁止页面滚动
        mobileBaseimg.src = result;
        mobileClipimg.src = result;
        mobileBaseimg.onload = function(){
            
            if(!loadFlag){
                //图片载入后再做操作,只做一次，需要一个flag
                mobileClipHeight = parseInt(window.getComputedStyle(mobileClip).height);//截取框的高度
                mobilePortion = mobileBaseimg.naturalWidth/mobileBaseimg.naturalHeight; //图片宽高比
                handleMobilePic(mobilePortion,mobileBaseimg,mobileClipHeight);//处理图像，恢复到满clip窗口
                loadFlag++;
                
            }
            
            
        };
        //一个手指移动的时候，要处理图片的移动
        // $$('#js-safe-modal').addEventListener("touchmove",$.handleTouch);
        // $$('#js-safe-modal').addEventListener("touchstart",$.handleTouch);
        // $$('#js-safe-modal').addEventListener("touchend",$.handleTouch);
        //两个手指移动的时候要处理图片的缩放
        $$('#js-safe-modal').addEventListener('gesturestart',$.handleGesture.bind(null,imgScaleStart));
        $$('#js-safe-modal').addEventListener('gesturechange',$.handleGesture.bind(null,imgScale));
        $$('#js-safe-modal').addEventListener('gestureend',$.handleGesture.bind(null,imgScaleOver));
        return true;//在手机里，那么就返回true
        
    }
    //根据比例来对图片进行处理，氛围横向和竖向的
    function handleMobilePic(mobilePortion,mobileBaseimg,mobileClipHeight){
            if(mobilePortion>1){
            //图片为横向图片
            mobileBaseimg.style.width = mobilePortion * mobileClipHeight +'px';//图片最好的宽度是这样的
            mobileBaseimg.style.height =  mobileClipHeight + 'px';//图片高度就是截取框高度
        }else{
            //图片为纵向图片
            mobileBaseimg.style.width = mobileClipHeight + 'px';//图片宽度也就是截取框的高度（宽高相同）
            mobileBaseimg.style.height = mobileClipHeight / mobilePortion + 'px';//图片最好的高度
        }
    }
    
    function imgScaleStart(scale){
        // mBaseimgWidth = parseInt(window.getComputedStyle(mobileBaseimg).width);
        // $$('#test').value = mBaseimgWidth*scale;
        mobileBaseimg.classList.remove("mobile-img-transition");
        //缩放前，移除动画效果，防止卡顿
    }
    function imgScale(scale){
        
        // $$('#test2').value = loadFlag ;
        mobileBaseimg.style.transform = 'scale(' + scale + ')';
    }
    function imgScaleOver(scale){
        var nowBaseimgWidth = parseInt(mobileBaseimg.style.width),
            nowBaseimgHeight = parseInt(mobileBaseimg.style.height),
            defaultMaxPortion = 1.5;//默认的图片最大放大比例
        nowBaseimgWidth = mobileBaseimg.style.width = nowBaseimgWidth*scale +'px';
        //改变宽度，同时也要改变高度
        nowBaseimgHeight = mobileBaseimg.style.height = nowBaseimgHeight*scale +'px';
        mobileBaseimg.style.transform = 'none';//同时最后要取消缩放
        
        // $$('#test').value = mobileBaseimg.style.width;
        // $$('#test2').value = window.getComputedStyle(mobileBaseimg).width;
        
        //判断，如果缩放过小或者过大，那么不允许再次缩放
    
        
        if(parseInt(nowBaseimgWidth)<mobileClipHeight||parseInt(nowBaseimgHeight)<mobileClipHeight){
            //图片的宽度小于截取框的宽度,图片的高度小于默认截取框的高度
            mobileBaseimg.classList.add("mobile-img-transition");//增加动画效果，缓冲图片缩放到合适尺寸
            handleMobilePic(mobilePortion,mobileBaseimg,mobileClipHeight);//处理图像，恢复到满clip窗口
        }
        else if(parseInt(nowBaseimgWidth)>defaultMaxPortion*mobileBaseimg.naturalWidth){
            //图片比例大于2.5,缩小图片
            mobileBaseimg.classList.add("mobile-img-transition");//增加动画效果，缓冲图片缩放到合适尺寸
            mobileBaseimg.style.width = mobileBaseimg.naturalWidth*defaultMaxPortion +'px';//图片最好的宽度是这样的
            mobileBaseimg.style.height =  mobileBaseimg.naturalHeight*defaultMaxPortion + 'px';//图片高度就是截取框高度
        }
    
    }
};