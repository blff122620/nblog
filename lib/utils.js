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
    }
};
