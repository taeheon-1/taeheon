  $(document).ready(function(){
      $(".brandstate>button").click(function(){
          var brandlist = $(this).next("brandSel");
          if( brandlist.is(":visible") ){
              brandlist.slideUp();
          }else{
              brandlist.slideDown();
          }
      });
  });
