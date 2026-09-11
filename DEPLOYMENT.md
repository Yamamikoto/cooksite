# デプロイ手順書

## 目次

1. [前提条件](#前提条件)
2. [ローカル開発環境のセットアップ](#ローカル開発環境のセットアップ)
3. [Cloudflareリソースの作成](#cloudflareリソースの作成)
4. [環境変数の設定](#環境変数の設定)
5. [wrangler.jsonの設定](#wranglerjsonの設定)
6. [ローカルでの動作確認](#ローカルでの動作確認)
7. [本番環境へのデプロイ](#本番環境へのデプロイ)
8. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

- **Node.js** v18以上
- **npm** v9以上
- **Cloudflare** アカウント
- **Google Cloud** アカウント（OAuth用）

---

## ローカル開発環境のセットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数ファイルの作成

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定します：

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth callback URL (開発環境)
OAUTH_CALLBACK_URL=http://localhost:5173/api/auth/callback

# Cloudflare R2
R2_BUCKET_NAME=cooksite-assets
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
```

> **注意**: `.env.local` ファイルはGitで管理しないでください。`.gitignore` に含まれています。

### 3. 環境変数の確認

```bash
# 環境変数が設定されているか確認
cat .env.local
```

---

## Cloudflareリソースの作成

### 1. D1データベースの作成

```bash
# D1データベースの作成
wrangler d1 create cooksite

# 出力されるdatabase_idをメモしておく
# 例: 12345678-1234-1234-1234-123456789abc
```

### 2. D1スキーマの適用

```bash
# スキーマを適用
wrangler d1 execute cooksite --file=schema.sql
```

### 3. R2バケットの作成

```bash
# R2バケットの作成
wrangler r2 bucket create cooksite-assets

# バケットの公開設定（必要に応じて）
wrangler r2 bucket default-rules put cooksite-assets --rule-id your-rule-id
```

---

## 環境変数の設定

### ローカル開発

`.env.local` ファイルに直接設定します（上記参照）。

### 本番環境（Cloudflare Pages）

1. Cloudflare Pagesダッシュボードにアクセス
2. レポジトリを接続
3. 「Environment variables」セクションで以下を設定：

| 変数名 | 説明 |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuthクライアントID |
| `GOOGLE_CLIENT_SECRET` | Google OAuthクライアントシークレット |
| `OAUTH_CALLBACK_URL` | 本番環境のコールバックURL（例: `https://your-domain.com/api/auth/callback`） |
| `R2_BUCKET_NAME` | R2バケット名 |
| `R2_ACCOUNT_ID` | CloudflareアカウントID |
| `R2_ACCESS_KEY_ID` | R2アクセスキーID |
| `R2_SECRET_ACCESS_KEY` | R2シークレットアクセスキー |

---

## wrangler.jsonの設定

`wrangler.json` ファイルを編集し、以下の値を実際の値に置き換えます：

```json
{
  "name": "cooksite",
  "compatibility_date": "2024-01-01",
  "assets": ["dist"],
  "functions": {
    "priority": "default"
  },
  "d1_buckets": [
    {
      "binding": "DB",
      "database_name": "cooksite",
      "database_id": "YOUR_DATABASE_ID"  // ← 実際のD1データベースIDに置き換え
    }
  ],
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "cooksite-assets"
    }
  ]
}
```

---

## ローカルでの動作確認

### 1. 開発サーバーの起動

```bash
npm run dev
```

開発サーバーが `http://localhost:5173` で起動します。

### 2. 動作確認項目

- [ ] ホームページが表示される
- [ ] Google OAuthログインができる
- [ ] レシピの投稿ができる
- [ ] レシピの一覧が表示される
- [ ] レシピの詳細ページが表示される
- [ ] レビュー（星評価）が投稿できる
- [ ] グッド/バッドボタンが機能する
- [ ] ブックマークが機能する

### 3. テスト用データの作成

ログイン後、以下の操作を試してください：

1. レシピを3-5件投稿
2. 各レシピに星評価とコメントを付ける
3. グッド/バッドボタンを押す
4. ブックマークに登録する
5. プロフィールページで投稿履歴を確認

---

## 本番環境へのデプロイ

### 1. Cloudflare Pagesへのデプロイ

#### オプションA: Git連携（推奨）

1. GitHub/GitLab/Bitbucketにリポジトリをプッシュ
2. Cloudflare Pagesダッシュボードでリポジトリを接続
3. 設定：
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variables**: 上記で設定した環境変数
4. 「Save and Deploy」をクリック

#### オプションB: CLIデプロイ

```bash
npm run deploy
```

### 2. ドメインの設定

1. Cloudflare Pagesダッシュボードで「Custom domains」をクリック
2. ドメインを追加（例: `your-domain.com`）
3. DNS設定を確認

### 3. Google Cloud Consoleの設定

本番環境のコールバックURIをGoogle Cloud Consoleに追加：

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 「認証情報」ページを開く
3. OAuth 2.0クライアントIDを編集
4. 「承認済みのリダイレクトURI」に以下を追加：
   ```
   https://your-domain.com/api/auth/callback
   ```

---

## トラブルシューティング

### 1. OAuthエラー

**症状**: ログイン後にエラーが表示される

**解決策**:
- `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` が正しいか確認
- コールバックURIがGoogle Cloud Consoleに登録されているか確認
- ブラウザのコンソールでエラーメッセージを確認

### 2. D1接続エラー

**症状**: データベースにアクセスできない

**解決策**:
- `wrangler.json` の `database_id` が正しいか確認
- D1データベースが作成されているか確認
- スキーマが適用されているか確認

```bash
# D1データベースの確認
wrangler d1 list

# スキーマの再適用
wrangler d1 execute cooksite --file=schema.sql
```

### 3. R2アップロードエラー

**症状**: 画像・動画のアップロードができない

**解決策**:
- R2バケットが作成されているか確認
- R2アクセスキーが正しいか確認
- バケットの公開設定を確認

```bash
# R2バケットの確認
wrangler r2 bucket list
```

### 4. ビルドエラー

**症状**: `npm run build` が失敗する

**解決策**:
- Node.jsのバージョンを確認（v18以上が必要）
- 依存関係を更新

```bash
# 依存関係の更新
rm -rf node_modules package-lock.json
npm install
```

### 5. CORSエラー

**症状**: APIリクエストがブロックされる

**解決策**:
- `vite.config.js` のプロキシ設定を確認
- 本番環境ではCloudflare Pages Functionsが同じドメインで動作するため、CORSは発生しない

---

## 開発コマンド一覧

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバー起動（Vite） |
| `npm run build` | 本番用ビルド |
| `npm run preview` | ビルド後のプレビュー |
| `npm run pages:dev` | Cloudflare Pagesローカルエミュレーション |
| `npm run deploy` | Cloudflare Pagesにデプロイ |

---

## 参考リンク

- [Cloudflare Pages ドキュメント](https://pages.cloudflare.com/)
- [Cloudflare D1 ドキュメント](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 ドキュメント](https://developers.cloudflare.com/r2/)
- [Google OAuth 2.0 ドキュメント](https://developers.google.com/identity/protocols/oauth2)
- [React ドキュメント](https://react.dev/)
- [Vite ドキュメント](https://vitejs.dev/)
