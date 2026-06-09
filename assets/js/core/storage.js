/**
 * core/storage.js - Lớp truy cập localStorage + tạo dữ liệu mẫu
 */

import { STORAGE_KEYS } from "../config.js";
import { SAMPLE_PRODUCTS } from "../data/products.js";
import { SAMPLE_CATEGORIES } from "../data/categories.js";
import { SAMPLE_TRANSACTIONS } from "../data/transactions.js";

/**
 * Lấy dữ liệu từ localStorage và parse JSON.
 * Trả về defaultValue nếu chưa có hoặc lỗi parse.
 */
export function getStorage(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch (error) {
    console.error(`[storage] Lỗi đọc key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Lưu dữ liệu vào localStorage dưới dạng JSON.
 */
export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[storage] Lỗi ghi key "${key}":`, error);
    return false;
  }
}

/**
 * Xoá một key khỏi localStorage.
 */
export function removeStorage(key) {
  localStorage.removeItem(key);
}

/**
 * Khởi tạo dữ liệu mẫu nếu localStorage chưa có dữ liệu.
 * Chỉ seed những key còn trống, không ghi đè dữ liệu hiện có.
 */
export function seedInitialData() {
  if (getStorage(STORAGE_KEYS.categories) === null) {
    setStorage(STORAGE_KEYS.categories, SAMPLE_CATEGORIES);
  }
  if (getStorage(STORAGE_KEYS.products) === null) {
    setStorage(STORAGE_KEYS.products, SAMPLE_PRODUCTS);
  }
  if (getStorage(STORAGE_KEYS.transactions) === null) {
    setStorage(STORAGE_KEYS.transactions, SAMPLE_TRANSACTIONS);
  }
}
