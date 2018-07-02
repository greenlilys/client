/**
 * 电池续租费用
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#rechargetn',
    data: {
        // 救援单数据
        operation: [],
        shopUserInfodata: {},
        balancewallets: {},
        balanceintegrals: {},
        //打折活动数据
        discountActivity:{},
        //实时时间戳，来判断活动是否过期
        nowTime:'',
        //充值金额
        distountPrice:'',
        //充值天牛币
        money: 1000,
        //当前折扣
        distount:'',
        shopid: '',
        appointid: '',
        tianncoin: 'rechargeok',
        paymode: 0,
        usealipay: false,
        usewxpay: false,
        //天牛币
        money: 1000,
        margin: 0,
        integral: 0,
        paymentMoney: 0,
        tnactiveDetails: {
           number: 0,
           pas: {}
        },
        giveMuch:0,
    },
    methods: {
        //初始化
        init: function() {
            vm.shopid = api.pageParam.shopid;
            vm.appointid = api.pageParam.appointid;
            vm.getshopUserInfo();
            vm.active();
        },
        //获取
        getshopUserInfo: function() {
            // 天牛币
            apps.axget(
                "integral/balance", {},
                function(data) {
                    vm.balanceintegrals = data;
                });
            apps.axget(
                "wallet/balance", {},
                function(data) {
                    vm.balancewallets = data;
                });
            // 用户信息
            apps.axget(
                "customer/selectInfo", {},
                function(data) {
                    vm.shopUserInfodata = data;
                });
            //查询充值天牛币打折信息
            apps.axget(
                "recharge/selectBeetleDiscount", {},
                function(data) {
                    console.log(JSON.stringify(data));
                    vm.discountActivity = data;
                    vm.getNowTime();
                    //默认充值数量是否满足打折条件
                    if(data.endTimes > vm.nowTime && vm.money >= data.pas.oneDiscountA){
                      vm.deDisPrice(vm.money);
                    }else{
                      vm.distountPrice = vm.money/100;
                    }

                });
        },
        //计算当前时间戳
        getNowTime:function(){
          vm.nowTime = new Date().getTime();
          console.log(vm.nowTime);
        },
        //计算默认充值天牛币打折后金额
        deDisPrice:function(money){
          var oneDiscountA = vm.discountActivity.pas.oneDiscountA,
              oneDiscountB = vm.discountActivity.pas.oneDiscountB,
              twoDiscountA = vm.discountActivity.pas.twoDiscountA,
              twoDiscountB = vm.discountActivity.pas.twoDiscountB,
              threeDiscountA = vm.discountActivity.pas.threeDiscountA,
              threeDiscountB = vm.discountActivity.pas.threeDiscountB,
              fourDiscounts = vm.discountActivity.pas.fourDiscounts,
              oneDiscount = vm.discountActivity.pas.oneDiscount,
              twoDiscount = vm.discountActivity.pas.twoDiscount,
              threeDiscount = vm.discountActivity.pas.threeDiscount,
              fourDiscount = vm.discountActivity.pas.fourDiscount;
        if(money >= oneDiscountA && money <= oneDiscountB){
          vm.distountPrice = (vm.money/100*oneDiscount).toFixed(2);
          vm.distount = oneDiscount;
          console.log(vm.distountPrice);
        }else if(money >= twoDiscountA && money <= twoDiscountB){
          vm.distountPrice = (vm.money/100*twoDiscount).toFixed(2);
          vm.distount = twoDiscount;
        }else if(money >= threeDiscountA && money <= threeDiscountB){
          vm.distountPrice = (vm.money/100*threeDiscount).toFixed(2);
          vm.distount = threeDiscount;
        }else if(money >= fourDiscounts){
          vm.distountPrice = (vm.money/100*fourDiscount).toFixed(2);
          vm.distount = fourDiscount;
        }
  },

        //查询充值天牛币活动
        active: function (){
          apps.axget(
              "/recharge/selectBeetleInformation", {},
              function(data) {
                  if (data) {
                    vm.tnactiveDetails = data;
                    // alert(timestampToTime(vm.tnactiveDetails.endTimes));
                    // alert(timestampToTime(vm.tnactiveDetails.startTimes));
                    vm.tnactiveDetails.startTimes = timestampToTime(vm.tnactiveDetails.startTimes);
                    vm.tnactiveDetails.endTimes = timestampToTime(vm.tnactiveDetails.endTimes);
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
                            /*api.toast({
                                msg: '支付成功',
                                location: 'middle'
                            });*/

                            //发送从新加载地图的监听
                            api.sendEvent({
                                name: 'setf5loadEvent'
                            });
                            alert("缴纳成功");
                            //支付成功跳转到 提示页面
                            jumpUrl.rechargesuccess({ tianncoin: 'rechargeok' });
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
                            // alert(ret.code);
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
                    alert("缴纳成功");
                    //发送从新加载地图的监听
                    api.sendEvent({
                        name: 'setf5loadEvent'
                    });
                    //支付成功跳转到 提示页面
                    jumpUrl.rechargesuccess({ tianncoin: 'rechargeok' });
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
        close_shopInfo: function() {
            api.setFrameAttr({
                name: 'mapshops_infos_frm',
                hidden: true
            });
        },
    },
    watch:{
      money:function (curVal,oldVal) {
        if(vm.tnactiveDetails.number == 1){
          if(curVal >= vm.tnactiveDetails.pas.oneStageA && curVal < vm.tnactiveDetails.pas.oneStageB){
            vm.giveMuch = vm.tnactiveDetails.pas.oneGiveMuch;
          }else if (curVal >= vm.tnactiveDetails.pas.twoStageA && curVal < vm.tnactiveDetails.pas.twoStageB) {
            vm.giveMuch = vm.tnactiveDetails.pas.twoGiveMuch;
          }else if (curVal >= vm.tnactiveDetails.pas.threeStageA && curVal < vm.tnactiveDetails.pas.threeStageB) {
            vm.giveMuch = vm.tnactiveDetails.pas.threeGiveMuch;
          }else if(curVal >= vm.tnactiveDetails.pas.fourStage){
            vm.giveMuch = vm.tnactiveDetails.pas.fourGiveMuch;
          }
        };
        //监听充值天牛币的数值变化，计算折扣后的充值价格  不在活动期限内不做这部分计算

          if(vm.discountActivity.endTimes > vm.nowTime && curVal != oldVal) {

              var oneDiscountA = vm.discountActivity.pas.oneDiscountA,
                  oneDiscountB = vm.discountActivity.pas.oneDiscountB,
                  twoDiscountA = vm.discountActivity.pas.twoDiscountA,
                  twoDiscountB = vm.discountActivity.pas.twoDiscountB,
                  threeDiscountA = vm.discountActivity.pas.threeDiscountA,
                  threeDiscountB = vm.discountActivity.pas.threeDiscountB,
                  fourDiscounts = vm.discountActivity.pas.fourDiscounts,
                  oneDiscount = vm.discountActivity.pas.oneDiscount,
                  twoDiscount = vm.discountActivity.pas.twoDiscount,
                  threeDiscount = vm.discountActivity.pas.threeDiscount,
                  fourDiscount = vm.discountActivity.pas.fourDiscount;
              if(curVal >= oneDiscountA && curVal <= oneDiscountB){
                vm.distountPrice = (vm.money/100*oneDiscount).toFixed(2);
                vm.distount = oneDiscount;
              }else if(curVal >= twoDiscountA && curVal <= twoDiscountB){
                vm.distountPrice = (vm.money/100*twoDiscount).toFixed(2);
                vm.distount = twoDiscount;
              }else if(curVal >= threeDiscountA && curVal <= threeDiscountB){
                vm.distountPrice = (vm.money/100*threeDiscount).toFixed(2);
                vm.distount = threeDiscount;
              }else if(curVal >= fourDiscounts){
                vm.distountPrice = (vm.money/100*fourDiscount).toFixed(2);
                vm.distount = fourDiscount;
              }else{
                vm.distountPrice = vm.money/100;
              }


          }else{
            // 没有活动
            vm.distountPrice = vm.money/100;
          }
      }
    },
});

apiready = function() {
    api.parseTapmode();
    vm.init();
    //下拉刷新
    apps.pageDataF5(function() {
        vm.init();
    });
}

function saveBtn() {
    $("#payBtn").attr("disabled","disabled");
    // 如果有未支付的救援订单
  apps.axget(
    "rescue/selectNotPay", {},
    function(data){
      if (data) {
        vm.operation = data;
        if (vm.operation.length >= 1) {
          api.confirm({
                  title: '订单提醒',
                  msg: '你有一个未支付的救援订单，支付完成"救援订单"之后才能充值天牛币，或者联系网点撤销订单。',
                  buttons: ['支付订单', '取消']
              },
              function(ret, err) {
                  if (ret.buttonIndex == 1) {
                      //  jumpUrl.battery_isrent();
                      $("#payBtn").removeAttr("disabled");
                       jumpUrl.rescuelist();
                  }else{
                    $("#payBtn").removeAttr("disabled");
                  }
              }
          );
          return false;
        }else {
          if (vm.paymode==2) {
              console.log("余额支付")
            if (vm.balancewallets.wallet < vm.money / 100) {
              alert("余额不足！");
              $("#payBtn").removeAttr("disabled");
              return false;
            }else {
              if (vm.money % 100 !== 0) {
                alert("充值整数金额！");
                $("#payBtn").removeAttr("disabled");
                return false;
              }else {
                if (vm.money <1000) {
                  alert("充值天牛币最低1000");
                  $("#payBtn").removeAttr("disabled");
                  return false;
                }else {
                  apps.axpost(
                      "recharge/rechargetnb", {
                          //天牛币余额
                          margin:vm.balanceintegrals.integral,
                          //充值天牛币数量
                          integral:vm.money,
                          //支付金额
                          amount:vm.distountPrice,
                          //支付方式
                          paymode:vm.paymode,
                      },
                      function(data) {
                          vm.requestalipay = data;
                          console.log(JSON.stringify(data));
                          console.log(vm.paymode);
                          // 如果 支付宝支付
                          if (vm.paymode==0) {
                              api.toast({
                                  msg: '请用支付宝付款',
                                  location: 'middle'
                              });
                              if (vm.requestalipay) {
                                  vm.aliPayfun();
                              }
                          }
                          // 如果 微信支付
                          if (vm.paymode==1) {
                            console.log("微信支付")
                              api.toast({
                                  msg: '请用微信付款',
                                  location: 'middle'
                              });
                              if (vm.requestalipay) {
                                  vm.wxpayfun();
                              }
                          }

                            // 钱包支付
                            if (!data) {
                              //支付成功跳转到 提示页面
                              alert("充值成功");
                              $("#payBtn").removeAttr("disabled");
                              jumpUrl.rechargesuccess({ tianncoin: 'rechargeok' });
                            }
                      });
                }
              }
            }
          }else {
            $("#payBtn").removeAttr("disabled");
            if (vm.money % 100 !== 0) {
              alert("充值整数金额！");
              return false;
            }else {
              if (vm.money <1000) {
                alert("充值天牛币最低1000");
                return false;
              }else {
                apps.axpost(
                    "recharge/rechargetnb", {
                        //天牛币余额
                        margin:vm.balanceintegrals.integral,
                        //充值天牛币数量
                        integral:vm.money,
                        //支付金额
                        amount:vm.distountPrice,
                        //支付方式
                        paymode:vm.paymode,
                    },
                    function(data) {

                        vm.requestalipay = data;
                        // 如果 支付宝支付
                        if (vm.paymode==0) {
                            api.toast({
                                msg: '请用支付宝付款',
                                location: 'middle'
                            });
                            if (vm.requestalipay) {
                                vm.aliPayfun();
                            }
                        }
                        // 如果 微信支付
                        if (vm.paymode==1) {
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
                            //支付成功跳转到 提示页面
                            //发送从新加载地图的监听
                            // api.sendEvent({
                            //     name: 'setf5loadEvent'
                            // });
                            alert("充值成功");
                            jumpUrl.rechargesuccess({ tianncoin: 'rechargeok' });
                          }
                    });
              }
            }
          }
        }
      }
  });
  setTimeout(function(){
    $("#payBtn").removeAttr("disabled");
  },5000)
}

// 时间戳转化成日期格式
function timestampToTime(timestamp) {
        // var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        Y = date.getFullYear() + '-';
        M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
        D = date.getDate() + ' ';
        h = date.getHours() + ':';
        m = date.getMinutes() + ':';
        s = date.getSeconds();
        return Y+M+D+h+m+s;
    }
    // console.log(timestampToTime(1403058804));//2014-06-18 10:33:24
