/**
 * 我的钱包记录
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */
 var vm = new Vue({
     el: '#tncoin',
     data: {
         batteryOrderList: [], //天牛币详情列表
         integral: "",//天牛币
         moredatatxt: '',
         pageSize: 5,
         pageNo: "",
         totalPage: ""//总页数

     },
     methods: {
         //初始化
         init: function() {
             // 增配訂單
             vm.pageNo = 1;
             vm.getselectBatteryOrder();
             vm.getIntegral();
         },
         // 获取店铺信息详情
         getselectBatteryOrder: function(type) {

             apps.axget(
                 "integral/incomeRecord", {
                   pageNo: vm.pageNo,
                   pageSize: vm.pageSize
                 },
                 function(data) {
                     // alert(JSON.stringify(data));
                     if (data.totalPage <= 1 || vm.pageNo == data.totalPage) {
                         vm.moredatatxt = "暂无更多记录";
                     } else {
                         vm.moredatatxt = "上滑获取更多记录";
                     }
                     if (vm.pageNo == 1) {
                         vm.batteryOrderList = data.datas;
                         vm.totalPage = data.totalPage; //总页数

                     } else {
                         //如果存在数据并且当前的页面小于等于总页码时push
                         if (data.datas.length && vm.pageNo <= data.totalPage) {
                             vm.batteryOrderList = vm.batteryOrderList.concat(data.datas);
                         }
                     }
                     vm.pageNo++;
                 });
         },
         //获取天牛币
         getIntegral:function(){
           apps.axget(
               "integral/balance", {},
               function(data) {
                   vm.integral = data.integral;
                   // console.log(JSON.stringify(vm.integral));
               });
         }
     }

 });
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
          setTimeout('vm.getselectBatteryOrder()',10);
            // vm.getselectBatteryOrder();
        }
    });

}
