/**
 * 救援店铺详情
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#rescueshop-frm',
    data: {
        //商铺信息
        name: "店铺名字",
        //救援单ID
        rescueid: 123456,
        //救援数据
        help_data: {},
        // 救援类型
        type_data: [],
        help: "补胎",
        //订单生效 0：网点撤销订单   1：网点接受订单 2：等待网点操作
        istakestate: 0,
        //救援订单数组
        operation: [],
        price: 10,
        //里程费用
        distance_money: 88,
        //花费
        all_pay: 66,
        typenum: 0,
        iscan: 0,
        //用户手机
        cellphone: '',
        selectShop_data: {},
        shopid: '',
        shopdistance: '',
        alladdress: '', //整个地址
        setLocationxy: {}, //当前xy 坐标
        urlstats: '', // 跳转状态变量
        startingPrice:7,//里程费起步价
        unitPrice:5,//里程单价
        lon:"",
        lat:""
    },
    methods: {
        //初始化
        init: function() {
            // vm.setLocationxy = $api.getStorage("setLocationxy");
            vm.shopid = api.pageParam.shopid;
            vm.shopdistance = api.pageParam.shopdistance;
            vm.alladdress = api.pageParam.alladdress;
            vm.name = api.pageParam.name;
            //获取里程费起步价和单价
            vm.mileagePrice();
            vm.getselectShop();
            vm.getPrice();
            //计算交通费用
            vm.distance_Money();
            //计算总费用
            vm.cost();
            vm.isOperation();
            //获取用户地理位置
            vm.getAddress();
        },
        // 获取店铺信息详情
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
        getPrice: function(){
          apps.axget(
            "/rescue/selectRepairList",{},
            function(data){
              vm.help_data = data;
              // alert(JSON.stringify(vm.help_data));
              vm.type_data.splice(0,vm.type_data.length);
              vm.help_data.forEach(function(item){
                vm.type_data.push(item.type);
                // vm.type_data.push(item.amount);
              });
            }
          );
        },
        //可以操作救援下单
        // 订单状态 0：待维修 1：已维修  2：已撤销
        isOperation: function (){
            apps.axget(
              "rescue/selectNotPay", {},
              function(data){
                if (data) {
                  vm.operation = data;
                  // alert(JSON.stringify(data));
                }
            });
        },
        //计算里程费用
        distance_Money:function(){
          if (vm.shopdistance <= 1) {
              vm.distance_money = vm.startingPrice;
          }else {
            vm.distance_money = (vm.shopdistance - 1) * vm.unitPrice + vm.startingPrice;
          }
        },
        //救援总费用
        cost:function(){
          // vm.distance_money();
          if (!vm.price) {
              if (vm.help == '拖车') {
                  vm.price = '2 * 里程费';
                  vm.all_pay = vm.distance_money * 2;
              }
              if (vm.help == '其他') {
                  vm.price = '里程费';
                  vm.all_pay = vm.distance_money;
              }
              if (vm.help == '其他问题') {
                  vm.price = '里程费';
                  vm.all_pay = vm.distance_money;
              }
              if (vm.help == '其它') {
                  vm.price = '里程费';
                  vm.all_pay = vm.distance_money;
              }
              if (vm.help == '其它问题') {
                  vm.price = '里程费';
                  vm.all_pay = vm.distance_money;
              }
          }else {
              vm.all_pay = vm.distance_money + vm.price;
          }
        },
        //获取里程起步价和单价
        mileagePrice: function () {
          apps.axget(
            "rescue/selectPrice", {},
            function(data){
              if (data) {
                vm.startingPrice = data.prices;
                vm.unitPrice = data.price;
              }
          });
        },
        // 电话
        settelsBtn: function() {

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
        },
        //获取地理位置
        getAddress:function(){
          vm.bMap.getLocationServices(function(ret,err){
            if(ret.enable){
              vm.bMap.getLocation({
                  accuracy: '10m',
                  autoStop: true,
                  filter: 1,
              }, function(ret, err) {
                  if (ret.status) {
                      vm.lon = ret.lon;
                      vm.lat = ret.lat;
                      // 保存如本地缓存
                  } else {
                      alert('定位异常码：' + err.code);
                  }
              });
            }else{
                alert("请开启CPG定位")
            }
          })

        },
        openSelect: function(){
          setTimeout(function(){
            openUIMultiSelector();
          },300);
        },
        // //下单跳转  救援订单详情
        // addrescueBtn: function() {
        //     //店铺信息详情、网点距离、花费人民币
        //     jumpUrl.addrescue({ selectShop_data: vm.selectShop_data, shopdistance: vm.shopdistance, all_pay: vm.all_pay });
        // },
        userbmapxyBtn: function() {
            //   店铺位置
            jumpUrl.userbmapxy({ x: vm.selectShop_data.x, y: vm.selectShop_data.y });
        },
    },
});

var UIMultiSelector;
var itemArr;
apiready = function() {
    setTimeout(function(){
      openUIMultiSelector();
    },400);
    vm.bMap = api.require('bMap');
    api.parseTapmode();
    //下拉刷新
    apps.pageDataF5(function() {
        vm.init();
    });
    vm.init();
};

function openUIMultiSelector (){
// alert(JSON.stringify(vm.type_data));
  var itemArr = [];
  for (var i = 0; i < vm.type_data.length; i++) {

          var obj = {
                  text : vm.type_data[i],
                  static : 'normal',
          }
          itemArr.push(obj);
          // console.log(JSON.stringify(itemArr));
  }
  UIMultiSelector = api.require('UIMultiSelector');
  UIMultiSelector.open({
     rect: {
         h: api.winHeight / 2
     },
     text: {
         title: '选择救援类型',
         leftBtn: '取消',
         rightBtn: '完成'
     },
     max: 1,
     singleSelection: true,
     maskClose: false,
     singleSelection: true,
     styles: {
         mask: 'rgba(0,0,0,0.8)',
         title: {
             bg: 'rgb(221,221,221)',
             color: 'rgb(0,0,0)',
             size: 16,
             h: 44
         },
         leftButton: {
              bg: '#fff',
             w: 80,
             h: 35,
             marginT: 5,
             marginL: 8,
             color: 'rgb(0,0,0)',
             size: 14
         },
         rightButton: {
              bg: '#fff',
             w: 80,
             h: 35,
             marginT: 5,
             marginR: 8,
             color: 'rgb(0,0,0)',
             size: 14
         },
         item: {
             h: 35,
             bg: 'rgb(255,255,255)',
             bgActive: 'rgb(221,221,221)',
             bgHighlight: 'rgb(221,221,221)',
             color: 'rgb(0,0,0)',
             active: '#ff7010',
             highlight: 'rgb(43,213,166)',
             size: 14,
             lineColor: 'rgb(0,0,0)',
             textAlign: 'center'
         },
         icon: {
             w: 20,
             h: 20,
             marginT: 11,
             marginH: 8,
             bg: '#fff',
             bgActive: '#ff7010',
             align: 'left'
         }
     },
     animation: true,
     items : itemArr
  }, function(ret, err) {
     if (ret) {
        //  alert(JSON.stringify(ret));
         //点击完成按钮
         if (ret.eventType == "clickRight") {
            if (ret.items.length) {
              vm.help = ret.items[0].text;
              for (var i = 0; i < vm.type_data.length; i++) {
                if (vm.help == vm.help_data[i].type) {
                  // alert(JSON.stringify(vm.help_data[i]));
                  vm.price = vm.help_data[i].amount;
                  vm.distance_Money();
                  vm.cost();
                }
                // if (!vm.price) {
                //     if (vm.help == '拖车') {
                //
                //     }
                // }
                // if (vm.help == '拖车') {
                //     vm.price = '2*里程费';
                //     vm.distance_Money();
                //     vm.cost();
                // }
                // if (vm.help == '其他') {
                //     vm.price = '里程费';
                //     vm.distance_Money();
                //     vm.cost();
                // }
                // if (vm.help == '其它') {
                //     vm.price = '里程费';
                //     vm.distance_Money();
                //     vm.cost();
                // }
              }
              fnClose();
            }
         }
         //点击取消按钮
         if (ret.eventType == "clickLeft") {
            vm.help = "未选";
            vm.all_pay = 0;
            vm.price = 0;
            fnClose();
         }
     } else {
         alert(JSON.stringify(err));
     }
  });
}

// 关闭选择器（从内存清除）
function fnClose() {
    UIMultiSelector.close();
};

//用户输入电话号码
function changephone(){
  // var phoneNum = document.getelementById("#phoneNum");
  var phoneNum = $('#phoneNum').val();
  var phone = phoneNum;
  vm.cellphone = phoneNum;
  var iphone = /0?(13|14|15|16|17|18|19)[0-9]{9}/;
  if (phone.trim()) {
    if (iphone.test(phone)) {
      vm.iscan = 1;
    }else {
      vm.iscan = 0;
      return false;
    }
  }else {
    vm.iscan = 0;
  }
}

//未填写电话号码
function noIphone() {
    // if (!vm.help) {
    //     alert("选择救援类型。");
    // }
    if (!vm.cellphone) {
        alert("填写手机号码之后才能给网点下单。");
    }

}

// 用户下单
function saveBtn() {
  if(!vm.lon && !vm.lat){
    toast("下单前请开启GPS定位");
    return false;
  }
  $("#payBtn").attr("disabled","disabled");
  apps.axget(
    "rescue/selectNotPay", {},
    function(data){
      if (data) {
        vm.operation = data;
        // alert(JSON.stringify(data));
        // 如果有未支付的救援订单
        if (vm.operation.length >= 1) {
          api.confirm({
                title: '订单提醒',
                msg: '您有一个未完成的救援订单，不可以重复下单。',
                buttons: ['支付订单', '取消']
            },
            function(ret, err) {
                if (ret.buttonIndex == 1) {
                    //  jumpUrl.battery_isrent();
                     jumpUrl.rescuelist();
                     $("#payBtn").removeAttr("disabled");
                }else{
                  $("#payBtn").removeAttr("disabled");
                }
            }
        );

        return false;
      }else {
        apps.axpost(
            "/rescue/addRescue", {
                //需要提交的参数值
                shopid: vm.shopid,
                distance: vm.shopdistance,
                cellphone: vm.cellphone,
                x: vm.lon,
                y: vm.lat,
                faulttype: vm.help,
                amount: vm.price,
                mileage: vm.distance_money
            },
            function(data) {
                alert("下单成功，系统已经生成订单，请联系网点通知进行救援。");
                $("#payBtn").removeAttr("disabled");
                vm.rescueid = data.rescueid;
                //下单成功跳转到 救援 支付页面（支付救援订单）
                // jumpUrl.afford({ selectShop_data: vm.selectShop_data, shopdistance: vm.shopdistance, all_pay: vm.all_pay, rescueid: vm.rescueid, help: vm.help,istakestate: vm.istakestate });
                //下单成功跳转  救援列表
                //jumpUrl.rescuelist({ selectShop_data: vm.selectShop_data });
                setTimeout(function() {
                    api.closeToWin({
                        name: 'root'
                    });

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
                }, 300);
            });
          }
      }
  });
}
