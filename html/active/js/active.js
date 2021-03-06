var vm = new Vue({
    el: "#content",
    data: {
        activeInfoList: [],
        dafault: '../../image/active/defautImg.jpg'
    },
    methods: {
      init:function(){
        apps.axget("userPlatformNoticeController/selectUserNoticeList", "", function(data) {
            vm.activeInfoList = data;
            // console.log(JSON.stringify(vm.activeInfoList));

        });

      },
        navToDetails: function(id) {
            var activeInfoList = this.activeInfoList;
            var masmap = "";
            var content = "";
            for (var i = 0; i < activeInfoList.length; i++) {
                if (activeInfoList[i].id == id) {
                    masmap = activeInfoList[i].masmap;
                    content = activeInfoList[i].content;
                }
            }
            apps.openWin("details_win", "active/details_win.html", {
                masmap: masmap,
                content: content
            }, false);

        },
        getFormatDate: function(date) {
            var date = new Date(date);
            var seperator1 = "-";
            var seperator2 = ":";
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            month = month <= 9 ? '0' + month : month;
            strDate = strDate <= 9 ? '0' + strDate : strDate;
            var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
            return currentdate;
        }
    },
    watch: {
        activeInfoList: function() {
            var list = this.activeInfoList;
            for (var i = 0; i < list.length; i++) {
                list[i].addtime = this.getFormatDate(Number(list[i].addtime));
                var imgMain = list[i].masmap;
                var urlList = list[i].url.split(',');
                for (var j = 0; j < urlList.length; j++) {
                    if (urlList[j] == imgMain) {
                        urlList.splice(j, 1);
                    }
                }
                list[i].url = urlList;
            }
        }
    }
})

apiready = function() {
    // console.log(vm.activeInfoList);
    $api.fixStatusBar($api.dom('header'));
    vm.init();
    //下拉刷新
    apps.pageDataF5(function() {
        vm.init();
    });
};
