/**
 * components/modal.js - Modal dùng chung
 */

import { icon } from "./icons.js";

let escHandler = null;

/**
 * Mở modal.
 * @param {string} title - Tiêu đề
 * @param {string|HTMLElement} content - Nội dung (HTML string hoặc element)
 * @returns {HTMLElement} phần tử .modal__body để gắn event
 */
export function openModal(title, content) {
  const root = document.getElementById("modal-root");
  if (!root) return null;

  root.innerHTML = `
    <div class="modal-overlay" data-modal-close></div>
    <div class="modal" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="modal__header">
        <h3 class="modal__title">${title}</h3>
        <button class="modal__close" type="button" data-modal-close aria-label="Đóng">
          ${icon("close", "icon")}
        </button>
      </div>
      <div class="modal__body"></div>
    </div>
  `;

  const body = root.querySelector(".modal__body");
  if (typeof content === "string") {
    body.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    body.appendChild(content);
  }

  root.classList.add("open");
  document.body.style.overflow = "hidden";

  // Đóng khi click overlay / nút close
  root.querySelectorAll("[data-modal-close]").forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  // Đóng bằng phím Esc
  escHandler = (e) => {
    if (e.key === "Escape") closeModal();
  };
  document.addEventListener("keydown", escHandler);

  return body;
}

/**
 * Đóng modal.
 */
export function closeModal() {
  const root = document.getElementById("modal-root");
  if (!root) return;
  root.classList.remove("open");
  root.innerHTML = "";
  document.body.style.overflow = "";
  if (escHandler) {
    document.removeEventListener("keydown", escHandler);
    escHandler = null;
  }
}
