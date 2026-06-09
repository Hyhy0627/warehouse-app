/**
 * components/toast.js - Thông báo nổi (tự ẩn)
 */

import { icon } from "./icons.js";

const TYPE_META = {
  success: { iconName: "check", title: "Thành công" },
  error: { iconName: "alert", title: "Có lỗi" },
  info: { iconName: "info", title: "Thông báo" },
};

/**
 * Hiển thị toast.
 * @param {string} message - Nội dung
 * @param {"success"|"error"|"info"} type - Loại
 * @param {number} duration - Thời gian hiển thị (ms)
 */
export function showToast(message, type = "success", duration = 3000) {
  const root = document.getElementById("toast-root");
  if (!root) return;

  const meta = TYPE_META[type] || TYPE_META.info;

  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.setAttribute("role", "status");
  el.innerHTML = `
    ${icon(meta.iconName, "toast__icon")}
    <div>
      <div class="toast__title">${meta.title}</div>
      <div class="toast__message">${message}</div>
    </div>
  `;

  root.appendChild(el);

  // Tự ẩn sau duration
  const timer = setTimeout(() => dismiss(el), duration);

  // Cho phép click để đóng sớm
  el.addEventListener("click", () => {
    clearTimeout(timer);
    dismiss(el);
  });
}

function dismiss(el) {
  el.classList.add("hide");
  el.addEventListener("animationend", () => el.remove(), { once: true });
}
