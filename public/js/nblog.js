(function(){

    window.onload = function(){
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
            popX = $$(".js-pop-x"),
            defaultNav = $$("#js-default-nav"),//当header滚动出viewport时候显示的导航
            header = $$("#js-header"),
            logoC = $$("#js-logo-c"),
            phoneNavBurger = $$("#js-phone-nav-burger"),//手机端头部导航右侧的汉堡图标
            phoneNavBurgerX = $$("#js-phone-nav-burger span"),//手机端头部导航右侧的x图标
            fullscreen = $$("#js-fullscreen"),
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
            }
        });

        function regLogShow(ele,whatDiv,index){
            if(index ==navSlideIndex){
                navAsideTransform();
            }
            ele.classList.remove("underline");
            whatDiv.style.display = "block";
            whatDiv.scrollIntoView();
            maskShow(true);
        }
    
        mask.onclick = function(){
            regLogDisappear();
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
                        event.preventDefault();
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
        window.onscroll = function(){
            body.style.transform = "none"; //解决aside点击之后transform影响nav弹出的bug
            setDefaultNav();
            setPicSrc(pics);
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
        $A("pre").forEach(function(item){
            item.classList.add("line-numbers");
        });
        Prism.highlightAll();
    };

    //load事件外
    var p = myProgress.create($$("#js-top-progress"), "#2196f3", false); //第一个参数必须为原生dom对象
    //第三个参数默认为true，表示进度条走完是否还显示
    p.start(); //进度条开始走

    
    
}());