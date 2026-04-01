export const metadata = {
  title: "AI_RADAR — 世界のAI情報をリアルタイムで",
  description: "Reddit × Claude AIで世界のAIニュースをリアルタイム日本語翻訳",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0, background: "#060810" }}>
        {children}
      </body>
    </html>
  );
}
