# CookSite - レシピ共有アプリ

ユーザーがレシピを投稿・閲覧・レビューできるソーシャルレシピプラットフォーム。

## 機能

- Google OAuth 2.0による認証
- レシピの投稿・編集・削除
- 画像・動画のアップロード（Cloudflare R2）
- 星評価（1-5）とコメントによるレビュー
- グッド/バッドボタンによる簡易レビュー
- ブックマーク機能
- カテゴリ別・検索・ソート（人気順・新規順・古い順）

## 技術スタック

- **フロントエンド**: React + Vite
- **バックエンド**: Cloudflare Pages Functions
- **データベース**: Cloudflare D1
- **オブジェクトストレージ**: Cloudflare R2
- **認証**: Google OAuth 2.0

## 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の情報を設定してください：

```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
OAUTH_CALLBACK_URL=http://localhost:5173/api/auth/callback
R2_BUCKET_NAME=cooksite-assets
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
```

Google OAuthのクライアントID/シークレットの取得手順については、`GOOGLE_OAUTH_SETUP.md` を参照してください。

## 開発手順

### 0. セットアップチェック

```bash
# デプロイ準備チェックを実行
node setup.js
```

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Cloudflare D1の作成

```bash
wrangler d1 create cooksite
```

### 3. D1スキーマの適用

```bash
wrangler d1 execute cooksite --file=schema.sql
```

### 4. Cloudflare R2バケットの作成

```bash
wrangler r2 bucket create cooksite-assets
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

### 6. デプロイ

```bash
npm run deploy
```

## デプロイ詳細

詳細なデプロイ手順については、[`DEPLOYMENT.md`](DEPLOYMENT.md) を参照してください。

## プロジェクト構造

```
cooksite/
├── src/                    # フロントエンド
│   ├── components/         # Reactコンポーネント
│   ├── pages/              # ページコンポーネント
│   └── styles/             # CSSモジュール
├── functions/              # Cloudflare Pages Functions
│   └── api/                # APIエンドポイント
├── schema.sql              # D1データベーススキーマ
└── wrangler.json           # Cloudflare Pages設定
```

## ライセンス

MIT
