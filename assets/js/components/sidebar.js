/**
 * components/sidebar.js - Thanh điều hướng bên trái
 */

import { APP_CONFIG } from "../config.js";
import { icon } from "./icons.js";

const MENU = [
  { path: "/dashboard", label: "Tổng quan", iconName: "dashboard" },
  { path: "/products", label: "Hàng hoá", iconName: "box" },
  { path: "/categories", label: "Danh mục", iconName: "tag" },
  { path: "/transactions", label: "Nhập / Xuất kho", iconName: "swap" },
];

/**
 * Render sidebar và đánh dấu menu active theo route hiện tại.
 */
export function renderSidebar(currentPath) {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  const links = MENU.map((item) => {
    const isActive = item.path === currentPath;
    return `
      <a href="#${item.path}" class="nav-link ${isActive ? "active" : ""}" data-nav>
        ${icon(item.iconName, "icon")}
        <span>${item.label}</span>
      </a>
    `;
  }).join("");

  sidebar.innerHTML = `
    <div class="sidebar__brand">
      <img src="assets/images/logo.png" alt="Logo ${APP_CONFIG.name}" class="sidebar__logo" />
      <div>
        <div class="sidebar__title">${APP_CONFIG.name}</div>
        <div class="sidebar__subtitle">${APP_CONFIG.description}</div>
      </div>
    </div>
    <nav class="sidebar__nav">
      <div class="sidebar__section-label">Menu</div>
      ${links}
    </nav>
    <div class="sidebar__footer">
      Phiên bản ${APP_CONFIG.version}<br />
      © ${new Date().getFullYear()} ${APP_CONFIG.name}
    </div>
  `;

  // Đóng sidebar trên mobile sau khi chọn menu
  sidebar.querySelectorAll("[data-nav]").forEach((link) => {
    link.addEventListener("click", () => sidebar.classList.remove("open"));
  });
}
