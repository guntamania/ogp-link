import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Toolbar from '@mui/material/Toolbar'
import type { Session } from '@supabase/supabase-js'
import { AppToolbar } from '../components/layout'
import { supabase } from '../lib/supabase'

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/'); return }
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) { navigate('/'); return }
      setSession(s)
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  useEffect(() => {
    if (!session?.user?.id) return
    const fetchRooms = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('link_rooms')
          .select('id, room_id, room_name, room_description, created_at')
          .eq('UID', session.user.id)
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
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2, color: 'primary.main' }} />
            <Typography variant="h5" color="text.secondary">読み込み中...</Typography>
          </Box>
        </Container>
      </>
    )
  }

  return (
    <>
      <AppToolbar />
      <Toolbar />
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom sx={{ mb: 0.5 }}>
            マイページ
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {session?.user?.email}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {rooms.length === 0 ? (
            <Box sx={{
              py: 10, textAlign: 'center', borderRadius: '20px',
              background: 'linear-gradient(145deg,#22223a 0%,#1a1a2e 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                まだルームがありません
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                新しいリンクを作成してルームを始めましょう
              </Typography>
              <Button variant="contained" onClick={() => navigate('/new')}>
                リンクページを作成
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                作成したルーム {rooms.length}件
              </Typography>
              <Stack spacing={2}>
                {rooms.map((room) => (
                  <Box
                    key={room.id}
                    sx={{
                      p: 2.5, borderRadius: '20px',
                      background: 'linear-gradient(145deg,#22223a 0%,#1a1a2e 100%)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        borderColor: 'rgba(124,131,255,0.28)',
                        boxShadow: '0 6px 24px rgba(0,0,0,0.5), 0 0 12px rgba(124,131,255,0.10)',
                      },
                    }}
                  >
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {room.room_name || 'Untitled Room'}
                    </Typography>
                    {room.room_description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {room.room_description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.disabled">
                        {new Date(room.created_at).toLocaleDateString('ja-JP')}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" size="small" disabled sx={{ borderRadius: 9999 }}>
                          編集する
                        </Button>
                        <Button variant="contained" size="small" onClick={() => navigate(`/${room.room_id}`)} sx={{ borderRadius: 9999 }}>
                          見る
                        </Button>
                      </Box>
                    </Box>
                  </Box>
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
