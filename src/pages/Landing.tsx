import { useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import LinkIcon from '@mui/icons-material/Link'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import EditNoteIcon from '@mui/icons-material/EditNote'

function Landing() {
  const navigate = useNavigate()

  return (
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
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/admin')}
          sx={{ mb: 8, px: 4, py: 1.5, fontSize: '1.1rem' }}
        >
          Get Started
        </Button>

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
    </Container>
  )
}

export default Landing
