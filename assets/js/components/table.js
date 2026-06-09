/**
 * components/table.js - Component bảng dùng chung
 *
 * createTable({ columns, data, actions, emptyMessage })
 *  - columns: [{ key, label, align?, render?(row) }]
 *  - data: mảng object
 *  - actions: (row) => "HTML string" cho cột thao tác (tuỳ chọn)
 *  - emptyMessage: text khi không có dữ liệu
 *
 * Trả về chuỗi HTML <table>.
 */
export function createTable({ columns = [], data = [], actions = null, emptyMessage = "Không có dữ liệu." }) {
  const colCount = columns.length + (actions ? 1 : 0);

  const head = `
    <thead>
      <tr>
        ${columns
          .map(
            (col) =>
              `<th class="${col.align === "right" ? "text-right" : ""}">${col.label}</th>`
          )
          .join("")}
        ${actions ? '<th class="text-right">Thao tác</th>' : ""}
      </tr>
    </thead>
  `;

  let bodyRows;
  if (!data.length) {
    bodyRows = `
      <tr>
        <td colspan="${colCount}">
          <div class="table-empty">${emptyMessage}</div>
        </td>
      </tr>
    `;
  } else {
    bodyRows = data
      .map((row) => {
        const cells = columns
          .map((col) => {
            const value = col.render ? col.render(row) : row[col.key];
            return `<td class="${col.align === "right" ? "text-right" : ""}">${
              value ?? ""
            }</td>`;
          })
          .join("");
        const actionCell = actions
          ? `<td><div class="table-actions">${actions(row)}</div></td>`
          : "";
        return `<tr data-id="${row.id}">${cells}${actionCell}</tr>`;
      })
      .join("");
  }

  return `
    <div class="table-wrap">
      <table class="data-table">
        ${head}
        <tbody>${bodyRows}</tbody>
      </table>
    </div>
  `;
}
