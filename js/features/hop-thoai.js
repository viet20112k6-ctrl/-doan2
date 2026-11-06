(function(){
  "use strict";
  const app=window.MocAnApp;if(!app)return;
  const $=selector=>document.querySelector(selector);
  $("#modalClose").addEventListener("click",app.closeModal);
  $("#modalBackdrop").addEventListener("click",function(event){if(event.target===this)app.closeModal();});
  $("#modalBody").addEventListener("click",function(event){if(event.target.closest("[data-close-modal]")||event.target.closest("[data-close-and-scroll]"))app.closeModal();});
  document.addEventListener("keydown",function(event){if(event.key==="Escape")app.closeModal();});
})();
