# Kho Hàng — Hệ thống quản lý hàng hoá

Ứng dụng quản lý hàng hoá (warehouse) viết bằng **HTML, CSS và JavaScript thuần** (ES6 Modules), không dùng framework, không backend. Dữ liệu được lưu tạm bằng `localStorage`.

## Cách chạy

> ⚠️ Vì dùng ES6 Module (`import`/`export`), bạn **không thể mở trực tiếp** `index.html` bằng `file://`. Cần chạy qua một web server tĩnh.

### Cách 1 — Live Server (VS Code)
1. Mở thư mục `warehouse-app` trong VS Code.
2. Cài extension **Live Server**.
3. Chuột phải vào `index.html` → **Open with Live Server**.

### Cách 2 — Server tĩnh bất kỳ
```bash
# Trong thư mục warehouse-app
npx serve .
# hoặc
python -m http.server 3000
```
Rồi mở `http://localhost:3000`.

## Chức năng chính

- **Tổng quan (Dashboard):** thống kê tổng sản phẩm, tổng tồn kho, số hàng sắp hết, số danh mục, tổng giá trị tồn kho; danh sách giao dịch gần đây và hàng sắp hết.
- **Hàng hoá:** thêm / sửa / xoá sản phẩm, tìm kiếm theo tên/mã, lọc theo danh mục và trạng thái. Trạng thái tự tính: *Hết hàng* (0), *Sắp hết* (1–4), *Còn hàng* (≥5).
- **Danh mục:** thêm / sửa / xoá danh mục. Không cho xoá nếu danh mục vẫn còn sản phẩm.
- **Nhập / Xuất kho:** form nhập và xuất hàng, tự cập nhật tồn kho, chặn xuất vượt tồn, lưu lịch sử và lọc theo loại giao dịch.
- **Lưu dữ liệu:** toàn bộ `products`, `categories`, `transactions` lưu trong `localStorage`. Dữ liệu mẫu được tạo tự động ở lần chạy đầu tiên.

## Cấu trúc thư mục

```
warehouse-app/
├── index.html                  # Layout chính (sidebar, header, content)
├── assets/
│   ├── css/
│   │   ├── reset.css           # Reset CSS
│   │   ├── variables.css       # Biến màu, font, shadow, kích thước
│   │   ├── base.css            # Style chung (body, input, table...)
│   │   ├── layout.css          # Bố cục dashboard + responsive
│   │   ├── components.css      # Card, button, badge, modal, toast, form
│   │   └── pages.css           # Style riêng từng trang
│   ├── js/
│   │   ├── main.js             # Điểm khởi đầu
│   │   ├── config.js           # APP_CONFIG, STORAGE_KEYS, LOW_STOCK_LIMIT
│   │   ├── core/
│   │   │   ├── storage.js      # localStorage + seed dữ liệu mẫu
│   │   │   ├── router.js       # Router theo hash
│   │   │   ├── helpers.js      # Hàm tiện ích (format, status, tính toán)
│   │   │   └── validators.js   # Kiểm tra dữ liệu form
│   │   ├── data/               # Dữ liệu mẫu
│   │   │   ├── products.js
│   │   │   ├── categories.js
│   │   │   └── transactions.js
│   │   ├── services/           # Tầng nghiệp vụ
│   │   │   ├── product.service.js
│   │   │   ├── category.service.js
│   │   │   └── transaction.service.js
│   │   ├── components/         # Thành phần UI tái sử dụng
│   │   │   ├── sidebar.js
│   │   │   ├── header.js
│   │   │   ├── table.js
│   │   │   ├── modal.js
│   │   │   ├── toast.js
│   │   │   └── icons.js
│   │   └── pages/              # Các trang
│   │       ├── dashboard.page.js
│   │       ├── products.page.js
│   │       ├── categories.page.js
│   │       └── transactions.page.js
│   └── images/
│       └── logo.png
└── README.md
```

## Đặt lại dữ liệu

Muốn xoá toàn bộ dữ liệu và tạo lại dữ liệu mẫu: mở DevTools → Console và chạy:
```js
localStorage.clear(); location.reload();
```
