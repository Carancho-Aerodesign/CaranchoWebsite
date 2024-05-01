interface Activity {
  image: string
  title?: string
  description?: string
  id: 'competitions' | 'research' | 'development'
}

export interface ActivitiesProps {
  translate?: {
    competitions_card: Omit<Activity, 'image' | 'id'>
    research_card: Omit<Activity, 'image' | 'id'>
    development_card: Omit<Activity, 'image' | 'id'>
    activity_card_button: string
  }
  activities?: Activity[]
}
