/**
 * 我的中心
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#mywin-frm',
    data: {
        shopUserInfodata: {},
        balancewallet: {},
        balanceintegral: {},
        // 预约信息
        ShopAndServicedata: {},
        mybattrytxt: '正在使用',
        batteryjson: {},
        userPhone: '',
        signText:"签到",
        signnumber:"",
        integral:""
    },
    methods: {
        //初始化
        init: function() {
            vm.getshopUserInfo();
            vm.getShopAndService();
            // 获取用户电话号码
            vm.getuserPhone();
            //检查签到状态
            vm.signState();
        },
        watch:{
          balanceintegral:function(){
            // console.log('天牛币数据改变了');
          }
        },
        //获取
        getshopUserInfo: function() {
            // 天牛币
            apps.axget(
                "integral/balance", {},
                function(data) {
                    vm.balanceintegral = data;
                });
            apps.axget(
                "wallet/balance", {},
                function(data) {
                    vm.balancewallet = data;
                });
            // 用户信息
            apps.axget(
                "customer/selectInfo", {},
                function(data) {
                    vm.shopUserInfodata = data;
                });
        },
        // 获取预约等信息
        getShopAndService: function() {
            apps.axget(
                "renew/batteryInfo", {},
                function(data) {
                    vm.ShopAndServicedata = data;
                    vm.batteryjson.name = vm.ShopAndServicedata.batteryname;
                    vm.batteryjson.groupnum = vm.ShopAndServicedata.groupnum;
                    // 是否交了押金
                    // isdeposit:"是否已缴纳押金 0：否 1：是",
                    // isinstall:"是否可安装电池 0：否 1：是",
                    // isabnormal:"电池是否损坏 0：否 1：是 "
                    if (vm.ShopAndServicedata.isdeposit === 0 && vm.ShopAndServicedata.isabnormal === 0) {
                        // 没押金 强制跳转押金页面
                        vm.mybattrytxt = '请缴纳押金';
                    }
                    if (vm.ShopAndServicedata.isdeposit === 1) {
                        // 电池状态（已支付押金，未完成安装时）
                        if (vm.ShopAndServicedata.isinstall === 1) {
                            vm.mybattrytxt = '请预约安装电池';
                        } else {
                            // 损坏
                            if (vm.ShopAndServicedata.isabnormal === 1) {
                                vm.mybattrytxt = '电池已损坏';
                            } else {
                                vm.mybattrytxt = '正在使用';
                                // 逾期
                                if (vm.ShopAndServicedata.isoverdue === 1) {
                                    vm.mybattrytxt = '已逾期';
                                }
                            }
                        }
                    }
                });
        },
        getmybatteryBtn: function() {
            // 是否交了押金
            // isdeposit:"是否已缴纳押金 0：否 1：是",
            // isinstall:"是否可安装电池 0：否 1：是",
            // isabnormal:"电池是否损坏 0：否 1：是 "
            if (vm.ShopAndServicedata.isdeposit === 0 && vm.ShopAndServicedata.isabnormal === 0) {
                // 没押金 强制跳转押金页面
                jumpUrl.welcome_nobatteries();
            }
            if (vm.ShopAndServicedata.isdeposit === 1) {
                // 电池状态（已支付押金，未完成安装时）
                if (vm.ShopAndServicedata.isinstall === 1) {
                    jumpUrl.welcome_havebatteries({ batteryjson: vm.batteryjson });
                } else {
                    // 损坏
                    if (vm.ShopAndServicedata.isabnormal === 1) {
                        vm.mybattrytxt = '电池已损坏';
                    } else {
                        // 预约完成 使用中- 可以退租
                        jumpUrl.mybatteries({ ShopAndServicedata: vm.ShopAndServicedata });
                    }
                }
            }
        },
        getuserPhone: function() {
            apps.axget(
              "recharge/selectiPhone", {},
              function(data) {
                  if (data) {
                      vm.userPhone = '';
                      vm.userPhone = data;
                  }
              });
        },
        //签到状态 signstate:1 今日已签到
        signState:function(){
          apps.axget("customersign/selectUserSignNumberDays",{},function(data){
            if(data.signstate == 1){
              vm.signText = "已签到"
            }else{
              vm.signText = "签到"
            }
          })
        },
        //签到
        sign:function(){
          $("#payBtn").attr("disabled","disabled");
          if(vm.signText == "已签到"){
              api.alert({
                title:"提示",
                msg:"您今天已签到，请明天再来！"
              },function(ret,err){
                if(ret.buttonIndex == 1){
                  $("#payBtn").removeAttr("disabled");
                }
              })
              return false;
            }
            apps.axpost("customersign/Sign",{},function(data){
                console.log(JSON.stringify(data));
                  vm.signText = "已签到";
                  vm.getshopUserInfo();//重新获取天牛币
                  $("#payBtn").removeAttr("disabled");
                  apps.openMapWinUrl("sign_fra.html","my/sign/sign_fra.html",{
                    'signnumber' : data.signnumber,
                    'integral' : data.integral
                  })

              })
            setTimeout(function(){
                  $("#payBtn").removeAttr("disabled");
                },5000)
        },


        //打开二维码
        navOpenqrcode_img: function() {
            api.openFrame({
                name: 'openqrcode_img',
                url: 'widget://html/battery/appointinfo/openqrcode_img.html',
                rect: {
                    x: 0,
                    y: 0,
                    w: 'auto',
                    h: 'auto'
                },
                animation: {
                    type: "reveal", //动画类型（详见动画类型常量）
                    subType: "from_right", //动画子类型（详见动画子类型常量）
                    duration: 500
                },
                pageParam:{
                   imgUrl:vm.shopUserInfodata.qrcode,
                   userPhone:vm.userPhone
                 },
                bounces: false,
                reload: true,
                vScrollBarEnabled: false,
                hScrollBarEnabled: false
            })

        },
        //客服热线
        callphone: function() {
          api.call({
              type: 'tel_prompt',
              number: '400-862-5918'
          });
        }
    }
});



apiready = function() {
    // 实现沉浸式效果
    $api.fixStatusBar($api.dom("header"));
    //user-info加上填充，让出header
    var headerHeight = $api.dom('header').offsetHeight;
    // var num = Number(window.devicePixelRatio);
    // document.getElementById("user-info").style.paddingTop = Math.round(headerHeight / num) + "px";
    document.getElementById("user-info").style.paddingTop = headerHeight +"px";

    //下拉刷新
    apps.pageDataF5(function() {
        vm.init();
    });
    vm.init();
    // console.log("apiready执行了");
    api.addEventListener({
        name: 'loginsucesspst'
    }, function(ret) {
        vm.init();
        // console.log("我的页面数据重新加载");
    });
};
