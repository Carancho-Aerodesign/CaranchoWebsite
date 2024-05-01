import React from 'react'

import TrophyIcon from './assets/trophy.svg'
import MagnifyingGlassIcon from './assets/magnifying-glass.svg'
import CircuitIcon from './assets/chip.svg'

import Main from './Actitivies'

import { ActivitiesProps } from './interfaces'

const Activities = ({ translate }: ActivitiesProps) => {
  const activitiesMap = [
    {
      image: TrophyIcon,
      title: translate?.competitions_card.title,
      description: translate?.competitions_card.description,
      id: 'competitions' as const,
    },
    {
      image: MagnifyingGlassIcon,
      title: translate?.research_card.title,
      description: translate?.research_card.description,
      id: 'research' as const,
    },
    {
      image: CircuitIcon,
      title: translate?.development_card.title,
      description: translate?.development_card.description,
      id: 'development' as const,
    },
  ]

  return <Main translate={translate} activities={activitiesMap} />
}

export default Activities
