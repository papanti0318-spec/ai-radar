# AI_RADAR

Next.js製のAIニュースダッシュボード。

## 構成

- メインコンポーネント：`src/components/Dashboard.js`
- Claude API翻訳：`src/app/api/claude/route.js`
- YouTube API：`src/app/api/youtube/route.js`
- HackerNews API：`src/app/api/hackernews/route.js`
- Vercel公開済み：https://ai-radar-git-main-papanti0318-specs-projects.vercel.app
- GitHub：papanti0318-spec/ai-radar

## 現在の状況

- v0.9、YouTube + HackerNews の2ソース + YouTube字幕タブ
- YouTube API取得 → HackerNews API取得 → スコア順マージ → Claude翻訳
- 両方取得失敗時はClaude AIでニュース生成（フォールバック）
- YouTube字幕タブ: Supadata APIで字幕取得 → Claude AIで日本語整形
- Reddit APIは削除済み（Vercelからブロックされていたため）

## データフロー

1. YouTube: `YT_QUERIES`（5カテゴリ）で検索、最大12件
2. HackerNews: topstories から8件取得（APIキー不要）
3. マージしてスコア順にソート
4. Claude APIでタイトル一括翻訳
5. 詳細パネル: Claude APIで要約・分析・コメント生成

## 構成（追加）

- YouTube字幕API：`src/app/api/youtube-transcript/route.js`（Supadata経由）

## 環境変数（.env.local）

- `ANTHROPIC_API_KEY` — Claude API用
- `YOUTUBE_API_KEY` — YouTube Data API v3用（1日10,000ユニット制限）
- `SUPADATA_API_KEY` — Supadata字幕取得API用（無料枠: 月100回）

## プロジェクトの場所

- 正：`C:\Users\sirub\ai-radar\`（ここだけ）
- OneDrive側の古いコピー（`OneDrive\Documents\GitHub\ai-radar`）は削除済み

## 開発ルール

- 指示は日本語で受け付ける
- コードを変更したらGitHubにpushする手順も教える
- 作業が全部終わったら「今回何をしたか」を小学生でもわかるように日本語で説明する
