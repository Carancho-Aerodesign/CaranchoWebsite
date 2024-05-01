import styled from 'styled-components'
import Image from 'next/image'

import styles from '@/styles/styles'

import { BackgroundBlob } from './assets'

export const Container = styled.section`
  width: 100%;
  height: fit-content;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 96px;

  padding: 66px 0;

  background-image: url(${BackgroundBlob.src});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: top;

  overflow-y: hidden;
`

export const SectionTitle = styled.h3`
  color: ${styles.colors.secondary};
  text-align: center;
  font-size: ${styles.fontSizes.xl};
  font-weight: ${styles.fontWeights.bold};
  text-transform: uppercase;
`

export const CallToAction = styled.p`
  color: ${styles.colors.darkGray};
  text-align: center;
  font-size: ${styles.fontSizes.lg};
  font-weight: ${styles.fontWeights.medium};
`

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const Row = styled.div`
  width: 75%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;

  margin-top: -32px;

  @media (max-width: 768px) {
    width: 85%;
  }

  @media (max-width: 414px) {
    width: 100%;
  }
`

export const Brand = styled(Image)`
  width: 15%;
  height: auto;

  object-fit: contain;

  @media (max-width: 1200px) {
    width: 20% !important;
  }

  @media (max-width: 912px) {
    width: 33% !important;
  }

  @media (max-width: 768px) {
    width: 40% !important;
  }

  @media (max-width: 280px) {
    width: 75% !important;
  }
`

export const MailWrapper = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  background-color: gray;
`

export const Mail = styled.p`
  color: ${styles.colors.secondary};
  text-align: center;
  font-size: ${styles.fontSizes.lg};
  font-weight: ${styles.fontWeights.bold};
`

export const MailIcon = styled(Image)`
  height: 20px;
  width: auto;
  padding-top: 4px;
  margin-right: 4px;
`
