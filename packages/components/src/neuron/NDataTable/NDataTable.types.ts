export interface NDataTableColumn {
  /** Column key matching data record keys */
  key: string
  /** Column header label */
  label: string
  /** Whether the column is sortable */
  sortable?: boolean
}

export interface NDataTableProps {
  /** Column definitions */
  columns: NDataTableColumn[]
  /** Data rows */
  data: Array<Record<string, unknown>>
  /** Additional CSS class names */
  className?: string
}
