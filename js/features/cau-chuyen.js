(function(){
  "use strict";
  const app=window.MocAnApp;if(!app)return;
  const $=selector=>document.querySelector(selector);
  $("#storyGrid").addEventListener("click",function(event){const article=event.target.closest("[data-open-article]");if(article)app.showArticle(article.dataset.openArticle);});
  $("#storyGrid").addEventListener("keydown",function(event){if((event.key==="Enter"||event.key===" ")&&event.target.matches("[data-open-article]")){event.preventDefault();app.showArticle(event.target.dataset.openArticle);}});
  $("#modalBody").addEventListener("click",function(event){const article=event.target.closest("[data-open-article]");if(article)app.showArticle(article.dataset.openArticle);});
  $("#modalBody").addEventListener("keydown",function(event){if((event.key==="Enter"||event.key===" ")&&event.target.matches("[data-open-article]")){event.preventDefault();app.showArticle(event.target.dataset.openArticle);}});
  $("#newsletterForm").addEventListener("submit",function(event){event.preventDefault();const email=$("#newsletterEmail").value.trim();if(email){app.toast("Cảm ơn bạn! "+email+" đã đăng ký nhận tin.");this.reset();}});
})();
