import styled from 'styled-components'
import Image from 'next/image'

import styles from '@/styles/styles'

interface ContentProps {
  align?: 'left' | 'right'
}

export const Container = styled.footer`
  width: 100%;
  height: 212px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: auto;
  padding: 0 6.6%;

  position: absolute;
  bottom: 0;

  background-color: ${styles.colors.secondary};

  @media (max-width: 728px) {
    flex-direction: column;
    align-items: center;
    height: 300px;
    padding: 1rem 6.6%;
    gap: 1.5rem;

    & > :nth-child(1) {
      order: 1;
    }

    & > :nth-child(2) {
      order: 0;
    }

    & > :nth-child(3) {
      order: 2;
    }
  }
`

export const Content = styled.div<ContentProps>`
  width: 25%;
  height: 54%;

  display: flex;
  flex-direction: column;
  gap: 1rem;

  color: white;

  text-align: left;
  text-align: ${({ align }) => align || `left`};

  h3 {
    font-size: ${styles.fontSizes.lg};
    font-weight: ${styles.fontWeights.extrabold};
  }

  p {
    font-size: ${styles.fontSizes.xxs};
    font-weight: ${styles.fontWeights.medium};
  }

  @media (max-width: 728px) {
    width: fit-content;
    text-align: center;
  }
`

export const Logo = styled(Image)`
  width: 252px;
  height: auto;

  @media (max-width: 912px) {
    width: 160px;
  }

  @media (max-width: 728px) {
    width: 120px;
  }
`

export const SocialMediaWrapper = styled.div`
  width: 100%;
  height: fit-content;

  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 728px) {
    gap: 3rem;
    padding: 1rem 0 0 0;
  }

  @media (max-width: 320px) {
    gap: 1.8rem;
  }
`

export const SocialMediaIcon = styled(Image)`
  width: 20px;
  height: auto;

  @media (max-width: 728px) {
    width: 30px;
  }
`
