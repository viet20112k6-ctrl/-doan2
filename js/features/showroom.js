(function(){
  "use strict";
  const app=window.MocAnApp;if(!app)return;
  const $=selector=>document.querySelector(selector);
  $("#cityFilter").addEventListener("change",function(){app.updateStoreSelect();app.renderStores();});
  $("#storeFilter").addEventListener("change",app.renderStores);
  function selectStore(event){const button=event.target.closest("[data-select-store]");if(!button)return;app.pickStore(button.dataset.selectStore);}
  $("#storeList").addEventListener("click",selectStore);
  $("#mapPins").addEventListener("click",selectStore);
  $("#modalBody").addEventListener("click",function(event){const button=event.target.closest("[data-select-store]");if(button){app.pickStore(button.dataset.selectStore);$("#storeList").scrollIntoView({behavior:"smooth",block:"nearest"});}});
})();
