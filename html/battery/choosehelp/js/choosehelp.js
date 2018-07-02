/**
 * 店铺列表记录
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#choosehelp-frm',
    data: {
        selectShop_data:{},
        BatteryOrder_data: {
            batteryOrderList: [], //商品列表
        },
        namefindtxt: '', // 关键字检索
        shopid: '',
        tabbtnnum: 1,
        moredatatxt: '',
        pageSize: 5,
        pageNo: 1,
        totalPage: 0, //总页数
        setLocationxy: {}, //当前xy 坐标
        shopdistance: '0', //当前公里数
        urlstats: '' // 跳转状态变量
    },
    methods: {
        //初始化
        init: function() {
            vm.urlstats = api.pageParam.urlstats;
            vm.setLocationxy = $api.getStorage("setLocationxy");
            // 增配訂單
            vm.getselectBatteryOrder();
            vm.pageNo = 1;
        },
        // 选择救援门店
        shoplistidBtn: function(item) {
            vm.shopid = item.id;
            vm.shopdistance = (item.distance/1000).toFixed(2);
            vm.getselectShop();
        },
        // 获取店铺---地址和电话
        getselectShop: function() {
            apps.axget(
                "rescue/selectShop", {
                    shopid: vm.shopid,
                },
                function(data) {
                    vm.selectShop_data = data;
                    //拼接整个地址
                    vm.alladdress = vm.selectShop_data.provincename + vm.selectShop_data.cityname + vm.selectShop_data.countyname + vm.selectShop_data.address;
                });
        },
        // 获取店铺信息详情
        getselectBatteryOrder: function() {
            apps.axget(
                "bespeak/selectShopListByPage", {
                    x: vm.setLocationxy.x,
                    y: vm.setLocationxy.y,
                    name: vm.namefindtxt,
                    pageNo: vm.pageNo,
                    pageSize: vm.pageSize,
                },
                function(data) {
                    // alert(JSON.stringify(data));
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
        // 电话
        settelsBtn: function() {
            if (vm.selectShop_data.contactcellphone) {
              var hmlss = '' + vm.selectShop_data.name + '(' + vm.selectShop_data.no + ')' +
                  ' \n 地址：' + vm.selectShop_data.address + '\n 距离：' + vm.shopdistance + '公里';
              api.actionSheet({
                  title: hmlss,
                  cancelTitle: '取消',
                  // destructiveTitle: '红色警告按钮',
                  buttons: [vm.selectShop_data.contactcellphone]
              }, function(ret, err) {
                  var index = ret.buttonIndex;
                  // 拨打电话
                  if (index == 1) {
                      api.call({
                          type: 'tel_prompt',
                          number: vm.selectShop_data.contactcellphone
                      });
                  }
              });
            }else {
              alert("选择救援门店!");
            }
        }
    },
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
            vm.getselectBatteryOrder();
        }
    });

}
