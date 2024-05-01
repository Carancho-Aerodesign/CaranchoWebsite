import React, { useState } from 'react'
import { useRouter } from 'next/router'

import useTranslation from '@/hooks/useTranslation'

import Main from './Navbar'

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState<boolean>(false)
  const router = useRouter()
  const { locale } = router

  const t = useTranslation()

  const navOptions = [
    {
      label: t.navbar.options.home,
      link: '/',
    },
    {
      label: t.navbar.options.categories,
      link: '/categories',
    }
  ]

  const languages = [
    {
      label: 'EN',
      value: 'en',
    },
    {
      label: 'PT',
      value: 'pt-BR',
    },
  ]

  const handleChangeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLocale = e.target.value
    router.push(router.pathname, router.asPath, { locale: selectedLocale })
  }

  const handleMenu = () => {
    console.log('menu')

    setOpenMenu((prev) => !prev)
  }

  return (
    <Main
      router={router}
      locale={locale}
      navOptions={navOptions}
      languages={languages}
      onChangeLanguage={handleChangeLanguage}
      onPressMenu={handleMenu}
      isMenuOpen={openMenu}
    />
  )
}

export default Navbar
