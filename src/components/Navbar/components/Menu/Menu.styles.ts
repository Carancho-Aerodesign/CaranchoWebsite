import styled from 'styled-components'

import { StyledSelect, StyledLink } from '../../Navbar.styles'

import styles from '@/styles/styles'

export const Container = styled.div`
  position: absolute;
  top: 100%;
  right: -312px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1.5rem;
  width: 312px;
  padding: 2rem;

  background: linear-gradient(
      0deg,
      rgba(128, 204, 143, 0.3) 0%,
      rgba(100, 159, 112, 0) 100%
    ),
    #f9f9f9;
  border-radius: 20px;
  box-shadow: 0px 8px 20px 4px rgba(0, 0, 0, 0.1);

  font-size: ${styles.fontSizes.sm};
  font-weight: ${styles.fontWeights.semibold};
  text-transform: uppercase;

  animation: slideIn 0.3s ease forwards;

  @media (max-width: 414px) {
    right: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0px;
    font-size: ${styles.fontSizes.lg};
  }

  @media (min-width: 913px) {
    display: none;
  }

  @keyframes slideIn {
    from {
      right: -312px;
    }
    to {
      right: 0;
    }
  }
`

export const MenuStyledLink = styled(StyledLink)``

export const MenuStyledSelect = styled(StyledSelect)``
