var vm = new Vue({
  el:'.detailsBox',
  data:{
    masmap:"",
    content:""
  }
})

apiready = function(){
  // console.log(JSON.stringify(api.pageParam));
  // $api.fixStatusBar( $api.dom('header') );
  vm.masmap = api.pageParam.masmap;
  vm.content = api.pageParam.content;
}
