(function(){
  "use strict";
  const app=window.MocAnApp;if(!app)return;
  const $=selector=>document.querySelector(selector);
  const $$=selector=>Array.from(document.querySelectorAll(selector));
  $("#searchForm").addEventListener("submit",function(event){event.preventDefault();app.searchProducts($("#searchInput").value,true);});
  $("#searchForm button").addEventListener("click",function(event){if(window.matchMedia("(max-width: 760px)").matches&&!$("#searchForm").classList.contains("is-open")){event.preventDefault();$("#searchForm").classList.add("is-open");$("#searchInput").focus();}});
  $("#searchInput").addEventListener("input",function(){app.searchProducts(this.value,false);});
  $("#categoryFilter").addEventListener("change",function(){app.setCategory(this.value);});
  $$(".filter-tab").forEach(button=>button.addEventListener("click",function(){app.setFilter(this.dataset.filter);}));
  $$('[data-filter-link]').forEach(link=>link.addEventListener("click",function(){app.setFilter(this.dataset.filterLink);}));
  $("#productGrid").addEventListener("click",function(event){
    const add=event.target.closest("[data-add]");if(add){event.stopPropagation();app.addToCart(add.dataset.add,1);return;}
    const like=event.target.closest("[data-like]");if(like){event.stopPropagation();like.classList.toggle("is-liked");like.textContent=like.classList.contains("is-liked")?"♥":"♡";app.toast(like.classList.contains("is-liked")?"Đã lưu vào danh sách yêu thích.":"Đã bỏ khỏi danh sách yêu thích.");return;}
    const open=event.target.closest("[data-open-product]");if(open)app.showProduct(open.dataset.openProduct);
  });
  $("#productGrid").addEventListener("keydown",function(event){if((event.key==="Enter"||event.key===" ")&&event.target.matches("[data-open-product]")){event.preventDefault();app.showProduct(event.target.dataset.openProduct);}});
  $("#modalBody").addEventListener("click",function(event){
    const image=event.target.closest("[data-gallery-image]");if(image){$("#productDetailMainImage").src=image.dataset.galleryImage;return;}
    const add=event.target.closest("[data-add]");if(add)app.addToCart(add.dataset.add,1);
  });
})();
