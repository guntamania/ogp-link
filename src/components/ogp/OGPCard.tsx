import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import Skeleton from '@mui/material/Skeleton'
import type { OGPCardData } from './types'
import { supabase } from '../../lib/supabase'

interface OGPCardProps {
  url: string
  id: string | number
  memo?: string
  note?: string
}

function OGPCard({ url, id, memo, note }: OGPCardProps) {
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
          memo: memo || undefined,
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
          memo: memo || undefined,
          note: note || undefined,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOGP()
  }, [url, id, memo, note])

  // ローディング中のスケルトンUI
  if (loading) {
    return (
      <Card>
        <Skeleton variant="rectangular" height={300} />
        <CardContent>
          <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="60%" height={16} sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    )
  }

  if (!ogpData) return null

  const displayMemo = memo || note

  return (
    <Card>
      <CardActionArea
        component="a"
        href={ogpData.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {ogpData.image && (
          <CardMedia
            component="img"
            height="300"
            image={ogpData.image}
            alt={ogpData.title || "OGP Image"}
          />
        )}
        <CardContent>
          {ogpData.siteName && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              {ogpData.siteName}
            </Typography>
          )}
          {ogpData.title && (
            <Typography gutterBottom variant="h5" component="div">
              {ogpData.title}
            </Typography>
          )}
          {ogpData.description && (
            <Typography variant="body2" color="text.secondary">
              {ogpData.description}
            </Typography>
          )}
          <Typography
            variant="caption"
            color="primary"
            sx={{ display: "block", marginTop: 1 }}
          >
            {ogpData.url}
          </Typography>
        </CardContent>
      </CardActionArea>
      {displayMemo && (
        <CardContent
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: 'action.hover',
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: "pre-wrap" }}
          >
            <strong>メモ:</strong> {displayMemo}
          </Typography>
        </CardContent>
      )}
    </Card>
  )
}

export default OGPCard
