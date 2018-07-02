/**
 * 线上签约店铺管理
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#affiche-frm',
    data: {
        userNotice: {},
        tianniu_userSetdata: {},
        map_txtinfo: '正在努力获取数据 请稍后...',
        ShopAndServicedata: {}
    },
    methods: {
          //初始化
          init: function() {
            //获取用户公告
            apps.axget(
                "userPlatformNoticeController/selectOneUserNotice", {},
                function(data) {
                  if (data) {
                    vm.userNotice = data;
                  }
              });
            // var tianniu_userSetdata = vm.tianniu_userSetdata = $api.getStorage("tianniu_userSetdata");
            // 获取预约信息
            // vm.ShopAndServicedata = $api.getStorage("ShopAndServicedata");
            vm.ShopAndServicedata = api.pageParam.ShopAndServicedata;
            vm.displayBar();
        },
        displayBar: function(){
          // alert(JSON.stringify(vm.userNotice));
        },
        jumpaffiche: function(){
          jumpUrl.announce()
        }
    },
});

apiready = function() {
    api.parseTapmode();
    vm.init();
    // 接受重新加载监听
    api.addEventListener({
        name: 'setf5loadEvent'
    }, function(ret, err) {
        vm.init();
    });
}
