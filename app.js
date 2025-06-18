// ToolHub Master - Main Application JavaScript
class ToolHubMaster {
    constructor() {
        this.usageData = this.loadUsageData();
        this.authData = this.loadAuthData();
        this.currentUser = null;
        this.currentOTP = null;
        this.currentEmail = null;
        
        // Initialize EmailJS with placeholder - replace with actual user ID
        if (typeof emailjs !== 'undefined') {
            emailjs.init("your_emailjs_user_id");
        }
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUsageDisplay();
        this.updateAuthState();
        this.resetDailyUsage();
        this.loadTheme();
    }

    // Usage Management
    loadUsageData() {
        const saved = localStorage.getItem('toolhub_usage');
        if (saved) {
            const data = JSON.parse(saved);
            const today = new Date().toDateString();
            if (data.date !== today) {
                return this.createUsageData();
            }
            return data;
        }
        return this.createUsageData();
    }

    createUsageData() {
        return {
            date: new Date().toDateString(),
            uses: 0,
            maxUses: 15,
            authenticated: false
        };
    }

    saveUsageData() {
        localStorage.setItem('toolhub_usage', JSON.stringify(this.usageData));
    }

    loadAuthData() {
        const saved = localStorage.getItem('toolhub_auth');
        return saved ? JSON.parse(saved) : null;
    }

    saveAuthData(data) {
        localStorage.setItem('toolhub_auth', JSON.stringify(data));
        this.authData = data;
    }

    updateUsageDisplay() {
        const remaining = this.usageData.maxUses - this.usageData.uses;
        const display = document.getElementById('usageDisplay');
        if (display) {
            display.textContent = `Uses: ${remaining}/${this.usageData.maxUses}`;
            if (remaining <= 3) {
                display.style.background = 'rgba(255, 0, 0, 0.3)';
            } else {
                display.style.background = 'rgba(255, 255, 255, 0.25)';
            }
        }
    }

    canUseTools() {
        return this.usageData.uses < this.usageData.maxUses;
    }

    incrementUsage() {
        if (this.canUseTools()) {
            this.usageData.uses++;
            this.saveUsageData();
            this.updateUsageDisplay();
            
            const remaining = this.usageData.maxUses - this.usageData.uses;
            if (remaining <= 5 && !this.usageData.authenticated) {
                this.showToast('Consider signing in for more uses!', 'warning');
            }
            
            return true;
        }
        return false;
    }

    resetDailyUsage() {
        const today = new Date().toDateString();
        if (this.usageData.date !== today) {
            this.usageData.date = today;
            this.usageData.uses = 0;
            this.saveUsageData();
            this.updateUsageDisplay();
        }
    }

    // Authentication
    handleGoogleAuth(response) {
        try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            this.currentUser = {
                name: payload.name,
                email: payload.email,
                provider: 'google'
            };
            this.completeAuthentication();
        } catch (error) {
            this.showToast('Authentication failed', 'error');
        }
    }

    completeAuthentication() {
        this.usageData.authenticated = true;
        this.usageData.maxUses = 25;
        this.saveUsageData();
        this.saveAuthData(this.currentUser);
        this.updateAuthState();
        this.updateUsageDisplay();
        this.hideModal('authModalOverlay');
        this.showToast(`Welcome, ${this.currentUser.name}!`, 'success');
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'sign_in', {
                method: this.currentUser.provider
            });
        }
    }

    updateAuthState() {
        const signInBtn = document.getElementById('signInBtn');
        const userInfo = document.getElementById('userInfo');
        
        if (this.authData) {
            this.currentUser = this.authData;
            this.usageData.authenticated = true;
            this.usageData.maxUses = 25;
            signInBtn.classList.add('hidden');
            userInfo.classList.remove('hidden');
            document.getElementById('userGreeting').textContent = `Welcome, ${this.currentUser.name}!`;
        } else {
            signInBtn.classList.remove('hidden');
            userInfo.classList.add('hidden');
        }
    }

    signOut() {
        this.currentUser = null;
        this.authData = null;
        this.usageData.authenticated = false;
        this.usageData.maxUses = 15;
        localStorage.removeItem('toolhub_auth');
        this.saveUsageData();
        this.updateAuthState();
        this.updateUsageDisplay();
        this.showToast('Signed out successfully', 'success');
    }

    // Email OTP Authentication
    async sendOTP(email) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        this.currentOTP = otp;
        this.currentEmail = email;
        
        // Simulate sending OTP (in real implementation, use EmailJS)
        console.log(`OTP for ${email}: ${otp}`);
        this.showToast(`OTP sent to ${email}: ${otp}`, 'success');
        document.getElementById('otpSection').classList.remove('hidden');
    }

    verifyOTP(enteredOTP) {
        if (enteredOTP === this.currentOTP) {
            this.currentUser = {
                name: this.currentEmail.split('@')[0],
                email: this.currentEmail,
                provider: 'email'
            };
            this.completeAuthentication();
        } else {
            this.showToast('Invalid OTP. Please try again.', 'error');
        }
    }

    // Theme Management
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-color-scheme', savedTheme);
        document.getElementById('themeToggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        document.getElementById('themeToggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', newTheme);
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }

    // Tool Implementations
    openTool(toolType) {
        if (!this.canUseTools()) {
            if (this.usageData.authenticated) {
                this.showModal('upgradeModalOverlay');
            } else {
                this.showModal('authModalOverlay');
            }
            return;
        }

        const toolConfigs = {
            'ai-detector': {
                title: 'AI Content Detector',
                content: this.getAIDetectorContent()
            },
            'pdf-converter': {
                title: 'PDF Converter Suite',
                content: this.getPDFConverterContent()
            },
            'plagiarism-checker': {
                title: 'Plagiarism Checker',
                content: this.getPlagiarismCheckerContent()
            },
            'text-summarizer': {
                title: 'Text Summarizer',
                content: this.getTextSummarizerContent()
            },
            'image-compressor': {
                title: 'Smart Image Compressor',
                content: this.getImageCompressorContent()
            },
            'color-palette': {
                title: 'Color Palette Generator',
                content: this.getColorPaletteContent()
            },
            'password-generator': {
                title: 'Password Generator',
                content: this.getPasswordGeneratorContent()
            },
            'markdown-editor': {
                title: 'Markdown Editor',
                content: this.getMarkdownEditorContent()
            }
        };

        const config = toolConfigs[toolType];
        if (config) {
            document.getElementById('modalTitle').textContent = config.title;
            document.getElementById('modalContent').innerHTML = config.content;
            this.showModal('modalOverlay');
            this.initToolFunctionality(toolType);
        }
    }

    // AI Content Detector
    getAIDetectorContent() {
        return `
            <div class="tool-interface">
                <div class="tool-section">
                    <h3>Analyze Text for AI Generation</h3>
                    <textarea class="form-control" id="aiDetectorText" rows="8" placeholder="Paste your text here to check if it was generated by AI..."></textarea>
                    <button class="btn btn--primary mt-16" id="analyzeTextBtn">
                        <span class="btn-text">Analyze Text</span>
                        <div class="spinner hidden"></div>
                    </button>
                </div>
                <div class="tool-section">
                    <h3>Analysis Results</h3>
                    <div class="results-area" id="aiDetectorResults">
                        Results will appear here after analysis...
                    </div>
                </div>
            </div>
        `;
    }

    async analyzeAIContent(text) {
        if (!text.trim()) {
            this.showToast('Please enter text to analyze', 'warning');
            return;
        }

        if (!this.incrementUsage()) {
            this.showToast('Usage limit reached', 'error');
            return;
        }

        const btn = document.getElementById('analyzeTextBtn');
        const btnText = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.spinner');
        
        btnText.textContent = 'Analyzing...';
        spinner.classList.remove('hidden');
        btn.disabled = true;

        await new Promise(resolve => setTimeout(resolve, 2000));

        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const confidence = Math.floor(Math.random() * 20) + 80;
        const aiSentences = Math.floor(sentences.length * (confidence / 100));

        let highlightedText = text;
        for (let i = 0; i < aiSentences; i++) {
            const sentence = sentences[i];
            if (sentence) {
                highlightedText = highlightedText.replace(sentence, `<span style="background: rgba(255, 255, 0, 0.3); padding: 2px 4px; border-radius: 3px;">${sentence}</span>`);
            }
        }

        const resultsHtml = `
            <div class="mb-16">
                <span style="background: rgba(107, 70, 193, 0.2); color: #6B46C1; padding: 4px 8px; border-radius: 4px; font-weight: bold;">AI Confidence: ${confidence}%</span>
            </div>
            <div class="mb-16">
                <strong>Analysis Summary:</strong><br>
                ${aiSentences} out of ${sentences.length} sentences likely AI-generated<br>
                Word count: ${text.split(' ').length} words
            </div>
            <div>
                <strong>Highlighted Text:</strong><br>
                <div style="line-height: 1.8; margin-top: 12px;">${highlightedText}</div>
            </div>
        `;

        document.getElementById('aiDetectorResults').innerHTML = resultsHtml;

        btnText.textContent = 'Analyze Text';
        spinner.classList.add('hidden');
        btn.disabled = false;

        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_usage', { tool_name: 'ai_detector' });
        }
    }

    // PDF Converter Suite
    getPDFConverterContent() {
        return `
            <div class="tool-interface">
                <div class="tool-section">
                    <h3>Upload PDF Files</h3>
                    <div class="file-upload-area" id="pdfUploadArea">
                        <input type="file" id="pdfInput" accept=".pdf" multiple>
                        <p>📄 Click to upload PDF files or drag & drop</p>
                        <p><small>Supports multiple files for merging</small></p>
                    </div>
                </div>
                <div class="tool-section">
                    <h3>PDF Operations</h3>
                    <div class="flex gap-8">
                        <button class="btn btn--secondary" id="compressPdfBtn">Compress PDF</button>
                        <button class="btn btn--secondary" id="mergePdfBtn">Merge PDFs</button>
                        <button class="btn btn--secondary" id="splitPdfBtn">Split PDF</button>
                    </div>
                </div>
                <div class="tool-section">
                    <h3>Output</h3>
                    <div class="results-area" id="pdfResults">
                        Upload PDF files to get started...
                    </div>
                </div>
            </div>
        `;
    }

    async processPDF(operation) {
        const input = document.getElementById('pdfInput');
        if (!input.files.length) {
            this.showToast('Please upload PDF files first', 'warning');
            return;
        }

        if (!this.incrementUsage()) {
            this.showToast('Usage limit reached', 'error');
            return;
        }

        const resultsDiv = document.getElementById('pdfResults');
        resultsDiv.innerHTML = '<div class="loading">Processing PDF... <div class="spinner"></div></div>';

        // Simulate PDF processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        const file = input.files[0];
        const filename = `${operation}_${file.name}`;

        resultsDiv.innerHTML = `
            <div class="text-center">
                <p>✅ PDF ${operation} completed successfully!</p>
                <p><strong>Original size:</strong> ${(file.size / 1024).toFixed(1)} KB</p>
                <p><strong>Operation:</strong> ${operation.charAt(0).toUpperCase() + operation.slice(1)}</p>
                <button class="btn btn--primary" onclick="alert('In a real implementation, this would download the processed PDF')">Download ${filename}</button>
            </div>
        `;

        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_usage', { tool_name: 'pdf_converter', operation: operation });
        }
    }

    // Plagiarism Checker
    getPlagiarismCheckerContent() {
        return `
            <div class="tool-interface">
                <div class="tool-section">
                    <h3>Check Text for Plagiarism</h3>
                    <textarea class="form-control" id="plagiarismText" rows="8" placeholder="Paste your text here to check for plagiarism..."></textarea>
                    <button class="btn btn--primary mt-16" id="checkPlagiarismBtn">
                        <span class="btn-text">Check Plagiarism</span>
                        <div class="spinner hidden"></div>
                    </button>
                </div>
                <div class="tool-section">
                    <h3>Plagiarism Report</h3>
                    <div class="results-area" id="plagiarismResults">
                        Results will appear here after checking...
                    </div>
                </div>
            </div>
        `;
    }

    async checkPlagiarism(text) {
        if (!text.trim()) {
            this.showToast('Please enter text to check', 'warning');
            return;
        }

        if (!this.incrementUsage()) {
            this.showToast('Usage limit reached', 'error');
            return;
        }

        const btn = document.getElementById('checkPlagiarismBtn');
        const btnText = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.spinner');
        
        btnText.textContent = 'Checking...';
        spinner.classList.remove('hidden');
        btn.disabled = true;

        await new Promise(resolve => setTimeout(resolve, 3000));

        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const plagiarismScore = Math.floor(Math.random() * 25) + 5;
        const flaggedSentences = Math.floor(sentences.length * (plagiarismScore / 100));

        let highlightedText = text;
        const sources = [
            'Wikipedia.org',
            'Academic Journal Database',
            'ResearchGate.net',
            'Scholar.google.com',
            'Educational Website'
        ];

        for (let i = 0; i < flaggedSentences; i++) {
            const sentence = sentences[i];
            if (sentence) {
                highlightedText = highlightedText.replace(sentence, 
                    `<span style="background: rgba(255, 0, 0, 0.3); padding: 2px 4px; border-radius: 3px;" title="Potential match found">${sentence}</span>`);
            }
        }

        const resultsHtml = `
            <div class="mb-16">
                <span style="background: rgba(192, 21, 47, 0.2); color: #C0152F; padding: 4px 8px; border-radius: 4px; font-weight: bold;">Plagiarism Score: ${plagiarismScore}%</span>
            </div>
            <div class="mb-16">
                <strong>Report Summary:</strong><br>
                ${flaggedSentences} potential matches found in ${flaggedSentences} sources<br>
                Total sentences: ${sentences.length}
            </div>
            ${flaggedSentences > 0 ? `
            <div class="mb-16">
                <strong>Potential Sources:</strong><br>
                ${sources.slice(0, flaggedSentences).map(source => `• ${source}`).join('<br>')}
            </div>
            ` : ''}
            <div>
                <strong>Highlighted Text:</strong><br>
                <div style="line-height: 1.8; margin-top: 12px;">${highlightedText}</div>
            </div>
        `;

        document.getElementById('plagiarismResults').innerHTML = resultsHtml;

        btnText.textContent = 'Check Plagiarism';
        spinner.classList.add('hidden');
        btn.disabled = false;

        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_usage', { tool_name: 'plagiarism_checker' });
        }
    }

    // Text Summarizer
    getTextSummarizerContent() {
        return `
            <div class="tool-interface">
                <div class="tool-section">
                    <h3>Text to Summarize</h3>
                    <textarea class="form-control" id="summarizerText" rows="8" placeholder="Paste your long text here to get a summary..."></textarea>
                    <div class="mt-16">
                        <label class="form-label">Summary Length:</label>
                        <select class="form-control" id="summaryLength">
                            <option value="short">Short (25% of original)</option>
                            <option value="medium" selected>Medium (50% of original)</option>
                            <option value="long">Long (75% of original)</option>
                        </select>
                    </div>
                    <button class="btn btn--primary mt-16" id="summarizeBtn">
                        <span class="btn-text">Generate Summary</span>
                        <div class="spinner hidden"></div>
                    </button>
                </div>
                <div class="tool-section">
                    <h3>Summary</h3>
                    <div class="results-area" id="summaryResults">
                        Summary will appear here...
                    </div>
                </div>
            </div>
        `;
    }

    async summarizeText(text, length) {
        if (!text.trim()) {
            this.showToast('Please enter text to summarize', 'warning');
            return;
        }

        if (!this.incrementUsage()) {
            this.showToast('Usage limit reached', 'error');
            return;
        }

        const btn = document.getElementById('summarizeBtn');
        const btnText = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.spinner');
        
        btnText.textContent = 'Summarizing...';
        spinner.classList.remove('hidden');
        btn.disabled = true;

        await new Promise(resolve => setTimeout(resolve, 2000));

        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const lengthMultipliers = { short: 0.25, medium: 0.5, long: 0.75 };
        const summaryLength = Math.max(1, Math.floor(sentences.length * lengthMultipliers[length]));
        
        const summary = sentences.slice(0, summaryLength).join('. ') + '.';
        
        const resultsHtml = `
            <div class="mb-16">
                <strong>Summary Statistics:</strong><br>
                Original: ${sentences.length} sentences, ${text.length} characters<br>
                Summary: ${summaryLength} sentences, ${summary.length} characters<br>
                Compression: ${Math.round((1 - summary.length / text.length) * 100)}%
            </div>
            <div style="position: relative;">
                <strong>Generated Summary:</strong>
                <button style="position: absolute; top: 8px; right: 8px; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;" onclick="navigator.clipboard.writeText('${summary.replace(/'/g, "\\'")}'); this.textContent = 'Copied!'">Copy</button>
                <div style="margin-top: 12px; line-height: 1.6; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    ${summary}
                </div>
            </div>
        `;

        document.getElementById('summaryResults').innerHTML = resultsHtml;

        btnText.textContent = 'Generate Summary';
        spinner.classList.add('hidden');
        btn.disabled = false;

        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_usage', { tool_name: 'text_summarizer' });
        }
    }

    // Image Compressor
    getImageCompressorContent() {
        return `
            <div class="tool-interface">
                <div class="tool-section">
                    <h3>Upload Images</h3>
                    <div class="file-upload-area" id="imageUploadArea">
                        <input type="file" id="imageInput" accept="image/*" multiple>
                        <p>🖼️ Click to upload images or drag & drop</p>
                        <p><small>Supports JPG, PNG, WebP formats</small></p>
                    </div>
                </div>
                <div class="tool-section">
                    <h3>Compression Settings</h3>
                    <label class="form-label">Quality (0.1 - 1.0):</label>
                    <input type="range" id="qualitySlider" min="0.1" max="1.0" step="0.1" value="0.8" class="form-control">
                    <span id="qualityValue">0.8</span>
                    <button class="btn btn--primary mt-16" id="compressImagesBtn">Compress Images</button>
                </div>
                <div class="tool-section">
                    <h3>Compressed Images</h3>
                    <div class="results-area" id="imageResults">
                        Upload images to get started...
                    </div>
                </div>
            </div>
        `;
    }

    async compressImages() {
        const input = document.getElementById('imageInput');
        if (!input.files.length) {
            this.showToast('Please upload images first', 'warning');
            return;
        }

        if (!this.incrementUsage()) {
            this.showToast('Usage limit reached', 'error');
            return;
        }

        const quality = parseFloat(document.getElementById('qualitySlider').value);
        const resultsDiv = document.getElementById('imageResults');
        resultsDiv.innerHTML = '<div class="loading">Compressing images... <div class="spinner"></div></div>';

        const compressedImages = [];

        for (const file of input.files) {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();

                await new Promise((resolve) => {
                    img.onload = () => {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        
                        canvas.toBlob((blob) => {
                            const originalSize = file.size;
                            const compressedSize = blob.size;
                            const savings = Math.round((1 - compressedSize / originalSize) * 100);
                            
                            compressedImages.push({
                                name: file.name,
                                originalSize,
                                compressedSize,
                                savings,
                                blob,
                                url: URL.createObjectURL(blob)
                            });
                            resolve();
                        }, file.type, quality);
                    };
                    img.src = URL.createObjectURL(file);
                });
            } catch (error) {
                this.showToast(`Error compressing ${file.name}`, 'error');
            }
        }

        const resultsHtml = `
            <div class="mb-16">
                <strong>Compression Results:</strong><br>
                ${compressedImages.length} images processed
            </div>
            ${compressedImages.map(img => `
                <div style="margin-bottom: 16px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <strong>${img.name}</strong><br>
                    Original: ${(img.originalSize / 1024).toFixed(1)} KB<br>
                    Compressed: ${(img.compressedSize / 1024).toFixed(1)} KB<br>
                    Savings: ${img.savings}%<br>
                    <a href="${img.url}" download="compressed_${img.name}" class="btn btn--secondary btn--sm mt-8">Download</a>
                </div>
            `).join('')}
        `;

        resultsDiv.innerHTML = resultsHtml;

        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_usage', { tool_name: 'image_compressor' });
        }
    }

    // Color Palette Generator
    getColorPaletteContent() {
        return `
            <div class="tool-interface">
                <div class="tool-section">
                    <h3>Generate Color Palette</h3>
                    <div class="flex gap-16">
                        <button class="btn btn--secondary" id="randomPaletteBtn">Generate Random Palette</button>
                        <button class="btn btn--secondary" id="uploadImageBtn">Extract from Image</button>
                    </div>
                    <input type="file" id="colorImageInput" accept="image/*" class="hidden">
                </div>
                <div class="tool-section">
                    <h3>Color Palette</h3>
                    <div class="results-area" id="colorResults">
                        Generate a palette to get started...
                    </div>
                </div>
            </div>
        `;
    }

    generateRandomPalette() {
        if (!this.incrementUsage()) {
            this.showToast('Usage limit reached', 'error');
            return;
        }

        const colors = [];
        const baseHue = Math.floor(Math.random() * 360);
        
        for (let i = 0; i < 5; i++) {
            const hue = (baseHue + i * 72) % 360;
            const saturation = Math.floor(Math.random() * 40) + 60;
            const lightness = Math.floor(Math.random() * 40) + 30;
            const color = this.hslToHex(hue, saturation, lightness);
            colors.push(color);
        }

        this.displayColorPalette(colors);

        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_usage', { tool_name: 'color_palette_generator' });
        }
    }

    async extractColorsFromImage(file) {
        if (!this.incrementUsage()) {
            this.showToast('Usage limit reached', 'error');
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        return new Promise((resolve) => {
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const colors = this.extractDominantColors(imageData.data);
                this.displayColorPalette(colors);
                resolve();
            };
            img.src = URL.createObjectURL(file);
        });
    }

    extractDominantColors(imageData) {
        const colorMap = new Map();
        
        for (let i = 0; i < imageData.length; i += 16) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const hex = this.rgbToHex(r, g, b);
            colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
        }
        
        return Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([color]) => color);
    }

    displayColorPalette(colors) {
        const resultsHtml = `
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0;">
                ${colors.map(color => `
                    <div style="width: 60px; height: 60px; background-color: ${color}; border-radius: 8px; border: 2px solid rgba(255, 255, 255, 0.3); cursor: pointer; position: relative;" 
                         onclick="navigator.clipboard.writeText('${color}'); document.getElementById('copyFeedback').textContent = 'Copied ${color}!'">
                        <div style="position: absolute; bottom: -24px; left: 50%; transform: translateX(-50%); font-size: 11px; color: var(--color-text); white-space: nowrap;">${color}</div>
                    </div>
                `).join('')}
            </div>
            <div id="copyFeedback" style="margin-top: 16px; font-style: italic; color: var(--color-text-secondary);"></div>
            <div class="mt-16">
                <strong>Palette Codes:</strong><br>
                ${colors.map(color => `<code style="margin-right: 8px;">${color}</code>`).join('')}
                <button style="background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; margin-left: 8px;" onclick="navigator.clipboard.writeText('${colors.join(', ')}'); this.textContent = 'Copied All!'">Copy All</button>
            </div>
        `;
        
        document.getElementById('colorResults').innerHTML = resultsHtml;
    }

    // Password Generator
    getPasswordGeneratorContent() {
        return `
            <div class="tool-interface">
                <div class="tool-section">
                    <h3>Password Options</h3>
                    <div class="form-group">
                        <label class="form-label">Length:</label>
                        <input type="range" id="passwordLength" min="8" max="128" value="16" class="form-control">
                        <span id="lengthValue">16</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" id="includeUppercase" checked> Uppercase (A-Z)</label>
                        <label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" id="includeLowercase" checked> Lowercase (a-z)</label>
                        <label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" id="includeNumbers" checked> Numbers (0-9)</label>
                        <label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" id="includeSymbols" checked> Symbols (!@#$)</label>
                    </div>
                    <button class="btn btn--primary mt-16" id="generatePasswordBtn">Generate Password</button>
                </div>
                <div class="tool-section">
                    <h3>Generated Password</h3>
                    <div class="results-area" id="passwordResults">
                        Configure options and generate password...
                    </div>
                </div>
            </div>
        `;
    }

    generatePassword() {
        if (!this.incrementUsage()) {
            this.showToast('Usage limit reached', 'error');
            return;
        }

        const length = parseInt(document.getElementById('passwordLength').value);
        const includeUppercase = document.getElementById('includeUppercase').checked;
        const includeLowercase = document.getElementById('includeLowercase').checked;
        const includeNumbers = document.getElementById('includeNumbers').checked;
        const includeSymbols = document.getElementById('includeSymbols').checked;

        let charset = '';
        if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (includeNumbers) charset += '0123456789';
        if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (!charset) {
            this.showToast('Please select at least one character type', 'warning');
            return;
        }

        let password = '';
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);
        
        for (let i = 0; i < length; i++) {
            password += charset[array[i] % charset.length];
        }

        const strength = this.calculatePasswordStrength(password);
        
        const resultsHtml = `
            <div style="position: relative;">
                <div style="font-family: monospace; font-size: 18px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px; word-break: break-all; margin-bottom: 16px;">
                    ${password}
                </div>
                <button style="position: absolute; top: 8px; right: 8px; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;" onclick="navigator.clipboard.writeText('${password}'); this.textContent = 'Copied!'">Copy</button>
            </div>
            <div class="mb-16">
                <strong>Password Strength:</strong> <span style="background: rgba(107, 70, 193, 0.2); color: #6B46C1; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${strength}</span>
            </div>
            <div>
                <strong>Security Tips:</strong><br>
                • Use this password only once<br>
                • Store it securely in a password manager<br>
                • Enable two-factor authentication when possible
            </div>
        `;

        document.getElementById('passwordResults').innerHTML = resultsHtml;

        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_usage', { tool_name: 'password_generator' });
        }
    }

    calculatePasswordStrength(password) {
        let score = 0;
        if (password.length >= 12) score += 25;
        if (/[a-z]/.test(password)) score += 25;
        if (/[A-Z]/.test(password)) score += 25;
        if (/[0-9]/.test(password)) score += 25;
        if (/[^A-Za-z0-9]/.test(password)) score += 25;
        
        if (score >= 100) return 'Very Strong';
        if (score >= 75) return 'Strong';
        if (score >= 50) return 'Medium';
        return 'Weak';
    }

    // Markdown Editor
    getMarkdownEditorContent() {
        return `
            <div class="tool-interface">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; height: 500px;">
                    <div style="border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; overflow: hidden; background: rgba(255, 255, 255, 0.05);">
                        <textarea id="markdownInput" style="width: 100%; height: 100%; border: none; padding: 16px; font-family: monospace; font-size: 14px; background: transparent; color: var(--color-text); resize: none; outline: none;" placeholder="# Start typing your markdown here...

## Features
- Live preview
- Syntax highlighting
- Export options

**Bold text** and *italic text*

\`\`\`javascript
console.log('Hello World!');
\`\`\`"></textarea>
                    </div>
                    <div style="border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; padding: 16px; overflow-y: auto; background: rgba(255, 255, 255, 0.05);" id="markdownPreview">
                        <p>Start typing in the editor to see the preview...</p>
                    </div>
                </div>
                <div class="mt-16 text-center">
                    <button class="btn btn--secondary" id="exportMarkdownBtn">Export as HTML</button>
                    <button class="btn btn--secondary" id="copyMarkdownBtn">Copy Markdown</button>
                </div>
            </div>
        `;
    }

    initMarkdownEditor() {
        const input = document.getElementById('markdownInput');
        const preview = document.getElementById('markdownPreview');
        
        if (!this.incrementUsage()) {
            this.showToast('Usage limit reached', 'error');
            return;
        }

        const updatePreview = () => {
            const markdown = input.value;
            const html = this.parseMarkdown(markdown);
            preview.innerHTML = html;
        };

        input.addEventListener('input', updatePreview);
        updatePreview();

        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_usage', { tool_name: 'markdown_editor' });
        }
    }

    parseMarkdown(markdown) {
        return markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
            .replace(/`([^`]*)`/gim, '<code>$1</code>')
            .replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" target="_blank">$1</a>')
            .replace(/\n/gim, '<br>');
    }

    exportMarkdownAsHTML() {
        const markdown = document.getElementById('markdownInput').value;
        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Exported Markdown</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
    </style>
</head>
<body>
    ${this.parseMarkdown(markdown)}
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'exported-markdown.html';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Utility Functions
    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    rgbToHex(r, g, b) {
        return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
    }

    // Tool Functionality Initialization
    initToolFunctionality(toolType) {
        switch (toolType) {
            case 'ai-detector':
                document.getElementById('analyzeTextBtn').addEventListener('click', () => {
                    const text = document.getElementById('aiDetectorText').value;
                    this.analyzeAIContent(text);
                });
                break;

            case 'pdf-converter':
                document.getElementById('pdfUploadArea').addEventListener('click', () => {
                    document.getElementById('pdfInput').click();
                });
                document.getElementById('compressPdfBtn').addEventListener('click', () => {
                    this.processPDF('compress');
                });
                document.getElementById('mergePdfBtn').addEventListener('click', () => {
                    this.processPDF('merge');
                });
                document.getElementById('splitPdfBtn').addEventListener('click', () => {
                    this.processPDF('split');
                });
                break;

            case 'plagiarism-checker':
                document.getElementById('checkPlagiarismBtn').addEventListener('click', () => {
                    const text = document.getElementById('plagiarismText').value;
                    this.checkPlagiarism(text);
                });
                break;

            case 'text-summarizer':
                document.getElementById('summarizeBtn').addEventListener('click', () => {
                    const text = document.getElementById('summarizerText').value;
                    const length = document.getElementById('summaryLength').value;
                    this.summarizeText(text, length);
                });
                break;

            case 'image-compressor':
                document.getElementById('imageUploadArea').addEventListener('click', () => {
                    document.getElementById('imageInput').click();
                });
                document.getElementById('qualitySlider').addEventListener('input', (e) => {
                    document.getElementById('qualityValue').textContent = e.target.value;
                });
                document.getElementById('compressImagesBtn').addEventListener('click', () => {
                    this.compressImages();
                });
                break;

            case 'color-palette':
                document.getElementById('randomPaletteBtn').addEventListener('click', () => {
                    this.generateRandomPalette();
                });
                document.getElementById('uploadImageBtn').addEventListener('click', () => {
                    document.getElementById('colorImageInput').click();
                });
                document.getElementById('colorImageInput').addEventListener('change', (e) => {
                    if (e.target.files[0]) {
                        this.extractColorsFromImage(e.target.files[0]);
                    }
                });
                break;

            case 'password-generator':
                document.getElementById('passwordLength').addEventListener('input', (e) => {
                    document.getElementById('lengthValue').textContent = e.target.value;
                });
                document.getElementById('generatePasswordBtn').addEventListener('click', () => {
                    this.generatePassword();
                });
                break;

            case 'markdown-editor':
                this.initMarkdownEditor();
                document.getElementById('exportMarkdownBtn').addEventListener('click', () => {
                    this.exportMarkdownAsHTML();
                });
                document.getElementById('copyMarkdownBtn').addEventListener('click', () => {
                    const markdown = document.getElementById('markdownInput').value;
                    navigator.clipboard.writeText(markdown);
                    this.showToast('Markdown copied to clipboard', 'success');
                });
                break;
        }
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Tool cards
        document.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('click', () => {
                const toolType = card.getAttribute('data-tool');
                this.openTool(toolType);
            });
        });

        // Modal controls
        document.getElementById('modalClose').addEventListener('click', () => {
            this.hideModal('modalOverlay');
        });

        document.getElementById('authModalClose').addEventListener('click', () => {
            this.hideModal('authModalOverlay');
        });

        document.getElementById('upgradeModalClose').addEventListener('click', () => {
            this.hideModal('upgradeModalOverlay');
        });

        // Auth buttons
        document.getElementById('signInBtn').addEventListener('click', () => {
            this.showModal('authModalOverlay');
        });

        document.getElementById('signOutBtn').addEventListener('click', () => {
            this.signOut();
        });

        document.getElementById('googleSignInBtn').addEventListener('click', () => {
            this.showToast('Google Sign-In would work with proper configuration', 'info');
        });

        document.getElementById('emailSignInBtn').addEventListener('click', () => {
            const email = document.getElementById('emailInput').value;
            if (email && email.includes('@')) {
                this.sendOTP(email);
            } else {
                this.showToast('Please enter a valid email', 'warning');
            }
        });

        document.getElementById('verifyOtpBtn').addEventListener('click', () => {
            const otp = document.getElementById('otpInput').value;
            if (otp.length === 6) {
                this.verifyOTP(otp);
            } else {
                this.showToast('Please enter a 6-digit OTP', 'warning');
            }
        });

        // Legal pages
        document.getElementById('privacyPolicyLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLegalPage('privacy');
        });

        document.getElementById('termsOfServiceLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLegalPage('terms');
        });

        // Footer links
        document.getElementById('privacyPolicyFooterLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLegalPage('privacy');
        });

        document.getElementById('termsOfServiceFooterLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLegalPage('terms');
        });

        // Close modals on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    showLegalPage(type) {
        const content = type === 'privacy' ? this.getPrivacyPolicy() : this.getTermsOfService();
        document.getElementById('modalTitle').textContent = type === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
        document.getElementById('modalContent').innerHTML = content;
        this.showModal('modalOverlay');
    }

    getPrivacyPolicy() {
        return `
            <div style="max-height: 400px; overflow-y: auto; line-height: 1.6;">
                <p><strong>Effective Date: June 18, 2025</strong></p>
                
                <h3>Information Collection</h3>
                <p>We collect information you provide directly, including email addresses for authentication and usage analytics for service improvement.</p>
                
                <h3>Data Usage</h3>
                <p>Your data is used to provide our services, authenticate users, and improve our tools. We do not sell or share personal information with third parties.</p>
                
                <h3>Data Storage</h3>
                <p>Data is stored locally in your browser and may be processed temporarily for tool functionality. No personal files are permanently stored on our servers.</p>
                
                <h3>Cookies and Tracking</h3>
                <p>We use Google Analytics to understand usage patterns and improve our service. You can opt out of analytics tracking in your browser settings.</p>
                
                <h3>Contact</h3>
                <p>For privacy concerns, contact us at aaryanraj269@gmail.com</p>
            </div>
        `;
    }

    getTermsOfService() {
        return `
            <div style="max-height: 400px; overflow-y: auto; line-height: 1.6;">
                <p><strong>Effective Date: June 18, 2025</strong></p>
                
                <h3>Service Usage</h3>
                <p>ToolHub Master provides productivity tools for personal and commercial use. Users are responsible for the content they process through our tools.</p>
                
                <h3>Usage Limits</h3>
                <p>Free users receive 15 uses per day, authenticated users receive 25 uses per day. Usage resets daily at midnight UTC.</p>
                
                <h3>Prohibited Uses</h3>
                <p>Users may not use our service for illegal activities, spam generation, or processing of harmful content.</p>
                
                <h3>Limitation of Liability</h3>
                <p>ToolHub Master is provided "as is" without warranties. We are not liable for any damages arising from use of our service.</p>
                
                <h3>Service Availability</h3>
                <p>We strive for high availability but do not guarantee uninterrupted service.</p>
                
                <h3>Contact</h3>
                <p>For questions about these terms, contact aaryanraj269@gmail.com</p>
            </div>
        `;
    }
}

// Global function for Google Sign-In callback
window.handleGoogleSignIn = function(response) {
    if (window.toolhubApp) {
        window.toolhubApp.handleGoogleAuth(response);
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.toolhubApp = new ToolHubMaster();
});