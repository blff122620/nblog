var inViewPort = (function() {
    function getInfo(ele){
        console.log("浏览器宽度："+getViewport().innerWidth);
        console.log("浏览器高度："+getViewport().innerHeight);
        console.log("视窗距离上边缘："+getViewport().scrollTop);
        console.log("视窗距离左边缘："+getViewport().scrollLeft);
        console.log("元素距离顶端："+getOffsetTop(ele));
        console.log("元素距离左端："+ getOffsetLeft(ele));
    }
    /**
     * [inView 判断元素是否在视口内]
     * @param  {DOM对象} ele [需要原生dom对象]
     * @return {boolean}     [在就返回true]
     */
    var inViewport = function (ele){
        var viewInfo = getViewport();
        var eleInfo = getEleInfo(ele);
        if( viewInfo.scrollTop < eleInfo.offsetTop + eleInfo.height &&
            viewInfo.scrollTop + viewInfo.innerHeight > eleInfo.offsetTop){
            
            //这里用来判断元素在竖直方向上是应该在视窗的范围之内的，接下来判断水平范围内在视窗内
            if(eleInfo.offsetLeft + eleInfo.width > viewInfo.scrollLeft && 
               eleInfo.offsetLeft < viewInfo.scrollLeft + viewInfo.innerWidth ){
                return true;
            }           
        }
        return false;
    }
    /**
     * getViewport 拿到视窗的信息
     * @return {object} top,left ,宽，高
     */
    function getViewport(){
        return {
            scrollTop: window.pagYoffset/*IE9+及标准浏览器*/ || 
                        document.documentElement.scrollTop /*兼容ie低版本的标准模式*/ ||
                        document.body.scrollTop, /*兼容混杂模式*/
            scrollLeft: window.pagXoffset/*IE9+及标准浏览器*/ || 
                        document.documentElement.scrollLeft /*兼容ie低版本的标准模式*/ ||
                        document.body.scrollLeft, /*兼容混杂模式*/
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight
        };
    }
    /**
     * getEleInfo 拿到元素宽高信息
     * @param  {DOM对象} ele [需要传入原生DOM对象]
     * @return {object}  
     */
    function getEleInfo(ele){
        var width = "",
            height = "";
        if(ele.style.width){
            width = ele.style.width;
        }else{
            width = window.getComputedStyle(ele).width;
        }
        if(ele.style.height){
            height = ele.style.height;
        }else{
            height = window.getComputedStyle(ele).height;
        }
        return {
            width: Number(width.slice(0,-2)),
            height: Number(height.slice(0,-2)),
            offsetTop: getOffsetTop(ele),
            offsetLeft: getOffsetLeft(ele)
        };
    }
    /**
     * [getOffsetTop 获取元素上边缘距离html元素顶部边缘的长度]
     * @param  {DOM对象} ele [需要传入原生DOM对象]
     * @return {number}     
     */
    function getOffsetTop(ele) {
        var mOffsetTop = ele.offsetTop;
        var mOffsetParent = ele.offsetParent;
        while (mOffsetParent) {
            mOffsetTop += mOffsetParent.offsetTop;
            mOffsetParent = mOffsetParent.offsetParent;
        }
        return mOffsetTop;
    }
    
    /**
     * [getOffsetLeft 获取元素左边缘距离html元素左边缘的长度]
     * @param  {DOM对象} ele [需要传入原生DOM对象]
     * @return {number}     
     */
    function getOffsetLeft(ele) {
        var mOffsetLeft = ele.offsetLeft;
        var mOffsetParent = ele.offsetParent;
        while (mOffsetParent) {
            mOffsetLeft += mOffsetParent.offsetLeft;
            mOffsetParent = mOffsetParent.offsetParent;
        }
        return mOffsetLeft;
    }

    return inViewport;
}());