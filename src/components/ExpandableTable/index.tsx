import React, { useState } from 'react'

import Main from './ExpandableTable'

import mockTableData from './mockTableData'
import { ExpandableTableProps } from './interfaces'

const ExpandableTable = ({ data }: ExpandableTableProps) => {
  const [tableOpen, setTableOpen] = useState<boolean>(false)

  const handleTable = () => {
    setTableOpen((prev) => !prev)
  }

  return (
    <Main
      data={data || mockTableData}
      isTableOpen={tableOpen}
      onChangeTable={handleTable}
    />
  )
}

export default ExpandableTable
