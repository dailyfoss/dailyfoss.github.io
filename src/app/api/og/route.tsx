import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const name = searchParams.get('name') || 'App Name'
    const description = searchParams.get('description') || 'App description'
    const stars = searchParams.get('stars') || '0'
    const license = searchParams.get('license') || 'MIT'
    const featuresParam = searchParams.get('features') || ''
    const features = featuresParam ? featuresParam.split(',').filter(Boolean) : []

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'white',
              borderRadius: '24px',
              padding: '48px',
              width: '1000px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontSize: '56px',
                  fontWeight: 'bold',
                  color: '#1a202c',
                  marginBottom: '16px',
                }}
              >
                {name}
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <div
                  style={{
                    background: '#edf2f7',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '20px',
                    color: '#4a5568',
                  }}
                >
                  ⭐ {stars}
                </div>
                <div
                  style={{
                    background: '#edf2f7',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '20px',
                    color: '#4a5568',
                  }}
                >
                  📄 {license}
                </div>
              </div>

              <div
                style={{
                  fontSize: '22px',
                  color: '#4a5568',
                  lineHeight: '1.5',
                  marginBottom: '24px',
                }}
              >
                {description.length > 180 ? description.slice(0, 180) + '...' : description}
              </div>

              {features.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {features.slice(0, 5).map((feature: string, i: number) => (
                    <div
                      key={i}
                      style={{
                        background: '#667eea',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        fontSize: '18px',
                      }}
                    >
                      {feature}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              marginTop: '24px',
              color: 'white',
              fontSize: '24px',
              fontWeight: '600',
            }}
          >
            dailyfoss.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error: any) {
    return new Response(`Failed to generate image: ${error.message}`, {
      status: 500,
    })
  }
}
