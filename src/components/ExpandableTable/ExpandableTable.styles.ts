import styled from 'styled-components'
import Image from 'next/image'

import styles from '@/styles/styles'

interface ArrowProps {
  open?: boolean
}

export const Container = styled.div`
  width: 86vw;
  height: fit-content;
  user-select: none;
`

export const TopBar = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(
      331deg,
      rgba(48, 48, 48, 0.6) 35.74%,
      rgba(0, 0, 0, 0) 100%
    ),
    #E6A127;

  font-size: ${styles.fontSizes.lg};
  font-weight: ${styles.fontWeights.extrabold};
  color: white;

  cursor: pointer;
`

export const Arrow = styled(Image)<ArrowProps>`
  width: 0.75rem;
  height: auto;
  transform: ${({ open }) => open && `rotate(90deg)`};

  transition: 100ms ease-in-out;
`

export const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
  border-radius: 0 0 24px 24px;

  font-size: ${styles.fontSizes.sm};

  th,
  td {
    padding: 1rem;
    text-align: center;
    vertical-align: middle;
  }

  th {
    font-weight: ${styles.fontWeights.extrabold};
    text-transform: uppercase;
  }

  tr:nth-child(even) {
    background-color: #ffffff;
  }

  tr:nth-child(odd) {
    background-color: #f4f4f4;
  }

  tr:last-child td:first-child {
    border-bottom-left-radius: 1.5rem;
  }
  tr:last-child td:last-child {
    border-bottom-right-radius: 1.5rem;
  }
`
