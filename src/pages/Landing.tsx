import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Toolbar from '@mui/material/Toolbar'
import LinkIcon from '@mui/icons-material/Link'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import EditNoteIcon from '@mui/icons-material/EditNote'
import type { Session } from '@supabase/supabase-js'
import { AppToolbar } from '../components/layout'
import { supabase } from '../lib/supabase'

function FeatureCard({ icon, step, title, description }: { icon: React.ReactNode; step: string; title: string; description: string }) {
  return (
    <Box sx={{
      p: 3,
      borderRadius: '20px',
      background: 'linear-gradient(145deg,#22223a 0%,#1a1a2e 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      flex: '1 1 280px',
      maxWidth: 380,
      transition: 'box-shadow 0.3s, border-color 0.3s',
      '&:hover': {
        borderColor: 'rgba(124,131,255,0.30)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 16px rgba(124,131,255,0.12)',
      },
    }}>
      <Box sx={{
        width: 48, height: 48, borderRadius: '14px', mb: 2,
        background: 'rgba(124,131,255,0.12)',
        border: '1px solid rgba(124,131,255,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'primary.main',
      }}>
        {icon}
      </Box>
      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>
        {step}
      </Typography>
      <Typography variant="h6" sx={{ mt: 0.5, mb: 1, fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  )
}

function Landing() {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token_hash = params.get('token_hash')
    const type = params.get('type')

    if (token_hash) {
      setVerifying(true)
      supabase.auth.verifyOtp({ token_hash, type: (type as any) || 'email' })
        .then(({ error }) => {
          if (error) setAuthError(error.message)
          else {
            setAuthSuccess(true)
            window.history.replaceState({}, document.title, '/')
          }
          setVerifying(false)
        })
    }

    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setAuthError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) setAuthError(error.message)
    else setEmailSent(true)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  const openLogin = () => { setLoginDialogOpen(true); setEmail(''); setEmailSent(false); setAuthError(null) }
  const closeLogin = () => { setLoginDialogOpen(false); setEmail(''); setEmailSent(false); setAuthError(null) }

  if (verifying) {
    return (
      <>
        <AppToolbar />
        <Toolbar />
        <Container maxWidth="lg">
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 3, color: 'primary.main' }} />
            <Typography variant="h5" gutterBottom>認証中...</Typography>
            <Typography color="text.secondary">Magic Linkを確認しています</Typography>
          </Box>
        </Container>
      </>
    )
  }

  if (authError) {
    return (
      <>
        <AppToolbar />
        <Toolbar />
        <Container maxWidth="sm">
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 3 }}>{authError}</Alert>
            <Typography variant="h5" gutterBottom>認証に失敗しました</Typography>
            <Button variant="contained" onClick={() => { setAuthError(null); window.history.replaceState({}, document.title, '/') }} sx={{ mt: 2 }}>
              ログイン画面に戻る
            </Button>
          </Box>
        </Container>
      </>
    )
  }

  if (authSuccess && !session) {
    return (
      <>
        <AppToolbar />
        <Toolbar />
        <Container maxWidth="sm">
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 3 }}>認証に成功しました！</Alert>
            <CircularProgress sx={{ mb: 2, color: 'primary.main' }} />
            <Typography variant="h5">アカウント情報を読み込んでいます...</Typography>
          </Box>
        </Container>
      </>
    )
  }

  if (session) {
    return (
      <>
        <AppToolbar />
        <Toolbar />
        <Container maxWidth="md">
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 4, maxWidth: 480, mx: 'auto' }}>
              ログイン中: {session.user.email}
            </Alert>
            <Typography variant="h3" fontWeight={700} gutterBottom sx={{
              background: 'linear-gradient(135deg,#646cff 0%,#a855f7 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              ようこそ！
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 5 }}>
              {session.user.email} としてログイン中
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" size="large" onClick={() => navigate('/new')} sx={{ px: 4 }}>
                リンクを作成
              </Button>
              <Button variant="outlined" size="large" onClick={handleLogout} sx={{ px: 4 }}>
                ログアウト
              </Button>
            </Box>
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
        <Box sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
          {/* Hero */}
          <Typography variant="h2" fontWeight={700} gutterBottom sx={{
            background: 'linear-gradient(135deg,#7c83ff 0%,#a855f7 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            mb: 2,
          }}>
            OGP Link
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 5, maxWidth: 480, mx: 'auto', lineHeight: 1.6 }}>
            URLからOGP情報を取得して、美しいリンクカードを作成・共有
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 10, flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" onClick={openLogin} sx={{ px: 5, py: 1.5, borderRadius: 9999 }}>
              登録する
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/new')} sx={{ px: 5, py: 1.5, borderRadius: 9999 }}>
              登録せずに始める
            </Button>
          </Box>

          {/* How to use */}
          <Typography variant="h5" fontWeight={600} sx={{ mb: 4 }}>
            使い方
          </Typography>
          <Box sx={{ display: 'flex', gap: 2.5, justifyContent: 'center', flexWrap: 'wrap', mb: 10 }}>
            <FeatureCard
              icon={<LinkIcon />}
              step="Step 1"
              title="URLを入力"
              description="共有したいWebページのURLを貼り付けます。"
            />
            <FeatureCard
              icon={<EditNoteIcon />}
              step="Step 2"
              title="メモを追加"
              description="必要に応じてリンクに関するメモを追加できます。"
            />
            <FeatureCard
              icon={<BookmarkIcon />}
              step="Step 3"
              title="カードを生成"
              description="OGP情報を自動取得して美しいカードを生成します。"
            />
          </Box>
        </Box>
      </Container>

      {/* ログインダイアログ */}
      <Dialog open={loginDialogOpen} onClose={closeLogin} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 0 }}>
          <Typography variant="h5" fontWeight={600}>ログイン</Typography>
        </DialogTitle>
        <DialogContent>
          {emailSent ? (
            <Box sx={{ py: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>Magic Linkを送信しました！</Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                メールボックスを確認してください。届かない場合は迷惑メールフォルダもご確認ください。
              </Typography>
              <Button variant="outlined" onClick={closeLogin} fullWidth>閉じる</Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleLogin} sx={{ py: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                メールアドレスを入力してください。ログイン用のMagic Linkをお送りします。
              </Typography>
              {authError && <Alert severity="error" sx={{ mb: 2 }}>{authError}</Alert>}
              <TextField
                type="email"
                label="メールアドレス"
                placeholder="your-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                sx={{ mb: 3 }}
              />
              <Stack spacing={1.5}>
                <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                  {loading ? '送信中...' : 'Magic Linkを送信'}
                </Button>
                <Button variant="outlined" onClick={closeLogin} fullWidth>キャンセル</Button>
              </Stack>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Landing
