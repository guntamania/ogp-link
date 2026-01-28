import { createClient } from '@supabase/supabase-js'
import type { Database } from '../entities/database.types'

// Supabaseクライアントをシングルトンとして作成
// セッション管理の設定を明示的に指定
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,  // JWTトークンの自動リフレッシュを有効化
      persistSession: true,     // セッションをlocalStorageに永続化
      detectSessionInUrl: true  // URLパラメータからセッション情報を検出
    }
  }
)

// アプリ起動時にセッションを復元
supabase.auth.getSession()