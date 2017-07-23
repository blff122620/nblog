(function(){

    var windowOnload = function(){
        var burger = $$("#js-burger"),
            navAside = $$("#js-nav-aside"),
            article = $$("#js-article"),
            boxSection = $$("#js-box-section"),
            burgerClick = false,
            navAsideMove = 300,
            body = document.body || document.documentElement,
            touchStartX,touchEndX,
            loginBtn = $$(".js-login-button"),
            loginDiv = $$("#js-login"),
            regBtn = $$(".js-reg-button"),
            regDiv = $$("#js-reg"),
            mask = $$("#js-mask"),
            pops = $$(".pop"),
            popX = $$(".js-pop-x"),
            defaultNav = $$("#js-default-nav"),//当header滚动出viewport时候显示的导航
            header = $$("#js-header"),
            logoC = $$("#js-logo-c"),
            phoneNavBurger = $$("#js-phone-nav-burger"),//手机端头部导航右侧的汉堡图标
            phoneNavBurgerX = $$("#js-phone-nav-burger span"),//手机端头部导航右侧的x图标
            fullscreen = $$("#js-fullscreen"),//手机端全屏的背景铺满div
            popImgHandler = $$("#js-img-handler"),//弹出层 裁剪图片的弹窗,
            sfModel = $$("#js-safe-modal"),
            navSlideIndex = 1;

        phoneNavBurger.onclick = function(){
            fullscreen.classList.toggle("fullscreen");
            phoneNavBurger.classList.toggle("phone-nav-burger-bg");
            if(fullscreen.classList.contains("fullscreen")){
                body.style.overflow = "hidden";
                toggleTouchMove(preventDefault,true);
                phoneNavBurgerX.style.opacity = "1";
            }else{
                body.style.overflow = "auto";
                toggleTouchMove(preventDefault,false);
                phoneNavBurgerX.style.opacity = "0";
            } 
            
        }
        function toggleTouchMove(preventDefault,flag){
            if(flag){
                body.addEventListener("touchmove",preventDefault, false);
            }
            else{
                body.removeEventListener("touchmove",preventDefault, false);
            }
        }
        var preventDefault = function(event) {
            event.preventDefault();
            event.stopPropagation();
        };
            
        loginBtn.forEach(function(element,index) {
            element.onclick = function(){
                regLogShow(element,loginDiv,index);
            };
        });
        
        regBtn.forEach(function(element,index){
            element.onclick = function(){
                regLogShow(element,regDiv,index);
            };
        });

        popX.forEach(function(ele){
            ele.onclick =function(event){
                event.stopPropagation();
                regLogDisappear();
                popsDisappear();
            }
        });

        function regLogShow(ele,whatDiv,index){
            if(index ==navSlideIndex){
                navAsideTransform();
            }
            ele.classList.remove("underline");
            whatDiv.style.display = "block";
            $$('input',whatDiv)[0].focus();//默认选中第一个input
            whatDiv.scrollIntoView();
            maskShow(true);
        }
    
        mask.onclick = function(){
            regLogDisappear();
            popsDisappear();
        }
        function popsDisappear(){
            //所有弹窗关闭
            pops.forEach(function(item){
                item.style.display = "none";
            });
            body.style.overflow = "auto";
            sfModel.style.display = "none";
        }
        function regLogDisappear(){
            loginDiv.style.display = "none";
            regDiv.style.display = "none";
            maskShow(false,loginBtn,regBtn);
        }
        function maskShow(toggle){
            if(toggle){
                mask.style.display = "block";
                body.style.overflow = "hidden";
            }
            else{
                for(var i=1;i<arguments.length;i++){
                    arguments[i].forEach(function(element){
                        element.classList.add("underline");
                    });
                }
                mask.style.display = "none";
                body.style.overflow = "auto";
            }
        }

        burger.onclick = function(event){
            event.stopPropagation();
            navAsideTransform();  
            
        };
        boxSection.addEventListener("click",function(){
            if(burgerClick){
                navAsideTransform(); 
            }
        });
        function handleTouch(event){
            switch(event.type){
                case "touchmove":
                    if(navAsideOpen()){
                        event.preventDefault();//阻止屏幕的默认滚动
                    }
                    break;
                case "touchstart":
                    touchStartX = event.changedTouches[0].clientX;
                    break;
                case "touchend":
                    touchEndX = event.changedTouches[0].clientX;
                    if(navAsideOpen() && touchEndX-touchStartX>0){
                        //向右滑动
                        navAsideTransform(); 
                    }
                    break;

            }
        }
        function navAsideOpen(){
            if(navAside.classList.contains("burger-click")){
                return true;
            }
            return false;
        }
        function navAsideTransform(){
            navAside.classList.toggle("burger-click");
                
            burgerClick = !burgerClick;
            if(burgerClick){
                body.style.transform = "translateX(-"+navAsideMove+"px)";
                body.style.overflow = "hidden";
            }
            else{
                body.style.transform = "translateX(0)";
                body.style.overflow = "auto";
            }  
        }
        document.addEventListener("touchmove",handleTouch);
        document.addEventListener("touchstart",handleTouch);
        document.addEventListener("touchend",handleTouch);
        

        new Vue({
            el: '#js-reg-form',
            data:{
                name:'',
                nickname:'',
                password:'',
                repassword:'',
                message:''
            },
            methods: {
                check: function (event) {
                    var vm = this;
                    axios.post('/signup/check', this.$data)
                    .then(function (response) {
                        if(response.data.status == 'valid'){
                            vm.$el.submit();
                        }
                        else{
                            vm.message = response.data.msg;
                        }
                            
                    })
                    .catch(function (error) {
                        vm.message = '抱歉，服务器出错了';
                    });
                    
                    
                }
            }
        });

        new Vue({
            el: '#js-login-form',
            data:{
                name:'',
                password:'',
                message:''
            },
            methods: {
                check: function (event) {
                    var vm = this;
                    axios.post('/signin/check', this.$data)
                    .then(function (response) {
                        if(response.data.status == 'valid'){
                            vm.$el.submit();
                        }
                        else{
                            vm.message = response.data.msg;
                        }
                            
                    })
                    .catch(function (error) {
                        vm.message = '抱歉，服务器出错了';
                    });
                    
                    
                }
            }
        });
        if($$("#js-comment").length!=0){
            //hack......
            var vJsComment = new Vue({
                el: '#js-comment',
                data:{
                    comments:[],
                    message:'',
                    submitContent:{
                        postId:$$("#js-post-id",this.$el).value,
                        comment:''
                    }
                },
                methods: {
                    submit: function (event) {
                        var vm = this;
                        this.message = '';
                        
                        axios.post(`/posts/${this.submitContent.postId}/comment`, this.$data.submitContent)
                        .then(function (response) {
                            if(response.data.status == 'valid'){
                                axios.get(`/posts/${vm.submitContent.postId}/comment`)
                                .then(function(response){
                                    vm.submitContent.comment = '';
                                    vm.comments = response.data;
                                });
                            }
                            else{
                                vm.message = response.data.result;
                            }
                                
                        })
                        .catch(function (error) {
                            vm.message = '抱歉，服务器出错了';
                        });
                        
                    },
                    delComment:function(commentId,event){
                        var vm = this;
                        axios.get(`/posts/${this.submitContent.postId}/comment/${commentId}/removal`)
                            .then(function(response){
                                if(typeof response.data != "string")
                                    //这里是为了解决notlogin删除的问题
                                    vm.comments = response.data;
                            });
                    }
                }
            });
            axios.get(`/posts/${$$("#js-post-id",vJsComment.$el).value}/comment`)
                .then(function(response){
                    vJsComment.comments = response.data;
            });
        }
        p.over(); //页面加载完毕，调用，让头部进度条走完到100%
        var pics = $A ('.n-box .n-top>img');
        var nContentPics = $A('.n-box .n-content img');
        pics = pics.concat(nContentPics);
        setPicSrc(pics);
        setDefaultNav();
        addEventListener('scroll',function(){
            body.style.transform = "none"; //解决aside点击之后transform影响nav弹出的bug
            setDefaultNav();
            setPicSrc(pics);
        });
        window.onscroll = function(){
            
        };
        function setPicSrc(pics){//设置照片的src，用于懒加载
            pics.forEach(function(item){
                if(inViewPort(item)){
                    item.src = item.dataset.url;
                };   
            });
                    
        }
        /**
         * [setDefaultNav 设置默认头部导航，用于header不在viewport显示]
         */
        function setDefaultNav(){
            var moveClass = "default-move-nav";
            if(inViewPort(header)){//判断header在视窗内
                if(!defaultNav.classList.contains(moveClass)){
                    defaultNav.classList.add(moveClass);
                }
                
            }
            else{

                if(defaultNav.classList.contains(moveClass)){
                    defaultNav.classList.remove(moveClass);
                }
            }
        }
        $A(".n-content pre").forEach(function(item){
            item.classList.add("line-numbers");
        });
        Prism.highlightAll();
        //显示所有的pre>code
        $A('pre').forEach(function(pre){
            pre.classList.remove('opa0');//fadein
        });

        //为了判别手机中图像的旋转问题，需要此函数来拿到图像的方向
        function readFile(fileObj){
            EXIF.getData(fileObj.files[0],function(){
                var orientation=EXIF.getTag(this,'Orientation');//图片的方向，Number类型
                readURL(fileObj,mask,orientation);
                //需要判断是不是undefined,不在手机中，会变成undefined，在手机中会是number类型
                // console.log(Object.prototype.toString.call(orientation));
            });
        }
        
        function readURL(input,mask,orientation) {
            var type = ['.gif','.jpg','.jpeg','.png'];
            // if(input.files[0].size>200*1024){
            //     alert("文件过大，头像文件需要小于200KB的文件~");
            //     return ;
            // }
            var filename = input.files[0].name;
            if(!type.includes(filename.slice(filename.lastIndexOf('.')).toLowerCase())){
                alert("文件类型不匹配，请上传如下类型后缀的文件: "+type.join(" "));
                return ;
            }
            if (input.files && input.files[0]) {
                var reader = new FileReader(),
                    baseimg = $$("#js-clip-base-img"),//基础层图片
                    clipimg = $$("#js-clip-img"),// 裁剪层图片
                    fileType = input.files[0].type ||  
                        'image/' + nput.files[0].name.substr(fileName.lastIndexOf('.') + 1),
                    result ;
                
                
                reader.onload = function (e) {
                    result = e.target.result;
                    sfModel.style.display = "block";
                    mask.style.display = "block";
                    if(dragMobile(result,fileType,orientation)){
                        //处理手机端头像上传逻辑，如果是手机端，不往下执行
                        return;
                    }
                    
                    popImgHandler.style.display = "block";
                    // if(input.files[0].size>200*1024){
                    baseimg.src = result;
                    clipimg.src = result; 
                    
                    baseimg.onload=function(){
                        var clipArea = $$('#js-clip-area');//需要截图的整张图的div
                        var portion = baseimg.naturalHeight/baseimg.naturalWidth;
                        var defaultWidth = 740;
                        var defaultHeight = 500;
                        clipArea.style.width = defaultWidth+'px';//默认必须初始化裁剪区域为最大宽度
                        
                        if(defaultWidth * portion > defaultHeight){ //文件占满div的话，会超出屏幕情况，这样肯定要缩放宽度
                            var portionWidth = defaultHeight / portion;//算出来合适的宽度
                            //如果这个宽度比图片实际高度还大，那么我们就用图片的宽度即可
                            if(portionWidth>baseimg.naturalWidth){
                                clipArea.style.width = baseimg.naturalWidth + 'px';
                            }
                            else{
                                clipArea.style.width = portionWidth + 'px';
                            }
                            var realWidth = parseInt(clipArea.style.width);
                            var realHeight = parseInt(window.getComputedStyle(clipArea).height);
                            if(realWidth<200){//图片太窄了，那么也得缩小选取框宽度
                                $$('#js-drag-path').style.width = realWidth + 'px';
                            }
                            if(realHeight<200){
                                $$('#js-drag-path').style.height = realHeight + 'px';
                            }
                            
                            
                        }
                        else{
                            if(baseimg.naturalWidth<defaultWidth){//图片小，这样，我们就不缩放了
                                //这里，横向纵向，就都变为图像大小
                                clipArea.style.width = baseimg.naturalWidth + 'px'
                                if(baseimg.naturalWidth<200){
                                    $$('#js-drag-path').style.width = baseimg.naturalWidth + 'px';
                                }
                                if(parseInt(window.getComputedStyle(clipArea).height)<200){
                                    $$('#js-drag-path').style.height = parseInt(window.getComputedStyle(clipArea).height) + 'px';
                                }
                            }else{
                                
                                //这里不用做啥
                            }
                        }

                       
                        
                        setTimeout(dragF,0,fileType);
                        setTimeout(function(){
                            $$("#avatar").value = '';
                        },0);
                    };
                    body.style.overflow = "hidden";
                    
                    
                }
                
                reader.readAsDataURL(input.files[0]);
            }
        }

        if($$("#avatar").length!=0){
            $$("#avatar").onchange=function(){
                //先拿图像的方向信息，再去处理图像
                readFile(this);
            };
        }
        window.addEventListener("onorientationchange" in window ? "orientationchange": "resize", function() {
            if(!$.isPc()){//要在手机里才判断屏幕的方向
                if (window.matchMedia("(orientation: portrait)").matches) {
                    $$('#js-mobile-wrap-tips').classList.add('dn');
                    $$('#js-mobile-wrap-tips').classList.remove('df');
                    if($$('#js-mobile-wrap-tips').dataset.firstshow == 'true'){
                        //这里是处理第一次载入图片时手机是横着的，那么返回,并初始化网页
                        body.style.overflow = "auto";
                        sfModel.style.display = "none";
            
                        mask.style.display = "none";
                        $$('#js-mobile-wrap-tips').dataset.firstshow = '';
                        return;
                    }
                    // you're in PORTRAIT mode
                    $$('#js-mobile-wrap').classList.remove('dn');
                    $$('#js-mobile-wrap').classList.add('df');
                    
                }
                if (window.matchMedia("(orientation: landscape)").matches) {
                    // you're in LANDSCAPE mode
                    $$('#js-mobile-wrap').classList.add('dn');
                    $$('#js-mobile-wrap').classList.remove('df');
                    $$('#js-mobile-wrap-tips').classList.remove('dn');
                    $$('#js-mobile-wrap-tips').classList.add('df');
                }
            }
        }, false);
        
    };

    $.addLoadEvent(windowOnload);
    //load事件外
    var p = myProgress.create($$("#js-top-progress"), "#2196f3", false); //第一个参数必须为原生dom对象
    //第三个参数默认为true，表示进度条走完是否还显示
    p.start(); //进度条开始走

    
    
}());