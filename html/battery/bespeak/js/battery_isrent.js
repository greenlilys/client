/**
 * 电池预约详情
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#bespeak-form',
    data: {
        selectAppointInfo: {},
        shopid: '',
        UILoadId: '',
        appointid: '',
        batteryIsstats: 'isrent1',
        paymode: 0,
        usealipay: false,
        usewxpay: false,
        // 几小时到店退租
        timerange: 1,
        rent:''//退还租金金额
    },
    methods: {
        //初始化
        init: function() {
            // vm.shopid = api.pageParam.shopid;

            if (vm.shopid == '') {
                alert('请先选择退换预约门店');
                jumpUrl.chooseshoplist();
            } else {
                vm.getselectShop();
            }
        },
        // 获取店铺信息详情
        getselectShop: function() {
            // 加载框
            var UILoading = api.require('UILoading');
            UILoading.flower({
                center: {
                    x: (api.winWidth / 2),
                    y: (api.winHeight / 2),
                },
                size: 30,
                fixed: true
            }, function(ret) {
                vm.UILoadId = ret.id;
            });
            apps.axget(
                "renew/rentAppoint", {
                    shopid: vm.shopid
                },
                function(data) {
                    if (data) {
                        // 关闭打开的加载提示框
                        UILoading.closeFlower({
                            id: vm.UILoadId
                        });
                        vm.selectAppointInfo = data;
                        vm.rent = data.rent;
                        console.log(JSON.stringify(data));
                        console.log(vm.rent );
                        vm.selectAppointInfo.shopsAddress = data.provincename + '' + data.cityname + '' + data.countyname + '' + data.address;

                    }
                });
        },

        bespeakTimeBtn: function(index) {
            var item = vm.selectAppointInfo.bespeakTime[index];
            vm.timerange = item.time;
        },

        close_shopInfo: function() {
            api.setFrameAttr({
                name: 'mapshops_infos_frm',
                hidden: true
            });
        }

    },
});

//计算成本价
// vm.$watch('goodsCount', function() {
//     // 计算日租金
//     vm.costprice = vm.batteryrenttime.rentMoney * vm.goodsCount;
// }, { deep: true });

apiready = function() {
    api.parseTapmode();
    api.addEventListener({
        name: 'setshopListidEvent'
    }, function(ret, err) {
        vm.shopid = ret.value.shopid;
        vm.init();
    });
    vm.init();
}


function saveBtn() {
  apps.axget(
    "rescue/selectNotPay", {},
    function(data){
      if (data) {
        vm.operation = data;
        // 如果有未支付的救援订单
        if (vm.operation.length >= 1) {
          api.confirm({
                  title: '订单提醒',
                  msg: '你有一个未支付的救援订单，支付完成"救援订单"之后才能退租，或者联系网点撤销订单。',
                  buttons: ['支付订单', '取消']
              },
              function(ret, err) {
                  if (ret.buttonIndex == 1) {
                      //  jumpUrl.battery_isrent();
                       jumpUrl.rescuelist();
                  }
              }
          );
          return false;
        }else {
          apps.axpost(
              "renew/rent", {
                  //需要提交的参数值
                  shopid: vm.shopid,
                  timerange: vm.timerange,
                  rent:vm.rent
              },
              function(data) {
                    jumpUrl.battesucess({ batteryIsstats: 'isrent1' });
              });
        }
      }
  });
}
