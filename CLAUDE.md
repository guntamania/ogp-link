# 指示

## 一般的指示

- 日本語ベース
- 質問文 → 答えのみ。コード修正しない
- コメント追加しない（自明なもの不要）

## プロジェクト概要

URLを入力してOGP情報を取得し、リンクカードを作成・共有するWebアプリ。

- フロントエンドのみ（React + Vite + TypeScript）
- バックエンド: Supabase（DB + Auth + Edge Functions）
- デプロイ: Netlify

## 技術スタック

- React 19 + TypeScript + Vite
- MUI v7（Material UI）カスタムテーマ: `src/theme.ts`
- Supabase: `@supabase/supabase-js`
- React Router DOM v7
- sqids（短縮ID生成）

## ディレクトリ構成

```text
src/
  pages/
    Landing.tsx      # トップ（ログイン・ヒーロー）
    New.tsx          # リンクページ作成
    Room.tsx         # リンクページ閲覧
    MyPage.tsx       # マイページ（ルーム一覧）
  components/
    layout/
      AppToolbar.tsx # 共通ヘッダー
    ogp/
      OGPCard.tsx    # OGPカードコンポーネント
      types.ts
  entities/
    database.types.ts  # Supabase 自動生成型
  lib/
    supabase.ts      # Supabaseクライアント
  theme.ts           # MUIテーマ（ライトモード・ウォームパレット）
  index.css          # グローバルCSS変数
```

## デザインシステム

ライトモード。ウォーム系パレット。

- Brand: `#f5a623`（ゴールド）
- Secondary: `#4f8ef7`（スカイブルー）
- Background: `#fffdf7`
- Card: 白背景 + `rgba(0,0,0,0.08)` ボーダー + `border-radius: 20px`
- Button radius: `14px`、Pill: `9999px`
- AppBar: `rgba(255,253,247,0.90)` フロストガラス

## フロントエンド規則

- レイアウトは MUI を使う
- 色・影・ボーダーはテーマ準拠。ハードコードしない
- テーマにない値は `sx` prop でインライン指定

## 認証

Supabase Magic Link（`signInWithOtp` + `verifyOtp`）。
セッション管理: `supabase.auth.onAuthStateChange`。

## デプロイ

```bash
npm run build   # dist/ に出力
```

Netlify へ `dist/` をデプロイ。

## 開発コマンド

```bash
npm run dev              # 開発サーバー (localhost:5173)
npm run build            # プロダクションビルド
npm run lint             # ESLint
npm run generate-dbtypes # Supabase型 再生成
```

## DB型 再生成

```bash
npm run generate-dbtypes
```

Supabase project ID: `ppgwdigbeqajeajxzosp`

## 環境変数

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```
