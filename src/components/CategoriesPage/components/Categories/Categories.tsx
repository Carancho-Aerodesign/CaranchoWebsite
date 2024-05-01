import React from 'react'

import Category from '../Category/Category'

import { CategoriesProps } from './interfaces'

import * as S from './Categories.styles'

const Categories = ({ categories, images }: CategoriesProps) => {
  return (
    <S.Container>
      {categories.map((category, index) => (
        <Category
          key={`category_key_${index}`}
          title={category.title}
          image={images[index]}
          competitions={category.competitions}
          description={category.description}
          approaches={category.approaches}
        />
      ))}
    </S.Container>
  )
}

export default Categories
