# レシピ共有アプリ 開発プラン

## 1. アプリ概要

ユーザーがレシピを投稿・閲覧・レビューできるソーシャルレシピプラットフォーム。動画投稿、グッド/バッドボタン、ブックマーク機能を追加。

---

## 2. 機能要件

| No | 機能 | 詳細 |
|---|---|---|
| F1 | **ユーザー認証** | Google OAuth 2.0 によるログイン/ログアウト |
| F2 | **レシピ投稿** | タイトル、説明、材料、手順、画像・動画のアップロード |
| F3 | **レシピ一覧** | カテゴリ別・検索・人気順・新規順・古い順ソート |
| F4 | **レシピ詳細** | 詳細情報、画像・動画ギャラリー、関連レシピ |
| F5 | **レビュー（星評価）** | 星評価（1-5）とコメント |
| F6 | **レビュー（グッド/バッド）** | グッドボタン・バッドボタンによる簡易レビュー |
| F7 | **ブックマーク** | 興味のあるレシピを保存・一覧表示 |
| F8 | **プロフィール** | ユーザー情報、投稿履歴、レビュー履歴、ブックマーク一覧 |
| F9 | **レシピ編集・削除** | 作者のみ編集・削除可能 |

---

## 3. データモデル

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│   users      │       │     recipes      │       │   reviews    │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id (PK)      │───┐   │ id (PK)          │   ┌──▶│ id (PK)      │
│ name         │   └──▶│ user_id (FK)     │   │   │ user_id (FK) │
│ avatar_url   │       │ title            │   │   │ recipe_id(FK)│
│ email        │       │ description      │   │   │ rating       │
│ created_at   │       │ ingredients      │   │   │ comment      │
└──────────────┘       │ steps            │   │   │ good_count   │
                       │ image_urls       │   │   │ bad_count    │
                       │ video_url        │   │   │ created_at   │
                       │ category         │   │   └──────────────┘
                       │ avg_rating       │   │
                       │ review_count     │   │
                       │ good_count       │   │
                       │ bad_count        │   │
                       │ bookmark_count   │   │
                       │ created_at       │   │
                       │ updated_at       │   │
                       └──────────────────┘   │
                                                │
                       ┌──────────────┐   ┌─────▼─────┐
                       │   categories │   │  images    │
                       ├──────────────┤   ├────────────┤
                       │ id (PK)      │   │ id (PK)    │
                       │ name         │   │ recipe_id  │
                       │ created_at   │   │ url        │
                       └──────────────┘   │ type       │
                                            │ order      │
                       ┌──────────────┐   │ created_at │
                       │ bookmarks    │   └────────────┘
                       ├──────────────┤
                       │ id (PK)      │
                       │ user_id (FK) │
                       │ recipe_id(FK)│
                       │ created_at   │
                       └──────────────┘
```

---

## 4. プロジェクト構造

```
cooksite/
├── wrangler.json              # Cloudflare Pages設定
├── vite.config.js             # Vite設定
├── package.json
├── tsconfig.json
├── public/
│   └── favicon.ico
├── src/
│   ├── main.jsx               # エントリポイント
│   ├── App.jsx                # ルーティング定義
│   ├── index.css              # グローバルスタイル
│   ├── api/
│   │   └── auth.js            # OAuthヘルパー
│   ├── components/
│   │   ├── Header.jsx         # ヘッダー（ナビ・ログイン）
│   │   ├── RecipeCard.jsx     # レシピカード
│   │   ├── StarRating.jsx     # 星評価コンポーネント
│   │   ├── GoodBadButton.jsx  # グッド/バッドボタン
│   │   ├── BookmarkButton.jsx # ブックマークボタン
│   │   ├── RecipeForm.jsx     # 投稿・編集フォーム
│   │   ├── ReviewList.jsx     # レビュー一覧
│   │   ├── ReviewForm.jsx     # レビュー投稿フォーム
│   │   └── VideoPlayer.jsx    # 動画プレイヤー
│   ├── pages/
│   │   ├── HomePage.jsx       # レシピ一覧
│   │   ├── RecipeDetail.jsx   # レシピ詳細
│   │   ├── CreatePage.jsx     # 新規投稿
│   │   ├── EditPage.jsx       # 編集
│   │   ├── ProfilePage.jsx    # プロフィール
│   │   └── BookmarkPage.jsx   # ブックマーク一覧
│   └── styles/
│       ├── Header.module.css
│       ├── RecipeCard.module.css
│       └── ...
├── functions/                 # Cloudflare Pages Functions
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.js       # Google OAuthログイン
│   │   │   └── callback.js    # OAuthコールバック
│   │   ├── recipes/
│   │   │   ├── index.js       # 一覧・投稿
│   │   │   └── [id].js        # 詳細・編集・削除
│   │   ├── reviews/
│   │   │   ├── index.js       # 一覧・投稿
│   │   │   └── [id].js        # 削除
│   │   ├── reactions/
│   │   │   └── index.js       # グッド/バッド投票
│   │   └── bookmarks/
│   │       ├── index.js       # 一覧・登録・解除
│   │       └── [id].js        # 個別操作
│   └── auth/
│       └── login.js           # OAuth開始
└── schema.sql                 # D1スキーマ
```

---

## 5. 開発フェーズ

| フェーズ | 内容 | 優先度 |
|---|---|---|
| **Phase 1** | プロジェクト初期化、CI/CD設定、D1スキーマ | 必須 |
| **Phase 2** | Google OAuth認証、ユーザー管理 | 必須 |
| **Phase 3** | レシピCRUD（投稿・一覧・詳細・編集・削除） | 必須 |
| **Phase 4** | レビュー機能（星評価・コメント） | 必須 |
| **Phase 5** | グッド/バッドボタン、ブックマーク機能 | 必須 |
| **Phase 6** | 動画アップロード（R2）、プロフィール・ブックマークページ | 重要 |
| **Phase 7** | 検索・ソート（新規順・古い順）、UI polish | 重要 |
| **Phase 8** | テスト、デプロイ準備 | 重要 |

---

## 6. 必要な環境変数

```
GOOGLE_CLIENT_ID=          # Google OAuthクライアントID
GOOGLE_CLIENT_SECRET=      # Google OAuthクライアントシークレット
OAUTH_CALLBACK_URL=        # コールバックURL
R2_BUCKET_NAME=            # R2バケット名
R2_ACCOUNT_ID=             # CloudflareアカウントID
R2_ACCESS_KEY_ID=          # R2アクセスキーID
R2_SECRET_ACCESS_KEY=      # R2シークレットアクセスキー
```

---

## 7. 技術的な注意点

- **認証**: Cloudflare Pages Functions + Google OAuth（Authorization Code Flow）
- **セッション**: Cookieベースのセッション管理
- **画像**: Cloudflare R2にアップロード、URLをimagesテーブルに保存
- **動画**: Cloudflare R2にアップロード、URLをrecipes.video_urlに保存
- **D1**: CloudflareのSQLite互換データベース
- **R2**: CloudflareのS3互換オブジェクトストレージ

---

## 8. 推定工数

| フェーズ | 工数 |
|---|---|
| Phase 1 | 1-2時間 |
| Phase 2 | 2-3時間 |
| Phase 3 | 3-4時間 |
| Phase 4 | 2-3時間 |
| Phase 5 | 2-3時間 |
| Phase 6 | 3-4時間 |
| Phase 7 | 2-3時間 |
| Phase 8 | 1-2時間 |
| **合計** | **16-24時間** |
