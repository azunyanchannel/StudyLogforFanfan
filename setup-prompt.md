# Vibe Cards 專案設定指令

請幫我把目前這個 repo 改造成一個 JSON 驅動的卡片展示網站。

## 步驟

1. **清除現有的 src/ 內容**（如果有的話），但保留 .git 資料夾
2. **用 Vite + React 建立專案**：執行 `npm create vite@latest . -- --template react`（如果 package.json 已存在就先刪除）
3. **安裝依賴**：`npm install`
4. **建立以下檔案結構**：

### `.env.template`
```
# 複製這個檔案，改名為 .env
# cp .env.template .env
VITE_GEMINI_API_KEY=your_api_key_here
```

### `.gitignore`（確保包含）
```
node_modules
dist
.env
.env.local
```

### `src/data/cards.json`
```json
[
  {
    "id": "1",
    "title": "📍 淺草寺",
    "description": "東京最古老的寺廟，雷門超好拍",
    "category": "文化",
    "rating": 5
  },
  {
    "id": "2",
    "title": "🍜 一蘭拉麵",
    "description": "一個人也能安心吃的豚骨拉麵",
    "category": "美食",
    "rating": 4
  },
  {
    "id": "3",
    "title": "🎮 秋葉原",
    "description": "動漫、電玩、女僕咖啡廳的聖地",
    "category": "購物",
    "rating": 5
  }
]
```

### `src/App.jsx`
```jsx
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
```

### `src/App.css`
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
}

.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 2.5em;
  margin-bottom: 8px;
}

.header p {
  font-size: 1.1em;
  opacity: 0.9;
}

.ai-section {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.ai-section input {
  flex: 1;
  padding: 14px 18px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.ai-section input:focus {
  outline: 3px solid rgba(255,255,255,0.5);
}

.ai-section button {
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  background: white;
  color: #764ba2;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.ai-section button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

.ai-section button:disabled {
  opacity: 0.5;
  cursor: default;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.card h2 {
  font-size: 1.3em;
  margin-bottom: 8px;
}

.card p {
  color: #666;
  line-height: 1.5;
  margin-bottom: 12px;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category {
  background: #f0e6ff;
  color: #764ba2;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.rating {
  font-size: 14px;
}

.footer {
  text-align: center;
  color: rgba(255,255,255,0.8);
  padding: 16px;
}

.footer code {
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: 4px;
}

@media (max-width: 480px) {
  .ai-section {
    flex-direction: column;
  }
  .header h1 {
    font-size: 1.8em;
  }
}
```

### `src/main.jsx`
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

5. **刪除多餘的檔案**：移除 `src/index.css`、`src/assets/` 等 Vite 預設但不需要的檔案
6. **確認能跑**：`npm run dev` 應該可以在 localhost 看到紫色漸層背景 + 3 張卡片
7. **不要自動 commit/push**，等我們手動處理
