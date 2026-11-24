/* ==========================================================================
   MỘC AN FURNITURE - CART CONTROLLER (cart.html - ND06)
   ========================================================================== */

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
