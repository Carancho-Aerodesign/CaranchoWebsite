interface ActivityType {
  title: string
  description: string
}

interface BackgroundImages {
  leftImage?: any
  rightImage?: any
}

export interface InfoPopup {
  translate: {
    competitions: ActivityType
    research: ActivityType
    development: ActivityType
  }
  type: 'development' | 'research' | 'competitions'
  onClose: () => void
}

export interface InfoPopupProps {
  title: string
  description: string
  backgroundImages?: BackgroundImages
  onClose: () => void
}
