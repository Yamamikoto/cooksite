---
trigger: always_on
globs: ["**/*"]
---

# File Editing Rules (ファイル編集規約)

**Activation:** This rule is **ALWAYS ON** for all file editing operations (`**/*`).

> **Positioning:** `senior-engineer-conduct.md` の「No Silent Failures」と
> 「Self-Correction」の原則を、**ファイル編集操作**に具体化したルールです。

## 1. Read Before Edit (編集前に必ず読む)

- **原則:** ファイルを編集する前に、**必ず `read_file` で最新の内容を確認する**。
- **行動指針:**
    - 編集対象ファイルの最新内容を `read_file` で取得すること。
    - 過去に読んだ内容や推測に基づいて編集してはならない。
    - ファイルが大きい場合は、編集対象部分のみを読み込む。
    - 編集前にファイルの最終更新時刻や diff を確認し、他者が変更していないか検証する。

## 2. Use Correct Tool (正しいツールを使用する)

- **原則:** 各ツールに適切な用途があり、使い分けが必須。
- **行動指針:**

| ツール | 用途 | 必須パラメータ |
|--------|------|---------------|
| `read_file` | 既存ファイルの内容確認 | `filepath` |
| `edit_existing_file` | 既存ファイルの一部を修正 | `filepath`, `changes` |
| `create_new_file` | 新規ファイルの作成 | `filepath`, `contents` |
| `single_find_and_replace` | 文字列の正確な置換 | `filepath`, `old_string`, `new_string` |

- **禁止事項:**
    - ❌ `edit_existing_file` をパラメータなしで呼び出さない
    - ❌ ファイルが存在しないのに `edit_existing_file` を使わない（`create_new_file` を使用）
    - ❌ 空の `changes` で編集しない

## 3. Exact String Matching (正確な文字列一致)

- **原則:** `edit_existing_file` の `changes` パラメータは、**正確なコードスニペット**を指定する。
- **行動指針:**
    - 変更部分のみを記載し、未変更部分は `// ... existing code ...` で省略する。
    - `old_string` はファイル内に**唯一**存在する文字列であること。
    - 空白文字（スペース、タブ、改行）も含めて正確に一致させること。
    - 一意な文字列が見つからない場合は、周囲のコンテキストを含めて拡大する。
    - `replace_all` は変数名の変更など、意図的に複数箇所を変更する場合のみ使用。

## 4. Verify After Edit (編集後に検証する)

- **原則:** 編集が成功した後も、内容を確認する。
- **行動指針:**
    - 編集成功后、`read_file` で修正箇所を確認する。
    - 意図しない変更がされていないか検証する。
    - 編集に失敗した場合は、エラーメッセージを確認し、再度 `read_file` してから再試行する。

## 5. Handle Failures Gracefully (失敗の適切な処理)

- **原則:** 編集失敗時は盲目的に再試行せず、原因を分析する。
- **行動指針:**
    - 失敗時のエラーメッセージを必ず確認する。
    - 「`filepath` and `changes` are required」エラーが発生した場合は、パラメータを見直す。
    - 「content did not match」エラーが発生した場合は、再度 `read_file` で最新内容を確認し、`old_string` を更新する。
    - 3回以上の連続失敗時は、アプローチを変更するかユーザーに報告する。

## 6. No Ghost Edits (隠れた編集をしない)

- **原則:** 編集した内容は必ず報告する。
- **行動指針:**
    - 編集したファイル名と変更内容をユーザーに明示する。
    - 予期しない副作用（関連ファイルへの影響）がある場合は事前に警告する。
    - 「裏で勝手に直しておきました」は禁止。

## 7. Parallel Editing Prohibition (並列編集の禁止)

- **原則:** 編集ツールは並列実行できない。
- **行動指針:**
    - `edit_existing_file`、`single_find_and_replace` は**逐次実行**すること。
    - 複数の編集が必要な場合は、1つ完了してから次の編集を開始する。
    - `read_file` のみ並列実行可能。
