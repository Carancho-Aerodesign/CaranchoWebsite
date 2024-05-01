import React from 'react'

import Micro from './assets/Micro.jpg'
import Regular from './assets/Regular.jpg'

import Main from './Categories'

import { CategoriesDefaultProps } from './interfaces'

const Categories = ({ translate }: CategoriesDefaultProps) => {
  const images = [Micro, Regular]

  return <Main categories={translate} images={images} />
}

export default Categories
