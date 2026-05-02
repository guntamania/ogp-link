import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#f5a623',
      dark: '#e8940f',
      light: '#ffbe5c',
    },
    secondary: {
      main: '#4f8ef7',
      dark: '#2f6ee0',
      light: '#7fb0ff',
    },
    background: {
      default: '#fffdf7',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#5a5550',
      disabled: '#9a948e',
    },
    divider: 'rgba(0,0,0,0.08)',
    error: { main: '#ff4d4d' },
    success: { main: '#2ec78e' },
    info: { main: '#4f8ef7' },
    warning: { main: '#f5a623' },
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
          background: '#fffdf7',
          WebkitFontSmoothing: 'antialiased',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255,253,247,0.90)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          boxShadow: 'none',
          color: '#1a1a1a',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          fontWeight: 700,
          textTransform: 'none',
          letterSpacing: 0,
        },
        containedPrimary: {
          background: '#f5a623',
          boxShadow: '0 2px 12px rgba(245,166,35,0.28)',
          color: '#fff',
          '&:hover': {
            background: '#e8940f',
            boxShadow: '0 4px 20px rgba(245,166,35,0.38)',
          },
        },
        containedSecondary: {
          background: '#4f8ef7',
          boxShadow: '0 2px 12px rgba(79,142,247,0.22)',
          color: '#fff',
          '&:hover': {
            background: '#2f6ee0',
            boxShadow: '0 4px 20px rgba(79,142,247,0.32)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(245,166,35,0.35)',
          borderWidth: '1.5px',
          color: '#f5a623',
          background: '#fff8ec',
          '&:hover': {
            background: '#fff3d9',
            borderColor: '#f5a623',
            borderWidth: '1.5px',
          },
        },
        containedSuccess: {
          background: '#2ec78e',
          color: '#fff',
          '&:hover': {
            background: '#1a9e6e',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 20,
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.3s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 28px rgba(0,0,0,0.10)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: '#ffffff',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0,0,0,0.09)',
            borderWidth: '1.5px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0,0,0,0.20)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#f5a623',
            borderWidth: '1.5px',
          },
          '&.Mui-focused': {
            background: '#fff8ec',
            boxShadow: '0 0 0 3px rgba(245,166,35,0.12)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#ffffff',
          borderLeft: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '-4px 0 32px rgba(0,0,0,0.10)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.10)',
          borderRadius: 28,
          boxShadow: '0 8px 48px rgba(0,0,0,0.18)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: '1px solid',
        },
        standardError: {
          background: '#fff0f0',
          borderColor: 'rgba(255,77,77,0.25)',
          color: '#1a1a1a',
        },
        standardSuccess: {
          background: '#edfbf5',
          borderColor: 'rgba(46,199,142,0.25)',
          color: '#1a1a1a',
        },
        standardInfo: {
          background: '#eef3ff',
          borderColor: 'rgba(79,142,247,0.25)',
          color: '#1a1a1a',
        },
        standardWarning: {
          background: '#fff8ec',
          borderColor: 'rgba(245,166,35,0.28)',
          color: '#1a1a1a',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          '&:hover': {
            background: '#f5f2ea',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: '1px solid rgba(0,0,0,0.09)',
          background: '#ffffff',
          color: '#5a5550',
          transition: 'all 0.2s',
          '&:hover': {
            background: '#fff8ec',
            borderColor: 'rgba(245,166,35,0.40)',
            color: '#f5a623',
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: 'linear-gradient(90deg,#f0ece0 25%,#faf7f0 50%,#f0ece0 75%)',
          backgroundSize: '200% 100%',
        },
      },
    },
  },
})
