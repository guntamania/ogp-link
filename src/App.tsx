import { useState } from 'react'
import './App.css'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'

interface OGPData {
  id: string
  title?: string
  description?: string
  image?: string
  url?: string
  siteName?: string
}

function App() {
  const [url, setUrl] = useState('')
  const [ogpCards, setOgpCards] = useState<OGPData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOGP = async (targetUrl: string) => {
    try {
      setLoading(true)
      setError(null)

      // 複数のCORSプロキシを試す
      const proxyUrls = [
        `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
        `https://cors-anywhere.herokuapp.com/${targetUrl}`
      ]

      let html = ''
      let lastError = ''

      // 各プロキシを順番に試す
      for (const proxyUrl of proxyUrls) {
        try {
          const response = await fetch(proxyUrl)

          if (!response.ok) {
            lastError = `Failed to fetch from ${proxyUrl}`
            continue
          }

          // allorigins.winの場合はJSONレスポンス
          if (proxyUrl.includes('allorigins')) {
            const data = await response.json()
            html = data.contents
          } else {
            html = await response.text()
          }

          if (html) {
            break // 成功したらループを抜ける
          }
        } catch (err) {
          lastError = err instanceof Error ? err.message : 'Unknown error'
          continue
        }
      }

      if (!html) {
        throw new Error(`All proxy attempts failed. Last error: ${lastError}`)
      }

      // HTMLからOGPタグを抽出
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      const getMetaContent = (property: string): string | undefined => {
        const meta = doc.querySelector(`meta[property="${property}"]`) ||
                     doc.querySelector(`meta[name="${property}"]`)
        return meta?.getAttribute('content') || undefined
      }

      const ogp: OGPData = {
        id: Date.now().toString(),
        title: getMetaContent('og:title') || doc.querySelector('title')?.textContent || undefined,
        description: getMetaContent('og:description') || getMetaContent('description'),
        image: getMetaContent('og:image'),
        url: getMetaContent('og:url') || targetUrl,
        siteName: getMetaContent('og:site_name')
      }

      // 新しいカードを配列に追加
      setOgpCards(prevCards => [...prevCards, ogp])
      setUrl('') // フォームをクリア
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOGP(url)
  }

  return (
    <div className="container">
      <h1>OGP Link Generator</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL (e.g., https://example.com)"
            required
            className="url-input"
          />
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? '読み込み中...' : 'リンクを追加'}
        </button>
      </form>

      {error && (
        <div className="error">
          <p>Error: {error}</p>
        </div>
      )}

      <div className="cards-container">
        {ogpCards.map((card) => (
          <Card key={card.id} sx={{ maxWidth: 800, marginBottom: 2 }}>
            <CardActionArea
              component="a"
              href={card.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              {card.image && (
                <CardMedia
                  component="img"
                  height="300"
                  image={card.image}
                  alt={card.title || 'OGP Image'}
                />
              )}
              <CardContent>
                {card.siteName && (
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {card.siteName}
                  </Typography>
                )}
                {card.title && (
                  <Typography gutterBottom variant="h5" component="div">
                    {card.title}
                  </Typography>
                )}
                {card.description && (
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                )}
                {card.url && (
                  <Typography variant="caption" color="primary" sx={{ display: 'block', marginTop: 1 }}>
                    {card.url}
                  </Typography>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default App
