var myProgress = (function() {
    var Progress = function(progressEle, color, reservePro){
        this.progressEle = progressEle;
        this.color = color;
        this.reservePro = reservePro;
        var bgImage = "",

            bgImagePrefix = "linear-gradient(to right, " + color + " 0%, " + color + " ",
            bgImageSuffix = "%, transparent 0px)", //这里是利用线性渐变实现的进度条，用这个方式的目的是让进度条的结构很简单，只有一层div就够了
            distance = 0, //进度条移动的距离，百分比
            left = 100, //剩下的距离，初始为100%
            divisor = 80, //除数因子，越大平均速度越慢
            realOver = 0, //判断是不是真的页面载入完毕
            simPoint = [{point:50,divisor:150},{point:80,divisor:300}],//设置一组速度变化的点
            simPointIndex = 0;
        this.move = function() {
            if (!this.progressEle.style.backgroundImage) {
                bgImage = window.getComputedStyle(this.progressEle).backgroundImage;
            } else {
                bgImage = this.progressEle.style.backgroundImage;
            }
            if (distance < 100) {
                if(!realOver && simPointIndex<simPoint.length && simPoint[simPointIndex]["point"] < distance){
                    divisor = simPoint[simPointIndex++]["divisor"];
                }
                if(distance>95){
                    divisor = 1000;//设置为极慢
                }
                distance += left / divisor; //根据除数因子求移动的距离，这样进度条走的速度会越来越慢，开始快，后面慢
                left = 100 - distance; //剩下的距离要计算出来
                bgImage = bgImagePrefix + distance + bgImageSuffix;
                this.progressEle.style.backgroundImage = bgImage;

                this.progressEle.progressRAF = requestAnimationFrame(this.move.bind(this));//这里需要绑定this对象
            }
        };
        this.start = function() {
            this.progressEle.progressRAF = requestAnimationFrame(this.move.bind(this));
        };
        this.over = function() { //进度条结束，马上到100%
            divisor = 1; //不要除数因子，简化计算
            realOver = 1; //真的结束了
            left = 100 - distance; //直接把剩余路程走完
            var context = this;//保存this状态
            setTimeout(function() {
                if (!(typeof reservePro == "undefined" || reservePro)) {
                    context.progressEle.style.display = "none";
                }
            }, 500); //这里的目的是让进度条走到头再消失
        };
    };
    
    return {
        create:function(progressEle, color, reservePro){
            return new Progress(progressEle, color, reservePro);
            //第一个参数为进度条dom对象
            //第三个参数是进度条保留与否，默认为true
        }

    };

}());
