import styled from 'styled-components'
import Image from 'next/image'

import styles from '@/styles/styles'

export const Container = styled.section`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 48px;

  padding: 5% 8%;
`
export const SectionTitle = styled.p`
  text-align: center;
  font-size: ${styles.fontSizes.xl};
  font-weight: ${styles.fontWeights.bold};
  text-transform: uppercase;
`

const RegularText = styled.p`
  font-size: ${styles.fontSizes.lg};
  font-weight: ${styles.fontWeights.medium};
  text-align: justify;
`

export const Row = styled.div`
  height: fit-content;
  display: flex;
`

export const ContentWrapper = styled(Row)`
  @media (max-width: 1200px) {
    flex-direction: column;
    gap: 32px;
  }
`

export const Column = styled.div`
  display: flex;
  flex-direction: column;
`

export const ContentColumn = styled(Column)`
  height: 500px;
  justify-content: space-between;

  @media (max-width: 1200px) {
    gap: 32px;
    height: fit-content;
  }
`

export const Description = styled(RegularText)`
  height: fit-content;
  color: ${styles.colors.darkGray};
  width: 80%;
  font-size: ${styles.fontSizes.md};

  @media (max-width: 1200px) {
    width: 100%;
  }
`

export const GroupImage = styled(Image)`
  border-radius: 24px;
  width: 50%;
  height: auto;
  object-fit: cover;

  @media (max-width: 1200px) {
    width: 100%;
  }
`

export const FeatureRow = styled(Row)`
  justify-content: space-evenly;
  width: 80%;
  gap: 8px;

  @media (max-width: 1200px) {
    width: 100%;
  }
`

export const Feature = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`

export const FeatureIcon = styled(Image)`
  height: 48px;
  width: auto;

  @media (max-width: 1200px) {
    height: 36px;
  }

  @media (max-width: 768px) {
    height: 24px;
  }
`

export const FeatureLabel = styled(RegularText)`
  font-size: ${styles.fontSizes.md};

  @media (max-width: 768px) {
    font-size: ${styles.fontSizes.sm};
  }
`

export const FeatureQuantifier = styled.div`
  display: flex;
  justify-content: center;
  color: white;
  padding: 8px 48px;
  border-radius: 10px;
  background: linear-gradient(
    90deg,
    ${styles.colors.secondary} 0%,
    ${styles.colors.primary} 100%
  );

  @media (max-width: 768px) {
    padding: 4px 24px;
  }
`
