var dragF = function(fileType){
    var 
        cArea = $$("#js-clip-area"),// 图片容器 
        baseimg = $$("#js-clip-base-img"),//基础层图片
        clipimg = $$("#js-clip-img"),// 裁剪层图片
        drag = $$("#js-drag-path"),//裁剪层
        cAreaH = cArea.offsetHeight,  // 图片显示区的高度  
        cAreaW = cArea.offsetWidth,   // 图片显示区的宽度  
        cAreaTop = $.getPosition(cArea).Y, //图片容器距离浏览器上边界距离  
        cAreaLeft = $.getPosition(cArea).X, //图片容器距离浏览器左边界距离 
        mousePosition,mouseStartX,mouseStartY,dragLeft,dragTop,dragMaxH,dragMaxW;// 定义按下鼠标时产生的变量

    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        img = $$('#js-compressed-img'),
        clipCanvas = $$('#js-safe-modal canvas'),
        confirm = $$('#js-clip-confirm'),
        quality = 30;//图像压缩质量;
    
    confirm.onclick = function(popsDisappear){
        var data = clipCanvas.toDataURL(fileType,quality/100);
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


    canvas.width = cAreaW;//压缩图片，确定宽度
    canvas.height = cAreaH;
    
    ctx.drawImage(baseimg,0,0,cAreaW,cAreaH);
    img.src = canvas.toDataURL(fileType,quality/100);
    
    //默认必须对drag-path做一次处理，防止上次图片的裁剪区域patch超过了这次小图片的范围
    //对clip-img做一次处理
    setTimeout(function(){
        drag.style.left = '0px';
        drag.style.top = '0px';
        setClip();//第一次加载也要做一遍裁剪区域的选择，要不然，会造成clippath和裁剪图片不配对的情况
    },0);
    setTimeout(setCanvas,0);//这里是为了压缩图片加载完了才执行，要不然就是黑图了
    
    function startDrag(e) {  
        e.preventDefault();
        mouseStartX = e.clientX;    // 刚按下鼠标时 鼠标相对浏览器边界的 X 坐标
        mouseStartY = e.clientY;    // 刚按下鼠标时 鼠标相对浏览器边界的 Y 坐标
        dragLeft = drag.offsetLeft; // 刚按下鼠标时 裁剪区的距离图片显示区 左 边界距离
        dragTop = drag.offsetTop;   // 刚按下鼠标时 裁剪区的距离图片显示区 上 边界距离
        dragMaxH = cAreaH - drag.offsetHeight;  // 垂直最大范围
        dragMaxW = cAreaW - drag.offsetWidth;   // 水平最大范围
        mousePosition = e.target.id; // 判断按下位置，按得哪个地方
        document.addEventListener('mousemove', dragging, false);
        document.addEventListener('mouseup', clearDragEvent, false);
    }
    // 鼠标移动
    function dragging(e) {
        e.stopPropagation();
        window.getSelection().removeAllRanges();  // 避免图片被选中    
            
        switch(mousePosition) {
            case 'js-drag-path' : dragMove(e);  break;
            case 'box-n' : nsMove(e, 'n');  break;
            case 'box-s' : nsMove(e, 's');  break;
            case 'box-w' : weMove(e, 'w');  break;
            case 'box-e' : weMove(e, 'e');  break;
            case 'box-ne' : nsMove(e, 'n'); weMove(e, 'e');  break;
            case 'box-nw' : nsMove(e, 'n'); weMove(e, 'w');  break;
            case 'box-se' : nsMove(e, 's'); weMove(e, 'e');  break;
            case 'box-sw' : nsMove(e, 's'); weMove(e, 'w');  break;
            default : break;
        }
    }
    // 鼠标松开时释放事件
    function clearDragEvent(e) {  
        document.removeEventListener('mousemove', dragging, false);
        document.removeEventListener('mouseup', clearDragEvent, false);
          
        setCanvas();
    }
    function setCanvas(){
        ctx = clipCanvas.getContext('2d');
        clipCanvas.width = drag.offsetWidth;
        clipCanvas.height = drag.offsetHeight;
        ctx.drawImage(img,
            drag.offsetLeft,drag.offsetTop,drag.offsetWidth,drag.offsetHeight,
            0,0,drag.offsetWidth,drag.offsetHeight); 
        
        
    }
    // 上下方向的边框拖动
    function nsMove(e, str) { 
        var  // 拖拽中 鼠标坐标变化值
            draggingY = e.clientY,
            dragY = $.getPosition(drag).Y,
            changeHeigt;
        
        if(draggingY<cAreaTop) draggingY = cAreaTop;
        if(draggingY>=cAreaTop+cAreaH) draggingY = cAreaTop+cAreaH;
        if(str === 'n'){
            changeHeigt = dragY - draggingY;
            drag.style.top = drag.offsetTop - dragY + draggingY + 'px';  
        }
        if(str === 's'){
            changeHeigt = draggingY - drag.offsetHeight - dragY; 
        }
        drag.style.height = drag.offsetHeight + changeHeigt + 'px';
        
        setClip();
    }
    // 水平方向的边框拖动
    function weMove(e, str) {  
        var draggingX = e.clientX;
        if(draggingX < cAreaLeft) draggingX = cAreaLeft;
        if(draggingX > cAreaLeft + cAreaW) draggingX = cAreaLeft + cAreaW;
        var dragX = $.getPosition(drag).X;
        if(str === 'w') {
            var changeWidth = dragX - draggingX;
            drag.style.left = drag.offsetLeft - changeWidth + 'px';
        } else if(str === 'e') {
            var changeWidth = draggingX - drag.offsetWidth - dragX;
        }
        drag.style.width = drag.offsetWidth + changeWidth + 'px';
        setClip();
    };
    // 整体拖拽
    function dragMove(e) {  
        var moveX = e.clientX - mouseStartX; // 拖拽中 鼠标坐标变化值
        var moveY = e.clientY - mouseStartY; // 拖拽中 鼠标坐标变化值
        var destinationX = Math.min((moveX + dragLeft), dragMaxW); // 限制拖动的最大范围，避免超出右和下边界
        var destinationY = Math.min((moveY + dragTop), dragMaxH);  // 限制拖动的最大范围，避免超出右和下边界
        drag.style.left = destinationX < 0 ? 0 : destinationX + 'px'; // 限制最小范围，避免超出上和左边界
        drag.style.top = destinationY < 0 ? 0 : destinationY + 'px';  // 限制最小范围，避免超出上和左边界
        setClip();
        
    }
    function setClip(){
        var nwPos = drag.offsetLeft + 'px ' + drag.offsetTop + 'px',
            nePos = (drag.offsetLeft+drag.offsetWidth) + 'px ' + drag.offsetTop + 'px',
            sePos = (drag.offsetLeft+drag.offsetWidth) + 'px ' + (drag.offsetTop+drag.offsetHeight) + 'px',
            swPos = drag.offsetLeft + 'px ' + (drag.offsetTop+drag.offsetHeight) + 'px';
        var clipPath = [nwPos,nePos,sePos,swPos];
        clipimg.style.clipPath = 'polygon(' + clipPath.join(',') + ')';
        // console.log(clipPath.join(','));
    }

    
    drag.addEventListener('mousedown', startDrag, false);
    
};
