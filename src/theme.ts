import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c83ff',
      dark: '#646cff',
      light: '#9da2ff',
    },
    background: {
      default: '#0f0f18',
      paper: '#17172a',
    },
    text: {
      primary: 'rgba(255,255,255,0.92)',
      secondary: 'rgba(255,255,255,0.55)',
      disabled: 'rgba(255,255,255,0.32)',
    },
    divider: 'rgba(255,255,255,0.08)',
    error: { main: '#ff6b6b' },
    success: { main: '#4ade80' },
    info: { main: '#60c8ff' },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#0f0f18',
          WebkitFontSmoothing: 'antialiased',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(15,15,24,0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          fontWeight: 600,
          textTransform: 'none',
          letterSpacing: 0,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg,#646cff 0%,#a855f7 100%)',
          boxShadow: '0 2px 12px rgba(124,131,255,0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg,#7c83ff 0%,#b86ef5 100%)',
            boxShadow: '0 4px 20px rgba(124,131,255,0.35)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(124,131,255,0.40)',
          color: '#7c83ff',
          '&:hover': {
            background: 'rgba(124,131,255,0.10)',
            borderColor: '#9da2ff',
          },
        },
        containedSuccess: {
          background: 'linear-gradient(135deg,#22c55e 0%,#4ade80 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg,#16a34a 0%,#22c55e 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg,#22223a 0%,#1a1a2e 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
          transition: 'box-shadow 0.3s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(124,131,255,0.15)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: 'rgba(255,255,255,0.04)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.08)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.16)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(124,131,255,0.60)',
            borderWidth: 1,
          },
          '&.Mui-focused': {
            background: 'rgba(124,131,255,0.06)',
            boxShadow: '0 0 0 3px rgba(124,131,255,0.12)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(160deg,#1e1e30 0%,#181825 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-4px 0 32px rgba(0,0,0,0.5)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(145deg,#22223a 0%,#1a1a2e 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 28,
          boxShadow: '0 8px 48px rgba(0,0,0,0.7)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
        standardError: {
          background: 'rgba(255,107,107,0.12)',
          border: '1px solid rgba(255,107,107,0.25)',
          color: 'rgba(255,255,255,0.92)',
        },
        standardSuccess: {
          background: 'rgba(74,222,128,0.12)',
          border: '1px solid rgba(74,222,128,0.25)',
          color: 'rgba(255,255,255,0.92)',
        },
        standardInfo: {
          background: 'rgba(96,200,255,0.10)',
          border: '1px solid rgba(96,200,255,0.25)',
          color: 'rgba(255,255,255,0.92)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          '&:hover': {
            background: 'rgba(124,131,255,0.08)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.05)',
          transition: 'all 0.2s',
          '&:hover': {
            background: 'rgba(124,131,255,0.15)',
            borderColor: 'rgba(124,131,255,0.40)',
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: 'linear-gradient(90deg,#1e1e30 25%,#252540 50%,#1e1e30 75%)',
          backgroundSize: '200% 100%',
        },
      },
    },
  },
})
