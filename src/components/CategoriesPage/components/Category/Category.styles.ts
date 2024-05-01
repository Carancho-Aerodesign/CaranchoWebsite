import styled, { css } from 'styled-components'
import Image from 'next/image'

import styles from '@/styles/styles'

interface RowProps {
  spaced: string
}

interface ApproachProps {
  small: string
}

export const Container = styled.div`
  width: 85%;
  height: fit-content;

  display: flex;
  flex-direction: column;
  margin: auto;
`

export const Row = styled.div<RowProps>`
  width: 100%;
  display: flex;
  align-items: center;

  ${({ spaced }) =>
    spaced === 'true' &&
    css`
      justify-content: space-between;
    `}
`

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 1300px) {
    flex-direction: column;
  }
`

export const Divider = styled.div`
  width: 100%;
  height: 2px;
  background-color: ${styles.colors.lightGray};
  margin: 50px 0;
`

export const MainTextcontainer = styled.div`
  width: 50%;
  height: fit-content;

  @media (max-width: 1300px) {
    width: 100%;
  }
`

export const CategoryTitle = styled.h2`
  font-size: ${styles.fontSizes.xl};
  font-weight: ${styles.fontWeights.extrabold};
  color: ${styles.colors.primary};
`

export const CategoryCompetitions = styled.p`
  font-size: ${styles.fontSizes.sm};
  font-weight: ${styles.fontWeights.medium};
  color: ${styles.colors.primary};
  text-align: right;
`

export const CategoryDescription = styled.p`
  font-size: ${styles.fontSizes.sm};
  font-weight: ${styles.fontWeights.medium};
  text-align: justify;
  text-justify: inter-word;
  margin-top: 20px;
`

export const ApproachContainer = styled.div<ApproachProps>`
  width: ${({ small }) => (small === 'true' ? `528px` : `50%`)};

  @media (max-width: 1300px) {
    width: 100%;
  }
`

export const ApproachTitle = styled.p`
  font-size: ${styles.fontSizes.md};
  font-weight: ${styles.fontWeights.bold};
  color: ${styles.colors.primary};
`

export const ApproachSectionTitle = styled(ApproachTitle)`
  margin: 20px 0;
`

export const ApproachDescription = styled(CategoryDescription)``

export const CategoryImage = styled(Image)`
  width: 528px;
  max-width: 95%;
  height: auto;
  border-radius: 24px 0px 24px 24px;

  @media (max-width: 1300px) {
    margin: 20px auto;
  }
`

export const TableWrapper = styled.div`
  margin-top: 50px;
`
