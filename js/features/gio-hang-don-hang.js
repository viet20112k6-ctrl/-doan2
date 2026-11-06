(function(){
  "use strict";
  const app=window.MocAnApp;if(!app)return;
  const $=selector=>document.querySelector(selector);
  $("#cartButton").addEventListener("click",app.showCart);
  $("#ordersButton").addEventListener("click",app.showOrders);
  $("#ordersButtonFooter").addEventListener("click",app.showOrders);
  $("#modalBody").addEventListener("click",function(event){
    if(event.target.closest("[data-checkout]")){app.openCheckout();return;}
    const qty=event.target.closest("[data-cart-qty]");if(qty){app.changeCartQty(qty.dataset.cartQty,Number(qty.dataset.delta));return;}
    const remove=event.target.closest("[data-cart-remove]");if(remove){app.removeCartItem(remove.dataset.cartRemove);return;}
    const cancel=event.target.closest("[data-cancel-order]");if(cancel){app.cancelOrder(cancel.dataset.cancelOrder);return;}
    const edit=event.target.closest("[data-edit-order]");if(edit)app.showOrderEdit(edit.dataset.editOrder);
  });
  $("#modalBody").addEventListener("submit",function(event){event.preventDefault();app.submitModalForm(event.target);});
  $("#modalBody").addEventListener("click",function(event){if(event.target.closest("[data-open-orders]"))app.showOrders();});
})();
