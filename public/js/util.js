var $$ = function(selector, context) {
    context = context || document;
    var elements = context.querySelectorAll(selector);
    elements = Array.prototype.slice.call(elements);
    if(elements.length == 1){
        elements = elements[0];
    }
    return elements;
}
var $A = function(selector, context) { //返回数组，甭管几个
    context = context || document;
    var elements = context.querySelectorAll(selector);
    elements = Array.prototype.slice.call(elements);
    return elements;
}
var $ = (function() {
    var _instance = null;


    /**
     * 获取所有的element节点，去除text节点和注释节点
     * @param  {[Node]} element [输入为Dom节点]
     * @return {[Array]}      [输出为所有的NodeType为Element的元素数组]
     */

    var _getAllElement = function(element) {
        var i,
            elements = [],
            child = element.firstElementChild;
        do {
            elements.push(child);
            child = child.nextElementSibling;
        } while (child != element.lastElementChild)
        elements.push(child);
        return elements;
    };
    /**
     * [返回node是elements的第几个节点，从0开始]
     * @param  {[type]} node    [description]
     * @param  {[type]} element [description]
     * @return {[type]}         [description]
     */
    var _getNodeIndex = function(node, elements) {
        for (var i = 0; i < elements.length; i++) {
            if (node === elements[i]) {
                return i;
            }
        }
    };
    /**
     * [_removeClass 删除所有的class]
     * @param  {[type]} class    [description]
     * @param  {[type]} elements [description]
     * @return {[type]}          [description]
     */
    var _removeClass = function(className, elements) {
        var eles = Array.prototype.slice.call(elements);
        eles.forEach(function(item) {
            item.classList.remove(className);
        });
    };

    var _cookie = {
        get: function(name){
            var cookieName = encodeURIComponent(name) + "=",
                cookieStart = document.cookie.indexOf(cookieName),
                cookieValue = null;
            if(cookieStart > -1){
                var cookieEnd = document.cookie.indexOf(";",cookieStart);
                if(cookieEnd == -1){
                    cookieEnd = document.cookie.length;
                }
                cookieValue = decodeURIComponent(document.cookie.slice(cookieStart + cookieName.length,cookieEnd));
            }
            return cookieValue;
        },
        set: function(name,value,expires,path,domain,secure){
            var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);
            if(expires instanceof Date){
                cookieText += ";expires=" + expires.toGMTString();
            }
            if(path){
                cookieText += ";path=" + path;
            }
            if(domain){
                cookieText += ";domain=" + domain;
            }
            if(secure){
                cookieText += ";secure";
            }
            document.cookie = cookieText;
        },
        unset: function(name,expires,path,domain,secure){
            this.set(name,"",expires,path,domain,secure);
        }
    };

    var _ajax = function(type, url, callback) {

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                    if (typeof callback === "function") {
                        callback(xhr.responseText);
                    } else {
                        console.log("【error】ajax接口调用成功并返回正确结果，但是回调函数{"+callback.toString()+"}书写错误");
                    }
                } else {
                    console.log("ajax request Unsuccessful: " + xhr.status);
                }
            }
        };
        //先支持get
        xhr.open(type, url, true);
        xhr.send(null);

    };

    var _getPosition = function(elem){
        var elemX = elem.offsetLeft;
        var elemY = elem.offsetTop;
        while(elem = elem.offsetParent) {
            elemX += elem.offsetLeft;
            elemY += elem.offsetTop
        }
        return {X : elemX, Y : elemY}
    };
    var _isPc = function() {
        var userAgentInfo = navigator.userAgent;
        var Agents = ["Android", "iPhone",
                    "SymbianOS", "Windows Phone",
                    "iPad", "iPod"];
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        return flag;
    };
    var _toggleTouchMove = function (flag){
        if(flag){
            document.body.addEventListener("touchmove",_preventDefault, false);
        }
        else{
            document.body.removeEventListener("touchmove",_preventDefault, false);
        }
    };
    var _preventDefault = function(event) {
        event.preventDefault();
        event.stopPropagation();
    };
    var touchingNowX0,
        touchingNowY0,
        touchingNowX1,
        touchingNowY1;//当前的滑动对象
    var touchStartX0,
        touchStartY0,
        touchStartX1,
        touchStartY1;
    var touchEndX0,
        touchEndY0;
    var _handleTouch = function (callback,event){
        event.stopPropagation();
        //负责处理单手机和双手操作
        switch(event.type){
            case "touchmove":
                // console.log('movving');
                touchingNowX0 = event.touches[0].clientX;
                touchingNowY0 = event.touches[0].clientY;
                if(event.touches.length == 1){
                    //一个手指头操作，调用该函数，传递过去x,y
                    callback(touchingNowX0,touchingNowY0);
                }
                // var str = 'x0:'+touchingNowX0+' y0:'+touchingNowY0;
                // var str2 = 'x1:'+touchingNowX1+' y1:'+touchingNowY1;
                // var str = 'x变了'+(touchingNowX0-touchStartX0);
                // var str2 = 'y变了'+(touchingNowY0-touchStartY0);
                // // console.log();
                // $$('#test').value = touchStartX0;
                // $$('#test2').value = touchStartX1;
                // event.preventDefault();//阻止屏幕的默认滚动
                break;
            case "touchstart":
                // console.log("start");
                touchStartX0 = event.touches[0].clientX;
                touchStartY0 = event.touches[0].clientY;
                if(event.touches.length == 1){
                    //一个手指头操作，调用该函数，传递过去x,y
                    callback(touchStartX0,touchStartY0);
                }
                // console.log(touchStartX0);
                // if(event.touches.length == 2){//有第二个手指参与,记录第二个手指信息
                //     touchStartX1 = event.touches[1].clientX;
                //     touchStartY1 = event.touches[1].clientY;
                // }
                break;
            case "touchend":
                touchEndX0 = event.changedTouches[0].clientX;
                touchEndY0 = event.changedTouches[0].clientY;
                //     touchEndX1 ,
                //     touchEndY1 ;
                // if(event.touches.length == 2){//有第二个手指参与,记录第二个手指信息
                //     touchEndX1 = event.changedTouches[1].clientX;
                //     touchEndY1 = event.changedTouches[1].clientY;
                // }
        
                //一个手指头操作，调用该函数，传递过去x,y
                callback(touchEndX0,touchEndY0);
                
                
                break;

        }
    };
    //负责手势的处理函数
    var _handleGesture = function(callback,event){
        event.stopPropagation();
        switch(event.type){
            case 'gesturestart':
                callback(event.scale);
                break;
            case 'gesturechange':
                callback(event.scale);
                break;
            case 'gestureend':
                callback(event.scale);
                break;
        }
    };

    function Single() {
        this.getAllElement = _getAllElement;
        this.getNodeIndex = _getNodeIndex;
        this.removeClass = _removeClass;
        this.cookie = _cookie;
        this.ajax = _ajax;
        this.getPosition = _getPosition;
        this.isPc = _isPc;
        this.toggleTouchMove = _toggleTouchMove;
        this.handleTouch = _handleTouch;
        this.handleGesture = _handleGesture;
    }

    if (!_instance) {
        _instance = new Single();
    }
    return _instance;


})();
