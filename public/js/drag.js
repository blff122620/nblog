var dragF = function(){
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
            case 'boxW' : weMove(e, 'w');  break;
            case 'boxE' : weMove(e, 'e');  break;
            case 'boxNe' : weMove(e, 'w'); nsMove(e, 'n');  break;
            case 'boxNw' : weMove(e, 'e');nsMove(e, 'n');  break;
            case 'boxSe' : weMove(e, 'w'); nsMove(e, 's');  break;
            case 'boxSw' : weMove(e, 'e'); nsMove(e, 's');  break;
            default : break;
        }
    }
    // 鼠标松开时释放事件
    function clearDragEvent(e) {  
        document.removeEventListener('mousemove', dragging, false);
        document.removeEventListener('mouseup', clearDragEvent, false)
    }
    // 上下方向的边框拖动
    function nsMove(e, str) {
        document.body.style.overflow="auto";  
        var  // 拖拽中 鼠标坐标变化值
            draggingY = e.screenY,
            dragY = $.getPosition(drag).Y;
        var newcAreaTop = $.getPosition(cArea).Y;
        if(draggingY<newcAreaTop) draggingY = cAreaTop;
        if(draggingY>newcAreaTop+cAreaH) draggingY = cAreaTop+cAreaH;
        if(str === 'n'){
            var changeHeigt = dragY - draggingY;
            drag.style.top = dragTop - changeHeigt<=0?0:dragTop - changeHeigt +'px';
            // 
            console.log("draggingY="+draggingY+", dragY="+dragY);
            
        }
        // drag.style.height = drag.offsetHeight + changeHeigt + 'px';
        
        setClip();
    }
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
