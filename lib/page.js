/**
 * pagebar
 * now:1,           //当前页号
 * total:0,         //总数据条数
 * min:5,           //最小显示页数
 * size:10,         //每页数据量
 * baseURI:"/",     //基础URI
 * hash:null        //定位用urlhash
 */
var config = {
    now: 1, 
    total: 0,
    min: 10,
    size: 10,
    baseURI: ''
}
function getPageArr(curr, total, min) {
    var left = 1;
    var right = total;
    var leftmin = Math.floor((min - 1) / 2);
    var rightmin = (min - 1) % 2 === 0 ? leftmin : leftmin + 1;

    var ar = []
    if (total >= min + 1) {
        if (curr > leftmin && curr < total - rightmin) {
            left = curr - leftmin
            right = curr + rightmin
        } else {
            if (curr <= 5) {
                left = 1
                right = min
            } else {
                right = total
                left = total - min + 1
            }
        }
    }
    while (left <= right) {
        ar.push(left)
        left++
    }
    if (ar.indexOf(1) == -1) {
        if (ar.indexOf(2) == -1) ar.unshift('...')
        ar.unshift(1)
    }
    if (ar.indexOf(total) == -1) {
        if (ar.indexOf(total-1) == -1) ar.push('...')
        ar.push(total)
    }
    
    return ar;

}
//获取总页数
function getPages(total){
    let restCount = total % config.size, //最后一页剩余文章数
        pages = 0;//总页数
    if(restCount){
      //还剩下一页，默认页数需要+1
      pages += parseInt(total/config.size) + 1;
    }
    else{
      pages += parseInt(total/config.size);
    }
    return pages;
}

function getPagebar(barArr,baseUri,page,symbol){
    page = parseInt(page);
    return barArr.map(function(item){//分页信息
        if(typeof item === 'number'){//为数字的时候返回如下
          return {
             content:item,
             href:true,//是否为超链接
             selected: item==page?true:false,//确定选中状态的页码
             aside: (item==page+1||item == page-1)?true:false,//两边显示，为了手机上的适配
             url: [baseUri,symbol,'page=',item].join(''),
          }
        }
        else{
          return {
             content:item,
             href:false,//是否为超链接
             selected: false,//确定选中状态的页码
             aside: false,//两边显示，为了手机上的适配
             url: '',
          }
        }
       
      });
}
module.exports = {
    config: config,
    getPageArr: getPageArr,
    getPages: getPages,
    getPagebar: getPagebar
}