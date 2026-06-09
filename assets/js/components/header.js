/**
 * components/header.js - Thanh tiêu đề trên cùng
 */

import { APP_CONFIG } from "../config.js";
import { icon } from "./icons.js";
import { formatDate } from "../core/helpers.js";

/**
 * Render header theo route hiện tại.
 * @param {{title:string, subtitle:string}} route
 */
export function renderHeader(route) {
  const header = document.getElementById("header");
  if (!header) return;

  header.innerHTML = `
    <div class="header__left">
      <button class="header__menu-btn" id="menu-toggle" type="button" aria-label="Mở menu">
        ${icon("menu", "icon")}
      </button>
      <div>
        <h1 class="header__title">${route.title}</h1>
        <div class="header__subtitle">${route.subtitle || ""}</div>
      </div>
    </div>
    <div class="header__right">
      <span class="header__date">${formatDate(new Date().toISOString())}</span>
      <div class="header__avatar" title="${APP_CONFIG.user.name}">
        ${APP_CONFIG.user.initials}
      </div>
    </div>
  `;

  // Toggle sidebar trên mobile
  const toggle = header.querySelector("#menu-toggle");
  const sidebar = document.getElementById("sidebar");
  toggle?.addEventListener("click", () => sidebar?.classList.toggle("open"));
}
