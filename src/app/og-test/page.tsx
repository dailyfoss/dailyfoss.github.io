export default function OGTestPage() {
  // Static OG image generated at build time
  const ogImageUrl = '/og-images/calibre-web.png'

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">OG Image Generator Test</h1>
      
      <div className="space-y-8">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Using Canvas to generate static OG images at build time (compatible with static export).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Generated OG Image (Canvas):</h2>
          <div className="border rounded-lg overflow-hidden shadow-lg">
            <img 
              src={ogImageUrl} 
              alt="OG Image Preview" 
              className="w-full"
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Image URL:</h2>
          <code className="block bg-gray-100 p-4 rounded text-sm break-all">
            {ogImageUrl}
          </code>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">How to Use:</h2>
          <div className="bg-green-50 p-4 rounded space-y-3">
            <p className="mb-2"><strong>1. Generate images at build time:</strong></p>
            <code className="block bg-white p-3 rounded text-sm">
              node scripts/generate-og-images-canvas.js
            </code>
            
            <p className="mb-2 mt-4"><strong>2. Add to your page metadata:</strong></p>
            <code className="block bg-white p-3 rounded text-sm">
              {`<meta property="og:image" content="https://yourdomain.com${ogImageUrl}" />`}
            </code>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Generate for All Apps:</h2>
          <div className="bg-yellow-50 p-4 rounded">
            <p className="mb-2">To generate OG images for all apps, modify the script to loop through all JSON files:</p>
            <code className="block bg-white p-3 rounded text-sm overflow-auto">
{`// In scripts/generate-og-images-canvas.js
const jsonDir = path.join(process.cwd(), 'public', 'json')
const files = await fs.readdir(jsonDir)

for (const file of files) {
  if (file.endsWith('.json') && file !== 'metadata.json') {
    const appData = JSON.parse(await fs.readFile(path.join(jsonDir, file)))
    await generateOGImage({
      name: appData.name,
      description: appData.description,
      stars: appData.metadata.github_stars.toLocaleString(),
      license: appData.metadata.license,
      features: appData.features.map(f => f.title)
    }, path.join(outputDir, \`\${appData.slug}.png\`))
  }
}`}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
