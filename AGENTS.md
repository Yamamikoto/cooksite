# Project Guidelines (SSoT)

## Tech Stack
- **フロントエンド**: React(推奨), JavaScript(ES6+), CSS Modules(またはStyled Components)
- **ホスティング**: Cloudflare Pages
- **バックエンド API**: Cloudflare Pages Functions
- **データベース**: Cloudflare D1
- **オブジェクトストレージ**: Cloudflare R2 (画像・動画)
- **ユーザー認証**: OAuth 2.0 (Google/OAuth Provider)を必須とし、自前でのパスワード管理は行わない。

## 参照先
- **行動規範:** `.agent/rules/` を参照してください。
- **ワークフロー:** `.agent/workflows/` を参照してください。

## work_log.md更新ルール
毎回の作業後、 `work_log.md` に次の内容を追記してください。
- 作業日
- 実施テーマ
- 作成したファイル
- 更新したファイル
- AIが行った作業
- 利用者が入力した主な内容
- 人間が確認すべき点
- GitHubコミットメッセージ案

## セキュリティと倫理
次の情報は、HTML、Markdown、GitHubに含めないでください。
- 氏名と連絡先の組み合わせ
- 住所
- 電話番号
- メールアドレス
- 学籍番号
- 社員番号
- パスワード
- APIキー
- 顧客情報
- 成績情報
- 社内資料
- 未公開資料
- 他人の個人情報
判断に迷う場合は、利用者に確認してください。