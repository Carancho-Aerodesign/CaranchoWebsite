import React, { useCallback } from 'react'

import Main from './CategoriesHeader'

import { CategoriesHeaderProps } from './interfaces'

const CategoriesHeader = ({ translate }: CategoriesHeaderProps) => {
  const scrollToSection = useCallback((sectionId: string) => {
    const section = document.getElementById(sectionId)

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [])

  return <Main translate={translate} scrollToSection={scrollToSection} />
}

export default CategoriesHeader
