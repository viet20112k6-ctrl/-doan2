"use strict";
// Mỗi trang HTML có data-page. Tất cả trang dùng cùng dữ liệu và cùng các hàm bên dưới.
const APP_ROOT = new URL("../", document.currentScript.src);
const PAGES = {
  home: "index.html",
  shop: "san-pham.html",
  detail: "chi-tiet-san-pham.html",
  cart: "gio-hang.html",
  checkout: "dat-hang.html",
  orders: "don-hang.html",
  admin: "quan-tri.html",
  login: "dang-nhap.html",
  register: "dang-ky.html",
};
// Tên ảnh được ánh xạ đến thư mục images; sản phẩm chỉ lưu khóa ảnh để tránh đầy localStorage.
const ASSETS = {
  hero: "images/hero.jpg",
  living: "images/living.jpg",
  bedroom: "images/bedroom.jpg",
  dining: "images/dining.jpg",
  inspiration: "images/inspiration.jpg",
  sofa: "images/sofa.jpg",
  wardrobe: "images/wardrobe.jpg",
  chair: "images/chair.jpg",
  coffee: "images/coffee.jpg",
};
const CATEGORIES = ["Phòng Khách", "Phòng Ngủ", "Phòng Ăn"];
const STATUSES = ["Chờ xác nhận", "Đang giao", "Hoàn thành", "Đã hủy"];
const NEXT_STATUSES = {
  "Chờ xác nhận": ["Chờ xác nhận", "Đang giao", "Đã hủy"],
  "Đang giao": ["Đang giao", "Hoàn thành", "Đã hủy"],
  "Hoàn thành": ["Hoàn thành"],
  "Đã hủy": ["Đã hủy"],
};
const DEFAULT_PRODUCTS = [
  {
    id: "1",
    name: "Sofa An Nhiên",
    category: "Phòng Khách",
    price: 12990000,
    oldPrice: 15000000,
    images: ["sofa", "living"],
    description:
      "Sofa băng ba với đường nét gọn gàng và nệm vải êm ái. Tông màu trung tính dễ kết hợp với bàn trà và những góc phòng khách nhiều ánh sáng.",
    colors: [
      { name: "Xanh lá", hex: "#31564b" },
      { name: "Be", hex: "#d9cbb5" },
    ],
    sizes: ["Băng 3 (2 m)"],
  },
  {
    id: "2",
    name: "Giường Vân Mộc",
    category: "Phòng Ngủ",
    price: 7490000,
    oldPrice: 8500000,
    images: ["bedroom"],
    description:
      "Thiết kế giường đơn giản với sắc gỗ tự nhiên. Kiểu dáng nhẹ nhàng tạo cảm giác thoáng đãng, phù hợp với phòng ngủ hiện đại.",
    colors: [
      { name: "Tự nhiên", hex: "#c9a879" },
      { name: "Nâu", hex: "#745039" },
    ],
    sizes: ["1,6 m × 2 m", "1,8 m × 2 m"],
  },
  {
    id: "3",
    name: "Bàn ăn Gia An",
    category: "Phòng Ăn",
    price: 5290000,
    oldPrice: 6000000,
    images: ["dining"],
    description:
      "Bàn ăn có mặt bàn rộng vừa đủ cho những bữa cơm sum họp. Đường nét tối giản và tông gỗ ấm tạo điểm nhấn gần gũi cho không gian ăn uống.",
    colors: [{ name: "Sồi", hex: "#cda777" }],
    sizes: ["Dài 1,4 m", "Dài 1,6 m"],
  },
  {
    id: "4",
    name: "Tủ quần áo Sora",
    category: "Phòng Ngủ",
    price: 10990000,
    oldPrice: 12500000,
    images: ["wardrobe"],
    description:
      "Tủ quần áo với thiết kế gọn gàng, nhiều khoảng chứa để sắp xếp đồ dùng. Sắc trắng dễ kết hợp với nội thất phòng ngủ.",
    colors: [{ name: "Trắng", hex: "#f7f7f4" }],
    sizes: ["Rộng 1,6 m", "Rộng 2 m"],
  },
  {
    id: "5",
    name: "Ghế ăn Nệm Mây",
    category: "Phòng Ăn",
    price: 1290000,
    oldPrice: 1500000,
    images: ["chair"],
    description:
      "Ghế ăn bọc nệm có phần tựa lưng mềm mại và dáng ghế thanh thoát. Dễ phối cùng bàn ăn cho một không gian ấm cúng.",
    colors: [
      { name: "Xám", hex: "#858782" },
      { name: "Xanh navy", hex: "#334762" },
    ],
    sizes: ["Tiêu chuẩn"],
  },
  {
    id: "6",
    name: "Bàn trà kính Luma",
    category: "Phòng Khách",
    price: 2190000,
    oldPrice: 2800000,
    images: ["coffee"],
    description:
      "Bàn trà nhỏ gọn với mặt tròn, phù hợp đặt cạnh sofa hoặc trong góc thư giãn. Kiểu dáng tinh giản giúp phòng khách nhẹ nhàng hơn.",
    colors: [{ name: "Kính trong", hex: "#d9e6df" }],
    sizes: ["Đường kính 80 cm"],
  },
];
const STORE_KEY = "encivi_store_v3",
  LEGACY_STORE_KEY = "encivi_store_v2";
const $ = (id) => document.getElementById(id);
const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const money = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
const plain = (value) => String(value ?? "").trim();
const normalize = (value) =>
  plain(value)
    .toLocaleLowerCase("vi-VN")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
const clone = (value) => JSON.parse(JSON.stringify(value));
const icon = (name) =>
  `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const validPrice = (value) =>
  Number.isSafeInteger(Number(value)) &&
  Number(value) >= 1000 &&
  Number(value) <= 1000000000;
const validImage = (value) =>
  typeof value === "string" &&
  (Object.hasOwn(ASSETS, value) || /^https:\/\//i.test(value));
const imageSrc = (ref) =>
  Object.hasOwn(ASSETS, ref)
    ? new URL(ASSETS[ref], APP_ROOT).href
    : validImage(ref)
      ? ref
      : new URL(ASSETS.sofa, APP_ROOT).href;
function normalProduct(p) {
  if (
    !p ||
    !plain(p.id) ||
    !plain(p.name) ||
    !CATEGORIES.includes(p.category) ||
    !validPrice(p.price) ||
    !Array.isArray(p.images) ||
    !p.images.some(validImage)
  )
    return null;
  const colors = Array.isArray(p.colors)
    ? p.colors
        .filter((c) => c && plain(c.name))
        .map((c) => ({
          name: plain(c.name).slice(0, 40),
          hex: /^#[0-9a-f]{3,6}$/i.test(c.hex) ? c.hex : "#b8b7ad",
        }))
        .slice(0, 12)
    : [];
  const sizes = Array.isArray(p.sizes)
    ? p.sizes
        .filter((s) => typeof s === "string" && s.trim())
        .map((s) => s.slice(0, 80))
        .slice(0, 12)
    : [];
  return {
    id: plain(p.id).slice(0, 70),
    name: plain(p.name).slice(0, 120),
    category: p.category,
    price: Number(p.price),
    oldPrice:
      validPrice(p.oldPrice) && Number(p.oldPrice) > Number(p.price)
        ? Number(p.oldPrice)
        : 0,
    images: p.images.filter(validImage).slice(0, 4),
    description: plain(p.description).slice(0, 1500),
    colors: colors.length ? colors : [{ name: "Mặc định", hex: "#b8b7ad" }],
    sizes: sizes.length ? sizes : ["Tiêu chuẩn"],
  };
}
function normalItem(i) {
  if (
    !i ||
    !plain(i.id) ||
    !plain(i.name) ||
    !validPrice(i.price) ||
    !Number.isInteger(i.quantity) ||
    i.quantity < 1 ||
    i.quantity > 99
  )
    return null;
  const color = plain(i.color) || "Mặc định",
    size = plain(i.size) || "Tiêu chuẩn",
    id = plain(i.id);
  return {
    cartId:
      plain(i.cartId) ||
      `${id}:${encodeURIComponent(color)}:${encodeURIComponent(size)}`,
    id,
    name: plain(i.name).slice(0, 120),
    price: Number(i.price),
    image: validImage(i.image) ? i.image : "sofa",
    color: color.slice(0, 40),
    size: size.slice(0, 80),
    quantity: i.quantity,
  };
}
function normalOrder(o) {
  if (
    !o ||
    !plain(o.id) ||
    !Array.isArray(o.items) ||
    !o.customer ||
    !STATUSES.includes(o.status)
  )
    return null;
  const items = o.items.map(normalItem).filter(Boolean);
  if (!items.length) return null;
  return {
    id: plain(o.id).slice(0, 70),
    userId: plain(o.userId) || null,
    accountUsername: plain(o.accountUsername).slice(0, 30),
    date: plain(o.date).slice(0, 50),
    createdAt: plain(o.createdAt),
    items,
    total: items.reduce((s, i) => s + i.price * i.quantity, 0),
    customer: {
      name: plain(o.customer.name).slice(0, 100),
      phone: plain(o.customer.phone).slice(0, 18),
      email: plain(o.customer.email).slice(0, 120),
      address: plain(o.customer.address).slice(0, 240),
      note: plain(o.customer.note).slice(0, 300),
    },
    method: ["Chuyển khoản", "BankTransfer", "Chuyển khoản ngân hàng"].includes(
      o.method,
    )
      ? "Chuyển khoản ngân hàng"
      : "Thanh toán khi nhận hàng (COD)",
    status: o.status,
  };
}
let currentUser = EnciviAuth.current();
let cartBuckets = {};
let storageWarning = false;
const cartOwner = () => currentUser?.id || "guest";
const myOrders = () =>
  currentUser
    ? state.orders.filter((order) => order.userId === currentUser.id)
    : [];
function loadState() {
  let raw = {};
  try {
    const saved =
      localStorage.getItem(STORE_KEY) || localStorage.getItem(LEGACY_STORE_KEY);
    if (saved) raw = JSON.parse(saved);
    else {
      const readLegacy = (key) => {
        const s = localStorage.getItem(key);
        return s ? JSON.parse(s) : undefined;
      };
      raw = {
        products: readLegacy("moho_products"),
        cart: readLegacy("moho_cart"),
        orders: readLegacy("moho_orders"),
      };
    }
  } catch {
    storageWarning = true;
  }
  if (!raw || typeof raw !== "object") raw = {};
  const products = Array.isArray(raw.products)
    ? raw.products.map(normalProduct).filter(Boolean)
    : clone(DEFAULT_PRODUCTS);
  const uniqueProducts = products.filter(
    (p, index) => products.findIndex((q) => q.id === p.id) === index,
  );
  // Mỗi tài khoản có một giỏ riêng; dữ liệu cũ chưa đăng nhập nằm ở giỏ khách vãng lai.
  const cleanCart = (items) =>
    Array.isArray(items)
      ? items
          .map(normalItem)
          .filter(Boolean)
          .filter((item) =>
            uniqueProducts.some((product) => product.id === item.id),
          )
          .map((item) => {
            const product = uniqueProducts.find(
              (product) => product.id === item.id,
            );
            return {
              ...item,
              name: product.name,
              price: product.price,
              image: product.images[0],
            };
          })
      : [];
  cartBuckets = Object.create(null);
  if (raw.carts && typeof raw.carts === "object" && !Array.isArray(raw.carts)) {
    for (const [owner, items] of Object.entries(raw.carts))
      if (/^(guest|encivi-admin|customer-[a-z0-9-]+)$/i.test(owner))
        cartBuckets[owner] = cleanCart(items);
  } else cartBuckets.guest = cleanCart(raw.cart);
  const cart = cartBuckets[cartOwner()] || [];
  const orders = Array.isArray(raw.orders)
    ? raw.orders.map(normalOrder).filter(Boolean)
    : [];
  return {
    products: uniqueProducts,
    cart,
    orders: orders.filter(
      (o, index) => orders.findIndex((q) => q.id === o.id) === index,
    ),
  };
}
let state = loadState(),
  role = currentUser?.role || null,
  activeView = document.body.dataset.page || "home",
  activeId = null,
  detailColor = 0,
  detailSize = 0,
  detailQuantity = 1,
  activeThumb = 0;
let filters = { category: "all", query: "", sort: "featured" },
  pendingRoute = null,
  confirmation = null,
  toastTimer;
// Lưu tất cả giỏ hàng trong một lần; chỉ thay giỏ của tài khoản đang đăng nhập.
function commit(patch, bucketPatch = {}) {
  const next = { ...state, ...patch };
  const carts = { ...cartBuckets, ...bucketPatch, [cartOwner()]: next.cart };
  for (const owner of Object.keys(carts)) {
    carts[owner] = carts[owner]
      .filter((item) => next.products.some((product) => product.id === item.id))
      .map((item) => {
        const product = next.products.find((product) => product.id === item.id);
        return {
          ...item,
          name: product.name,
          price: product.price,
          image: product.images[0],
        };
      });
  }
  try {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        version: 3,
        products: next.products,
        carts,
        orders: next.orders,
      }),
    );
  } catch {
    toast(
      "Không lưu được dữ liệu. Hãy cho phép lưu trữ hoặc giải phóng dung lượng trình duyệt.",
      true,
    );
    return false;
  }
  cartBuckets = carts;
  state = { ...next, cart: carts[cartOwner()] };
  updateBadges();
  return true;
}
function toast(message, error = false) {
  clearTimeout(toastTimer);
  $("toastText").textContent = message;
  $("toast").classList.toggle("error", error);
  $("toast").hidden = false;
  toastTimer = setTimeout(() => ($("toast").hidden = true), 4500);
}
function updateBadges() {
  const count = state.cart.reduce((s, i) => s + i.quantity, 0);
  $("cartBadge").textContent = count;
  $("cartBadge").hidden = !count;
  $("cartCount").textContent = `(${count})`;
  $("orderBadge").textContent = myOrders().length;
  $("orderBadge").hidden = !myOrders().length;
  $("cartButton").setAttribute("aria-label", `Giỏ hàng, ${count} sản phẩm`);
  document
    .querySelectorAll(".admin-nav")
    .forEach((el) => (el.hidden = role !== "admin"));
  $("accountButton").setAttribute(
    "aria-label",
    currentUser ? `Tài khoản: ${currentUser.fullName}` : "Đăng nhập tài khoản",
  );
  $("accountButton").title = currentUser
    ? `${currentUser.fullName} (@${currentUser.username})`
    : "Đăng nhập / Đăng ký";
  $("accountButton").classList.toggle("signed-in", !!currentUser);
}
function openDialog(id) {
  const d = $(id);
  document.querySelectorAll("dialog[open]").forEach((el) => {
    if (el !== d) el.close();
  });
  if (!d.open) d.showModal();
  document.body.style.overflow = "hidden";
}
function closeDialog(d) {
  if (d?.open) d.close();
  if (!document.querySelector("dialog[open]"))
    document.body.style.overflow = "";
}
function closeAllDialogs() {
  document.querySelectorAll("dialog[open]").forEach(closeDialog);
}
function setMobileMenu(open) {
  $("mobileMenu").hidden = !open;
  $("menuButton").setAttribute("aria-expanded", String(open));
  $("menuButton").setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
}

// Liên kết thật giữa các file HTML, thay cho việc ẩn/hiện nhiều mục trong index.html.
function pageURL(view, id) {
  const url = new URL(PAGES[view] || PAGES.home, APP_ROOT);
  if (view === "detail" && id != null) url.searchParams.set("id", String(id));
  if (view === "shop") {
    if (filters.query) url.searchParams.set("q", filters.query);
    if (filters.category !== "all")
      url.searchParams.set("category", filters.category);
    if (filters.sort !== "featured") url.searchParams.set("sort", filters.sort);
  }
  return url.href;
}
function navigate(view, id) {
  syncSession();
  setMobileMenu(false);
  closeAllDialogs();
  if (view === "checkout") {
    if (!state.cart.length) {
      toast("Giỏ hàng đang trống. Hãy chọn sản phẩm trước.", true);
      return;
    }
    if (!role) {
      location.assign(loginURL("checkout"));
      return;
    }
  }
  if (view === "admin" && role !== "admin") {
    location.assign(loginURL("admin"));
    return;
  }
  const url = pageURL(view, id);
  if (location.href === url) renderCurrentPage();
  else location.assign(url);
  return url;
}
function updateFilterURL() {
  if (activeView !== "shop") return;
  const url = new URL(location.href);
  ["q", "category", "sort"].forEach((key) => url.searchParams.delete(key));
  if (filters.query) url.searchParams.set("q", filters.query);
  if (filters.category !== "all")
    url.searchParams.set("category", filters.category);
  if (filters.sort !== "featured") url.searchParams.set("sort", filters.sort);
  history.replaceState(null, "", url.href);
}
function renderCurrentPage() {
  document.querySelectorAll(".nav-item[data-view]").forEach((el) => {
    const active =
      el.dataset.view === activeView ||
      (activeView === "detail" && el.dataset.view === "shop");
    if (active) el.setAttribute("aria-current", "page");
    else el.removeAttribute("aria-current");
  });
  if (activeView === "shop") renderShop();
  if (activeView === "detail") renderDetail();
  if (activeView === "orders") renderOrders();
  if (activeView === "cart") renderCart();
  if (activeView === "checkout") renderCheckout();
  if (["login", "register"].includes(activeView)) renderAuthentication();
  if (activeView === "admin") {
    $("adminContent").hidden = role !== "admin";
    $("adminGate").hidden = role === "admin";
    if (role === "admin") renderAdmin();
  }
  const titles = {
    home: "Nội thất cho tổ ấm",
    shop: "Sản phẩm",
    detail:
      state.products.find((p) => p.id === activeId)?.name ||
      "Chi tiết sản phẩm",
    cart: "Giỏ hàng của bạn",
    orders: "Đơn hàng của bạn",
    checkout: "Thông tin đặt hàng",
    admin: "Quản lý cửa hàng",
    login:
      new URLSearchParams(location.search).get("mode") === "admin"
        ? "Đăng nhập quản trị"
        : "Đăng nhập",
    register: "Đăng ký tài khoản",
  };
  document.title = `${titles[activeView]} | EnCiVi`;
}
function filteredProducts() {
  let result = state.products.filter(
    (p) =>
      (filters.category === "all" || p.category === filters.category) &&
      normalize(p.name + " " + p.category).includes(normalize(filters.query)),
  );
  if (filters.sort === "price-asc") result.sort((a, b) => a.price - b.price);
  if (filters.sort === "price-desc") result.sort((a, b) => b.price - a.price);
  return result;
}
function renderCategories() {
  const options = [
    { value: "all", label: "Tất cả", count: state.products.length },
    ...CATEGORIES.map((c) => ({
      value: c,
      label: c,
      count: state.products.filter((p) => p.category === c).length,
    })),
  ];
  $("categoryList").innerHTML = options
    .map(
      (c) =>
        `<label class="category-option"><input type="radio" name="category" value="${escapeHTML(c.value)}" ${filters.category === c.value ? "checked" : ""}><span>${escapeHTML(c.label)}</span><span class="category-count">${c.count}</span></label>`,
    )
    .join("");
}
function renderShop() {
  if (!$("productGrid")) return;
  renderCategories();
  const products = filteredProducts();
  $("resultCount").textContent =
    `${products.length} sản phẩm${filters.query ? ` cho “${filters.query}”` : ""}`;
  $("noProducts").hidden = products.length > 0;
  $("productGrid").hidden = !products.length;
  $("productGrid").innerHTML = products
    .map(
      (p) =>
        `<article class="product-card"><a class="product-photo" href="${escapeHTML(pageURL("detail", p.id))}" aria-label="Xem ${escapeHTML(p.name)}"><img src="${escapeHTML(imageSrc(p.images[0]))}" data-image-ref="${escapeHTML(p.images[0])}" alt="${escapeHTML(p.name)}" loading="lazy" width="500" height="500">${p.oldPrice > p.price ? `<span class="discount">−${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : ""}</a><p class="product-category">${escapeHTML(p.category)}</p><h2><a class="product-name" href="${escapeHTML(pageURL("detail", p.id))}">${escapeHTML(p.name)}</a></h2><div class="price-row"><span class="price">${money(p.price)}</span>${p.oldPrice > p.price ? `<span class="old-price">${money(p.oldPrice)}</span>` : ""}</div><button class="quick-add" data-action="quick-add" data-id="${escapeHTML(p.id)}" aria-label="Thêm ${escapeHTML(p.name)} vào giỏ hàng">${icon("plus")}Thêm vào giỏ</button></article>`,
    )
    .join("");
  $("sortSelect").value = filters.sort;
  syncSearchInputs();
}

function syncSearchInputs() {
  ["headerSearch", "mobileSearch", "shopSearch"].forEach((id) => {
    if ($(id) && $(id).value !== filters.query) $(id).value = filters.query;
  });
}
function setSearch(value) {
  filters.query = String(value).slice(0, 100);
  syncSearchInputs();
  if (activeView === "shop") {
    updateFilterURL();
    renderShop();
  } else navigate("shop");
}
function setCategory(category) {
  if (category !== "all" && !CATEGORIES.includes(category)) return;
  filters = { category, query: "", sort: "featured" };
  if (activeView === "shop") {
    updateFilterURL();
    renderShop();
  } else navigate("shop");
}
function resetFilters() {
  filters = { category: "all", query: "", sort: "featured" };
  syncSearchInputs();
  updateFilterURL();
  renderShop();
}
function browse() {
  filters = { category: "all", query: "", sort: "featured" };
  navigate("shop");
}
function renderDetail() {
  if (!$("detailContent")) return;
  const p = state.products.find((p) => p.id === activeId);
  $("detailContent").hidden = !p;
  $("productMissing").hidden = !!p;
  $("view-detail").setAttribute(
    "aria-labelledby",
    p ? "detailTitle" : "productMissingTitle",
  );
  if (!p) return;
  detailColor = Math.min(detailColor, p.colors.length - 1);
  detailSize = Math.min(detailSize, p.sizes.length - 1);
  activeThumb = Math.min(activeThumb, p.images.length - 1);
  $("detailCrumb").textContent = p.name;
  $("detailCategory").textContent = p.category;
  $("detailTitle").textContent = p.name;
  $("detailDescription").textContent = p.description;
  $("detailPrice").textContent = money(p.price);
  $("detailOldPrice").textContent =
    p.oldPrice > p.price ? money(p.oldPrice) : "";
  $("detailOldPrice").hidden = p.oldPrice <= p.price;
  $("detailImage").src = imageSrc(p.images[activeThumb]);
  $("detailImage").alt = p.name;
  $("detailImage").dataset.imageRef = p.images[activeThumb];
  $("detailThumbnails").innerHTML =
    p.images.length > 1
      ? p.images
          .map(
            (ref, i) =>
              `<button class="thumbnail" data-action="thumbnail" data-index="${i}" aria-label="Xem ảnh ${i + 1} của ${escapeHTML(p.name)}" aria-pressed="${i === activeThumb}"><img src="${escapeHTML(imageSrc(ref))}" alt="" loading="lazy" width="80" height="80"></button>`,
          )
          .join("")
      : "";
  $("detailColorLabel").textContent = p.colors[detailColor].name;
  $("detailSizeLabel").textContent = p.sizes[detailSize];
  $("detailColors").innerHTML = p.colors
    .map(
      (c, i) =>
        `<button class="color-option" data-action="color" data-index="${i}" aria-pressed="${i === detailColor}"><span class="color-swatch" style="background:${c.hex}"></span>${escapeHTML(c.name)}</button>`,
    )
    .join("");
  $("detailSizes").innerHTML = p.sizes
    .map(
      (s, i) =>
        `<button class="size-option" data-action="size" data-index="${i}" aria-pressed="${i === detailSize}">${escapeHTML(s)}</button>`,
    )
    .join("");
  $("detailQty").textContent = detailQuantity;
}
function cartSubtotal() {
  return state.cart.reduce((s, i) => s + i.price * i.quantity, 0);
}
function addCart(id, colorIndex = 0, sizeIndex = 0, quantity = 1) {
  syncSession();
  const p = state.products.find((p) => p.id === String(id));
  if (!p) throw new Error("Sản phẩm không tồn tại.");
  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 99 ||
    !Number.isInteger(colorIndex) ||
    !p.colors[colorIndex] ||
    !Number.isInteger(sizeIndex) ||
    !p.sizes[sizeIndex]
  )
    throw new Error("Màu, kích thước hoặc số lượng không hợp lệ.");
  const color = p.colors[colorIndex].name,
    size = p.sizes[sizeIndex],
    cartId = `${p.id}:${encodeURIComponent(color)}:${encodeURIComponent(size)}`;
  const cart = clone(state.cart),
    existing = cart.find((i) => i.cartId === cartId);
  if (existing && existing.quantity + quantity > 99) {
    toast("Mỗi lựa chọn sản phẩm tối đa 99 món.", true);
    return false;
  }
  if (existing) existing.quantity += quantity;
  else
    cart.push({
      cartId,
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.images[0],
      color,
      size,
      quantity,
    });
  if (!commit({ cart })) return false;
  renderCart();
  toast(`Đã thêm ${p.name} vào giỏ hàng.`);
  return true;
}
function renderCart() {
  const items = state.cart;
  const markup = items.length
    ? items
        .map(
          (i) =>
            `<article class="cart-item"><img src="${escapeHTML(imageSrc(i.image))}" data-image-ref="${escapeHTML(i.image)}" alt="${escapeHTML(i.name)}" width="86" height="98"><div class="cart-item-info"><h3><a href="${escapeHTML(pageURL("detail", i.id))}">${escapeHTML(i.name)}</a></h3><p>${escapeHTML(i.color)} · ${escapeHTML(i.size)}</p><div class="cart-item-bottom"><strong>${money(i.price)}</strong><div class="quantity"><button data-action="cart-qty" data-id="${escapeHTML(i.cartId)}" data-delta="-1" aria-label="Giảm số lượng ${escapeHTML(i.name)}">−</button><output aria-label="Số lượng">${i.quantity}</output><button data-action="cart-qty" data-id="${escapeHTML(i.cartId)}" data-delta="1" aria-label="Tăng số lượng ${escapeHTML(i.name)}">+</button></div></div></div><button class="icon-button cart-remove" data-action="cart-remove" data-id="${escapeHTML(i.cartId)}" aria-label="Xóa ${escapeHTML(i.name)} khỏi giỏ">${icon("trash")}</button></article>`,
        )
        .join("")
    : `<div class="empty-state">${icon("bag")}<h3>Giỏ hàng đang trống</h3><p>Chọn món nội thất bạn yêu thích.</p><button class="btn btn-outline" data-action="browse">Xem sản phẩm</button></div>`;
  ["cartItems", "cartPageItems"].forEach((id) => {
    if ($(id)) $(id).innerHTML = markup;
  });
  ["cartSubtotal", "cartPageSubtotal"].forEach((id) => {
    if ($(id)) $(id).textContent = money(cartSubtotal());
  });
  ["checkoutButton", "cartPageCheckoutButton"].forEach((id) => {
    if ($(id)) $(id).disabled = !items.length;
  });
  if ($("cartPageCount"))
    $("cartPageCount").textContent =
      `${state.cart.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm trong giỏ hàng`;
  updateBadges();
  if (activeView === "checkout") renderCheckout();
}
function changeCartQuantity(id, delta) {
  syncSession();
  if (![-1, 1].includes(delta)) return;
  const cart = clone(state.cart),
    index = cart.findIndex((i) => i.cartId === id);
  if (index < 0) return;
  if (cart[index].quantity + delta > 99) {
    toast("Số lượng tối đa là 99.", true);
    return;
  }
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  if (commit({ cart })) afterCartChange();
}
function removeCart(id) {
  syncSession();
  const cart = state.cart.filter((i) => i.cartId !== id);
  if (commit({ cart })) {
    afterCartChange();
    toast("Đã xóa sản phẩm khỏi giỏ hàng.");
  }
}
function afterCartChange() {
  renderCart();
  if (activeView === "checkout" && !state.cart.length) navigate("shop");
}
function miniItem(i) {
  return `<div class="mini-item"><img src="${escapeHTML(imageSrc(i.image))}" data-image-ref="${escapeHTML(i.image)}" alt="${escapeHTML(i.name)}" loading="lazy" width="66" height="66"><div class="mini-item-info"><h3>${escapeHTML(i.name)}</h3><p>${i.quantity} × ${escapeHTML(i.color)} · ${escapeHTML(i.size)}</p></div><span class="mini-item-total">${money(i.price * i.quantity)}</span></div>`;
}
function renderCheckout() {
  if (!$("checkoutItems")) return;
  $("checkoutContent").hidden = !state.cart.length || !currentUser;
  $("checkoutGate").hidden = !state.cart.length || !!currentUser;
  $("checkoutEmpty").hidden = !!state.cart.length;
  $("checkoutItems").innerHTML = state.cart.map(miniItem).join("");
  $("checkoutSubtotal").textContent = money(cartSubtotal());
  $("checkoutTotal").textContent = money(cartSubtotal());
  $("placeOrderButton").disabled = !state.cart.length;
}
function checkoutError(message, field) {
  $("checkoutError").textContent = message;
  $("checkoutError").hidden = false;
  if (field) $(field).focus();
}
function placeOrder(event) {
  event.preventDefault();
  syncSession();
  $("checkoutError").hidden = true;
  if (!state.cart.length) {
    checkoutError("Giỏ hàng đang trống. Hãy chọn lại sản phẩm.");
    return;
  }
  if (!role) {
    location.assign(loginURL("checkout"));
    return;
  }
  if (!$("checkoutForm").reportValidity()) return;
  const customer = {
    name: plain($("shipName").value),
    phone: plain($("shipPhone").value).replace(/[\s().-]/g, ""),
    email: plain($("shipEmail").value),
    address: plain($("shipAddress").value),
    note: plain($("shipNote").value),
  };
  if (customer.name.length < 2)
    return checkoutError("Vui lòng nhập họ và tên người nhận.", "shipName");
  if (!/^(?:0\d{9,10}|\+?84\d{9,10})$/.test(customer.phone))
    return checkoutError(
      "Số điện thoại chưa đúng. Ví dụ: 0912 345 678.",
      "shipPhone",
    );
  if (customer.address.length < 10)
    return checkoutError(
      "Vui lòng nhập địa chỉ giao hàng đầy đủ.",
      "shipAddress",
    );
  const selected = document.querySelector(
    'input[name="paymentMethod"]:checked',
  )?.value;
  if (!["COD", "BankTransfer"].includes(selected))
    return checkoutError("Vui lòng chọn phương thức thanh toán.");
  const time = new Date(),
    suffix = (
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID().replace(/-/g, "").slice(0, 8)
        : Math.random().toString(36).slice(2, 10)
    ).toUpperCase();
  const id = `ECV-${time.getTime().toString(36).toUpperCase()}-${suffix}`;
  const order = {
    id,
    userId: currentUser.id,
    accountUsername: currentUser.username,
    date: time.toLocaleDateString("vi-VN"),
    createdAt: time.toISOString(),
    customer,
    items: clone(state.cart),
    total: cartSubtotal(),
    method:
      selected === "COD"
        ? "Thanh toán khi nhận hàng (COD)"
        : "Chuyển khoản ngân hàng",
    status: "Chờ xác nhận",
  };
  if (!commit({ orders: [order, ...state.orders], cart: [] })) return;
  $("checkoutForm").reset();
  closeAllDialogs();
  navigate("orders");
  toast(`Đã tạo đơn hàng thử ${id}.`);
}
function statusClass(status) {
  return (
    {
      "Chờ xác nhận": "pending",
      "Đang giao": "shipping",
      "Hoàn thành": "completed",
      "Đã hủy": "cancelled",
    }[status] || "pending"
  );
}
function shippingInfo(o) {
  return `<p><strong>${escapeHTML(o.customer.name)}</strong> · ${escapeHTML(o.customer.phone)}</p><p>${escapeHTML(o.customer.address)}</p>${o.customer.email ? `<p>Email: ${escapeHTML(o.customer.email)}</p>` : ""}${o.customer.note ? `<p>Ghi chú: ${escapeHTML(o.customer.note)}</p>` : ""}`;
}
function renderOrders() {
  if (!$("ordersList")) return;
  const orders = myOrders();
  $("ordersGate").hidden = !!currentUser;
  $("noOrders").hidden = !currentUser || orders.length > 0;
  $("ordersList").innerHTML = orders
    .map(
      (o) =>
        `<article class="order-card"><div class="order-head"><div><h2>Đơn ${escapeHTML(o.id)}</h2><p class="order-date">Ngày đặt: ${escapeHTML(o.date)}</p></div><div class="order-actions"><span class="status status-${statusClass(o.status)}">${escapeHTML(o.status)}</span>${o.status === "Chờ xác nhận" ? `<button class="danger-link" data-action="order-cancel" data-id="${escapeHTML(o.id)}">Hủy đơn</button>` : ""}</div></div><div class="order-items">${o.items.map(miniItem).join("")}</div><div class="order-total"><span>${escapeHTML(o.method)}</span><div>Tổng cộng: <strong>${money(o.total)}</strong></div></div><details class="order-shipping"><summary>Thông tin giao hàng</summary>${shippingInfo(o)}</details></article>`,
    )
    .join("");
}
function requestCancelOrder(id) {
  syncSession();
  const order = state.orders.find((o) => o.id === id);
  if (
    !currentUser ||
    !order ||
    order.userId !== currentUser.id ||
    order.status !== "Chờ xác nhận"
  ) {
    toast("Chỉ có thể hủy đơn đang chờ xác nhận.", true);
    return;
  }
  askConfirm(
    "Hủy đơn hàng?",
    `Đơn ${id} sẽ chuyển sang trạng thái “Đã hủy”.`,
    "Hủy đơn hàng",
    () => {
      const current = state.orders.find((o) => o.id === id);
      if (
        !currentUser ||
        current?.userId !== currentUser.id ||
        current.status !== "Chờ xác nhận"
      )
        return;
      const orders = state.orders.map((o) =>
        o.id === id ? { ...o, status: "Đã hủy" } : o,
      );
      if (commit({ orders })) {
        refreshDataViews();
        toast("Đã hủy đơn hàng thử.");
      }
    },
  );
}
function loginURL(next) {
  const url = new URL(PAGES.login, APP_ROOT);
  if (Object.hasOwn(PAGES, next) && !["login", "register"].includes(next))
    url.searchParams.set("next", next);
  if (next === "admin") url.searchParams.set("mode", "admin");
  return url.href;
}
function showAccount() {
  syncSession();
  if (!currentUser) {
    location.assign(loginURL());
    return;
  }
  $("accountName").textContent = currentUser.fullName;
  $("accountUsername").textContent = `@${currentUser.username}`;
  $("accountEmail").textContent =
    currentUser.email || "Tài khoản quản trị của đồ án";
  $("accountRole").textContent =
    role === "admin" ? "Quản trị viên" : "Khách hàng";
  $("accountAdminLink").hidden = role !== "admin";
  openDialog("accountDialog");
}
function logout() {
  try {
    EnciviAuth.logout();
  } catch (error) {
    toast(error.message, true);
    return;
  }
  currentUser = null;
  role = null;
  pendingRoute = null;
  closeAllDialogs();
  state = loadState();
  refreshDataViews();
  if (["admin", "checkout", "orders"].includes(activeView)) navigate("home");
  toast("Đã đăng xuất. Giỏ hàng và đơn của bạn vẫn được giữ lại.");
}
function requireAdmin() {
  syncSession();
  if (currentUser?.id === "encivi-admin" && role === "admin") return true;
  toast("Đăng nhập tài khoản admin để thực hiện thao tác này.", true);
  return false;
}
function syncSession() {
  const user = EnciviAuth.current();
  if (
    (user?.id || null) !== (currentUser?.id || null) ||
    (user?.role || null) !== role
  ) {
    currentUser = user;
    role = user?.role || null;
    state = loadState();
    closeAllDialogs();
    refreshDataViews();
  }
}
function authNext() {
  const next = new URLSearchParams(location.search).get("next");
  if (
    Object.hasOwn(PAGES, next) &&
    !["login", "register"].includes(next) &&
    (next !== "admin" || role === "admin") &&
    (next !== "checkout" || state.cart.length)
  )
    return next;
  return role === "admin" ? "admin" : "shop";
}
function renderAuthentication() {
  const adminMode =
    new URLSearchParams(location.search).get("mode") === "admin";
  if ($("loginTitle")) {
    $("loginTitle").textContent = adminMode
      ? "Đăng nhập quản trị"
      : "Chào mừng bạn trở lại";
    $("adminDemoAccount").hidden = !adminMode;
  }
  $("authSignedIn").hidden = !currentUser;
  if ($("loginForm")) $("loginForm").hidden = !!currentUser;
  if ($("registerForm")) $("registerForm").hidden = !!currentUser;
  if (currentUser) {
    $("authSignedInName").textContent =
      `Bạn đang đăng nhập: ${currentUser.fullName} (@${currentUser.username}).`;
    $("authContinue").href = pageURL(authNext());
    $("authContinue").textContent =
      role === "admin" ? "Vào trang quản trị" : "Tiếp tục";
  }
  const next = new URLSearchParams(location.search).get("next");
  document.querySelectorAll("[data-auth-link]").forEach((link) => {
    const url = new URL(PAGES[link.dataset.authLink], APP_ROOT);
    if (Object.hasOwn(PAGES, next) && !["login", "register"].includes(next))
      url.searchParams.set("next", next);
    link.href = url.href;
  });
}
let authBusy = false;
async function submitAuthentication(type, event) {
  event.preventDefault();
  if (authBusy) return;
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const button = form.querySelector("button[type=submit]");
  const label = button.textContent;
  $("authError").hidden = true;
  authBusy = true;
  button.disabled = true;
  button.textContent = "Đang xử lý…";
  try {
    const data = Object.fromEntries(new FormData(form));
    const user = await EnciviAuth[type](data);
    currentUser = user;
    role = user.role;
    state = loadState();
    // Ghép các món khách đã chọn trước đăng nhập vào đúng tài khoản của họ.
    const guest = cartBuckets.guest || [];
    if (guest.length) {
      const cart = clone(state.cart);
      guest.forEach((item) => {
        const existing = cart.find((row) => row.cartId === item.cartId);
        if (existing)
          existing.quantity = Math.min(99, existing.quantity + item.quantity);
        else cart.push(item);
      });
      if (!commit({ cart }, { guest: [] }))
        throw new Error(
          "Đã đăng nhập nhưng chưa chuyển được giỏ hàng. Giỏ cũ vẫn được giữ; hãy đăng xuất rồi đăng nhập để thử lại.",
        );
    }
    form.reset();
    updateBadges();
    navigate(authNext());
  } catch (error) {
    $("authError").textContent =
      error.message || "Không hoàn tất được thao tác. Hãy thử lại.";
    $("authError").hidden = false;
    if (error.field) form.elements.namedItem(error.field)?.focus();
  } finally {
    authBusy = false;
    button.disabled = false;
    button.textContent = label;
  }
}
function renderAdmin() {
  if (!requireAdmin()) return;
  $("statProducts").textContent = state.products.length;
  $("statOrders").textContent = state.orders.length;
  $("statRevenue").textContent = money(
    state.orders
      .filter((o) => o.status === "Hoàn thành")
      .reduce((s, o) => s + o.total, 0),
  );
  $("adminProducts").innerHTML = state.products.length
    ? state.products
        .map(
          (p) =>
            `<tr><td><div class="table-product"><img src="${escapeHTML(imageSrc(p.images[0]))}" alt="" loading="lazy" width="58" height="58"><span class="table-product-name">${escapeHTML(p.name)}</span></div></td><td>${escapeHTML(p.category)}</td><td class="table-price">${money(p.price)}</td><td><div class="table-actions"><button class="icon-button" data-action="product-edit" data-id="${escapeHTML(p.id)}" aria-label="Sửa ${escapeHTML(p.name)}">${icon("edit")}</button><button class="icon-button danger-link" data-action="product-delete" data-id="${escapeHTML(p.id)}" aria-label="Xóa ${escapeHTML(p.name)}">${icon("trash")}</button></div></td></tr>`,
        )
        .join("")
    : '<tr><td colspan="4" class="table-empty">Danh mục đang trống. Chọn “Thêm sản phẩm” để bắt đầu.</td></tr>';
  $("adminOrders").innerHTML = state.orders.length
    ? state.orders
        .map(
          (o) =>
            `<tr><td><button class="text-button" data-action="order-info" data-id="${escapeHTML(o.id)}">${escapeHTML(o.id)}</button><p class="small muted">${escapeHTML(o.date)}</p></td><td>${escapeHTML(o.customer.name)}<p class="small muted">${escapeHTML(o.customer.phone)}</p><p class="small muted">${o.accountUsername ? `@${escapeHTML(o.accountUsername)}` : "Đơn trước khi có tài khoản"}</p></td><td class="table-price">${money(o.total)}</td><td><select class="table-select" data-order-id="${escapeHTML(o.id)}" aria-label="Trạng thái đơn ${escapeHTML(o.id)}" ${NEXT_STATUSES[o.status].length === 1 ? "disabled" : ""}>${NEXT_STATUSES[o.status].map((s) => `<option value="${escapeHTML(s)}" ${s === o.status ? "selected" : ""}>${escapeHTML(s)}</option>`).join("")}</select></td></tr>`,
        )
        .join("")
    : '<tr><td colspan="4" class="table-empty">Chưa có đơn hàng. Tạo một đơn thử ở chế độ Khách hàng.</td></tr>';
}
function showProductForm(id = null) {
  if (!requireAdmin()) return;
  const p = id ? state.products.find((p) => p.id === id) : null;
  if (id && !p) return;
  $("productForm").reset();
  $("prodId").value = p?.id || "";
  $("productDialogTitle").textContent = p ? "Sửa sản phẩm" : "Thêm sản phẩm";
  $("prodName").value = p?.name || "";
  $("prodCategory").value = p?.category || CATEGORIES[0];
  $("prodPrice").value = p?.price || "";
  $("prodOldPrice").value = p?.oldPrice || "";
  $("prodImage").value =
    p && !Object.hasOwn(ASSETS, p.images[0]) ? p.images[0] : "";
  $("prodImage").required = !p;
  $("imageRequired").hidden = !!p;
  $("prodImageHint").textContent = p
    ? "Để trống để giữ ảnh hiện tại. Màu sắc và kích thước cũng được giữ nguyên."
    : "Dùng đường dẫn HTTPS trực tiếp đến ảnh sản phẩm.";
  $("prodDesc").value = p?.description || "";
  $("productError").hidden = true;
  openDialog("productDialog");
}
function productError(message, field) {
  $("productError").textContent = message;
  $("productError").hidden = false;
  if (field) $(field).focus();
}
function saveProduct(event) {
  event.preventDefault();
  if (!requireAdmin()) return;
  $("productError").hidden = true;
  if (!$("productForm").reportValidity()) return;
  const id = $("prodId").value,
    existing = state.products.find((p) => p.id === id);
  if (id && !existing)
    return productError("Sản phẩm đã bị xóa. Hãy mở lại danh mục.");
  const price = Number($("prodPrice").value),
    oldPrice = Number($("prodOldPrice").value) || 0,
    image = plain($("prodImage").value),
    name = plain($("prodName").value),
    description = plain($("prodDesc").value);
  if (name.length < 2)
    return productError("Tên sản phẩm cần ít nhất 2 ký tự.", "prodName");
  if (!validPrice(price))
    return productError(
      "Giá bán phải từ 1.000 đến 1.000.000.000 ₫.",
      "prodPrice",
    );
  if (oldPrice && (!validPrice(oldPrice) || oldPrice <= price))
    return productError("Giá trước giảm phải lớn hơn giá bán.", "prodOldPrice");
  if (image && !/^https:\/\//i.test(image))
    return productError(
      "Dùng đường dẫn ảnh bắt đầu bằng https://.",
      "prodImage",
    );
  if (!existing && !image)
    return productError("Vui lòng nhập đường dẫn ảnh sản phẩm.", "prodImage");
  if (!description)
    return productError("Vui lòng nhập mô tả sản phẩm.", "prodDesc");
  const updated = {
    ...(existing || {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      colors: [{ name: "Mặc định", hex: "#b8b7ad" }],
      sizes: ["Tiêu chuẩn"],
    }),
    name,
    category: $("prodCategory").value,
    price,
    oldPrice,
    images: image
      ? existing && existing.images[0] === image
        ? existing.images
        : [image]
      : existing.images,
    description,
  };
  if (!CATEGORIES.includes(updated.category))
    return productError("Không gian sản phẩm không hợp lệ.", "prodCategory");
  const products = existing
      ? state.products.map((p) => (p.id === id ? updated : p))
      : [updated, ...state.products],
    cart = state.cart.map((i) =>
      i.id === id
        ? {
            ...i,
            name: updated.name,
            price: updated.price,
            image: updated.images[0],
          }
        : i,
    );
  if (!commit({ products, cart })) return;
  closeAllDialogs();
  refreshDataViews();
  toast(existing ? "Đã cập nhật sản phẩm." : "Đã thêm sản phẩm.");
}
function requestDeleteProduct(id) {
  if (!requireAdmin()) return;
  const p = state.products.find((p) => p.id === id);
  if (!p) return;
  askConfirm(
    "Xóa sản phẩm?",
    `“${p.name}” sẽ được xóa khỏi danh mục và giỏ hàng. Các đơn đã đặt vẫn giữ nguyên thông tin.`,
    "Xóa sản phẩm",
    () => {
      if (!requireAdmin()) return;
      if (
        commit({
          products: state.products.filter((p) => p.id !== id),
          cart: state.cart.filter((i) => i.id !== id),
        })
      ) {
        refreshDataViews();
        toast("Đã xóa sản phẩm.");
      }
    },
  );
}
function updateOrderStatus(id, status) {
  if (!requireAdmin()) return;
  const order = state.orders.find((o) => o.id === id);
  if (!order || !NEXT_STATUSES[order.status].includes(status)) {
    toast("Không thể chuyển sang trạng thái này.", true);
    renderAdmin();
    return;
  }
  if (order.status === status) return;
  if (
    commit({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })
  ) {
    refreshDataViews();
    toast("Đã cập nhật trạng thái đơn hàng.");
  } else renderAdmin();
}
function refreshDataViews() {
  renderCurrentPage();
  renderCart();
  updateBadges();
}
function askConfirm(title, description, label, action) {
  $("confirmTitle").textContent = title;
  $("confirmDescription").textContent = description;
  $("confirmButton").textContent = label;
  confirmation = action;
  openDialog("confirmDialog");
}
function showOrderInfo(id) {
  if (!requireAdmin()) return;
  const o = state.orders.find((o) => o.id === id);
  if (!o) return;
  $("infoTitle").textContent = `Đơn ${o.id}`;
  $("infoContent").innerHTML =
    `<p><span class="status status-${statusClass(o.status)}">${escapeHTML(o.status)}</span> · ${escapeHTML(o.date)}</p><div class="mini-items">${o.items.map(miniItem).join("")}</div><h3>Người nhận</h3>${shippingInfo(o)}<h3>Thanh toán</h3><p>${escapeHTML(o.method)}<br>Tổng cộng: <strong>${money(o.total)}</strong></p>`;
  openDialog("infoDialog");
}
const INFO = {
  story: {
    title: "Câu chuyện EnCiVi",
    html: "<p>EnCiVi bắt đầu từ một ý tưởng đơn giản: nhà là nơi chúng ta được sống theo cách của mình.</p><p>Bộ sưu tập hướng đến nội thất gọn gàng, những tông màu dễ kết hợp và không gian gần gũi. Mỗi món đồ là một gợi ý để bạn tạo nên góc nhà yêu thích.</p><p>Website được Nguyễn Công Việt xây dựng trong đồ án về cửa hàng nội thất trực tuyến.</p>",
  },
  stores: {
    title: "Thông tin cửa hàng",
    html: "<p>EnCiVi hiện là thương hiệu minh họa trong đồ án website nội thất của Nguyễn Công Việt.</p><p>Website chưa có cửa hàng thực tế, địa chỉ kinh doanh hoặc dịch vụ giao hàng. Bạn có thể xem sản phẩm và tạo đơn hàng thử để trải nghiệm.</p>",
  },
  warranty: {
    title: "Chính sách bảo hành",
    html: "<p>Website này dùng cho đồ án nên chưa áp dụng bảo hành hoặc đổi trả thực tế.</p><h3>Khi triển khai bán hàng</h3><p>Cần công bố thời hạn bảo hành cho từng sản phẩm, điều kiện đổi trả, chi phí vận chuyển và đầu mối tiếp nhận yêu cầu trước khi mở bán.</p>",
  },
  help: {
    title: "Hướng dẫn trải nghiệm",
    html: "<h3>Khách hàng</h3><p>Vào Sản phẩm, tìm kiếm hoặc chọn không gian. Mở sản phẩm để chọn màu, kích thước và số lượng, thêm vào giỏ, rồi tiếp tục đặt hàng thử.</p><h3>Quản trị viên</h3><p>Đăng nhập tài khoản admin ở trang Đăng nhập quản trị. Bạn có thể thêm, sửa, xóa sản phẩm và cập nhật trạng thái đơn hàng.</p><h3>Dữ liệu đã lưu</h3><p>Giỏ hàng, sản phẩm chỉnh sửa và đơn hàng được lưu trên trình duyệt đang dùng. Tải lại trang vẫn giữ dữ liệu; trình duyệt hoặc thiết bị khác có dữ liệu riêng.</p>",
  },
  demo: {
    title: "Về bản trình diễn",
    html: "<p>EnCiVi là website tĩnh phục vụ đồ án của Nguyễn Công Việt. Các hình ảnh, mức giá và giao dịch dùng để minh họa.</p><p>Đăng ký và đăng nhập dùng dữ liệu cục bộ cho đồ án tĩnh; các tài khoản không đồng bộ sang thiết bị khác và không thay thế xác thực trên máy chủ. Website không gửi thông tin đến người bán, không thu tiền và không tạo đơn hàng thực tế.</p><p>Dữ liệu chỉ lưu trong trình duyệt này. Xóa dữ liệu trình duyệt sẽ xóa giỏ hàng, đơn hàng và các sản phẩm bạn đã chỉnh sửa.</p>",
  },
};
function showInfo(key) {
  if (!Object.hasOwn(INFO, key)) return;
  $("infoTitle").textContent = INFO[key].title;
  $("infoContent").innerHTML = INFO[key].html;
  openDialog("infoDialog");
}
// WebMCP dùng lại các thao tác của giao diện; chỉ đăng ký khi trình duyệt hỗ trợ.
function registerWebTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  const tools = [
    {
      name: "search_encivi_products",
      title: "Tìm sản phẩm EnCiVi",
      description:
        "Tìm trong danh mục hiện tại và trả về sản phẩm. Không đổi giỏ hàng.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          category: { type: "string", enum: ["all", ...CATEGORIES] },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute(input) {
        if (
          !input ||
          typeof input !== "object" ||
          (input.query !== undefined && typeof input.query !== "string") ||
          (input.category !== undefined &&
            !["all", ...CATEGORIES].includes(input.category))
        )
          throw new Error("Bộ lọc không hợp lệ.");
        const q = normalize(input.query || ""),
          c = input.category || "all";
        return state.products
          .filter(
            (p) =>
              (c === "all" || p.category === c) &&
              normalize(p.name + " " + p.category).includes(q),
          )
          .map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            colors: p.colors.map((c) => c.name),
            sizes: p.sizes,
          }));
      },
    },
    {
      name: "add_encivi_cart_items",
      title: "Thêm sản phẩm vào giỏ EnCiVi",
      description:
        "Thêm một hoặc nhiều lựa chọn vào giỏ hàng thử đang hiển thị. Không đặt hàng hoặc thanh toán.",
      inputSchema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            minItems: 1,
            maxItems: 20,
            items: {
              type: "object",
              properties: {
                productId: { type: "string" },
                quantity: { type: "integer", minimum: 1, maximum: 99 },
                colorIndex: { type: "integer", minimum: 0 },
                sizeIndex: { type: "integer", minimum: 0 },
              },
              required: ["productId", "quantity"],
              additionalProperties: false,
            },
          },
        },
        required: ["items"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute(input) {
        syncSession();
        if (
          !input ||
          !Array.isArray(input.items) ||
          input.items.length < 1 ||
          input.items.length > 20
        )
          throw new Error("Danh sách không hợp lệ.");
        const cart = clone(state.cart);
        for (const item of input.items) {
          const p = state.products.find((p) => p.id === item.productId),
            ci = item.colorIndex ?? 0,
            si = item.sizeIndex ?? 0;
          if (
            !p ||
            !Number.isInteger(item.quantity) ||
            item.quantity < 1 ||
            item.quantity > 99 ||
            !Number.isInteger(ci) ||
            !p.colors[ci] ||
            !Number.isInteger(si) ||
            !p.sizes[si]
          )
            throw new Error("Lựa chọn sản phẩm không hợp lệ.");
          const color = p.colors[ci].name,
            size = p.sizes[si],
            cartId = `${p.id}:${encodeURIComponent(color)}:${encodeURIComponent(size)}`,
            existing = cart.find((i) => i.cartId === cartId);
          if (existing) {
            if (existing.quantity + item.quantity > 99)
              throw new Error("Số lượng vượt quá 99.");
            existing.quantity += item.quantity;
          } else
            cart.push({
              cartId,
              id: p.id,
              name: p.name,
              price: p.price,
              image: p.images[0],
              color,
              size,
              quantity: item.quantity,
            });
        }
        if (!commit({ cart })) throw new Error("Không lưu được giỏ hàng.");
        renderCart();
        openDialog("cartDialog");
        return {
          count: state.cart.reduce((s, i) => s + i.quantity, 0),
          subtotal: cartSubtotal(),
          items: state.cart.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
            color: i.color,
            size: i.size,
          })),
        };
      },
    },
  ];
  for (const tool of tools) {
    try {
      Promise.resolve(
        context.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {}
  }
  window.addEventListener("pagehide", () => lifecycle.abort(), { once: true });
}
function handleAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button || button.disabled) return;
  const a = button.dataset.action,
    id = button.dataset.id,
    index = Number(button.dataset.index);
  switch (a) {
    case "navigate":
      navigate(button.dataset.view);
      break;
    case "browse":
      browse();
      break;
    case "category":
      setCategory(button.dataset.category);
      break;
    case "reset-filters":
      resetFilters();
      break;
    case "detail":
      navigate("detail", id);
      break;
    case "cart":
      renderCart();
      openDialog("cartDialog");
      break;
    case "menu":
      setMobileMenu($("mobileMenu").hidden);
      break;
    case "account":
      pendingRoute = null;
      showAccount();
      break;
    case "close-dialog":
      closeDialog(button.closest("dialog"));
      break;
    case "logout":
      logout();
      break;
    case "checkout":
      navigate("checkout");
      break;
    case "quick-add":
      if (addCart(id)) openDialog("cartDialog");
      break;
    case "add-detail":
      if (addCart(activeId, detailColor, detailSize, detailQuantity))
        openDialog("cartDialog");
      break;
    case "detail-qty":
      detailQuantity = Math.max(
        1,
        Math.min(99, detailQuantity + Number(button.dataset.delta)),
      );
      $("detailQty").textContent = detailQuantity;
      break;
    case "color":
      if (state.products.find((p) => p.id === activeId)?.colors[index]) {
        detailColor = index;
        renderDetail();
      }
      break;
    case "size":
      if (state.products.find((p) => p.id === activeId)?.sizes[index]) {
        detailSize = index;
        renderDetail();
      }
      break;
    case "thumbnail":
      if (state.products.find((p) => p.id === activeId)?.images[index]) {
        activeThumb = index;
        renderDetail();
      }
      break;
    case "cart-qty":
      changeCartQuantity(id, Number(button.dataset.delta));
      break;
    case "cart-remove":
      removeCart(id);
      break;
    case "product-add":
      showProductForm();
      break;
    case "product-edit":
      showProductForm(id);
      break;
    case "product-delete":
      requestDeleteProduct(id);
      break;
    case "order-cancel":
      requestCancelOrder(id);
      break;
    case "order-info":
      showOrderInfo(id);
      break;
    case "info":
      showInfo(button.dataset.info);
      break;
    case "confirm": {
      const action = confirmation;
      confirmation = null;
      closeDialog($("confirmDialog"));
      action?.();
      break;
    }
  }
}

// Chỉ khởi tạo sau khi menu, footer, hộp thoại và biểu tượng chung đã được lắp vào trang.
function initializeApp() {
  let authWarning = "";
  try {
    currentUser = EnciviAuth.initialize();
  } catch (error) {
    currentUser = null;
    authWarning = error.message;
  }
  role = currentUser?.role || null;
  state = loadState();
  document
    .querySelectorAll("[data-login-next]")
    .forEach((link) => (link.href = loginURL(link.dataset.loginNext)));
  if ($("shipName") && currentUser) $("shipName").value = currentUser.fullName;
  if ($("shipEmail") && currentUser) $("shipEmail").value = currentUser.email;
  const params = new URLSearchParams(location.search);
  activeId = params.get("id");
  filters = {
    query: (params.get("q") || "").slice(0, 100),
    category: CATEGORIES.includes(params.get("category"))
      ? params.get("category")
      : "all",
    sort: ["featured", "price-asc", "price-desc"].includes(params.get("sort"))
      ? params.get("sort")
      : "featured",
  };
  $("year").textContent = new Date().getFullYear();
  document
    .querySelectorAll("[data-asset]")
    .forEach((img) => (img.src = imageSrc(img.dataset.asset)));
  document.addEventListener("click", handleAction);
  document.querySelector(".skip-link").addEventListener("click", (e) => {
    e.preventDefault();
    $("main").focus();
  });
  $("shopSearch")?.addEventListener("input", (e) => setSearch(e.target.value));
  ["headerSearchForm", "mobileSearchForm"].forEach((id) =>
    $(id)?.addEventListener("submit", (e) => {
      e.preventDefault();
      filters = {
        category: "all",
        query: $(id).querySelector("input").value.slice(0, 100),
        sort: "featured",
      };
      navigate("shop");
    }),
  );
  document.addEventListener("change", (e) => {
    if (e.target.name === "category") {
      filters.category = e.target.value;
      updateFilterURL();
      renderShop();
    }
    if (e.target.id === "sortSelect") {
      filters.sort = e.target.value;
      updateFilterURL();
      renderShop();
    }
    if (e.target.dataset.orderId)
      updateOrderStatus(e.target.dataset.orderId, e.target.value);
  });
  $("loginForm")?.addEventListener("submit", (event) =>
    submitAuthentication("login", event),
  );
  $("registerForm")?.addEventListener("submit", (event) =>
    submitAuthentication("register", event),
  );
  $("checkoutForm")?.addEventListener("submit", placeOrder);
  $("productForm")?.addEventListener("submit", saveProduct);
  document.querySelectorAll("dialog").forEach((d) => {
    d.addEventListener("click", (e) => {
      if (e.target === d) {
        const r = d.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          closeDialog(d);
      }
    });
    d.addEventListener("close", () => {
      if (!document.querySelector("dialog[open]"))
        document.body.style.overflow = "";
      if (d.id === "confirmDialog") confirmation = null;
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMobileMenu(false);
  });
  document.addEventListener(
    "error",
    (e) => {
      const img = e.target;
      if (img.tagName === "IMG" && !img.dataset.fallback) {
        img.dataset.fallback = "true";
        img.src = imageSrc("sofa");
      }
    },
    true,
  );
  window.addEventListener("storage", (e) => {
    if (
      [STORE_KEY, EnciviAuth.ACCOUNTS_KEY].includes(e.key) ||
      e.key === null
    ) {
      currentUser = EnciviAuth.current();
      role = currentUser?.role || null;
      state = loadState();
      refreshDataViews();
    }
  });
  updateBadges();
  renderCurrentPage();
  renderCart();
  registerWebTools();
  syncSearchInputs();
  const oldHash = location.hash.slice(1);
  if (oldHash.startsWith("product/")) {
    try {
      location.replace(pageURL("detail", decodeURIComponent(oldHash.slice(8))));
    } catch {}
  } else if (Object.hasOwn(PAGES, oldHash)) location.replace(pageURL(oldHash));
  if (storageWarning)
    toast(
      "Không đọc được dữ liệu đã lưu. Website đang dùng dữ liệu mẫu.",
      true,
    );
  if (authWarning) {
    toast(authWarning, true);
    if ($("authError")) {
      $("authError").textContent = authWarning;
      $("authError").hidden = false;
    }
  }
  window.dispatchEvent(new Event("encivi:ready"));
}
window.enciviLayoutReady.then(initializeApp).catch(() => {});
