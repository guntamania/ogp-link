import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AddLinkIcon from '@mui/icons-material/AddLink'
import ShareIcon from '@mui/icons-material/Share'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

function AppToolbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState<Session | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isRoomPage = /^\/[a-zA-Z0-9!-/:-@[-`{-~]{8,}$/.test(location.pathname)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setDrawerOpen(false)
    navigate('/')
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <>
      <AppBar position="fixed" elevation={0}>
        <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box
              sx={{
                width: 36, height: 36,
                borderRadius: '10px',
                border: '1.5px solid rgba(0,0,0,0.08)',
                background: '#F1DFAA',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <img src="/ogp-link.svg" alt="ogp-link" style={{ width: '100%', height: '100%', display: 'block' }} />
            </Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 800,
                color: '#1a1a1a',
                letterSpacing: '-0.02em',
              }}
            >
              ogp-link
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isRoomPage && (
              <IconButton onClick={handleShare} title="共有">
                <ShareIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            {session ? (
              <IconButton onClick={() => setDrawerOpen(true)} title="アカウント">
                <PersonIcon sx={{ fontSize: 18 }} />
              </IconButton>
            ) : (
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/')}
                sx={{ borderRadius: 9999, px: 2.5, py: 0.75, fontWeight: 700 }}
              >
                ログイン
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280 }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 32, height: 32,
                borderRadius: '8px',
                background: '#F1DFAA',
                border: '1px solid rgba(0,0,0,0.08)',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <img src="/ogp-link.svg" alt="ogp-link" style={{ width: '100%', height: '100%', display: 'block' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                アカウント
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {session?.user.email}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)' }} />
          <List sx={{ py: 1 }}>
            <ListItem disablePadding>
              <ListItemButton onClick={() => { setDrawerOpen(false); navigate('/new') }}>
                <ListItemIcon sx={{ minWidth: 40 }}><AddLinkIcon sx={{ fontSize: 20, color: 'primary.main' }} /></ListItemIcon>
                <ListItemText primary="リンクページを追加" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => { setDrawerOpen(false); navigate('/mypage') }}>
                <ListItemIcon sx={{ minWidth: 40 }}><DashboardIcon sx={{ fontSize: 20, color: 'secondary.main' }} /></ListItemIcon>
                <ListItemText primary="マイページ" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon sx={{ fontSize: 20, color: 'error.main' }} /></ListItemIcon>
                <ListItemText primary="ログアウト" primaryTypographyProps={{ color: 'error.main' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  )
}

export default AppToolbar
