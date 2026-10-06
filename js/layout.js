"use strict";
// Đọc các phần HTML dùng chung. Muốn sửa menu hoặc footer, chỉ cần sửa file tương ứng trong components.
const LAYOUT_ROOT = new URL("../", document.currentScript.src);
window.enciviLayoutReady = Promise.all(
  [...document.querySelectorAll("[data-include]")].map(async (host) => {
    const response = await fetch(new URL(host.dataset.include, LAYOUT_ROOT), {
      credentials: "same-origin",
    });
    if (!response.ok) throw new Error("Không tải được thành phần giao diện.");
    const template = document.createElement("template");
    template.innerHTML = await response.text();
    // Các liên kết đều trỏ về cùng thư mục website, dù đang ở trang nào.
    template.content.querySelectorAll("a[href],form[action]").forEach((el) => {
      const attribute = el.tagName === "FORM" ? "action" : "href";
      const value = el.getAttribute(attribute);
      if (
        value &&
        !value.startsWith("#") &&
        !/^[a-z][a-z0-9+.-]*:/i.test(value)
      )
        el.setAttribute(attribute, new URL(value, LAYOUT_ROOT).href);
    });
    host.replaceWith(template.content);
  }),
).catch((error) => {
  const message = document.createElement("div");
  message.className = "container notice layout-error";
  message.setAttribute("role", "alert");
  message.textContent =
    location.protocol === "file:"
      ? "Hãy chạy website bằng Live Server hoặc file Chay-website.bat trong thư mục dự án để các phần HTML và dữ liệu liên kết với nhau."
      : "Không tải được phần giao diện dùng chung. Hãy kiểm tra kết nối rồi tải lại trang.";
  document.body.prepend(message);
  throw error;
});
