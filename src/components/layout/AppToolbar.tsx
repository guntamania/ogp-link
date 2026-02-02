import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AddLinkIcon from '@mui/icons-material/AddLink'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

function AppToolbar() {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleDrawerOpen = () => {
    setDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setDrawerOpen(false)
    navigate('/')
  }

  const handleNavigateToMyPage = () => {
    setDrawerOpen(false)
    navigate('/mypage')
  }

  const handleNavigateToNew = () => {
    setDrawerOpen(false)
    navigate('/new')
  }

  return (
    <>
      <AppBar position="fixed" elevation={0} sx={{ backgroundColor: 'transparent' }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <IconButton
              onClick={() => navigate('/')}
              sx={{
                backgroundColor: 'grey.100',
                '&:hover': { backgroundColor: 'grey.200' },
              }}
            >
              <img src="/vite.svg" alt="Logo" style={{ width: 24, height: 24 }} />
            </IconButton>
          </Box>
          {session && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={handleDrawerOpen}
                sx={{
                  backgroundColor: 'grey.100',
                  color: 'grey.800',
                  '&:hover': { backgroundColor: 'grey.200' },
                }}
              >
                <PersonIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
        <Box sx={{ width: 280 }} role="presentation">
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              アカウント
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {session?.user.email}
            </Typography>
          </Box>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleNavigateToNew}>
                <ListItemIcon>
                  <AddLinkIcon />
                </ListItemIcon>
                <ListItemText primary="リンクページを追加" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleNavigateToMyPage}>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="マイページ" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="ログアウト" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  )
}

export default AppToolbar
