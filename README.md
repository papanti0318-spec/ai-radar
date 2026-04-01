# AI_RADAR v0.5
Reddit × Claude AI — リアルタイムAIニュース日本語翻訳

---

## 公開手順（30分でできます）

### Step 1: GitHubにアップロード

1. https://github.com にアクセス → アカウント作成（無料）
2. 「New repository」→ 名前: `ai-radar` → Create
3. このフォルダの中身を全部アップロード
   - 「uploading an existing file」をクリック
   - フォルダをドラッグ＆ドロップ
   - Commit changes

### Step 2: APIキーを取得

1. https://console.anthropic.com/settings/keys にアクセス
2. 「Create Key」→ キーをコピー（sk-ant-...）
3. ⚠️ このキーは絶対に人に見せない・GitHubに上げない

### Step 3: Vercelにデプロイ

1. https://vercel.com にアクセス → GitHubでログイン
2. 「Add New Project」→ ai-radar を選択 → Import
3. 「Environment Variables」に追加:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...（コピーしたキー）`
4. 「Deploy」ボタンを押す
5. 数分後にURLが発行される 🎉

```
https://ai-radar-xxxxx.vercel.app
```

---

## ファイル構成

```
ai-radar/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── claude/route.js     ← Claude APIを安全に呼ぶ
│   │   │   └── reddit/route.js     ← Redditを取得
│   │   ├── layout.js
│   │   └── page.js
│   └── components/
│       └── Dashboard.js            ← メインUI
├── .env.local                      ← APIキー（GitHubに上げない）
├── .gitignore                      ← .env.localを除外
├── next.config.js
└── package.json
```

---

## ローカルで動かす場合

```bash
# Node.jsが必要（https://nodejs.org）
npm install
npm run dev
# http://localhost:3000 で確認
```

---

## 機能

- Reddit 5サブレディットからホット投稿を自動収集
- Claude AIでタイトルを一括日本語翻訳
- 60秒ごと自動更新
- カテゴリフィルター（研究・ツール・ビジネス・モデル）
- 詳細パネル（AI翻訳・分析 + コメント翻訳）
- Reddit取得失敗時はClaude AIが自動生成

---

## 注意事項

- Claude APIは使った分だけ課金されます
- 1アクセスあたり約0.5〜2円程度
- 公開後はアクセス数に応じて課金が増えます
- Anthropic Console で使用量を確認できます

---

Made with ❤️ by ととのえる屋
