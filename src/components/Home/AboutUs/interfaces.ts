interface feature {
  icon: any
  label?: string
  quantity: number
  id: string
}

export interface AboutUsProps {
  translate?: {
    title: string
    description: string
    features: {
      participations: string
      papers: string
      members: string
    }
  }
  features?: feature[]
}
