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
    }

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

    function Single() {
        this.getAllElement = _getAllElement;
        this.getNodeIndex = _getNodeIndex;
        this.removeClass = _removeClass;
        this.cookie = _cookie;
        this.ajax = _ajax;
    }

    if (!_instance) {
        _instance = new Single();
    }
    return _instance;


})();
