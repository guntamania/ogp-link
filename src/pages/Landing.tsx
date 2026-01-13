import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import LinkIcon from '@mui/icons-material/Link'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import EditNoteIcon from '@mui/icons-material/EditNote'
import Toolbar from '@mui/material/Toolbar'
import { createClient } from '@supabase/supabase-js'
import type { Session } from '@supabase/supabase-js'
import { AppToolbar } from '../components/layout'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_ANON_KEY
)

function Landing() {
  const navigate = useNavigate()

  // 認証関連のstate
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // 認証状態の初期化とURLパラメータの確認
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token_hash = params.get('token_hash')
    const type = params.get('type')

    if (token_hash) {
      setVerifying(true)
      // Magic Linkのトークンを検証
      supabase.auth.verifyOtp({
        token_hash,
        type: (type as any) || 'email',
      }).then(({ error }) => {
        if (error) {
          setAuthError(error.message)
        } else {
          setAuthSuccess(true)
          // URLパラメータをクリア
          window.history.replaceState({}, document.title, '/')
        }
        setVerifying(false)
      })
    }

    // 既存セッションの確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setAuthError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) {
      setAuthError(error.message)
    } else {
      setEmailSent(true)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  const handleOpenLoginDialog = () => {
    setLoginDialogOpen(true)
    setEmail('')
    setEmailSent(false)
    setAuthError(null)
  }

  const handleCloseLoginDialog = () => {
    setLoginDialogOpen(false)
    setEmail('')
    setEmailSent(false)
    setAuthError(null)
  }

  // 検証中の表示
  if (verifying) {
    return (
      <>
        <AppToolbar />
        <Toolbar />
        <Container maxWidth="lg">
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              認証中...
            </Typography>
            <Typography color="text.secondary">
              Magic Linkを確認しています
            </Typography>
          </Box>
        </Container>
      </>
    )
  }

  // 認証エラーの表示
  if (authError) {
    return (
      <>
        <AppToolbar />
        <Toolbar />
        <Container maxWidth="lg">
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              {authError}
            </Alert>
            <Typography variant="h4" gutterBottom>
              認証に失敗しました
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setAuthError(null)
                window.history.replaceState({}, document.title, '/')
              }}
              sx={{ mt: 2 }}
            >
              ログイン画面に戻る
            </Button>
          </Box>
        </Container>
      </>
    )
  }

  // 認証成功の表示（セッション読み込み前）
  if (authSuccess && !session) {
    return (
      <>
        <AppToolbar />
        <Toolbar />
        <Container maxWidth="lg">
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              認証に成功しました！
            </Alert>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              アカウント情報を読み込んでいます...
            </Typography>
          </Box>
        </Container>
      </>
    )
  }

  // ログイン済みの表示
  if (session) {
    return (
      <>
        <AppToolbar />
        <Toolbar />
        <Container maxWidth="lg">
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              ログイン中: {session.user.email}
            </Alert>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 'bold', mb: 2 }}
            >
              ようこそ！
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              {session.user.email} としてログインしています
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 8 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/new')}
                sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
              >
                リンクを作成
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleLogout}
                sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
              >
                ログアウト
              </Button>
            </Box>
          </Box>
        </Container>
      </>
    )
  }

  // 未ログインの表示（通常のLandingページ）
  return (
    <>
      <AppToolbar />
      <Toolbar />
      <Container maxWidth="lg">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            OGP Link Generator
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            URLからOGP情報を取得して、美しいリンクカードを作成
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 8 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/new')}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleOpenLoginDialog}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Login
            </Button>
          </Box>

        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          使い方
        </Typography>

        <Stack spacing={3} sx={{ mb: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LinkIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">1. URLを入力</Typography>
              </Box>
              <Typography color="text.secondary">
                共有したいWebページのURLを入力欄に貼り付けます。
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EditNoteIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">2. メモを追加（任意）</Typography>
              </Box>
              <Typography color="text.secondary">
                必要に応じて、リンクに関するメモを追加できます。
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BookmarkIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">3. カードを生成</Typography>
              </Box>
              <Typography color="text.secondary">
                「リンクを追加」ボタンをクリックすると、OGP情報を取得して美しいカードを生成します。
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          主な機能
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Card sx={{ flex: '1 1 300px', maxWidth: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                OGP自動取得
              </Typography>
              <Typography color="text.secondary">
                URLを入力するだけで、タイトル、説明、画像などのOGP情報を自動で取得します。
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 300px', maxWidth: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                カスタムメモ
              </Typography>
              <Typography color="text.secondary">
                各リンクに自由にメモを追加できます。後で見返すときに便利です。
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 300px', maxWidth: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                複数リンク管理
              </Typography>
              <Typography color="text.secondary">
                何度でもリンクを追加できます。お気に入りのページをまとめて管理しましょう。
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* ログインダイアログ */}
      <Dialog
        open={loginDialogOpen}
        onClose={handleCloseLoginDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div">
            ログイン
          </Typography>
        </DialogTitle>
        <DialogContent>
          {emailSent ? (
            <Box sx={{ py: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Magic Linkを送信しました！
              </Alert>
              <Typography variant="body1" sx={{ mb: 2 }}>
                メールボックスを確認してください。ログインリンクが記載されたメールが届いています。
              </Typography>
              <Typography variant="body2" color="text.secondary">
                メールが届かない場合は、迷惑メールフォルダも確認してください。
              </Typography>
              <Button
                variant="outlined"
                onClick={handleCloseLoginDialog}
                fullWidth
                sx={{ mt: 3 }}
              >
                閉じる
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleLogin} sx={{ py: 2 }}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                メールアドレスを入力してください。ログイン用のMagic Linkをお送りします。
              </Typography>

              {authError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {authError}
                </Alert>
              )}

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

              <Stack spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? '送信中...' : 'Magic Linkを送信'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCloseLoginDialog}
                  fullWidth
                >
                  キャンセル
                </Button>
              </Stack>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      </Container>
    </>
  )
}

export default Landing
