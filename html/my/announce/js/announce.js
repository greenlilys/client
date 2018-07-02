/**
 * 我的钱包记录
 * @authors 郭小北 (kubai666@126.com)
 * @date    2016-05-31 17:27:39
 * @version 0.0.1
 */

// 声明vue加载
var vm = new Vue({
    el: '#announce-frm',
    data: {
        announce_data: {
            announceList: [], //商品列表
        },
        balancewallet: {},
        moredatatxt: '',
        pageSize: 5,
        pageNo: 1,
        totalPage: 0, //总页数
    },
    methods: {
        //初始化
        init: function() {
            // 增配訂單
            vm.userAnnounce();
            vm.pageNo = 1;
        },
        // 获取店铺信息详情
        userAnnounce: function(type) {
            apps.axget(
                "userPlatformNoticeController/selectUserNoticeList", {},
                function(data) {
                    if (data.totalPage <= 1 || vm.pageNo == data.totalPage) {
                        vm.moredatatxt = "暂无更多记录";
                    } else {
                        vm.moredatatxt = "上滑获取更多记录";
                    }
                    if (vm.pageNo == 1) {
                        vm.announce_data.announceList = [];
                        data.datas.forEach(function(item) {
                            if (item) {
                                vm.announce_data.announceList.push(item);
                            }
                        });
                        vm.totalPage = data.totalPage; //总页数
                    } else {
                        //如果存在数据并且当前的页面小于等于总页码时push
                        if (data.datas.length && vm.pageNo <= data.totalPage) {
                            data.datas.forEach(function(item) {
                                vm.announce_data.announceList.push(item);
                            });
                        }
                    }
                    vm.pageNo++;
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
    //上拉加载
    api.addEventListener({
        name: 'scrolltobottom',
        extra: {
            threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
        }
    }, function(ret, err) {
        if (vm.pageNo <= vm.totalPage) {
            vm.userAnnounce();
        }
    });

}
