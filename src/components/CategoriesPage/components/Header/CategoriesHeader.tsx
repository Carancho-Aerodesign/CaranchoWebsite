import React from 'react'

import * as S from './CategoriesHeader.styles'

import { CategoriesHeaderProps } from './interfaces'

const CategoriesHeader = ({
  translate,
  scrollToSection,
}: CategoriesHeaderProps) => {
  return (
    <S.Container>
      <S.Title>{translate.title}</S.Title>
      <S.Description>{translate.description}</S.Description>
      <S.Row>
        {translate.categories.map((name) => (
          <S.GategorySmallCard
            onClick={() => scrollToSection?.(name.toLowerCase())}
            key={name}
          >
            {name}
          </S.GategorySmallCard>
        ))}
      </S.Row>
    </S.Container>
  )
}

export default CategoriesHeader
