import React from 'react'

import { ArrowIcon } from '@/assets'

import { ExpandableTableProps } from './interfaces'
import * as S from './ExpandableTable.styles'

const ExpandableTable = ({
  data,
  isTableOpen,
  onChangeTable,
}: ExpandableTableProps) => {
  return (
    <S.Container>
      <S.TopBar onClick={onChangeTable} data-testid="topbar">
        <S.Arrow
          src={ArrowIcon}
          alt={'Seta para expandir'}
          open={isTableOpen}
        />
        <p>{data?.label}</p>
      </S.TopBar>
      {isTableOpen && (
        <S.Table data-testid="table">
          <tbody>
            <tr>
              {data?.th?.map((cell: string, index) => (
                <th key={index}>{cell}</th>
              ))}
            </tr>
            {data?.trs?.map((row: string[], index) => (
              <tr key={index}>
                {row?.map((cell: string, index) => (
                  <td key={index}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </S.Table>
      )}
    </S.Container>
  )
}

export default ExpandableTable
