(function(){
  "use strict";
  const app=window.MocAnApp;
  if(!app)return;
  const ADMIN_EMAIL="admin@mocan.example";
  const ADMIN_PASSWORD="demo123";
  const $=function(selector,root){return (root||document).querySelector(selector);};
  const esc=app.esc;
  const money=app.money;
  const storageRead=function(key,fallback){try{const value=JSON.parse(localStorage.getItem(key));return value===null?fallback:value;}catch(_){return fallback;}};
  const storageWrite=function(key,value){localStorage.setItem(key,JSON.stringify(value));};
  const seedCategories=[
    {id:"cat-living",code:"PK",name:"Phòng khách",note:"Sofa, bàn trà, kệ tivi",status:"Đang dùng"},
    {id:"cat-bedroom",code:"PN",name:"Phòng ngủ",note:"Giường, tủ, đèn ngủ",status:"Đang dùng"},
    {id:"cat-dining",code:"PA",name:"Phòng ăn",note:"Bàn ăn, ghế ăn",status:"Đang dùng"},
    {id:"cat-work",code:"PMLV",name:"Phòng làm việc",note:"Bàn, ghế, kệ sách",status:"Đang dùng"}
  ];
  const seedCustomers=[
    {id:"cus-demo-1",name:"Khách hàng mẫu",email:"khach@example.test",phone:"0900 000 001",address:"TP. Hồ Chí Minh",status:"Đang hoạt động"}
  ];
  const seedStaff=[
    {id:"staff-01",name:"Lê Minh Anh",email:"minhanh@mocan.example",phone:"0900 000 011",position:"Quản lý cửa hàng",permissions:"Bán hàng, đơn hàng, kho",status:"Đang làm"},
    {id:"staff-02",name:"Trần Bảo Long",email:"baolong@mocan.example",phone:"0900 000 012",position:"Nhân viên bán hàng",permissions:"POS, khách hàng",status:"Đang làm"}
  ];
  const seedSuppliers=[
    {id:"sup-01",code:"NCC-001",name:"Gỗ Việt An",email:"lienhe@govietan.example",phone:"028 0000 1001",address:"Bình Dương",notes:"Đồ gỗ tự nhiên"},
    {id:"sup-02",code:"NCC-002",name:"Vải Mộc",email:"hello@vaimoc.example",phone:"028 0000 1002",address:"TP. Hồ Chí Minh",notes:"Vải bọc nội thất"}
  ];
  const seedPromotions=[
    {id:"promo-01",name:"Nhà ấm tháng 10",discount:15,products:"Sofa vải Lam 3 chỗ, Bàn trà Nô",salePrice:10965000,start:"2026-10-01",end:"2026-10-31",status:"Đang áp dụng"}
  ];
  const seedNews=[
    {id:"news-01",title:"Góc nhỏ cũng có thể thành nơi mình thích nhất",category:"Sắp xếp không gian",author:"Mộc An",date:"2026-06-12",image:"https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80",summary:"Bắt đầu từ ánh sáng, màu sắc và một món đồ thật sự cần thiết.",content:"Một góc nhà dễ chịu không cần quá nhiều đồ. Hãy thử bắt đầu bằng việc dọn bớt những thứ không dùng, đưa ánh sáng tự nhiên vào phòng và chọn một món nội thất có công năng rõ ràng.",status:"Đã đăng"},
    {id:"news-02",title:"Chọn gỗ thế nào để món đồ ở bên mình lâu hơn?",category:"Chọn chất liệu",author:"Mộc An",date:"2026-06-04",image:"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",summary:"Một vài điều nên để ý khi chọn chất liệu cho ngôi nhà.",content:"Hãy chú ý đến kết cấu, lớp hoàn thiện và cách vệ sinh được khuyến nghị khi chọn đồ gỗ.",status:"Đã đăng"}
  ];
  const seedAds=[
    {id:"ad-01",name:"Banner bộ sưu tập mùa mới",image:"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",url:"#san-pham",x:50,y:18,status:"Đang hiển thị"}
  ];
  const schemas={
    categories:{title:"Danh mục sản phẩm",collection:"categories",seed:seedCategories,fields:[
      {name:"code",label:"Mã danh mục",required:true},{name:"name",label:"Tên danh mục",required:true},{name:"note",label:"Mô tả"},{name:"status",label:"Trạng thái",type:"select",options:["Đang dùng","Tạm ẩn"]}
    ]},
    users:{title:"Người dùng",collection:"users",seed:[],fields:[
      {name:"name",label:"Họ tên",required:true},{name:"email",label:"Email",type:"email",required:true},{name:"phone",label:"Số điện thoại"},{name:"role",label:"Vai trò",type:"select",options:["Khách hàng","Quản trị viên"]},{name:"status",label:"Trạng thái",type:"select",options:["Đang hoạt động","Tạm khóa"]}
    ]},
    customers:{title:"Khách hàng",collection:"customers",seed:seedCustomers,fields:[
      {name:"name",label:"Họ tên",required:true},{name:"email",label:"Email",type:"email"},{name:"phone",label:"Số điện thoại"},{name:"address",label:"Địa chỉ"},{name:"status",label:"Trạng thái",type:"select",options:["Đang hoạt động","Ngừng hoạt động"]}
    ]},
    staff:{title:"Nhân viên & phân quyền",collection:"staff",seed:seedStaff,fields:[
      {name:"name",label:"Họ tên",required:true},{name:"email",label:"Email",type:"email",required:true},{name:"phone",label:"Số điện thoại"},{name:"position",label:"Vị trí / vai trò",required:true},{name:"permissions",label:"Quyền được cấp",type:"textarea"},{name:"status",label:"Trạng thái",type:"select",options:["Đang làm","Tạm nghỉ","Đã nghỉ"]}
    ]},
    suppliers:{title:"Nhà cung cấp",collection:"suppliers",seed:seedSuppliers,fields:[
      {name:"code",label:"Mã nhà cung cấp",required:true},{name:"name",label:"Tên nhà cung cấp",required:true},{name:"email",label:"Email",type:"email"},{name:"phone",label:"Số điện thoại"},{name:"address",label:"Địa chỉ"},{name:"notes",label:"Ghi chú",type:"textarea"}
    ]},
    promotions:{title:"Khuyến mãi & chi tiết",collection:"promotions",seed:seedPromotions,fields:[
      {name:"name",label:"Tên khuyến mãi",required:true},{name:"discount",label:"Mức giảm (%)",type:"number",required:true},{name:"products",label:"Sản phẩm áp dụng",type:"textarea"},{name:"salePrice",label:"Giá khuyến mãi (₫)",type:"number"},{name:"start",label:"Bắt đầu",type:"date"},{name:"end",label:"Kết thúc",type:"date"},{name:"status",label:"Trạng thái",type:"select",options:["Đang áp dụng","Sắp diễn ra","Đã kết thúc"]}
    ]},
    news:{title:"Tin tức",collection:"news",seed:seedNews,fields:[
      {name:"title",label:"Tiêu đề",required:true},{name:"category",label:"Chuyên mục"},{name:"author",label:"Người đăng"},{name:"date",label:"Ngày đăng",type:"date"},{name:"image",label:"Đường dẫn ảnh",type:"url"},{name:"summary",label:"Mô tả ngắn",type:"textarea"},{name:"content",label:"Nội dung",type:"textarea",required:true},{name:"status",label:"Trạng thái",type:"select",options:["Bản nháp","Đã đăng"]}
    ]},
    ads:{title:"Quảng cáo & banner",collection:"ads",seed:seedAds,fields:[
      {name:"name",label:"Tên quảng cáo",required:true},{name:"image",label:"Đường dẫn ảnh",type:"url",required:true},{name:"url",label:"Đường dẫn đích",type:"url"},{name:"x",label:"Tọa độ X (%)",type:"number"},{name:"y",label:"Tọa độ Y (%)",type:"number"},{name:"status",label:"Trạng thái",type:"select",options:["Đang hiển thị","Tạm ẩn"]}
    ]},
    invoicesIn:{title:"Hóa đơn nhập",collection:"invoices_in",seed:[],fields:[
      {name:"code",label:"Mã hóa đơn",required:true},{name:"date",label:"Ngày nhập",type:"date"},{name:"partner",label:"Nhà cung cấp"},{name:"product",label:"Sản phẩm / mã sản phẩm"},{name:"quantity",label:"Số lượng",type:"number"},{name:"total",label:"Tổng tiền (₫)",type:"number"},{name:"status",label:"Trạng thái",type:"select",options:["Đã nhập kho","Chờ xử lý","Đã hủy"]},{name:"note",label:"Ghi chú",type:"textarea"}
    ]},
    invoicesOut:{title:"Hóa đơn xuất",collection:"invoices_out",seed:[],fields:[
      {name:"code",label:"Mã hóa đơn",required:true},{name:"date",label:"Ngày xuất",type:"date"},{name:"partner",label:"Khách hàng"},{name:"product",label:"Sản phẩm / mã sản phẩm"},{name:"quantity",label:"Số lượng",type:"number"},{name:"total",label:"Tổng tiền (₫)",type:"number"},{name:"status",label:"Trạng thái",type:"select",options:["Đã xuất","Chờ xử lý","Đã hủy"]},{name:"note",label:"Ghi chú",type:"textarea"}
    ]}
  };
  const moduleGroups=[
    {label:"TỔNG QUAN",items:[["overview","Tổng quan"],["pos","Bán hàng / POS"],["orders","Đơn hàng"],["reports","Báo cáo doanh thu"]]},
    {label:"NỘI DUNG WEBSITE",items:[["products","Sản phẩm"],["categories","Danh mục"],["promotions","Khuyến mãi"],["news","Tin tức"],["ads","Quảng cáo"],["reviews","Phản hồi"]]},
    {label:"VẬN HÀNH CỬA HÀNG",items:[["users","Người dùng"],["customers","Khách hàng"],["staff","Nhân viên & quyền"],["inventory","Kho & kiểm kê"],["invoicesIn","Hóa đơn nhập"],["invoicesOut","Hóa đơn xuất"],["suppliers","Nhà cung cấp"],["prices","Giá bán & lịch sử"]]}
  ];
  const moduleTitles={overview:"Tổng quan cửa hàng",pos:"Bán hàng tại quầy",orders:"Quản lý đơn hàng",reports:"Báo cáo doanh thu",products:"Quản lý sản phẩm",categories:"Danh mục sản phẩm",promotions:"Khuyến mãi",news:"Tin tức",ads:"Quảng cáo",reviews:"Phản hồi khách hàng",users:"Quản lý người dùng",customers:"Quản lý khách hàng",staff:"Nhân viên & phân quyền",inventory:"Kho hàng & kiểm kê",invoicesIn:"Hóa đơn nhập hàng",invoicesOut:"Hóa đơn xuất hàng",suppliers:"Nhà cung cấp",prices:"Giá bán & lịch sử thay đổi"};
  let currentUser=storageRead("mocan_session",null);
  let currentAdminModule="overview";
  let pendingImageData="";
  if(!currentUser||!currentUser.role||(currentUser.role==="admin"&&String(currentUser.email||"").trim().toLowerCase()!==ADMIN_EMAIL))currentUser=null;

  function collection(module){
    const schema=schemas[module];
    if(!schema)return [];
    const key=module==="users"?"mocan_accounts":"mocan_admin_"+schema.collection;
    let rows=storageRead(key,null);
    if(!Array.isArray(rows)){rows=schema.seed.slice();storageWrite(key,rows);}
    return rows;
  }
  function saveCollection(module,rows){
    const schema=schemas[module];if(!schema)return;
    const key=module==="users"?"mocan_accounts":"mocan_admin_"+schema.collection;
    storageWrite(key,rows);
    if(module==="categories"&&app.setCategories)app.setCategories(rows.filter(row=>row.status!=="Tạm ẩn").map(row=>row.name));
    if(module==="news"&&app.setArticles)app.setArticles(rows.filter(row=>row.status==="Đã đăng"));
  }
  function formatDate(value){if(!value)return "—";if(/^\d{4}-\d{2}-\d{2}$/.test(String(value))){const p=String(value).split("-");return p[2]+"/"+p[1]+"/"+p[0];}return String(value);}
  function setSession(value){currentUser=value;storageWrite("mocan_session",value);updateAccountButton();renderAccountPopover(currentUser?"account":"login");}
  function hasAdminSession(){return !!currentUser&&currentUser.role==="admin"&&String(currentUser.email||"").trim().toLowerCase()===ADMIN_EMAIL;}
  function requireAdminSession(){
    if(hasAdminSession())return true;
    openAccountPopover("admin");
    app.toast("Vui lòng đăng nhập tài khoản quản trị để vào khu vực này.");
    return false;
  }
  function updateAccountButton(){
    const top=$("#accountTopLabel"),sub=$("#accountSubLabel"),button=$("#accountButton");
    if(!top||!sub)return;
    if(currentUser){top.textContent=currentUser.role==="admin"?"Quản trị viên":"Xin chào";sub.textContent=currentUser.name||currentUser.email||"Tài khoản của tôi";}
    else{top.textContent="Đăng nhập / Đăng ký";sub.textContent="Tài khoản của tôi";}
    button.setAttribute("aria-label",currentUser?"Tài khoản "+(currentUser.name||currentUser.email):"Đăng nhập hoặc đăng ký");
  }
  function loginView(){
    return '<div class="login-popover"><p class="auth-eyebrow">TÀI KHOẢN MỘC AN</p><h2 id="authHeading">ĐĂNG NHẬP TÀI KHOẢN</h2><p class="auth-intro">Nhập email và mật khẩu của bạn:</p><form id="loginForm" class="auth-form"><label class="sr-only" for="loginEmail">Email hoặc số điện thoại</label><input id="loginEmail" name="email" autocomplete="username" placeholder="Nhập email hoặc số điện thoại" required><label class="sr-only" for="loginPassword">Mật khẩu</label><input id="loginPassword" name="password" type="password" autocomplete="current-password" placeholder="Mật khẩu" required><p class="auth-privacy">Khi triển khai thật, hệ thống cần máy chủ xác thực, chính sách bảo mật và reCAPTCHA.</p><button class="auth-submit" type="submit">ĐĂNG NHẬP</button></form><p class="auth-switch">Khách hàng mới? <button type="button" data-auth-view="register">Tạo tài khoản</button></p><p class="auth-switch">Quên mật khẩu? <button type="button" data-auth-view="recover">Khôi phục mật khẩu</button></p><div class="auth-admin-link"><button type="button" data-auth-view="admin">Đăng nhập quản trị viên demo ↗</button></div><p class="auth-demo-note">Bản demo không lưu hoặc gửi mật khẩu.</p></div>';
  }
  function registerView(){
    return '<div class="login-popover"><button class="auth-back" type="button" data-auth-view="login">← Quay lại đăng nhập</button><p class="auth-eyebrow">CHÀO MỪNG BẠN</p><h2 id="authHeading">TẠO TÀI KHOẢN</h2><p class="auth-intro">Lưu thông tin để theo dõi đơn hàng dễ dàng hơn.</p><form id="registerForm" class="auth-form"><label>Họ và tên<input name="name" autocomplete="name" required placeholder="Tên của bạn"></label><label>Email<input name="email" type="email" autocomplete="email" required placeholder="ten@email.com"></label><label>Số điện thoại<input name="phone" autocomplete="tel" placeholder="09xx xxx xxx"></label><label>Mật khẩu<input name="password" type="password" autocomplete="new-password" minlength="6" required placeholder="Ít nhất 6 ký tự"></label><label>Nhập lại mật khẩu<input name="confirm" type="password" autocomplete="new-password" minlength="6" required placeholder="Nhập lại mật khẩu"></label><button class="auth-submit" type="submit">TẠO TÀI KHOẢN</button></form><p class="auth-demo-note">Đây là bản tĩnh: hồ sơ demo lưu trong trình duyệt, mật khẩu không được lưu.</p></div>';
  }
  function recoveryView(){
    return '<div class="login-popover"><button class="auth-back" type="button" data-auth-view="login">← Quay lại đăng nhập</button><p class="auth-eyebrow">HỖ TRỢ TÀI KHOẢN</p><h2 id="authHeading">KHÔI PHỤC MẬT KHẨU</h2><p class="auth-intro">Nhập email đã dùng để đăng ký:</p><form id="recoveryForm" class="auth-form"><label class="sr-only" for="recoveryEmail">Email</label><input id="recoveryEmail" name="email" type="email" required placeholder="ten@email.com"><button class="auth-submit" type="submit">GỬI YÊU CẦU KHÔI PHỤC</button></form><p class="auth-demo-note">Bản demo không gửi email. Khi có máy chủ, hệ thống sẽ gửi liên kết đặt lại mật khẩu.</p></div>';
  }
  function adminLoginView(){
    return '<div class="login-popover"><button class="auth-back" type="button" data-auth-view="login">← Quay lại đăng nhập</button><p class="auth-eyebrow">KHU VỰC QUẢN TRỊ</p><h2 id="authHeading">ĐĂNG NHẬP QUẢN TRỊ</h2><p class="auth-intro">Đăng nhập để mở bảng điều khiển cửa hàng.</p><form id="adminLoginForm" class="auth-form"><label>Email quản trị<input name="email" type="email" autocomplete="username" required value="admin@mocan.example"></label><label>Mật khẩu<input name="password" type="password" autocomplete="current-password" required placeholder="Mật khẩu demo"></label><p class="auth-privacy">Tài khoản demo: <b>admin@mocan.example</b> · Mật khẩu: <b>demo123</b></p><button class="auth-submit" type="submit">VÀO TRANG QUẢN TRỊ</button></form><p class="auth-demo-note">Thông tin này chỉ dùng cho bản trình diễn tĩnh, không bảo vệ dữ liệu thật.</p></div>';
  }
  function accountView(){
    if(!currentUser)return loginView();
    return '<div class="account-menu"><p class="auth-eyebrow">TÀI KHOẢN MỘC AN</p><h2 id="authHeading">Xin chào, '+esc(currentUser.name||"bạn")+'</h2><p class="account-email">'+esc(currentUser.email||"")+' · '+(currentUser.role==="admin"?"Quản trị viên":"Khách hàng")+'</p><button class="account-menu-action" type="button" data-account-orders>Đơn hàng của tôi <span>→</span></button>'+(currentUser.role==="admin"?'<button class="account-menu-action" type="button" data-open-admin>Tới bảng quản trị <span>→</span></button>':'')+'<button class="account-menu-action account-logout" type="button" data-auth-logout>Đăng xuất</button></div>';
  }
  function renderAccountPopover(view){
    const body=$("#accountPopoverBody");
    if(!body)return;
    const currentView=view|| (currentUser?"account":"login");
    body.innerHTML=currentView==="register"?registerView():currentView==="recover"?recoveryView():currentView==="admin"?adminLoginView():currentView==="account"?accountView():loginView();
  }
  function openAccountPopover(view){
    const pop=$("#accountPopover");
    const next=view|| (currentUser?"account":"login");
    renderAccountPopover(next);
    pop.hidden=false;
    $("#accountButton").setAttribute("aria-expanded","true");
    const field=$("input",pop);if(field)field.focus();
  }
  function closeAccountPopover(){
    $("#accountPopover").hidden=true;
    $("#accountButton").setAttribute("aria-expanded","false");
  }
  function customerAfterLogin(account){
    const customers=collection("customers");
    if(account.phone&&!customers.some(row=>row.email===account.email||row.phone===account.phone)){
      customers.push({id:"cus-"+Date.now(),name:account.name,email:account.email,phone:account.phone,address:"",status:"Đang hoạt động"});
      saveCollection("customers",customers);
    }
  }
  function signIn(email,password){
    const normalized=String(email||"").trim().toLowerCase();
    if(normalized===ADMIN_EMAIL&&password===ADMIN_PASSWORD){
      setSession({name:"Quản trị viên",email:ADMIN_EMAIL,role:"admin"});
      closeAccountPopover();
      app.toast("Đã đăng nhập quản trị demo.");
      open("overview");
      return;
    }
    if(normalized===ADMIN_EMAIL){app.toast("Thông tin quản trị demo chưa đúng.");return;}
    const accounts=collection("users");
    let account=accounts.find(row=>String(row.email||"").toLowerCase()===normalized);
    if(!account){account={id:"user-"+Date.now(),name:normalized.split("@")[0]||"Khách hàng",email:normalized,phone:"",role:"Khách hàng",status:"Đang hoạt động"};accounts.push(account);saveCollection("users",accounts);}
    const user={name:account.name||normalized.split("@")[0],email:normalized,phone:account.phone||"",role:"customer"};
    setSession(user);customerAfterLogin(user);closeAccountPopover();
    app.toast("Đăng nhập demo thành công. Bản tĩnh chưa xác thực mật khẩu qua máy chủ.");
  }
  function open(module){
    if(!requireAdminSession())return;
    showAdmin(module||"overview");
  }
  function getOrders(){const orders=storageRead("mocan_orders",[]);return Array.isArray(orders)?orders:[];}
  function writeOrders(rows){storageWrite("mocan_orders",rows);}
  function moduleButton(key,label){return '<button type="button" class="admin-nav-item '+(currentAdminModule===key?"is-active":"")+'" data-admin-module="'+key+'"><span class="admin-nav-dot"></span>'+esc(label)+'</button>';}
  function adminShell(module,content){
    currentAdminModule=module;
    const nav=moduleGroups.map(function(group){return '<div class="admin-nav-group"><span class="admin-nav-label">'+esc(group.label)+'</span>'+group.items.map(item=>moduleButton(item[0],item[1])).join("")+'</div>';}).join("");
    return '<div class="admin-layout"><aside class="admin-sidebar"><div class="admin-profile"><span class="admin-avatar">MA</span><div><strong>Quản trị Mộc An</strong><small>Quản trị viên demo</small></div></div><nav class="admin-nav" aria-label="Các chức năng quản trị">'+nav+'</nav><button class="admin-logout" type="button" data-auth-logout>Đăng xuất</button></aside><section class="admin-main"><div class="admin-page-heading"><div><p class="eyebrow"><span></span> BẢNG ĐIỀU KHIỂN</p><h3>'+esc(moduleTitles[module]||"Quản trị cửa hàng")+'</h3></div><span class="admin-demo-badge">DEMO TĨNH</span></div><div class="admin-content">'+content+'</div></section></div>';
  }
  function adminStats(){
    const products=app.catalog();
    const orders=getOrders();
    const users=collection("users");
    const pending=orders.filter(order=>order.status==="Chờ xác nhận").length;
    const sales=orders.filter(order=>order.status==="Hoàn tất"||order.status==="Đang giao").reduce((sum,order)=>sum+(Number(order.total)||0),0);
    return '<div class="admin-metric-grid"><article><span>Sản phẩm</span><strong>'+products.length+'</strong><small>đang quản lý</small></article><article><span>Đơn chờ xử lý</span><strong>'+pending+'</strong><small>cần kiểm tra</small></article><article><span>Người dùng</span><strong>'+users.length+'</strong><small>tài khoản mẫu</small></article><article><span>Doanh thu đơn đã xác nhận</span><strong>'+money(sales)+'</strong><small>tổng đơn hoàn tất / đang giao</small></article></div>';
  }
  function renderOverview(){
    const orders=getOrders().slice().reverse().slice(0,5);
    const ordersHtml=orders.length?'<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead><tbody>'+orders.map(order=>'<tr><td><strong>'+esc(order.code||"—")+'</strong></td><td>'+esc(order.name||"—")+'</td><td>'+esc(order.date||"—")+'</td><td>'+money(order.total)+'</td><td><span class="admin-status">'+esc(order.status||"Chờ xác nhận")+'</span></td></tr>').join("")+'</tbody></table></div>':'<div class="admin-empty">Chưa có đơn hàng. Đơn mới sẽ xuất hiện tại đây.</div>';
    return adminStats()+'<div class="admin-content-grid"><section class="admin-panel-card"><div class="admin-panel-heading"><div><span class="admin-kicker">CỬA HÀNG</span><h4>Đơn hàng gần đây</h4></div><button type="button" class="admin-inline-link" data-admin-module="orders">Xem tất cả →</button></div>'+ordersHtml+'</section><section class="admin-panel-card admin-quick-panel"><span class="admin-kicker">TRUY CẬP NHANH</span><h4>Quản lý cửa hàng</h4><div class="admin-quick-links"><button type="button" data-admin-module="products">＋ Sản phẩm</button><button type="button" data-admin-module="inventory">Kiểm kê kho →</button><button type="button" data-admin-module="promotions">Tạo khuyến mãi →</button><button type="button" data-admin-module="reports">Xem báo cáo →</button></div></section></div><p class="admin-footnote">Dữ liệu trong bảng quản trị được lưu trong trình duyệt đang mở trang. Đây là bản demo tĩnh, chưa có máy chủ hoặc cơ sở dữ liệu.</p>';
  }
  function renderProductsAdmin(){
    const products=app.catalog();
    return '<div class="admin-toolbar"><p>Thông tin sản phẩm, giá bán, hình ảnh chính và ảnh chi tiết.</p><button class="modal-button" type="button" data-admin-create="products">＋ Thêm sản phẩm</button></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Mã / tên sản phẩm</th><th>Danh mục</th><th>Nhà sản xuất</th><th>Giá bán</th><th>Tồn kho</th><th></th></tr></thead><tbody>'+products.map(function(p){return '<tr><td><strong>'+esc(p.code||p.id)+'</strong><small>'+esc(p.name)+'</small></td><td>'+esc(p.category||"—")+'</td><td>'+esc(p.manufacturer||"—")+'</td><td>'+money(p.price)+'</td><td>'+Number(p.stock||0)+'</td><td class="admin-actions"><button type="button" data-admin-edit-product="'+esc(p.id)+'">Sửa</button><button type="button" class="danger-link" data-admin-delete-product="'+esc(p.id)+'">Xóa</button></td></tr>';}).join("")+'</tbody></table></div>';
  }
  function renderGeneric(module){
    const schema=schemas[module];const rows=collection(module);
    const fields=schema.fields.slice(0,5);
    const header=fields.map(field=>'<th>'+esc(field.label)+'</th>').join("");
    const body=rows.length?rows.map(function(row){return '<tr>'+fields.map(field=>'<td>'+esc(field.name==="date"?formatDate(row[field.name]):row[field.name]||"—")+'</td>').join("")+'<td class="admin-actions"><button type="button" data-admin-edit="'+esc(module)+'" data-id="'+esc(row.id)+'">Sửa</button><button type="button" class="danger-link" data-admin-delete="'+esc(module)+'" data-id="'+esc(row.id)+'">Xóa</button></td></tr>';}).join(""):'<tr><td colspan="'+(fields.length+1)+'" class="admin-empty-cell">Chưa có dữ liệu. Thêm bản ghi để bắt đầu.</td></tr>';
    return '<div class="admin-toolbar"><p>'+esc(schema.title)+' · Thêm, sửa hoặc xóa dữ liệu mẫu.</p><button class="modal-button" type="button" data-admin-create="'+esc(module)+'">＋ Thêm mới</button></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr>'+header+'<th></th></tr></thead><tbody>'+body+'</tbody></table></div>';
  }
  function renderOrders(detailId){
    const orders=getOrders();
    if(detailId){
      const order=orders.find(row=>row.id===detailId);
      if(!order)return renderOrders();
      const items=(order.items||[]).map(item=>'<div class="admin-order-line"><span>'+esc(item.name)+' × '+Number(item.qty||0)+'</span><strong>'+money(Number(item.price||0)*Number(item.qty||0))+'</strong></div>').join("");
      return '<div class="admin-toolbar"><button type="button" class="admin-inline-link" data-admin-module="orders">← Tất cả đơn hàng</button><span class="admin-status">'+esc(order.status||"Chờ xác nhận")+'</span></div><article class="admin-detail-card"><div class="admin-panel-heading"><div><span class="admin-kicker">CHI TIẾT ĐƠN</span><h4>'+esc(order.code||"Đơn hàng")+'</h4></div><strong>'+money(order.total)+'</strong></div><div class="admin-detail-grid"><p><small>Khách hàng</small><b>'+esc(order.name||"—")+'</b></p><p><small>Số điện thoại</small><b>'+esc(order.phone||"—")+'</b></p><p><small>Ngày đặt</small><b>'+esc(order.date||"—")+'</b></p><p><small>Địa chỉ</small><b>'+esc(order.address||"—")+'</b></p></div><h5>Sản phẩm</h5>'+items+'<div class="admin-order-note"><b>Ghi chú</b><p>'+esc(order.note||"Không có ghi chú.")+'</p></div></article>';
    }
    const rows=orders.length?orders.slice().reverse().map(function(order){return '<tr><td><strong>'+esc(order.code||"—")+'</strong><small>'+esc(order.date||"")+'</small></td><td>'+esc(order.name||"—")+'<small>'+esc(order.phone||"")+'</small></td><td>'+money(order.total)+'</td><td><select data-order-status="'+esc(order.id)+'"><option '+(order.status==="Chờ xác nhận"?"selected":"")+'>Chờ xác nhận</option><option '+(order.status==="Đang xử lý"?"selected":"")+'>Đang xử lý</option><option '+(order.status==="Đang giao"?"selected":"")+'>Đang giao</option><option '+(order.status==="Hoàn tất"?"selected":"")+'>Hoàn tất</option><option '+(order.status==="Đã hủy"?"selected":"")+'>Đã hủy</option></select></td><td class="admin-actions"><button type="button" data-order-detail="'+esc(order.id)+'">Chi tiết</button><button type="button" data-order-save="'+esc(order.id)+'">Lưu</button></td></tr>';}).join(""):'<tr><td colspan="5" class="admin-empty-cell">Chưa có đơn hàng.</td></tr>';
    return '<div class="admin-toolbar"><p>Xem trạng thái, khách hàng, sản phẩm, tổng tiền và ghi chú đơn hàng.</p><span class="admin-status">'+orders.length+' đơn hàng</span></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Mã đơn / ngày</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  }
  function renderPOS(){
    const products=app.catalog();
    const options=products.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.name)+' · '+money(p.price)+' · tồn '+Number(p.stock||0)+'</option>').join("");
    return '<div class="pos-layout"><form class="admin-form pos-form" id="posForm"><div class="admin-panel-heading"><div><span class="admin-kicker">ĐƠN TẠI QUẦY</span><h4>Tạo hóa đơn bán hàng</h4></div></div><div class="admin-form-grid"><label>Sản phẩm<select name="productId" required>'+options+'</select></label><label>Số lượng<input name="quantity" type="number" min="1" value="1" required></label><label>Tên khách hàng<input name="name" placeholder="Khách lẻ"></label><label>Số điện thoại<input name="phone" inputmode="tel"></label><label>Phương thức thanh toán<select name="payment"><option>Tiền mặt</option><option>Chuyển khoản</option><option>Thẻ ngân hàng</option></select></label><label>Ghi chú<input name="note" placeholder="Ghi chú hóa đơn"></label></div><button class="modal-button" type="submit">Hoàn tất bán hàng</button><p class="admin-footnote">Hoàn tất sẽ tạo đơn hàng và hóa đơn xuất, đồng thời trừ tồn kho mẫu.</p></form><aside class="admin-pos-aside"><span class="admin-kicker">HƯỚNG DẪN</span><h4>Quy trình tại quầy</h4><ol><li>Chọn sản phẩm và số lượng.</li><li>Nhập thông tin khách nếu có.</li><li>Chọn hình thức thanh toán.</li><li>Xác nhận để lưu hóa đơn demo.</li></ol></aside></div>';
  }
  function renderInventory(){
    const products=app.catalog();const logs=storageRead("mocan_inventory_log",[]);
    const rows=products.map(p=>'<tr><td><strong>'+esc(p.name)+'</strong><small>'+esc(p.code||p.id)+'</small></td><td>'+Number(p.stock||0)+'</td><td><input type="number" min="0" data-count-value="'+esc(p.id)+'" value="'+Number(p.stock||0)+'"></td><td><input type="text" data-count-note="'+esc(p.id)+'" placeholder="Lý do điều chỉnh"></td><td><button type="button" data-inventory-save="'+esc(p.id)+'">Cập nhật</button></td></tr>').join("");
    const logHtml=logs.length?logs.slice().reverse().slice(0,6).map(row=>'<tr><td>'+esc(row.date)+'</td><td>'+esc(row.product)+'</td><td>'+Number(row.before)+' → '+Number(row.after)+'</td><td>'+esc(row.reason||"—")+'</td></tr>').join(""):'<tr><td colspan="4" class="admin-empty-cell">Chưa có điều chỉnh tồn kho.</td></tr>';
    return '<div class="admin-toolbar"><p>Đối chiếu số lượng thực tế và cập nhật tồn kho.</p><span class="admin-status">'+products.length+' mã sản phẩm</span></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Sản phẩm</th><th>Tồn sổ sách</th><th>Tồn thực tế</th><th>Lý do điều chỉnh</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div><section class="admin-panel-card"><div class="admin-panel-heading"><div><span class="admin-kicker">LỊCH SỬ KIỂM KÊ</span><h4>Các lần điều chỉnh gần đây</h4></div></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Ngày</th><th>Sản phẩm</th><th>Số lượng</th><th>Nguyên nhân</th></tr></thead><tbody>'+logHtml+'</tbody></table></div></section>';
  }
  function renderPrices(){
    const rows=storageRead("mocan_price_history",[]);
    const body=rows.length?rows.slice().reverse().map(row=>'<tr><td>'+esc(row.date)+'</td><td>'+esc(row.code||"—")+' · '+esc(row.product)+'</td><td>'+money(row.oldPrice)+'</td><td>'+money(row.newPrice)+'</td><td>'+esc(row.note||"Cập nhật giá bán")+'</td></tr>').join(""):'<tr><td colspan="5" class="admin-empty-cell">Lịch sử sẽ được ghi khi bạn thay đổi giá sản phẩm.</td></tr>';
    return '<div class="admin-toolbar"><p>Giá hiện tại được chỉnh trong mục Sản phẩm. Mỗi lần lưu giá mới sẽ ghi vào lịch sử.</p><button class="modal-button" type="button" data-admin-module="products">Chỉnh giá sản phẩm</button></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Thời gian</th><th>Sản phẩm</th><th>Giá cũ</th><th>Giá mới</th><th>Ghi chú</th></tr></thead><tbody>'+body+'</tbody></table></div>';
  }
  function reportOrders(period){
    const now=new Date();
    return getOrders().filter(function(order){
      if(order.status==="Đã hủy")return false;
      const date=order.createdAt?new Date(order.createdAt):now;
      if(period==="day")return date.toDateString()===now.toDateString();
      if(period==="week")return now-date<=7*24*60*60*1000;
      if(period==="month")return date.getMonth()===now.getMonth()&&date.getFullYear()===now.getFullYear();
      if(period==="quarter")return Math.floor(date.getMonth()/3)===Math.floor(now.getMonth()/3)&&date.getFullYear()===now.getFullYear();
      return true;
    });
  }
  function renderReports(period){
    const orders=reportOrders(period||"all");
    const revenue=orders.reduce((sum,order)=>sum+(Number(order.total)||0),0);
    const units=orders.reduce((sum,order)=>sum+(order.items||[]).reduce((n,item)=>n+(Number(item.qty)||0),0),0);
    const top={};
    orders.forEach(order=>(order.items||[]).forEach(item=>{top[item.name]=(top[item.name]||0)+(Number(item.qty)||0);}));
    const ranked=Object.entries(top).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const topHtml=ranked.length?ranked.map(function(item,index){const width=Math.max(8,Math.round(item[1]/ranked[0][1]*100));return '<div class="report-bar-row"><span>'+esc(item[0])+'</span><div><i style="width:'+width+'%"></i></div><strong>'+item[1]+'</strong></div>';}).join(""):'<div class="admin-empty">Chưa có số liệu bán hàng cho khoảng thời gian này.</div>';
    const low=app.catalog().filter(p=>Number(p.stock||0)<=5);
    return '<div class="admin-toolbar"><p>Tổng hợp doanh thu, số lượng bán, mặt hàng nổi bật và hàng tồn thấp.</p><label class="report-period">Kỳ báo cáo<select id="reportPeriod"><option value="all" '+((period||"all")==="all"?"selected":"")+'>Toàn thời gian</option><option value="day" '+(period==="day"?"selected":"")+'>Hôm nay</option><option value="week" '+(period==="week"?"selected":"")+'>7 ngày gần nhất</option><option value="month" '+(period==="month"?"selected":"")+'>Tháng này</option><option value="quarter" '+(period==="quarter"?"selected":"")+'>Quý này</option></select></label></div><div class="admin-metric-grid report-metrics"><article><span>Doanh thu</span><strong>'+money(revenue)+'</strong><small>từ '+orders.length+' đơn không bị hủy</small></article><article><span>Số sản phẩm đã bán</span><strong>'+units+'</strong><small>theo đơn demo</small></article><article><span>Tồn kho thấp</span><strong>'+low.length+'</strong><small>sản phẩm còn không quá 5</small></article></div><div class="admin-content-grid"><section class="admin-panel-card"><div class="admin-panel-heading"><div><span class="admin-kicker">SẢN PHẨM BÁN CHẠY</span><h4>Theo số lượng trong đơn</h4></div></div>'+topHtml+'</section><section class="admin-panel-card"><div class="admin-panel-heading"><div><span class="admin-kicker">KIỂM SOÁT KHO</span><h4>Sắp hết hàng</h4></div><button type="button" class="admin-inline-link" data-admin-module="inventory">Mở kho →</button></div>'+(low.length?low.map(p=>'<div class="low-stock-row"><span>'+esc(p.name)+'</span><b>'+Number(p.stock||0)+' còn lại</b></div>').join(""):'<div class="admin-empty">Không có sản phẩm tồn thấp.</div>')+'</section></div>';
  }
  function moduleView(module,detailId,period){
    if(module==="overview")return renderOverview();
    if(module==="products")return renderProductsAdmin();
    if(module==="orders")return renderOrders(detailId);
    if(module==="pos")return renderPOS();
    if(module==="inventory")return renderInventory();
    if(module==="prices")return renderPrices();
    if(module==="reports")return renderReports(period||"all");
    if(module==="reviews")return renderReviews();
    return schemas[module]?renderGeneric(module):renderOverview();
  }
  function renderReviews(){
    const data=app.reviews();const rows=[];
    Object.keys(data).forEach(function(productId){(data[productId]||[]).forEach(function(review,index){const p=app.findProduct(productId);rows.push({productId:productId,index:index,product:p?p.name:productId,review:review});});});
    const body=rows.length?rows.slice().reverse().map(function(item){return '<article class="admin-review-row"><div><strong>'+esc(item.review.name)+' · '+esc(item.product)+'</strong><span class="review-stars">'+("★".repeat(Number(item.review.rating)||0))+'</span><p>'+esc(item.review.comment)+'</p><small>'+esc(item.review.date||"")+'</small></div><button type="button" class="danger-link" data-admin-delete-review="'+esc(item.productId)+'" data-review-index="'+item.index+'">Xóa</button></article>';}).join(""):'<div class="admin-empty">Chưa có phản hồi. Đánh giá của khách hàng sẽ xuất hiện tại đây.</div>';
    return '<div class="admin-toolbar"><p>Lưu trữ và kiểm tra đánh giá, bình luận của khách hàng.</p><span class="admin-status">'+rows.length+' phản hồi</span></div>'+body;
  }
  function showAdmin(module,detailId,period){
    if(!requireAdminSession())return false;
    const key=module||"overview";
    app.openModal("Quản trị cửa hàng · Demo",adminShell(key,moduleView(key,detailId,period)));
    return true;
  }
  function categorySelectOptions(selected){
    const rows=collection("categories");
    const names=rows.filter(row=>row.status!=="Tạm ẩn").map(row=>row.name);
    if(!names.includes(selected)&&selected)names.unshift(selected);
    return names.map(name=>'<option '+(name===selected?"selected":"")+'>'+esc(name)+'</option>').join("");
  }
  function inputHtml(field,record){
    const value=record&&record[field.name]!=null?record[field.name]:"";
    const label=esc(field.label);
    if(field.name==="category"&&field.type==="select")return '<label>'+label+'<select name="category" required>'+categorySelectOptions(value)+'</select></label>';
    if(field.type==="select")return '<label>'+label+'<select name="'+esc(field.name)+'">'+(field.options||[]).map(option=>'<option '+(String(value)===option?"selected":"")+'>'+esc(option)+'</option>').join("")+'</select></label>';
    if(field.type==="textarea")return '<label>'+label+'<textarea name="'+esc(field.name)+'" '+(field.required?"required":"")+'>'+esc(value)+'</textarea></label>';
    const type=field.type||"text";
    return '<label>'+label+'<input type="'+esc(type)+'" name="'+esc(field.name)+'" value="'+esc(value)+'" '+(field.required?"required":"")+' '+(field.name==="price"||field.name==="stock"||field.name==="oldPrice"?"min=\"0\"":"")+'></label>';
  }
  function showAdminForm(module,id){
    const schema=schemas[module];
    if(module==="products"){
      const product=id?app.findProduct(id):null;
      pendingImageData="";
      const productFields=[
        {name:"code",label:"Mã sản phẩm"},{name:"name",label:"Tên sản phẩm",required:true},{name:"category",label:"Danh mục",type:"select",required:true},{name:"manufacturer",label:"Nhà sản xuất"},
        {name:"price",label:"Giá bán (₫)",type:"number",required:true},{name:"oldPrice",label:"Giá niêm yết (₫)",type:"number"},{name:"stock",label:"Số lượng tồn",type:"number",required:true},
        {name:"flag",label:"Nhóm hiển thị",type:"select",options:["best","new","sale","all"]},{name:"description",label:"Mô tả",type:"textarea"}
      ];
      const detailFields=[{name:"image",label:"Ảnh chính (HTTPS)",type:"url"},{name:"gallery",label:"Ảnh chi tiết (mỗi dòng một URL)",type:"textarea"}];
      const fieldsHtml=productFields.map(field=>inputHtml(field,Object.assign({},product,{category:product?product.category:"Phòng khách",flag:product?product.flag:"new"}))).join("");
      const detailHtml=detailFields.map(field=>inputHtml(field,product)).join("");
      const content='<div class="admin-toolbar"><button type="button" class="admin-inline-link" data-admin-module="products">← Quay lại danh sách sản phẩm</button><span class="admin-status">'+(product?"Chỉnh sửa sản phẩm":"Thêm sản phẩm")+'</span></div><form class="admin-form admin-record-form" id="adminProductForm" data-id="'+esc(id||"")+'"><div class="admin-form-grid">'+fieldsHtml+detailHtml+'<label>Chọn tệp ảnh từ máy<input type="file" name="imageFile" accept="image/png,image/jpeg,image/webp,image/gif"></label></div><img class="admin-image-preview" id="adminImagePreview" src="'+esc(product&&product.image?product.image:"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=70")+'" alt="Xem trước ảnh sản phẩm"><p class="admin-footnote">Ảnh tải lên được giữ cục bộ trong trình duyệt; để dùng thật cần tải ảnh lên máy chủ.</p><button class="modal-button" type="submit">Lưu sản phẩm</button></form>';
      showAdmin("products",null,null);
      $(".admin-content",$("#modalBody")).innerHTML=content;
      return;
    }
    if(!schema)return;
    const records=collection(module);
    const record=id?records.find(row=>row.id===id):null;
    const content='<div class="admin-toolbar"><button type="button" class="admin-inline-link" data-admin-module="'+esc(module)+'">← Quay lại danh sách</button><span class="admin-status">'+(record?"Chỉnh sửa":"Thêm mới")+'</span></div><form class="admin-form admin-record-form" id="adminCrudForm" data-module="'+esc(module)+'" data-id="'+esc(id||"")+'"><div class="admin-form-grid">'+schema.fields.map(field=>inputHtml(field,record)).join("")+'</div><button class="modal-button" type="submit">Lưu thay đổi</button></form>';
    showAdmin(module);
    $(".admin-content",$("#modalBody")).innerHTML=content;
  }
  function saveProductForm(form){
    const data=new FormData(form);const id=form.dataset.id;const products=app.catalog();
    const old=id?app.findProduct(id):null;
    const name=String(data.get("name")||"").trim();
    const imageValue=String(data.get("image")||"").trim();
    const gallery=String(data.get("gallery")||"").split(/[\n,]/).map(item=>item.trim()).filter(Boolean);
    const product={
      id:old?old.id:"custom-"+Date.now(),
      code:String(data.get("code")||"").trim()||(old&&old.code)||"SP-"+String(products.length+1).padStart(3,"0"),
      name:name,category:String(data.get("category")||"Phòng khách"),manufacturer:String(data.get("manufacturer")||"").trim(),
      price:Number(data.get("price")||0),oldPrice:Number(data.get("oldPrice")||0),stock:Number(data.get("stock")||0),
      badge:String(data.get("flag")||"new")==="sale"?"Ưu đãi":String(data.get("flag")||"new")==="best"?"Bán chạy":"Mới về",
      flag:String(data.get("flag")||"new"),rating:old?Number(old.rating)||0:0,reviewCount:old?Number(old.reviewCount)||0:0,
      image:pendingImageData||imageValue||(old&&old.image)||"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
      gallery:gallery,description:String(data.get("description")||"").trim()
    };
    if(!Number.isFinite(product.price)||product.price<0||!Number.isFinite(product.stock)||product.stock<0){app.toast("Giá và tồn kho phải là số không âm.");return;}
    if(old&&Number(old.price)!==product.price){
      const history=storageRead("mocan_price_history",[]);
      history.push({id:"price-"+Date.now(),date:new Date().toLocaleString("vi-VN"),code:product.code,product:product.name,oldPrice:Number(old.price)||0,newPrice:product.price,note:"Sửa từ trang quản trị"});
      storageWrite("mocan_price_history",history);
    }
    const at=products.findIndex(item=>item.id===product.id);
    if(at>=0)products[at]=product;else products.push(product);
    app.saveCatalog();app.renderProducts();pendingImageData="";showAdmin("products");app.toast("Đã lưu sản phẩm.");
  }
  function saveGenericForm(form){
    const module=form.dataset.module;const schema=schemas[module];if(!schema)return;
    const data=new FormData(form);const id=form.dataset.id;const rows=collection(module);
    const record={id:id||module+"-"+Date.now()};
    schema.fields.forEach(field=>{record[field.name]=String(data.get(field.name)||"").trim();if(field.type==="number")record[field.name]=Number(data.get(field.name)||0);});
    if(module==="news"){
      if(!record.date)record.date=new Date().toISOString().slice(0,10);
      if(!record.author)record.author="Mộc An";
    }
    const index=rows.findIndex(row=>row.id===id);
    const previous=index>=0?Object.assign({},rows[index]):null;
    if(index>=0)rows[index]=Object.assign({},rows[index],record);else rows.push(record);
    saveCollection(module,rows);
    if(module==="invoicesIn"||module==="invoicesOut"){
      const direction=module==="invoicesIn"?1:-1;
      const appliedStatus=module==="invoicesIn"?"Đã nhập kho":"Đã xuất";
      if(previous&&previous.status===appliedStatus)adjustInvoiceStock(previous,-direction);
      if(record.status===appliedStatus)adjustInvoiceStock(record,direction);
    }
    showAdmin(module);app.toast("Đã lưu dữ liệu "+(schema.title||"")+"." );
  }
  function adjustInvoiceStock(invoice,direction){
    const product=app.catalog().find(item=>item.name===invoice.product||item.code===invoice.product);
    if(!product)return;
    product.stock=Math.max(0,(Number(product.stock)||0)+(Number(invoice.quantity)||0)*direction);
    app.saveCatalog();app.renderProducts();
  }
  function deleteRecord(module,id){
    if(!window.confirm("Xóa bản ghi này khỏi dữ liệu demo?"))return;
    if(module==="products"){
      const products=app.catalog();const index=products.findIndex(item=>item.id===id);if(index>=0)products.splice(index,1);app.saveCatalog();app.renderProducts();
    }else{
      const current=collection(module);const record=current.find(row=>row.id===id);
      if(record&&(module==="invoicesIn"||module==="invoicesOut")){
        const direction=module==="invoicesIn"?1:-1;const appliedStatus=module==="invoicesIn"?"Đã nhập kho":"Đã xuất";
        if(record.status===appliedStatus)adjustInvoiceStock(record,-direction);
      }
      const rows=current.filter(row=>row.id!==id);saveCollection(module,rows);
    }
    showAdmin(module);app.toast("Đã xóa bản ghi.");
  }
  function createPosOrder(form){
    const data=new FormData(form);const id=String(data.get("productId"));const product=app.findProduct(id);const quantity=Math.max(1,Number(data.get("quantity")||1));
    if(!product){app.toast("Chọn sản phẩm trước khi hoàn tất.");return;}
    if(quantity>Number(product.stock||0)){app.toast("Số lượng vượt quá tồn kho hiện có.");return;}
    const name=String(data.get("name")||"Khách lẻ").trim()||"Khách lẻ";const phone=String(data.get("phone")||"").trim();const total=product.price*quantity;const now=new Date();
    const order={id:"pos-"+Date.now(),code:"MA-POS-"+String(Date.now()).slice(-5),date:now.toLocaleDateString("vi-VN"),createdAt:now.toISOString(),name:name,phone:phone,address:"Bán tại cửa hàng",note:String(data.get("note")||"").trim(),payment:String(data.get("payment")||"Tiền mặt"),items:[{id:product.id,name:product.name,price:product.price,qty:quantity}],total:total,status:"Hoàn tất"};
    const orders=getOrders();orders.push(order);writeOrders(orders);
    product.stock=Math.max(0,Number(product.stock||0)-quantity);app.saveCatalog();app.renderProducts();
    const invoices=collection("invoicesOut");invoices.push({id:"out-"+Date.now(),code:order.code,date:now.toISOString().slice(0,10),partner:name,product:product.name,quantity:quantity,total:total,status:"Đã xuất",note:"Tạo từ POS · "+order.payment});saveCollection("invoicesOut",invoices);
    if(phone){const customers=collection("customers");if(!customers.some(row=>row.phone===phone)){customers.push({id:"cus-"+Date.now(),name:name,email:"",phone:phone,address:"",status:"Đang hoạt động"});saveCollection("customers",customers);}}
    showAdmin("pos");app.toast("Đã tạo hóa đơn "+order.code+" và cập nhật tồn kho.");
  }
  function saveInventory(id){
    const product=app.findProduct(id);if(!product)return;
    const count=Math.max(0,Number($('[data-count-value="'+id+'"]',$("#modalBody")).value)||0);
    const reason=String($('[data-count-note="'+id+'"]',$("#modalBody")).value||"Kiểm kê thực tế").trim();
    const old=Number(product.stock)||0;
    if(old!==count){
      const logs=storageRead("mocan_inventory_log",[]);logs.push({id:"stock-"+Date.now(),date:new Date().toLocaleString("vi-VN"),product:product.name,before:old,after:count,reason:reason});storageWrite("mocan_inventory_log",logs);
      product.stock=count;app.saveCatalog();app.renderProducts();app.toast("Đã cập nhật tồn kho của "+product.name+".");
    }else app.toast("Số lượng thực tế không thay đổi.");
    showAdmin("inventory");
  }
  function saveOrderStatus(id){
    const status=$('[data-order-status="'+id+'"]',$("#modalBody")).value;
    const orders=getOrders().map(order=>order.id===id?Object.assign({},order,{status:status}):order);
    writeOrders(orders);showAdmin("orders");app.toast("Đã cập nhật trạng thái đơn hàng.");
  }
  function removeReview(productId,index){
    const data=app.reviews();if(!Array.isArray(data[productId]))return;
    data[productId].splice(index,1);storageWrite("mocan_reviews",data);app.renderProducts();showAdmin("reviews");app.toast("Đã xóa phản hồi.");
  }
  function deleteUser(email){
    if(String(email).toLowerCase()==="admin@mocan.example"){app.toast("Không thể xóa tài khoản quản trị demo.");return;}
    if(!window.confirm("Xóa tài khoản người dùng này khỏi dữ liệu demo?"))return;
    const rows=collection("users").filter(row=>String(row.email).toLowerCase()!==String(email).toLowerCase());saveCollection("users",rows);showAdmin("users");app.toast("Đã xóa người dùng khỏi dữ liệu demo.");
  }
  function handleAdminClick(event){
    const protectedControl=event.target.closest("[data-admin-module], [data-admin-create], [data-admin-edit-product], [data-admin-delete-product], [data-admin-edit], [data-admin-delete], [data-order-detail], [data-order-save], [data-inventory-save], [data-admin-delete-review]");
    if(protectedControl&&!requireAdminSession())return;
    const moduleButton=event.target.closest("[data-admin-module]");if(moduleButton){showAdmin(moduleButton.dataset.adminModule);return;}
    const create=event.target.closest("[data-admin-create]");if(create){showAdminForm(create.dataset.adminCreate);return;}
    const editProduct=event.target.closest("[data-admin-edit-product]");if(editProduct){showAdminForm("products",editProduct.dataset.adminEditProduct);return;}
    const deleteProduct=event.target.closest("[data-admin-delete-product]");if(deleteProduct){deleteRecord("products",deleteProduct.dataset.adminDeleteProduct);return;}
    const edit=event.target.closest("[data-admin-edit]");if(edit){showAdminForm(edit.dataset.adminEdit,edit.dataset.id);return;}
    const remove=event.target.closest("[data-admin-delete]");if(remove){if(remove.dataset.adminDelete==="users"){const user=collection("users").find(row=>row.id===remove.dataset.id);if(user)deleteUser(user.email);}else deleteRecord(remove.dataset.adminDelete,remove.dataset.id);return;}
    const detail=event.target.closest("[data-order-detail]");if(detail){showAdmin("orders",detail.dataset.orderDetail);return;}
    const saveOrder=event.target.closest("[data-order-save]");if(saveOrder){saveOrderStatus(saveOrder.dataset.orderSave);return;}
    const stock=event.target.closest("[data-inventory-save]");if(stock){saveInventory(stock.dataset.inventorySave);return;}
    const review=event.target.closest("[data-admin-delete-review]");if(review){if(window.confirm("Xóa phản hồi này khỏi dữ liệu demo?"))removeReview(review.dataset.adminDeleteReview,Number(review.dataset.reviewIndex));return;}
    if(event.target.closest("[data-auth-logout]")){setSession(null);closeAccountPopover();app.closeModal();app.toast("Đã đăng xuất.");return;}
    if(event.target.closest("[data-open-admin]")){closeAccountPopover();open("overview");return;}
    if(event.target.closest("[data-account-orders]")){closeAccountPopover();if(app.showOrders)app.showOrders();return;}
    const authView=event.target.closest("[data-auth-view]");if(authView){renderAccountPopover(authView.dataset.authView);return;}
  }
  function handleAuthSubmit(event){
    const form=event.target;const data=new FormData(form);
    if(form.id==="loginForm"){event.preventDefault();signIn(data.get("email"),String(data.get("password")||""));return;}
    if(form.id==="adminLoginForm"){
      event.preventDefault();
      if(String(data.get("email")).trim().toLowerCase()===ADMIN_EMAIL&&String(data.get("password"))===ADMIN_PASSWORD){
        signIn(ADMIN_EMAIL,ADMIN_PASSWORD);
      }else app.toast("Thông tin quản trị demo chưa đúng.");
      return;
    }
    if(form.id==="registerForm"){
      event.preventDefault();const email=String(data.get("email")||"").trim().toLowerCase();const password=String(data.get("password")||"");const confirm=String(data.get("confirm")||"");
      if(password.length<6){app.toast("Mật khẩu cần ít nhất 6 ký tự.");return;}
      if(password!==confirm){app.toast("Hai mật khẩu chưa trùng khớp.");return;}
      const accounts=collection("users");if(accounts.some(row=>String(row.email||"").toLowerCase()===email)){app.toast("Email này đã có tài khoản. Hãy đăng nhập.");renderAccountPopover("login");return;}
      const account={id:"user-"+Date.now(),name:String(data.get("name")||"").trim(),email:email,phone:String(data.get("phone")||"").trim(),role:"Khách hàng",status:"Đang hoạt động"};
      accounts.push(account);saveCollection("users",accounts);const user={name:account.name,email:account.email,phone:account.phone,role:"customer"};setSession(user);customerAfterLogin(user);closeAccountPopover();app.toast("Đã tạo tài khoản demo.");
      return;
    }
    if(form.id==="recoveryForm"){event.preventDefault();app.toast("Bản demo chưa gửi email. Khi kết nối máy chủ, liên kết khôi phục sẽ được gửi.");return;}
    if(form.id==="adminProductForm"||form.id==="adminCrudForm"||form.id==="posForm"){
      event.preventDefault();
      if(!requireAdminSession())return;
      if(form.id==="adminProductForm")saveProductForm(form);
      else if(form.id==="adminCrudForm")saveGenericForm(form);
      else createPosOrder(form);
      return;
    }
  }
  function handleAdminChange(event){
    if((event.target.matches('input[name="imageFile"]')||event.target.id==="reportPeriod")&&!requireAdminSession())return;
    if(event.target.matches('input[name="imageFile"]')){
      const file=event.target.files&&event.target.files[0];if(!file)return;
      if(!file.type.startsWith("image/")||file.size>2*1024*1024){app.toast("Chọn ảnh tối đa 2 MB, định dạng JPG, PNG hoặc WebP.");event.target.value="";return;}
      const reader=new FileReader();reader.onload=function(){pendingImageData=String(reader.result||"");const preview=$("#adminImagePreview");if(preview)preview.src=pendingImageData;};reader.readAsDataURL(file);
    }
    if(event.target.id==="reportPeriod")showAdmin("reports",null,event.target.value);
  }
  function init(){
    updateAccountButton();renderAccountPopover(currentUser?"account":"login");
    $("#accountButton").addEventListener("click",function(){if($("#accountPopover").hidden)openAccountPopover();else closeAccountPopover();});
    $("#accountPopoverBody").addEventListener("click",handleAdminClick);
    $("#accountPopoverBody").addEventListener("submit",handleAuthSubmit);
    $("#modalBody").addEventListener("click",handleAdminClick);
    $("#modalBody").addEventListener("submit",handleAuthSubmit);
    $("#modalBody").addEventListener("change",handleAdminChange);
    document.addEventListener("click",function(event){const wrap=$("#accountWrap");const adminLaunch=event.target.closest&&event.target.closest("#adminButton");if(wrap&&!wrap.contains(event.target)&&!adminLaunch)closeAccountPopover();});
    $("#accountPopover").addEventListener("click",function(event){event.stopPropagation();});
    if(hasAdminSession())renderAccountPopover("account");
    app.setCategories&&app.setCategories(collection("categories").filter(row=>row.status!=="Tạm ẩn").map(row=>row.name));
    const savedNews=collection("news");if(app.setArticles)app.setArticles(savedNews.filter(row=>row.status==="Đã đăng"));
  }
  window.MocAnAdmin={open:open,logout:function(){setSession(null);},currentUser:function(){return currentUser;}};
  init();
})();
