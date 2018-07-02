/**
 * 救援店铺详情
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#afford-frm',
    data: {
        selectShop_data: {

        },
        //  救援单号
        rescueid: 123456,
        // 救援类型
        help: '',
        //订单状态   订单状态 0：待维修 1：已维修  2：已撤销
        orderstate: '',
        //订单生效 0：网点撤销订单   1：网点接受订单 2：等待网点操作
        istakestate: 2,
        shopid: '',
        shopdistance: '',
        //花费
        all_pay: 666,
        alladdress: '', //整个地址
        setLocationxy: {}, //当前xy 坐标
        getOrderSet: {},
        cellphone: '',
        paymode: 0,
        usealipay: false,
        usewxpay: false,
    },
    methods: {
        //初始化
        init: function() {
            vm.setLocationxy = $api.getStorage("setLocationxy");
            //店铺信息详情、网点距离、花费救援费用     救援单号
            vm.shopdistance = api.pageParam.shopdistance;
            vm.selectShop_data = api.pageParam.selectShop_data;
            vm.all_pay = api.pageParam.all_pay;
            vm.rescueid = api.pageParam.rescueid;
            vm.help = api.pageParam.help;
            vm.orderstate = api.pageParam.orderstate;
            vm.istakestate = api.pageParam.istakestate;
            // alert(vm.orderstate);
            //拼接整个地址
            vm.alladdress = vm.selectShop_data.provincename + vm.selectShop_data.cityname + vm.selectShop_data.countyname + vm.selectShop_data.address;
            //取订单设置 -钱包额度
            apps.axget(
                "customerOrder/getOrderSet", { //需要提交的参数值
                },
                function(data) {
                    vm.getOrderSet = data;
                    // alert(JSON.stringify(vm.getOrderSet));
                }
            );
            // api.alert({
            //     title: '支付订单',
            //     msg: '请尽快支付救援订单',
            // }, function(ret, err){
            //
            // });
        },
        // jumprshopidBtn: function() {
        //     // 如果是  救援 url
        //     if (vm.urlstats == 'sos_help') {
        //         jumpUrl.rescueshopinfo({ shopid: vm.shopid });
        //     } else {
        //         //发送shopid的监听 -退租
        //         api.sendEvent({
        //             name: 'setshopListidEvent',
        //             extra: {
        //                 shopid: vm.shopid
        //             }
        //         });
        //         jumpUrl.battery_isrent({ shopid: vm.shopid });
        //     }
        //
        // },
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
                orderInfo: vm.requestalipay
            }, function(ret, err) {
                if (ret) {
                    switch (ret.code) {
                        // code为 1 说明返回成功
                        case '9000':
                            alert("订单已支付,返回救援订单上拉刷新查看订单");
                            //支付成功跳转到 提示页面
                            jumpUrl.rescuelist();
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
                apiKey: vm.requestalipay.appid,
                orderId: vm.requestalipay.prepayid,
                mchId: vm.requestalipay.partnerid,
                nonceStr: vm.requestalipay.noncestr,
                timeStamp: vm.requestalipay.timestamp,
                package: vm.requestalipay.package,
                sign: vm.requestalipay.sign
            }, function(ret, err) {
                //支付成功
                if (ret.status) {
                    //支付成功
                    alert("订单已支付,返回救援订单上拉刷新查看订单");
                    //支付成功跳转到 提示页面
                    jumpUrl.rescuelist();
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
    // 实现沉浸式效果
    $api.fixStatusBar($api.dom("header"));
    api.parseTapmode();
    //下拉刷新
    apps.pageDataF5(function() {
        vm.init();
    });
    vm.init();
}

function affordBtn() {
    apps.axget(
      "/rescue/selectRescueId", {
          rescueid: vm.rescueid
      },function(data){
          if (data) {
              if (!data.paystate) {
                  payorder();
              }else {
                api.confirm({
                      title: '消息提醒',
                      msg: '订单已支付,返回救援订单上拉刷新查看订单',
                      buttons: ['返回订单', '取消']
                  },
                  function(ret, err) {
                      if (ret.buttonIndex == 1) {
                          //  jumpUrl.battery_isrent();
                           jumpUrl.rescuelist();
                      }
                  }
              );
              }
          }
    });
}
function payorder(){
  apps.axpost(
      "/rescue/updateRescue", {
          //需要提交的参数值
          shopid: vm.selectShop_data.shopid,
          distance: vm.shopdistance,
          paymode: vm.paymode,
          rescueid: vm.rescueid,
          cost: vm.all_pay
      },
      function(data) {
          // 更新购物车数量
          //更新购物车数量
          api.sendEvent({
              name: 'mallindex_cars_init',
          });
          vm.requestalipay = data;
          // 如果 支付宝支付
          if (vm.paymode == 0) {
              api.toast({
                  msg: '请用支付宝付款',
                  location: 'middle'
              });
              if (vm.requestalipay) {
                  vm.aliPayfun();
              }
          }
          // 如果 微信支付
          if (vm.paymode == 1) {
              api.toast({
                  msg: '请用微信付款',
                  location: 'middle'
              });
              if (vm.requestalipay) {
                  vm.wxpayfun();
              }
          }
          // 钱包支付
          if (data == "") {
              alert("救援单支付成功，"+"\n可在“我的--救援单”中,上拉刷新查看本次救援信息，感谢使用。");
              //支付成功跳转到 首页
              // 跳转首页
              api.sendEvent({
                      name: 'indexinit'
                  });
              api.sendEvent({
                  name: 'loginsucesspst'
              });
              setTimeout(function() {
                  api.closeToWin({
                      name: 'root'
                  });
              }, 300);
          }
      });
}
