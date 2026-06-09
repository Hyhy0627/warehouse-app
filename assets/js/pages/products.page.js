/**
 * pages/products.page.js - Trang quản lý hàng hoá
 */

import { icon } from "../components/icons.js";
import { createTable } from "../components/table.js";
import { openModal, closeModal } from "../components/modal.js";
import { showToast } from "../components/toast.js";
import {
  formatCurrency,
  formatDate,
  getProductStatus,
  escapeHtml,
} from "../core/helpers.js";
import { validateProduct } from "../core/validators.js";
import {
  filterProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/product.service.js";
import { getCategories, getCategoryById } from "../services/category.service.js";

// Trạng thái bộ lọc hiện tại của trang
let filters = { keyword: "", categoryId: "", status: "" };

let pageContainer = null;

/**
 * Render trang sản phẩm.
 */
export function renderProductsPage(container) {
  pageContainer = container;
  // Reset filter mỗi lần vào trang
  filters = { keyword: "", categoryId: "", status: "" };

  const categories = getCategories();

  container.innerHTML = `
    <div class="page-head">
      <div>
        <div class="page-head__title">Danh sách hàng hoá</div>
        <div class="page-head__desc">Thêm, sửa, xoá và quản lý tồn kho sản phẩm.</div>
      </div>
      <button class="btn btn-primary" id="add-product-btn">
        ${icon("plus")} Thêm sản phẩm
      </button>
    </div>

    <div class="card">
      <div class="card__header">
        <div class="filter-bar" style="width:100%">
          <div class="search-box">
            ${icon("search")}
            <input type="text" id="search-input" placeholder="Tìm theo tên hoặc mã sản phẩm..." />
          </div>
          <select id="category-filter">
            <option value="">Tất cả danh mục</option>
            ${categories
              .map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`)
              .join("")}
          </select>
          <select id="status-filter">
            <option value="">Tất cả trạng thái</option>
            <option value="in">Còn hàng</option>
            <option value="low">Sắp hết</option>
            <option value="out">Hết hàng</option>
          </select>
        </div>
      </div>
      <div id="products-table"></div>
    </div>
  `;

  // Gắn sự kiện cho thanh công cụ
  container.querySelector("#add-product-btn").addEventListener("click", () =>
    openProductForm()
  );
  container.querySelector("#search-input").addEventListener("input", (e) => {
    filters.keyword = e.target.value;
    renderTable();
  });
  container.querySelector("#category-filter").addEventListener("change", (e) => {
    filters.categoryId = e.target.value;
    renderTable();
  });
  container.querySelector("#status-filter").addEventListener("change", (e) => {
    filters.status = e.target.value;
    renderTable();
  });

  renderTable();
}

/**
 * Render lại bảng sản phẩm theo bộ lọc.
 */
function renderTable() {
  const wrap = pageContainer.querySelector("#products-table");
  const products = filterProducts(filters);

  const columns = [
    {
      key: "code",
      label: "Mã SP",
      render: (p) => `<span class="cell-mono">${escapeHtml(p.code)}</span>`,
    },
    {
      key: "name",
      label: "Tên sản phẩm",
      render: (p) => `<span class="cell-strong">${escapeHtml(p.name)}</span>`,
    },
    {
      key: "category",
      label: "Danh mục",
      render: (p) => {
        const cat = getCategoryById(p.categoryId);
        return cat
          ? `<span class="badge badge-neutral">${escapeHtml(cat.name)}</span>`
          : "—";
      },
    },
    {
      key: "quantity",
      label: "SL",
      align: "right",
      render: (p) => `<span class="cell-mono">${p.quantity}</span>`,
    },
    {
      key: "importPrice",
      label: "Giá nhập",
      align: "right",
      render: (p) => `<span class="cell-mono">${formatCurrency(p.importPrice)}</span>`,
    },
    {
      key: "sellPrice",
      label: "Giá bán",
      align: "right",
      render: (p) => `<span class="cell-mono">${formatCurrency(p.sellPrice)}</span>`,
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (p) => {
        const s = getProductStatus(p.quantity);
        return `<span class="badge ${s.badgeClass}">${s.label}</span>`;
      },
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (p) => `<span class="muted">${formatDate(p.createdAt)}</span>`,
    },
  ];

  const actions = (p) => `
    <button class="btn btn-warning btn-sm btn-icon" data-edit="${p.id}" title="Sửa">
      ${icon("edit")}
    </button>
    <button class="btn btn-danger btn-sm btn-icon" data-delete="${p.id}" title="Xoá">
      ${icon("trash")}
    </button>
  `;

  wrap.innerHTML = createTable({
    columns,
    data: products,
    actions,
    emptyMessage: "Không tìm thấy sản phẩm phù hợp.",
  });

  // Gắn sự kiện cho nút sửa/xoá
  wrap.querySelectorAll("[data-edit]").forEach((btn) =>
    btn.addEventListener("click", () => openProductForm(btn.dataset.edit))
  );
  wrap.querySelectorAll("[data-delete]").forEach((btn) =>
    btn.addEventListener("click", () => confirmDelete(btn.dataset.delete))
  );
}

/**
 * Mở form thêm / sửa sản phẩm.
 * @param {string|null} id - null = thêm mới
 */
export function openProductForm(id = null) {
  const product = id ? getProductById(id) : null;

  const body = openModal(product ? "Sửa sản phẩm" : "Thêm sản phẩm", `
    <form id="product-form" novalidate>
      <div class="form-grid">
        <div class="form-group">
          <label for="f-code">Mã sản phẩm</label>
          <input id="f-code" name="code" value="${product ? escapeHtml(product.code) : ""}" placeholder="VD: SP-001" />
          <div class="form-error" data-error="code"></div>
        </div>
        <div class="form-group">
          <label for="f-name">Tên sản phẩm</label>
          <input id="f-name" name="name" value="${product ? escapeHtml(product.name) : ""}" placeholder="Tên sản phẩm" />
          <div class="form-error" data-error="name"></div>
        </div>
        <div class="form-group">
          <label for="f-quantity">Số lượng</label>
          <input id="f-quantity" name="quantity" type="number" min="0" value="${
            product ? product.quantity : 0
          }" />
          <div class="form-error" data-error="quantity"></div>
        </div>
        <div class="form-group">
          <label for="f-import">Giá nhập (VNĐ)</label>
          <input id="f-import" name="importPrice" type="number" min="0" value="${
            product ? product.importPrice : 0
          }" />
          <div class="form-error" data-error="importPrice"></div>
        </div>
        <div class="form-group">
          <label for="f-sell">Giá bán (VNĐ)</label>
          <input id="f-sell" name="sellPrice" type="number" min="0" value="${
            product ? product.sellPrice : 0
          }" />
          <div class="form-error" data-error="sellPrice"></div>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" data-cancel>Huỷ</button>
        <button type="submit" class="btn btn-primary">${
          product ? "Lưu thay đổi" : "Thêm sản phẩm"
        }</button>
      </div>
    </form>
  `);

  const form = body.querySelector("#product-form");
  body.querySelector("[data-cancel]").addEventListener("click", closeModal);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    // Reset lỗi
    body.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""));
    body.querySelectorAll("input, select").forEach((el) =>
      el.classList.remove("input-invalid")
    );

    const errors = validateProduct(data);
    if (Object.keys(errors).length) {
      Object.entries(errors).forEach(([field, msg]) => {
        const errEl = body.querySelector(`[data-error="${field}"]`);
        const input = form.querySelector(`[name="${field}"]`);
        if (errEl) errEl.textContent = msg;
        if (input) input.classList.add("input-invalid");
      });
      return;
    }

    if (product) {
      updateProduct(product.id, data);
      showToast("Đã cập nhật sản phẩm thành công.", "success");
    } else {
      createProduct(data);
      showToast("Đã thêm sản phẩm mới.", "success");
    }

    closeModal();
    renderTable();
  });
}

/**
 * Xác nhận và xoá sản phẩm.
 */
function confirmDelete(id) {
  const product = getProductById(id);
  if (!product) return;

  const body = openModal("Xác nhận xoá", `
    <p style="margin-bottom:1.2rem; color:var(--color-text)">
      Bạn có chắc muốn xoá sản phẩm
      <strong>${escapeHtml(product.name)}</strong> (${escapeHtml(product.code)})?
      Hành động này không thể hoàn tác.
    </p>
    <div class="form-actions">
      <button type="button" class="btn btn-ghost" data-cancel>Huỷ</button>
      <button type="button" class="btn btn-danger" data-confirm>${
        ""
      }Xoá sản phẩm</button>
    </div>
  `);

  body.querySelector("[data-cancel]").addEventListener("click", closeModal);
  body.querySelector("[data-confirm]").addEventListener("click", () => {
    deleteProduct(id);
    showToast("Đã xoá sản phẩm.", "success");
    closeModal();
    renderTable();
  });
}
