import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Browse Scripts - Daily FOSS',
  description: 'Explore our curated collection of open source deployment scripts and tools',
}

export default function ScriptsLayout({ children }: { children: ReactNode }) {
  return children
}
