import React from 'react'

import { LeftArrow } from './assets'

import { InfoPopupProps } from './interfaces'

import * as S from './InfoPopup.styles'

const InfoPopup = ({
  title,
  description,
  backgroundImages,
  onClose,
}: InfoPopupProps) => {
  return (
    <S.Container>
      <S.CloseIcon
        src={LeftArrow}
        alt="Fechar popup"
        onClick={onClose}
        data-testid="close-button"
      />
      <S.Content>
        <S.Title>{title}</S.Title>
        <S.Description>{description}</S.Description>
        {backgroundImages && (
          <>
            <S.BackgroundImage
              position="left"
              src={backgroundImages.leftImage}
              alt="Background image"
              data-testid="left-img"
            />
            <S.BackgroundImage
              position="right"
              src={backgroundImages.rightImage}
              alt="Background image"
              data-testid="right-img"
            />
          </>
        )}
      </S.Content>
    </S.Container>
  )
}

export default InfoPopup
