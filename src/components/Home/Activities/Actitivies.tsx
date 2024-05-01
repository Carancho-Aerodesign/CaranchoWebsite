import React from 'react'

import AircraftArmVector from './assets/Aircraft-arm.svg'
import CircuitryVector from './assets/circuitry.svg'

import * as S from './Activities.styles'

import { ActivitiesProps } from './interfaces'

const Actitivies = ({ activities }: ActivitiesProps) => {
  return (
    <S.Container aria-label="Activities">
      {activities &&
        activities?.map((activity, index) => (
          <S.ActivityCard key={index}>
            <S.ActivityImage src={activity.image} alt="Activity Icon" />
            <S.Title>{activity.title}</S.Title>
            <S.Description>{activity.description}</S.Description>
          </S.ActivityCard>
        ))}
      <S.BackgroundImage
        src={CircuitryVector}
        alt="Circuitry Background Image"
        position="left"
      />
      <S.BackgroundImage
        src={AircraftArmVector}
        alt="Aircraft Arm Background Image"
        position="right"
      />
    </S.Container>
  )
}

export default Actitivies
