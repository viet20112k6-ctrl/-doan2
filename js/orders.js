/* ==========================================================================
   MỘC AN FURNITURE - ORDERS CONTROLLER (orders.html - ND08)
   ========================================================================== */

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

/* ---------- MODAL HỦY ĐƠN & IN HÓA ĐƠN ĐƠN HÀNG ---------- */

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
