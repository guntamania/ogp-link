import { useState } from 'react'
import './App.css'

interface OGPData {
  title?: string
  description?: string
  image?: string
  url?: string
  siteName?: string
}

function App() {
  const [url, setUrl] = useState('')
  const [ogpData, setOgpData] = useState<OGPData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOGP = async (targetUrl: string) => {
    try {
      setLoading(true)
      setError(null)
      setOgpData(null)

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
        title: getMetaContent('og:title') || doc.querySelector('title')?.textContent || undefined,
        description: getMetaContent('og:description') || getMetaContent('description'),
        image: getMetaContent('og:image'),
        url: getMetaContent('og:url') || targetUrl,
        siteName: getMetaContent('og:site_name')
      }

      setOgpData(ogp)
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
          {loading ? 'Loading...' : 'Generate OGP Link'}
        </button>
      </form>

      {error && (
        <div className="error">
          <p>Error: {error}</p>
        </div>
      )}

      {ogpData && (
        <div className="ogp-card">
          {ogpData.image && (
            <div className="ogp-image">
              <img src={ogpData.image} alt={ogpData.title || 'OGP Image'} />
            </div>
          )}
          <div className="ogp-content">
            {ogpData.siteName && (
              <p className="ogp-site-name">{ogpData.siteName}</p>
            )}
            {ogpData.title && (
              <h2 className="ogp-title">{ogpData.title}</h2>
            )}
            {ogpData.description && (
              <p className="ogp-description">{ogpData.description}</p>
            )}
            {ogpData.url && (
              <a href={ogpData.url} target="_blank" rel="noopener noreferrer" className="ogp-url">
                {ogpData.url}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
