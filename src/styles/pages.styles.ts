import styled from 'styled-components'

export const PageWrap = styled.main`
  position: relative;
  min-height: 100vh;
`

export const ContentWrap = styled.div`
  padding-bottom: 212px;

  @media (max-width: 728px) {
    padding-bottom: 300px;
  }
`
