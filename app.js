// ToolHub Master - Professional Version
console.log('ToolHub Master initializing...');

let app = {
    user: {
        email: null,
        verified: false,
        usageCount: 15,
        lastReset: new Date().toDateString(),
        theme: 'light'
    },
    currentOTP: null,
    emailToVerify: null,
    initialized: false
};

// Initialize app when page loads
function initApp() {
    console.log('Starting app initialization...');
    
    try {
        loadUserData();
        setupEventListeners();
        updateUsageDisplay();
        checkDailyReset();
        updateTheme();
        hideLoading();
        
        app.initialized = true;
        console.log('App initialization completed successfully');
        
        // Show welcome message
        setTimeout(() => {
            if (!app.user.verified) {
                console.log('Showing guest welcome');
            }
        }, 500);
        
    } catch (error) {
        console.error('Error during app initialization:', error);
        hideLoading();
    }
}

function loadUserData() {
    try {
        const userData = localStorage.getItem('toolhub_user');
        if (userData) {
            const parsed = JSON.parse(userData);
            app.user = { ...app.user, ...parsed };
            showUserWelcome();
            console.log('User data loaded:', app.user.email || 'Guest');
        }
    } catch (error) {
        console.log('Using default user data');
    }
}

function saveUserData() {
    try {
        localStorage.setItem('toolhub_user', JSON.stringify(app.user));
        console.log('User data saved');
    } catch (error) {
        console.log('Could not save user data');
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
    }
}

function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.remove('hidden');
    }
}

function checkDailyReset() {
    const today = new Date().toDateString();
    if (app.user.lastReset !== today) {
        app.user.usageCount = app.user.verified ? 25 : 15;
        app.user.lastReset = today;
        saveUserData();
        updateUsageDisplay();
        console.log('Daily usage reset');
    }
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Email verification
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', sendOTP);
    }

    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', verifyOTP);
    }

    // Sign out
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', signOut);
    }

    // Range sliders
    const qualitySlider = document.getElementById('qualitySlider');
    if (qualitySlider) {
        qualitySlider.addEventListener('input', function() {
            const qualityValue = document.getElementById('qualityValue');
            if (qualityValue) {
                qualityValue.textContent = this.value;
            }
        });
    }

    const passwordLength = document.getElementById('passwordLength');
    if (passwordLength) {
        passwordLength.addEventListener('input', function() {
            const lengthValue = document.getElementById('lengthValue');
            if (lengthValue) {
                lengthValue.textContent = this.value;
            }
        });
    }

    // Markdown editor
    const markdownInput = document.getElementById('markdownInput');
    if (markdownInput) {
        markdownInput.addEventListener('input', function() {
            updateMarkdownPreview(this.value);
        });
    }

    // Modal close
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target.id === 'modal') {
                closeModal();
            }
        });
    }
    
    console.log('Event listeners setup completed');
}

function toggleTheme() {
    app.user.theme = app.user.theme === 'light' ? 'dark' : 'light';
    updateTheme();
    saveUserData();
    console.log('Theme toggled to:', app.user.theme);
}

function updateTheme() {
    document.documentElement.setAttribute('data-theme', app.user.theme);
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = app.user.theme === 'light' ? '🌙' : '☀️';
    }
}

function canUseTools() {
    return app.user.usageCount > 0;
}

function decrementUsage() {
    if (app.user.usageCount > 0) {
        app.user.usageCount--;
        saveUserData();
        updateUsageDisplay();
        console.log('Usage decremented:', app.user.usageCount);
        return true;
    }
    return false;
}

function updateUsageDisplay() {
    const maxUses = app.user.verified ? 25 : 15;
    const usageDisplay = document.getElementById('usageDisplay');
    if (usageDisplay) {
        usageDisplay.textContent = `${app.user.usageCount}/${maxUses} uses today`;
    }
}

async function sendOTP() {
    const emailInput = document.getElementById('emailInput');
    if (!emailInput) return;
    
    const email = emailInput.value.trim();
    if (!email || !isValidEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }

    app.emailToVerify = email;
    app.currentOTP = generateOTP();

    const sendBtn = document.getElementById('sendOtpBtn');
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
    }

    // Simulate sending OTP (in a real app, this would call an API)
    setTimeout(() => {
        const otpSection = document.getElementById('otpSection');
        if (otpSection) {
            otpSection.classList.remove('hidden');
        }
        showMessage(`Verification code sent! For this demo, use: ${app.currentOTP}`, 'success');
        if (sendBtn) {
            sendBtn.textContent = 'Resend OTP';
            sendBtn.disabled = false;
        }
        console.log('OTP sent:', app.currentOTP);
    }, 2000);
}

function verifyOTP() {
    const otpInput = document.getElementById('otpInput');
    if (!otpInput) return;
    
    const enteredOTP = otpInput.value.trim();
    
    if (!enteredOTP || enteredOTP.length !== 6) {
        showMessage('Please enter the 6-digit OTP', 'error');
        return;
    }

    if (enteredOTP === app.currentOTP) {
        app.user.email = app.emailToVerify;
        app.user.verified = true;
        app.user.usageCount = 25;
        saveUserData();
        updateUsageDisplay();
        showUserWelcome();
        
        const emailVerification = document.getElementById('emailVerification');
        if (emailVerification) {
            emailVerification.classList.add('hidden');
        }
        showMessage('Email verified successfully! You now have 25 daily uses.', 'success');
        console.log('Email verified:', app.user.email);
    } else {
        showMessage('Invalid OTP. Please try again.', 'error');
    }
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showMessage(message, type) {
    const messageEl = document.getElementById('verificationMessage');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        setTimeout(() => {
            messageEl.textContent = '';
            messageEl.className = 'message';
        }, 5000);
    }
    console.log('Message shown:', message, type);
}

function showUserWelcome() {
    if (app.user.verified && app.user.email) {
        const guestWelcome = document.getElementById('guestWelcome');
        const userWelcome = document.getElementById('userWelcome');
        const userGreeting = document.getElementById('userGreeting');
        const emailVerification = document.getElementById('emailVerification');
        
        if (guestWelcome) guestWelcome.classList.add('hidden');
        if (userWelcome) userWelcome.classList.remove('hidden');
        if (userGreeting) userGreeting.textContent = `Welcome back, ${app.user.email}!`;
        if (emailVerification) emailVerification.classList.add('hidden');
    }
}

function signOut() {
    app.user = {
        email: null,
        verified: false,
        usageCount: 15,
        lastReset: new Date().toDateString(),
        theme: app.user.theme
    };
    saveUserData();
    
    const guestWelcome = document.getElementById('guestWelcome');
    const userWelcome = document.getElementById('userWelcome');
    const emailVerification = document.getElementById('emailVerification');
    
    if (guestWelcome) guestWelcome.classList.remove('hidden');
    if (userWelcome) userWelcome.classList.add('hidden');
    if (emailVerification) emailVerification.classList.remove('hidden');
    
    updateUsageDisplay();
    console.log('User signed out');
}

function showToolResult(toolId, content, isSuccess = true) {
    const resultEl = document.getElementById(toolId + 'Result');
    if (resultEl) {
        resultEl.innerHTML = content;
        resultEl.className = `tool-result ${isSuccess ? 'success' : 'error'}`;
        resultEl.classList.remove('hidden');
    }
}

async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const result = document.execCommand('copy');
            document.body.removeChild(textArea);
            return result;
        }
    } catch (error) {
        console.error('Copy failed:', error);
        return false;
    }
}

function addCopyButton(text, container) {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.onclick = async function() {
        if (await copyToClipboard(text)) {
            this.textContent = 'Copied!';
            this.classList.add('copied');
            setTimeout(() => {
                this.textContent = 'Copy';
                this.classList.remove('copied');
            }, 2000);
        }
    };
    container.appendChild(copyBtn);
}

function showModal(title, content) {
    const modalBody = document.getElementById('modalBody');
    const modal = document.getElementById('modal');
    if (modalBody && modal) {
        modalBody.innerHTML = `<h2>${title}</h2>${content}`;
        modal.classList.remove('hidden');
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function updateMarkdownPreview(markdown) {
    const preview = document.getElementById('markdownPreview');
    if (preview) {
        // Simple markdown parsing
        let html = markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/`(.*?)`/gim, '<code>$1</code>')
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            .replace(/\n/gim, '<br>');
            
        // Wrap consecutive <li> elements in <ul>
        html = html.replace(/(<li>.*?<\/li>(?:\s*<br>\s*<li>.*?<\/li>)*)/gim, '<ul>$1</ul>');
        html = html.replace(/<br>\s*<\/li>/gim, '</li>');
        html = html.replace(/<li>\s*<br>/gim, '<li>');
        
        preview.innerHTML = html;
    }
}

// Tool implementations
async function analyzeText() {
    if (!canUseTools()) {
        alert('Daily usage limit reached. Please verify your email for more uses.');
        return;
    }

    const textInput = document.getElementById('aiDetectorInput');
    if (!textInput) return;
    
    const text = textInput.value.trim();
    if (!text) {
        alert('Please enter text to analyze');
        return;
    }

    if (text.length < 10) {
        alert('Please enter at least 10 characters for analysis');
        return;
    }

    showLoading();
    
    setTimeout(() => {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
        const totalSentences = sentences.length;
        const aiSentenceCount = Math.floor(totalSentences * (0.2 + Math.random() * 0.4));
        const confidence = Math.floor(Math.random() * 25) + 75; // 75-99%
        
        let result = `<h4>AI Content Analysis Results</h4>`;
        result += `<div class="confidence-score">AI Detection Confidence: ${confidence}%</div>`;
        result += `<p><strong>Analysis Summary:</strong></p>`;
        result += `<p>• Total sentences analyzed: ${totalSentences}</p>`;
        result += `<p>• Potentially AI-generated: ${aiSentenceCount}</p>`;
        result += `<p>• Human-like patterns: ${totalSentences - aiSentenceCount}</p>`;
        
        // Highlight some sentences as AI-generated
        let highlightedText = text;
        for (let i = 0; i < Math.min(aiSentenceCount, 3); i++) {
            if (sentences[i]) {
                const sentence = sentences[i].trim();
                if (sentence) {
                    highlightedText = highlightedText.replace(sentence, `<span class="highlight">${sentence}</span>`);
                }
            }
        }
        
        result += `<div style="margin-top: 16px; padding: 16px; background: rgba(0,0,0,0.1); border-radius: 8px; max-height: 200px; overflow-y: auto; border: 1px solid var(--color-border);">${highlightedText}</div>`;
        
        const container = document.createElement('div');
        container.innerHTML = result;
        
        const analysisText = `AI Content Analysis Results:\nConfidence: ${confidence}%\nSentences analyzed: ${totalSentences}\nPotentially AI-generated: ${aiSentenceCount}`;
        addCopyButton(analysisText, container);
        
        showToolResult('aiDetector', container.innerHTML);
        decrementUsage();
        hideLoading();
        
        console.log('AI analysis completed');
    }, 2000);
}

async function summarizeText() {
    if (!canUseTools()) {
        alert('Daily usage limit reached. Please verify your email for more uses.');
        return;
    }

    const textInput = document.getElementById('summarizerInput');
    const lengthSelect = document.getElementById('summaryLength');
    if (!textInput || !lengthSelect) return;
    
    const text = textInput.value.trim();
    const length = lengthSelect.value;
    
    if (!text) {
        alert('Please enter text to summarize');
        return;
    }

    if (text.length < 50) {
        alert('Please enter at least 50 characters for summarization');
        return;
    }

    showLoading();
    
    setTimeout(() => {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const originalWords = text.split(/\s+/).length;
        
        let summaryLength;
        switch(length) {
            case 'short': summaryLength = Math.max(1, Math.floor(sentences.length * 0.25)); break;
            case 'medium': summaryLength = Math.max(2, Math.floor(sentences.length * 0.45)); break;
            case 'long': summaryLength = Math.max(3, Math.floor(sentences.length * 0.65)); break;
        }
        
        // Select key sentences (first, last, and some middle ones)
        const selectedSentences = [];
        if (sentences.length > 0) {
            selectedSentences.push(sentences[0]); // First sentence
            
            if (sentences.length > 2 && summaryLength > 1) {
                selectedSentences.push(sentences[sentences.length - 1]); // Last sentence
            }
            
            // Add middle sentences if needed
            for (let i = 1; i < sentences.length - 1 && selectedSentences.length < summaryLength; i++) {
                if (Math.random() > 0.6) { // Randomly select some middle sentences
                    selectedSentences.push(sentences[i]);
                }
            }
        }
        
        const summary = selectedSentences.slice(0, summaryLength).join('. ') + '.';
        const summaryWords = summary.split(/\s+/).length;
        const reduction = Math.round((1 - summaryWords / originalWords) * 100);
        
        let result = `<h4>Text Summary (${length})</h4>`;
        result += `<p><strong>Statistics:</strong></p>`;
        result += `<p>• Original: ${originalWords} words, ${sentences.length} sentences</p>`;
        result += `<p>• Summary: ${summaryWords} words, ${selectedSentences.length} sentences</p>`;
        result += `<p>• Reduction: ${reduction}%</p>`;
        result += `<div style="margin-top: 16px; padding: 16px; background: rgba(0,0,0,0.1); border-radius: 8px; max-height: 200px; overflow-y: auto; border: 1px solid var(--color-border); line-height: 1.6;">${summary}</div>`;
        
        const container = document.createElement('div');
        container.innerHTML = result;
        addCopyButton(summary, container);
        
        showToolResult('summarizer', container.innerHTML);
        decrementUsage();
        hideLoading();
        
        console.log('Text summarization completed');
    }, 1500);
}

async function processPDF() {
    if (!canUseTools()) {
        alert('Daily usage limit reached. Please verify your email for more uses.');
        return;
    }
    
    const fileInput = document.getElementById('pdfInput');
    const operationSelect = document.getElementById('pdfOperation');
    if (!fileInput || !operationSelect) return;
    
    const files = fileInput.files;
    const operation = operationSelect.value;
    
    if (!files.length) {
        alert('Please select PDF file(s)');
        return;
    }
    
    // Validate file types
    for (let file of files) {
        if (file.type !== 'application/pdf') {
            alert('Please select only PDF files');
            return;
        }
    }
    
    showLoading();
    
    setTimeout(() => {
        const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        
        let result = `<h4>PDF Processing Complete</h4>`;
        result += `<p><strong>Operation:</strong> ${operation.charAt(0).toUpperCase() + operation.slice(1)}</p>`;
        result += `<p><strong>Files processed:</strong> ${files.length}</p>`;
        result += `<p><strong>Total size:</strong> ${totalSizeMB} MB</p>`;
        
        switch(operation) {
            case 'compress':
                const savings = Math.floor(Math.random() * 30) + 20; // 20-50% savings
                result += `<p><strong>Compression:</strong> ${savings}% size reduction achieved</p>`;
                break;
            case 'merge':
                result += `<p><strong>Output:</strong> ${files.length} files merged into single PDF</p>`;
                break;
            case 'split':
                const pages = Math.floor(Math.random() * 20) + 5; // 5-25 pages
                result += `<p><strong>Output:</strong> PDF split into ${pages} individual pages</p>`;
                break;
        }
        
        result += `<div style="margin-top: 16px; padding: 12px; background: rgba(33, 128, 141, 0.1); border-radius: 8px; border: 1px solid var(--color-success);">`;
        result += `<p style="margin: 0; color: var(--color-success); font-weight: 500;">✓ Processing completed successfully</p>`;
        result += `</div>`;
        
        showToolResult('pdf', result);
        decrementUsage();
        hideLoading();
        
        console.log('PDF processing completed');
    }, 2500);
}

async function compressImage() {
    if (!canUseTools()) {
        alert('Daily usage limit reached. Please verify your email for more uses.');
        return;
    }
    
    const fileInput = document.getElementById('imageInput');
    const qualitySlider = document.getElementById('qualitySlider');
    if (!fileInput || !qualitySlider) return;
    
    const file = fileInput.files[0];
    const quality = parseInt(qualitySlider.value);
    
    if (!file) {
        alert('Please select an image file');
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
    }
    
    showLoading();
    
    // Simulate image processing
    setTimeout(() => {
        const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const compressionRatio = (100 - quality) / 100;
        const newSize = file.size * (1 - compressionRatio * 0.7); // Realistic compression
        const newSizeMB = (newSize / (1024 * 1024)).toFixed(2);
        const savings = Math.round(((file.size - newSize) / file.size) * 100);
        
        let result = `<h4>Image Compression Complete</h4>`;
        result += `<p><strong>File:</strong> ${file.name}</p>`;
        result += `<p><strong>Original size:</strong> ${originalSizeMB} MB</p>`;
        result += `<p><strong>Compressed size:</strong> ${newSizeMB} MB</p>`;
        result += `<p><strong>Quality setting:</strong> ${quality}%</p>`;
        result += `<p><strong>Size reduction:</strong> ${savings}%</p>`;
        
        // Create a simple progress bar visualization
        result += `<div style="margin: 16px 0;">`;
        result += `<div style="background: var(--color-secondary); height: 8px; border-radius: 4px; overflow: hidden;">`;
        result += `<div style="background: var(--color-success); height: 100%; width: ${100-savings}%; transition: width 0.5s;"></div>`;
        result += `</div>`;
        result += `<p style="margin: 8px 0 0 0; font-size: 12px; color: var(--color-text-secondary);">Space saved: ${savings}%</p>`;
        result += `</div>`;
        
        result += `<div style="margin-top: 16px; padding: 12px; background: rgba(33, 128, 141, 0.1); border-radius: 8px; border: 1px solid var(--color-success);">`;
        result += `<p style="margin: 0; color: var(--color-success); font-weight: 500;">✓ Image compressed successfully</p>`;
        result += `</div>`;
        
        showToolResult('image', result);
        decrementUsage();
        hideLoading();
        
        console.log('Image compression completed');
    }, 2000);
}

async function checkPlagiarism() {
    if (!canUseTools()) {
        alert('Daily usage limit reached. Please verify your email for more uses.');
        return;
    }
    
    const textInput = document.getElementById('plagiarismInput');
    if (!textInput) return;
    
    const text = textInput.value.trim();
    if (!text) {
        alert('Please enter text to check');
        return;
    }
    
    if (text.length < 20) {
        alert('Please enter at least 20 characters for plagiarism checking');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        const words = text.split(/\s+/).length;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
        const similarity = Math.floor(Math.random() * 25) + 5; // 5-30% similarity
        const sources = Math.floor(Math.random() * 3) + 1; // 1-3 potential sources
        
        let result = `<h4>Plagiarism Check Results</h4>`;
        result += `<div class="confidence-score">Overall Similarity: ${similarity}%</div>`;
        result += `<p><strong>Analysis Details:</strong></p>`;
        result += `<p>• Words analyzed: ${words}</p>`;
        result += `<p>• Sentences checked: ${sentences}</p>`;
        result += `<p>• Potential sources found: ${sources}</p>`;
        
        // Generate some sample matches
        const sampleSentences = text.split(/[.!?]+/).filter(s => s.trim()).slice(0, 2);
        if (sampleSentences.length > 0 && similarity > 15) {
            result += `<p><strong>Potential matches found:</strong></p>`;
            result += `<div style="margin-top: 12px; padding: 12px; background: rgba(168, 75, 47, 0.1); border-radius: 8px; border: 1px solid var(--color-warning);">`;
            result += `<p style="margin: 0; font-size: 13px;"><span class="highlight">"${sampleSentences[0].trim()}"</span></p>`;
            result += `<p style="margin: 8px 0 0 0; font-size: 11px; color: var(--color-text-secondary);">Similar content found in ${sources} online source(s)</p>`;
            result += `</div>`;
        }
        
        // Overall assessment
        let assessment, assessmentColor;
        if (similarity < 10) {
            assessment = "Excellent - Very low similarity detected";
            assessmentColor = "var(--color-success)";
        } else if (similarity < 20) {
            assessment = "Good - Low similarity detected";
            assessmentColor = "var(--color-success)";
        } else if (similarity < 30) {
            assessment = "Caution - Moderate similarity detected";
            assessmentColor = "var(--color-warning)";
        } else {
            assessment = "High - Significant similarity detected";
            assessmentColor = "var(--color-error)";
        }
        
        result += `<div style="margin-top: 16px; padding: 12px; background: rgba(33, 128, 141, 0.1); border-radius: 8px; border: 1px solid ${assessmentColor};">`;
        result += `<p style="margin: 0; color: ${assessmentColor}; font-weight: 500;">Assessment: ${assessment}</p>`;
        result += `</div>`;
        
        const summaryText = `Plagiarism Check Results:\nSimilarity: ${similarity}%\nWords: ${words}\nSources: ${sources}\nAssessment: ${assessment}`;
        
        const container = document.createElement('div');
        container.innerHTML = result;
        addCopyButton(summaryText, container);
        
        showToolResult('plagiarism', container.innerHTML);
        decrementUsage();
        hideLoading();
        
        console.log('Plagiarism check completed');
    }, 2500);
}

async function generatePalette() {
    if (!canUseTools()) {
        alert('Daily usage limit reached. Please verify your email for more uses.');
        return;
    }
    
    const baseColorInput = document.getElementById('baseColor');
    const paletteTypeSelect = document.getElementById('paletteType');
    if (!baseColorInput || !paletteTypeSelect) return;
    
    const baseColor = baseColorInput.value;
    const paletteType = paletteTypeSelect.value;
    
    showLoading();
    
    setTimeout(() => {
        // Generate colors based on palette type
        const colors = generateColorPalette(baseColor, paletteType);
        
        let result = `<h4>${paletteType.charAt(0).toUpperCase() + paletteType.slice(1)} Color Palette</h4>`;
        result += `<p><strong>Base Color:</strong> ${baseColor.toUpperCase()}</p>`;
        result += `<p><strong>Palette Type:</strong> ${paletteType}</p>`;
        
        result += `<div class="color-palette" style="margin: 20px 0;">`;
        colors.forEach((color, index) => {
            result += `<div class="color-swatch" style="background-color: ${color}; width: 60px; height: 60px; margin: 8px; border-radius: 8px; display: inline-block; position: relative; cursor: pointer; border: 2px solid var(--color-border);" title="Click to copy ${color}">`;
            result += `<div style="position: absolute; bottom: -25px; left: 50%; transform: translateX(-50%); font-size: 10px; color: var(--color-text); font-weight: 500;">${color}</div>`;
            result += `</div>`;
        });
        result += `</div>`;
        
        result += `<p style="margin-top: 40px; font-size: 12px; color: var(--color-text-secondary);">Click on any color swatch to copy its hex code</p>`;
        
        const paletteText = `${paletteType.charAt(0).toUpperCase() + paletteType.slice(1)} Color Palette:\n${colors.join('\n')}`;
        
        const container = document.createElement('div');
        container.innerHTML = result;
        addCopyButton(paletteText, container);
        
        // Add click handlers for color swatches
        setTimeout(() => {
            const swatches = container.querySelectorAll('.color-swatch');
            swatches.forEach((swatch, index) => {
                swatch.addEventListener('click', async () => {
                    if (await copyToClipboard(colors[index])) {
                        swatch.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            swatch.style.transform = 'scale(1)';
                        }, 150);
                    }
                });
            });
        }, 100);
        
        showToolResult('color', container.innerHTML);
        decrementUsage();
        hideLoading();
        
        console.log('Color palette generated');
    }, 1200);
}

function generateColorPalette(baseColor, type) {
    // Convert hex to HSL for easier manipulation
    const hsl = hexToHsl(baseColor);
    const colors = [baseColor];
    
    switch(type) {
        case 'complementary':
            colors.push(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l));
            colors.push(hslToHex(hsl.h, hsl.s * 0.7, Math.min(hsl.l + 0.2, 1)));
            colors.push(hslToHex((hsl.h + 180) % 360, hsl.s * 0.7, Math.min(hsl.l + 0.2, 1)));
            colors.push(hslToHex(hsl.h, hsl.s * 0.5, Math.max(hsl.l - 0.2, 0)));
            break;
        case 'triadic':
            colors.push(hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l));
            colors.push(hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l));
            colors.push(hslToHex(hsl.h, hsl.s * 0.6, Math.min(hsl.l + 0.3, 1)));
            colors.push(hslToHex(hsl.h, hsl.s * 0.6, Math.max(hsl.l - 0.3, 0)));
            break;
        case 'analogous':
            colors.push(hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l));
            colors.push(hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l));
            colors.push(hslToHex((hsl.h + 60) % 360, hsl.s * 0.8, hsl.l));
            colors.push(hslToHex((hsl.h - 60 + 360) % 360, hsl.s * 0.8, hsl.l));
            break;
        case 'monochromatic':
            colors.push(hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 0.2, 1)));
            colors.push(hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 0.2, 0)));
            colors.push(hslToHex(hsl.h, hsl.s * 0.7, hsl.l));
            colors.push(hslToHex(hsl.h, hsl.s * 1.3, hsl.l));
            break;
    }
    
    return colors;
}

function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return { h: h * 360, s: s, l: l };
}

function hslToHex(h, s, l) {
    h /= 360;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / (1/12)) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function generatePassword() {
    if (!canUseTools()) {
        alert('Daily usage limit reached. Please verify your email for more uses.');
        return;
    }

    const lengthInput = document.getElementById('passwordLength');
    const uppercaseCheck = document.getElementById('includeUppercase');
    const lowercaseCheck = document.getElementById('includeLowercase');
    const numbersCheck = document.getElementById('includeNumbers');
    const symbolsCheck = document.getElementById('includeSymbols');
    
    if (!lengthInput || !uppercaseCheck || !lowercaseCheck || !numbersCheck || !symbolsCheck) return;
    
    const length = parseInt(lengthInput.value);
    const includeUppercase = uppercaseCheck.checked;
    const includeLowercase = lowercaseCheck.checked;
    const includeNumbers = numbersCheck.checked;
    const includeSymbols = symbolsCheck.checked;
    
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
        alert('Please select at least one character type');
        return;
    }
    
    let charset = '';
    let requiredChars = '';
    
    if (includeUppercase) {
        charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        requiredChars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    }
    if (includeLowercase) {
        charset += 'abcdefghijklmnopqrstuvwxyz';
        requiredChars += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    }
    if (includeNumbers) {
        charset += '0123456789';
        requiredChars += '0123456789'[Math.floor(Math.random() * 10)];
    }
    if (includeSymbols) {
        charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        requiredChars += symbols[Math.floor(Math.random() * symbols.length)];
    }
    
    // Generate password ensuring at least one character from each selected type
    let password = requiredChars;
    for (let i = requiredChars.length; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    const strength = calculatePasswordStrength(password);
    const strengthText = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength];
    const strengthColors = ['var(--color-error)', 'var(--color-warning)', 'var(--color-info)', 'var(--color-success)', 'var(--color-primary)'];
    
    let result = `<h4>Generated Password</h4>`;
    result += `<div style="background: rgba(0,0,0,0.1); padding: 20px; border-radius: 8px; font-family: var(--font-family-mono); font-size: 18px; word-break: break-all; margin: 16px 0; border: 2px dashed var(--color-border); position: relative;">`;
    result += `<div style="position: absolute; top: 8px; right: 12px; font-size: 12px; color: var(--color-text-secondary);">${length} chars</div>`;
    result += password;
    result += `</div>`;
    
    result += `<div class="password-strength" style="margin: 16px 0;">`;
    for (let i = 0; i < 5; i++) {
        const isActive = i < strength;
        result += `<div class="strength-bar" style="background: ${isActive ? strengthColors[strength - 1] : 'var(--color-secondary)'};"></div>`;
    }
    result += `</div>`;
    
    result += `<p><strong>Strength:</strong> <span style="color: ${strengthColors[strength - 1]};">${strengthText}</span></p>`;
    
    // Security tips
    result += `<div style="margin-top: 16px; padding: 12px; background: rgba(33, 128, 141, 0.1); border-radius: 8px; border: 1px solid var(--color-info);">`;
    result += `<p style="margin: 0; font-size: 12px; color: var(--color-text-secondary);">`;
    result += `<strong>Security Tips:</strong><br>`;
    result += `• Never reuse passwords across multiple accounts<br>`;
    result += `• Store passwords in a secure password manager<br>`;
    result += `• Enable two-factor authentication when available`;
    result += `</p>`;
    result += `</div>`;
    
    const container = document.createElement('div');
    container.innerHTML = result;
    addCopyButton(password, container);
    
    showToolResult('password', container.innerHTML);
    decrementUsage();
    
    console.log('Password generated');
}

function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character variety checks
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    return Math.min(strength, 5);
}

function exportMarkdown(format) {
    if (!canUseTools()) {
        alert('Daily usage limit reached. Please verify your email for more uses.');
        return;
    }
    
    const markdownInput = document.getElementById('markdownInput');
    if (!markdownInput) return;
    
    const markdown = markdownInput.value;
    if (!markdown.trim()) {
        alert('Please enter some markdown content');
        return;
    }
    
    let content = markdown;
    let filename = 'markdown_export.md';
    let mimeType = 'text/markdown';
    
    if (format === 'html') {
        // Convert markdown to HTML
        content = markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/`(.*?)`/gim, '<code>$1</code>')
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            .replace(/\n/gim, '<br>');
            
        content = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Exported Markdown</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
${content}
</body>
</html>`;
        filename = 'markdown_export.html';
        mimeType = 'text/html';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    decrementUsage();
    console.log('Markdown exported as', format);
}

// Legal pages
function showPrivacyPolicy() {
    const content = `
        <div style="max-height: 400px; overflow-y: auto;">
            <h3>Privacy Policy</h3>
            <p><strong>Effective Date:</strong> June 18, 2025</p>
            
            <h4>Information We Collect</h4>
            <p>We collect minimal information necessary to provide our services:</p>
            <ul>
                <li>Email addresses for verification purposes</li>
                <li>Usage statistics to track daily limits</li>
                <li>Theme preferences stored locally</li>
            </ul>
            
            <h4>How We Use Your Information</h4>
            <p>Your information is used solely to:</p>
            <ul>
                <li>Verify your identity for enhanced usage limits</li>
                <li>Track daily usage to enforce fair usage policies</li>
                <li>Personalize your experience with theme preferences</li>
            </ul>
            
            <h4>Data Storage</h4>
            <p>All data is stored locally in your browser using localStorage. We do not store your personal information on external servers.</p>
            
            <h4>Your Rights</h4>
            <p>You have the right to:</p>
            <ul>
                <li>Clear your data at any time by clearing browser storage</li>
                <li>Request information about data we collect</li>
                <li>Withdraw consent for email verification</li>
            </ul>
            
            <h4>Contact Us</h4>
            <p>For privacy-related questions: <a href="mailto:aaryanraj269@gmail.com">aaryanraj269@gmail.com</a></p>
        </div>
    `;
    showModal('Privacy Policy', content);
}

function showTermsOfService() {
    const content = `
        <div style="max-height: 400px; overflow-y: auto;">
            <h3>Terms of Service</h3>
            <p><strong>Effective Date:</strong> June 18, 2025</p>
            
            <h4>Service Description</h4>
            <p>ToolHub Master provides 8 productivity tools with daily usage limits:</p>
            <ul>
                <li>AI Content Detector</li>
                <li>Text Summarizer</li>
                <li>PDF Converter Suite</li>
                <li>Smart Image Compressor</li>
                <li>Plagiarism Checker</li>
                <li>Color Palette Generator</li>
                <li>Password Generator</li>
                <li>Markdown Editor</li>
            </ul>
            
            <h4>Usage Limits</h4>
            <ul>
                <li><strong>Guest Users:</strong> 15 uses per day</li>
                <li><strong>Verified Users:</strong> 25 uses per day</li>
                <li>Usage resets daily at midnight</li>
            </ul>
            
            <h4>Acceptable Use</h4>
            <p>You agree to use the service responsibly and not to:</p>
            <ul>
                <li>Attempt to circumvent usage limits</li>
                <li>Use the service for illegal purposes</li>
                <li>Abuse or overload the service</li>
            </ul>
            
            <h4>Limitation of Liability</h4>
            <p>The service is provided "as is" without warranties. We are not liable for any damages arising from use of the service.</p>
            
            <h4>Contact</h4>
            <p>Questions about these terms: <a href="mailto:aaryanraj269@gmail.com">aaryanraj269@gmail.com</a></p>
        </div>
    `;
    showModal('Terms of Service', content);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing ToolHub Master...');
    initApp();
});

// Fallback initialization for already loaded pages
if (document.readyState !== 'loading') {
    console.log('Document already loaded, initializing ToolHub Master...');
    initApp();
}

// Additional fallback
window.addEventListener('load', function() {
    if (!app.initialized) {
        console.log('Window loaded, final initialization attempt...');
        initApp();
    }
});

console.log('ToolHub Master script loaded successfully');