interface TableData {
  label: string
  th: string[]
  trs: string[][]
}

export interface ExpandableTableProps {
  data?: TableData
  isTableOpen?: boolean
  onChangeTable?: () => void
}
