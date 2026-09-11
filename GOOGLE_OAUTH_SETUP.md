# Google OAuth設定手順

## 1. Google Cloud Consoleの設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（例: "cooksite"）
3. 「OAuth同意画面」を構成
   - ユーザータイプ: 「外部」を選択
   - アプリ名: "レシピシェア"
   - ユーザーサポートメール: 連絡先メール
   - 開発者連絡先メール: 連絡先メール
4. 「認証情報」ページで「OAuth 2.0 クライアントID」を作成
   - アプリケーションの種類: 「ウェブアプリケーション」
   - 承認済みのリダイレクトURI: `http://localhost:5173/api/auth/callback` （開発時）
   - 承認済みのJavaScriptオリジン: `http://localhost:5173`

## 2. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の情報を設定：

```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 3. Cloudflare Pagesの設定

1. Cloudflare Pagesにデプロイするリポジトリを接続
2. 環境変数を設定：
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `OAUTH_CALLBACK_URL` （本番環境用）

## 4. ローカル開発

```bash
# 環境変数を設定
cp .env.example .env.local

# 開発サーバー起動
npm run dev
```

## 5. 本番環境

本番環境では、Google Cloud Consoleに本番用のリダイレクトURIを追加してください：
- `https://your-domain.com/api/auth/callback`
