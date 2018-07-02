// 声明vue加载
var vm = new Vue({
    el: '#modifyBatteryDetails-frm',
    data: {
      orderId:0,
      shopAddress:'',
      shopNo:'',
      shopName:'',
      contactname:'',//网点联系人
      shopTel:0,
      oldBatteryName:'',
      newBatteryName:'',
      groupNum:1,
      cost:0,//服务费
      fee:0,//手续费
      overdeposit:0,//退还or补缴押金
      overrent:0,//退还or补缴租金
      overdeposit_abs:0,//绝对值转换
      overrent_abs:0,
      return_money:0,//退还总金额
      all_pay:0,//总支付费用
      paystate:0,//支付状态
      state:0,//订单状态
      paymode:0,
      usealipay:false,
      usewxpay:false,
      wallet:0,//用户钱包余额
      requestInfo:'',//支付需要的信息
      setLocationxy: {}, //当前xy 坐标
      x:'',//商家坐标x
      y:'',//商家坐标y
    },
    methods: {
        //初始化
        init: function() {
          vm.orderId = api.pageParam.id;
          vm.setLocationxy = $api.getStorage("setLocationxy");
          vm.getOrderDetails();
        },
        // 获取订单详情
        getOrderDetails: function() {
            apps.axget(
                "switchOver/select", {
                    id: vm.orderId
                },
                function(data) {
                    if (data) {
                      vm.shopAddress = data.provincename + '' + data.cityname + '' + data.countyname + '' + data.address;
                      vm.shopNo = data.no;
                      vm.shopName = data.name;
                      vm.contactname = data.contactname;
                      vm.shopTel = data.contactcellphone;
                      vm.oldBatteryName = data.oldName;
                      vm.newBatteryName = data.newName;
                      vm.cost = data.cost;
                      vm.fee = data.fee;
                      vm.overdeposit = data.overdeposit;
                      vm.overrent = data.overrent;
                      vm.overdeposit_abs = Math.abs(vm.overdeposit);
                      vm.overrent_abs = Math.abs(vm.overrent);
                      vm.return_money = vm.overdeposit_abs + vm.overrent_abs - vm.cost - vm.fee;
                      vm.all_pay = vm.overdeposit_abs + vm.overrent_abs + vm.cost + vm.fee;
                      vm.paystate = data.paystate;
                      vm.state = data.state;
                      vm.wallet = data.wallet;
                      vm.x = data.x;
                      vm.y = data.y;
                    }
                });
        },
        //拨打电话
        contactShop:function () {
          api.actionSheet({
              title:vm.contactname,
              cancelTitle: '取消',
              buttons: [vm.shopTel]
          }, function(ret, err) {
              var index = ret.buttonIndex;
              // 拨打电话
              if (index == 1) {
                  api.call({
                      type: 'tel_prompt',
                      number: vm.shopTel
                  });
              }
          });
        },
        // 导航到店
        navigationBtn: function() {
            api.toast({
                msg: '正在调取导航功能，请稍候',
                duration: 2000,
                location: 'middle'
            });
            var baiduNavigation = api.require('baiduNavigation');
            baiduNavigation.start({
                start: { // 起点信息.
                    position: { // 经纬度，与address配合可为空
                        lon: vm.setLocationxy.x, // 经度.
                        lat: vm.setLocationxy.y // 纬度.
                    },
                },
                end: { // 终点信息.
                    position: { // 经纬度，与address配合可为空
                        lon: vm.x, // 经度.
                        lat: vm.y // 纬度.
                    },
                    title: vm.shopName, // 描述信息
                    address: vm.shopAddress // 地址信息，与position配合为空
                }
            }, function(ret, err) {
                if (ret.status) {
                    api.alert({
                        title: "提示",
                        msg: '导航成功'
                    });
                } else {
                    var msg = "未知错误";
                    if (1 == err.code) {
                        msg = "获取地理位置失败";
                    }
                    if (2 == err.code) {
                        msg = "定位服务未开启";
                    }
                    if (3 == err.code) {
                        msg = "线路取消";
                    }
                    if (4 == err.code) {
                        msg = "退出导航";
                    }
                    if (5 == err.code) {
                        msg = "退出导航声明页面";
                    }
                    api.alert({
                        title: "导航提示",
                        msg: msg
                    });
                }
            });

        },
        //取消订单
        cancelOrder:function(){
            api.confirm({
                title: '确认取消订单吗？',
                msg: '',
                buttons: ['确定', '取消']
                }, function(ret, err) {
                  if(ret.buttonIndex ===1 ){
                    apps.axpost("switchOver/cancel",{
                      id:vm.orderId
                    },function(data){
                      api.toast({
                          msg: '取消成功',
                          duration: 2000,
                          location: 'middle'
                      });
                      closeToRoot();
                    });
                  }else{
                    vm.init();
                  }
            });
        },
        // 支付模式选择
        paymodeBtn: function(paymodeNum) {
            if (paymodeNum == '0') {
                vm.paymode = 0;
                vm.usealipay = true;
                vm.usewxpay = false;
            }
            if (paymodeNum == '1') {
                vm.paymode = 1;
                vm.usewxpay = true;
                vm.usealipay = false;
            }
            if (paymodeNum == '2') {
                vm.paymode = 2;
            }
        },
        //调用支付宝客户端支付
        aliPayfun: function() {
            var aliPayPlus = api.require('aliPayPlus');
            aliPayPlus.payOrder({
                orderInfo: vm.requestInfo
            }, function(ret, err) {
                if (ret) {
                    switch (ret.code) {
                        // code为 1 说明返回成功
                        case '9000':
                            alert("支付成功");
                            //支付成功
                            closeToRoot();
                            break;
                        case '4000':
                            api.toast({
                                msg: '系统异常',
                                location: 'middle'
                            });
                            break;
                        case '4006':
                            api.toast({
                                msg: '订单支付失败',
                                location: 'middle'
                            });
                            break;
                        case '6000':
                            api.toast({
                                msg: '支付服务正在进行升级操作',
                                location: 'middle'
                            });
                            break;
                        case '6001':
                            api.toast({
                                msg: '用户中途取消支付操作',
                                location: 'middle'
                            });
                            break;
                        case '0001':
                            api.toast({
                                msg: '缺少商户配置信息（商户id，支付公钥，支付密钥）',
                                location: 'middle'
                            });
                            break;
                        case '0002':
                            api.toast({
                                msg: '缺少参数（subject、body、amount、tradeNO）',
                                location: 'middle'
                            });
                            break;
                        case '0003':
                            api.toast({
                                msg: '签名错误（公钥私钥错误）',
                                location: 'middle'
                            });
                            break;
                        default:
                            alert(ret.code);
                            api.toast({
                                msg: '收款方支付宝账户状态异常',
                                location: 'middle'
                            });
                            break;
                    }
                } else {
                    alert('收款方账户状态异常');
                }
            });
        },
        //调用微信客户端支付
        wxpayfun: function() {
            var wxPay = api.require('wxPay');
            wxPay.payOrder({
                apiKey: vm.requestInfo.appid,
                orderId: vm.requestInfo.prepayid,
                mchId: vm.requestInfo.partnerid,
                nonceStr: vm.requestInfo.noncestr,
                timeStamp: vm.requestInfo.timestamp,
                package: vm.requestInfo.package,
                sign: vm.requestInfo.sign
            }, function(ret, err) {
                //支付成功
                if (ret.status) {
                    //支付成功
                    alert("支付成功");
                    closeToRoot();
                } else {
                    // code: 1
                    //错误码：
                    //-2（用户取消，发生场景：用户不支付了，点击取消，返回APP）
                    //-1（未知错误，可能的原因：签名错误、未注册APPID、项目设置APPID不正确、注册的APPID与设置的不匹配、其他异常等）
                    //1 (apiKey值非法)
                    // alert(err.code);
                    switch (err.code) {
                        case -1:
                            api.toast({
                                msg: '系统异常或者未知错误，请联系管理员',
                                location: 'middle'
                            });
                            break;
                        case -2:
                            api.toast({
                                msg: '用户中途取消支付操作',
                                location: 'middle'
                            });
                            break;
                        default:
                            api.toast({
                                msg: '收款方账户状态异常',
                                location: 'middle'
                            });
                            break;
                    }
                }
            });
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
}

function payBtn() {
  apps.axpost(
    "switchOver/pay", {
      id:vm.orderId,
      paymode:vm.paymode,
    },function(data){
      // 钱包支付
      if (data == "") {
        api.toast({
            msg: '支付成功',
            duration: 2000,
            location: 'middle'
        });
        setTimeout(function () {
          closeToRoot();
        }, 1000);
      }
      if(data){
        vm.requestInfo = data;
        // 如果 支付宝支付
        if (vm.paymode==0) {
            api.toast({
                msg: '请用支付宝付款',
                location: 'middle'
            });
            if (vm.requestInfo) {
                vm.aliPayfun();
            }
        }
        // 如果 微信支付
        if (vm.paymode==1) {
            api.toast({
                msg: '请用微信付款',
                location: 'middle'
            });
            if (vm.requestInfo) {
                vm.wxpayfun();
            }
        }
      }
    });
}
function subBtn() {
  apps.axpost(
    "switchOver/pay", {
      id:vm.orderId,
    },function(data){
      api.toast({
        msg: '提交成功',
        duration: 2000,
        location: 'middle'
      });
      setTimeout(function () {
        closeToRoot();
      }, 1000);
    });
}
function closeToRoot(){
  api.closeToWin({
    name: 'root'
  });
}
