module.exports = {
    toggleNav:function(req,res){
        var underlineCount = 0;
        res.locals.nav.forEach(function(item,index){
            item.selected = false;
            
            if(req.originalUrl == item.href){
                item.selected = true;
                underlineCount++;
            }
            
        });
        return underlineCount;
        //这里是为了默认必须选中第一项，防止没有任何nav匹配上
        // console.log(req.originalUrl);
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
    }
};
