import React from 'react'

import { CategoryDefaultProps } from './interfaces'
import * as S from './Category.styles'



const Category = ({
  title,
  image,
  competitions,
  description,
  approaches,
}: CategoryDefaultProps) => {

  return (
    <S.Container id={title.toLowerCase()}>
      <S.Divider />
      <S.Wrapper>
        <S.MainTextcontainer>
          <S.Row spaced="true">
            <S.CategoryTitle>{title}</S.CategoryTitle>
            <S.CategoryCompetitions>{competitions}</S.CategoryCompetitions>
          </S.Row>
          <S.CategoryDescription>{description}</S.CategoryDescription>
        </S.MainTextcontainer>
        <S.CategoryImage src={image} alt={`${title} picture`} />
      </S.Wrapper>
      {approaches && (
        <>
          <S.ApproachSectionTitle>Nossas abordagens</S.ApproachSectionTitle>
          <S.Wrapper>
            {approaches.map((approach, index) => (
              <S.ApproachContainer
                small={(index % 2 !== 0).toString()}
                key={`${approach.title}_category_key`}
              >
                <S.ApproachTitle>{approach.title}</S.ApproachTitle>
                <S.ApproachDescription>
                  {approach.description}
                </S.ApproachDescription>
              </S.ApproachContainer>
            ))}
          </S.Wrapper>
        </>
      )}
      <S.TableWrapper>
      </S.TableWrapper>
    </S.Container>
  )
}

export default Category
