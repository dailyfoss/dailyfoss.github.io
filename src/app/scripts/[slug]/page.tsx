import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import type { Script } from '@/lib/types'

async function getScript(slug: string): Promise<Script | undefined> {
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
  } catch (error) {
    console.error('Error loading script slugs:', error)
    return []
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const script = await getScript(params.slug)

  if (!script) {
    return {
      title: 'App Not Found',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const appUrl = `${siteUrl}/scripts/${params.slug}`
  const ogImageUrl = `${siteUrl}/media/images/og/${params.slug}.png`

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

export default function ScriptPage({ params }: { params: { slug: string } }) {
  // Redirect to the main scripts page with the slug as a query parameter
  redirect(`/scripts?id=${params.slug}`)
}
