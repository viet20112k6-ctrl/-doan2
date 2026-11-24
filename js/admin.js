/* ==========================================================================
   MỘC AN FURNITURE - ADMIN CONTROLLERS (QT01 -> QT06)
   ========================================================================== */

let currentTab = 'dashboard';
let selectedOrderId = null;
let selectedCustomerId = null;

function initAdminPage() {
  const admin = DB.getAdminSession();
  const loginWrap = document.getElementById('admin-login-wrap');
  const shellWrap = document.getElementById('admin-shell');

  if (!admin) {
    loginWrap.style.display = 'grid';
    shellWrap.style.display = 'none';
    bindAdminLogin();
  } else {
    loginWrap.style.display = 'none';
    shellWrap.style.display = 'grid';
    document.getElementById('admin-user-name').textContent = admin.HoTen;
    bindAdminNav();
    switchAdminTab(currentTab);
  }
}

/* ---------- QT01: ĐĂNG NHẬP QUẢN TRỊ ---------- */
function bindAdminLogin() {
  const form = document.getElementById('admin-login-form');
  const errEl = document.getElementById('admin-login-error');
  if (form.dataset.bound) return;
  form.dataset.bound = '1';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errEl.style.display = 'none';
    const email = document.getElementById('admin-email').value.trim().toLowerCase();
    const pass = document.getElementById('admin-pass').value;

    if (!email || !pass) {
      errEl.textContent = 'Vui lòng nhập đầy đủ email và mật khẩu quản trị.';
      errEl.style.display = 'block';
      return;
    }
    const user = DB.getUsers().find(u => u.Email.toLowerCase() === email && u.MatKhau === pass && u.VaiTro === 'admin');
    if (!user) {
      errEl.textContent = 'Thông tin đăng nhập quản trị không chính xác.';
      errEl.style.display = 'block';
      return;
    }
    DB.setAdminSession(user);
    showToast('Đăng nhập quản trị thành công!');
    initAdminPage();
  });
}

function bindAdminNav() {
  const navBtns = document.querySelectorAll('.admin-nav button[data-tab]');
  navBtns.forEach(btn => {
    btn.onclick = () => switchAdminTab(btn.dataset.tab);
  });
  document.getElementById('btn-admin-logout').onclick = () => {
    DB.clearAdminSession();
    showToast('Đã đăng xuất trang quản trị.');
    initAdminPage();
  };
}

function switchAdminTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.admin-nav button[data-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  const content = document.getElementById('admin-content');
  if (tab === 'dashboard') renderDashboard(content);
  else if (tab === 'categories') renderCategoriesTab(content);
  else if (tab === 'products') renderProductsTab(content);
  else if (tab === 'orders') renderOrdersTab(content);
  else if (tab === 'customers') renderCustomersTab(content);
  else if (tab === 'stats') renderStatsTab(content);
}

/* ---------- BẢNG ĐIỀU KHIỂN (Dashboard) ---------- */
function renderDashboard(el) {
  const products = DB.getProducts();
  const orders = DB.getOrders();
  const customers = DB.getUsers().filter(u => u.VaiTro === 'customer');
  const pendingCount = orders.filter(o => o.TrangThai === 'Chờ duyệt').length;
  const revenue = orders.filter(o => o.TrangThai !== 'Đã hủy').reduce((s, o) => s + o.TongTien, 0);
  const lowStock = products.filter(p => p.SoLuongTon <= 3);

  el.innerHTML = `
    <div class="admin-topbar">
      <div>
        <h1>Bảng điều khiển quản trị</h1>
        <p style="color:var(--text-muted);font-size:0.92rem;">Tổng quan hoạt động kinh doanh Nội thất Mộc An</p>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-label">Tổng số sản phẩm</div><div class="kpi-value">${products.length}</div></div>
      <div class="kpi-card accent"><div class="kpi-label">Đơn chờ duyệt</div><div class="kpi-value">${pendingCount}</div></div>
      <div class="kpi-card"><div class="kpi-label">Doanh thu (trừ đơn hủy)</div><div class="kpi-value" style="font-size:1.35rem;">${formatPrice(revenue)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Khách hàng</div><div class="kpi-value">${customers.length}</div></div>
    </div>

    <div class="admin-two-col">
      <div class="admin-panel">
        <h3>Đơn hàng gần đây</h3>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
            <tbody>
              ${orders.slice(0, 6).map(o => `
                <tr>
                  <td><strong>${escapeHTML(o.MaDon)}</strong></td>
                  <td>${escapeHTML(o.HoTen)}</td>
                  <td>${formatPrice(o.TongTien)}</td>
                  <td><span class="status-badge ${getStatusClass(o.TrangThai)}">${escapeHTML(o.TrangThai)}</span></td>
                </tr>`).join('') || '<tr><td colspan="4">Chưa có đơn hàng</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <div class="admin-panel">
        <h3>Cảnh báo sắp hết hàng (tồn ≤ 3)</h3>
        ${lowStock.length === 0 ? '<p style="color:var(--text-muted)">Tất cả sản phẩm đều đủ tồn kho.</p>' : `
          <ul style="list-style:none;display:flex;flex-direction:column;gap:10px;">
            ${lowStock.map(p => `
              <li style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg-page);border-radius:6px;font-size:0.9rem;">
                <div>
                  <strong>${escapeHTML(p.TenSP)}</strong>
                  <div style="font-size:0.8rem;color:var(--text-muted);">${escapeHTML(p.MaSP)} · ${escapeHTML(getCategoryName(p.MaDM))}</div>
                </div>
                <span class="status-badge ${p.SoLuongTon === 0 ? 'st-cancel' : 'st-pending'}">Tồn: ${p.SoLuongTon}</span>
              </li>`).join('')}
          </ul>`}
      </div>
    </div>
  `;
}

/* ---------- QT02: QUẢN LÝ DANH MỤC ---------- */
function renderCategoriesTab(el) {
  const cats = DB.getCategories();
  const prods = DB.getProducts();

  el.innerHTML = `
    <div class="admin-topbar">
      <h1>Quản lý danh mục</h1>
    </div>

    <div class="admin-two-col">
      <div class="admin-panel">
        <h3>Danh sách danh mục</h3>
        <div id="cat-list-alert"></div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Mã</th><th>Tên danh mục</th><th>Số SP</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              ${cats.map(c => {
                const cnt = prods.filter(p => p.MaDM === c.MaDM).length;
                return `
                  <tr>
                    <td><strong>${escapeHTML(c.MaDM)}</strong></td>
                    <td>${escapeHTML(c.TenDM)}<div style="font-size:0.78rem;color:var(--text-muted);">${escapeHTML(c.MoTa)}</div></td>
                    <td>${cnt}</td>
                    <td><span class="status-badge ${c.TrangThai === 'Ẩn' ? 'st-cancel' : 'st-done'}">${escapeHTML(c.TrangThai)}</span></td>
                    <td style="white-space:nowrap;">
                      <button class="btn btn-sm btn-outline" onclick="editCategory('${escapeHTML(c.MaDM)}')">Sửa</button>
                      <button class="btn btn-sm btn-danger" onclick="deleteCategory('${escapeHTML(c.MaDM)}')">Xóa</button>
                    </td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="admin-panel">
        <h3 id="cat-form-title">Thêm danh mục mới</h3>
        <div id="cat-form-error" class="alert alert-error" style="display:none;"></div>
        <form id="cat-form">
          <input type="hidden" id="cat-id">
          <div class="form-group">
            <label>Tên danh mục *</label>
            <input type="text" id="cat-name" class="form-control" placeholder="Ví dụ: Đồ trang trí" required>
          </div>
          <div class="form-group">
            <label>Mô tả</label>
            <textarea id="cat-desc" class="form-control" rows="3" placeholder="Mô tả ngắn về không gian/danh mục..."></textarea>
          </div>
          <div class="form-group">
            <label>Trạng thái</label>
            <select id="cat-status" class="form-control">
              <option value="Hiển thị">Hiển thị</option>
              <option value="Ẩn">Ẩn</option>
            </select>
          </div>
          <div style="display:flex;gap:8px;">
            <button type="submit" class="btn btn-primary" style="flex:1;">Lưu danh mục</button>
            <button type="button" class="btn btn-outline" id="cat-reset-btn">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('cat-reset-btn').onclick = () => {
    document.getElementById('cat-form').reset();
    document.getElementById('cat-id').value = '';
    document.getElementById('cat-form-title').textContent = 'Thêm danh mục mới';
    document.getElementById('cat-form-error').style.display = 'none';
  };

  document.getElementById('cat-form').onsubmit = (e) => {
    e.preventDefault();
    const errEl = document.getElementById('cat-form-error');
    errEl.style.display = 'none';

    const id = document.getElementById('cat-id').value;
    const ten = document.getElementById('cat-name').value.trim();
    const moTa = document.getElementById('cat-desc').value.trim();
    const trangThai = document.getElementById('cat-status').value;

    if (!ten) {
      errEl.textContent = 'Tên danh mục không được để trống.';
      errEl.style.display = 'block';
      return;
    }

    const list = DB.getCategories();
    const dup = list.some(c => c.TenDM.toLowerCase() === ten.toLowerCase() && c.MaDM !== id);
    if (dup) {
      errEl.textContent = 'Tên danh mục đã tồn tại. Vui lòng chọn tên khác.';
      errEl.style.display = 'block';
      return;
    }

    if (id) {
      const target = list.find(c => c.MaDM === id);
      if (target) {
        target.TenDM = ten;
        target.MoTa = moTa;
        target.TrangThai = trangThai;
      }
      showToast('Đã cập nhật danh mục!');
    } else {
      const newId = 'DM' + String(list.length + 1).padStart(2, '0') + (list.some(c => c.MaDM === 'DM' + String(list.length + 1).padStart(2, '0')) ? Math.floor(Math.random() * 90 + 10) : '');
      list.push({ MaDM: newId, TenDM: ten, MoTa: moTa, TrangThai: trangThai });
      showToast('Đã thêm danh mục mới!');
    }
    DB.saveCategories(list);
    renderCategoriesTab(el);
  };

  window.editCategory = (maDM) => {
    const dm = DB.getCategories().find(c => c.MaDM === maDM);
    if (!dm) return;
    document.getElementById('cat-id').value = dm.MaDM;
    document.getElementById('cat-name').value = dm.TenDM;
    document.getElementById('cat-desc').value = dm.MoTa || '';
    document.getElementById('cat-status').value = dm.TrangThai || 'Hiển thị';
    document.getElementById('cat-form-title').textContent = `Chỉnh sửa danh mục ${dm.MaDM}`;
    document.getElementById('cat-form-error').style.display = 'none';
  };

  window.deleteCategory = (maDM) => {
    const cnt = DB.getProducts().filter(p => p.MaDM === maDM).length;
    const alertBox = document.getElementById('cat-list-alert');
    if (cnt > 0) {
      alertBox.innerHTML = `<div class="alert alert-error">Không thể xóa danh mục <strong>${escapeHTML(maDM)}</strong> vì đang có ${cnt} sản phẩm thuộc danh mục này.</div>`;
      showToast('Không thể xóa danh mục còn sản phẩm!', 'error');
      return;
    }
    if (!confirm(`Xác nhận xóa danh mục ${maDM}?`)) return;
    DB.saveCategories(DB.getCategories().filter(c => c.MaDM !== maDM));
    showToast('Đã xóa danh mục.');
    renderCategoriesTab(el);
  };
}

/* ---------- QT03: QUẢN LÝ SẢN PHẨM ---------- */
function renderProductsTab(el) {
  const cats = DB.getCategories();

  el.innerHTML = `
    <div class="admin-topbar">
      <h1>Quản lý sản phẩm</h1>
      <button class="btn btn-accent" id="btn-open-add-prod">+ Thêm sản phẩm mới</button>
    </div>

    <div class="admin-panel">
      <div class="admin-toolbar">
        <input type="text" id="adm-prod-search" class="form-control" style="max-width:280px;" placeholder="Tìm theo tên hoặc mã SP...">
        <select id="adm-prod-cat" class="form-control" style="max-width:220px;">
          <option value="">Tất cả danh mục</option>
          ${cats.map(c => `<option value="${escapeHTML(c.MaDM)}">${escapeHTML(c.TenDM)}</option>`).join('')}
        </select>
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>Ảnh</th><th>Mã</th><th>Tên sản phẩm</th><th>Danh mục</th><th>Giá bán</th><th>Tồn kho</th><th>Thao tác</th></tr></thead>
          <tbody id="adm-prod-tbody"></tbody>
        </table>
      </div>
    </div>
  `;

  function drawTable() {
    const kw = document.getElementById('adm-prod-search').value.trim().toLowerCase();
    const cat = document.getElementById('adm-prod-cat').value;
    let list = DB.getProducts();
    if (cat) list = list.filter(p => p.MaDM === cat);
    if (kw) list = list.filter(p => p.TenSP.toLowerCase().includes(kw) || p.MaSP.toLowerCase().includes(kw));

    const tbody = document.getElementById('adm-prod-tbody');
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">Không tìm thấy sản phẩm nào.</td></tr>';
      return;
    }
    tbody.innerHTML = list.map(p => `
      <tr>
        <td><img src="${escapeHTML(safeImg(p.HinhAnh))}" style="width:56px;height:42px;object-fit:cover;border-radius:6px;" onerror="this.src='${FALLBACK_IMG}'"></td>
        <td><strong>${escapeHTML(p.MaSP)}</strong></td>
        <td>${escapeHTML(p.TenSP)}</td>
        <td>${escapeHTML(getCategoryName(p.MaDM))}</td>
        <td style="color:var(--terracotta);font-weight:600;">${formatPrice(p.Gia)}</td>
        <td><span class="status-badge ${p.SoLuongTon === 0 ? 'st-cancel' : (p.SoLuongTon <= 3 ? 'st-pending' : 'st-done')}">${p.SoLuongTon}</span></td>
        <td style="white-space:nowrap;">
          <button class="btn btn-sm btn-outline" onclick="openProductModal('${escapeHTML(p.MaSP)}')">Sửa</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProduct('${escapeHTML(p.MaSP)}')">Xóa</button>
        </td>
      </tr>
    `).join('');
  }

  document.getElementById('adm-prod-search').oninput = drawTable;
  document.getElementById('adm-prod-cat').onchange = drawTable;
  document.getElementById('btn-open-add-prod').onclick = () => openProductModal(null);

  window.deleteProduct = (maSP) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${maSP}?`)) return;
    DB.saveProducts(DB.getProducts().filter(p => p.MaSP !== maSP));
    showToast(`Đã xóa sản phẩm ${maSP}.`);
    drawTable();
  };

  window.openProductModal = (maSP) => {
    const modal = document.getElementById('product-modal');
    const sp = maSP ? DB.getProducts().find(p => p.MaSP === maSP) : null;
    const catSelect = document.getElementById('pm-cat');
    catSelect.innerHTML = DB.getCategories().map(c => `<option value="${escapeHTML(c.MaDM)}">${escapeHTML(c.TenDM)}</option>`).join('');

    document.getElementById('pm-title').textContent = sp ? `Chỉnh sửa sản phẩm ${sp.MaSP}` : 'Thêm sản phẩm mới';
    document.getElementById('pm-error').style.display = 'none';
    document.getElementById('pm-id').value = sp ? sp.MaSP : '';
    document.getElementById('pm-name').value = sp ? sp.TenSP : '';
    catSelect.value = sp ? sp.MaDM : (DB.getCategories()[0]?.MaDM || '');
    document.getElementById('pm-price').value = sp ? sp.Gia : '';
    document.getElementById('pm-old-price').value = sp && sp.GiaCu ? sp.GiaCu : '';
    document.getElementById('pm-stock').value = sp ? sp.SoLuongTon : 5;
    document.getElementById('pm-material').value = sp ? (sp.ChatLieu || '') : '';
    document.getElementById('pm-size').value = sp ? (sp.KichThuoc || '') : '';
    document.getElementById('pm-color').value = sp ? (sp.MauSac || '') : '';
    document.getElementById('pm-img-url').value = sp ? (sp.HinhAnh || '') : '';
    document.getElementById('pm-desc').value = sp ? (sp.MoTa || '') : '';
    document.getElementById('pm-new').checked = sp ? !!sp.MoiVe : true;
    document.getElementById('pm-best').checked = sp ? !!sp.BanChay : false;
    document.getElementById('pm-img-file').value = '';

    modal.classList.add('open');
  };

  // Upload file ảnh chuyển DataURL
  const fileInput = document.getElementById('pm-img-file');
  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById('pm-img-url').value = reader.result;
      showToast('Đã tải ảnh lên biểu mẫu!');
    };
    reader.readAsDataURL(file);
  };

  document.getElementById('product-modal-form').onsubmit = (e) => {
    e.preventDefault();
    const errEl = document.getElementById('pm-error');
    errEl.style.display = 'none';

    const id = document.getElementById('pm-id').value;
    const ten = document.getElementById('pm-name').value.trim();
    const maDM = document.getElementById('pm-cat').value;
    const gia = parseInt(document.getElementById('pm-price').value, 10);
    const giaCuRaw = document.getElementById('pm-old-price').value.trim();
    const giaCu = giaCuRaw ? parseInt(giaCuRaw, 10) : null;
    const ton = parseInt(document.getElementById('pm-stock').value, 10);
    const chatLieu = document.getElementById('pm-material').value.trim();
    const kichThuoc = document.getElementById('pm-size').value.trim();
    const mauSac = document.getElementById('pm-color').value.trim();
    const hinhAnh = document.getElementById('pm-img-url').value.trim() || FALLBACK_IMG;
    const moTa = document.getElementById('pm-desc').value.trim();
    const moiVe = document.getElementById('pm-new').checked;
    const banChay = document.getElementById('pm-best').checked;

    if (!ten || !maDM || isNaN(gia) || gia <= 0 || isNaN(ton) || ton < 0) {
      errEl.textContent = 'Vui lòng nhập đầy đủ tên, danh mục, giá bán (> 0) và số lượng tồn (≥ 0).';
      errEl.style.display = 'block';
      return;
    }

    const list = DB.getProducts();
    if (id) {
      const target = list.find(p => p.MaSP === id);
      if (target) {
        Object.assign(target, { TenSP: ten, MaDM: maDM, Gia: gia, GiaCu: giaCu, SoLuongTon: ton, ChatLieu: chatLieu, KichThuoc: kichThuoc, MauSac: mauSac, HinhAnh: hinhAnh, HinhAnhPhu: [hinhAnh], MoTa: moTa, MoiVe: moiVe, BanChay: banChay });
      }
      showToast('Đã cập nhật thông tin sản phẩm!');
    } else {
      const newId = 'SP' + String(list.length + 1).padStart(3, '0') + Math.floor(Math.random() * 90 + 10);
      list.unshift({ MaSP: newId, MaDM: maDM, TenSP: ten, Gia: gia, GiaCu: giaCu, SoLuongTon: ton, ChatLieu: chatLieu, KichThuoc: kichThuoc, MauSac: mauSac, HinhAnh: hinhAnh, HinhAnhPhu: [hinhAnh], MoTa: moTa, MoiVe: moiVe, BanChay: banChay });
      showToast('Đã thêm sản phẩm mới!');
    }
    DB.saveProducts(list);
    document.getElementById('product-modal').classList.remove('open');
    drawTable();
  };

  drawTable();
}

/* ---------- QT04: QUẢN LÝ ĐƠN HÀNG ---------- */
function renderOrdersTab(el) {
  el.innerHTML = `
    <div class="admin-topbar">
      <h1>Quản lý đơn hàng</h1>
    </div>

    <div class="admin-panel">
      <div class="admin-toolbar">
        <div class="filter-tabs" id="ord-status-tabs">
          <button class="filter-pill active" data-st="">Tất cả</button>
          <button class="filter-pill" data-st="Chờ duyệt">Chờ duyệt</button>
          <button class="filter-pill" data-st="Đang giao">Đang giao</button>
          <button class="filter-pill" data-st="Hoàn thành">Hoàn thành</button>
          <button class="filter-pill" data-st="Đã hủy">Đã hủy</button>
        </div>
        <input type="text" id="ord-search" class="form-control" style="max-width:240px;" placeholder="Tìm theo mã đơn...">
      </div>

      <div class="admin-two-col">
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
            <tbody id="adm-ord-tbody"></tbody>
          </table>
        </div>
        <div id="adm-ord-detail" class="card-box" style="padding:20px;"></div>
      </div>
    </div>
  `;

  let statusFilter = '';

  function drawOrders() {
    const kw = document.getElementById('ord-search').value.trim().toLowerCase();
    let list = DB.getOrders();
    if (statusFilter) list = list.filter(o => o.TrangThai === statusFilter);
    if (kw) list = list.filter(o => o.MaDon.toLowerCase().includes(kw) || o.HoTen.toLowerCase().includes(kw));

    const tbody = document.getElementById('adm-ord-tbody');
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Không có đơn hàng phù hợp.</td></tr>';
      document.getElementById('adm-ord-detail').innerHTML = '<p style="color:var(--text-muted)">Chọn một đơn hàng để xem chi tiết.</p>';
      return;
    }

    if (!selectedOrderId || !list.some(o => o.MaDon === selectedOrderId)) {
      selectedOrderId = list[0].MaDon;
    }

    tbody.innerHTML = list.map(o => `
      <tr style="cursor:pointer;${o.MaDon === selectedOrderId ? 'background:var(--olive-light);' : ''}" onclick="selectAdminOrder('${escapeHTML(o.MaDon)}')">
        <td><strong>${escapeHTML(o.MaDon)}</strong></td>
        <td>${escapeHTML(o.HoTen)}</td>
        <td>${formatDate(o.NgayDat)}</td>
        <td style="font-weight:600;color:var(--terracotta);">${formatPrice(o.TongTien)}</td>
        <td><span class="status-badge ${getStatusClass(o.TrangThai)}">${escapeHTML(o.TrangThai)}</span></td>
      </tr>
    `).join('');

    const ord = list.find(o => o.MaDon === selectedOrderId);
    const isLocked = ord.TrangThai === 'Hoàn thành' || ord.TrangThai === 'Đã hủy';

    document.getElementById('adm-ord-detail').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3>Đơn ${escapeHTML(ord.MaDon)}</h3>
        <span class="status-badge ${getStatusClass(ord.TrangThai)}">${escapeHTML(ord.TrangThai)}</span>
      </div>
      <div style="font-size:0.88rem;background:var(--bg-page);padding:12px;border-radius:6px;margin-bottom:14px;">
        <div><strong>Khách hàng:</strong> ${escapeHTML(ord.HoTen)} (${escapeHTML(ord.SoDienThoai)})</div>
        ${ord.Email ? `<div><strong>Email:</strong> ${escapeHTML(ord.Email)}</div>` : ''}
        <div><strong>Địa chỉ:</strong> ${escapeHTML(ord.DiaChi)}</div>
        <div><strong>Thanh toán:</strong> ${escapeHTML(ord.PhuongThucTT || 'COD')} ${ord.TrangThaiTT ? `(${escapeHTML(ord.TrangThaiTT)})` : ''}</div>
        ${ord.GhiChu ? `<div><strong>Ghi chú:</strong> ${escapeHTML(ord.GhiChu)}</div>` : ''}
        ${ord.LyDoHuy ? `<div style="color:#dc2626;"><strong>Lý do hủy:</strong> ${escapeHTML(ord.LyDoHuy)}</div>` : ''}
      </div>
      <div style="margin-bottom:14px;">
        ${ord.ChiTiet.map(ct => `
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:0.88rem;">
            <span>${escapeHTML(ct.TenSP)} × ${ct.SoLuong}</span>
            <strong>${formatPrice(ct.DonGia * ct.SoLuong)}</strong>
          </div>`).join('')}
      </div>
      <div class="summary-total" style="padding:8px 0 14px;"><span>Tổng tiền</span><span>${formatPrice(ord.TongTien)}</span></div>
      ${isLocked
        ? `<div class="alert alert-info" style="margin-bottom:0;">Đơn hàng đã <strong>${escapeHTML(ord.TrangThai)}</strong>, không thể thay đổi trạng thái.</div>`
        : `
          <div class="form-group">
            <label>Cập nhật trạng thái mới</label>
            <select id="ord-new-status" class="form-control">
              <option value="Chờ duyệt" ${ord.TrangThai === 'Chờ duyệt' ? 'selected' : ''}>Chờ duyệt</option>
              <option value="Đang giao" ${ord.TrangThai === 'Đang giao' ? 'selected' : ''}>Đang giao</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>
          <button class="btn btn-primary" style="width:100%;" onclick="updateAdminOrderStatus('${escapeHTML(ord.MaDon)}')">Cập nhật trạng thái</button>
        `}
    `;
  }

  document.querySelectorAll('#ord-status-tabs .filter-pill').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#ord-status-tabs .filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      statusFilter = btn.dataset.st;
      drawOrders();
    };
  });
  document.getElementById('ord-search').oninput = drawOrders;

  window.selectAdminOrder = (maDon) => {
    selectedOrderId = maDon;
    drawOrders();
  };

  window.updateAdminOrderStatus = (maDon) => {
    const newSt = document.getElementById('ord-new-status').value;
    if (newSt === 'Đã hủy' && !confirm(`Xác nhận hủy đơn hàng ${maDon}?`)) return;

    const orders = DB.getOrders();
    const target = orders.find(o => o.MaDon === maDon);
    if (!target || target.TrangThai === 'Hoàn thành' || target.TrangThai === 'Đã hủy') {
      showToast('Không thể đổi trạng thái đơn đã hoàn thành hoặc đã hủy.', 'error');
      return;
    }

    if (newSt === 'Đã hủy') {
      const products = DB.getProducts();
      for (const ct of target.ChiTiet) {
        const sp = products.find(p => p.MaSP === ct.MaSP);
        if (sp) sp.SoLuongTon += ct.SoLuong;
      }
      DB.saveProducts(products);
    }

    target.TrangThai = newSt;
    DB.saveOrders(orders);
    showToast(`Đã cập nhật đơn ${maDon} sang "${newSt}".`);
    drawOrders();
  };

  drawOrders();
}

/* ---------- QT05: QUẢN LÝ TÀI KHOẢN KHÁCH HÀNG ---------- */
function renderCustomersTab(el) {
  el.innerHTML = `
    <div class="admin-topbar">
      <h1>Quản lý tài khoản khách hàng</h1>
    </div>

    <div class="admin-panel">
      <div class="admin-toolbar">
        <input type="text" id="cust-search" class="form-control" style="max-width:320px;" placeholder="Tìm theo họ tên hoặc email...">
      </div>
      <div class="admin-two-col">
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Mã TK</th><th>Họ tên</th><th>Email</th><th>Số đơn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody id="adm-cust-tbody"></tbody>
          </table>
        </div>
        <div id="adm-cust-detail" class="card-box" style="padding:20px;"></div>
      </div>
    </div>
  `;

  function drawCustomers() {
    const kw = document.getElementById('cust-search').value.trim().toLowerCase();
    const orders = DB.getOrders();
    let list = DB.getUsers().filter(u => u.VaiTro === 'customer');
    if (kw) list = list.filter(u => u.HoTen.toLowerCase().includes(kw) || u.Email.toLowerCase().includes(kw));

    const tbody = document.getElementById('adm-cust-tbody');
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">Không tìm thấy tài khoản khách hàng phù hợp.</td></tr>';
      document.getElementById('adm-cust-detail').innerHTML = '<p style="color:var(--text-muted)">Không có kết quả.</p>';
      return;
    }

    if (!selectedCustomerId || !list.some(u => u.MaTK === selectedCustomerId)) {
      selectedCustomerId = list[0].MaTK;
    }

    tbody.innerHTML = list.map(u => {
      const ordCount = orders.filter(o => o.MaTK === u.MaTK).length;
      const locked = u.TrangThai === 'Bị khóa';
      return `
        <tr style="cursor:pointer;${u.MaTK === selectedCustomerId ? 'background:var(--olive-light);' : ''}" onclick="selectCustomer('${escapeHTML(u.MaTK)}')">
          <td><strong>${escapeHTML(u.MaTK)}</strong></td>
          <td>${escapeHTML(u.HoTen)}</td>
          <td>${escapeHTML(u.Email)}</td>
          <td>${ordCount}</td>
          <td><span class="status-badge ${locked ? 'st-cancel' : 'st-done'}">${escapeHTML(u.TrangThai)}</span></td>
          <td>
            <button class="btn btn-sm ${locked ? 'btn-primary' : 'btn-danger'}" onclick="event.stopPropagation(); toggleLockCustomer('${escapeHTML(u.MaTK)}')">
              ${locked ? 'Mở khóa' : 'Khóa'}
            </button>
          </td>
        </tr>`;
    }).join('');

    const cust = list.find(u => u.MaTK === selectedCustomerId);
    const custOrders = orders.filter(o => o.MaTK === cust.MaTK);
    const locked = cust.TrangThai === 'Bị khóa';

    document.getElementById('adm-cust-detail').innerHTML = `
      <h3 style="margin-bottom:10px;">${escapeHTML(cust.HoTen)}</h3>
      <div style="font-size:0.9rem;margin-bottom:14px;background:var(--bg-page);padding:12px;border-radius:6px;">
        <div><strong>Mã TK:</strong> ${escapeHTML(cust.MaTK)}</div>
        <div><strong>Email:</strong> ${escapeHTML(cust.Email)}</div>
        <div><strong>SĐT:</strong> ${escapeHTML(cust.SoDienThoai || 'Chưa cập nhật')}</div>
        <div><strong>Trạng thái:</strong> <span class="status-badge ${locked ? 'st-cancel' : 'st-done'}">${escapeHTML(cust.TrangThai)}</span></div>
      </div>
      <h4 style="font-size:0.95rem;margin-bottom:8px;">Lịch sử đơn hàng (${custOrders.length})</h4>
      ${custOrders.length === 0 ? '<p style="font-size:0.86rem;color:var(--text-muted);">Khách hàng chưa đặt đơn nào.</p>' : `
        <ul style="list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">
          ${custOrders.map(o => `
            <li style="display:flex;justify-content:space-between;font-size:0.86rem;padding:8px;border:1px solid var(--border);border-radius:6px;">
              <span><strong>${escapeHTML(o.MaDon)}</strong> (${formatDate(o.NgayDat)})</span>
              <span>${formatPrice(o.TongTien)} · <span class="status-badge ${getStatusClass(o.TrangThai)}">${escapeHTML(o.TrangThai)}</span></span>
            </li>`).join('')}
        </ul>`}
      <button class="btn ${locked ? 'btn-primary' : 'btn-danger'}" style="width:100%;" onclick="toggleLockCustomer('${escapeHTML(cust.MaTK)}')">
        ${locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản khách hàng'}
      </button>
    `;
  }

  document.getElementById('cust-search').oninput = drawCustomers;

  window.selectCustomer = (maTK) => {
    selectedCustomerId = maTK;
    drawCustomers();
  };

  window.toggleLockCustomer = (maTK) => {
    const users = DB.getUsers();
    const target = users.find(u => u.MaTK === maTK);
    if (!target) return;
    const action = target.TrangThai === 'Bị khóa' ? 'mở khóa' : 'khóa';
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản ${target.Email}?`)) return;
    target.TrangThai = target.TrangThai === 'Bị khóa' ? 'Hoạt động' : 'Bị khóa';
    DB.saveUsers(users);
    showToast(`Đã ${action} tài khoản ${target.HoTen}.`);
    drawCustomers();
  };

  drawCustomers();
}

/* ---------- QT06: THỐNG KÊ - BÁO CÁO ---------- */
function renderStatsTab(el) {
  const today = new Date().toISOString().slice(0, 10);
  const firstDay = today.slice(0, 8) + '01';

  el.innerHTML = `
    <div class="admin-topbar">
      <h1>Thống kê – Báo cáo</h1>
    </div>

    <div class="admin-panel">
      <div class="admin-toolbar" style="justify-content:flex-start;">
        <div style="display:flex;align-items:center;gap:8px;">
          <label style="font-size:0.88rem;font-weight:500;">Từ ngày:</label>
          <input type="date" id="stat-from" class="form-control" style="width:auto;" value="${firstDay}">
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <label style="font-size:0.88rem;font-weight:500;">Đến ngày:</label>
          <input type="date" id="stat-to" class="form-control" style="width:auto;" value="${today}">
        </div>
        <button class="btn btn-primary" id="btn-run-stats">Xem thống kê</button>
      </div>
    </div>

    <div id="stats-result"></div>
  `;

  function runStats() {
    const fromVal = document.getElementById('stat-from').value;
    const toVal = document.getElementById('stat-to').value;
    const resEl = document.getElementById('stats-result');

    const orders = DB.getOrders().filter(o => {
      const d = o.NgayDat.slice(0, 10);
      return (!fromVal || d >= fromVal) && (!toVal || d <= toVal);
    });

    if (orders.length === 0) {
      resEl.innerHTML = `<div class="empty-state"><h3>Không có dữ liệu</h3><p>Không có đơn hàng nào trong khoảng thời gian đã chọn.</p></div>`;
      return;
    }

    const validOrders = orders.filter(o => o.TrangThai !== 'Đã hủy');
    const revenue = validOrders.reduce((s, o) => s + o.TongTien, 0);
    const doneCount = orders.filter(o => o.TrangThai === 'Hoàn thành').length;
    const customerCount = DB.getUsers().filter(u => u.VaiTro === 'customer').length;

    // Doanh thu theo ngày
    const byDate = {};
    validOrders.forEach(o => {
      const d = o.NgayDat.slice(0, 10);
      byDate[d] = (byDate[d] || 0) + o.TongTien;
    });
    const dateLabels = Object.keys(byDate).sort();

    // Sản phẩm bán chạy
    const prodMap = {};
    validOrders.forEach(o => {
      o.ChiTiet.forEach(ct => {
        if (!prodMap[ct.MaSP]) prodMap[ct.MaSP] = { MaSP: ct.MaSP, TenSP: ct.TenSP, SoLuong: 0, DoanhThu: 0 };
        prodMap[ct.MaSP].SoLuong += ct.SoLuong;
        prodMap[ct.MaSP].DoanhThu += ct.DonGia * ct.SoLuong;
      });
    });
    const topProducts = Object.values(prodMap).sort((a, b) => b.SoLuong - a.SoLuong);

    resEl.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-label">Số đơn hàng</div><div class="kpi-value">${orders.length}</div></div>
        <div class="kpi-card accent"><div class="kpi-label">Tổng doanh thu</div><div class="kpi-value" style="font-size:1.35rem;">${formatPrice(revenue)}</div></div>
        <div class="kpi-card"><div class="kpi-label">Đơn hoàn thành</div><div class="kpi-value">${doneCount}</div></div>
        <div class="kpi-card"><div class="kpi-label">Tổng khách hàng</div><div class="kpi-value">${customerCount}</div></div>
      </div>

      <div class="admin-two-col">
        <div class="admin-panel">
          <h3>Biểu đồ doanh thu theo ngày</h3>
          <div class="chart-wrap">
            <canvas id="revenue-chart" class="chart-canvas" width="600" height="280"></canvas>
          </div>
        </div>

        <div class="admin-panel">
          <h3>Sản phẩm bán chạy nhất</h3>
          <div class="table-scroll">
            <table class="data-table">
              <thead><tr><th>Sản phẩm</th><th>Đã bán</th><th>Doanh thu</th></tr></thead>
              <tbody>
                ${topProducts.map(p => `
                  <tr>
                    <td>${escapeHTML(p.TenSP)}</td>
                    <td><strong>${p.SoLuong}</strong></td>
                    <td style="color:var(--terracotta);font-weight:600;">${formatPrice(p.DoanhThu)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    drawBarChart('revenue-chart', dateLabels, dateLabels.map(d => byDate[d]));
  }

  document.getElementById('btn-run-stats').onclick = runStats;
  runStats();
}

// Vẽ biểu đồ cột thuần bằng HTML5 Canvas (không cần thư viện ngoài)
function drawBarChart(canvasId, labels, values) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !labels.length) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const padL = 70, padR = 20, padT = 28, padB = 46;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const maxVal = Math.max(...values, 1);

  // Lưới ngang
  ctx.strokeStyle = '#e3e0d5';
  ctx.fillStyle = '#6b7066';
  ctx.font = '11px DM Sans, sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const y = padT + chartH - (chartH * i / 4);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - padR, y);
    ctx.stroke();
    const valM = ((maxVal * i / 4) / 1000000).toFixed(1) + 'tr';
    ctx.fillText(valM, padL - 8, y + 4);
  }

  // Các cột
  const slotW = chartW / labels.length;
  const barW = Math.min(48, slotW * 0.55);

  labels.forEach((lbl, idx) => {
    const val = values[idx];
    const barH = (val / maxVal) * chartH;
    const x = padL + idx * slotW + (slotW - barW) / 2;
    const y = padT + chartH - barH;

    ctx.fillStyle = '#52614b';
    ctx.fillRect(x, y, barW, barH);

    // Giá trị trên đầu cột
    ctx.fillStyle = '#b4684b';
    ctx.font = 'bold 11px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((val / 1000000).toFixed(1) + 'tr', x + barW / 2, y - 6);

    // Nhãn ngày
    ctx.fillStyle = '#2b2e28';
    ctx.font = '11px DM Sans, sans-serif';
    ctx.fillText(lbl.slice(5), x + barW / 2, h - 18);
  });
}
