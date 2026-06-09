/**
 * services/category.service.js - Nghiệp vụ danh mục
 */

import { STORAGE_KEYS } from "../config.js";
import { getStorage, setStorage } from "../core/storage.js";
import { generateId } from "../core/helpers.js";
import { getProducts } from "./product.service.js";

/**
 * Lấy toàn bộ danh mục.
 */
export function getCategories() {
  return getStorage(STORAGE_KEYS.categories, []);
}

/**
 * Lưu danh sách danh mục.
 */
function saveCategories(categories) {
  setStorage(STORAGE_KEYS.categories, categories);
}

/**
 * Lấy danh mục theo ID.
 */
export function getCategoryById(id) {
  return getCategories().find((c) => c.id === id) || null;
}

/**
 * Tạo danh mục mới.
 */
export function createCategory(data) {
  const categories = getCategories();
  const newCategory = {
    id: generateId("cat"),
    name: data.name.trim(),
    description: (data.description || "").trim(),
    createdAt: new Date().toISOString(),
  };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
}

/**
 * Cập nhật danh mục.
 */
export function updateCategory(id, data) {
  const categories = getCategories();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  categories[index] = {
    ...categories[index],
    name: data.name.trim(),
    description: (data.description || "").trim(),
  };
  saveCategories(categories);
  return categories[index];
}

/**
 * Kiểm tra có thể xoá danh mục hay không.
 * Không cho xoá nếu vẫn còn sản phẩm thuộc danh mục đó.
 */
export function canDeleteCategory(id) {
  const products = getProducts();
  return !products.some((p) => p.categoryId === id);
}

/**
 * Xoá danh mục (nếu hợp lệ).
 */
export function deleteCategory(id) {
  if (!canDeleteCategory(id)) {
    return { success: false, message: "Danh mục đang có sản phẩm, không thể xoá." };
  }
  const categories = getCategories().filter((c) => c.id !== id);
  saveCategories(categories);
  return { success: true };
}

/**
 * Đếm số sản phẩm thuộc một danh mục.
 */
export function countProductsInCategory(id) {
  return getProducts().filter((p) => p.categoryId === id).length;
}
