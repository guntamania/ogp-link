import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
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
  const navigate = useNavigate()
  const supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_ANON_KEY // JWT形式のanon keyを使用（Edge FunctionsとDBアクセスの両方で必要）
  )

  const [url, setUrl] = useState("")
  const [memo, setMemo] = useState("")
  const [ogpCards, setOgpCards] = useState<OGPData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roomName, setRoomName] = useState("OGP Link Generator")
  const [roomDescription, setRoomDescription] = useState("URLを入力してOGP情報を取得し、美しいリンクカードを作成できます。複数のリンクをまとめて公開し、共有可能なルームを作成しましょう。")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  const fetchOGP = async (targetUrl: string) => {
    try {
      setLoading(true)
      setError(null)

      // Supabase Edge FunctionでOGP情報を取得
      const { data, error } = await supabase.functions.invoke('ogp_fetch', {
        body: { url: targetUrl },
      })

      if (error) throw error

      const ogp: OGPData = {
        id: Date.now().toString(),
        title: data?.title || undefined,
        description: data?.description || undefined,
        image: data?.image || undefined,
        url: targetUrl,
        siteName: data?.siteName || undefined,
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

      // 最大IDを取得（直接値を返すように変更）
      const { data, error } = await supabase
        .from('link_rooms')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single<Tables<'link_rooms'>>()

      let currentMaxId = 0
      if (!error && data) {
        currentMaxId = data.id
      }

      // 新しいIDを生成（最大ID + 1）
      const newRoomIdNumber = currentMaxId + 1

      // Sqidsでハッシュ化
      const sqids = new Sqids({ minLength: 8 })
      const roomIdHash = sqids.encode([newRoomIdNumber])

      // link_roomsに挿入するデータ
      const linkRoomData: TablesInsert<'link_rooms'> = {
        room_id: roomIdHash,
        locked: false,
        room_name: roomName,
        room_description: roomDescription
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

      // カードをクリア
      setOgpCards([])

      // ルームページに遷移
      navigate(`/${roomIdHash}`)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during publishing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          {isEditingTitle ? (
            <TextField
              fullWidth
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingTitle(false)
                }
              }}
              onBlur={() => setIsEditingTitle(false)}
              autoFocus
              variant="standard"
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: '2.125rem',
                  fontWeight: 400,
                  textAlign: 'center'
                }
              }}
            />
          ) : (
            <>
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                align="center"
                sx={{ mb: 0 }}
              >
                {roomName}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setIsEditingTitle(true)}
                sx={{ ml: 1 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
          {isEditingDescription ? (
            <TextField
              fullWidth
              multiline
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  setIsEditingDescription(false)
                }
              }}
              onBlur={() => setIsEditingDescription(false)}
              autoFocus
              variant="standard"
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: '1rem',
                  textAlign: 'center',
                  color: 'text.secondary'
                }
              }}
            />
          ) : (
            <>
              <Typography
                variant="body1"
                align="center"
                color="text.secondary"
                sx={{ mb: 0 }}
              >
                {roomDescription}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setIsEditingDescription(true)}
                sx={{ ml: 1 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>

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
