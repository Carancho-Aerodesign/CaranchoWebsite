import React from 'react'

import { NavbarProps } from '../../interfaces'

import * as S from './Menu.styles'

const Menu = ({
  navOptions,
  languages,
  router,
  locale,
  onNavigate,
  onChangeLanguage,
}: Omit<NavbarProps, 'isMenuOpen' | 'onPressMenu'>) => {
  return (
    <S.Container data-testid="menu">
      {navOptions?.map((option, index) => (
        <S.MenuStyledLink
          key={index + option.label}
          href={option.link}
          active={router?.asPath === option.link ? 'true' : 'false'}
          onClick={onNavigate}
        >
          {option.label}
        </S.MenuStyledLink>
      ))}
      <S.MenuStyledSelect
        name="MenuSelect"
        onChange={onChangeLanguage}
        defaultValue={locale}
      >
        {languages?.map((language, index) => (
          <option
            key={index + language.label}
            value={language.value}
            label={language.label}
          />
        ))}
      </S.MenuStyledSelect>
    </S.Container>
  )
}

export default Menu
