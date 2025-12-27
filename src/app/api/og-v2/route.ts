import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const name = searchParams.get('name') || 'App Name'
    const description = searchParams.get('description') || 'App description'
    const stars = searchParams.get('stars') || '0'
    const license = searchParams.get('license') || 'MIT'
    const featuresParam = searchParams.get('features') || ''
    const features = featuresParam ? featuresParam.split(',').filter(Boolean) : []

    // HTML template for the OG image
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              width: 1200px;
              height: 630px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
            }
            .card {
              background: white;
              border-radius: 24px;
              padding: 48px;
              width: 1000px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .title {
              font-size: 56px;
              font-weight: bold;
              color: #1a202c;
              margin-bottom: 16px;
            }
            .badges {
              display: flex;
              gap: 12px;
              margin-bottom: 24px;
            }
            .badge {
              background: #edf2f7;
              padding: 8px 16px;
              border-radius: 8px;
              font-size: 20px;
              color: #4a5568;
            }
            .description {
              font-size: 22px;
              color: #4a5568;
              line-height: 1.5;
              margin-bottom: 24px;
            }
            .features {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
            }
            .feature {
              background: #667eea;
              color: white;
              padding: 10px 20px;
              border-radius: 12px;
              font-size: 18px;
            }
            .footer {
              margin-top: 24px;
              color: white;
              font-size: 24px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">${name}</div>
            <div class="badges">
              <div class="badge">⭐ ${stars}</div>
              <div class="badge">📄 ${license}</div>
            </div>
            <div class="description">
              ${description.length > 180 ? description.slice(0, 180) + '...' : description}
            </div>
            ${features.length > 0 ? `
              <div class="features">
                ${features.slice(0, 5).map(f => `<div class="feature">${f}</div>`).join('')}
              </div>
            ` : ''}
          </div>
          <div class="footer">dailyfoss.com</div>
        </body>
      </html>
    `

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 630 })
    await page.setContent(html)
    
    const screenshot = await page.screenshot({ type: 'png' })
    await browser.close()

    return new NextResponse(screenshot, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error: any) {
    console.error('Error generating OG image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image', message: error.message },
      { status: 500 }
    )
  }
}
