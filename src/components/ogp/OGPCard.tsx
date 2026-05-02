import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import type { OGPCardData } from './types'
import { supabase } from '../../lib/supabase'

interface OGPCardProps {
  url: string
  id: string | number
  note?: string
  onDelete?: (id: string | number) => void
}

const CARD_HEIGHT = 280

function OGPCard({ url, id, note, onDelete }: OGPCardProps) {
  const [ogpData, setOgpData] = useState<OGPCardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [hovered, setHovered] = useState(false)

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete?.(id)
  }

  useEffect(() => {
    const fetchOGP = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase.functions.invoke('ogp_fetch', {
          body: { url },
        })
        if (fetchError) throw fetchError
        setOgpData({
          id, url,
          title: data?.title || undefined,
          description: data?.description || undefined,
          image: data?.image || undefined,
          siteName: data?.siteName || undefined,
          note: note || undefined,
        })
      } catch {
        setOgpData({ id, url, note: note || undefined })
      } finally {
        setLoading(false)
      }
    }
    fetchOGP()
  }, [url, id, note])

  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        height={CARD_HEIGHT}
        animation="wave"
        sx={{ borderRadius: '20px' }}
      />
    )
  }

  if (!ogpData) return null

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        height: CARD_HEIGHT,
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: hovered
          ? '0 8px 28px rgba(0,0,0,0.18)'
          : '0 2px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.3s ease, transform 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* 背景 */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: ogpData.image ? `url(${ogpData.image})` : 'none',
          background: ogpData.image ? undefined : 'linear-gradient(145deg,#F1DFAA 0%,#faf7f0 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* グラデーションオーバーレイ */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,10,22,0.10) 0%, rgba(10,10,22,0.88) 100%)',
        }}
      />

      {/* 削除ボタン */}
      {onDelete && (
        <IconButton
          onClick={handleDeleteClick}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            width: 30,
            height: 30,
            background: 'rgba(255,107,107,0.20)',
            border: '1px solid rgba(255,107,107,0.35)',
            backdropFilter: 'blur(8px)',
            color: '#ff6b6b',
            '&:hover': {
              background: 'rgba(255,107,107,0.35)',
              borderColor: '#ff6b6b',
            },
          }}
        >
          <DeleteIcon sx={{ fontSize: 14 }} />
        </IconButton>
      )}

      {/* コンテンツ */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2.25,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
        }}
      >
        {note && (
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.70)', display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            📝 {note}
          </Typography>
        )}
        {ogpData.title && (
          <Typography
            variant="h6"
            component="div"
            sx={{
              color: '#fff',
              fontWeight: 700,
              lineHeight: 1.3,
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              fontSize: '1.05rem',
            }}
          >
            {ogpData.title}
          </Typography>
        )}
        {ogpData.siteName && (
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.48)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {ogpData.siteName}
          </Typography>
        )}
      </Box>

      {/* クリッカブルオーバーレイ */}
      <a href={ogpData.url} target="_blank" rel="noopener noreferrer"
        style={{ position: 'absolute', inset: 0 }} />
    </Box>
  )
}

export default OGPCard
