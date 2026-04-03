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

- v1.0、YouTube + HackerNews + note の3ソース + YouTube字幕タブ
- YouTube API取得 → HackerNews API取得 → スコア順マージ → Claude翻訳
- note記事はリンクリストとして別セクションに表示（クリックでnote.comに遷移）
- 両方取得失敗時はClaude AIでニュース生成（フォールバック）
- YouTube字幕タブ: Supadata APIで字幕取得 → Claude AIで日本語整形
- Reddit APIは削除済み（Vercelからブロックされていたため）

## データフロー

1. YouTube: `YT_QUERIES`（5カテゴリ）で検索、最大12件
2. HackerNews: topstories から8件取得（APIキー不要）
3. note: AI系クリエイター6名のユーザーRSSから記事取得（APIキー不要）
4. YouTube + HNをマージしてスコア順にソート
5. Claude APIでタイトル一括翻訳
6. note記事はニュースグリッドの下にリンクリストとして表示
7. 詳細パネル: Claude APIで要約・分析・コメント生成

## 構成（追加）

- YouTube字幕API：`src/app/api/youtube-transcript/route.js`（Supadata経由）
- note記事API：`src/app/api/note-articles/route.js`（ユーザーRSS経由）

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

## APIエラーハンドリングルール

すべての外部API呼び出しに以下を必ず実装すること：

- 環境変数の存在チェック（未設定・空文字・空白を検出）
- レスポンスが200以外のときステータスコード＋ボディを`console.error`
- 空・null・空配列レスポンスのチェック
- 全体を`try-catch`で囲む
- ログには `[api名]` タグをつける（例：`[youtube-transcript]`）
- JSONは`try-catch`でパースする
- SDKよりdirect fetch（`fetch()`）のほうがエラーが把握しやすい

## 外部APIのブロック対策

- VercelのIPは一部サービス（note検索API、Reddit等）にブロックされる
- 対策：公式検索APIではなくRSSを使う
- note.comの場合：ハッシュタグRSSは存在しない。ユーザーRSS（`note.com/{user}/rss`）を束ねる方式が有効
- ローカルでは動くがVercelで403になるケースがあるため、デプロイ後に必ず本番で動作確認する

## Vercel固有の注意点

- 環境変数を追加・変更したら必ずRedeployする（設定変更だけでは反映されない）
- Function Logs（ダッシュボード → Logs）でエラー原因を確認できる
- `max_tokens`が小さいとClaude APIのJSONレスポンスが途中で切れる（4096推奨）
- Deployment Protectionが有効だとサイト全体が401になる。公開サイトはOFFにする

## デザインルール（必ず守ること）

### ブランドカラー
- 背景色：`#f5f0e6`（ライトオレンジ/クリームベージュ）
- アクセント：フォレストグリーン（`#10b981`）
- サブカラー：アンバー（`#f59e0b`）
- フォント：Noto Sans JP

### 注意
- コンポーネントごとに独自の背景色を当てない
- 背景色はすべて `#f5f0e6` で統一する
- ボックスやカードに別の背景をつける場合は白（`#FFFFFF`）のみ使用

## 開発フロー

- ローカルで動作確認 → pushしてデプロイの順番を守る
- エラー修正は1つずつ。一気に複数変更しない
- デプロイ後は本番URLでAPI・フロント両方の動作を確認する
