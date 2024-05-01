import React from 'react'

import typeImageMap from './utils/typeImageMap'

import { InfoPopup } from './interfaces'

import Main from './InfoPopup'

const InfoPopup = ({ translate, type, onClose }: InfoPopup) => {
  const backgroundImages = typeImageMap[type as keyof typeof typeImageMap]

  return (
    <Main
      title={translate[type].title}
      description={translate[type].description}
      backgroundImages={backgroundImages}
      onClose={onClose}
    />
  )
}

export default InfoPopup
