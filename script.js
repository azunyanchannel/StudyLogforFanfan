document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const essayInput = document.getElementById('essay-input');
    const wordCountDisplay = document.getElementById('word-count');
    const submitBtn = document.getElementById('submit-btn');
    const clearBtn = document.getElementById('clear-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    
    const resultsSection = document.getElementById('results-section');
    const loadingSpinner = document.getElementById('loading-spinner');
    const analysisContent = document.getElementById('analysis-content');
    const grammarFeedback = document.getElementById('grammar-feedback');
    
    const dailyQuote = document.getElementById('daily-quote');
    const quoteAuthor = document.getElementById('quote-author');
    const historyList = document.getElementById('history-list');

    // Inspirational Quotes Database
    const quotes = [
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Good writing is clear thinking made visible.", author: "William Wheeler" },
        { text: "You can make anything by writing.", author: "C.S. Lewis" },
        { text: "Words are, of course, the most powerful drug used by mankind.", author: "Rudyard Kipling" },
        { text: "Don't let what you cannot do interfere with what you can do.", author: "John Wooden" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "A professional writer is an amateur who didn't quit.", author: "Richard Bach" }
    ];

    // Local Storage Keys
    const HISTORY_KEY = 'lumina_essay_history';

    // Set Random Encouraging Quote
    function setRandomQuote() {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];
        dailyQuote.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = `- ${quote.author}`;
    }

    // Word Count Calculation
    function updateWordCount() {
        const text = essayInput.value.trim();
        if (!text) {
            wordCountDisplay.textContent = '0 words';
            return;
        }
        // Count words using regex to match word characters
        const wordArray = text.match(/\b\w+\b/g);
        const count = wordArray ? wordArray.length : 0;
        wordCountDisplay.textContent = `${count} word${count !== 1 ? 's' : ''}`;
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
        let history = [];
        try {
            history = historyData ? JSON.parse(historyData) : [];
        } catch (e) {
            history = [];
        }
        
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            historyList.innerHTML = '<div class="history-empty">No notes found. Start writing!</div>';
            return;
        }

        history.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            
            const dateObj = new Date(item.date);
            const dateStr = dateObj.toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric'
            }) + ' ' + dateObj.toLocaleTimeString(undefined, {
                hour: '2-digit', minute:'2-digit'
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
        // Return a Promise to simulate network request latency for the static template
        return new Promise((resolve) => {
            setTimeout(() => {
                const feedback = [];
                const words = text.match(/\b\w+\b/g) || [];
                
                // 1. Check length
                if (words.length < 15) {
                    feedback.push({
                        type: 'Length',
                        text: 'Your essay is quite short! Try to add more details and expand on your ideas.'
                    });
                } else if (words.length > 300) {
                    feedback.push({
                        type: 'Great Job',
                        text: 'Excellent length! Make sure your paragraphs are well structured and flow smoothly.'
                    });
                } else {
                    feedback.push({
                        type: 'Length',
                        text: 'Good start. Remember to include a clear introduction, body, and conclusion.'
                    });
                }

                // 2. Check capitalization
                const lowercaseStarts = text.match(/(^[a-z]|\.\s+[a-z])/g);
                if (lowercaseStarts) {
                    feedback.push({
                        type: 'Capitalization',
                        text: 'Remember to capitalize the first letter of each sentence.'
                    });
                }

                // 3. Mock logic for specific grammar mistakes
                const lowerText = text.toLowerCase();
                if (lowerText.includes("i am go ")) {
                    feedback.push({
                        type: 'Grammar',
                        text: 'Consider changing "I am go" to "I am going".'
                    });
                }
                if (lowerText.match(/\b(very|really|so)\b/)) {
                    feedback.push({
                        type: 'Vocabulary',
                        text: 'You used filler words like "very" or "really". Consider using stronger adjectives (e.g., "excellent" instead of "very good").'
                    });
                }

                // 4. General advice
                feedback.push({
                    type: 'Suggestion',
                    text: 'Vary your sentence structure by using transitional words like "furthermore", "however", or "in contrast".'
                });

                resolve(feedback);
            }, 1200); // 1.2s delay to simulate analysis processing
        });
    }

    // Utility: Escape HTML to avoid XSS in History preview
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
        if(confirm('Are you sure you want to clear all your writing history? This cannot be undone.')) {
            localStorage.removeItem(HISTORY_KEY);
            loadHistory();
        }
    });

    submitBtn.addEventListener('click', async () => {
        const text = essayInput.value.trim();
        if (!text) {
            alert('Please enter some text to analyze.');
            essayInput.focus();
            return;
        }

        // Setup UI for loading
        resultsSection.classList.remove('hidden');
        analysisContent.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
        
        // Setup Button state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        // Update random quote
        setRandomQuote();

        // Perform analysis (simulated delay)
        const feedbacks = await analyzeEssay(text);

        // Save to History after successful analysis
        saveToHistory(text);

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
        submitBtn.textContent = 'Analyze Essay';

        // Scroll gracefully down to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // Initial Setup
    setRandomQuote();
    loadHistory();
    updateWordCount();
});
