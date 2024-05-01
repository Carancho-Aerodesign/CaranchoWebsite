import styled from 'styled-components'
import Image from 'next/image'

import styles from '@/styles/styles'

interface BackgroundImageProps {
  position?: 'left' | 'right'
}

export const Container = styled.section`
  width: 100%;
  min-height: fit-content;
  height: 430px;

  display: flex;
  justify-content: space-around;
  align-items: center;

  padding: 2rem;

  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.08),
    0px 0px 4px 0px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
    height: fit-content;
  }
`

export const ActivityCard = styled.div`
  width: 380px;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    padding: 2rem;
    width: 100%;
  }
`

export const ActivityImage = styled(Image)`
  width: 40%;
  height: auto;
`

export const Title = styled.h3`
  font-size: ${styles.fontSizes.lg};
  font-weight: ${styles.fontWeights.bold};
`

export const Description = styled.p`
  font-size: ${styles.fontSizes.xxs};
  font-weight: ${styles.fontWeights.medium};
  color: ${styles.colors.darkGray};

  text-align: center;
`

export const Button = styled.button`
  border-radius: 2rem;
  background: ${styles.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 2rem;

  font-family: inherit;
  font-size: ${styles.fontSizes.sm};
  font-weight: ${styles.fontWeights.medium};

  cursor: pointer;

  @media (max-width: 768px) {
    padding: 1rem 2rem;
    width: 100%;
  }
`

export const BackgroundImage = styled(Image)<BackgroundImageProps>`
  height: 430px;
  width: auto;

  position: absolute;
  z-index: -1;

  @media (max-width: 768px) {
    display: none;
  }

  ${({ position }) => position === 'left' && `left: 0`}
  ${({ position }) => position === 'right' && `right: 0`}
`
