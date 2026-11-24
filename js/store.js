/* ==========================================================================
   MỘC AN FURNITURE - STOREFRONT CONTROLLERS (ND01 -> ND08)
   ========================================================================== */

/* ---------- 1. TRANG CHỦ (index.html) ---------- */
function initHomePage() {
  renderHeader('home');
  renderFooter();

  const catGrid = document.getElementById('home-category-grid');
  const prodGrid = document.getElementById('home-product-grid');
  const catSelect = document.getElementById('home-cat-filter');
  const pills = document.querySelectorAll('.filter-pill[data-group]');

  const categories = DB.getCategories().filter(c => c.TrangThai !== 'Ẩn');
  const products = DB.getProducts();

  if (catGrid) {
    catGrid.innerHTML = categories.map(c => {
      const count = products.filter(p => p.MaDM === c.MaDM).length;
      return `
        <a href="products.html?cat=${encodeURIComponent(c.MaDM)}" class="category-card">
          <h3>${escapeHTML(c.TenDM)}</h3>
          <p>${escapeHTML(c.MoTa)}</p>
          <span class="category-count">${count} sản phẩm →</span>
        </a>
      `;
    }).join('');
  }

  if (catSelect) {
    catSelect.innerHTML = `<option value="">Tất cả không gian</option>` +
      categories.map(c => `<option value="${escapeHTML(c.MaDM)}">${escapeHTML(c.TenDM)}</option>`).join('');
  }

  let currentGroup = 'all';
  let currentCat = '';

  function renderHomeProducts() {
    let list = DB.getProducts().slice();
    if (currentCat) list = list.filter(p => p.MaDM === currentCat);
    if (currentGroup === 'new') list = list.filter(p => p.MoiVe);
    if (currentGroup === 'best') list = list.filter(p => p.BanChay);
    if (currentGroup === 'sale') list = list.filter(p => p.GiaCu && p.GiaCu > p.Gia);

    if (list.length === 0) {
      prodGrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>Chưa có sản phẩm phù hợp</h3><p>Vui lòng thử chọn nhóm lọc hoặc không gian khác.</p></div>`;
      return;
    }
    prodGrid.innerHTML = list.slice(0, 8).map(buildProductCardHTML).join('');
  }

  pills.forEach(btn => {
    btn.addEventListener('click', () => {
      pills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGroup = btn.dataset.group;
      renderHomeProducts();
    });
  });

  if (catSelect) {
    catSelect.addEventListener('change', () => {
      currentCat = catSelect.value;
      renderHomeProducts();
    });
  }

  renderHomeProducts();
}

/* ---------- 2. DANH MỤC, TÌM KIẾM & LỌC (products.html - ND01, ND02) ---------- */
function initProductsPage() {
  const params = new URLSearchParams(window.location.search);
  const initialFilter = params.get('filter') || '';
  renderHeader(initialFilter === 'new' ? 'new' : 'products');
  renderFooter();

  const catListEl = document.getElementById('sidebar-cat-list');
  const searchInput = document.getElementById('catalog-search');
  const priceMinEl = document.getElementById('price-min');
  const priceMaxEl = document.getElementById('price-max');
  const sortSelect = document.getElementById('catalog-sort');
  const gridEl = document.getElementById('catalog-product-grid');
  const countEl = document.getElementById('catalog-count');
  const paginationEl = document.getElementById('catalog-pagination');
  const titleEl = document.getElementById('catalog-heading');

  let state = {
    cat: params.get('cat') || '',
    q: params.get('q') || '',
    filter: initialFilter,
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    page: 1,
    pageSize: 6
  };

  if (searchInput) searchInput.value = state.q;

  function renderSidebarCats() {
    const cats = DB.getCategories().filter(c => c.TrangThai !== 'Ẩn');
    const allProds = DB.getProducts();
    let html = `<li><button class="${state.cat === '' ? 'active' : ''}" data-cat=""><span>Tất cả sản phẩm</span><span>${allProds.length}</span></button></li>`;
    html += cats.map(c => {
      const cnt = allProds.filter(p => p.MaDM === c.MaDM).length;
      return `<li><button class="${state.cat === c.MaDM ? 'active' : ''}" data-cat="${escapeHTML(c.MaDM)}"><span>${escapeHTML(c.TenDM)}</span><span>${cnt}</span></button></li>`;
    }).join('');
    catListEl.innerHTML = html;

    catListEl.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        state.cat = btn.dataset.cat;
        state.filter = '';
        state.page = 1;
        renderSidebarCats();
        renderList();
      });
    });
  }

  function renderList() {
    let list = DB.getProducts().slice();

    if (state.cat) {
      list = list.filter(p => p.MaDM === state.cat);
      if (titleEl) titleEl.textContent = getCategoryName(state.cat);
    } else if (state.filter === 'new') {
      list = list.filter(p => p.MoiVe);
      if (titleEl) titleEl.textContent = 'Sản phẩm mới về';
    } else {
      if (titleEl) titleEl.textContent = 'Tất cả sản phẩm nội thất';
    }

    if (state.q) {
      const kw = state.q.toLowerCase();
      list = list.filter(p =>
        p.TenSP.toLowerCase().includes(kw) ||
        (p.ChatLieu || '').toLowerCase().includes(kw) ||
        (p.MauSac || '').toLowerCase().includes(kw) ||
        (p.MoTa || '').toLowerCase().includes(kw)
      );
    }

    if (state.minPrice !== '') list = list.filter(p => p.Gia >= Number(state.minPrice));
    if (state.maxPrice !== '') list = list.filter(p => p.Gia <= Number(state.maxPrice));

    if (state.sort === 'price-asc') list.sort((a, b) => a.Gia - b.Gia);
    else if (state.sort === 'price-desc') list.sort((a, b) => b.Gia - a.Gia);
    else list.sort((a, b) => (b.MoiVe ? 1 : 0) - (a.MoiVe ? 1 : 0) || b.MaSP.localeCompare(a.MaSP));

    if (countEl) countEl.textContent = `Hiển thị ${list.length} sản phẩm`;

    if (list.length === 0) {
      const msg = (state.cat && !state.q && state.minPrice === '' && state.maxPrice === '')
        ? 'Danh mục này đang được cập nhật sản phẩm mới.'
        : 'Không tìm thấy sản phẩm phù hợp. Hãy thử đổi từ khóa hoặc khoảng giá.';
      gridEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>Không có sản phẩm phù hợp</h3><p>${msg}</p><button class="btn btn-outline" style="margin-top:14px" id="btn-reset-filter">Xóa bộ lọc</button></div>`;
      paginationEl.innerHTML = '';
      const resetBtn = document.getElementById('btn-reset-filter');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          state = { ...state, cat: '', q: '', filter: '', minPrice: '', maxPrice: '', page: 1 };
          searchInput.value = '';
          priceMinEl.value = '';
          priceMaxEl.value = '';
          renderSidebarCats();
          renderList();
        });
      }
      return;
    }

    const totalPages = Math.ceil(list.length / state.pageSize);
    if (state.page > totalPages) state.page = totalPages;
    const start = (state.page - 1) * state.pageSize;
    const pageItems = list.slice(start, start + state.pageSize);

    gridEl.innerHTML = pageItems.map(buildProductCardHTML).join('');

    if (totalPages > 1) {
      let pgHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        pgHTML += `<button class="page-btn ${i === state.page ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }
      paginationEl.innerHTML = pgHTML;
      paginationEl.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          state.page = Number(btn.dataset.page);
          renderList();
          window.scrollTo({ top: 180, behavior: 'smooth' });
        });
      });
    } else {
      paginationEl.innerHTML = '';
    }
  }

  document.getElementById('btn-apply-filter').addEventListener('click', () => {
    state.minPrice = priceMinEl.value.trim();
    state.maxPrice = priceMaxEl.value.trim();
    state.page = 1;
    renderList();
  });

  document.getElementById('catalog-search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    state.q = searchInput.value.trim();
    state.page = 1;
    renderList();
  });

  sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    state.page = 1;
    renderList();
  });

  renderSidebarCats();
  renderList();
}

/* ---------- 3. CHI TIẾT SẢN PHẨM (product-detail.html - ND03) ---------- */
function initProductDetailPage() {
  renderHeader('products');
  renderFooter();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('product-detail-container');
  const relatedGrid = document.getElementById('related-products-grid');

  const sp = DB.getProducts().find(p => p.MaSP === id);
  if (!sp) {
    container.innerHTML = `<div class="empty-state"><h3>Không tìm thấy sản phẩm</h3><p>Sản phẩm bạn tìm không tồn tại hoặc đã bị xóa.</p><a href="products.html" class="btn btn-primary" style="margin-top:14px">Quay lại danh mục</a></div>`;
    return;
  }

  document.title = `${sp.TenSP} – Nội thất Mộc An`;
  const isOut = sp.SoLuongTon <= 0;
  const hasSale = sp.GiaCu && sp.GiaCu > sp.Gia;
  const images = (sp.HinhAnhPhu && sp.HinhAnhPhu.length > 0) ? sp.HinhAnhPhu : [sp.HinhAnh];

  container.innerHTML = `
    <div style="margin-bottom:16px;font-size:0.9rem;color:var(--text-muted);">
      <a href="index.html">Trang chủ</a> / <a href="products.html?cat=${encodeURIComponent(sp.MaDM)}">${escapeHTML(getCategoryName(sp.MaDM))}</a> / <strong>${escapeHTML(sp.TenSP)}</strong>
    </div>
    <div class="detail-grid">
      <div>
        <div class="gallery-main">
          <img id="detail-main-img" src="${escapeHTML(safeImg(images[0]))}" alt="${escapeHTML(sp.TenSP)}" onerror="this.src='${FALLBACK_IMG}'">
        </div>
        <div class="gallery-thumbs">
          ${images.map((img, idx) => `
            <img src="${escapeHTML(safeImg(img))}" class="${idx === 0 ? 'active' : ''}" data-src="${escapeHTML(safeImg(img))}" alt="Ảnh ${idx + 1}" onerror="this.src='${FALLBACK_IMG}'">
          `).join('')}
        </div>
      </div>

      <div>
        <div class="product-cat" style="margin-bottom:6px;">${escapeHTML(getCategoryName(sp.MaDM))} · Mã: ${escapeHTML(sp.MaSP)}</div>
        <h1 style="font-size:1.85rem;margin-bottom:12px;">${escapeHTML(sp.TenSP)}</h1>
        <div class="product-price-row" style="margin-bottom:16px;">
          <span class="price-current" style="font-size:1.55rem;">${formatPrice(sp.Gia)}</span>
          ${hasSale ? `<span class="price-old" style="font-size:1.05rem;">${formatPrice(sp.GiaCu)}</span>` : ''}
        </div>

        <table class="spec-table">
          <tr><th>Chất liệu</th><td>${escapeHTML(sp.ChatLieu || 'Đang cập nhật')}</td></tr>
          <tr><th>Kích thước</th><td>${escapeHTML(sp.KichThuoc || 'Đang cập nhật')}</td></tr>
          <tr><th>Màu sắc</th><td>${escapeHTML(sp.MauSac || 'Đang cập nhật')}</td></tr>
          <tr><th>Tình trạng</th><td>
            ${isOut
              ? '<span class="status-badge st-cancel">Hết hàng</span>'
              : `<span class="status-badge st-done">Còn hàng (${sp.SoLuongTon} sản phẩm)</span>`}
          </td></tr>
        </table>

        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:22px 0;">
          <div class="qty-control">
            <button type="button" id="qty-minus" ${isOut ? 'disabled' : ''}>−</button>
            <input type="number" id="detail-qty" value="1" min="1" max="${Math.max(1, sp.SoLuongTon)}" ${isOut ? 'disabled' : ''}>
            <button type="button" id="qty-plus" ${isOut ? 'disabled' : ''}>+</button>
          </div>
          <button class="btn btn-outline btn-lg" id="btn-add-detail" style="flex:1;" ${isOut ? 'disabled' : ''}>
            ${isOut ? 'Hết hàng' : '🛒 Thêm vào giỏ'}
          </button>
          <button class="btn btn-accent btn-lg" id="btn-buy-now" style="flex:1;" ${isOut ? 'disabled' : ''}>
            ⚡ Mua ngay
          </button>
        </div>

        <div style="margin-top:24px;padding-top:18px;border-top:1px solid var(--border);">
          <h3 style="font-size:1.1rem;margin-bottom:8px;">Mô tả chi tiết</h3>
          <p style="color:var(--text-muted);font-size:0.95rem;">${escapeHTML(sp.MoTa || 'Chưa có mô tả chi tiết.')}</p>
        </div>
      </div>
    </div>
  `;

  // Thumbnails
  document.querySelectorAll('.gallery-thumbs img').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.getElementById('detail-main-img').src = thumb.dataset.src;
      document.querySelectorAll('.gallery-thumbs img').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  if (!isOut) {
    const qtyInput = document.getElementById('detail-qty');
    document.getElementById('qty-minus').addEventListener('click', () => {
      qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
    });
    document.getElementById('qty-plus').addEventListener('click', () => {
      const next = Number(qtyInput.value) + 1;
      if (next > sp.SoLuongTon) {
        showToast(`Chỉ còn ${sp.SoLuongTon} sản phẩm trong kho.`, 'error');
        qtyInput.value = sp.SoLuongTon;
      } else {
        qtyInput.value = next;
      }
    });
    document.getElementById('btn-add-detail').addEventListener('click', () => {
      const val = Math.max(1, Math.min(sp.SoLuongTon, parseInt(qtyInput.value, 10) || 1));
      quickAddToCart(sp.MaSP, val);
    });
    const buyNowBtn = document.getElementById('btn-buy-now');
    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', () => {
        const val = Math.max(1, Math.min(sp.SoLuongTon, parseInt(qtyInput.value, 10) || 1));
        quickAddToCart(sp.MaSP, val);
        setTimeout(() => { window.location.href = 'checkout.html'; }, 300);
      });
    }
  }

  // Sản phẩm liên quan
  const related = DB.getProducts().filter(p => p.MaDM === sp.MaDM && p.MaSP !== sp.MaSP).slice(0, 4);
  if (relatedGrid) {
    relatedGrid.innerHTML = related.length
      ? related.map(buildProductCardHTML).join('')
      : '<p style="color:var(--text-muted)">Chưa có sản phẩm liên quan.</p>';
  }
}

/* ---------- 4. ĐĂNG NHẬP & ĐĂNG KÝ (auth.html - ND04, ND05) ---------- */
function initAuthPage() {
  renderHeader('auth');
  renderFooter();

  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get('return') || 'index.html';

  // Form đăng nhập
  const loginForm = document.getElementById('login-form');
  const loginErr = document.getElementById('login-error');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginErr.className = 'alert alert-error';
    loginErr.style.display = 'none';

    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const pass = document.getElementById('login-password').value;

    if (!email || !pass) {
      loginErr.textContent = 'Vui lòng nhập đầy đủ email và mật khẩu.';
      loginErr.style.display = 'block';
      return;
    }

    const user = DB.getUsers().find(u => u.Email.toLowerCase() === email && u.MatKhau === pass);
    if (!user) {
      loginErr.textContent = 'Email hoặc mật khẩu không chính xác. Vui lòng nhập lại.';
      loginErr.style.display = 'block';
      return;
    }
    if (user.TrangThai === 'Bị khóa') {
      loginErr.textContent = 'Tài khoản của bạn hiện đang bị khóa và không thể đăng nhập.';
      loginErr.style.display = 'block';
      return;
    }

    DB.setSession(user);
    showToast(`Chào mừng ${user.HoTen} quay trở lại!`);
    setTimeout(() => { window.location.href = returnUrl; }, 500);
  });

  // Form đăng ký
  const regForm = document.getElementById('register-form');
  const regMsg = document.getElementById('register-msg');

  regForm.addEventListener('submit', (e) => {
    e.preventDefault();
    regMsg.style.display = 'none';

    const hoTen = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const sdt = document.getElementById('reg-phone').value.trim();
    const pass = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    const showRegErr = (msg) => {
      regMsg.className = 'alert alert-error';
      regMsg.textContent = msg;
      regMsg.style.display = 'block';
    };

    if (!hoTen || !email || !sdt || !pass || !confirm) {
      return showRegErr('Vui lòng điền đầy đủ tất cả các trường thông tin.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return showRegErr('Định dạng email không hợp lệ.');
    }
    if (!/^[0-9]{9,11}$/.test(sdt)) {
      return showRegErr('Số điện thoại phải gồm 9–11 chữ số.');
    }
    if (pass.length < 6) {
      return showRegErr('Mật khẩu phải có ít nhất 6 ký tự.');
    }
    if (pass !== confirm) {
      return showRegErr('Mật khẩu xác nhận không khớp.');
    }

    const users = DB.getUsers();
    if (users.some(u => u.Email.toLowerCase() === email)) {
      return showRegErr('Email này đã được sử dụng. Vui lòng chọn email khác.');
    }

    const nextNum = users.length + 1;
    const newUser = {
      MaTK: 'TK' + String(nextNum).padStart(3, '0') + Math.floor(Math.random() * 90 + 10),
      HoTen: hoTen,
      Email: email,
      SoDienThoai: sdt,
      MatKhau: pass,
      VaiTro: 'customer',
      TrangThai: 'Hoạt động'
    };
    users.push(newUser);
    DB.saveUsers(users);

    regMsg.className = 'alert alert-success';
    regMsg.textContent = 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.';
    regMsg.style.display = 'block';
    regForm.reset();
    document.getElementById('login-email').value = email;
    showToast('Đăng ký tài khoản thành công!');
  });
}

/* ---------- 5. GIỎ HÀNG (cart.html - ND06) ---------- */
function initCartPage() {
  renderHeader('cart');
  renderFooter();

  const container = document.getElementById('cart-container');
  if (!container) return;

  function renderCart() {
    const cart = DB.getCurrentCart();
    const products = DB.getProducts();
    updateCartBadge();

    const stepperHTML = `
      <div class="checkout-stepper">
        <div class="step-item active"><span class="step-num">1</span><span>Giỏ hàng</span></div>
        <div class="step-line"></div>
        <div class="step-item"><span class="step-num">2</span><span>Đặt hàng & Thanh toán</span></div>
        <div class="step-line"></div>
        <div class="step-item"><span class="step-num">3</span><span>Hoàn tất đơn hàng</span></div>
      </div>
    `;

    if (cart.length === 0) {
      // Gợi ý sản phẩm nổi bật khi giỏ hàng trống
      const featured = products.slice(0, 3);
      container.innerHTML = `
        ${stepperHTML}
        <div class="empty-state" style="max-width:680px;margin:0 auto 40px;">
          <div style="font-size:3.5rem;margin-bottom:12px;">🛒</div>
          <h3 style="font-size:1.4rem;">Giỏ hàng của bạn đang trống</h3>
          <p style="margin-bottom:20px;color:var(--text-muted);line-height:1.6;">
            Bạn chưa chọn sản phẩm nào. Hãy khám phá bộ sưu tập nội thất gỗ tự nhiên tinh tế, tối giản tại Mộc An để tìm kiếm món đồ ưng ý cho tổ ấm.
          </p>
          <a href="products.html" class="btn btn-primary btn-lg">Khám phá sản phẩm ngay</a>
        </div>
        <div style="margin-top:40px;">
          <h3 style="text-align:center;margin-bottom:24px;font-size:1.3rem;">Sản phẩm nổi bật có thể bạn quan tâm</h3>
          <div class="catalog-grid" style="grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));">
            ${featured.map(buildProductCardHTML).join('')}
          </div>
        </div>
      `;
      return;
    }

    let subtotal = 0;
    const rowsHTML = cart.map(item => {
      const sp = products.find(p => p.MaSP === item.MaSP);
      if (!sp) return '';
      const lineTotal = sp.Gia * item.SoLuong;
      subtotal += lineTotal;
      const hasSale = sp.GiaCu && sp.GiaCu > sp.Gia;
      const isMaxStock = item.SoLuong >= sp.SoLuongTon;

      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:14px;">
              <a href="product-detail.html?id=${encodeURIComponent(sp.MaSP)}">
                <img src="${escapeHTML(safeImg(sp.HinhAnh))}" alt="${escapeHTML(sp.TenSP)}" style="width:76px;height:60px;object-fit:cover;border-radius:6px;border:1px solid var(--border);" onerror="this.src='${FALLBACK_IMG}'">
              </a>
              <div>
                <a href="product-detail.html?id=${encodeURIComponent(sp.MaSP)}" style="font-weight:600;color:var(--olive-dark);font-size:0.95rem;">${escapeHTML(sp.TenSP)}</a>
                <div style="font-size:0.8rem;color:var(--text-muted);margin-top:2px;">
                  Chất liệu: ${escapeHTML(sp.ChatLieu || 'Gỗ tự nhiên')}
                </div>
                <div style="font-size:0.78rem;color:${sp.SoLuongTon <= 3 ? '#dc2626' : 'var(--olive)'};margin-top:2px;">
                  ${sp.SoLuongTon <= 3 ? `⚠️ Chỉ còn ${sp.SoLuongTon} sản phẩm!` : `Còn hàng (${sp.SoLuongTon})`}
                </div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight:600;">${formatPrice(sp.Gia)}</div>
            ${hasSale ? `<div style="font-size:0.8rem;color:var(--text-muted);text-decoration:line-through;">${formatPrice(sp.GiaCu)}</div>` : ''}
          </td>
          <td>
            <div class="qty-control">
              <button type="button" onclick="changeCartQty('${escapeHTML(sp.MaSP)}', -1)" title="Giảm">−</button>
              <input type="number" min="1" max="${sp.SoLuongTon}" value="${item.SoLuong}" onchange="setCartQtyInput('${escapeHTML(sp.MaSP)}', this.value)">
              <button type="button" onclick="changeCartQty('${escapeHTML(sp.MaSP)}', 1)" ${isMaxStock ? 'disabled' : ''} title="Tăng">+</button>
            </div>
          </td>
          <td style="font-weight:700;color:var(--terracotta);white-space:nowrap;">
            ${formatPrice(lineTotal)}
          </td>
          <td style="text-align:center;">
            <button class="btn btn-sm btn-outline" style="border-color:#e5e7eb;color:#dc2626;padding:6px 10px;" onclick="removeCartItem('${escapeHTML(sp.MaSP)}')" title="Xóa món này">
              🗑 Xóa
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Tính toán phí vận chuyển
    const rawShipping = subtotal >= 10000000 ? 0 : 250000;
    const appliedVoucherCode = DB.getAppliedVoucher();
    const discountRes = DB.calculateOrderDiscount(subtotal, rawShipping, appliedVoucherCode);
    const shipping = discountRes.freeShipping ? 0 : rawShipping;
    const discountAmount = discountRes.discount || 0;
    const grandTotal = Math.max(0, subtotal + shipping - discountAmount);

    // Free shipping progress
    const freeShipPercent = Math.min(100, Math.round((subtotal / 10000000) * 100));
    const freeShipMsg = subtotal >= 10000000 || discountRes.freeShipping
      ? '🎉 <strong>Tuyệt vời!</strong> Bạn đã được <strong>MIỄN PHÍ VẬN CHUYỂN</strong> toàn quốc!'
      : `Mua thêm <strong>${formatPrice(10000000 - subtotal)}</strong> để được <strong>MIỄN PHÍ VẬN CHUYỂN</strong>`;

    container.innerHTML = `
      ${stepperHTML}
      <div class="cart-layout">
        <div>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="min-width:240px;">Sản phẩm</th>
                  <th>Đơn giá</th>
                  <th style="width:120px;">Số lượng</th>
                  <th>Thành tiền</th>
                  <th style="width:60px;"></th>
                </tr>
              </thead>
              <tbody>${rowsHTML}</tbody>
            </table>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;flex-wrap:wrap;gap:12px;">
            <a href="products.html" class="btn btn-outline">← Tiếp tục mua sắm</a>
            <button type="button" class="btn btn-outline" style="border-color:#f87171;color:#dc2626;" onclick="clearAllCart()">
              Xóa tất cả sản phẩm
            </button>
          </div>
        </div>

        <div class="card-box">
          <h3 style="margin-bottom:14px;font-size:1.25rem;">Tóm tắt đơn hàng</h3>

          <div class="freeship-box">
            <div>${freeShipMsg}</div>
            <div class="freeship-meter">
              <div class="freeship-meter-bar" style="width:${freeShipPercent}%;"></div>
            </div>
          </div>

          <!-- Khu vực Voucher -->
          <div class="voucher-section">
            <div style="font-weight:600;font-size:0.9rem;margin-bottom:8px;">Mã ưu đãi / Giảm giá</div>
            ${discountRes.voucher ? `
              <div class="applied-voucher-badge">
                <div>
                  <strong>🎟 ${escapeHTML(discountRes.voucher.code)}</strong>: ${escapeHTML(discountRes.voucher.title)}
                  <div style="font-size:0.78rem;opacity:0.9;">-${formatPrice(discountAmount)}</div>
                </div>
                <button type="button" onclick="removeVoucher()" style="background:transparent;border:none;color:#dc2626;cursor:pointer;font-weight:600;">Gỡ</button>
              </div>
            ` : `
              <div class="voucher-input-row">
                <input type="text" id="cart-voucher-input" class="form-control" placeholder="Nhập mã ưu đãi..." style="text-transform:uppercase;">
                <button type="button" class="btn btn-primary" onclick="applyCartVoucher()">Áp dụng</button>
              </div>
              <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:4px;">Gợi ý mã giảm giá:</div>
              <div class="voucher-pill-list">
                ${AVAILABLE_VOUCHERS.map(v => `
                  <button type="button" class="voucher-pill" onclick="quickApplyVoucher('${escapeHTML(v.code)}')">
                    ${escapeHTML(v.code)}
                  </button>
                `).join('')}
              </div>
            `}
          </div>

          <div class="summary-row">
            <span>Tạm tính</span>
            <strong>${formatPrice(subtotal)}</strong>
          </div>
          <div class="summary-row">
            <span>Phí vận chuyển</span>
            <span>${shipping === 0 ? '<strong style="color:var(--olive);">Miễn phí</strong>' : formatPrice(shipping)}</span>
          </div>
          ${discountAmount > 0 ? `
            <div class="summary-row" style="color:var(--terracotta);">
              <span>Giảm giá (${escapeHTML(discountRes.voucher.code)})</span>
              <strong>-${formatPrice(discountAmount)}</strong>
            </div>
          ` : ''}
          <div class="summary-total">
            <span>Tổng thanh toán</span>
            <span>${formatPrice(grandTotal)}</span>
          </div>

          <a href="checkout.html" class="btn btn-accent btn-lg" style="width:100%;font-size:1.05rem;">
            Tiến hành đặt hàng →
          </a>

          <div class="trust-badges-grid">
            <div class="trust-item">🚚 <span>Miễn phí giao hàng & lắp đặt cho đơn từ 10 triệu</span></div>
            <div class="trust-item">🛡️ <span>Bảo hành kết cấu gỗ tự nhiên chính hãng 24 tháng</span></div>
            <div class="trust-item">🔄 <span>Đổi trả 1-1 trong 7 ngày nếu lỗi sản xuất</span></div>
          </div>
        </div>
      </div>
    `;
  }

  window.changeCartQty = (maSP, delta) => {
    const cart = DB.getCurrentCart();
    const item = cart.find(c => c.MaSP === maSP);
    const sp = DB.getProducts().find(p => p.MaSP === maSP);
    if (!item || !sp) return;
    const next = item.SoLuong + delta;
    if (next <= 0) {
      if (confirm(`Bạn có muốn xóa "${sp.TenSP}" khỏi giỏ hàng?`)) {
        DB.saveCurrentCart(cart.filter(c => c.MaSP !== maSP));
        showToast('Đã xóa sản phẩm khỏi giỏ hàng.');
      }
    } else if (next > sp.SoLuongTon) {
      item.SoLuong = sp.SoLuongTon;
      DB.saveCurrentCart(cart);
      showToast(`Số lượng vượt tồn kho! Tối đa ${sp.SoLuongTon} sản phẩm.`, 'error');
    } else {
      item.SoLuong = next;
      DB.saveCurrentCart(cart);
    }
    renderCart();
  };

  window.setCartQtyInput = (maSP, valStr) => {
    const cart = DB.getCurrentCart();
    const item = cart.find(c => c.MaSP === maSP);
    const sp = DB.getProducts().find(p => p.MaSP === maSP);
    if (!item || !sp) return;
    let qty = parseInt(valStr, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > sp.SoLuongTon) {
      qty = sp.SoLuongTon;
      showToast(`Số lượng vượt tồn kho! Tối đa ${sp.SoLuongTon} sản phẩm.`, 'error');
    }
    item.SoLuong = qty;
    DB.saveCurrentCart(cart);
    renderCart();
  };

  window.removeCartItem = (maSP) => {
    const sp = DB.getProducts().find(p => p.MaSP === maSP);
    const name = sp ? sp.TenSP : 'sản phẩm';
    if (!confirm(`Bạn có chắc chắn muốn xóa "${name}" khỏi giỏ hàng?`)) return;
    const cart = DB.getCurrentCart().filter(c => c.MaSP !== maSP);
    DB.saveCurrentCart(cart);
    showToast(`Đã xóa "${name}" khỏi giỏ hàng.`);
    renderCart();
  };

  window.clearAllCart = () => {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng không?')) return;
    DB.clearCurrentCart();
    DB.setAppliedVoucher(null);
    showToast('Đã làm trống giỏ hàng.');
    renderCart();
  };

  window.applyCartVoucher = () => {
    const input = document.getElementById('cart-voucher-input');
    if (!input) return;
    const code = input.value.trim().toUpperCase();
    if (!code) {
      showToast('Vui lòng nhập mã giảm giá.', 'error');
      return;
    }
    const cart = DB.getCurrentCart();
    const products = DB.getProducts();
    const subtotal = cart.reduce((s, it) => {
      const p = products.find(x => x.MaSP === it.MaSP);
      return s + (p ? p.Gia * it.SoLuong : 0);
    }, 0);
    const res = DB.calculateOrderDiscount(subtotal, 250000, code);
    if (!res.voucher) {
      showToast(res.message || 'Mã ưu đãi không hợp lệ.', 'error');
      return;
    }
    DB.setAppliedVoucher(code);
    showToast(res.message);
    renderCart();
  };

  window.quickApplyVoucher = (code) => {
    const cart = DB.getCurrentCart();
    const products = DB.getProducts();
    const subtotal = cart.reduce((s, it) => {
      const p = products.find(x => x.MaSP === it.MaSP);
      return s + (p ? p.Gia * it.SoLuong : 0);
    }, 0);
    const res = DB.calculateOrderDiscount(subtotal, 250000, code);
    if (!res.voucher) {
      showToast(res.message || 'Mã ưu đãi không hợp lệ.', 'error');
      return;
    }
    DB.setAppliedVoucher(code);
    showToast(res.message);
    renderCart();
  };

  window.removeVoucher = () => {
    DB.setAppliedVoucher(null);
    showToast('Đã gỡ bỏ mã giảm giá.');
    renderCart();
  };

  renderCart();
}

/* ---------- 6. ĐẶT HÀNG & THANH TOÁN (checkout.html - ND07) ---------- */
function initCheckoutPage() {
  renderHeader('cart');
  renderFooter();

  const container = document.getElementById('checkout-container');
  if (!container) return;

  const cart = DB.getCurrentCart();
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="max-width:620px;margin:40px auto;text-align:center;">
        <div style="font-size:3rem;margin-bottom:12px;">🛒</div>
        <h3>Giỏ hàng của bạn đang trống</h3>
        <p style="margin-bottom:20px;color:var(--text-muted);">
          Bạn cần có ít nhất 1 sản phẩm trong giỏ hàng để tiến hành đặt hàng và thanh toán.
        </p>
        <a href="products.html" class="btn btn-primary btn-lg">Khám phá sản phẩm ngay</a>
      </div>
    `;
    return;
  }

  const user = DB.getSession();
  const products = DB.getProducts();

  let subtotal = 0;
  const itemsSummaryHTML = cart.map(item => {
    const sp = products.find(p => p.MaSP === item.MaSP);
    if (!sp) return '';
    const lineTotal = sp.Gia * item.SoLuong;
    subtotal += lineTotal;
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);font-size:0.9rem;">
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${escapeHTML(safeImg(sp.HinhAnh))}" alt="${escapeHTML(sp.TenSP)}" style="width:48px;height:40px;object-fit:cover;border-radius:4px;border:1px solid var(--border);" onerror="this.src='${FALLBACK_IMG}'">
          <div>
            <div style="font-weight:600;color:var(--olive-dark);">${escapeHTML(sp.TenSP)}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);">${formatPrice(sp.Gia)} × <strong>${item.SoLuong}</strong></div>
          </div>
        </div>
        <div style="font-weight:700;color:var(--terracotta);white-space:nowrap;">
          ${formatPrice(lineTotal)}
        </div>
      </div>
    `;
  }).join('');

  // Tính phí ship và voucher
  const rawShipping = subtotal >= 10000000 ? 0 : 250000;
  const appliedVoucherCode = DB.getAppliedVoucher();
  const discountRes = DB.calculateOrderDiscount(subtotal, rawShipping, appliedVoucherCode);
  const shipping = discountRes.freeShipping ? 0 : rawShipping;
  const discountAmount = discountRes.discount || 0;
  const grandTotal = Math.max(0, subtotal + shipping - discountAmount);

  // Sinh mã chuyển khoản tạm thời
  const tempOrderCode = 'MOCAN' + Math.floor(100000 + Math.random() * 900000);

  // Danh sách tỉnh thành phố
  const PROVINCES = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Hưng Yên', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'Bắc Ninh', 'Bình Dương', 'Đồng Nai', 'Quảng Ninh', 'Hải Dương', 'Nam Định',
    'Thái Bình', 'Nghệ An', 'Thừa Thiên Huế', 'Khánh Hòa', 'Bà Rịa - Vũng Tàu', 'Lâm Đồng'
  ];

  container.innerHTML = `
    <div class="checkout-stepper">
      <div class="step-item done"><span class="step-num">✓</span><span>Giỏ hàng</span></div>
      <div class="step-line active"></div>
      <div class="step-item active"><span class="step-num">2</span><span>Đặt hàng & Thanh toán</span></div>
      <div class="step-line"></div>
      <div class="step-item"><span class="step-num">3</span><span>Hoàn tất đơn hàng</span></div>
    </div>

    ${user ? `
      <div style="background:#eef5ea;border:1px solid #c9dec2;padding:10px 16px;border-radius:var(--radius-sm);margin-bottom:20px;font-size:0.88rem;display:flex;align-items:center;justify-content:space-between;">
        <div>👤 Đang đặt hàng với tài khoản: <strong>${escapeHTML(user.HoTen)}</strong> (${escapeHTML(user.Email)})</div>
        <a href="orders.html" style="font-weight:600;color:var(--olive-dark);">Lịch sử đơn hàng →</a>
      </div>
    ` : `
      <div style="background:#fff9ed;border:1px solid #fae4b8;padding:12px 16px;border-radius:var(--radius-sm);margin-bottom:20px;font-size:0.88rem;">
        💡 <strong>Bạn đã có tài khoản Mộc An?</strong>
        <a href="auth.html?return=checkout.html" style="font-weight:600;color:var(--terracotta);text-decoration:underline;margin-left:4px;">Đăng nhập ngay</a>
        để tự động lưu đơn hàng vào tài khoản và nhận ưu đãi tích điểm. Hoặc bạn có thể điền thông tin bên dưới để đặt hàng nhanh.
      </div>
    `}

    <div class="cart-layout">
      <!-- Cột trái: Form thông tin & Phương thức thanh toán -->
      <form class="card-box" id="checkout-form">
        <h2 style="font-size:1.3rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <span>📍</span> 1. Thông tin giao nhận hàng
        </h2>
        <div id="checkout-error" class="alert alert-error" style="display:none;margin-bottom:16px;"></div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group">
            <label for="co-name">Họ và tên người nhận <span style="color:#dc2626;">*</span></label>
            <input type="text" id="co-name" class="form-control" value="${escapeHTML(user ? user.HoTen : '')}" placeholder="Ví dụ: Nguyễn Văn An" required>
          </div>
          <div class="form-group">
            <label for="co-phone">Số điện thoại liên hệ <span style="color:#dc2626;">*</span></label>
            <input type="tel" id="co-phone" class="form-control" value="${escapeHTML(user ? user.SoDienThoai || '' : '')}" placeholder="Ví dụ: 0988123456" required>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group">
            <label for="co-email">Email nhận hóa đơn & thông báo <span style="color:#dc2626;">*</span></label>
            <input type="email" id="co-email" class="form-control" value="${escapeHTML(user ? user.Email : '')}" placeholder="email@example.com" required>
          </div>
          <div class="form-group">
            <label for="co-city">Tỉnh / Thành phố <span style="color:#dc2626;">*</span></label>
            <select id="co-city" class="form-control" required>
              <option value="">-- Chọn Tỉnh / Thành phố --</option>
              ${PROVINCES.map(p => `<option value="${escapeHTML(p)}" ${p === 'Hà Nội' ? 'selected' : ''}>${escapeHTML(p)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 2fr;gap:12px;">
          <div class="form-group">
            <label for="co-district">Quận / Huyện <span style="color:#dc2626;">*</span></label>
            <input type="text" id="co-district" class="form-control" placeholder="Quận/Huyện/Thị xã" required>
          </div>
          <div class="form-group">
            <label for="co-address">Địa chỉ chi tiết (Số nhà, đường...) <span style="color:#dc2626;">*</span></label>
            <input type="text" id="co-address" class="form-control" placeholder="Số nhà, ngõ/ngách, tòa nhà, tên đường..." required>
          </div>
        </div>

        <div class="form-group">
          <label for="co-note">Ghi chú giao hàng & lắp đặt (tùy chọn)</label>
          <textarea id="co-note" class="form-control" rows="2" placeholder="Ví dụ: Giao giờ hành chính, gọi trước 30 phút, căn hộ tầng 8 có thang máy..."></textarea>
        </div>

        <!-- Phương thức thanh toán -->
        <h2 style="font-size:1.3rem;margin:28px 0 14px;display:flex;align-items:center;gap:8px;">
          <span>💳</span> 2. Phương thức thanh toán
        </h2>

        <div class="payment-methods-list" id="payment-methods-group">
          <!-- 1. COD -->
          <div class="payment-card selected" id="card-pay-cod">
            <div class="payment-card-header" onclick="selectPaymentMethod('cod')">
              <div class="payment-card-left">
                <input type="radio" name="payment_method" value="COD" id="pay-cod" checked>
                <div>
                  <strong>💵 Thanh toán khi nhận hàng (COD)</strong>
                  <div style="font-size:0.83rem;color:var(--text-muted);">Đồng kiểm tra sản phẩm trước khi thanh toán cho nhân viên giao vận Mộc An.</div>
                </div>
              </div>
              <span class="status-badge" style="background:#e5e7eb;color:#374151;">Phổ biến</span>
            </div>
          </div>

          <!-- 2. VietQR / Ngân hàng -->
          <div class="payment-card" id="card-pay-vietqr">
            <div class="payment-card-header" onclick="selectPaymentMethod('vietqr')">
              <div class="payment-card-left">
                <input type="radio" name="payment_method" value="VietQR" id="pay-vietqr">
                <div>
                  <strong>🏦 Chuyển khoản ngân hàng qua mã VietQR (Tự động 24/7)</strong>
                  <div style="font-size:0.83rem;color:var(--text-muted);">Quét mã QR qua mọi ứng dụng ngân hàng hoặc ví điện tử. Xác nhận tức thì.</div>
                </div>
              </div>
              <span class="status-badge" style="background:#dcfce7;color:#15803d;">Khuyên dùng</span>
            </div>
            <div class="payment-card-body" id="body-pay-vietqr" style="display:none;">
              <div class="vietqr-box">
                <div style="text-align:center;">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`2|99|0988123456|CONG TY NOI THAT MOC AN||0|0|${grandTotal}|${tempOrderCode}|transfer_myqr`)}" alt="VietQR Mộc An" class="vietqr-img" onerror="this.src='${FALLBACK_IMG}'">
                  <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">Quét bằng app ngân hàng</div>
                </div>
                <div class="bank-info-table">
                  <div><strong>Ngân hàng:</strong> MBBank – Ngân hàng Quân Đội</div>
                  <div>
                    <strong>Số tài khoản:</strong> <span style="font-family:monospace;font-weight:700;font-size:1rem;color:var(--olive-dark);">0988123456</span>
                    <button type="button" class="copy-pill" onclick="copyToClipboard('0988123456', 'Đã sao chép số tài khoản!')">📋 Chép STK</button>
                  </div>
                  <div><strong>Chủ tài khoản:</strong> CONG TY NOI THAT MOC AN</div>
                  <div>
                    <strong>Số tiền:</strong> <span style="font-weight:700;color:var(--terracotta);">${formatPrice(grandTotal)}</span>
                    <button type="button" class="copy-pill" onclick="copyToClipboard('${grandTotal}', 'Đã sao chép số tiền!')">📋 Chép tiền</button>
                  </div>
                  <div>
                    <strong>Nội dung CK:</strong> <span style="font-family:monospace;font-weight:700;color:var(--olive-dark);">${tempOrderCode}</span>
                    <button type="button" class="copy-pill" onclick="copyToClipboard('${tempOrderCode}', 'Đã sao chép nội dung!')">📋 Chép cú pháp</button>
                  </div>
                  <div style="font-size:0.78rem;color:#b4684b;margin-top:6px;">
                    ⚡ Hệ thống sẽ tự động xác thực và cập nhật trạng thái đơn hàng ngay khi nhận tiền.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Thẻ quốc tế Visa/Mastercard -->
          <div class="payment-card" id="card-pay-card">
            <div class="payment-card-header" onclick="selectPaymentMethod('card')">
              <div class="payment-card-left">
                <input type="radio" name="payment_method" value="Card" id="pay-card">
                <div>
                  <strong>💳 Thẻ tín dụng / Ghi nợ quốc tế (Visa, MasterCard, JCB)</strong>
                  <div style="font-size:0.83rem;color:var(--text-muted);">Cổng thanh toán bảo mật chuẩn PCI-DSS mã hóa 256-bit (Mô phỏng).</div>
                </div>
              </div>
              <span style="font-size:1.1rem;">💳</span>
            </div>
            <div class="payment-card-body" id="body-pay-card" style="display:none;">
              <div class="credit-card-form">
                <div class="form-group" style="margin-bottom:10px;">
                  <label for="cc-number">Số thẻ <span style="color:#dc2626;">*</span></label>
                  <input type="text" id="cc-number" class="form-control" placeholder="4111 •••• •••• 4242" maxlength="19" oninput="formatCardNumber(this)">
                </div>
                <div class="card-row-grid">
                  <div class="form-group" style="margin-bottom:10px;">
                    <label for="cc-holder">Tên in trên thẻ <span style="color:#dc2626;">*</span></label>
                    <input type="text" id="cc-holder" class="form-control" placeholder="NGUYEN VAN A" style="text-transform:uppercase;">
                  </div>
                  <div class="card-row-grid" style="gap:8px;">
                    <div class="form-group" style="margin-bottom:10px;">
                      <label for="cc-exp">Hạn dùng <span style="color:#dc2626;">*</span></label>
                      <input type="text" id="cc-exp" class="form-control" placeholder="MM/YY" maxlength="5">
                    </div>
                    <div class="form-group" style="margin-bottom:10px;">
                      <label for="cc-cvv">CVV <span style="color:#dc2626;">*</span></label>
                      <input type="password" id="cc-cvv" class="form-control" placeholder="•••" maxlength="4">
                    </div>
                  </div>
                </div>
                <div style="font-size:0.78rem;color:var(--text-muted);">🔒 Giao dịch được bảo vệ và mã hóa mô phỏng an toàn tuyệt đối.</div>
              </div>
            </div>
          </div>

          <!-- 4. Ví MoMo / VNPay -->
          <div class="payment-card" id="card-pay-wallet">
            <div class="payment-card-header" onclick="selectPaymentMethod('wallet')">
              <div class="payment-card-left">
                <input type="radio" name="payment_method" value="Wallet" id="pay-wallet">
                <div>
                  <strong>📱 Ví điện tử MoMo / ZaloPay / VNPay (Mô phỏng)</strong>
                  <div style="font-size:0.83rem;color:var(--text-muted);">Thanh toán 1 chạm tiện lợi qua app Ví điện tử trên điện thoại.</div>
                </div>
              </div>
              <span style="font-size:1.1rem;">📱</span>
            </div>
            <div class="payment-card-body" id="body-pay-wallet" style="display:none;">
              <div style="text-align:center;padding:16px;background:#fff;border-radius:6px;margin-top:12px;border:1px solid var(--border);">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`momo://pay?action=pay&amount=${grandTotal}&orderId=${tempOrderCode}`)}" alt="Mã QR Ví điện tử" style="width:130px;height:130px;" onerror="this.src='${FALLBACK_IMG}'">
                <div style="font-size:0.85rem;color:var(--olive-dark);font-weight:600;margin-top:8px;">Mở ứng dụng MoMo / VNPay để quét mã thanh toán</div>
                <div style="font-size:0.78rem;color:var(--text-muted);">Số tiền: <strong>${formatPrice(grandTotal)}</strong></div>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" id="btn-submit-order" class="btn btn-accent btn-lg" style="width:100%;font-size:1.1rem;padding:14px;margin-top:14px;">
          Xác nhận đặt hàng (${formatPrice(grandTotal)})
        </button>
        <div style="font-size:0.8rem;color:var(--text-muted);text-align:center;margin-top:10px;">
          Bằng việc nhấn đặt hàng, quý khách đồng ý với Chính sách mua hàng và bảo hành của Mộc An.
        </div>
      </form>

      <!-- Cột phải: Tóm tắt đơn hàng -->
      <div class="card-box">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h3 style="font-size:1.2rem;">Đơn hàng của bạn</h3>
          <a href="cart.html" style="font-size:0.84rem;color:var(--terracotta);">Sửa giỏ hàng</a>
        </div>

        <div style="max-height:340px;overflow-y:auto;padding-right:4px;">
          ${itemsSummaryHTML}
        </div>

        <!-- Khung áp dụng Voucher -->
        <div class="voucher-section" style="margin-top:16px;">
          <div style="font-weight:600;font-size:0.88rem;margin-bottom:8px;">Mã ưu đãi / Khuyến mãi</div>
          ${discountRes.voucher ? `
            <div class="applied-voucher-badge">
              <div>
                <strong>🎟 ${escapeHTML(discountRes.voucher.code)}</strong>: ${escapeHTML(discountRes.voucher.title)}
                <div style="font-size:0.78rem;opacity:0.9;">-${formatPrice(discountAmount)}</div>
              </div>
              <button type="button" onclick="removeCheckoutVoucher()" style="background:transparent;border:none;color:#dc2626;cursor:pointer;font-weight:600;">Gỡ</button>
            </div>
          ` : `
            <div class="voucher-input-row">
              <input type="text" id="checkout-voucher-input" class="form-control" placeholder="Nhập mã ưu đãi..." style="text-transform:uppercase;">
              <button type="button" class="btn btn-primary" onclick="applyCheckoutVoucher()">Áp dụng</button>
            </div>
            <div class="voucher-pill-list">
              ${AVAILABLE_VOUCHERS.map(v => `
                <button type="button" class="voucher-pill" onclick="quickApplyCheckoutVoucher('${escapeHTML(v.code)}')">
                  ${escapeHTML(v.code)}
                </button>
              `).join('')}
            </div>
          `}
        </div>

        <div class="summary-row" style="margin-top:12px;">
          <span>Tạm tính</span>
          <strong>${formatPrice(subtotal)}</strong>
        </div>
        <div class="summary-row">
          <span>Phí vận chuyển</span>
          <span>${shipping === 0 ? '<strong style="color:var(--olive);">Miễn phí</strong>' : formatPrice(shipping)}</span>
        </div>
        ${discountAmount > 0 ? `
          <div class="summary-row" style="color:var(--terracotta);">
            <span>Giảm giá (${escapeHTML(discountRes.voucher.code)})</span>
            <strong>-${formatPrice(discountAmount)}</strong>
          </div>
        ` : ''}
        <div class="summary-total">
          <span>Tổng thanh toán</span>
          <span>${formatPrice(grandTotal)}</span>
        </div>

        <div class="trust-badges-grid">
          <div class="trust-item">🚚 <span>Miễn phí giao hàng & lắp đặt tận phòng</span></div>
          <div class="trust-item">🛡️ <span>Bảo hành chính hãng 24 tháng tận nhà</span></div>
          <div class="trust-item">📞 <span>Hotline hỗ trợ 24/7: 0988 123 456</span></div>
        </div>
      </div>
    </div>
  `;

  // Tương tác phương thức thanh toán
  window.selectPaymentMethod = (method) => {
    ['cod', 'vietqr', 'card', 'wallet'].forEach(m => {
      const cardEl = document.getElementById(`card-pay-${m}`);
      const bodyEl = document.getElementById(`body-pay-${m}`);
      const radioEl = document.getElementById(`pay-${m}`);
      if (m === method) {
        if (cardEl) cardEl.classList.add('selected');
        if (bodyEl) bodyEl.style.display = 'block';
        if (radioEl) radioEl.checked = true;
      } else {
        if (cardEl) cardEl.classList.remove('selected');
        if (bodyEl) bodyEl.style.display = 'none';
        if (radioEl) radioEl.checked = false;
      }
    });
  };

  window.formatCardNumber = (el) => {
    let val = el.value.replace(/\D/g, '').substring(0, 16);
    el.value = val.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  window.copyToClipboard = (text, successMsg) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg || 'Đã sao chép vào bộ nhớ đệm!');
    }).catch(() => {
      showToast('Đã sao chép: ' + text);
    });
  };

  window.applyCheckoutVoucher = () => {
    const input = document.getElementById('checkout-voucher-input');
    if (!input) return;
    const code = input.value.trim().toUpperCase();
    if (!code) {
      showToast('Vui lòng nhập mã giảm giá.', 'error');
      return;
    }
    const res = DB.calculateOrderDiscount(subtotal, 250000, code);
    if (!res.voucher) {
      showToast(res.message || 'Mã không hợp lệ.', 'error');
      return;
    }
    DB.setAppliedVoucher(code);
    showToast(res.message);
    initCheckoutPage();
  };

  window.quickApplyCheckoutVoucher = (code) => {
    const res = DB.calculateOrderDiscount(subtotal, 250000, code);
    if (!res.voucher) {
      showToast(res.message || 'Mã không hợp lệ.', 'error');
      return;
    }
    DB.setAppliedVoucher(code);
    showToast(res.message);
    initCheckoutPage();
  };

  window.removeCheckoutVoucher = () => {
    DB.setAppliedVoucher(null);
    showToast('Đã gỡ mã giảm giá.');
    initCheckoutPage();
  };

  // Xử lý gửi Form Đặt hàng
  document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const errEl = document.getElementById('checkout-error');
    errEl.style.display = 'none';

    const hoTen = document.getElementById('co-name').value.trim();
    const sdt = document.getElementById('co-phone').value.trim();
    const email = document.getElementById('co-email').value.trim();
    const city = document.getElementById('co-city').value;
    const district = document.getElementById('co-district').value.trim();
    const address = document.getElementById('co-address').value.trim();
    const ghiChu = document.getElementById('co-note').value.trim();

    const selectedPayRadio = document.querySelector('input[name="payment_method"]:checked');
    const payVal = selectedPayRadio ? selectedPayRadio.value : 'COD';

    let ptTT = 'Thanh toán khi nhận hàng (COD)';
    let trangThaiTT = 'Chưa thanh toán (COD)';

    if (payVal === 'VietQR') {
      ptTT = 'Chuyển khoản ngân hàng qua VietQR';
      trangThaiTT = 'Đã thanh toán (Mô phỏng VietQR)';
    } else if (payVal === 'Card') {
      const ccNum = (document.getElementById('cc-number') || {}).value || '';
      const ccHolder = (document.getElementById('cc-holder') || {}).value || '';
      if (!ccNum || ccNum.replace(/\s/g, '').length < 15 || !ccHolder) {
        errEl.textContent = 'Vui lòng điền đầy đủ số thẻ và tên in trên thẻ thanh toán quốc tế.';
        errEl.style.display = 'block';
        return;
      }
      ptTT = 'Thẻ tín dụng / Ghi nợ quốc tế (Visa/Mastercard)';
      trangThaiTT = 'Đã thanh toán trực tuyến';
    } else if (payVal === 'Wallet') {
      ptTT = 'Ví điện tử MoMo / VNPay';
      trangThaiTT = 'Đã thanh toán qua Ví điện tử';
    }

    if (!hoTen || !sdt || !email || !city || !district || !address) {
      errEl.textContent = 'Vui lòng điền đầy đủ các thông tin giao nhận bắt buộc (*).';
      errEl.style.display = 'block';
      return;
    }

    if (!/^[0-9]{9,11}$/.test(sdt.replace(/\s/g, ''))) {
      errEl.textContent = 'Số điện thoại không hợp lệ (yêu cầu từ 9 đến 11 chữ số).';
      errEl.style.display = 'block';
      return;
    }

    // Kiểm tra tồn kho trước khi lưu
    const freshProducts = DB.getProducts();
    const currentCart = DB.getCurrentCart();
    const chiTiet = [];

    for (const item of currentCart) {
      const sp = freshProducts.find(p => p.MaSP === item.MaSP);
      if (!sp || sp.SoLuongTon < item.SoLuong) {
        errEl.textContent = `Sản phẩm "${sp ? sp.TenSP : item.MaSP}" hiện không còn đủ tồn kho (còn ${sp ? sp.SoLuongTon : 0}). Vui lòng cập nhật giỏ hàng.`;
        errEl.style.display = 'block';
        return;
      }
      chiTiet.push({
        MaSP: sp.MaSP,
        TenSP: sp.TenSP,
        DonGia: sp.Gia,
        SoLuong: item.SoLuong,
        HinhAnh: sp.HinhAnh,
        ChatLieu: sp.ChatLieu || ''
      });
    }

    // Nút submit chuyển trạng thái loading
    const submitBtn = document.getElementById('btn-submit-order');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Đang xử lý đơn hàng & xác nhận...';

    setTimeout(() => {
      // Trừ tồn kho
      for (const ct of chiTiet) {
        const sp = freshProducts.find(p => p.MaSP === ct.MaSP);
        if (sp) sp.SoLuongTon = Math.max(0, sp.SoLuongTon - ct.SoLuong);
      }
      DB.saveProducts(freshProducts);

      // Sinh mã đơn hàng
      const maDon = DB.sinhMaDonHang();
      const fullAddress = `${address}, ${district}, ${city}`;

      const newOrder = {
        MaDon: maDon,
        MaTK: user ? user.MaTK : 'GUEST',
        NgayDat: new Date().toISOString(),
        HoTen: hoTen,
        SoDienThoai: sdt,
        Email: email,
        DiaChi: fullAddress,
        TinhThanh: city,
        GhiChu: ghiChu,
        PhuongThucTT: ptTT,
        TrangThaiTT: trangThaiTT,
        TamTinh: subtotal,
        PhiVanChuyen: shipping,
        GiamGia: discountAmount,
        MaVoucher: discountRes.voucher ? discountRes.voucher.code : '',
        TongTien: grandTotal,
        TrangThai: 'Chờ duyệt',
        ChiTiet: chiTiet
      };

      const orders = DB.getOrders();
      orders.unshift(newOrder);
      DB.saveOrders(orders);

      // Làm trống giỏ hàng & voucher
      DB.clearCurrentCart();
      DB.setAppliedVoucher(null);
      updateCartBadge();

      // Hiển thị Màn hình Đặt hàng thành công
      container.innerHTML = `
        <div class="checkout-stepper">
          <div class="step-item done"><span class="step-num">✓</span><span>Giỏ hàng</span></div>
          <div class="step-line active"></div>
          <div class="step-item done"><span class="step-num">✓</span><span>Đặt hàng & Thanh toán</span></div>
          <div class="step-line active"></div>
          <div class="step-item active"><span class="step-num">3</span><span>Hoàn tất đơn hàng</span></div>
        </div>

        <div class="card-box" style="max-width:720px;margin:0 auto 56px;text-align:center;padding:36px 28px;">
          <div style="font-size:3.8rem;margin-bottom:12px;animation:slideUp 0.3s ease;">✅</div>
          <h2 style="font-size:1.6rem;color:var(--olive-dark);margin-bottom:8px;">Đặt hàng thành công!</h2>
          <p style="color:var(--text-muted);font-size:0.95rem;max-width:540px;margin:0 auto 20px;">
            Cảm ơn quý khách <strong>${escapeHTML(hoTen)}</strong> đã tin chọn Nội Thất Mộc An. Đơn hàng của bạn đã được ghi nhận trên hệ thống và đang ở trạng thái <strong>Chờ duyệt</strong>.
          </p>

          <div style="background:var(--bg-page);border:1px dashed var(--border);border-radius:var(--radius-sm);padding:16px;max-width:520px;margin:0 auto 24px;text-align:left;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--border);">
              <span style="font-size:0.9rem;color:var(--text-muted);">Mã đơn hàng:</span>
              <div>
                <strong style="font-size:1.1rem;color:var(--olive-dark);letter-spacing:0.5px;">${escapeHTML(maDon)}</strong>
                <button type="button" class="copy-pill" onclick="copyToClipboard('${escapeHTML(maDon)}', 'Đã chép mã đơn hàng!')">📋 Chép</button>
              </div>
            </div>
            <div style="font-size:0.88rem;line-height:1.7;">
              <div><strong>Người nhận:</strong> ${escapeHTML(hoTen)} – ${escapeHTML(sdt)}</div>
              <div><strong>Địa chỉ:</strong> ${escapeHTML(fullAddress)}</div>
              <div><strong>Phương thức:</strong> ${escapeHTML(ptTT)}</div>
              <div><strong>Trạng thái thanh toán:</strong> <span class="status-badge" style="background:#dcfce7;color:#15803d;">${escapeHTML(trangThaiTT)}</span></div>
              <div><strong>Tổng tiền thanh toán:</strong> <strong style="color:var(--terracotta);">${formatPrice(grandTotal)}</strong></div>
              <div><strong>Dự kiến giao hàng:</strong> 2 – 4 ngày làm việc (kèm thợ lắp ráp miễn phí)</div>
            </div>
          </div>

          <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
            ${user ? `
              <a href="orders.html?id=${encodeURIComponent(maDon)}" class="btn btn-primary btn-lg">
                Theo dõi đơn hàng của tôi →
              </a>
            ` : `
              <a href="orders.html?id=${encodeURIComponent(maDon)}" class="btn btn-primary btn-lg">
                Tra cứu đơn hàng này →
              </a>
            `}
            <button type="button" class="btn btn-outline btn-lg" onclick="openInvoicePrintModalById('${escapeHTML(maDon)}')">
              🖨 In hóa đơn / Lưu đơn
            </button>
            <a href="products.html" class="btn btn-outline btn-lg">
              Tiếp tục mua hàng
            </a>
          </div>
        </div>
      `;

      showToast(`Chúc mừng! Đặt hàng thành công mã ${maDon}`);
    }, 900);
  });
}

/* ---------- 7. ĐƠN HÀNG CỦA TÔI (orders.html - ND08) ---------- */
function initOrdersPage() {
  renderHeader('orders');
  renderFooter();

  const container = document.getElementById('orders-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  let activeMaDon = urlParams.get('id') || null;
  const user = DB.getSession();

  // Khách vãng lai: hỗ trợ đăng nhập hoặc tra cứu đơn hàng theo Mã đơn + SĐT
  if (!user) {
    renderGuestOrdersLookup();
    return;
  }

  // Giao diện cho thành viên đã đăng nhập
  let currentTab = 'ALL';
  let searchKeyword = '';

  function renderOrdersView() {
    const allUserOrders = DB.getOrders().filter(o => o.MaTK === user.MaTK);

    const counts = {
      ALL: allUserOrders.length,
      'Chờ duyệt': allUserOrders.filter(o => o.TrangThai === 'Chờ duyệt').length,
      'Đang giao': allUserOrders.filter(o => o.TrangThai === 'Đang giao').length,
      'Hoàn thành': allUserOrders.filter(o => o.TrangThai === 'Hoàn thành').length,
      'Đã hủy': allUserOrders.filter(o => o.TrangThai === 'Đã hủy').length,
    };

    let filtered = allUserOrders;
    if (currentTab !== 'ALL') {
      filtered = filtered.filter(o => o.TrangThai === currentTab);
    }
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      filtered = filtered.filter(o => {
        const matchCode = o.MaDon.toLowerCase().includes(kw);
        const matchProd = o.ChiTiet && o.ChiTiet.some(ct => ct.TenSP.toLowerCase().includes(kw));
        return matchCode || matchProd;
      });
    }

    // Đơn hàng đang được xem chi tiết
    if (filtered.length > 0) {
      if (!activeMaDon || !filtered.some(o => o.MaDon === activeMaDon)) {
        activeMaDon = filtered[0].MaDon;
      }
    } else {
      activeMaDon = null;
    }
    const selectedOrder = allUserOrders.find(o => o.MaDon === activeMaDon);

    // Render danh sách Order Cards bên trái
    const cardsHTML = filtered.map(o => {
      const isSelected = o.MaDon === activeMaDon;
      const totalItems = (o.ChiTiet || []).reduce((s, it) => s + (it.SoLuong || 1), 0);
      const thumbs = (o.ChiTiet || []).slice(0, 3).map(ct => `
        <img src="${escapeHTML(safeImg(ct.HinhAnh))}" class="order-thumb-mini" alt="${escapeHTML(ct.TenSP)}" onerror="this.src='${FALLBACK_IMG}'">
      `).join('');

      return `
        <div class="order-list-card ${isSelected ? 'active' : ''}" onclick="switchActiveOrder('${escapeHTML(o.MaDon)}')">
          <div class="order-card-header">
            <div>
              <strong style="color:var(--olive-dark);font-size:0.95rem;">${escapeHTML(o.MaDon)}</strong>
              <div style="font-size:0.78rem;color:var(--text-muted);">${formatDate(o.NgayDat)}</div>
            </div>
            <span class="status-badge ${getStatusClass(o.TrangThai)}">${escapeHTML(o.TrangThai)}</span>
          </div>

          <div class="order-thumbs-row">
            ${thumbs}
            ${(o.ChiTiet || []).length > 3 ? `<div style="font-size:0.8rem;align-self:center;color:var(--text-muted);">+${(o.ChiTiet.length - 3)} món</div>` : ''}
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.88rem;margin-top:6px;">
            <span style="color:var(--text-muted);">${totalItems} sản phẩm</span>
            <span style="font-weight:700;color:var(--terracotta);">${formatPrice(o.TongTien)}</span>
          </div>
        </div>
      `;
    }).join('');

    // Render Chi tiết đơn hàng bên phải
    let detailHTML = '';
    if (selectedOrder) {
      const isCancelled = selectedOrder.TrangThai === 'Đã hủy';
      const isPending = selectedOrder.TrangThai === 'Chờ duyệt';
      const isShipping = selectedOrder.TrangThai === 'Đang giao';
      const isDone = selectedOrder.TrangThai === 'Hoàn thành';

      // 4 bước tiến trình
      let trackerHTML = '';
      if (isCancelled) {
        trackerHTML = `
          <div class="order-tracker-steps">
            <div class="tracker-step-item completed">
              <div class="tracker-circle">✓</div>
              <div class="tracker-step-title">Đã đặt hàng</div>
              <div class="tracker-step-desc">${formatDate(selectedOrder.NgayDat).split(' ')[0]}</div>
            </div>
            <div class="tracker-step-item cancelled">
              <div class="tracker-circle">✕</div>
              <div class="tracker-step-title" style="color:#dc2626;">Đã hủy đơn</div>
              <div class="tracker-step-desc">${selectedOrder.LyDoHuy ? escapeHTML(selectedOrder.LyDoHuy) : 'Người mua yêu cầu'}</div>
            </div>
          </div>
        `;
      } else {
        trackerHTML = `
          <div class="order-tracker-steps">
            <div class="tracker-step-item completed">
              <div class="tracker-circle">✓</div>
              <div class="tracker-step-title">Đã đặt hàng</div>
              <div class="tracker-step-desc">Hoàn tất</div>
            </div>
            <div class="tracker-step-item ${isPending ? 'active' : (isShipping || isDone ? 'completed' : '')}">
              <div class="tracker-circle">${isShipping || isDone ? '✓' : '2'}</div>
              <div class="tracker-step-title">Chờ duyệt</div>
              <div class="tracker-step-desc">${isPending ? 'Mộc An đang duyệt' : 'Đã duyệt'}</div>
            </div>
            <div class="tracker-step-item ${isShipping ? 'active' : (isDone ? 'completed' : '')}">
              <div class="tracker-circle">${isDone ? '✓' : '3'}</div>
              <div class="tracker-step-title">Đang giao hàng</div>
              <div class="tracker-step-desc">${isShipping ? 'Đang trên đường giao' : (isDone ? 'Đã giao' : 'Chờ vận chuyển')}</div>
            </div>
            <div class="tracker-step-item ${isDone ? 'completed' : ''}">
              <div class="tracker-circle">${isDone ? '✓' : '4'}</div>
              <div class="tracker-step-title">Hoàn thành</div>
              <div class="tracker-step-desc">${isDone ? 'Giao lắp thành công' : 'Dự kiến 2-4 ngày'}</div>
            </div>
          </div>
        `;
      }

      // Danh sách sản phẩm trong đơn
      const itemsDetailHTML = (selectedOrder.ChiTiet || []).map(ct => `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">
          <div style="display:flex;align-items:center;gap:12px;">
            <a href="product-detail.html?id=${encodeURIComponent(ct.MaSP)}">
              <img src="${escapeHTML(safeImg(ct.HinhAnh))}" alt="${escapeHTML(ct.TenSP)}" style="width:56px;height:46px;object-fit:cover;border-radius:4px;border:1px solid var(--border);" onerror="this.src='${FALLBACK_IMG}'">
            </a>
            <div>
              <a href="product-detail.html?id=${encodeURIComponent(ct.MaSP)}" style="font-weight:600;color:var(--olive-dark);font-size:0.92rem;">${escapeHTML(ct.TenSP)}</a>
              <div style="font-size:0.8rem;color:var(--text-muted);">${formatPrice(ct.DonGia)} × <strong>${ct.SoLuong}</strong></div>
            </div>
          </div>
          <div style="font-weight:700;color:var(--terracotta);">${formatPrice(ct.DonGia * ct.SoLuong)}</div>
        </div>
      `).join('');

      const subtotalCalc = selectedOrder.TamTinh || (selectedOrder.TongTien - (selectedOrder.PhiVanChuyen || 0) + (selectedOrder.GiamGia || 0));

      detailHTML = `
        <div class="card-box">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border);flex-wrap:wrap;">
            <div>
              <div style="font-size:0.85rem;color:var(--text-muted);">Mã đơn hàng:</div>
              <h3 style="font-size:1.25rem;color:var(--olive-dark);">${escapeHTML(selectedOrder.MaDon)}</h3>
              <div style="font-size:0.8rem;color:var(--text-muted);">Ngày đặt: ${formatDate(selectedOrder.NgayDat)}</div>
            </div>
            <div style="text-align:right;">
              <span class="status-badge ${getStatusClass(selectedOrder.TrangThai)}" style="font-size:0.9rem;padding:6px 14px;">${escapeHTML(selectedOrder.TrangThai)}</span>
              ${selectedOrder.TrangThaiTT ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px;">${escapeHTML(selectedOrder.TrangThaiTT)}</div>` : ''}
            </div>
          </div>

          ${trackerHTML}

          <!-- Khung thông tin người nhận -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;background:var(--bg-page);padding:14px;border-radius:6px;font-size:0.88rem;margin-bottom:16px;">
            <div>
              <div><strong>Người nhận:</strong> ${escapeHTML(selectedOrder.HoTen)}</div>
              <div><strong>Số điện thoại:</strong> ${escapeHTML(selectedOrder.SoDienThoai)}</div>
              ${selectedOrder.Email ? `<div><strong>Email:</strong> ${escapeHTML(selectedOrder.Email)}</div>` : ''}
              <div><strong>Địa chỉ:</strong> ${escapeHTML(selectedOrder.DiaChi)}</div>
            </div>
            <div>
              <div><strong>Phương thức thanh toán:</strong> ${escapeHTML(selectedOrder.PhuongThucTT || 'COD')}</div>
              <div><strong>Trạng thái TT:</strong> ${escapeHTML(selectedOrder.TrangThaiTT || 'Chưa thanh toán')}</div>
              ${selectedOrder.GhiChu ? `<div><strong>Ghi chú:</strong> ${escapeHTML(selectedOrder.GhiChu)}</div>` : ''}
              ${selectedOrder.LyDoHuy ? `<div style="color:#dc2626;"><strong>Lý do hủy:</strong> ${escapeHTML(selectedOrder.LyDoHuy)}</div>` : ''}
            </div>
          </div>

          <h4 style="font-size:1rem;margin-bottom:8px;">Danh sách sản phẩm (${(selectedOrder.ChiTiet || []).length})</h4>
          <div style="margin-bottom:16px;">
            ${itemsDetailHTML}
          </div>

          <!-- Bảng tính tiền -->
          <div class="summary-row">
            <span>Tạm tính</span>
            <strong>${formatPrice(subtotalCalc)}</strong>
          </div>
          <div class="summary-row">
            <span>Phí vận chuyển</span>
            <span>${(selectedOrder.PhiVanChuyen === 0 || !selectedOrder.PhiVanChuyen) ? '<strong style="color:var(--olive);">Miễn phí</strong>' : formatPrice(selectedOrder.PhiVanChuyen)}</span>
          </div>
          ${selectedOrder.GiamGia ? `
            <div class="summary-row" style="color:var(--terracotta);">
              <span>Giảm giá voucher (${escapeHTML(selectedOrder.MaVoucher || 'Ưu đãi')})</span>
              <strong>-${formatPrice(selectedOrder.GiamGia)}</strong>
            </div>
          ` : ''}
          <div class="summary-total" style="padding:10px 0 16px;">
            <span>Tổng thanh toán</span>
            <span>${formatPrice(selectedOrder.TongTien)}</span>
          </div>

          <!-- Nút hành động -->
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;">
            ${isPending ? `
              <button type="button" class="btn btn-outline" style="border-color:#dc2626;color:#dc2626;" onclick="openCancelOrderModal('${escapeHTML(selectedOrder.MaDon)}')">
                ✕ Hủy đơn hàng này
              </button>
            ` : ''}
            <button type="button" class="btn btn-outline" onclick="reOrderItems('${escapeHTML(selectedOrder.MaDon)}')">
              🔄 Mua lại đơn này
            </button>
            <button type="button" class="btn btn-primary" onclick="openInvoicePrintModalById('${escapeHTML(selectedOrder.MaDon)}')">
              🖨 In hóa đơn
            </button>
            <a href="tel:0988123456" class="btn btn-outline" style="margin-left:auto;">
              📞 Hỗ trợ: 0988 123 456
            </a>
          </div>
        </div>
      `;
    } else {
      detailHTML = `
        <div class="card-box" style="text-align:center;padding:48px 20px;">
          <p style="color:var(--text-muted);">Không tìm thấy đơn hàng phù hợp với điều kiện lọc.</p>
        </div>
      `;
    }

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
        <div>
          <h2 style="font-size:1.5rem;color:var(--olive-dark);">Đơn hàng của tôi</h2>
          <p style="color:var(--text-muted);font-size:0.88rem;">Theo dõi trạng thái giao lắp và lịch sử mua sắm của bạn tại Mộc An</p>
        </div>
        <div style="display:flex;gap:8px;">
          <input type="text" id="order-search-kw" class="form-control" placeholder="Tìm theo mã đơn hoặc sản phẩm..." value="${escapeHTML(searchKeyword)}" style="width:260px;" oninput="onSearchOrders(this.value)">
        </div>
      </div>

      <!-- Tab trạng thái -->
      <div class="orders-filter-nav">
        <button type="button" class="order-tab-btn ${currentTab === 'ALL' ? 'active' : ''}" onclick="switchOrderTab('ALL')">
          Tất cả <span class="tab-counter">${counts.ALL}</span>
        </button>
        <button type="button" class="order-tab-btn ${currentTab === 'Chờ duyệt' ? 'active' : ''}" onclick="switchOrderTab('Chờ duyệt')">
          Chờ duyệt <span class="tab-counter">${counts['Chờ duyệt']}</span>
        </button>
        <button type="button" class="order-tab-btn ${currentTab === 'Đang giao' ? 'active' : ''}" onclick="switchOrderTab('Đang giao')">
          Đang giao <span class="tab-counter">${counts['Đang giao']}</span>
        </button>
        <button type="button" class="order-tab-btn ${currentTab === 'Hoàn thành' ? 'active' : ''}" onclick="switchOrderTab('Hoàn thành')">
          Hoàn thành <span class="tab-counter">${counts['Hoàn thành']}</span>
        </button>
        <button type="button" class="order-tab-btn ${currentTab === 'Đã hủy' ? 'active' : ''}" onclick="switchOrderTab('Đã hủy')">
          Đã hủy <span class="tab-counter">${counts['Đã hủy']}</span>
        </button>
      </div>

      ${allUserOrders.length === 0 ? `
        <div class="empty-state" style="max-width:620px;margin:40px auto;text-align:center;">
          <div style="font-size:3rem;margin-bottom:12px;">📦</div>
          <h3>Bạn chưa có đơn hàng nào</h3>
          <p style="margin-bottom:20px;color:var(--text-muted);">
            Khám phá ngay các mẫu nội thất gỗ tự nhiên tối giản để làm đẹp cho không gian sống của bạn.
          </p>
          <a href="products.html" class="btn btn-primary btn-lg">Khám phá sản phẩm</a>
        </div>
      ` : `
        <div class="cart-layout" style="align-items:start;">
          <div style="max-height:800px;overflow-y:auto;padding-right:6px;">
            ${cardsHTML || '<p style="color:var(--text-muted);padding:20px;">Không có đơn hàng nào trong mục này.</p>'}
          </div>
          <div>
            ${detailHTML}
          </div>
        </div>
      `}
    `;
  }

  window.switchOrderTab = (tab) => {
    currentTab = tab;
    renderOrdersView();
  };

  window.switchActiveOrder = (maDon) => {
    activeMaDon = maDon;
    renderOrdersView();
  };

  window.onSearchOrders = (val) => {
    searchKeyword = val.trim();
    renderOrdersView();
  };

  window.reOrderItems = (maDon) => {
    const orders = DB.getOrders();
    const order = orders.find(o => o.MaDon === maDon);
    if (!order || !order.ChiTiet || order.ChiTiet.length === 0) return;

    const cart = DB.getCurrentCart();
    const products = DB.getProducts();
    let addedCount = 0;

    order.ChiTiet.forEach(item => {
      const sp = products.find(p => p.MaSP === item.MaSP);
      if (sp && sp.SoLuongTon > 0) {
        const exist = cart.find(c => c.MaSP === item.MaSP);
        if (exist) {
          exist.SoLuong = Math.min(exist.SoLuong + item.SoLuong, sp.SoLuongTon);
        } else {
          cart.push({ MaSP: item.MaSP, SoLuong: Math.min(item.SoLuong, sp.SoLuongTon) });
        }
        addedCount++;
      }
    });

    DB.saveCurrentCart(cart);
    updateCartBadge();
    showToast(`Đã thêm lại ${addedCount} sản phẩm vào giỏ hàng!`);
    setTimeout(() => { window.location.href = 'cart.html'; }, 500);
  };

  renderOrdersView();

  // Tra cứu đơn hàng cho khách vãng lai
  function renderGuestOrdersLookup() {
    container.innerHTML = `
      <div style="max-width:680px;margin:20px auto 48px;">
        <div class="card-box" style="margin-bottom:24px;">
          <h2 style="font-size:1.35rem;margin-bottom:12px;color:var(--olive-dark);">Tra cứu đơn hàng</h2>
          <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:16px;">
            Nếu bạn đã đặt hàng mà chưa đăng nhập hoặc đăng ký tài khoản, vui lòng nhập <strong>Mã đơn hàng</strong> và <strong>Số điện thoại</strong> để kiểm tra tiến trình giao hàng.
          </p>
          <div id="lookup-err" class="alert alert-error" style="display:none;margin-bottom:14px;"></div>
          <form id="guest-lookup-form" style="display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end;">
            <div class="form-group" style="margin-bottom:0;">
              <label for="lookup-code">Mã đơn hàng</label>
              <input type="text" id="lookup-code" class="form-control" placeholder="Ví dụ: DH20261124001" value="${escapeHTML(activeMaDon || '')}" required style="text-transform:uppercase;">
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label for="lookup-phone">Số điện thoại đặt hàng</label>
              <input type="tel" id="lookup-phone" class="form-control" placeholder="0988123456" required>
            </div>
            <button type="submit" class="btn btn-primary" style="height:42px;">Tra cứu ngay</button>
          </form>
        </div>

        <div id="lookup-result"></div>

        <div class="card-box" style="text-align:center;background:var(--bg-page);">
          <h3 style="font-size:1.1rem;margin-bottom:8px;">Bạn muốn quản lý tất cả đơn hàng dễ dàng?</h3>
          <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:16px;">Đăng nhập để xem toàn bộ lịch sử đơn hàng, địa chỉ giao hàng và nhận ưu đãi độc quyền.</p>
          <div style="display:flex;justify-content:center;gap:12px;">
            <a href="auth.html?return=orders.html" class="btn btn-primary">Đăng nhập tài khoản</a>
            <a href="auth.html#register" class="btn btn-outline">Đăng ký thành viên mới</a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('guest-lookup-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const code = document.getElementById('lookup-code').value.trim().toUpperCase();
      const phone = document.getElementById('lookup-phone').value.trim();
      const errEl = document.getElementById('lookup-err');
      const resEl = document.getElementById('lookup-result');
      errEl.style.display = 'none';

      const orders = DB.getOrders();
      const found = orders.find(o => o.MaDon.toUpperCase() === code && o.SoDienThoai.replace(/\s/g, '') === phone.replace(/\s/g, ''));

      if (!found) {
        errEl.textContent = 'Không tìm thấy đơn hàng với mã và số điện thoại trên. Quý khách vui lòng kiểm tra lại.';
        errEl.style.display = 'block';
        resEl.innerHTML = '';
        return;
      }

      resEl.innerHTML = `
        <div class="card-box" style="margin-bottom:24px;border:2px solid var(--olive);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--border);">
            <div>
              <span style="font-size:0.85rem;color:var(--text-muted);">Mã đơn:</span>
              <h3 style="color:var(--olive-dark);">${escapeHTML(found.MaDon)}</h3>
              <div style="font-size:0.8rem;color:var(--text-muted);">${formatDate(found.NgayDat)}</div>
            </div>
            <span class="status-badge ${getStatusClass(found.TrangThai)}" style="font-size:0.92rem;padding:6px 14px;">${escapeHTML(found.TrangThai)}</span>
          </div>

          <div style="font-size:0.88rem;line-height:1.7;margin-bottom:14px;background:var(--bg-page);padding:12px;border-radius:6px;">
            <div><strong>Người nhận:</strong> ${escapeHTML(found.HoTen)} – ${escapeHTML(found.SoDienThoai)}</div>
            <div><strong>Địa chỉ:</strong> ${escapeHTML(found.DiaChi)}</div>
            <div><strong>Thanh toán:</strong> ${escapeHTML(found.PhuongThucTT || 'COD')} (${escapeHTML(found.TrangThaiTT || 'Chưa thanh toán')})</div>
          </div>

          <div style="margin-bottom:14px;">
            ${(found.ChiTiet || []).map(ct => `
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:0.9rem;">
                <span>${escapeHTML(ct.TenSP)} × <strong>${ct.SoLuong}</strong></span>
                <strong style="color:var(--terracotta);">${formatPrice(ct.DonGia * ct.SoLuong)}</strong>
              </div>
            `).join('')}
          </div>

          <div class="summary-total" style="padding:10px 0 16px;">
            <span>Tổng cộng:</span>
            <span>${formatPrice(found.TongTien)}</span>
          </div>

          <div style="display:flex;gap:10px;">
            <button type="button" class="btn btn-outline" onclick="openInvoicePrintModalById('${escapeHTML(found.MaDon)}')">
              🖨 In hóa đơn
            </button>
            <a href="tel:0988123456" class="btn btn-primary">📞 Gọi hỗ trợ đơn hàng</a>
          </div>
        </div>
      `;
    });
  }
}

/* ---------- 8. MODAL HỦY ĐƠN & IN HÓA ĐƠN ĐƠN HÀNG ---------- */

// Modal Hủy Đơn Hàng có lý do & hoàn trả tồn kho
window.openCancelOrderModal = (maDon) => {
  const existingModal = document.getElementById('cancel-order-modal');
  if (existingModal) existingModal.remove();

  const modalEl = document.createElement('div');
  modalEl.id = 'cancel-order-modal';
  modalEl.className = 'modal-backdrop';
  modalEl.innerHTML = `
    <div class="modal-dialog-box">
      <div class="modal-header-row">
        <h3 style="font-size:1.25rem;color:var(--olive-dark);">Xác nhận hủy đơn hàng</h3>
        <button type="button" class="modal-close-btn" onclick="document.getElementById('cancel-order-modal').remove()">×</button>
      </div>
      <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:16px;">
        Quý khách có chắc chắn muốn hủy đơn hàng <strong>${escapeHTML(maDon)}</strong>? Xin vui lòng chọn hoặc cho Mộc An biết lý do hủy đơn:
      </p>

      <div class="form-group">
        <label for="cancel-reason-select">Lý do hủy đơn hàng <span style="color:#dc2626;">*</span></label>
        <select id="cancel-reason-select" class="form-control" onchange="toggleCustomReason(this.value)">
          <option value="Thay đổi ý định mua hàng">Thay đổi ý định mua hàng</option>
          <option value="Muốn thay đổi sản phẩm hoặc kích thước">Muốn thay đổi sản phẩm hoặc kích thước</option>
          <option value="Muốn thay đổi địa chỉ hoặc thời gian nhận hàng">Muốn thay đổi địa chỉ hoặc thời gian nhận hàng</option>
          <option value="Đặt nhầm hoặc trùng đơn hàng">Đặt nhầm hoặc trùng đơn hàng</option>
          <option value="Tìm thấy mức giá hoặc sản phẩm phù hợp hơn">Tìm thấy mức giá hoặc sản phẩm phù hợp hơn</option>
          <option value="other">Lý do khác...</option>
        </select>
      </div>

      <div class="form-group" id="custom-reason-group" style="display:none;">
        <label for="cancel-reason-custom">Nhập lý do chi tiết</label>
        <textarea id="cancel-reason-custom" class="form-control" rows="2" placeholder="Nhập lý do của bạn..."></textarea>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
        <button type="button" class="btn btn-outline" onclick="document.getElementById('cancel-order-modal').remove()">
          Giữ lại đơn hàng
        </button>
        <button type="button" class="btn btn-danger" onclick="confirmCancelOrder('${escapeHTML(maDon)}')">
          Xác nhận hủy đơn
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);

  window.toggleCustomReason = (val) => {
    const customGroup = document.getElementById('custom-reason-group');
    if (customGroup) customGroup.style.display = val === 'other' ? 'block' : 'none';
  };

  window.confirmCancelOrder = (orderId) => {
    const select = document.getElementById('cancel-reason-select');
    let reason = select ? select.value : 'Người mua yêu cầu';
    if (reason === 'other') {
      const customInput = document.getElementById('cancel-reason-custom');
      reason = (customInput && customInput.value.trim()) ? customInput.value.trim() : 'Lý do khác';
    }

    const orders = DB.getOrders();
    const target = orders.find(o => o.MaDon === orderId);
    if (!target || target.TrangThai !== 'Chờ duyệt') {
      showToast('Không thể hủy đơn hàng này do đơn đã được tiếp nhận vận chuyển.', 'error');
      modalEl.remove();
      return;
    }

    target.TrangThai = 'Đã hủy';
    target.LyDoHuy = reason;
    target.NgayHuy = new Date().toISOString();
    DB.saveOrders(orders);

    // Hoàn trả tồn kho cho sản phẩm
    const products = DB.getProducts();
    if (target.ChiTiet) {
      for (const ct of target.ChiTiet) {
        const sp = products.find(p => p.MaSP === ct.MaSP);
        if (sp) sp.SoLuongTon += ct.SoLuong;
      }
      DB.saveProducts(products);
    }

    modalEl.remove();
    showToast(`Đã hủy thành công đơn hàng ${orderId}. Số lượng sản phẩm đã được hoàn lại.`);
    if (typeof initOrdersPage === 'function') {
      initOrdersPage();
    }
  };
};

// Modal In Hóa Đơn Bán Hàng chuyên nghiệp
window.openInvoicePrintModalById = (maDon) => {
  const orders = DB.getOrders();
  const order = orders.find(o => o.MaDon === maDon);
  if (!order) {
    showToast('Không tìm thấy thông tin đơn hàng.', 'error');
    return;
  }

  const existingModal = document.getElementById('invoice-modal');
  if (existingModal) existingModal.remove();

  const subtotal = order.TamTinh || (order.TongTien - (order.PhiVanChuyen || 0) + (order.GiamGia || 0));

  const modalEl = document.createElement('div');
  modalEl.id = 'invoice-modal';
  modalEl.className = 'modal-backdrop';
  modalEl.innerHTML = `
    <div class="modal-dialog-box" style="max-width:680px;">
      <div class="modal-header-row no-print">
        <h3 style="font-size:1.25rem;color:var(--olive-dark);">Hóa đơn bán hàng – ${escapeHTML(order.MaDon)}</h3>
        <button type="button" class="modal-close-btn" onclick="document.getElementById('invoice-modal').remove()">×</button>
      </div>

      <div class="printable-invoice">
        <!-- Header Hóa đơn -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid var(--olive-dark);padding-bottom:14px;margin-bottom:18px;">
          <div>
            <h2 style="font-size:1.5rem;color:var(--olive-dark);margin-bottom:2px;">NỘI THẤT MỘC AN</h2>
            <div style="font-size:0.82rem;color:#555;line-height:1.5;">
              <div>Showroom: 128 Nguyễn Văn Linh, Mỹ Hào, Hưng Yên</div>
              <div>Hotline: 0988 123 456 · Email: cskh@mocan.vn</div>
              <div>Website: www.noithatmocan.vn</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:1.3rem;font-weight:700;color:var(--olive-dark);">HÓA ĐƠN BÁN HÀNG</div>
            <div style="font-size:0.9rem;font-family:monospace;font-weight:700;">#${escapeHTML(order.MaDon)}</div>
            <div style="font-size:0.8rem;color:#666;">Ngày: ${formatDate(order.NgayDat)}</div>
          </div>
        </div>

        <!-- Khách hàng -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px;font-size:0.88rem;background:#fafafa;padding:12px;border-radius:4px;">
          <div>
            <div style="color:#777;font-size:0.78rem;text-transform:uppercase;">Khách hàng nhận:</div>
            <div style="font-weight:700;font-size:0.95rem;">${escapeHTML(order.HoTen)}</div>
            <div>Số điện thoại: ${escapeHTML(order.SoDienThoai)}</div>
            ${order.Email ? `<div>Email: ${escapeHTML(order.Email)}</div>` : ''}
            <div>Địa chỉ: ${escapeHTML(order.DiaChi)}</div>
          </div>
          <div>
            <div style="color:#777;font-size:0.78rem;text-transform:uppercase;">Thông tin thanh toán:</div>
            <div>Phương thức: <strong>${escapeHTML(order.PhuongThucTT || 'COD')}</strong></div>
            <div>Trạng thái: <strong>${escapeHTML(order.TrangThaiTT || 'Chưa thanh toán')}</strong></div>
            <div>Tiến độ đơn: <strong>${escapeHTML(order.TrangThai)}</strong></div>
            ${order.GhiChu ? `<div>Ghi chú: ${escapeHTML(order.GhiChu)}</div>` : ''}
          </div>
        </div>

        <!-- Bảng sản phẩm -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:0.88rem;">
          <thead>
            <tr style="background:#52614b;color:#fff;text-align:left;">
              <th style="padding:8px 10px;width:36px;">STT</th>
              <th style="padding:8px 10px;">Sản phẩm</th>
              <th style="padding:8px 10px;text-align:right;">Đơn giá</th>
              <th style="padding:8px 10px;text-align:center;width:60px;">SL</th>
              <th style="padding:8px 10px;text-align:right;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${(order.ChiTiet || []).map((ct, idx) => `
              <tr style="border-bottom:1px solid #ddd;">
                <td style="padding:8px 10px;text-align:center;">${idx + 1}</td>
                <td style="padding:8px 10px;">
                  <strong>${escapeHTML(ct.TenSP)}</strong>
                  ${ct.ChatLieu ? `<div style="font-size:0.78rem;color:#666;">Chất liệu: ${escapeHTML(ct.ChatLieu)}</div>` : ''}
                </td>
                <td style="padding:8px 10px;text-align:right;">${formatPrice(ct.DonGia)}</td>
                <td style="padding:8px 10px;text-align:center;">${ct.SoLuong}</td>
                <td style="padding:8px 10px;text-align:right;font-weight:600;">${formatPrice(ct.DonGia * ct.SoLuong)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Tổng kết tiền -->
        <div style="display:flex;justify-content:flex-end;margin-bottom:24px;">
          <div style="width:260px;font-size:0.9rem;">
            <div style="display:flex;justify-content:space-between;padding:4px 0;">
              <span>Tạm tính:</span>
              <strong>${formatPrice(subtotal)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;">
              <span>Phí vận chuyển:</span>
              <span>${(order.PhiVanChuyen === 0 || !order.PhiVanChuyen) ? 'Miễn phí' : formatPrice(order.PhiVanChuyen)}</span>
            </div>
            ${order.GiamGia ? `
              <div style="display:flex;justify-content:space-between;padding:4px 0;color:#b4684b;">
                <span>Giảm giá:</span>
                <strong>-${formatPrice(order.GiamGia)}</strong>
              </div>
            ` : ''}
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid #333;font-size:1.05rem;font-weight:700;color:var(--terracotta);">
              <span>TỔNG CỘNG:</span>
              <span>${formatPrice(order.TongTien)}</span>
            </div>
          </div>
        </div>

        <!-- Chữ ký -->
        <div style="display:grid;grid-template-columns:1fr 1fr;text-align:center;font-size:0.86rem;margin-top:24px;padding-top:12px;">
          <div>
            <strong>Người mua hàng</strong>
            <div style="color:#777;font-size:0.78rem;">(Ký và ghi rõ họ tên)</div>
            <div style="height:60px;"></div>
            <div>${escapeHTML(order.HoTen)}</div>
          </div>
          <div>
            <strong>Đại diện Nội Thất Mộc An</strong>
            <div style="color:#777;font-size:0.78rem;">(Ký, đóng dấu)</div>
            <div style="height:60px;"></div>
            <div style="font-weight:600;color:var(--olive-dark);">Mộc An Furniture</div>
          </div>
        </div>
      </div>

      <!-- Nút hành động Modal -->
      <div class="no-print" style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;padding-top:14px;border-top:1px solid var(--border);">
        <button type="button" class="btn btn-outline" onclick="document.getElementById('invoice-modal').remove()">Đóng</button>
        <button type="button" class="btn btn-primary" onclick="window.print()">🖨 In ngay (Print)</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);
};
