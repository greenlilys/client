// 声明vue加载
var vm = new Vue({
    el: '#editBirthday-frm',
    data: {
        userinfo_data:{}
    },
    methods: {
        //初始化
        init: function() {
            // 获取账号生日信息
            apps.axget(
              "/customer/selectInfo", {},
              function (data) {
                vm.userinfo_data = data;
                if(vm.userinfo_data.birthday == ""){
                  $("#dataSelect").attr("disabled","disabled");
                }else {
                  $("#dataSelect").attr("disabled","");
                }
                //alert("name : " + vm.birthday_data.username + ",birthday: "+vm.birthday_data.birthday);
              });
        },
        editBirthdayInfo:function () {
          api.confirm({
            title: '',
            msg: '生日一旦设置不可更改',
            buttons: ['确定', '取消']
          }, function(ret, err) {
            var index = ret.buttonIndex;
            if(index == 1){
              apps.axpost(
                "customer/updateInfoBirthday", {
                  //需要提交的参数值
                  birthday:"1980-01-01"
                },
                function(data) {
                  api.toast({
                    msg: "修改成功",
                    duration: 2000,
                    location: 'middle'
                  });
                  vm.init();
                  // api.closeWin();
                });
            }
          });
        }
    }
});
apiready = function () {
  vm.init();
  //"dataSelect"为你点击触发Mdate的id，必填项
  new Mdate("dataSelect",{
    //此项为你要显示选择后的日期的input，不填写默认为上一行的"dataSelect"
    acceptId: "dataSelect",
    //此项为Mdate的初始年份，不填写默认为2000
    beginYear: "1901",
    //此项为Mdate的初始月份，不填写默认为1
    beginMonth: "1",
    //此项为Mdate的初始日期，不填写默认为1
    beginDay: "1",
    //此项为Mdate的结束年份，不填写默认为当年
    endYear: "",
    //此项为Mdate的结束月份，不填写默认为当月
    endMonth: "",
    //此项为Mdate的结束日期，不填写默认为当天
    endDay: "",
    //此项为Mdate需要显示的格式，可填写"/"或"-"或".",不填写默认为年月日
    format: "-"
  });
}
