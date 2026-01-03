import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import type { Script } from '@/lib/types'
import { ScriptPageClient } from './client'

// Reserved routes that should not be handled by this dynamic route
const RESERVED_ROUTES = [
  'add-app',
  'admin', 
  'api',
  'auth',
  'category-view',
  'dashboard',
  'data',
  'favorites',
  'index',
  'json-editor',
  'likes',
  'og-test',
  'scripts',
  'versions',
]

async function getScript(slug: string): Promise<Script | undefined> {
  // Don't process reserved routes
  if (RESERVED_ROUTES.includes(slug)) {
    return undefined
  }
  
  try {
    const jsonDir = path.join(process.cwd(), 'public', 'json')
    const filePath = path.join(jsonDir, `${slug}.json`)
    
    if (!fs.existsSync(filePath)) {
      return undefined
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const script: Script = JSON.parse(fileContent)
    return script
  } catch (error) {
    console.error('Error loading script:', error)
    return undefined
  }
}

async function getAllScriptSlugs(): Promise<string[]> {
  try {
    const jsonDir = path.join(process.cwd(), 'public', 'json')
    const files = fs.readdirSync(jsonDir)
    
    return files
      .filter(file => file.endsWith('.json') && file !== 'metadata.json' && file !== 'version.json')
      .map(file => file.replace('.json', ''))
      .filter(slug => !RESERVED_ROUTES.includes(slug))
  } catch (error) {
    console.error('Error loading script slugs:', error)
    return []
  }
}

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const script = await getScript(slug)

  if (!script) {
    return {
      title: 'App Not Found',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const appUrl = `${siteUrl}/${slug}`
  const ogImageUrl = `${siteUrl}/media/images/og/${slug}.svg`

  return {
    title: `${script.name} - Daily FOSS`,
    description: script.description,
    openGraph: {
      title: script.name,
      description: script.description,
      url: appUrl,
      siteName: 'Daily FOSS',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: script.name,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: script.name,
      description: script.description,
      images: [ogImageUrl],
    },
  }
}

export async function generateStaticParams() {
  const slugs = await getAllScriptSlugs()
  
  return slugs.map((slug) => ({
    slug,
  }))
}

export default async function ScriptPage({ params }: PageProps) {
  const { slug } = await params
  
  // Check if this is a reserved route - let Next.js handle it
  if (RESERVED_ROUTES.includes(slug)) {
    notFound()
  }
  
  const script = await getScript(slug)
  
  if (!script) {
    notFound()
  }

  return <ScriptPageClient script={script} slug={slug} />
}
