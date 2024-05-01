import styled from 'styled-components'
import styles from '@/styles/styles'

export const Container = styled.section`
  width: 100%;
  height: fit-content;
  margin: auto;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;

  padding: 115px 7.5% 0;
`

export const Row = styled.div`
  width: 80%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 1110px) {
    width: 50%;
  }

  @media (max-width: 875px) {
    width: 70%;
  }

  @media (max-width: 414px) {
    width: 80%;
  }
`

export const Title = styled.h1`
  color: ${styles.colors.secondary};
  font-size: ${styles.fontSizes.xl};
  font-weight: ${styles.fontWeights.bold};
  text-transform: uppercase;
`

export const Description = styled.p`
  color: ${styles.colors.darkGray};
  font-size: ${styles.fontSizes.lg};
  font-weight: ${styles.fontWeights.medium};
  text-align: center;
`

export const GategorySmallCard = styled.div`
  width: 175px;
  height: 80px;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;

  padding: 16px;
  border-radius: 24px;

  color: white;
  text-transform: uppercase;
  font-size: ${styles.fontSizes.sm};
  font-weight: ${styles.fontWeights.bold};
  text-align: center;

  border: none;

  background: linear-gradient(
      281deg,
      rgba(48, 48, 48, 0.6),
      rgba(0, 0, 0, 0) 40.16%
    ),
    #E6A127;

  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  cursor: pointer;

  @media (max-width: 574px) {
    width: 100%;
  }
`
