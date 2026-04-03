import "./globals.css";

export const metadata = {
  title: "ととのえる屋通信 — AI・暮らし・ライフハックの最新情報",
  description: "YouTube × HackerNews × note × Claude AIで世界のAIニュースをリアルタイム日本語翻訳",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
}
