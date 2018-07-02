/**
 *  login 注册JS 逻辑功能
 * @authors 郭小北 (kubai666@126.com)
 * @date    2017-03-14 14:50:40
 * @version v0.0.1
 */

// 登录部分、操作
// 查看是否有本地数据（记住用户名）
// (function() {
// 声明vue加载
var vm = new Vue({
    el: '#app-register-form',
    data: {
        mobile: "",
        password: "",
        asspassword: "",
        smsCode: "",
        sendsmobilOK: true, // 手机合格，验证码发送
        sendsbtnst: "点击获取",
        agressredtxt: true,
        referee: "", //推荐人手机号
        birthday:"",
    },
    methods: {
        registerBtn: function() {
            //验证 手机号、短信等
            if (!loginUsermobile()) {
                return false;
            }
            if (vm.smsCode.trim() == '') {

                api.toast({
                    msg: "请输入验证码",
                    location: 'middle'
                });
                return false;
            }

            if (!loginPassword()) {
                return false;
            }
            if (!vm.asspasswordBtn()) {
                return false;
            }
            if ($("#birthday_reg").val().length <= 0) {
                api.toast({
                    msg: "请选择生日",
                    location: 'middle'
                });
                return false;
            }

            apps.axpost(
                "n/customerRegister/registerUser", { //需要提交的参数值
                    mobile: vm.mobile,
                    password: Encrypt(vm.password),
                    smsCode: vm.smsCode,
                    referee: vm.referee,
                    birthday:$("#birthday_reg").val(),
                },
                function(data) {
                    console.log(JSON.stringify(data));
                    if (data) {
                      // 注册成功
                      api.toast({
                          msg: "注册成功",
                          duration: 2000,
                          location: 'middle'
                      });
                      setTimeout(function () {
                        jumpUrl.login();
                      }, 2000);
                    }
                });
        },
        sendsmsBtn: function(event) {
            var mobile = Encrypt('AOinitrp][tel' + vm.mobile); // 加密
            // 短信验证码发送
            apps.axpost(
                "n/sms/sendAppSms", {
                    mobile: mobile,
                },
                function(data) {
                    // 60秒后才能发送效果
                    apps.sendtimeovers('60', '.sendsmsBtn');
                });
        },
        passwordvalBtn: function() {
            // 验证密码
            loginPassword();
        },
        mobileInfo: function() {
            // 验证手机号
            loginUsermobile()
        },
        asspasswordBtn: function() {
            if (vm.password != vm.asspassword) {
                api.toast({
                    msg: "两次密码必须一致",
                    location: 'middle'
                });
                return false;
            }
            return true;
        },
        init: function() {}
    }
});

// 用户名验证
var loginUsermobile = function() {
    var vmobile = vm.mobile;
    var re = /0?(13|14|15|16|17|18|19)[0-9]{9}/;
    if (vmobile.trim()) {
        if (re.test(vmobile)) {
            return true;
        } else {
            api.toast({
                msg: "请输入正确的手机号码",
                location: 'middle'
            });
            return false;
        }
    } else {
        api.toast({
            msg: "手机号不能为空",
            location: 'middle'
        });
        return false;
    }
};

// 验证重复手机号
var validatephone = function() {
    // 验证重复手机号
    apps.axpost(
        "n/register/validateCellphone", { //需要提交的参数值
            mobile: vm.mobile
        },
        //请求成功时处理 code=1
        function(data) {
            //返回提示信息
            var isUse = data.isUse;
            if (isUse == 'no') {
                api.toast({
                    msg: "该手机号已注册",
                    location: 'middle'
                });
                return false;
            } else {
                return true;
            }
        });
};

// 密码验证
var loginPassword = function() {
    if (vm.password) {
        if (vm.password.length < 6) {
            // 密码少于6位数
            api.toast({
                msg: "密码最少为6位",
                location: 'middle'
            });
            return false;
        }
        return true;
    } else {
        api.toast({
            msg: "请输入有效密码",
            location: 'middle'
        });
        return false;
    }
};
// 初始化
vm.init();
//监听同意条款
vm.$watch('agressredtxt', function() {
    if (vm.agressredtxt == false) {
        api.toast({
            msg: '请选择同意微订货服务条款'
        });
        $('.registerBtn').attr('disabled', 'disabled');
        return false;
    } else {
        $('.registerBtn').removeAttr('disabled');
    }
});
//加载日期选择插件Mdate.js
//"dataSelect"为你点击触发Mdate的id，必填项
new Mdate("birthday_reg",{
  //此项为你要显示选择后的日期的input，不填写默认为上一行的"dataSelect"
  acceptId: "birthday_reg",
  //此项为Mdate的初始年份，不填写默认为2000
  beginYear: "1910",
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
// })();