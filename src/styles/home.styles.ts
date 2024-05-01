import styled from 'styled-components'

export const StyledComponent = styled.div`
  font-size: 24px;
  height: 300px;
`

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
