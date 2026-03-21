import { useState } from 'react';
import seedCards from './data/cards.json';
import './App.css';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function App() {
  const [cards, setCards] = useState(seedCards);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  async function generateCards() {
    if (!prompt.trim()) return;
    if (!API_KEY || API_KEY === 'your_api_key_here') {
      alert('請先設定 .env 裡的 VITE_GEMINI_API_KEY！');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `生成 3 張卡片，主題：「${prompt}」

回傳嚴格 JSON，不要 markdown，不要解釋：
[
  {
    "id": "ai_1",
    "title": "emoji + 標題",
    "description": "一句話描述",
    "category": "分類",
    "rating": 1-5
  }
]`
              }]
            }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
          })
        }
      );

      const data = await response.json();
      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const newCards = JSON.parse(text);
      setCards([...newCards, ...cards]);
      setPrompt('');
    } catch (err) {
      console.error('AI 生成失敗:', err);
      alert('AI 生成失敗，請檢查 API Key 和網路');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>✨ Vibe Cards</h1>
        <p>JSON 驅動的卡片系統 — 你也可以讓 AI 幫你生成！</p>
      </header>

      <div className="ai-section">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generateCards()}
          placeholder="輸入主題讓 AI 生成卡片...（例如：東京美食推薦）"
          disabled={loading}
        />
        <button onClick={generateCards} disabled={loading || !prompt.trim()}>
          {loading ? '⏳ 生成中...' : '🤖 AI 生成'}
        </button>
      </div>

      <div className="cards-grid">
        {cards.map((card) => (
          <div key={card.id} className="card">
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <div className="card-meta">
              <span className="category">{card.category}</span>
              <span className="rating">{'⭐'.repeat(card.rating)}</span>
            </div>
          </div>
        ))}
      </div>

      <footer className="footer">
        <p>💡 試試看：改 <code>src/data/cards.json</code> → 頁面立刻變化！</p>
      </footer>
    </div>
  );
}

export default App;
