import { redirect } from 'next/navigation'
import fs from 'fs'
import path from 'path'

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

export async function generateStaticParams() {
  const slugs = await getAllScriptSlugs()
  
  return slugs.map((slug) => ({
    slug,
  }))
}

// Redirect old /scripts/[slug] URLs to new /[slug] URLs
export default async function ScriptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  redirect(`/${slug}`)
}
