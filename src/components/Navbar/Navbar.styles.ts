import styled from 'styled-components'
import Link from 'next/link'
import Image from 'next/image'

import styles from '@/styles/styles'

interface LinkProps {
  active?: 'true' | 'false'
}

export const Container = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  width: 100%;
  height: 85px;
  padding: 21px 6.6%;
  background-color: ${styles.colors.white};

  font-size: ${styles.fontSizes.sm};
  font-weight: ${styles.fontWeights.semibold};
  text-transform: uppercase;

  z-index: 10;

  @media (max-width: 1120px) {
    font-size: ${styles.fontSizes.xxs};
  }
`

export const NavOptions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 50%;
  min-width: fit-content;
  gap: 32px;

  @media (max-width: 912px) {
    display: none;
  }
`

export const StyledLink = styled(Link)<LinkProps>`
  color: ${({ active }) =>
    active === 'true' ? styles.colors.primary : 'inherit'};
`

export const StyledSelect = styled.select`
  color: ${styles.colors.primary};
  text-align-last: left;
  border: none;
  outline: none;
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
  text-transform: inherit;
  text-decoration: none;
  background-color: transparent;
  cursor: pointer;
`

export const MenuIcon = styled(Image)`
  width: 24px;
  height: auto;
  opacity: 0.5;
  cursor: pointer;

  @media (min-width: 913px) {
    display: none;
  }
`
