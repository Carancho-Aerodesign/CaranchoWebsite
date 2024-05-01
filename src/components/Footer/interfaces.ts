interface SocialMedia {
  icon: any
  link: string
}

export interface FooterProps {
  translate?: {
    contact: string
    location: {
      label: string
      address: string
    }
  }
  socialMediaMap?: SocialMedia[]
}
