import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import type { OGPCardData } from './types'
import { supabase } from '../../lib/supabase'

interface OGPCardProps {
  url: string
  id: string | number
  note?: string
}

const CARD_HEIGHT = 300

function OGPCard({ url, id, note }: OGPCardProps) {
  const [ogpData, setOgpData] = useState<OGPCardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [_, setError] = useState(false)

  useEffect(() => {
    const fetchOGP = async () => {
      try {
        setLoading(true)
        setError(false)

        // Supabase Edge FunctionでOGP情報を取得
        const { data, error: fetchError } = await supabase.functions.invoke('ogp_fetch', {
          body: { url },
        })

        if (fetchError) throw fetchError

        const ogp: OGPCardData = {
          id,
          url,
          title: data?.title || undefined,
          description: data?.description || undefined,
          image: data?.image || undefined,
          siteName: data?.siteName || undefined,
          note: note || undefined,
        }

        setOgpData(ogp)
      } catch (err) {
        console.error(`Failed to fetch OGP for ${url}:`, err)
        setError(true)
        // OGPの取得に失敗してもURLとメモは表示する
        setOgpData({
          id,
          url,
          note: note || undefined,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOGP()
  }, [url, id, note])

  // ローディング中のスケルトンUI
  if (loading) {
    return (
      <Card elevation={4}>
        <Skeleton variant="rectangular" height={CARD_HEIGHT} />
      </Card>
    )
  }

  if (!ogpData) return null


  return (
    <Card elevation={4} sx={{ borderRadius: 2 }}>
      <CardActionArea
        component="a"
        href={ogpData.url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ position: 'relative', height: CARD_HEIGHT }}
      >
        {/* 背景画像 */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: ogpData.image ? `url(${ogpData.image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: ogpData.image ? 'transparent' : 'grey.800',
          }}
        />

        {/* 下半分の黒グラデーションオーバーレイ */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, transparent 40%, rgba(0, 0, 0, 0.8) 100%)',
          }}
        />

        {/* コンテンツ */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          {/* メモ */}
          {note && (
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                whiteSpace: 'pre-wrap',
                mb: 0.5,
              }}
            >
              📝 {note}
            </Typography>
          )}

          {/* タイトル */}
          {ogpData.title && (
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {ogpData.title}
            </Typography>
          )}

          {/* サイト名 */}
          {ogpData.siteName && (
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {ogpData.siteName}
            </Typography>
          )}
        </Box>
      </CardActionArea>
    </Card>
  )
}

export default OGPCard
