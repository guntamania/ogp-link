import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import TextField from '@mui/material/TextField'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import { createClient } from "@supabase/supabase-js"

interface OGPData {
  id: string
  title?: string
  description?: string
  image?: string
  url?: string
  siteName?: string
  memo?: string
}

function Admin() {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  )

  const [url, setUrl] = useState("")
  const [memo, setMemo] = useState("")
  const [ogpCards, setOgpCards] = useState<OGPData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testData, setTestData] = useState<any[]>([])

  useEffect(() => {
    fetchTestData()
  }, [])

  async function fetchTestData() {
    try {
      const { data } = await supabase.from("test_data").select()
      setTestData(data!)
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error"
      setError(error)
    }
  }

  const fetchOGP = async (targetUrl: string) => {
    try {
      setLoading(true)
      setError(null)

      // 複数のCORSプロキシを試す
      const proxyUrls = [
        `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
        `https://cors-anywhere.herokuapp.com/${targetUrl}`,
      ]

      let html = ""
      let lastError = ""

      // 各プロキシを順番に試す
      for (const proxyUrl of proxyUrls) {
        try {
          const response = await fetch(proxyUrl)

          if (!response.ok) {
            lastError = `Failed to fetch from ${proxyUrl}`
            continue
          }

          // allorigins.winの場合はJSONレスポンス
          if (proxyUrl.includes("allorigins")) {
            const data = await response.json()
            html = data.contents
          } else {
            html = await response.text()
          }

          if (html) {
            break // 成功したらループを抜ける
          }
        } catch (err) {
          lastError = err instanceof Error ? err.message : "Unknown error"
          continue
        }
      }

      if (!html) {
        throw new Error(`All proxy attempts failed. Last error: ${lastError}`)
      }

      // HTMLからOGPタグを抽出
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")

      const getMetaContent = (property: string): string | undefined => {
        const meta =
          doc.querySelector(`meta[property="${property}"]`) ||
          doc.querySelector(`meta[name="${property}"]`)
        return meta?.getAttribute("content") || undefined
      }

      const ogp: OGPData = {
        id: Date.now().toString(),
        title:
          getMetaContent("og:title") ||
          doc.querySelector("title")?.textContent ||
          undefined,
        description:
          getMetaContent("og:description") || getMetaContent("description"),
        image: getMetaContent("og:image"),
        url: getMetaContent("og:url") || targetUrl,
        siteName: getMetaContent("og:site_name"),
        memo: memo,
      }

      // 新しいカードを配列に追加
      setOgpCards((prevCards) => [...prevCards, ogp])
      setUrl("") // フォームをクリア
      setMemo("") // メモをクリア
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOGP(url)
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography>テストデータ</Typography>
        <ul>
          {testData.map((data) => (
            <li key={data.name}>{data.name}</li>
          ))}
        </ul>

        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          align="center"
          sx={{ mb: 4 }}
        >
          OGP Link Generator
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL (e.g., https://example.com)"
              required
              variant="outlined"
              label="URL"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="メモ（任意）"
              variant="outlined"
              label="メモ"
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? "読み込み中..." : "リンクを追加"}
            </Button>
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          {ogpCards.map((card) => (
            <Card key={card.id}>
              <CardActionArea
                component="a"
                href={card.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                {card.image && (
                  <CardMedia
                    component="img"
                    height="300"
                    image={card.image}
                    alt={card.title || "OGP Image"}
                  />
                )}
                <CardContent>
                  {card.siteName && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                    >
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
                    <Typography
                      variant="caption"
                      color="primary"
                      sx={{ display: "block", marginTop: 1 }}
                    >
                      {card.url}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
              {card.memo && (
                <CardContent
                  sx={{
                    borderTop: "1px solid #e0e0e0",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: "pre-wrap" }}
                  >
                    <strong>メモ:</strong> {card.memo}
                  </Typography>
                </CardContent>
              )}
            </Card>
          ))}
        </Stack>
      </Box>
    </Container>
  )
}

export default Admin
