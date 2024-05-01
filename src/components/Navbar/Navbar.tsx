import React from 'react'
import Image from 'next/image'

import { LogoWithLabel, MenuIcon, CloseIcon } from '@/assets'

import { Menu } from './components'

import * as S from './Navbar.styles'

import { NavbarProps } from './interfaces'

const Navbar = ({
  router,
  locale,
  navOptions,
  languages,
  isMenuOpen,
  onChangeLanguage,
  onPressMenu,
}: NavbarProps) => (
  <S.Container>
    <Image src={LogoWithLabel} alt="logo" priority height={60} />
    <S.NavOptions>
      {navOptions?.map((option, index) => (
        <S.StyledLink
          key={index + option.link}
          href={option.link}
          active={router?.asPath === option.link ? 'true' : 'false'}
        >
          {option.label}
        </S.StyledLink>
      ))}
      <S.StyledSelect
        name="Idioma"
        onChange={onChangeLanguage}
        defaultValue={locale}
        data-testid="language"
      >
        {languages?.map((language, index) => (
          <option
            key={index + language.label}
            value={language.value}
            label={language.label}
            data-testid={language.label}
          />
        ))}
      </S.StyledSelect>
    </S.NavOptions>
    <S.MenuIcon
      src={isMenuOpen ? CloseIcon : MenuIcon}
      alt="Open menu"
      onClick={onPressMenu}
      data-testid="menu-button"
    />
    {isMenuOpen && (
      <Menu
        navOptions={navOptions}
        languages={languages}
        router={router}
        locale={locale}
        onNavigate={onPressMenu}
        onChangeLanguage={onChangeLanguage}
        data-testid="menu"
      />
    )}
  </S.Container>
)

export default Navbar
