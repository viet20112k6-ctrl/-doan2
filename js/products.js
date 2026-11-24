/* ==========================================================================
   MỘC AN FURNITURE - PRODUCTS CATALOG CONTROLLER (products.html - ND01, ND02)
   ========================================================================== */

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
