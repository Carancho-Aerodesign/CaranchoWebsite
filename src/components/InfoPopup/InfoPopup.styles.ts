import styled, { css } from 'styled-components'
import Image from 'next/image'

import styles from '@/styles/styles'

import GreenBlob from './assets/greenBlob.svg'

interface BackgroundImageProps {
  position: 'left' | 'right'
}

export const Container = styled.div`
  display: flex;

  width: 1000px;
  height: 750px;
  min-height: fit-content;

  position: fixed;
  top: 55%;
  left: 50%;
  transform: translate(-50%, -50%);

  padding-bottom: 4rem 0;

  border-radius: 1.5rem;

  background-image: url(${GreenBlob?.src});
  background-color: ${styles.colors.white};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center bottom -20px;

  box-shadow: 0px 10px 12px rgba(0, 0, 0, 0.1);

  z-index: 5;

  @media (max-width: 1200px) {
    width: 80vw;
    height: 70vh;
  }

  @media (max-width: 760px) {
    width: 80vw;
  }

  @media (max-width: 414px) {
    width: 90vw;

    background-size: cover;
  }
`

export const CloseIcon = styled(Image)`
  width: 5%;
  height: auto;

  margin: 3%;

  position: absolute;
  cursor: pointer;

  @media (max-width: 760px) {
    width: 10%;
  }

  @media (max-width: 414px) {
    width: 15%;
  }
`

export const Content = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-self: center;
  gap: 4rem;
  margin: auto;

  @media (max-width: 414px) {
    width: 75%;
  }
`

export const Title = styled.p`
  font-size: ${styles.fontSizes.xl};
  font-weight: ${styles.fontWeights.bold};
`

export const Description = styled.p`
  font-size: ${styles.fontSizes.lg};

  text-align: center;
  text-justify: inter-word;
`

export const BackgroundImage = styled(Image)<BackgroundImageProps>`
  width: 15%;
  height: auto;

  right: 75%;

  position: absolute;

  @media (max-width: 760px) {
    width: 20%;
  }

  @media (max-width: 414px) {
    width: 20%;
    bottom: 60%;
  }

  ${({ position }) =>
    position === 'right' &&
    css`
      left: 75%;
      bottom: 65%;

      @media (max-width: 414px) {
        bottom: 80%;
      }
    `}
`
