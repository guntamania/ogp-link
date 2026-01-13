import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import PersonIcon from '@mui/icons-material/Person'
import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_ANON_KEY
)

function AppToolbar() {
  const [session, setSession] = useState<Session | null>(null)

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

  return (
    <AppBar position="fixed" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          OGP Link Generator
        </Typography>
        {session && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {session.user.email}
            </Typography>
            <IconButton color="primary">
              <PersonIcon />
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default AppToolbar
