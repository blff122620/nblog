var dragMobile = function(result,fileType,orientation){
    //手机截图用
    var mobileBaseimg = $$('#js-mobile-baseimg'),
        mobileClipimg = $$('#js-mobile-clipimg');
    var mobileClip = $$('#js-mobile-clip');
    var mobileClipHeight ;
    var mobilePortion;
    var mBaseimgWidth;//img的当前宽度
    var loadFlag = 0,//图片载入后只做一次图片初始化，需要一个flag
        imgStartX,imgStartY,imgNowX,imgNowY,imgEndX,imgEndY,imgStartLeft,imgStartTop,imgLeftRightRemain,imgTopBottomRemain;//单手操作手指的相应x,y坐标
    var tStartHandler = $.handleTouch.bind(null,imgMoveStart),
        tMoveHandler = $.handleTouch.bind(null,imgMoving),
        tEndHandler = $.handleTouch.bind(null,imgMoveOver);
    function dataURItoBlob(dataURI) {
        var byteString = atob(dataURI.split(',')[1]);
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], {type: mimeString});
    }
    var mcanvas = document.createElement('canvas'),
        mctx = mcanvas.getContext('2d'),
        mimg = $$('#js-compressed-img'),
        mclipCanvas = $$('#js-safe-modal canvas'),
        mconfirm = $$('#js-mobile-clip-confirm'),
        mcancel = $$('#js-mobile-clip-cancel'),
        mquality = 80;//图像压缩质量;
        
    //初始化图像，在ios中，手机拍照方向是个坑
    function initialCompressedImg(){
        
        
        mcanvas.width = mobileClipimg.offsetWidth;
        mcanvas.height = mobileClipimg.offsetHeight;
        if(orientation){
            
            var oriInfo = getDegree(orientation,mcanvas.width,mcanvas.height);//变形等信息
            
            mcanvas.width = oriInfo.canvasW;
            mcanvas.height = oriInfo.canvasH;
            mctx.rotate(oriInfo.degree * Math.PI/180);
            mctx.drawImage(mobileClipimg,0,0,oriInfo.drawWidth,oriInfo.drawHeight);
            
            // mctx.drawImage(mobileClipimg,0,0,mobileClipimg.offsetWidth,mobileClipimg.offsetHeight);
        }
        else{
            mctx.drawImage(mobileClipimg,0,0,mobileClipimg.offsetWidth,mobileClipimg.offsetHeight);
        }
        
        mimg.src = mcanvas.toDataURL(fileType,mquality/100);
        
    
    }
    //初始化或者缩放的时候，改变压缩的图片
    function changeCompressedImg(){
        mcanvas.width = mobileClipimg.offsetWidth;
        mcanvas.height = mobileClipimg.offsetHeight;
        mctx.drawImage(mobileClipimg,0,0,mobileClipimg.offsetWidth,mobileClipimg.offsetHeight);
        mimg.src = mcanvas.toDataURL(fileType,mquality/100);
    }
    function setCanvas(){
        var mobileClipimgLeft,
            mobileClipimgTop;
        if(window.getComputedStyle(mobileClipimg).left =='auto' && window.getComputedStyle(mobileClipimg).top =='auto'){
            mobileClipimgLeft = 0;
            mobileClipimgTop = 0;
        }
        else{
            mobileClipimgLeft = parseInt(window.getComputedStyle(mobileClipimg).left);
            mobileClipimgTop = parseInt(window.getComputedStyle(mobileClipimg).top);
        }
        var x = mobileClipimg.offsetWidth/2 - mobileClip.offsetWidth/2 - mobileClipimgLeft,
            y = mobileClipimg.offsetHeight/2 - mobileClip.offsetHeight/2 - mobileClipimgTop;
            //左上角，右上角的xy坐标

        mctx = mclipCanvas.getContext('2d');
        mclipCanvas.width = mobileClip.offsetWidth;
        mclipCanvas.height = mobileClip.offsetHeight;
        
        mctx.drawImage(mimg,
        x,y,mobileClip.offsetWidth,mobileClip.offsetHeight,
        0,0,mobileClip.offsetWidth,mobileClip.offsetHeight);
    
    }
    mcancel.onclick = function(){
        document.body.style.overflow = "auto";
        $$('#js-safe-modal').style.display = "none";
        $$('#js-mask').style.display = "none";
    }
    mconfirm.onclick = function(){
        setCanvas();
        var data = mclipCanvas.toDataURL(fileType,mquality/100);
        $$('#avatarimg').src = data; 
        $$('#js-header-avatar').src = data;
        $$('#avatar').src = data;

        var fd = new FormData();
        var blob = dataURItoBlob(data);
        fd.append('avatar', blob);
        fd.append('userid',$$('#userid').value);
        
        var config = {
            headers: { 'content-type': 'multipart/form-data' }
        }

        axios.post('/personal/avatar', fd, config) ;

        $$(".pop").forEach(function(item){
            item.style.display = "none";
        });
        document.body.style.overflow = "auto";
        $$('#js-safe-modal').style.display = "none";
        
        $$("#js-mask").style.display = "none";
    };

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
        // $.toggleTouchMove(true);//禁止页面滚动
        getImgData(result,orientation,function(data){
            //data为校正后的base64数据
            mobileBaseimg.src = data;
            mobileClipimg.src = data;
        });
        
        mobileBaseimg.onload = function(){
            
            if(!loadFlag){
                //图片载入后再做操作,只做一次，需要一个flag
                mobileClipHeight = parseInt(window.getComputedStyle(mobileClip).height);//截取框的高度
                mobilePortion = mobileBaseimg.naturalWidth/mobileBaseimg.naturalHeight; //图片宽高比
                handleMobilePic(mobilePortion,mobileBaseimg,mobileClipHeight);//处理图像，恢复到满clip窗口
                
                handleMobilePic(mobilePortion,mobileClipimg,mobileClipHeight);//处理图像，恢复到满clip窗口
                loadFlag++;
                setMClip();
                // initialCompressedImg();
                changeCompressedImg();
            }
            
        };
        mobileClipimg.onload = function(){
            
            // changeCompressedImg();
            // setCanvas();
        }
        
        //一个手指移动的时候，要处理图片的移动
        allowOwnFinger(tStartHandler,tMoveHandler,tEndHandler);
    
        //两个手指移动的时候要处理图片的缩放
        $$('#js-safe-modal').addEventListener('gesturestart',$.handleGesture.bind(null,imgScaleStart));
        $$('#js-safe-modal').addEventListener('gesturechange',$.handleGesture.bind(null,imgScale));
        $$('#js-safe-modal').addEventListener('gestureend',$.handleGesture.bind(null,imgScaleOver));
        return true;//在手机里，那么就返回true
        
    }
    
    function forbidOneFinger(tStartHandler,tMoveHandler,tEndHandler){
        $$('#js-safe-modal').removeEventListener("touchstart",tStartHandler,false);
        $$('#js-safe-modal').removeEventListener("touchmove",tMoveHandler,false);
        // $$('#js-safe-modal').removeEventListener("touchend",tEndHandler,false);
    }
    function allowOwnFinger(tStartHandler,tMoveHandler,tEndHandler){
        
        $$('#js-safe-modal').addEventListener("touchstart",tStartHandler,false);
        $$('#js-safe-modal').addEventListener("touchmove",tMoveHandler,false);
        $$('#js-safe-modal').addEventListener("touchend",tEndHandler,false);
    }
    //图片单手移动开始后的回调函数
    function imgMoveStart(x,y){
        mobileBaseimg.classList.remove("mobile-img-transition");//移动前，移除动画效果，防止卡顿
        mobileClipimg.classList.remove("mobile-img-transition");//移动前，移除动画效果，防止卡顿
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
        mobileBaseimg.style.top = (imgStartTop+imgNowY-imgStartY) + 'px';
        mobileClipimg.style.left = (imgStartLeft+imgNowX-imgStartX) + 'px';
        mobileClipimg.style.top = (imgStartTop+imgNowY-imgStartY) + 'px'
        setMClip();
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
            mobileClipimg.classList.add("mobile-img-transition");//增加动画效果，缓冲图片
            mobileClipimg.style.left = Math.abs(left)/left * (imgCenter[0] - mobileClip.offsetWidth/2) + 'px';
          
        }
        if(imgTopBottomRemain){
            //无法向上，下右移动了
            mobileBaseimg.classList.add("mobile-img-transition");//增加动画效果，缓冲图片
            mobileBaseimg.style.top = Math.abs(top)/top * (imgCenter[1] - mobileClip.offsetHeight/2) + 'px';
            mobileClipimg.classList.add("mobile-img-transition");//增加动画效果，缓冲图片
            mobileClipimg.style.top = Math.abs(top)/top * (imgCenter[1] - mobileClip.offsetHeight/2) + 'px';
        }
        
        setTimeout(setMClip,500);
        // setMClip();
        changeCompressedImg();
        // initialCompressedImg();
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
        mobileClipimg.classList.remove("mobile-img-transition");
        //缩放前，移除动画效果，防止卡顿
        forbidOneFinger(tStartHandler,tMoveHandler,tEndHandler);//禁止单手事件
    }
    function imgScale(scale){
        mobileBaseimg.style.transform = 'scale(' + scale + ')';
        mobileClipimg.style.transform = 'scale(' + scale + ')';
        setMClip();
    }
    function imgScaleOver(scale){
        var nowBaseimgWidth = parseInt(mobileBaseimg.style.width),
            nowBaseimgHeight = parseInt(mobileBaseimg.style.height),
            defaultMaxPortion = 1;//默认的图片最大放大比例
        nowBaseimgWidth = mobileBaseimg.style.width = mobileClipimg.style.width = nowBaseimgWidth*scale +'px';
        //改变宽度，同时也要改变高度
        nowBaseimgHeight = mobileBaseimg.style.height = mobileClipimg.style.height = nowBaseimgHeight*scale +'px';
        mobileBaseimg.style.transform = 'none';//同时最后要取消缩放
        mobileClipimg.style.transform = 'none';//同时最后要取消缩放
        
        
        //判断，如果缩放过小或者过大，那么不允许再次缩放
        
        if(parseInt(nowBaseimgWidth)<mobileClipHeight||parseInt(nowBaseimgHeight)<mobileClipHeight){
            //图片的宽度小于截取框的宽度,图片的高度小于默认截取框的高度
            mobileBaseimg.classList.add("mobile-img-transition");//增加动画效果，缓冲图片缩放到合适尺寸
            mobileClipimg.classList.add("mobile-img-transition");//增加动画效果，缓冲图片缩放到合适尺寸
            handleMobilePic(mobilePortion,mobileBaseimg,mobileClipHeight);//处理图像，恢复到满clip窗口
            handleMobilePic(mobilePortion,mobileClipimg,mobileClipHeight);//处理图像，恢复到满clip窗口
        }
        else if(parseInt(nowBaseimgWidth)>defaultMaxPortion*mobileBaseimg.naturalWidth){
            //图片比例大于defaultMaxPortion,缩小图片
            mobileBaseimg.classList.add("mobile-img-transition");//增加动画效果，缓冲图片缩放到合适尺寸
            mobileBaseimg.style.width = mobileBaseimg.naturalWidth*defaultMaxPortion +'px';//图片最好的宽度是这样的
            mobileBaseimg.style.height =  mobileBaseimg.naturalHeight*defaultMaxPortion + 'px';//图片高度就是截取框高度

            mobileClipimg.classList.add("mobile-img-transition");//增加动画效果，缓冲图片缩放到合适尺寸
            mobileClipimg.style.width = mobileClipimg.naturalWidth*defaultMaxPortion +'px';//图片最好的宽度是这样的
            mobileClipimg.style.height =  mobileClipimg.naturalHeight*defaultMaxPortion + 'px';//图片高度就是截取框高度
        }
        setTimeout(allowOwnFinger,0,tStartHandler,tMoveHandler,tEndHandler);//允许单手事件
        setTimeout(setMClip,500);
        changeCompressedImg();
        // initialCompressedImg();
    }
    function setMClip(){
        var mobileClipimgLeft,
            mobileClipimgTop;
        if(window.getComputedStyle(mobileClipimg).left =='auto' && window.getComputedStyle(mobileClipimg).top =='auto'){
            mobileClipimgLeft = 0;
            mobileClipimgTop = 0;
        }
        else{
            mobileClipimgLeft = parseInt(window.getComputedStyle(mobileClipimg).left);
            mobileClipimgTop = parseInt(window.getComputedStyle(mobileClipimg).top);
        }
        var x = mobileClipimg.offsetWidth/2 - mobileClip.offsetWidth/2 - mobileClipimgLeft,
            y = mobileClipimg.offsetHeight/2 - mobileClip.offsetHeight/2 - mobileClipimgTop;
            //左上角，右上角的xy坐标
         var nwPos = x + 'px ' + y +'px',
            nePos = (x+mobileClip.offsetWidth) + 'px ' + y +'px',
            sePos = (x+mobileClip.offsetWidth) + 'px ' + (y+mobileClip.offsetHeight) +'px',
            swPos = x + 'px ' + (y+mobileClip.offsetHeight) +'px';
        var clipPath = [nwPos,nePos,sePos,swPos];
        mobileClipimg.style.webkitClipPath = 'polygon('+clipPath.join(',')+')';
        mobileClipimg.style.clipPath = 'polygon('+clipPath.join(',')+')';
       
    }
    //获取图像的旋转角度
    function getDegree(dir,width,height){
        var degree,drawWidth,drawHeight,canvasW,canvasH;
        switch(dir){
           //iphone横屏拍摄，此时home键在左侧
            case 3:
                degree=180;
                drawWidth=-width;
                drawHeight=-height;
                break;
            //iphone竖屏拍摄，此时home键在下方(正常拿手机的方向)
            case 6:
                canvasW=height;
                canvasH=width; 
                degree=90;
                drawWidth=width;
                drawHeight=-height;
                break;
            //iphone竖屏拍摄，此时home键在上方
            case 8:
                canvasW=height;
                canvasH=width; 
                degree=270;
                drawWidth=-width;
                drawHeight=height;
                break;
        }
        
        return {
            degree:degree?degree:0,
            drawWidth:drawWidth?drawWidth:0,
            drawHeight:drawHeight?drawHeight:0,
            canvasW:canvasW?canvasW:width,
            canvasH:canvasH?canvasH:height
        }
    }
    // @param {string} img 图片的base64
    // @param {int} dir exif获取的方向信息
    // @param {function} next 回调方法，返回校正方向后的base64
    function getImgData(img,dir,next){
        var image=new Image();
        image.onload=function(){
            var degree=0,drawWidth,drawHeight,width,height;
            drawWidth=this.naturalWidth;
            drawHeight=this.naturalHeight;
            //以下改变一下图片大小
            var maxSide = Math.max(drawWidth, drawHeight);
            if (maxSide > 1024) {
                var minSide = Math.min(drawWidth, drawHeight);
                minSide = minSide / maxSide * 1024;
                maxSide = 1024;
                if (drawWidth > drawHeight) {
                    drawWidth = maxSide;
                    drawHeight = minSide;
                } else {
                    drawWidth = minSide;
                    drawHeight = maxSide;
                }
            }
            var canvas=document.createElement('canvas');
            canvas.width=width=drawWidth;
            canvas.height=height=drawHeight; 
            var context=canvas.getContext('2d');
            //判断图片方向，重置canvas大小，确定旋转角度，iphone默认的是home键在右方的横屏拍摄方式
            switch(dir){
            //iphone横屏拍摄，此时home键在左侧
                case 3:
                    degree=180;
                    drawWidth=-width;
                    drawHeight=-height;
                    break;
                //iphone竖屏拍摄，此时home键在下方(正常拿手机的方向)
                case 6:
                    canvas.width=height;
                    canvas.height=width; 
                    degree=90;
                    drawWidth=width;
                    drawHeight=-height;
                    break;
                //iphone竖屏拍摄，此时home键在上方
                case 8:
                    canvas.width=height;
                    canvas.height=width; 
                    degree=270;
                    drawWidth=-width;
                    drawHeight=height;
                    break;
            }
            //使用canvas旋转校正
            context.rotate(degree*Math.PI/180);
            context.drawImage(this,0,0,drawWidth,drawHeight);
            //返回校正图片
            next(canvas.toDataURL(fileType,mquality/100));
        }
        image.src=img;
    }
};