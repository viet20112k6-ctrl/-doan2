/* ==========================================================================
   MỘC AN FURNITURE - SHARED UI (Header, Footer, Toast)
   ========================================================================== */

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = 'toast' + (type === 'error' ? ' toast-error' : '');
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    el.style.transition = 'all 0.25s';
    setTimeout(() => el.remove(), 260);
  }, 2800);
}

function renderHeader(activePage = '') {
  const headerEl = document.getElementById('site-header');
  if (!headerEl) return;

  const user = DB.getSession();
  const cartItems = DB.getCurrentCart();
  const totalQty = cartItems.reduce((sum, item) => sum + item.SoLuong, 0);

  const accountHTML = user
    ? `
      <a href="orders.html" class="hide-xs">Đơn hàng</a>
      <span class="user-pill" title="${escapeHTML(user.Email)}">👤 ${escapeHTML(user.HoTen.split(' ').slice(-2).join(' '))}</span>
      <a href="#" id="btn-logout-user" style="color:var(--terracotta);font-size:0.84rem;">Đăng xuất</a>
    `
    : `
      <a href="auth.html">Đăng nhập</a>
      <span style="color:var(--border)">|</span>
      <a href="auth.html#register" class="hide-xs">Đăng ký</a>
    `;

  headerEl.className = 'site-header';
  headerEl.innerHTML = `
    <div class="container header-inner">
      <a href="index.html" class="brand-logo">
        <span class="brand-mark">M</span>
        <div>
          <span class="brand-name">Mộc An</span>
          <span class="brand-sub">Nội thất tối giản</span>
        </div>
      </a>

      <nav class="main-nav" id="main-nav">
        <a href="products.html" class="${activePage === 'products' ? 'active' : ''}">Sản phẩm</a>
        <a href="products.html?filter=new" class="${activePage === 'new' ? 'active' : ''}">Hàng mới</a>
        <a href="index.html#cau-chuyen">Câu chuyện</a>
        <a href="index.html#showroom">Cửa hàng</a>
        ${user ? `<a href="orders.html" class="${activePage === 'orders' ? 'active' : ''}">Đơn hàng</a>` : ''}
      </nav>

      <form class="header-search" id="header-search-form">
        <input type="text" id="header-search-input" placeholder="Tìm sofa, bàn ăn, giường..." aria-label="Tìm kiếm sản phẩm">
        <button type="submit" aria-label="Tìm kiếm">🔍</button>
      </form>

      <div class="header-actions">
        <div class="account-links">${accountHTML}</div>
        <a href="cart.html" class="cart-btn" aria-label="Giỏ hàng">
          🛒 <span class="hide-xs">Giỏ</span>
          <span class="cart-badge" id="header-cart-badge">${totalQty}</span>
        </a>
        <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Mở menu">☰</button>
      </div>
    </div>
  `;

  const searchForm = document.getElementById('header-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('header-search-input').value.trim();
      window.location.href = `products.html?q=${encodeURIComponent(q)}`;
    });
  }

  const menuBtn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('main-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
  }

  const logoutBtn = document.getElementById('btn-logout-user');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      DB.clearSession();
      showToast('Đã đăng xuất tài khoản.');
      setTimeout(() => window.location.href = 'index.html', 400);
    });
  }
}

function updateCartBadge() {
  const badge = document.getElementById('header-cart-badge');
  if (!badge) return;
  const cartItems = DB.getCurrentCart();
  badge.textContent = cartItems.reduce((sum, item) => sum + item.SoLuong, 0);
}

function renderFooter() {
  const footerEl = document.getElementById('site-footer');
  if (!footerEl) return;
  footerEl.className = 'site-footer';
  footerEl.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <h4>Nội thất Mộc An</h4>
          <p style="font-size:0.9rem;line-height:1.7;opacity:0.85;">
            Kiến tạo không gian sống tối giản, ấm áp và bền vững từ vật liệu gỗ tự nhiên chọn lọc.
          </p>
        </div>
        <div>
          <h4>Danh mục</h4>
          <ul>
            <li><a href="products.html?cat=DM01">Phòng khách</a></li>
            <li><a href="products.html?cat=DM02">Phòng ngủ</a></li>
            <li><a href="products.html?cat=DM03">Phòng ăn</a></li>
            <li><a href="products.html?cat=DM04">Phòng làm việc</a></li>
          </ul>
        </div>
        <div>
          <h4>Hỗ trợ khách hàng</h4>
          <ul>
            <li><a href="orders.html">Tra cứu & theo dõi đơn hàng</a></li>
            <li><a href="cart.html">Giỏ hàng của tôi</a></li>
            <li><a href="auth.html">Tài khoản thành viên</a></li>
            <li><a href="admin.html" style="color:#e6b89c;font-weight:500;">⚙ Khu vực Quản trị (Admin)</a></li>
          </ul>
        </div>
        <div id="showroom">
          <h4>Showroom & Liên hệ</h4>
          <ul>
            <li>📍 128 Nguyễn Văn Linh, Mỹ Hào, Hưng Yên</li>
            <li>📞 Hotline: 0988 123 456 (8:00 – 21:00)</li>
            <li>✉ Email: cskh@mocan.vn</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Nội thất Mộc An – Đồ án 2: Xây dựng Website bán đồ nội thất.</span>
        <span>Sinh viên thực hiện: Nguyễn Công Việt – Lớp 12524W.2</span>
      </div>
    </div>
  `;
}

// Tạo thẻ sản phẩm dùng chung
function buildProductCardHTML(sp) {
  const isOut = sp.SoLuongTon <= 0;
  const hasSale = sp.GiaCu && sp.GiaCu > sp.Gia;
  return `
    <article class="product-card">
      <a href="product-detail.html?id=${encodeURIComponent(sp.MaSP)}" class="product-thumb">
        <img src="${escapeHTML(safeImg(sp.HinhAnh))}" alt="${escapeHTML(sp.TenSP)}" loading="lazy" onerror="this.src='${FALLBACK_IMG}'">
        <div class="product-badges">
          ${isOut ? '<span class="badge badge-out">Hết hàng</span>' : ''}
          ${!isOut && hasSale ? '<span class="badge badge-sale">Ưu đãi</span>' : ''}
          ${!isOut && sp.MoiVe ? '<span class="badge badge-new">Mới về</span>' : ''}
        </div>
      </a>
      <div class="product-body">
        <div class="product-cat">${escapeHTML(getCategoryName(sp.MaDM))}</div>
        <a href="product-detail.html?id=${encodeURIComponent(sp.MaSP)}" class="product-title">${escapeHTML(sp.TenSP)}</a>
        <div class="product-meta">${escapeHTML(sp.ChatLieu || '')}</div>
        <div class="product-price-row">
          <span class="price-current">${formatPrice(sp.Gia)}</span>
          ${hasSale ? `<span class="price-old">${formatPrice(sp.GiaCu)}</span>` : ''}
        </div>
        <div class="product-card-actions">
          <a href="product-detail.html?id=${encodeURIComponent(sp.MaSP)}" class="btn btn-outline">Chi tiết</a>
          <button class="btn btn-accent" ${isOut ? 'disabled' : ''} onclick="quickAddToCart('${escapeHTML(sp.MaSP)}')">
            ${isOut ? 'Hết hàng' : '+ Giỏ hàng'}
          </button>
        </div>
      </div>
    </article>
  `;
}

// ND06: Thêm vào giỏ hàng nhanh (hỗ trợ cả khách vãng lai và thành viên)
function quickAddToCart(maSP, qty = 1) {
  const sp = DB.getProducts().find(p => p.MaSP === maSP);
  if (!sp || sp.SoLuongTon <= 0) {
    showToast('Sản phẩm hiện đã hết hàng.', 'error');
    return;
  }

  const cart = DB.getCurrentCart();
  const existing = cart.find(c => c.MaSP === maSP);
  if (existing) {
    if (existing.SoLuong + qty > sp.SoLuongTon) {
      existing.SoLuong = sp.SoLuongTon;
      DB.saveCurrentCart(cart);
      updateCartBadge();
      showToast(`Đã đạt số lượng tồn tối đa (${sp.SoLuongTon} sản phẩm).`, 'error');
      return;
    }
    existing.SoLuong += qty;
  } else {
    cart.push({ MaSP: maSP, SoLuong: Math.min(qty, sp.SoLuongTon) });
  }
  DB.saveCurrentCart(cart);
  updateCartBadge();
  showToast(`Đã thêm "${sp.TenSP}" vào giỏ hàng!`);
}
