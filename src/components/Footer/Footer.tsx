import React from 'react'

import { LogoWithLabelBright } from '@/assets'

import * as S from './Footer.styles'

import { FooterProps } from './interfaces'

const Footer = ({ translate, socialMediaMap }: FooterProps) => {
  return (
    <S.Container>
      <S.Content>
        <h3>{translate?.contact}</h3>
        <p>carancho@ufsm.br</p>
        <S.SocialMediaWrapper>
          {socialMediaMap?.map((socialMedia, index) => (
            <a
              href={socialMedia.link}
              target="_blank"
              rel="noopener noreferrer"
              key={index}
            >
              <S.SocialMediaIcon src={socialMedia.icon} alt="social media" />
            </a>
          ))}
        </S.SocialMediaWrapper>
      </S.Content>
      <S.Logo src={LogoWithLabelBright} alt="Logo" priority />
      <S.Content align="right">
        <h3>{translate?.location.label}</h3>
        <p>{translate?.location.address}</p>
      </S.Content>
    </S.Container>
  )
}

export default Footer
