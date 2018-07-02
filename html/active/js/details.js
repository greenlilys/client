var vm = new Vue({
  el:'#content',
  data:{
    masmap:"",
    content:""
  },
mounted:function(){

},
  methods: {
  }

})

apiready = function() {
    $api.fixStatusBar($api.dom('header'));
    // var headerHeight = $api.dom('header').offsetHeight;
    // var num = Number(window.devicePixelRatio);
    // document.getElementsByClassName("detailsBox")[0].style.paddingTop = Math.round(headerHeight / num) + "px";
    api.addEventListener({　　　　
        name: 'keyback'　　
    }, function(ret, err) {　
        closeWin();
    });
    // console.log(JSON.stringify(api.pageParam));
    vm.masmap = api.pageParam.masmap;
    vm.content = api.pageParam.content;

    apps.loadWinUrl("details_fra","active/details_fra.html",{
      masmap:vm.masmap,
      content:vm.content
    })


};
