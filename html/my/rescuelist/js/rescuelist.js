/**
 * 商城订单记录
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#rescuelist-frm',
    data: {
        //商铺信息
        selectShop_data: {},
        shopdistance: 0,
        all_pay: 10,
        rescueid: 123456,
        //救援类型
        help: '',
        //订单状态   订单状态 0：待维修 1：已维修  2：已撤销
        orderstate: 1,
        //订单生效 0：网点撤销订单   1：网点接受订单 2：等待网点操作
        istakestate: 0,
        // 支付状态 0：未支付  1：已支付
        paystate: 0,
        // 网点电话
        selectShop_data: {},
        BatteryOrder_data: {
            batteryOrderList: [], //商品列表
        },
        operation: {},
        moredatatxt:'',
        pageSize: 5,
        pageNo: 1,
        totalPage: 0, //总页数
    },
    methods: {
        //初始化
        init: function() {
            var timer;
            var timerArr = [];
            // vm.tabbtnnum = api.pageParam.tabbtnnum;
            vm.selectShop_data = api.pageParam.selectShop_data;
            // alert(JSON.stringify(vm.selectShop_data));
            vm.pageNo = 1;
            vm.getselectBatteryOrder();
            vm.isOperation();
            /*timer = setInterval(function() {
              apps.axget(
                  "rescue/selectRescueList", {
                      pageNo: vm.pageNo,
                      pageSize: vm.pageSize,
                  },
                  function(data) {
                      vm.BatteryOrder_data.batteryOrderList.splice(0,vm.BatteryOrder_data.batteryOrderList.length);
                      vm.BatteryOrder_data.batteryOrderList = data;
                      for (var i = 0; i < vm.BatteryOrder_data.batteryOrderList.length; i++) {
                          if (vm.BatteryOrder_data.batteryOrderList[i].paystate == 0 && vm.BatteryOrder_data.batteryOrderList[i].istakestate == 1 && vm.BatteryOrder_data.batteryOrderList[0].orderstate !== 3) {
                              for (var i = 0; i < timerArr.length; i++) {
                                  clearInterval(timerArr[i]);
                              }
                              alert("网点接受了你的订单，请联系网点沟通救援地点、救援详情。");
                          }
                      }
                  });
                  if (vm.BatteryOrder_data.batteryOrderList[0].paystate == 0 && vm.BatteryOrder_data.batteryOrderList[0].istakestate == 0) {
                      for (var i = 0; i < timerArr.length; i++) {
                          clearInterval(timerArr[i]);
                      }
                      alert("网点撤销了您的救援订单，到网点主页面重新下单。");
                  }
                  if (vm.BatteryOrder_data.batteryOrderList[0].istakestate == 1 && vm.BatteryOrder_data.batteryOrderList[0].orderstate == 3) {
                      for (var i = 0; i < timerArr.length; i++) {
                          clearInterval(timerArr[i]);
                      }
                      alert("网点没有完成订单，支付里程费。");
                  }
                  console.log("timerArr = " + timerArr);
            },20000);
            timerArr.push(timer);*/
            if (vm.selectShop_data) {
              var hmlss = '' + vm.selectShop_data.name + '(' + vm.selectShop_data.no + ')' +
                  ' \n 地址：' + vm.selectShop_data.address;
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
            }
        },
        // 获取  救援订单 列表
        getselectBatteryOrder: function(status) {
            apps.axget(
                "rescue/selectRescueList", {
                    pageNo: vm.pageNo,
                    pageSize: vm.pageSize,
                },
                function(data) {
                    // alert(JSON.stringify(data));
                    vm.BatteryOrder_data.batteryOrderList.splice(0,vm.BatteryOrder_data.batteryOrderList.length);
                    vm.BatteryOrder_data.batteryOrderList = data;
                    // if (data.totalPage <= 1 || vm.pageNo == data.totalPage) {
                    //     vm.moredatatxt = "暂无更多记录";
                    // } else {
                    //     vm.moredatatxt = "上滑获取更多记录";
                    // }
                    // if (vm.pageNo == 1) {
                    //     vm.BatteryOrder_data.batteryOrderList = [];
                    //     data.datas.forEach(function(item) {
                    //         if (item) {
                    //             // 预约中的时候-倒计时
                    //             if (item.state == 0) {
                    //
                    //             }
                    //             vm.BatteryOrder_data.batteryOrderList.push(item);
                    //         }
                    //     });
                    //     vm.totalPage = data.totalPage; //总页数
                    // } else {
                    //     //第二页
                    //     //如果存在数据并且当前的页面小于等于总页码时push
                    //     if (data.datas.length && vm.pageNo <= data.totalPage) {
                    //         data.datas.forEach(function(item) {
                    //             // 预约中的时候-倒计时
                    //             if (item.state == 0) {
                    //
                    //             }
                    //             vm.BatteryOrder_data.batteryOrderList.push(item);
                    //         });
                    //     }
                    // }
                    // vm.pageNo++;
                });
        },
        //可以操作救援下单
        // 订单状态 0：待维修 1：已维修  2：已撤销
        isOperation: function (){
            apps.axget(
              "rescue/selectNotPay", {},
              function(data){
                if (data) {
                  vm.operation = data;
                }
            });
        },
        //取消订单
        cancelOrder:function(item){
          // console.log(JSON.stringify(item.rescueid));
            api.confirm({
                title: '确认取消订单吗？',
                msg: '',
                buttons: ['确定', '取消']
                }, function(ret, err) {
                  if(ret.buttonIndex ===1 ){
                    apps.axpost("rescue/updateUserRevokeRescue",{
                      rescueid:item.rescueid
                    },function(data){
                      console.log(data === "");
                      vm.init();
                    });
                    console.log("2222");
                    vm.init();
                  }else{
                    console.log("1111");
                      vm.init();
                  }

            });


        },
        // 电话
        settelsBtn: function(item) {
            // 拨打电话
                    api.call({
                        type: 'tel_prompt',
                        number: item.cellphone
                    });
        },
        jumphelpDetails: function(item) {
            vm.shopdistance = item.distance;
            vm.all_pay = item.cost;
            vm.rescueid = item.rescueid;
            vm.help = item.faulttype;
            vm.orderstate = item.orderstate;
            vm.istakestate = item.istakestate;
            apps.axget(
                "rescue/selectShop", {
                    shopid: item.shopid,
                },
                function(data) {
                    if (data) {
                        vm.selectShop_data = data;
                        jumpUrl.afford({ selectShop_data: vm.selectShop_data, shopdistance: vm.shopdistance, all_pay: vm.all_pay, rescueid: vm.rescueid, help: vm.help,orderstate: vm.orderstate,istakestate: vm.istakestate });
                    }
                });
            //"支付订单"按钮 --- 跳转到 支付页面（支付救援订单）
            // setTimeout(function(){
            //   if (vm.selectShop_data.shopid && item.shopid) {
            //       jumpUrl.afford({ selectShop_data: vm.selectShop_data, shopdistance: vm.shopdistance, all_pay: vm.all_pay, rescueid: vm.rescueid, help: vm.help,orderstate: vm.orderstate,istakestate: vm.istakestate });
            //   }
            // },100);
        }
    },
});

apiready = function() {
    // 实现沉浸式效果
    $api.fixStatusBar($api.dom("header"));
    api.parseTapmode();
    vm.init();
    //下拉刷新
    apps.pageDataF5(function() {
        vm.init();
    });
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
