// 声明vue加载
var vm = new Vue({
    el: '#modifyBatteryList-frm',
    data: {
        BatteryOrder_data: {
            batteryOrderList: [], //商品列表
        },
        moredatatxt: '',
        pageSize: 5,
        pageNo: 1,
        totalPage: 0, //总页数
        shopid:0,
    },
    methods: {
        //初始化
        init: function() {
          vm.shopid = api.pageParam.shopid;
          vm.getmodifyBatteryOrder();
        },
        // 获取更换电池型号订单记录
        getmodifyBatteryOrder: function() {
            apps.axget(
                "switchOver/selectByPage", {
                  pageNo: vm.pageNo,
                  pageSize: vm.pageSize,
                },function(data) {
                    if (data.totalPage <= 1 || vm.pageNo == data.totalPage) {
                        vm.moredatatxt = "暂无更多记录";
                    } else {
                        vm.moredatatxt = "上滑获取更多记录";
                    }
                    if (vm.pageNo == 1) {
                        vm.BatteryOrder_data.batteryOrderList = [];
                        data.datas.forEach(function(item) {
                            if (item) {
                                vm.BatteryOrder_data.batteryOrderList.push(item);
                            }
                        });
                        vm.totalPage = data.totalPage; //总页数
                    } else {
                        //如果存在数据并且当前的页面小于等于总页码时push
                        if (data.datas.length && vm.pageNo <= data.totalPage) {
                            data.datas.forEach(function(item) {
                                vm.BatteryOrder_data.batteryOrderList.push(item);
                            });
                        }
                    }
                    vm.pageNo++;
                });
        },

        jumpOrderInfo: function(orderId) {
            // 跑去订单详情
            jumpUrl.modifyBatteryDetails({orderId : orderId});
        },
    },
});

apiready = function() {
    api.parseTapmode();
    vm.init();
    //上拉加载
    api.addEventListener({
        name: 'scrolltobottom',
        extra: {
            threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
        }
    }, function(ret, err) {
        if (vm.pageNo <= vm.totalPage) {
            vm.getmodifyBatteryOrder();
        }
    });

}
