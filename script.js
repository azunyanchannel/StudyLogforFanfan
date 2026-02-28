document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const htmlRoot = document.getElementById('html-root');
    const pageTitle = document.getElementById('page-title');
    const essayInput = document.getElementById('essay-input');
    const wordCountDisplay = document.getElementById('word-count');
    const submitBtn = document.getElementById('submit-btn');
    const clearBtn = document.getElementById('clear-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const langToggleBtn = document.getElementById('lang-toggle');

    const resultsSection = document.getElementById('results-section');
    const loadingSpinner = document.getElementById('loading-spinner');
    const analysisContent = document.getElementById('analysis-content');
    const grammarFeedback = document.getElementById('grammar-feedback');

    const dailyQuote = document.getElementById('daily-quote');
    const quoteAuthor = document.getElementById('quote-author');
    const historyList = document.getElementById('history-list');

    // Puzzle Elements
    const puzzleContainer = document.getElementById('puzzle-container');
    const puzzleProgress = document.getElementById('puzzle-progress');
    const puzzleHint = document.getElementById('puzzle-hint');

    // System Settings & Keys
    const HISTORY_KEY = 'lumina_essay_history';
    const LANG_KEY = 'lumina_language';
    const PUZZLE_KEY = 'lumina_puzzle_state';

    // --> API Config
    // This is the blank URL for the API that user can fill later
    // It should return an image URL, or a JSON response from which an image URL can be extracted.
    const CAT_API_URL = '';
    const TOTAL_PIECES = 9; // 3x3 Grid

    // State
    let currentLang = localStorage.getItem(LANG_KEY) || 'zh'; // Default to Chinese
    let puzzleState = {
        imageUrl: '',
        unlocked: [] // Array of indices (0 to 8)
    };

    // Translations Dictionary
    const i18n = {
        en: {
            title: "Lumina - English Writing Assistant",
            logo: "✨ Lumina",
            subtitle: "Elevate Your English Writing",
            newEssay: "New Essay",
            placeholder: "Start typing your English essay here. We will check your grammar and count your words...",
            analyzeBtn: "Analyze Essay",
            processingBtn: "Processing...",
            clearBtn: "Clear",
            analysisResult: "Analysis Result",
            loading: "Analyzing your essay...",
            grammarSuggestions: "Grammar & Suggestions",
            writingHistory: "Writing History",
            clearAllBtn: "Clear All",
            noNotes: "No notes found. Start writing!",
            word: "word",
            words: "words",
            alertEmpty: "Please enter some text to analyze.",
            confirmClearHistory: "Are you sure you want to clear all your writing history? This cannot be undone.",

            // Puzzle
            puzzleTitle: "Cat Puzzle Reward",
            puzzleHint: "Submit an essay to unlock a puzzle piece!",
            puzzleCompleted: "Puzzle completed! A new one will start next time.",

            // Quotes
            quotes: [
                { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
                { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
                { text: "Good writing is clear thinking made visible.", author: "William Wheeler" },
                { text: "You can make anything by writing.", author: "C.S. Lewis" },
                { text: "Words are, of course, the most powerful drug used by mankind.", author: "Rudyard Kipling" },
                { text: "Don't let what you cannot do interfere with what you can do.", author: "John Wooden" },
                { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
                { text: "A professional writer is an amateur who didn't quit.", author: "Richard Bach" }
            ],

            // Analysis Feedback (Mock)
            fb_length_short_title: "Length",
            fb_length_short_text: "Your essay is quite short! Try to add more details and expand on your ideas.",
            fb_length_good_title: "Great Job",
            fb_length_good_text: "Excellent length! Make sure your paragraphs are well structured and flow smoothly.",
            fb_length_normal_title: "Length",
            fb_length_normal_text: "Good start. Remember to include a clear introduction, body, and conclusion.",
            fb_cap_title: "Capitalization",
            fb_cap_text: "Remember to capitalize the first letter of each sentence.",
            fb_grammar_title: "Grammar",
            fb_grammar_text: 'Consider changing "I am go" to "I am going".',
            fb_vocab_title: "Vocabulary",
            fb_vocab_text: 'You used filler words like "very" or "really". Consider using stronger adjectives (e.g., "excellent" instead of "very good").',
            fb_advice_title: "Suggestion",
            fb_advice_text: 'Vary your sentence structure by using transitional words like "furthermore", "however", or "in contrast".'
        },
        zh: {
            title: "Lumina - 英语写作助手",
            logo: "✨ Lumina",
            subtitle: "提升你的英语写作水平",
            newEssay: "新作文",
            placeholder: "在这里开始输入你的英语作文。我们将检查你的语法并进行字数统计...",
            analyzeBtn: "分析作文",
            processingBtn: "处理中...",
            clearBtn: "清空",
            analysisResult: "分析结果",
            loading: "正在分析你的作文...",
            grammarSuggestions: "语法与建议",
            writingHistory: "写作历史",
            clearAllBtn: "清空全部",
            noNotes: "没有找到记录。开始写作吧！",
            word: "词",
            words: "词",
            alertEmpty: "请输入一些文本以进行分析。",
            confirmClearHistory: "你确定要清空所有写作历史记录吗？此操作无法撤销。",

            // Puzzle
            puzzleTitle: "猫咪拼图奖励",
            puzzleHint: "提交作文来解锁拼图碎片！",
            puzzleCompleted: "拼图完成！下次分析将开启新拼图。",

            // Quotes
            quotes: [
                { text: "进步的秘诀全在于开始。", author: "马克·吐温" },
                { text: "在事情未成功之前，一切总看似不可能。", author: "纳尔逊·曼德拉" },
                { text: "好文章是清晰思维的体现。", author: "威廉·惠勒" },
                { text: "只要动笔，你能创造任何东西。", author: "C.S. 刘易斯" },
                { text: "当然，文字是人类使用的最有力量的药剂。", author: "鲁德亚德·吉卜林" },
                { text: "不要让你不会做的事干扰你会做的事。", author: "约翰·伍登" },
                { text: "相信你能做到，你就已经成功了一半。", author: "西奥多·罗斯福" },
                { text: "专业的作家是那些没有放弃的业余爱好者。", author: "理查德·巴赫" }
            ],

            // Analysis Feedback (Mock)
            fb_length_short_title: "篇幅提示",
            fb_length_short_text: "你的作文太短了！试着增加更多细节并展开你的想法。",
            fb_length_good_title: "干得漂亮",
            fb_length_good_text: "长度非常好！请确保你的段落结构合理且流畅。",
            fb_length_normal_title: "篇幅提示",
            fb_length_normal_text: "开局不错。记住要包含清晰的引言、正文和结尾。",
            fb_cap_title: "大小写检查",
            fb_cap_text: "记得由于每个句子的开头应当大写首字母，请检查一下你的文章。",
            fb_grammar_title: "语法错误",
            fb_grammar_text: '考虑将 "I am go" 改为 "I am going"以保持时态正确。',
            fb_vocab_title: "词汇提升",
            fb_vocab_text: '你使用了像 "very" 或 "really" 等相对简单的词汇。考虑使用更高级的形容词（例如，用 "excellent" 代替 "very good"）。',
            fb_advice_title: "写作建议",
            fb_advice_text: '通过使用像 "furthermore"（此外）、"however"（然而）或 "in contrast"（相比之下）这样的过渡词来丰富你的句子结构。'
        }
    };

    // --- Language Translation Logic ---
    function updateLanguage() {
        const langData = i18n[currentLang];

        // Update document Lang attribute
        htmlRoot.lang = currentLang === 'en' ? 'en' : 'zh-CN';
        pageTitle.textContent = langData.title;

        // Update elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (langData[key]) {
                el.textContent = langData[key];
            }
        });

        // Update elements with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (langData[key]) {
                el.placeholder = langData[key];
            }
        });

        // Toggle Button Text
        langToggleBtn.textContent = currentLang === 'en' ? '中文 / EN' : 'EN / 中文';

        // Re-render components to match new lang
        updateWordCount();
        loadHistory();
        updatePuzzleProgressText();

        // Setup Submit button state correctly if it's not disabled
        if (!submitBtn.disabled) {
            submitBtn.textContent = langData.analyzeBtn;
        } else {
            submitBtn.textContent = langData.processingBtn;
        }

        // Pick a new quote in the newly selected language
        setRandomQuote();
    }

    // Toggle Language Action
    langToggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'zh' ? 'en' : 'zh';
        localStorage.setItem(LANG_KEY, currentLang);

        // Prevent scroll jump during text replacement
        const top = window.pageYOffset || document.documentElement.scrollTop;
        updateLanguage();
        window.scrollTo(0, top);
    });

    // --- Puzzle Reward Logic ---
    async function initPuzzle() {
        const saved = localStorage.getItem(PUZZLE_KEY);
        if (saved) {
            try {
                puzzleState = JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse puzzle state");
            }
        }

        if (!puzzleState.imageUrl) {
            await fetchNewPuzzleImage();
        }

        renderPuzzle();
        updatePuzzleProgressText();
    }

    async function fetchNewPuzzleImage() {
        if (!CAT_API_URL) {
            // Fallback placeholder image when API URL is empty
            puzzleState.imageUrl = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
        } else {
            try {
                const response = await fetch(CAT_API_URL);
                const text = await response.text();
                try {
                    const data = JSON.parse(text);
                    if (Array.isArray(data) && data[0] && data[0].url) {
                        puzzleState.imageUrl = data[0].url;
                    } else if (data && (data.url || data.image)) {
                        puzzleState.imageUrl = data.url || data.image;
                    } else {
                        puzzleState.imageUrl = CAT_API_URL; // Fallback
                    }
                } catch (e) {
                    puzzleState.imageUrl = response.url || CAT_API_URL;
                }
            } catch (e) {
                console.error('Failed to fetch puzzle from API', e);
                puzzleState.imageUrl = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
            }
        }
        puzzleState.unlocked = [];
        savePuzzleState();
    }

    function savePuzzleState() {
        localStorage.setItem(PUZZLE_KEY, JSON.stringify(puzzleState));
    }

    function renderPuzzle() {
        puzzleContainer.innerHTML = '';

        for (let i = 0; i < TOTAL_PIECES; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;

            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';

            // Calculate Background position for 3x3 grid
            const posX = col * 50;
            const posY = row * 50;
            piece.style.backgroundPosition = `${posX}% ${posY}%`;
            piece.style.backgroundImage = `url(${puzzleState.imageUrl})`;

            if (puzzleState.unlocked.includes(i)) {
                piece.classList.add('unlocked');
            } else {
                piece.classList.add('locked');
            }

            puzzleContainer.appendChild(piece);
        }
    }

    function updatePuzzleProgressText() {
        puzzleProgress.textContent = `${puzzleState.unlocked.length}/${TOTAL_PIECES}`;
        const langData = i18n[currentLang];

        if (puzzleState.unlocked.length >= TOTAL_PIECES) {
            puzzleHint.textContent = langData.puzzleCompleted;
            puzzleHint.style.color = 'var(--primary-color)';
            puzzleHint.style.fontWeight = '600';
        } else {
            puzzleHint.textContent = langData.puzzleHint;
            puzzleHint.style.color = 'var(--text-secondary)';
            puzzleHint.style.fontWeight = 'normal';
        }
    }

    async function unlockPuzzlePiece() {
        if (puzzleState.unlocked.length >= TOTAL_PIECES) {
            // Already completed, start a new one
            await fetchNewPuzzleImage();
            renderPuzzle();
            updatePuzzleProgressText();
            return;
        }

        const lockedPieces = [];
        for (let i = 0; i < TOTAL_PIECES; i++) {
            if (!puzzleState.unlocked.includes(i)) {
                lockedPieces.push(i);
            }
        }

        if (lockedPieces.length > 0) {
            // Unlock a random piece
            const randomIndex = Math.floor(Math.random() * lockedPieces.length);
            const pieceToUnlock = lockedPieces[randomIndex];
            puzzleState.unlocked.push(pieceToUnlock);
            savePuzzleState();

            // Re-render
            renderPuzzle();
            updatePuzzleProgressText();
        }
    }

    // --- Application Logic ---

    // Set Random Encouraging Quote
    function setRandomQuote() {
        const quotes = i18n[currentLang].quotes;
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];
        dailyQuote.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = `- ${quote.author}`;
    }

    // Word Count Calculation
    function updateWordCount() {
        const text = essayInput.value.trim();
        const langData = i18n[currentLang];

        let wordCountWord = langData.word;
        if (!text) {
            wordCountDisplay.innerHTML = `0 <span>${langData.words}</span>`;
            return;
        }
        // Count words using regex to match word characters
        const wordArray = text.match(/\b\w+\b/g);
        const count = wordArray ? wordArray.length : 0;

        if (currentLang === 'en') {
            wordCountWord = count === 1 ? langData.word : langData.words;
        } else {
            wordCountWord = langData.words;
        }

        wordCountDisplay.innerHTML = `${count} <span>${wordCountWord}</span>`;
    }

    // Save Essay to History (LocalStorage)
    function saveToHistory(text) {
        if (!text.trim()) return;

        const historyData = localStorage.getItem(HISTORY_KEY);
        let history = [];
        try {
            history = historyData ? JSON.parse(historyData) : [];
        } catch (e) {
            history = [];
        }

        // Add new note at the beginning
        history.unshift({
            id: Date.now().toString(),
            text: text,
            date: new Date().toISOString()
        });

        // Limit to 50 notes history
        if (history.length > 50) {
            history = history.slice(0, 50);
        }

        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        loadHistory();
    }

    // Load History from LocalStorage
    function loadHistory() {
        const historyData = localStorage.getItem(HISTORY_KEY);
        const langData = i18n[currentLang];
        let history = [];
        try {
            history = historyData ? JSON.parse(historyData) : [];
        } catch (e) {
            history = [];
        }

        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = `<div class="history-empty">${langData.noNotes}</div>`;
            return;
        }

        history.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'history-item';

            const dateObj = new Date(item.date);
            const dateStr = dateObj.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'zh-CN', {
                year: 'numeric', month: 'short', day: 'numeric'
            }) + ' ' + dateObj.toLocaleTimeString(currentLang === 'en' ? 'en-US' : 'zh-CN', {
                hour: '2-digit', minute: '2-digit'
            });

            div.innerHTML = `
                <div class="history-date">${dateStr}</div>
                <div class="history-preview">${escapeHtml(item.text)}</div>
            `;

            // Allow clicking to load old essay
            div.addEventListener('click', () => {
                essayInput.value = item.text;
                updateWordCount();
                // Scroll back to editor
                essayInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });

            historyList.appendChild(div);
        });
    }

    // Mock Grammar Analysis Logic
    function analyzeEssay(text) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const langData = i18n[currentLang];
                const feedback = [];
                const words = text.match(/\b\w+\b/g) || [];

                // 1. Check length
                if (words.length < 15) {
                    feedback.push({
                        type: langData.fb_length_short_title,
                        text: langData.fb_length_short_text
                    });
                } else if (words.length > 300) {
                    feedback.push({
                        type: langData.fb_length_good_title,
                        text: langData.fb_length_good_text
                    });
                } else {
                    feedback.push({
                        type: langData.fb_length_normal_title,
                        text: langData.fb_length_normal_text
                    });
                }

                // 2. Check capitalization
                const lowercaseStarts = text.match(/(^[a-z]|\.\s+[a-z])/g);
                if (lowercaseStarts) {
                    feedback.push({
                        type: langData.fb_cap_title,
                        text: langData.fb_cap_text
                    });
                }

                // 3. Mock logic
                const lowerText = text.toLowerCase();
                if (lowerText.includes("i am go ")) {
                    feedback.push({
                        type: langData.fb_grammar_title,
                        text: langData.fb_grammar_text
                    });
                }
                if (lowerText.match(/\b(very|really|so)\b/)) {
                    feedback.push({
                        type: langData.fb_vocab_title,
                        text: langData.fb_vocab_text
                    });
                }

                // 4. General advice
                feedback.push({
                    type: langData.fb_advice_title,
                    text: langData.fb_advice_text
                });

                resolve(feedback);
            }, 1200); // 1.2s delay to simulate analysis
        });
    }

    // Utility: Escape HTML
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Event Listeners
    essayInput.addEventListener('input', updateWordCount);

    clearBtn.addEventListener('click', () => {
        essayInput.value = '';
        updateWordCount();
        resultsSection.classList.add('hidden');
    });

    clearHistoryBtn.addEventListener('click', () => {
        if (confirm(i18n[currentLang].confirmClearHistory)) {
            localStorage.removeItem(HISTORY_KEY);
            loadHistory();
        }
    });

    submitBtn.addEventListener('click', async () => {
        const text = essayInput.value.trim();
        const langData = i18n[currentLang];

        if (!text) {
            alert(langData.alertEmpty);
            essayInput.focus();
            return;
        }

        // Setup UI for loading
        resultsSection.classList.remove('hidden');
        analysisContent.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');

        // Setup Button state
        submitBtn.disabled = true;
        submitBtn.textContent = langData.processingBtn;

        // Update random quote
        setRandomQuote();

        // Perform analysis
        const feedbacks = await analyzeEssay(text);

        // Save to History
        saveToHistory(text);

        // Unlock a Puzzle Piece!
        await unlockPuzzlePiece();

        // Render Results
        loadingSpinner.classList.add('hidden');
        grammarFeedback.innerHTML = '';

        feedbacks.forEach(fb => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${fb.type}</strong> ${fb.text}`;
            grammarFeedback.appendChild(li);
        });

        analysisContent.classList.remove('hidden');

        // Reset Button state
        submitBtn.disabled = false;
        submitBtn.textContent = langData.analyzeBtn;

        // Scroll gracefully down to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // Initial Setup
    updateLanguage();
    initPuzzle();
});
