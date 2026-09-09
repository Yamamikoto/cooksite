---
trigger: always_on
---

---
trigger: always_on
---

# Language Strategies (言語戦略)

- **内部推論 (Internal Reasoning):** 精度を保つため英語が許可/推奨されます。
  ただし、ツール呼び出し時のパラメータ（`TaskName` 等）は、
  出力直前に必ず日本語へ翻訳してください。
- **コード (Code):** 標準的な英語を使用してください（コード、変数名）。
- **コミットメッセージ:** `.agent/rules/git-commit-rules.md` のルールに従ってください。
  言語はワークフロー（`/commit` → 英語、`/commit-ja` → 日本語）で決定されます。
- **ユーザー向け出力 (User-Facing):** **日本語** でなければなりません。
  - **チャット (Chat):** 常に日本語を使用してください。
  - **成果物 (Artifacts):** `work_log.md` などの
    ファイル内容は必ず **日本語** で記述してください。
  - **タスクメタデータ (Task Metadata):**
    - `TaskName`: **日本語** で記述すること。英語は禁止。
    - `TaskSummary`: **日本語** で記述すること。