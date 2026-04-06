import * as XLSX from "xlsx"

export function exportToExcel<T extends Record<string, unknown>>(
  rows: T[],
  sheetName: string,
  fileName: string,
): void {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31))
  XLSX.writeFile(wb, fileName)
}
