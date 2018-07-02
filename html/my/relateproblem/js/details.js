/**
 * 我的钱包记录
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#details-frm',
    data: {
        problem:'',
        //问题列表
        details_data: {},
        moredatatxt: '',
        pageSize: 5,
        pageNo: 1,
        totalPage: 0, //总页数
    },
    methods: {
        //初始化
        init: function() {
            //问题下标
            vm.problem = api.pageParam.problem;
            // 增配訂單
            vm.userDetails();
            vm.pageNo = 1;
        },
        // 获取店铺信息详情
        userDetails: function(type) {
            apps.axget(
                "commonProblemController/selectCommonProblemDetails", {
                  id : api.pageParam.problem
                },
                function(data) {
                  vm.details_data = data;
                  /*vm.details_data.addtime = vm.details_data.addtime.replace(/-/g,"/");
                  var date = new Date(vm.details_data.addtime);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
                  Y = date.getFullYear() + '-';
                  M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
                  D = date.getDate() + ' ';
                  h = date.getHours() + ':';
                  m = date.getMinutes() + ':';
                  s = date.getSeconds();
                  vm.details_data.addtime = Y+M+D+h+m+s;*/
                });
        },
    },
});
//时间戳转日期格式
// function timestampToTime(timestamp) {
//     var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
//     Y = date.getFullYear() + '-';
//     M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
//     D = date.getDate() + ' ';
//     h = date.getHours() + ':';
//     m = date.getMinutes() + ':';
//     s = date.getSeconds();
//     return Y+M+D+h+m+s;
// }


apiready = function() {
    api.parseTapmode();
    //下拉刷新
    apps.pageDataF5(function() {
        vm.init();
    });
    vm.init();
    //上拉加载
    api.addEventListener({
        name: 'scrolltobottom',
        extra: {
            threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
        }
    }, function(ret, err) {
        if (vm.pageNo <= vm.totalPage) {
            vm.userDetails();
        }
    });

}
