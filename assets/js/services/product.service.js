/**
 * services/product.service.js - Nghiệp vụ sản phẩm
 */

import { STORAGE_KEYS } from "../config.js";
import { getStorage, setStorage } from "../core/storage.js";
import { generateId, getProductStatus } from "../core/helpers.js";

/**
 * Lấy toàn bộ sản phẩm.
 */
export function getProducts() {
  return getStorage(STORAGE_KEYS.products, []);
}

/**
 * Lưu danh sách sản phẩm.
 */
function saveProducts(products) {
  setStorage(STORAGE_KEYS.products, products);
}

/**
 * Lấy sản phẩm theo ID.
 */
export function getProductById(id) {
  return getProducts().find((p) => p.id === id) || null;
}

/**
 * Chuẩn hoá dữ liệu số từ form.
 */
function normalize(data) {
  return {
    code: data.code.trim(),
    name: data.name.trim(),
    categoryId: data.categoryId?.trim() || "",
    quantity: Number(data.quantity) || 0,
    importPrice: Number(data.importPrice) || 0,
    sellPrice: Number(data.sellPrice) || 0,
  };
}

/**
 * Tạo sản phẩm mới.
 */
export function createProduct(data) {
  const products = getProducts();
  const newProduct = {
    id: generateId("prod"),
    ...normalize(data),
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

/**
 * Cập nhật sản phẩm.
 */
export function updateProduct(id, data) {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  products[index] = { ...products[index], ...normalize(data) };
  saveProducts(products);
  return products[index];
}

/**
 * Xoá sản phẩm.
 */
export function deleteProduct(id) {
  const products = getProducts().filter((p) => p.id !== id);
  saveProducts(products);
  return true;
}

/**
 * Tìm kiếm sản phẩm theo tên hoặc mã.
 */
export function searchProducts(keyword = "") {
  const term = keyword.trim().toLowerCase();
  if (!term) return getProducts();
  return getProducts().filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.code.toLowerCase().includes(term)
  );
}

/**
 * Lọc sản phẩm theo nhiều tiêu chí: keyword, categoryId, status.
 */
export function filterProducts({ keyword = "", categoryId = "", status = "" } = {}) {
  let result = getProducts();
  const term = keyword.trim().toLowerCase();

  if (term) {
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term)
    );
  }
  if (categoryId) {
    result = result.filter((p) => p.categoryId === categoryId);
  }
  if (status) {
    result = result.filter((p) => getProductStatus(p.quantity).key === status);
  }
  return result;
}

/**
 * Tăng tồn kho (khi nhập hàng).
 */
export function increaseStock(productId, quantity) {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === productId);
  if (index === -1) return null;

  products[index].quantity += Number(quantity) || 0;
  saveProducts(products);
  return products[index];
}

/**
 * Giảm tồn kho (khi xuất hàng). Không cho xuất quá tồn.
 */
export function decreaseStock(productId, quantity) {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === productId);
  if (index === -1) return null;

  const qty = Number(quantity) || 0;
  if (qty > products[index].quantity) {
    return { error: "Số lượng xuất vượt quá tồn kho." };
  }
  products[index].quantity -= qty;
  saveProducts(products);
  return products[index];
}

/**
 * Lấy danh sách sản phẩm sắp hết / hết hàng.
 */
export function getLowStockProducts() {
  return getProducts().filter((p) => {
    const status = getProductStatus(p.quantity).key;
    return status === "low" || status === "out";
  });
}
