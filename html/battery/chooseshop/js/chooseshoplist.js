/**
 * 店铺列表记录
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#chooseshoplist-frm',
    data: {
        //商铺信息
        name: "店铺名字",
        selectShop_data:{},
        //完整地址
        alladdress:{},
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
        urlstats: '', // 跳转状态变量
        shopNo:0,//店铺编号
    },
    methods: {
        //初始化
        init: function() {
            vm.urlstats = api.pageParam.urlstats;
            vm.setLocationxy = $api.getStorage("setLocationxy");
            // 增配訂單
            vm.pageNo = 1;
            vm.getselectBatteryOrder();
        },
        // 获取店铺信息详情
        getselectBatteryOrder: function() {
            apps.axget(
                "bespeak/selectShopListByPage", {
                    x: vm.setLocationxy.x,
                    y: vm.setLocationxy.y,
                    name: vm.namefindtxt,
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
        // 选择
        shoplistidBtn: function(item) {
            // alert(JSON.stringify(item));
            vm.shopid = item.id;
            vm.shopdistance = (item.distance/1000).toFixed(2);
            vm.alladdress = item.provincename + item.cityname + item.countyname + item.address;
            vm.name = item.name;
            vm.shopNo = item.no;
        },
        jumprshopidBtn: function() {
            // 如果是  救援 url
            if (vm.urlstats == 'sos_help') {
                if (vm.shopid) {
                  jumpUrl.rescueshopinfo({ shopid: vm.shopid, shopdistance: vm.shopdistance, alladdress: vm.alladdress, name: vm.name });
                }else {
                  alert("选择救援门店");
                }
            } else if (vm.urlstats == 'modify_battery') {
              if (vm.shopid) {
                //发送shopinfo的监听
                api.sendEvent({
                    name: 'modifyBatteryEvent',
                    extra: {
                      shopName : vm.name,
                      shopAddress : vm.alladdress,
                      shopNo : vm.shopNo,
                      shopid : vm.shopid
                    }
                });
                jumpUrl.modifyBattery({ name: vm.name, alladdress: vm.alladdress, no:vm.shopNo, shopid:vm.shopid });
              }else {
                alert("选择预约门店");
              }
            } else {
                //发送shopid的监听 -退租
                api.sendEvent({
                    name: 'setshopListidEvent',
                    extra: {
                        shopid: vm.shopid
                    }
                });
                jumpUrl.battery_isrent({ shopid: vm.shopid });
            }

        },
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
