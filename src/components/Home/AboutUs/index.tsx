import React from 'react'

import { CompetitionsIcon, MembersIcon } from './assets'

import { AboutUsProps } from './interfaces'

import Main from './AboutUs'

const AboutUs = ({ translate }: AboutUsProps) => {
  const features = [
    {
      icon: CompetitionsIcon,
      label: translate?.features.participations,
      quantity: 20,
      id: 'participations',
    },
    {
      icon: MembersIcon,
      label: translate?.features.members,
      quantity: 27,
      id: 'members',
    },
  ]

  return <Main translate={translate} features={features}/>
}

export default AboutUs
