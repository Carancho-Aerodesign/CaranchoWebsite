import React from 'react'

import useTranslation from '@/hooks/useTranslation'

import { Facebook, Github, Instagram, LinkedIn, Youtube } from './assets'

import Main from './Footer'

const Footer = () => {
  const t = useTranslation()

  const socialMediaMap = [
    {
      icon: Instagram,
      link: 'https://www.instagram.com/caranchoufsm/',
    },
    {
      icon: Github,
      link: 'https://github.com/Carancho-Aerodesign',
    },
    {
      icon: Facebook,
      link: 'https://www.facebook.com/caranchoaerodesign',
    },
    {
      icon: LinkedIn,
      link: 'https://www.linkedin.com/company/caranchoaerodesign',
    },
    {
      icon: Youtube,
      link: 'https://www.youtube.com/@caranchoaer',
    },
  ]

  return <Main translate={t.footer} socialMediaMap={socialMediaMap} />
}

export default Footer
