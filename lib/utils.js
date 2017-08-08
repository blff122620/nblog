
module.exports = {
    toggleNav:function(req,res){
        var underlineCount = 0,
            symbol = '',
            paramLT1 = false,//参数多于一个
            hasPage = false;//特殊处理分页带的page参数
        
        var query = req.originalUrl.split('?').length>1?req.originalUrl.split('?')[1]:'';
        
        query = query.split('&').filter(function(item,index){
            if(index > 0){
                paramLT1 = true;
            }
            if(item.indexOf('page')!='-1'){
                hasPage = true;
                return true;
            }
            return false;
        }).join('&');
        if(query && paramLT1){
            symbol = '&';
        }
        else if(query && !paramLT1){
            symbol = '?';
        }

        res.locals.nav.forEach(function(item,index){
            item.selected = false;
           
            if(req.originalUrl == [item.href,symbol,query].join('')){
                item.selected = true;
                underlineCount++;
            }
            
        });
        return underlineCount;
        //这里是为了默认必须选中第一项，防止没有任何nav匹配上
        
        // if(underlineCount == 0){
        //     res.locals.nav[0].selected = true;        
        // }
    },
    formatDate: function (strTime) {
        var data = new Date();
        if(strTime){
            date = new Date(strTime);
        }
        
        return date.getFullYear()+"."+(date.getMonth()+1)+"."+date.getDate();
    },
    updateSession:function(sessions,userId,SessionModel,req){
        //遍历session，更新该用户的相关session
        sessions.forEach(function(item){
            var session = JSON.parse(item.session);//转型为json格式
            if((session.user?session.user._id:'') == userId){//如果session数据库中存在相同用户，那么更新他的session
                for(var key in session.user){
                    
                    session.user[key] = req.session.user[key];
                }
                SessionModel.updateSessionById(item._id,{session:JSON.stringify(session)});
            }
        }); 
    },
    genCcap:function(){
        var result = []; //验证码结果
        var captcha = ccap({
	
            width:160,//set width,default is 256

            height:60,//set height,default is 60

            offset:40,//set text spacing,default is 40

            quality:100,//set pic quality,default is 50

            fontsize:57,//set font size,default is 57

            generate:function(){//Custom the function to generate captcha text
            
                //generate captcha text here
                var jschars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
                function generateMixed(n,chars) {
                    var res = "";
                    for(var i = 0; i < n ; i ++) {
                        var id = Math.ceil(Math.random()*(chars.length-1));
                        res += chars[id];
                    }
                    return res;
                }
                var text = generateMixed(4,jschars);
                return text; //return the captcha text

            }
        });
        result = captcha.get();
        captcha.buffer = result[1];
        captcha.text = result[0];
        
        captcha.base64 = 'data:image/jpg;base64,' + btoa(String.fromCharCode.apply(null, captcha.buffer));
        
        return captcha;
    },
    guid: function () {
        return 'Gxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
};
