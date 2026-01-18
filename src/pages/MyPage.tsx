import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Toolbar from '@mui/material/Toolbar'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../entities/database.types'
import type { Session } from '@supabase/supabase-js'
import { AppToolbar } from '../components/layout'

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_ANON_KEY
)

interface LinkRoom {
  id: number
  room_id: string
  room_name: string | null
  room_description: string | null
  created_at: string
}

function MyPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [rooms, setRooms] = useState<LinkRoom[]>([])
  const [error, setError] = useState<string | null>(null)

  // 認証状態の確認
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // ログインしていない場合はルートにリダイレクト
        navigate('/')
        return
      }
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/')
        return
      }
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  // ユーザーのルーム一覧を取得
  useEffect(() => {
    if (!session?.user?.id) return

    const fetchRooms = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('link_rooms')
          .select('id, room_id, room_name, room_description, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        setRooms(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ルームの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [session])

  if (loading) {
    return (
      <>
        <AppToolbar />
        <Toolbar />
        <Container maxWidth="lg">
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h5">読み込み中...</Typography>
          </Box>
        </Container>
      </>
    )
  }

  return (
    <>
      <AppToolbar />
      <Toolbar />
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ mb: 1 }}
          >
            マイページ
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {session?.user?.email}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {rooms.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                まだルームがありません
              </Typography>
              <Typography variant="body1" color="text.secondary">
                新しいリンクを作成してルームを始めましょう
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                作成したルーム ({rooms.length}件)
              </Typography>
              <Stack spacing={2}>
                {rooms.map((room) => (
                  <Card key={room.id} elevation={2}>
                    <CardActionArea onClick={() => navigate(`/${room.room_id}`)}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {room.room_name || 'Untitled Room'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {room.room_description || '説明なし'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          作成日: {new Date(room.created_at).toLocaleDateString('ja-JP')}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Stack>
            </>
          )}
        </Box>
      </Container>
    </>
  )
}

export default MyPage