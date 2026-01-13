import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import { createClient } from '@supabase/supabase-js'
import type { Database, Tables } from '../entities/database.types'
import { OGPCard } from '../components/ogp'
import { AppToolbar } from '../components/layout'

function Room() {
  const { id } = useParams<{ id: string }>()
  const [links, setLinks] = useState<Tables<'links'>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string>('ルームページ')
  const [roomDescription, setRoomDescription] = useState<string | null>(null)

  const supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_ANON_KEY // JWT形式のanon keyを使用（Edge FunctionsとDBアクセスの両方で必要）
  )

  // IDが8文字以上の英数記号かチェック
  const isValidId = id && id.length >= 8 && /^[a-zA-Z0-9!-/:-@[-`{-~]+$/.test(id)

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
          .select('id, room_name, room_description')
          .eq('room_id', id)
          .single()

        if (roomError) throw new Error('ルームが見つかりません')

        // ルーム名と説明をセット
        if (roomData.room_name) {
          setRoomName(roomData.room_name)
        }
        if (roomData.room_description) {
          setRoomDescription(roomData.room_description)
        }

        // link_room_idでlinksを検索
        const { data: linksData, error: linksError } = await supabase
          .from('links')
          .select('*')
          .eq('link_room_id', roomData.id)

        if (linksError) throw linksError

        setLinks(linksData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchRoomLinks()
  }, [id, isValidId])

  return (
    <>
      <AppToolbar />
      <Toolbar />
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            align="center"
            sx={{ mb: 2 }}
          >
            {roomName}
          </Typography>

        {roomDescription && (
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            {roomDescription}
          </Typography>
        )}

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

            {links.length === 0 ? (
              <Alert severity="info">このルームにはリンクがありません。</Alert>
            ) : (
              <Stack spacing={2}>
                {links.map((link) => (
                  <OGPCard
                    key={link.id}
                    id={link.id}
                    url={link.url}
                    note={link.note || undefined}
                  />
                ))}
              </Stack>
            )}
          </Box>
        )}
        </Box>
      </Container>
    </>
  )
}

export default Room
