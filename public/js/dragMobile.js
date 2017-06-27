var dragMobile = function(result){
    //手机截图用
    var mobileBaseimg = $$('#js-mobile-baseimg'),
        mobileClipimg = $$('#js-mobile-clipimg');
    var mobileClip = $$('#js-mobile-clip');
    var mobileClipHeight ;
    var mobilePortion;
    var mBaseimgWidth;//img的当前宽度
    var loadFlag = 0,//图片载入后只做一次图片初始化，需要一个flag
        imgStartX,imgStartY,imgNowX,imgNowY,imgEndX,imgEndY,imgStartLeft,imgStartTop,imgLeftRightRemain,imgTopBottomRemain;//单手操作手指的相应x,y坐标
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
        // mobileClipimg.src = result;
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
        $$('#js-safe-modal').addEventListener("touchstart",$.handleTouch.bind(null,imgMoveStart));
        $$('#js-safe-modal').addEventListener("touchmove",$.handleTouch.bind(null,imgMoving));
        $$('#js-safe-modal').addEventListener("touchend",$.handleTouch.bind(null,imgMoveOver));
        //两个手指移动的时候要处理图片的缩放
        $$('#js-safe-modal').addEventListener('gesturestart',$.handleGesture.bind(null,imgScaleStart));
        $$('#js-safe-modal').addEventListener('gesturechange',$.handleGesture.bind(null,imgScale));
        $$('#js-safe-modal').addEventListener('gestureend',$.handleGesture.bind(null,imgScaleOver));
        return true;//在手机里，那么就返回true
        
    }

    //图片单手移动开始后的回调函数
    function imgMoveStart(x,y){
        mobileBaseimg.classList.remove("mobile-img-transition");//移动前，移除动画效果，防止卡顿
        imgStartX = x;
        imgStartY = y;
        //这里在计算初始left和top的时候在手机有个坑，默认是auto,那么我们就要做处理,防止NaN
        imgStartLeft = parseInt(window.getComputedStyle(mobileBaseimg).left)?
            parseInt(window.getComputedStyle(mobileBaseimg).left):0;
        imgStartTop = parseInt(window.getComputedStyle(mobileBaseimg).top)?
            parseInt(window.getComputedStyle(mobileBaseimg).top):0;
    }
    function imgMoving(x,y){
        imgNowX = x;
        imgNowY = y;
        mobileBaseimg.style.left = (imgStartLeft+imgNowX-imgStartX) + 'px';
        mobileBaseimg.style.top = (imgStartTop+imgNowY-imgStartY) + 'px'
        // mobileBaseimg.style.transformOrigin = (getImgCenter(mobileBaseimg)[0]+(imgStartLeft+imgNowX-imgStartX)) + 'px '+
        //     (getImgCenter(mobileBaseimg)[1] + (imgStartTop+imgNowY-imgStartY)) +'px'
        // window.getComputedStyle(mobileClip).width
        // $$('#test').value = window.getComputedStyle(mobileBaseimg).left;
        // $$('#test2').value = imgStartX;
    }
    function imgMoveOver(x,y){
        imgEndX = x;
        imgEndY = y;
        var imgCenter = getImgCenter(mobileBaseimg),
            left = imgStartLeft+imgNowX-imgStartX,
            top = imgStartTop+imgNowY-imgStartY;
        //图片左,右边缘是否还剩下像素可移动
        imgLeftRightRemain = Math.abs(left) > (imgCenter[0] - mobileClip.offsetWidth/2);
        //图片上，下边缘是否还剩下像素可移动
        imgTopBottomRemain = Math.abs(top) > (imgCenter[1] - mobileClip.offsetHeight/2);
        // $$('#test2').value = imgCenter[0];
        // $$('#test').value = imgLeftRemain;
        if(imgLeftRightRemain){
            //无法向左,向右移动了
            mobileBaseimg.classList.add("mobile-img-transition");//增加动画效果，缓冲图片
            mobileBaseimg.style.left = Math.abs(left)/left * (imgCenter[0] - mobileClip.offsetWidth/2) + 'px';
        }
        if(imgTopBottomRemain){
            //无法向上，下右移动了
            mobileBaseimg.classList.add("mobile-img-transition");//增加动画效果，缓冲图片
            mobileBaseimg.style.top = Math.abs(top)/top * (imgCenter[1] - mobileClip.offsetHeight/2) + 'px';
        }
    }
    //获取图像的中心坐标
    function getImgCenter(imgIn){
        var xAndY = window.getComputedStyle(imgIn).transformOrigin.split(' ');
        
        return xAndY.map(function(item){
            return parseInt(item);
        });
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
        mobileBaseimg.style.transform = 'scale(' + scale + ')';
    }
    function imgScaleOver(scale){
        var nowBaseimgWidth = parseInt(mobileBaseimg.style.width),
            nowBaseimgHeight = parseInt(mobileBaseimg.style.height),
            defaultMaxPortion = 1;//默认的图片最大放大比例
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
            //图片比例大于defaultMaxPortion,缩小图片
            mobileBaseimg.classList.add("mobile-img-transition");//增加动画效果，缓冲图片缩放到合适尺寸
            mobileBaseimg.style.width = mobileBaseimg.naturalWidth*defaultMaxPortion +'px';//图片最好的宽度是这样的
            mobileBaseimg.style.height =  mobileBaseimg.naturalHeight*defaultMaxPortion + 'px';//图片高度就是截取框高度
        }
    
    }
};