import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import { Footer } from '@/components'

import { PageWrap, ContentWrap } from '../../styles/pages.styles'

import { CategoriesHeader, Categories } from '@/components/CategoriesPage'

const CategoriesPage = () => {
  const t = useTranslation()

  return (
    <PageWrap>
      <ContentWrap>
        <CategoriesHeader translate={t.categories_page.page_header} />
        <Categories translate={t.categories_page.categories} />
      </ContentWrap>
      <Footer />
    </PageWrap>
  )
}

export default CategoriesPage
