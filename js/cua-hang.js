(function(){
  "use strict";

  const {seedProducts,stores,articles:seedArticles}=window.MocAnData;
  let articles=seedArticles;
  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));
  const safeRead = (key, fallback) => { try { const value=JSON.parse(localStorage.getItem(key)); return value===null?fallback:value; } catch (_) { return fallback; } };
  const savedSiteNews=safeRead("mocan_site_news",null);
  if(Array.isArray(savedSiteNews))articles=savedSiteNews;
  let catalog = safeRead("mocan_catalog", seedProducts.slice());
  if (!Array.isArray(catalog) || !catalog.length) catalog = seedProducts.slice();
  let cart = safeRead("mocan_cart", []);
  let activeFilter = "all";
  let activeCategory = "";
  let searchTerm = "";
  let toastTimer;
  let previousFocus = null;

  function saveCatalog(){localStorage.setItem("mocan_catalog",JSON.stringify(catalog));}
  function saveCart(){localStorage.setItem("mocan_cart",JSON.stringify(cart));}
  function money(value){return new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND",maximumFractionDigits:0}).format(Number(value)||0);}
  function esc(value){return String(value==null?"":value).replace(/[&<>"']/g,function(char){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];});}
  function safeImage(value){const source=String(value||"");if(/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,/i.test(source))return source;try{const url=new URL(source);return url.protocol==="https:"?url.href:seedProducts[0].image;}catch(_){return seedProducts[0].image;}}
  function stars(value){const n=Math.max(0,Math.min(5,Math.round(Number(value)||0)));return "★".repeat(n)+"☆".repeat(5-n);}
  function reviews(){return safeRead("mocan_reviews",{});}
  function reviewRows(productId){const all=reviews();return Array.isArray(all[productId])?all[productId]:[];}
  function productRating(product){const rows=reviewRows(product.id);if(!rows.length)return Number(product.rating)||0;const total=rows.reduce((sum,item)=>sum+(Number(item.rating)||0),Number(product.rating)||0);return total/(rows.length+1);}
  function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("is-visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("is-visible"),2600);}
  function openModal(title,content){previousFocus=document.activeElement;$("#modalTitle").textContent=title;$("#modalBody").innerHTML=content;$("#modalBackdrop").classList.toggle("is-admin",String(title).startsWith("Quản trị"));$("#modalBackdrop").hidden=false;document.body.classList.add("modal-open");$("#modalClose").focus();}
  function closeModal(){if($("#modalBackdrop").hidden)return;$("#modalBackdrop").hidden=true;$("#modalBackdrop").classList.remove("is-admin");document.body.classList.remove("modal-open");if(previousFocus&&typeof previousFocus.focus==="function")previousFocus.focus();}
  function findProduct(id){return catalog.find(item=>item.id===id);}
  function setFilter(filter){activeFilter=filter||"all";$$(".filter-tab").forEach(button=>button.classList.toggle("is-active",button.dataset.filter===activeFilter));renderProducts();if(location.hash!=="#san-pham")history.replaceState(null,"","#san-pham");}

  function renderProducts(){
    const list=catalog.filter(function(product){
      const matchFilter=activeFilter==="all"||product.flag===activeFilter;
      const matchCategory=!activeCategory||product.category===activeCategory;
      const text=(product.name+" "+product.category+" "+product.description).toLocaleLowerCase("vi");
      return matchFilter&&matchCategory&&(!searchTerm||text.includes(searchTerm));
    });
    $("#productGrid").innerHTML=list.map(function(product){
      const discount=product.oldPrice?Math.round((1-product.price/product.oldPrice)*100):0;
      const badge=product.badge||({new:"Mới về",best:"Bán chạy",sale:"Ưu đãi"}[product.flag]||"Mộc An");
      return '<article class="product-card"><div class="product-media" data-open-product="'+esc(product.id)+'"><img src="'+esc(safeImage(product.image))+'" alt="'+esc(product.name)+'" loading="lazy"><span class="product-badge">'+esc(badge)+'</span><button class="product-heart" type="button" data-like="'+esc(product.id)+'" aria-label="Thêm '+esc(product.name)+' vào yêu thích">♡</button><button class="product-quick-add" type="button" data-add="'+esc(product.id)+'">Thêm vào giỏ hàng ＋</button></div><div class="product-info"><div class="product-overline"><span>'+esc(product.category)+'</span><span class="rating" aria-label="'+productRating(product).toFixed(1)+' trên 5 sao">'+stars(productRating(product))+' '+productRating(product).toFixed(1)+'</span></div><h3 data-open-product="'+esc(product.id)+'" tabindex="0">'+esc(product.name)+'</h3><div class="product-pricing"><span>'+money(product.price)+'</span>'+(product.oldPrice?'<del>'+money(product.oldPrice)+'</del><span class="discount">-'+discount+'%</span>':'')+'</div></div></article>';
    }).join("");
    $("#productEmpty").hidden=list.length>0;
    $("#productTotal").textContent=list.length+" sản phẩm";
  }

  function renderCartCount(){const count=cart.reduce((sum,item)=>sum+(Number(item.qty)||0),0);$("#cartCount").textContent=count;$("#announce").textContent=count?"Giỏ hàng có "+count+" sản phẩm":"Giỏ hàng trống";}
  function addToCart(id,qty){const product=findProduct(id);if(!product)return;const row=cart.find(item=>item.id===id);if(row)row.qty+=qty||1;else cart.push({id:id,qty:qty||1});saveCart();renderCartCount();toast("Đã thêm "+product.name+" vào giỏ hàng.");}
  function changeCartQty(id,delta){const row=cart.find(item=>item.id===id);if(!row)return;row.qty+=delta;if(row.qty<=0)cart=cart.filter(item=>item.id!==id);saveCart();renderCartCount();showCart();}
  function cartTotal(){return cart.reduce((sum,item)=>{const product=findProduct(item.id);return sum+(product?product.price*item.qty:0);},0);}
  function showCart(){
    if(!cart.length){openModal("Giỏ hàng của bạn",'<div class="cart-empty"><p>Giỏ hàng đang còn trống.</p><a class="button button-dark" href="#san-pham" data-close-and-scroll>Khám phá sản phẩm <span>→</span></a></div>');return;}
    const rows=cart.map(function(item){const p=findProduct(item.id);if(!p)return "";return '<div class="cart-row"><img src="'+esc(safeImage(p.image))+'" alt=""><div><h3>'+esc(p.name)+'</h3><p>'+money(p.price)+'</p><div class="qty-control"><button type="button" data-cart-qty="'+esc(p.id)+'" data-delta="-1" aria-label="Giảm số lượng">−</button><span>'+item.qty+'</span><button type="button" data-cart-qty="'+esc(p.id)+'" data-delta="1" aria-label="Tăng số lượng">+</button></div></div><div class="cart-row-total">'+money(p.price*item.qty)+'<button type="button" data-cart-remove="'+esc(p.id)+'">Xóa</button></div></div>';}).join("");
    openModal("Giỏ hàng của bạn",'<div class="cart-lines">'+rows+'</div><div class="cart-summary"><span>Tạm tính</span><strong>'+money(cartTotal())+'</strong></div><p class="cart-note">Phí giao hàng sẽ được xác nhận khi hoàn tất đơn.</p><button class="modal-button full-button" type="button" data-checkout>Mua hàng <span aria-hidden="true">→</span></button>');
  }
  function openCheckout(){
    if(!cart.length){toast("Bạn chưa có sản phẩm trong giỏ.");return;}
    const lines=cart.map(function(item){const p=findProduct(item.id);return p?'<li>'+esc(p.name)+' × '+item.qty+'</li>':"";}).join("");
    openModal("Thông tin nhận hàng",'<form class="checkout-form" id="checkoutForm"><div class="form-row"><label>Họ và tên<input name="name" autocomplete="name" required placeholder="Nguyễn An"></label><label>Số điện thoại<input name="phone" inputmode="tel" autocomplete="tel" required placeholder="09xx xxx xxx"></label></div><label>Địa chỉ giao hàng<input name="address" autocomplete="street-address" required placeholder="Số nhà, đường, phường/xã, tỉnh/thành"></label><label>Ghi chú<textarea name="note" placeholder="Thời gian giao hàng mong muốn..."></textarea></label><div class="order-card"><div class="order-head"><h3>Đơn hàng</h3><strong>'+money(cartTotal())+'</strong></div><ul class="order-items">'+lines+'</ul></div><button class="modal-button full-button" type="submit">Xác nhận đặt hàng <span aria-hidden="true">→</span></button><p class="cart-note">Đây là bản demo tĩnh. Đơn hàng được lưu trên trình duyệt này.</p></form>');
  }
  function showOrders(){
    const orders=safeRead("mocan_orders",[]);
    if(!orders.length){openModal("Đơn hàng của bạn",'<div class="orders-empty">Bạn chưa có đơn hàng nào. Các đơn đặt thử trên trang này sẽ hiển thị tại đây.</div>');return;}
    const html=orders.slice().reverse().map(function(order){
      const items=(order.items||[]).map(function(item){return '<div>'+esc(item.name)+' × '+item.qty+' <span>· '+money(item.price*item.qty)+'</span></div>';}).join("");
      const canEdit=order.status==="Chờ xác nhận";
      return '<article class="order-card"><div class="order-head"><div><h3>'+esc(order.code)+'</h3><p>'+esc(order.date)+' · '+esc(order.name)+'</p></div><span class="order-status">'+esc(order.status)+'</span></div><p>'+esc(order.address||"")+' · '+esc(order.phone||"")+'</p><div class="order-items">'+items+'</div><div class="order-head"><strong>Tổng cộng</strong><strong>'+money(order.total)+'</strong></div>'+(canEdit?'<div class="order-actions"><button class="modal-button secondary" type="button" data-edit-order="'+esc(order.id)+'">Sửa thông tin</button><button class="modal-button danger" type="button" data-cancel-order="'+esc(order.id)+'">Hủy đơn</button></div>':'')+'</article>';
    }).join("");
    openModal("Lịch sử đơn hàng",'<p class="cart-note">Đơn hàng chỉ hiển thị trên trình duyệt đã tạo đơn.</p>'+html);
  }
  function showOrderEdit(id){
    const orders=safeRead("mocan_orders",[]);const order=orders.find(item=>item.id===id);if(!order)return;
    openModal("Sửa thông tin đơn hàng",'<form class="checkout-form" id="editOrderForm" data-order-id="'+esc(id)+'"><label>Họ và tên<input name="name" required value="'+esc(order.name)+'"></label><label>Số điện thoại<input name="phone" required value="'+esc(order.phone)+'"></label><label>Địa chỉ giao hàng<input name="address" required value="'+esc(order.address)+'"></label><label>Ghi chú<textarea name="note">'+esc(order.note||"")+'</textarea></label><button class="modal-button full-button" type="submit">Lưu thay đổi</button></form>');
  }
  function cancelOrder(id){
    let orders=safeRead("mocan_orders",[]);orders=orders.map(item=>item.id===id&&item.status==="Chờ xác nhận"?Object.assign({},item,{status:"Đã hủy"}):item);localStorage.setItem("mocan_orders",JSON.stringify(orders));showOrders();toast("Đơn hàng đã được hủy.");
  }
  function showProduct(id){
    const p=findProduct(id);if(!p)return;const rows=reviewRows(id);
    const reviewsHtml=rows.length?rows.slice().reverse().map(function(row){return '<div class="review-item"><strong>'+esc(row.name)+' <span aria-label="'+row.rating+' sao">'+stars(row.rating)+'</span></strong><p>'+esc(row.comment)+'</p></div>';}).join(""):'<p class="cart-note">Chưa có nhận xét mới. Hãy là người đầu tiên chia sẻ cảm nhận.</p>';
    const gallery=Array.isArray(p.gallery)?p.gallery.filter(Boolean):[];
    const galleryHtml=gallery.length?'<div class="detail-gallery">'+gallery.map(function(image){return '<button type="button" data-gallery-image="'+esc(safeImage(image))+'" aria-label="Xem ảnh chi tiết"><img src="'+esc(safeImage(image))+'" alt=""></button>';}).join("")+'</div>':"";
    openModal("Chi tiết sản phẩm",'<div class="product-detail"><div><img class="product-detail-image" id="productDetailMainImage" src="'+esc(safeImage(p.image))+'" alt="'+esc(p.name)+'">'+galleryHtml+'</div><div class="product-detail-copy"><div class="product-overline"><span>'+esc(p.category)+'</span><span class="rating">'+stars(productRating(p))+' '+productRating(p).toFixed(1)+'</span></div><h3>'+esc(p.name)+'</h3><div class="product-pricing detail-price"><span>'+money(p.price)+'</span>'+(p.oldPrice?'<del>'+money(p.oldPrice)+'</del>':'')+'</div><p>'+esc(p.description)+'</p><p class="detail-stock">Còn '+Number(p.stock||0)+' sản phẩm trong kho mẫu</p><div class="detail-actions"><button class="modal-button" type="button" data-add="'+esc(p.id)+'">Thêm vào giỏ</button><button class="modal-button secondary" type="button" data-close-modal>Đóng</button></div></div></div><div class="detail-reviews"><h4>Khách hàng nói gì <span class="rating">'+stars(productRating(p))+'</span></h4><div class="review-list">'+reviewsHtml+'</div><form class="review-form" id="reviewForm" data-product-id="'+esc(p.id)+'"><strong class="modal-section-title">Viết đánh giá</strong><div class="form-row"><label>Tên hiển thị<input name="name" required maxlength="40" placeholder="Tên của bạn"></label><label>Đánh giá<select name="rating"><option value="5">★★★★★ · Rất hài lòng</option><option value="4">★★★★☆ · Hài lòng</option><option value="3">★★★☆☆ · Bình thường</option><option value="2">★★☆☆☆ · Chưa tốt</option><option value="1">★☆☆☆☆ · Không hài lòng</option></select></label></div><label>Nhận xét<textarea name="comment" required maxlength="280" placeholder="Chia sẻ trải nghiệm của bạn..."></textarea></label><button class="modal-button" type="submit">Gửi đánh giá</button></form></div>');
  }
  function renderStores(){
    const city=$("#cityFilter").value;const selected=$("#storeFilter").value;
    const visible=stores.filter(item=>(!city||item.city===city)&&(!selected||item.id===selected));
    $("#storeCount").textContent=visible.length+" showroom";
    $("#mapCity").textContent=city?city.toLocaleUpperCase("vi"):"TOÀN QUỐC";
    if(!visible.length){$("#storeList").innerHTML='<div class="store-empty">Chưa có cửa hàng trong khu vực này.</div>';$("#mapPins").innerHTML="";return;}
    $("#storeList").innerHTML=visible.map(function(store){const mapUrl="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(store.address);return '<article class="store-card"><div><h3>'+esc(store.name)+'</h3><p>'+esc(store.address)+'</p><small>'+esc(store.hours)+' · '+esc(store.phone)+'</small></div><div class="store-card-actions"><a target="_blank" rel="noopener noreferrer" href="'+mapUrl+'">Chỉ đường ↗</a><button type="button" data-select-store="'+esc(store.id)+'">Chọn showroom</button></div></article>';}).join("");
    $("#mapPins").innerHTML=visible.map(function(store){return '<button type="button" class="map-pin '+(selected===store.id?"is-selected":"")+'" data-select-store="'+esc(store.id)+'" style="left:'+store.x+'%;top:'+store.y+'%" aria-label="'+esc(store.name)+'"><span><b>m</b></span></button>';}).join("");
  }
  function initStores(){
    const cities=Array.from(new Set(stores.map(store=>store.city)));
    $("#cityFilter").innerHTML='<option value="">Tất cả tỉnh thành</option>'+cities.map(city=>'<option value="'+esc(city)+'">'+esc(city)+'</option>').join("");
    updateStoreSelect();
    renderStores();
  }
  function updateStoreSelect(){
    const city=$("#cityFilter").value;const select=$("#storeFilter");const previous=select.value;
    const options=stores.filter(item=>!city||item.city===city);
    select.innerHTML='<option value="">Tất cả cửa hàng</option>'+options.map(item=>'<option value="'+esc(item.id)+'">'+esc(item.name)+'</option>').join("");
    if(options.some(item=>item.id===previous))select.value=previous;
  }
  function pickStore(id){
    const store=stores.find(item=>item.id===id);
    if(!store)return;
    $("#cityFilter").value=store.city;
    updateStoreSelect();
    $("#storeFilter").value=store.id;
    renderStores();
  }
  function renderArticles(){
    $("#storyGrid").innerHTML=articles.map(function(article){return '<article class="story-card"><div class="story-image" data-open-article="'+esc(article.id)+'" tabindex="0" role="button" aria-label="Đọc bài '+esc(article.title)+'"><img src="'+esc(safeImage(article.image))+'" alt="'+esc(article.title)+'" loading="lazy"></div><div class="story-content"><span class="story-meta">'+esc(article.category)+' · '+esc(article.date)+'</span><h3>'+esc(article.title)+'</h3><p>'+esc(article.summary)+'</p><button type="button" data-open-article="'+esc(article.id)+'">Đọc câu chuyện →</button></div></article>';}).join("");
  }
  function setArticles(rows){
    articles=(rows||[]).map(function(row,index){
      const rawDate=String(row.date||"");
      const shownDate=/^\d{4}-\d{2}-\d{2}$/.test(rawDate)?rawDate.slice(8,10)+"."+rawDate.slice(5,7)+"."+rawDate.slice(0,4):rawDate;
      return {id:row.id||"news-"+index,date:shownDate,category:row.category||"TIN TỨC",title:row.title||"Tin Mộc An",summary:row.summary||"",image:row.image||"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",body:row.content||row.body||row.summary||""};
    });
    localStorage.setItem("mocan_site_news",JSON.stringify(articles));
    renderArticles();
  }
  function setCategories(categories){
    const select=$("#categoryFilter");
    const values=Array.isArray(categories)&&categories.length?categories:["Phòng khách","Phòng ngủ","Phòng ăn","Phòng làm việc"];
    if(!values.includes(activeCategory))activeCategory="";
    select.innerHTML='<option value="">Tất cả không gian</option>'+values.map(function(category){return '<option value="'+esc(category)+'" '+(category===activeCategory?"selected":"")+'>'+esc(category)+'</option>';}).join("");
  }
  function showArticle(id){const a=articles.find(item=>item.id===id);if(!a)return;openModal("Góc nhà Mộc An",'<article class="article-detail"><img src="'+esc(safeImage(a.image))+'" alt=""><p class="eyebrow"><span></span> '+esc(a.category)+' · '+esc(a.date)+'</p><h3>'+esc(a.title)+'</h3><p>'+esc(a.body)+'</p></article>');}
  function refreshAfterReview(productId){showProduct(productId);renderProducts();}

  function searchProducts(term,submitted){
    searchTerm=String(term||"").trim().toLocaleLowerCase("vi");
    activeFilter="all";
    $$(".filter-tab").forEach(button=>button.classList.toggle("is-active",button.dataset.filter==="all"));
    renderProducts();
    if(submitted){
      $("#searchForm").classList.remove("is-open");
      $("#san-pham").scrollIntoView({behavior:"smooth"});
      if(!searchTerm)toast("Hiển thị tất cả sản phẩm.");
    }
  }
  function setCategory(category){activeCategory=category||"";renderProducts();}
  function removeCartItem(id){cart=cart.filter(item=>item.id!==id);saveCart();renderCartCount();showCart();}
  function submitModalForm(form){
    if(form.id==="checkoutForm"){
      const data=new FormData(form);const items=cart.map(function(item){const p=findProduct(item.id);return p?{id:p.id,name:p.name,price:p.price,qty:item.qty}:null;}).filter(Boolean);
      const orders=safeRead("mocan_orders",[]);const order={id:"ord-"+Date.now(),code:"MA-"+String(Date.now()).slice(-6),date:new Date().toLocaleDateString("vi-VN"),createdAt:new Date().toISOString(),name:String(data.get("name")).trim(),phone:String(data.get("phone")).trim(),address:String(data.get("address")).trim(),note:String(data.get("note")||"").trim(),items:items,total:items.reduce((sum,item)=>sum+item.price*item.qty,0),status:"Chờ xác nhận"};
      orders.push(order);localStorage.setItem("mocan_orders",JSON.stringify(orders));cart=[];saveCart();renderCartCount();openModal("Đặt hàng thành công",'<div class="orders-empty"><strong>Cảm ơn '+esc(order.name)+' đã chọn Mộc An.</strong><p>Mã đơn hàng của bạn là <b>'+esc(order.code)+'</b>.</p><p>Đơn hàng đã được lưu trên trình duyệt để bạn có thể tra cứu trong mục Đơn hàng.</p><button class="modal-button" type="button" data-open-orders>Tra cứu đơn hàng</button></div>');return;
    }
    if(form.id==="reviewForm"){
      const data=new FormData(form);const id=form.dataset.productId;const all=reviews();if(!Array.isArray(all[id]))all[id]=[];all[id].push({name:String(data.get("name")).trim(),rating:Number(data.get("rating")),comment:String(data.get("comment")).trim(),date:new Date().toLocaleDateString("vi-VN")});localStorage.setItem("mocan_reviews",JSON.stringify(all));refreshAfterReview(id);toast("Cảm ơn bạn đã gửi đánh giá.");return;
    }
    if(form.id==="editOrderForm"){
      const data=new FormData(form);const id=form.dataset.orderId;const orders=safeRead("mocan_orders",[]).map(item=>item.id===id&&item.status==="Chờ xác nhận"?Object.assign({},item,{name:String(data.get("name")).trim(),phone:String(data.get("phone")).trim(),address:String(data.get("address")).trim(),note:String(data.get("note")||"").trim()}):item);localStorage.setItem("mocan_orders",JSON.stringify(orders));showOrders();toast("Đã lưu thay đổi đơn hàng.");
    }
  }
  window.MocAnApp={catalog:function(){return catalog;},saveCatalog:saveCatalog,renderProducts:renderProducts,setFilter:setFilter,searchProducts:searchProducts,setCategory:setCategory,addToCart:addToCart,showProduct:showProduct,showCart:showCart,openCheckout:openCheckout,changeCartQty:changeCartQty,removeCartItem:removeCartItem,showOrders:showOrders,showOrderEdit:showOrderEdit,cancelOrder:cancelOrder,submitModalForm:submitModalForm,updateStoreSelect:updateStoreSelect,renderStores:renderStores,pickStore:pickStore,showArticle:showArticle,openModal:openModal,closeModal:closeModal,toast:toast,money:money,esc:esc,safeRead:safeRead,reviews:reviews,findProduct:findProduct,setArticles:setArticles,setCategories:setCategories};
  initStores();
  renderProducts();
  renderArticles();
  renderCartCount();
})();
