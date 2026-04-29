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
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              width: 40, height: 40,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path d="M14.5 2.5L3 24h5l8-16 8 16h5L18.5 2.5a2.3 2.3 0 00-4 0z" fill="#7c83ff"/>
              <path d="M10 24l6-12 6 12" fill="none" stroke="#a855f7" strokeWidth="2"/>
            </svg>
          </IconButton>

          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                background: 'linear-gradient(135deg,#646cff 0%,#a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '.04em',
              }}
            >
              ogp-link
            </Typography>
          </Box>

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
                variant="outlined"
                size="small"
                onClick={() => navigate('/')}
                sx={{ borderRadius: 9999, px: 2, py: 0.75 }}
              >
                ログイン
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280 }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
              アカウント
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {session?.user.email}
            </Typography>
          </Box>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
          <List sx={{ py: 1 }}>
            <ListItem disablePadding>
              <ListItemButton onClick={() => { setDrawerOpen(false); navigate('/new') }}>
                <ListItemIcon sx={{ minWidth: 40 }}><AddLinkIcon sx={{ fontSize: 20, color: 'primary.main' }} /></ListItemIcon>
                <ListItemText primary="リンクページを追加" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => { setDrawerOpen(false); navigate('/mypage') }}>
                <ListItemIcon sx={{ minWidth: 40 }}><DashboardIcon sx={{ fontSize: 20, color: 'primary.main' }} /></ListItemIcon>
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
