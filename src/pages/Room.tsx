import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import CardActionArea from '@mui/material/CardActionArea'
import Stack from '@mui/material/Stack'
import { createClient } from '@supabase/supabase-js'
import type { Database, Tables } from '../entities/database.types'

interface OGPData {
  id: number
  title?: string
  description?: string
  image?: string
  url: string
  siteName?: string
  note?: string
}

function Room() {
  const { id } = useParams<{ id: string }>()
  const [links, setLinks] = useState<Tables<'links'>[]>([])
  const [ogpData, setOgpData] = useState<OGPData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_ANON_KEY // JWT形式のanon keyを使用（Edge FunctionsとDBアクセスの両方で必要）
  )

  // IDが8文字以上の英数記号かチェック
  const isValidId = id && id.length >= 8 && /^[a-zA-Z0-9!-/:-@[-`{-~]+$/.test(id)

  const fetchOGP = async (targetUrl: string, linkId: number, note: string | null) => {
    try {
      // Supabase Edge FunctionでOGP情報を取得
      const { data, error } = await supabase.functions.invoke('ogp_fetch', {
        body: { url: targetUrl },
      })

      if (error) throw error

      const ogp: OGPData = {
        id: linkId,
        title: data?.title || undefined,
        description: data?.description || undefined,
        image: data?.image || undefined,
        url: targetUrl,
        siteName: data?.siteName || undefined,
        note: note || undefined,
      }

      return ogp
    } catch (err) {
      console.error(`Failed to fetch OGP for ${targetUrl}:`, err)
      // OGPの取得に失敗してもURLとメモは表示する
      return {
        id: linkId,
        url: targetUrl,
        note: note || undefined,
      }
    }
  }

  useEffect(() => {
    if (!isValidId) {
      setLoading(false)
      return
    }

    const fetchRoomLinks = async () => {
      try {
        setLoading(true)
        setError(null)

        // room_idでlink_roomsを検索
        const { data: roomData, error: roomError } = await supabase
          .from('link_rooms')
          .select('id')
          .eq('room_id', id)
          .single()

        if (roomError) throw new Error('ルームが見つかりません')

        // link_room_idでlinksを検索
        const { data: linksData, error: linksError } = await supabase
          .from('links')
          .select('*')
          .eq('link_room_id', roomData.id)

        if (linksError) throw linksError

        setLinks(linksData || [])

        // 各リンクのOGP情報を取得
        if (linksData && linksData.length > 0) {
          const ogpPromises = linksData.map(link =>
            fetchOGP(link.url, link.id, link.note)
          )
          const ogpResults = await Promise.all(ogpPromises)
          setOgpData(ogpResults)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchRoomLinks()
  }, [id, isValidId])

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
          ルームページ
        </Typography>

        {!isValidId ? (
          <Alert severity="error">
            無効なルームIDです。IDは8文字以上の英数記号である必要があります。
          </Alert>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              ルームID: {id}
            </Alert>

            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              リンク一覧 ({links.length}件)
            </Typography>

            {ogpData.length === 0 ? (
              <Alert severity="info">このルームにはリンクがありません。</Alert>
            ) : (
              <Stack spacing={2}>
                {ogpData.map((card) => (
                  <Card key={card.id}>
                    <CardActionArea
                      component="a"
                      href={card.url}
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
                        <Typography
                          variant="caption"
                          color="primary"
                          sx={{ display: "block", marginTop: 1 }}
                        >
                          {card.url}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    {card.note && (
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
                          <strong>メモ:</strong> {card.note}
                        </Typography>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Box>
    </Container>
  )
}

export default Room
