import React, { ReactNode } from 'react'
import { Manrope } from 'next/font/google'

import { Navbar } from '@/components'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
})

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <main className={manrope.className}>
      <Navbar />
      {children}
    </main>
  )
}

export default Layout
