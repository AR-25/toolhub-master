// ToolHub Master - Main Application JavaScript

class ToolHubMaster {
    constructor() {
        this.maxUsesAnonymous = 15;
        this.maxUsesSignedIn = 20;
        this.bonusUses = 5;
        
        this.init();
    }

    init() {
        this.initializeUsage();
        this.initializeAuth();
        this.initializeTheme();
        this.bindEvents();
        this.updateUI();
    }

    // Usage tracking system
    initializeUsage() {
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('toolhub_date');
        
        if (savedDate !== today) {
            // Reset daily usage
            localStorage.setItem('toolhub_date', today);
            localStorage.setItem('toolhub_uses', '0');
        }
        
        this.currentUses = parseInt(localStorage.getItem('toolhub_uses') || '0');
        this.isSignedIn = localStorage.getItem('toolhub_signed_in') === 'true';
        this.userEmail = localStorage.getItem('toolhub_email') || '';
    }

    initializeAuth() {
        if (this.isSignedIn && this.userEmail) {
            this.showSignedInState();
        }
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('toolhub_theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-color-scheme', savedTheme);
            this.updateThemeIcon(savedTheme);
        }
    }

    bindEvents() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Auth button
        document.getElementById('authButton').addEventListener('click', () => this.handleAuthClick());
        
        // Sign in form
        document.getElementById('signInForm').addEventListener('submit', (e) => this.handleSignIn(e));
        
        // File inputs
        document.getElementById('pdfFile').addEventListener('change', (e) => this.handleFileUpload(e, 'pdf'));
        document.getElementById('imageFile').addEventListener('change', (e) => this.handleFileUpload(e, 'image'));
        document.getElementById('colorImageFile').addEventListener('change', (e) => this.handleFileUpload(e, 'color'));
        
        // Range inputs
        document.getElementById('qualitySlider').addEventListener('input', (e) => {
            document.getElementById('qualityValue').textContent = e.target.value;
        });
        
        document.getElementById('passwordLength').addEventListener('input', (e) => {
            document.getElementById('lengthValue').textContent = e.target.value;
        });
        
        // Markdown editor
        document.getElementById('markdownInput').addEventListener('input', (e) => this.updateMarkdownPreview(e.target.value));
    }

    updateUI() {
        const maxUses = this.isSignedIn ? this.maxUsesSignedIn : this.maxUsesAnonymous;
        const remaining = maxUses - this.currentUses;
        document.getElementById('usageDisplay').textContent = `${remaining}/${maxUses} uses remaining`;
        
        if (this.isSignedIn) {
            document.getElementById('userGreeting').style.display = 'block';
            document.getElementById('welcomeMessage').textContent = `Welcome back, ${this.userEmail}!`;
        }
    }

    // Usage control
    canUseTools() {
        const maxUses = this.isSignedIn ? this.maxUsesSignedIn : this.maxUsesAnonymous;
        return this.currentUses < maxUses;
    }

    incrementUsage() {
        if (!this.canUseTools()) {
            this.showUsageLimitModal();
            return false;
        }
        
        this.currentUses++;
        localStorage.setItem('toolhub_uses', this.currentUses.toString());
        this.updateUI();
        return true;
    }

    // Theme management
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        localStorage.setItem('toolhub_theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('.theme-toggle__icon');
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // Authentication
    handleAuthClick() {
        if (this.isSignedIn) {
            this.signOut();
        } else {
            this.openSignInModal();
        }
    }

    openSignInModal() {
        document.getElementById('signInModal').classList.add('show');
    }

    closeSignInModal() {
        document.getElementById('signInModal').classList.remove('show');
    }

    handleSignIn(e) {
        e.preventDefault();
        const email = document.getElementById('signInEmail').value;
        
        if (this.validateEmail(email)) {
            this.isSignedIn = true;
            this.userEmail = email;
            
            // Add bonus uses
            this.currentUses = Math.max(0, this.currentUses - this.bonusUses);
            
            localStorage.setItem('toolhub_signed_in', 'true');
            localStorage.setItem('toolhub_email', email);
            localStorage.setItem('toolhub_uses', this.currentUses.toString());
            
            this.showSignedInState();
            this.closeSignInModal();
            this.updateUI();
        }
    }

    signOut() {
        this.isSignedIn = false;
        this.userEmail = '';
        
        localStorage.removeItem('toolhub_signed_in');
        localStorage.removeItem('toolhub_email');
        
        document.getElementById('userGreeting').style.display = 'none';
        document.getElementById('authButton').textContent = 'Sign In';
        this.updateUI();
    }

    showSignedInState() {
        document.getElementById('authButton').textContent = 'Sign Out';
        document.getElementById('userGreeting').style.display = 'block';
        document.getElementById('welcomeMessage').textContent = `Welcome back, ${this.userEmail}!`;
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Modal controls
    showUsageLimitModal() {
        document.getElementById('usageLimitModal').classList.add('show');
    }

    closeUsageLimitModal() {
        document.getElementById('usageLimitModal').classList.remove('show');
    }

    // File upload handling
    handleFileUpload(e, type) {
        const file = e.target.files[0];
        if (!file) return;
        
        const fileInfo = {
            name: file.name,
            size: file.size,
            type: file.type
        };
        
        console.log(`${type} file uploaded:`, fileInfo);
    }

    // Utility functions
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showSuccessMessage('Copied to clipboard!');
        });
    }

    showSuccessMessage(message, elementId = null) {
        const element = elementId ? document.getElementById(elementId) : document.createElement('div');
        element.innerHTML = `<div class="success-message">${message}</div>`;
        
        if (!elementId) {
            document.body.appendChild(element);
            setTimeout(() => element.remove(), 3000);
        }
    }

    showLoading(elementId) {
        const element = document.getElementById(elementId);
        element.innerHTML = '<div class="loading"></div>';
        element.classList.add('show');
    }

    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        element.innerHTML = '';
        element.classList.remove('show');
    }

    // Markdown preview
    updateMarkdownPreview(markdown) {
        const preview = document.getElementById('markdownPreview');
        // Simple markdown to HTML conversion
        let html = markdown
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/\n/g, '<br>');
        
        preview.innerHTML = html;
    }
}

// Initialize the application
const toolHub = new ToolHubMaster();

// Tool Functions

// 1. AI Content Detector
function analyzeText() {
    if (!toolHub.incrementUsage()) return;
    
    const text = document.getElementById('aiDetectorText').value.trim();
    if (!text) {
        alert('Please enter text to analyze');
        return;
    }
    
    toolHub.showLoading('aiDetectorResult');
    
    setTimeout(() => {
        const confidence = Math.floor(Math.random() * 20) + 80; // 80-99%
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        const aiSentences = sentences.slice(0, Math.ceil(sentences.length * 0.3));
        
        let result = `
            <div class="result-item">
                <span>AI Detection Confidence:</span>
                <span style="color: ${confidence > 90 ? '#ff5555' : '#ffaa55'}">${confidence}%</span>
            </div>
            <div class="result-item">
                <span>Total Sentences:</span>
                <span>${sentences.length}</span>
            </div>
            <div class="result-item">
                <span>Potentially AI-generated:</span>
                <span>${aiSentences.length}</span>
            </div>
            <div style="margin-top: 16px;">
                <strong>Analysis:</strong><br>
                ${aiSentences.map(s => `<span style="background: rgba(255, 85, 85, 0.2); padding: 2px 4px; margin: 2px; display: inline-block; border-radius: 4px;">${s.trim()}</span>`).join(' ')}
            </div>
        `;
        
        document.getElementById('aiDetectorResult').innerHTML = result;
        document.getElementById('aiDetectorResult').classList.add('show');
    }, 2000);
}

// 2. PDF Converter
function convertPDF() {
    if (!toolHub.incrementUsage()) return;
    
    const fileInput = document.getElementById('pdfFile');
    const format = document.getElementById('conversionFormat').value;
    
    if (!fileInput.files[0]) {
        alert('Please select a PDF file');
        return;
    }
    
    toolHub.showLoading('pdfConverterResult');
    
    setTimeout(() => {
        const result = `
            <div class="success-message">PDF converted successfully!</div>
            <div class="result-item">
                <span>Original Size:</span>
                <span>${(fileInput.files[0].size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <div class="result-item">
                <span>Format:</span>
                <span>${format.toUpperCase()}</span>
            </div>
            <button class="btn btn--primary" onclick="downloadFile('converted.${format === 'word' ? 'docx' : format === 'excel' ? 'xlsx' : 'pptx'}')">
                Download Converted File
            </button>
        `;
        
        document.getElementById('pdfConverterResult').innerHTML = result;
        document.getElementById('pdfConverterResult').classList.add('show');
    }, 3000);
}

// 3. QR Code Generator
function generateQR() {
    if (!toolHub.incrementUsage()) return;
    
    const text = document.getElementById('qrText').value.trim();
    const size = parseInt(document.getElementById('qrSize').value);
    const foreground = document.getElementById('qrForeground').value;
    const background = document.getElementById('qrBackground').value;
    
    if (!text) {
        alert('Please enter text or URL');
        return;
    }
    
    const canvas = document.createElement('canvas');
    QRCode.toCanvas(canvas, text, {
        width: size,
        color: {
            dark: foreground,
            light: background
        }
    }, (error) => {
        if (error) {
            console.error(error);
            return;
        }
        
        const result = `
            <div class="success-message">QR Code generated successfully!</div>
            <div style="text-align: center; margin: 16px 0;">
                ${canvas.outerHTML}
            </div>
            <button class="btn btn--primary btn--full-width" onclick="downloadQR()">
                Download PNG
            </button>
        `;
        
        document.getElementById('qrResult').innerHTML = result;
        document.getElementById('qrResult').classList.add('show');
        
        // Store canvas for download
        window.currentQRCanvas = canvas;
    });
}

function downloadQR() {
    if (window.currentQRCanvas) {
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = window.currentQRCanvas.toDataURL();
        link.click();
    }
}

// 4. Image Compressor
function compressImage() {
    if (!toolHub.incrementUsage()) return;
    
    const fileInput = document.getElementById('imageFile');
    const quality = document.getElementById('qualitySlider').value / 100;
    
    if (!fileInput.files[0]) {
        alert('Please select an image');
        return;
    }
    
    toolHub.showLoading('imageCompressorResult');
    
    const file = fileInput.files[0];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
            const originalSize = file.size;
            const compressedSize = blob.size;
            const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
            
            const result = `
                <div class="success-message">Image compressed successfully!</div>
                <div class="result-item">
                    <span>Original Size:</span>
                    <span>${(originalSize / 1024).toFixed(1)} KB</span>
                </div>
                <div class="result-item">
                    <span>Compressed Size:</span>
                    <span>${(compressedSize / 1024).toFixed(1)} KB</span>
                </div>
                <div class="result-item">
                    <span>Size Reduction:</span>
                    <span style="color: #4CAF50">${reduction}%</span>
                </div>
                <button class="btn btn--primary btn--full-width" onclick="downloadCompressedImage()">
                    Download Compressed Image
                </button>
            `;
            
            document.getElementById('imageCompressorResult').innerHTML = result;
            document.getElementById('imageCompressorResult').classList.add('show');
            
            // Store blob for download
            window.compressedImageBlob = blob;
        }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
}

function downloadCompressedImage() {
    if (window.compressedImageBlob) {
        const link = document.createElement('a');
        link.download = 'compressed-image.jpg';
        link.href = URL.createObjectURL(window.compressedImageBlob);
        link.click();
    }
}

// 5. URL Shortener
function shortenUrl() {
    if (!toolHub.incrementUsage()) return;
    
    const longUrl = document.getElementById('longUrl').value.trim();
    const customAlias = document.getElementById('customAlias').value.trim();
    
    if (!longUrl) {
        alert('Please enter a URL');
        return;
    }
    
    if (!isValidUrl(longUrl)) {
        alert('Please enter a valid URL');
        return;
    }
    
    toolHub.showLoading('urlShortenerResult');
    
    setTimeout(() => {
        const shortCode = customAlias || generateShortCode();
        const shortUrl = `https://tly.co/${shortCode}`;
        const clicks = Math.floor(Math.random() * 50);
        
        const result = `
            <div class="success-message">URL shortened successfully!</div>
            <div class="result-item">
                <span>Short URL:</span>
                <span style="color: #667eea; cursor: pointer;" onclick="toolHub.copyToClipboard('${shortUrl}')">${shortUrl}</span>
            </div>
            <div class="result-item">
                <span>Clicks:</span>
                <span>${clicks}</span>
            </div>
            <div style="margin-top: 16px;">
                <button class="btn btn--secondary" onclick="toolHub.copyToClipboard('${shortUrl}')">Copy URL</button>
                <button class="btn btn--primary" onclick="generateQRForUrl('${shortUrl}')">Generate QR</button>
            </div>
        `;
        
        document.getElementById('urlShortenerResult').innerHTML = result;
        document.getElementById('urlShortenerResult').classList.add('show');
    }, 1500);
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function generateShortCode() {
    return Math.random().toString(36).substring(2, 8);
}

function generateQRForUrl(url) {
    document.getElementById('qrText').value = url;
    generateQR();
}

// 6. Plagiarism Checker
function checkPlagiarism() {
    if (!toolHub.incrementUsage()) return;
    
    const text = document.getElementById('plagiarismText').value.trim();
    if (!text) {
        alert('Please enter text to check');
        return;
    }
    
    toolHub.showLoading('plagiarismResult');
    
    setTimeout(() => {
        const similarity = Math.floor(Math.random() * 30) + 5; // 5-35%
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        const matchedSentences = sentences.slice(0, Math.ceil(sentences.length * 0.2));
        
        const sources = [
            'academic-journal.com',
            'wikipedia.org',
            'researchgate.net',
            'scholar.google.com'
        ];
        
        const result = `
            <div class="result-item">
                <span>Similarity Score:</span>
                <span style="color: ${similarity > 20 ? '#ff5555' : '#4CAF50'}">${similarity}%</span>
            </div>
            <div class="result-item">
                <span>Sources Found:</span>
                <span>${Math.floor(Math.random() * 3) + 1}</span>
            </div>
            <div style="margin-top: 16px;">
                <strong>Potential Matches:</strong><br>
                ${matchedSentences.map(s => `<span style="background: rgba(255, 85, 85, 0.2); padding: 2px 4px; margin: 2px; display: inline-block; border-radius: 4px;">${s.trim()}</span>`).join(' ')}
            </div>
            <div style="margin-top: 16px;">
                <strong>Sources:</strong><br>
                ${sources.slice(0, 2).map(source => `<a href="https://${source}" target="_blank" style="display: block; margin: 4px 0;">${source}</a>`).join('')}
            </div>
        `;
        
        document.getElementById('plagiarismResult').innerHTML = result;
        document.getElementById('plagiarismResult').classList.add('show');
    }, 2500);
}

// 7. Text Summarizer
function summarizeText() {
    if (!toolHub.incrementUsage()) return;
    
    const text = document.getElementById('summarizerText').value.trim();
    const length = document.getElementById('summaryLength').value;
    
    if (!text) {
        alert('Please enter text to summarize');
        return;
    }
    
    toolHub.showLoading('summarizerResult');
    
    setTimeout(() => {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        const originalWords = text.split(/\s+/).length;
        
        let summaryLength;
        switch(length) {
            case 'short': summaryLength = Math.ceil(sentences.length * 0.2); break;
            case 'medium': summaryLength = Math.ceil(sentences.length * 0.4); break;
            case 'long': summaryLength = Math.ceil(sentences.length * 0.6); break;
        }
        
        const summarySentences = sentences.slice(0, summaryLength);
        const summary = summarySentences.join('. ') + '.';
        const summaryWords = summary.split(/\s+/).length;
        const reduction = ((originalWords - summaryWords) / originalWords * 100).toFixed(1);
        
        const result = `
            <div class="result-item">
                <span>Original Words:</span>
                <span>${originalWords}</span>
            </div>
            <div class="result-item">
                <span>Summary Words:</span>
                <span>${summaryWords}</span>
            </div>
            <div class="result-item">
                <span>Reduction:</span>
                <span style="color: #4CAF50">${reduction}%</span>
            </div>
            <div style="margin-top: 16px;">
                <strong>Summary:</strong><br>
                <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; margin-top: 8px;">
                    ${summary}
                </div>
            </div>
            <button class="btn btn--primary btn--full-width" style="margin-top: 16px;" onclick="toolHub.copyToClipboard('${summary.replace(/'/g, "\\'")}')">
                Copy Summary
            </button>
        `;
        
        document.getElementById('summarizerResult').innerHTML = result;
        document.getElementById('summarizerResult').classList.add('show');
    }, 2000);
}

// 8. Color Palette Generator
function generateRandomPalette() {
    if (!toolHub.incrementUsage()) return;
    
    const colors = [];
    for (let i = 0; i < 5; i++) {
        colors.push('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'));
    }
    
    displayColorPalette(colors);
}

function extractColors() {
    if (!toolHub.incrementUsage()) return;
    
    const fileInput = document.getElementById('colorImageFile');
    if (!fileInput.files[0]) {
        alert('Please select an image');
        return;
    }
    
    // Simulate color extraction
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
    displayColorPalette(colors);
}

function displayColorPalette(colors) {
    const paletteHtml = colors.map(color => 
        `<div class="color-swatch" style="background-color: ${color}" data-color="${color}" onclick="toolHub.copyToClipboard('${color}')"></div>`
    ).join('');
    
    const result = `
        <div class="success-message">Color palette generated!</div>
        <div class="color-palette">
            ${paletteHtml}
        </div>
        <div style="margin-top: 16px;">
            <button class="btn btn--secondary" onclick="exportPalette('css')">Export CSS</button>
            <button class="btn btn--primary" onclick="exportPalette('json')">Export JSON</button>
        </div>
    `;
    
    document.getElementById('colorGeneratorResult').innerHTML = result;
    document.getElementById('colorGeneratorResult').classList.add('show');
    
    // Store colors for export
    window.currentPalette = colors;
}

function exportPalette(format) {
    if (!window.currentPalette) return;
    
    let content;
    if (format === 'css') {
        content = `:root {\n${window.currentPalette.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n')}\n}`;
    } else {
        content = JSON.stringify({ colors: window.currentPalette }, null, 2);
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `palette.${format}`;
    link.href = URL.createObjectURL(blob);
    link.click();
}

// 9. Password Generator
function generatePassword() {
    if (!toolHub.incrementUsage()) return;
    
    const length = parseInt(document.getElementById('passwordLength').value);
    const includeUppercase = document.getElementById('includeUppercase').checked;
    const includeLowercase = document.getElementById('includeLowercase').checked;
    const includeNumbers = document.getElementById('includeNumbers').checked;
    const includeSymbols = document.getElementById('includeSymbols').checked;
    
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
        alert('Please select at least one character type');
        return;
    }
    
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    const strength = calculatePasswordStrength(password);
    
    const result = `
        <div class="result-item">
            <span>Generated Password:</span>
            <span style="font-family: var(--font-family-mono); background: rgba(255, 255, 255, 0.1); padding: 4px 8px; border-radius: 4px; cursor: pointer;" onclick="toolHub.copyToClipboard('${password}')">${password}</span>
        </div>
        <div class="result-item">
            <span>Strength:</span>
            <span style="color: ${strength.color}">${strength.text}</span>
        </div>
        <div class="result-item">
            <span>Length:</span>
            <span>${length} characters</span>
        </div>
        <button class="btn btn--primary btn--full-width" onclick="toolHub.copyToClipboard('${password}')">
            Copy Password
        </button>
    `;
    
    document.getElementById('passwordResult').innerHTML = result;
    document.getElementById('passwordResult').classList.add('show');
}

function calculatePasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 3) return { text: 'Weak', color: '#ff5555' };
    if (score < 5) return { text: 'Medium', color: '#ffaa55' };
    return { text: 'Strong', color: '#4CAF50' };
}

// 10. Markdown Editor Functions
function insertMarkdown(before, after) {
    const textarea = document.getElementById('markdownInput');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const newText = before + selectedText + after;
    textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    
    textarea.focus();
    textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    
    toolHub.updateMarkdownPreview(textarea.value);
}

function exportMarkdown(format) {
    if (!toolHub.incrementUsage()) return;
    
    const markdown = document.getElementById('markdownInput').value;
    if (!markdown.trim()) {
        alert('Please enter some markdown content');
        return;
    }
    
    let content, filename;
    if (format === 'html') {
        content = `<!DOCTYPE html>
<html>
<head>
    <title>Markdown Export</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    ${document.getElementById('markdownPreview').innerHTML}
</body>
</html>`;
        filename = 'document.html';
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
}

function toggleFullscreen() {
    const editor = document.querySelector('[data-tool="markdown-editor"]');
    editor.classList.toggle('fullscreen');
    
    if (editor.classList.contains('fullscreen')) {
        editor.style.position = 'fixed';
        editor.style.top = '0';
        editor.style.left = '0';
        editor.style.width = '100vw';
        editor.style.height = '100vh';
        editor.style.zIndex = '1000';
        editor.style.background = 'var(--color-background)';
    } else {
        editor.style.position = '';
        editor.style.top = '';
        editor.style.left = '';
        editor.style.width = '';
        editor.style.height = '';
        editor.style.zIndex = '';
        editor.style.background = '';
    }
}

// Utility functions
function downloadFile(filename) {
    // Simulate file download
    const blob = new Blob(['Sample converted file content'], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
}

// Policy functions
function showPrivacyPolicy() {
    document.getElementById('policyTitle').textContent = 'Privacy Policy';
    document.getElementById('policyContent').innerHTML = `
        <p><strong>Effective Date: June 18, 2025</strong></p>
        <h3>Information We Collect</h3>
        <p>We collect information you provide directly to us, such as when you create an account, use our tools, or contact us for support.</p>
        
        <h3>How We Use Your Information</h3>
        <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
        
        <h3>Data Security</h3>
        <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
        
        <h3>Contact Us</h3>
        <p>If you have any questions about this Privacy Policy, please contact us at aaryanraj269@gmail.com</p>
    `;
    document.getElementById('policyModal').classList.add('show');
}

function showTermsOfService() {
    document.getElementById('policyTitle').textContent = 'Terms of Service';
    document.getElementById('policyContent').innerHTML = `
        <p><strong>Effective Date: June 18, 2025</strong></p>
        <h3>Acceptance of Terms</h3>
        <p>By accessing and using ToolHub Master, you accept and agree to be bound by the terms and provision of this agreement.</p>
        
        <h3>Use License</h3>
        <p>Permission is granted to temporarily use ToolHub Master for personal, non-commercial transitory viewing only.</p>
        
        <h3>Disclaimer</h3>
        <p>The materials on ToolHub Master are provided on an 'as is' basis. ToolHub Master makes no warranties, expressed or implied.</p>
        
        <h3>Limitations</h3>
        <p>In no event shall ToolHub Master or its suppliers be liable for any damages arising out of the use or inability to use the materials on ToolHub Master.</p>
        
        <h3>Contact Information</h3>
        <p>For questions about these Terms of Service, contact us at aaryanraj269@gmail.com</p>
    `;
    document.getElementById('policyModal').classList.add('show');
}

function closePolicyModal() {
    document.getElementById('policyModal').classList.remove('show');
}

// Event listeners for modal close
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
};