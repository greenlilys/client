// 声明vue加载
var vm = new Vue({
    el: '#modifyBattery-form',
    data: {
        shopName:'',
        shopNo:0,
        shopid:0,
        shopAddress:'',
        batteryName:'',
        groupNum:1,
        fee:0,//手续费
        overdeposit:0,//退还or补缴押金
        overrent:0,//退还or补缴租金
        overdeposit_abs:0,//绝对值转换
        overrent_abs:0,
    },
    methods: {
        //初始化
        init: function() {
          if(vm.shopName == ""){
            vm.shopName = api.pageParam.shopName;
            vm.shopAddress = api.pageParam.shopAddress;
            vm.shopNo = api.pageParam.no;
            vm.shopid = api.pageParam.shopid;
          }
          //获取切换电池型号需要的信息
          apps.axget("switchOver/selectNeedInfo",{},function (data) {
            if(data){
              vm.batteryName = data.name;
              vm.fee = data.fee;
              vm.overdeposit = data.overdeposit;
              vm.overrent = data.overrent;
              vm.overdeposit_abs = Math.abs(vm.overdeposit);
              vm.overrent_abs = Math.abs(vm.overrent);
            }
          });
        },
    },
});
function saveBtn() {

  apps.axpost(
    "switchOver/save",{
      shopid:vm.shopid,
      overdeposit:vm.overdeposit,
      overrent:vm.overrent,
      fee:vm.fee
    },function (data) {
      api.toast({
          msg: '提交成功',
          duration: 2000,
          location: 'middle'
      });
      setTimeout(function () {
        jumpUrl.modifyBatteryList();
      }, 1000);
    });
}
function closeToRoot(){
  api.closeToWin({
    name: 'root'
  });
}
apiready = function() {
    // 实现沉浸式效果
    $api.fixStatusBar($api.dom("header"));
    api.parseTapmode();
    api.addEventListener({
        name: 'modifyBatteryEvent'
    }, function(ret, err) {
        vm.shopName = ret.value.shopName;
        vm.shopAddress = ret.value.shopAddress;
        vm.shopNo = ret.value.shopNo;
        vm.shopid = ret.value.shopid;
        vm.init();
    });
    vm.init();
}
