// 声明vue加载
var vm = new Vue({
    el:'#birthGift_frm',
    data:{
      nickname:'骑手',
      birthdayGift:0,//礼物数量
      birthdayGiftState:0,//礼物领取状态
    },
    methods:{
      init:function () {
        apps.axget(
          "sysSet/select", {},
          function(data) {
            if(data){
              vm.birthdayGift = data.birthdaygift;
            }
        });
      },
      //获取用户昵称
      getnickname: function () {
        apps.axget(
          "customer/selectInfo", {},
          function(data) {
            if(data){
              vm.nickname = data.nickname;
            }
        });
      },
      //获取生日礼物领取状态
      getbirthdayGiftState: function () {
        apps.axget(
          "customer/selectisBirthday", {},
          function(data) {
            if(data){
              vm.birthdayGiftState = data.receive;
            }
        });
      },
      //领取生日礼物提交按钮
      receiveBtn: function () {
        if(vm.birthdayGiftState == 0){
          apps.axpost(
            "customer/receiveBirthdayGift", {},
            function(data) {
              if(data){
                if(data.msg == 1){
                  api.toast({
                    msg: "领取成功",
                    duration: 2000,
                    location: 'middle'
                  });
                  setTimeout(function () {
                    api.closeWin();
                  }, 2000);
                }
              }
            });
        }else {
          api.toast({
            msg: "已领取",
            duration: 2000,
            location: 'middle'
          });
          setTimeout(function () {
            api.closeWin();
          }, 2000);
        }
      },

    },
});
apiready = function () {
  //下拉刷新
  apps.pageDataF5(function() {
      vm.getbirthdayGiftState();
  });
  vm.init();
  vm.getbirthdayGiftState();
  vm.getnickname();
};
