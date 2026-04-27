# OGP

## Github Link

This repository is live in [ogp-link repository](https://github.com/guntamania/ogp-link)

## Deploy

[![Netlify Status](https://api.netlify.com/api/v1/badges/2cbfefa8-0a95-45ff-9718-5a472d3d5a74/deploy-status)](https://app.netlify.com/projects/ogp-link/deploys)

## Local Development

依存パッケージをインストールしてから、開発サーバーを起動します。

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開くと確認できます。

### その他のコマンド

| コマンド | 説明 |
| --- | --- |
| `npm run build` | プロダクション向けビルド（`dist/` に出力） |
| `npm run preview` | ビルド済み成果物をローカルでプレビュー |
| `npm run lint` | ESLint による静的解析 |

## Generate

To generate db scheme based typescript.

```bash
npm run generate-dbtypes
```
