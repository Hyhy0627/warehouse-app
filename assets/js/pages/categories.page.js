/**
 * pages/categories.page.js - Trang quản lý danh mục
 */

import { icon } from "../components/icons.js";
import { createTable } from "../components/table.js";
import { openModal, closeModal } from "../components/modal.js";
import { showToast } from "../components/toast.js";
import { formatDate, escapeHtml } from "../core/helpers.js";
import { validateCategory } from "../core/validators.js";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  canDeleteCategory,
  countProductsInCategory,
} from "../services/category.service.js";

let pageContainer = null;

/**
 * Render trang danh mục.
 */
export function renderCategoriesPage(container) {
  pageContainer = container;

  container.innerHTML = `
    <div class="page-head">
      <div>
        <div class="page-head__title">Danh mục sản phẩm</div>
        <div class="page-head__desc">Nhóm sản phẩm theo danh mục để quản lý dễ dàng hơn.</div>
      </div>
      <button class="btn btn-primary" id="add-category-btn">
        ${icon("plus")} Thêm danh mục
      </button>
    </div>

    <div class="card">
      <div id="categories-table"></div>
    </div>
  `;

  container
    .querySelector("#add-category-btn")
    .addEventListener("click", () => openCategoryForm());

  renderTable();
}

/**
 * Render bảng danh mục.
 */
function renderTable() {
  const wrap = pageContainer.querySelector("#categories-table");
  const categories = getCategories();

  const columns = [
    {
      key: "name",
      label: "Tên danh mục",
      render: (c) => `<span class="cell-strong">${escapeHtml(c.name)}</span>`,
    },
    {
      key: "description",
      label: "Mô tả",
      render: (c) =>
        c.description
          ? escapeHtml(c.description)
          : '<span class="muted">—</span>',
    },
    {
      key: "count",
      label: "Số sản phẩm",
      align: "right",
      render: (c) =>
        `<span class="badge badge-info">${countProductsInCategory(c.id)}</span>`,
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (c) => `<span class="muted">${formatDate(c.createdAt)}</span>`,
    },
  ];

  const actions = (c) => `
    <button class="btn btn-warning btn-sm btn-icon" data-edit="${c.id}" title="Sửa">
      ${icon("edit")}
    </button>
    <button class="btn btn-danger btn-sm btn-icon" data-delete="${c.id}" title="Xoá">
      ${icon("trash")}
    </button>
  `;

  wrap.innerHTML = createTable({
    columns,
    data: categories,
    actions,
    emptyMessage: "Chưa có danh mục nào. Hãy thêm danh mục đầu tiên.",
  });

  wrap.querySelectorAll("[data-edit]").forEach((btn) =>
    btn.addEventListener("click", () => openCategoryForm(btn.dataset.edit))
  );
  wrap.querySelectorAll("[data-delete]").forEach((btn) =>
    btn.addEventListener("click", () => confirmDelete(btn.dataset.delete))
  );
}

/**
 * Mở form thêm / sửa danh mục.
 */
function openCategoryForm(id = null) {
  const category = id ? getCategoryById(id) : null;

  const body = openModal(category ? "Sửa danh mục" : "Thêm danh mục", `
    <form id="category-form" novalidate>
      <div class="form-grid">
        <div class="form-group full">
          <label for="c-name">Tên danh mục</label>
          <input id="c-name" name="name" value="${
            category ? escapeHtml(category.name) : ""
          }" placeholder="VD: Điện thoại" />
          <div class="form-error" data-error="name"></div>
        </div>
        <div class="form-group full">
          <label for="c-desc">Mô tả</label>
          <textarea id="c-desc" name="description" placeholder="Mô tả ngắn về danh mục...">${
            category ? escapeHtml(category.description) : ""
          }</textarea>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" data-cancel>Huỷ</button>
        <button type="submit" class="btn btn-primary">${
          category ? "Lưu thay đổi" : "Thêm danh mục"
        }</button>
      </div>
    </form>
  `);

  const form = body.querySelector("#category-form");
  body.querySelector("[data-cancel]").addEventListener("click", closeModal);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    body.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""));
    body.querySelectorAll("input, textarea").forEach((el) =>
      el.classList.remove("input-invalid")
    );

    const errors = validateCategory(data);
    if (Object.keys(errors).length) {
      Object.entries(errors).forEach(([field, msg]) => {
        const errEl = body.querySelector(`[data-error="${field}"]`);
        const input = form.querySelector(`[name="${field}"]`);
        if (errEl) errEl.textContent = msg;
        if (input) input.classList.add("input-invalid");
      });
      return;
    }

    if (category) {
      updateCategory(category.id, data);
      showToast("Đã cập nhật danh mục.", "success");
    } else {
      createCategory(data);
      showToast("Đã thêm danh mục mới.", "success");
    }

    closeModal();
    renderTable();
  });
}

/**
 * Xác nhận và xoá danh mục (chặn nếu còn sản phẩm).
 */
function confirmDelete(id) {
  const category = getCategoryById(id);
  if (!category) return;

  // Chặn xoá nếu danh mục đang có sản phẩm
  if (!canDeleteCategory(id)) {
    const count = countProductsInCategory(id);
    showToast(
      `Không thể xoá "${category.name}" vì đang có ${count} sản phẩm.`,
      "error"
    );
    return;
  }

  const body = openModal("Xác nhận xoá", `
    <p style="margin-bottom:1.2rem; color:var(--color-text)">
      Bạn có chắc muốn xoá danh mục
      <strong>${escapeHtml(category.name)}</strong>?
    </p>
    <div class="form-actions">
      <button type="button" class="btn btn-ghost" data-cancel>Huỷ</button>
      <button type="button" class="btn btn-danger" data-confirm>Xoá danh mục</button>
    </div>
  `);

  body.querySelector("[data-cancel]").addEventListener("click", closeModal);
  body.querySelector("[data-confirm]").addEventListener("click", () => {
    const result = deleteCategory(id);
    if (result.success) {
      showToast("Đã xoá danh mục.", "success");
    } else {
      showToast(result.message, "error");
    }
    closeModal();
    renderTable();
  });
}
