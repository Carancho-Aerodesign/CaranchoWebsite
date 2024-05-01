import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import { Footer, Activities, AboutUs, Sponsors, Banner } from '@/components'

import * as S from '../styles/home.styles'

export default function Home() {
  const t = useTranslation()

  return (
    <S.PageWrap>
      <S.ContentWrap>
        <Banner translate={t.home.banner.headline} />
        <AboutUs translate={t.home.about_us} />
        <Activities translate={t.home.activities} />
        <Sponsors translate={t.home.sponsors} />
      </S.ContentWrap>
      <Footer />
    </S.PageWrap>
  )
}
