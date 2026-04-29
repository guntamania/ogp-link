import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TextField from '@mui/material/TextField'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import Typography from '@mui/material/Typography'
import Toolbar from '@mui/material/Toolbar'
import type { TablesInsert } from '../entities/database.types.ts'
import type { Session } from '@supabase/supabase-js'
import Sqids from 'sqids'
import { OGPCard } from '../components/ogp'
import { AppToolbar } from '../components/layout'
import { supabase } from '../lib/supabase'

interface LinkData {
  id: string
  url: string
  note?: string
}

function New() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [links, setLinks] = useState<LinkData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roomName, setRoomName] = useState('OGP Link Generator')
  const [roomDescription, setRoomDescription] = useState('URLを入力してOGP情報を取得し、美しいリンクカードを作成できます。')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLinks(prev => [...prev, { id: Date.now().toString(), url, note: note || undefined }])
    setUrl('')
    setNote('')
  }

  const handleDelete = (id: string | number) => {
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  const handlePublish = async () => {
    try {
      setLoading(true)
      setError(null)
      if (links.length === 0) throw new Error('公開するリンクがありません')

      const { data, error } = await supabase.from('link_rooms').select('id').order('id', { ascending: false }).limit(1).single()
      const newRoomIdNumber = (!error && data ? data.id : 0) + 1
      const roomIdHash = new Sqids({ minLength: 8 }).encode([newRoomIdNumber])

      const linkRoomData: TablesInsert<'link_rooms'> = {
        room_id: roomIdHash,
        locked: false,
        room_name: roomName,
        room_description: roomDescription,
        UID: session?.user?.id || null,
      }

      const { data: roomData, error: roomError } = await supabase.from('link_rooms').insert(linkRoomData).select().single()
      if (roomError) throw roomError

      const { error: linksError } = await supabase.from('links').insert(
        links.map(link => ({ link_room_id: roomData.id, url: link.url, note: link.note || null }))
      )
      if (linksError) throw linksError

      setLinks([])
      navigate(`/${roomIdHash}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AppToolbar />
      <Toolbar />
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          {/* タイトル編集 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            {isEditingTitle ? (
              <TextField
                fullWidth
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTitle(false) }}
                onBlur={() => setIsEditingTitle(false)}
                autoFocus
                variant="standard"
                slotProps={{ input: { sx: { fontSize: '2rem', fontWeight: 700, textAlign: 'center' } } }}
              />
            ) : (
              <>
                <Typography variant="h3" component="h1" align="center" sx={{ fontWeight: 700, mb: 0 }}>
                  {roomName}
                </Typography>
                <IconButton size="small" onClick={() => setIsEditingTitle(true)} sx={{ ml: 1 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>

          {/* 説明編集 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 5 }}>
            {isEditingDescription ? (
              <TextField
                fullWidth
                multiline
                value={roomDescription}
                onChange={(e) => setRoomDescription(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setIsEditingDescription(false) } }}
                onBlur={() => setIsEditingDescription(false)}
                autoFocus
                variant="standard"
                slotProps={{ input: { sx: { textAlign: 'center', color: 'text.secondary' } } }}
              />
            ) : (
              <>
                <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 0 }}>
                  {roomDescription}
                </Typography>
                <IconButton size="small" onClick={() => setIsEditingDescription(true)} sx={{ ml: 1 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>

          {/* 入力フォーム */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              mb: 4, p: 3, borderRadius: '20px',
              background: 'linear-gradient(145deg,#22223a 0%,#1a1a2e 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Stack spacing={2}>
              <TextField
                fullWidth
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                label="URL"
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="メモ（任意）"
                label="メモ"
              />
              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
                リンクを追加
              </Button>
            </Stack>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {links.length > 0 && (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={handlePublish}
                disabled={loading}
                sx={{ minWidth: 200, borderRadius: 9999 }}
              >
                {loading ? '公開中...' : `公開する（${links.length}件）`}
              </Button>
            </Box>
          )}

          <Stack spacing={2}>
            {links.map((link) => (
              <OGPCard key={link.id} id={link.id} url={link.url} note={link.note} onDelete={handleDelete} />
            ))}
          </Stack>
        </Box>
      </Container>
    </>
  )
}

export default New
