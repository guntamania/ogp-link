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
import type { Database, Tables, TablesInsert } from '../entities/database.types'
import Sqids from 'sqids'

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
  const supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  )

  const [url, setUrl] = useState("")
  const [memo, setMemo] = useState("")
  const [ogpCards, setOgpCards] = useState<OGPData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [maxRoomId, setMaxRoomId] = useState<number | null>(null)


  const fetchMaxRoomId = async () => {
    try {
      const { data, error } = await supabase
        .from('link_rooms')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single<Tables<'link_rooms'>>()

      if (error) throw error

      if (data) {
        setMaxRoomId(data.id)
      }
    } catch (err) {
      console.error('Error fetching max room ID:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch max room ID')
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

  const handlePublish = async () => {
    try {
      setLoading(true)
      setError(null)

      // OGPカードが空の場合はエラー
      if (ogpCards.length === 0) {
        throw new Error('公開するリンクがありません')
      }

      // 最大IDを再取得
      await fetchMaxRoomId()

      if (maxRoomId === null) {
        throw new Error('ルームIDの取得に失敗しました')
      }

      // 新しいIDを生成（最大ID + 1）
      const newRoomIdNumber = maxRoomId + 1

      // Sqidsでハッシュ化
      const sqids = new Sqids({ minLength: 8 })
      const roomIdHash = sqids.encode([newRoomIdNumber])

      // link_roomsに挿入するデータ
      const linkRoomData: TablesInsert<'link_rooms'> = {
        room_id: roomIdHash,
        locked: false
      }

      // link_roomsにデータを挿入
      const { data: roomData, error: roomError } = await supabase
        .from('link_rooms')
        .insert(linkRoomData)
        .select()
        .single()

      if (roomError) throw roomError

      // linksに挿入するデータの配列を生成
      const linksData: TablesInsert<'links'>[] = ogpCards.map(card => ({
        link_room_id: roomData.id,
        url: card.url || '',
        note: card.memo || null
      }))

      // linksにデータを挿入
      const { error: linksError } = await supabase
        .from('links')
        .insert(linksData)

      if (linksError) throw linksError

      // 成功メッセージ
      alert(`公開に成功しました！\nルームID: ${roomIdHash}`)

      // カードをクリア
      setOgpCards([])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during publishing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>

        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          align="center"
          sx={{ mb: 4 }}
        >
          OGP Link Generator
        </Typography>

        {maxRoomId !== null && (
          <Alert severity="info" sx={{ mb: 3 }}>
            最大ルームID: {maxRoomId}
          </Alert>
        )}

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

        {ogpCards.length > 0 && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handlePublish}
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              公開する ({ogpCards.length}件)
            </Button>
          </Box>
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
