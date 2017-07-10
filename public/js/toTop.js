(function() {
    $.addLoadEvent(function() {
        var toTop = $$('#js-totop');

        var body = document.body || document.documentElement;
        var totalTime = 300, //1s
            frames = 60, //帧数
            timeStep = totalTime / frames, //时间间隔
            distance = 0; //总距离

        var step = 0; //步长
        toTop.onclick = function() {
            distance = body.scrollTop;
            step = distance / frames;
            move(distance);            
        };

        function move(distance) {
            
            if(distance <= 0){
                body.scrollTop = 0;
                return;
            }
            else{
                distance -= step;
                body.scrollTop = distance;
                setTimeout(move,timeStep,distance);
            }
        
        }
        addEventListener('scroll',function(){

            if(body.scrollTop > 1000){
                toTop.classList.remove('dn');
            }
            else{
                toTop.classList.add('dn');
            }
        });
    });
})();
