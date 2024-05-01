import Image from 'next/image'
import styled from 'styled-components'

export const StyledBanner = styled.section`
  padding: 12vh 12vw 6vh;
  min-height: 100vh;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2vw;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

export const StyledImage = styled(Image)`
  width: calc(16vw + 200px);
  height: auto;

  @media (max-width: 768px) {
    width: 80vw;
  }
`

export const StyledContent = styled.div`
  text-align: right;
  width: calc(48vw + 2rem);

  h2 {
    font-size: calc(0.3rem + 3vw);
    font-weight: 900;
    margin-bottom: calc(2vh + 1rem);

    span {
      color: #E6A127;
    }
  }

  p {
    font-size: calc(0.8rem + 0.75vw);
  }

  @media (max-width: 768px) {
    text-align: left;
    width: calc(80vw + 2rem);

    h2 {
      font-size: calc(2rem + 1vw);
      margin-bottom: calc(4vh + 0.5rem);
    }

    p {
      font-size: calc(1.6rem + 0.3vw);
    }
  }
`
