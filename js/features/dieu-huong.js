(function(){
  "use strict";
  const $=selector=>document.querySelector(selector);
  $("#adminButton").addEventListener("click",function(){if(window.MocAnAdmin)window.MocAnAdmin.open("overview");});
  $("#menuToggle").addEventListener("click",function(){const nav=$("#mainNav");const open=nav.classList.toggle("is-open");this.setAttribute("aria-expanded",String(open));this.setAttribute("aria-label",open?"Đóng menu":"Mở menu");});
  Array.from(document.querySelectorAll("#mainNav a")).forEach(link=>link.addEventListener("click",function(){$("#mainNav").classList.remove("is-open");$("#menuToggle").setAttribute("aria-expanded","false");}));
})();
