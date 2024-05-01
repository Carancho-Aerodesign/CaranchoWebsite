import React from 'react'

import { Carancho2023 } from '@/assets'

import { AboutUsProps } from './interfaces'

import * as S from './AboutUs.styles'

const AboutUs = ({ translate, features }: AboutUsProps) => {
  return (
    <S.Container>
      <S.SectionTitle>{translate?.title}</S.SectionTitle>
      <S.ContentWrapper>
        <S.ContentColumn>
          <S.Description>{translate?.description}</S.Description>
          <S.FeatureRow>
            {features?.map((feature) => (
              <S.Feature key={feature.id}>
                <S.FeatureIcon
                  src={feature.icon}
                  alt={`${feature.label} Icon`}
                />
                <S.FeatureLabel>{feature.label}</S.FeatureLabel>
                <S.FeatureQuantifier>{feature.quantity}</S.FeatureQuantifier>
              </S.Feature>
            ))}
          </S.FeatureRow>
        </S.ContentColumn>
        <S.GroupImage
          src={Carancho2023}
          alt="Carancho at SAE Brasil Aerodesign 2023"
          priority
        />
      </S.ContentWrapper>
    </S.Container>
  )
}

export default AboutUs
