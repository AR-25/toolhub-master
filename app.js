// ToolHub Master - Complete Application Logic

class ToolHubMaster {
    constructor() {
        this.tools = [
            {
                id: "ai-detector",
                name: "AI Content Detector",
                category: "AI Tools",
                icon: "🤖",
                description: "Detect AI-generated text with 99% accuracy",
                limit: 3,
                storageKey: "ai_detector"
            },
            {
                id: "pdf-converter",
                name: "PDF Converter Suite",
                category: "File Tools",
                icon: "📄",
                description: "Convert, compress, merge, and split PDFs",
                limit: 5,
                storageKey: "pdf_converter"
            },
            {
                id: "qr-generator",
                name: "QR Code Generator Pro",
                category: "Utility Tools",
                icon: "⬜",
                description: "Create custom QR codes with analytics",
                limit: 10,
                storageKey: "qr_generator"
            },
            {
                id: "image-compressor",
                name: "Smart Image Compressor",
                category: "File Tools",
                icon: "🖼️",
                description: "Optimize images without quality loss",
                limit: 5,
                storageKey: "image_compressor"
            },
            {
                id: "url-shortener",
                name: "URL Shortener Plus",
                category: "Utility Tools",
                icon: "🔗",
                description: "Shorten URLs with detailed analytics",
                limit: 10,
                storageKey: "url_shortener"
            },
            {
                id: "plagiarism-checker",
                name: "Plagiarism Checker",
                category: "Writing Tools",
                icon: "🔍",
                description: "Detect duplicate content instantly",
                limit: 2,
                storageKey: "plagiarism_checker"
            },
            {
                id: "text-summarizer",
                name: "Text Summarizer",
                category: "AI Tools",
                icon: "📝",
                description: "AI-powered content summarization",
                limit: 3,
                storageKey: "text_summarizer"
            },
            {
                id: "color-generator",
                name: "Color Palette Generator",
                category: "Design Tools",
                icon: "🎨",
                description: "Extract beautiful color schemes",
                limit: 10,
                storageKey: "color_generator"
            },
            {
                id: "password-generator",
                name: "Password Generator",
                category: "Security Tools",
                icon: "🔐",
                description: "Create secure passwords instantly",
                limit: 20,
                storageKey: "password_generator"
            },
            {
                id: "markdown-editor",
                name: "Markdown Editor",
                category: "Writing Tools",
                icon: "✍️",
                description: "Live editing with real-time preview",
                limit: -1,
                storageKey: "markdown_editor"
            }
        ];

        this.currentTool = null;
        this.urlDatabase = JSON.parse(localStorage.getItem('url_database') || '{}');
        this.initializeApp();
    }

    initializeApp() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApp());
        } else {
            this.setupApp();
        }
    }

    setupApp() {
        this.resetDailyUsage();
        this.setupThemeToggle();
        this.renderToolsGrid();
        this.setupModals();
        this.setupFooterLinks();
        this.trackPageView();
    }

    // Theme Management
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-color-scheme', savedTheme);
        this.updateThemeIcon(savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-color-scheme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-color-scheme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(newTheme);
        });
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('.theme-toggle__icon');
        if (icon) {
            icon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }

    // Usage Tracking
    resetDailyUsage() {
        const today = new Date().toISOString().slice(0, 10);
        const lastReset = localStorage.getItem('last_reset');
        
        if (lastReset !== today) {
            this.tools.forEach(tool => {
                localStorage.setItem(tool.storageKey, '0');
            });
            localStorage.setItem('last_reset', today);
        }
    }

    getUsageCount(storageKey) {
        return parseInt(localStorage.getItem(storageKey) || '0');
    }

    incrementUsage(storageKey) {
        const current = this.getUsageCount(storageKey);
        localStorage.setItem(storageKey, (current + 1).toString());
        this.renderToolsGrid();
    }

    canUseTool(tool) {
        if (tool.limit === -1) return true;
        return this.getUsageCount(tool.storageKey) < tool.limit;
    }

    getRemainingUses(tool) {
        if (tool.limit === -1) return '∞';
        return Math.max(0, tool.limit - this.getUsageCount(tool.storageKey));
    }

    // Tools Grid Rendering
    renderToolsGrid() {
        const grid = document.getElementById('toolsGrid');
        if (!grid) return;
        
        grid.innerHTML = this.tools.map(tool => this.createToolCard(tool)).join('');
        
        document.querySelectorAll('.tool-card').forEach((card, index) => {
            card.addEventListener('click', () => this.openTool(this.tools[index]));
        });
    }

    createToolCard(tool) {
        const remaining = this.getRemainingUses(tool);
        const usagePercent = tool.limit === -1 ? 0 : ((tool.limit - remaining) / tool.limit) * 100;
        const isExhausted = remaining === 0 && tool.limit !== -1;

        return `
            <div class="tool-card">
                <div class="tool-card__header">
                    <div class="tool-card__icon">${tool.icon}</div>
                    <div>
                        <div class="tool-card__category">${tool.category}</div>
                        <h3 class="tool-card__title">${tool.name}</h3>
                    </div>
                </div>
                <p class="tool-card__description">${tool.description}</p>
                <div class="tool-card__footer">
                    <div class="tool-card__usage">
                        <span>${remaining}${tool.limit !== -1 ? `/${tool.limit}` : ''} uses</span>
                        ${tool.limit !== -1 ? `
                            <div class="usage-indicator ${isExhausted ? 'usage-indicator--full' : ''}">
                                <div class="usage-indicator__fill" style="width: ${usagePercent}%"></div>
                            </div>
                        ` : ''}
                    </div>
                    ${isExhausted ? '<div class="tool-card__badge">Upgrade</div>' : ''}
                </div>
            </div>
        `;
    }

    // Modal Management
    setupModals() {
        const modals = [
            { id: 'toolModal', closeId: 'modalClose' },
            { id: 'upgradeModal', closeId: 'upgradeModalClose' },
            { id: 'privacyModal', closeId: 'privacyModalClose' },
            { id: 'termsModal', closeId: 'termsModalClose' }
        ];

        modals.forEach(({ id, closeId }) => {
            const modal = document.getElementById(id);
            const closeBtn = document.getElementById(closeId);
            const backdrop = modal?.querySelector('.modal__backdrop');

            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal(id));
            }
            if (backdrop) {
                backdrop.addEventListener('click', () => this.closeModal(id));
            }
        });

        // Upgrade buttons
        document.getElementById('upgradeBtn')?.addEventListener('click', () => {
            this.openModal('upgradeModal');
        });

        document.querySelectorAll('.btn--primary').forEach(btn => {
            if (btn.textContent.includes('Choose')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleUpgrade(btn.textContent);
                });
            }
        });
    }

    setupFooterLinks() {
        document.getElementById('privacyPolicyLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal('privacyModal');
        });

        document.getElementById('termsServiceLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal('termsModal');
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Tool Opening Logic
    openTool(tool) {
        if (!this.canUseTool(tool)) {
            this.openModal('upgradeModal');
            this.trackEvent('upgrade_prompt_shown', { tool: tool.name });
            return;
        }

        this.currentTool = tool;
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (modalTitle) modalTitle.textContent = tool.name;
        if (modalBody) modalBody.innerHTML = this.getToolInterface(tool);
        
        this.openModal('toolModal');
        
        setTimeout(() => {
            this.setupToolEventListeners(tool);
        }, 100);
        
        this.trackEvent('tool_opened', { tool: tool.name });
    }

    // Tool Interfaces
    getToolInterface(tool) {
        switch (tool.id) {
            case 'password-generator':
                return this.getPasswordGeneratorInterface();
            case 'qr-generator':
                return this.getQRGeneratorInterface();
            case 'url-shortener':
                return this.getURLShortenerInterface();
            case 'ai-detector':
                return this.getAIDetectorInterface();
            case 'text-summarizer':
                return this.getTextSummarizerInterface();
            case 'plagiarism-checker':
                return this.getPlagiarismCheckerInterface();
            case 'color-generator':
                return this.getColorGeneratorInterface();
            case 'markdown-editor':
                return this.getMarkdownEditorInterface();
            case 'pdf-converter':
                return this.getPDFConverterInterface();
            case 'image-compressor':
                return this.getImageCompressorInterface();
            default:
                return this.getDefaultInterface(tool);
        }
    }

    // Password Generator
    getPasswordGeneratorInterface() {
        return `
            <div class="tool-interface">
                <div class="tool-section">
                    <h3 class="tool-section__title">Password Configuration</h3>
                    <div class="form-group">
                        <label class="form-label">Password Length: <span id="lengthValue">16</span></label>
                        <input type="range" class="form-control" id="passwordLength" min="4" max="128" value="16">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Character Types</label>
                        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="includeUppercase" checked> Uppercase Letters (A-Z)
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="includeLowercase" checked> Lowercase Letters (a-z)
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="includeNumbers" checked> Numbers (0-9)
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="includeSymbols" checked> Symbols (!@#$%^&*)
                            </label>
                        </div>
                    </div>
                    <button class="btn btn--primary" id="generatePasswordBtn">Generate Password</button>
                </div>
                <div class="result-section hidden" id="passwordResult">
                    <h4 class="result-section__title">Generated Password</h4>
                    <div id="passwordOutput" style="font-family: var(--font-family-mono); font-size: 18px; font-weight: bold; padding: 16px; background: var(--color-surface); border-radius: var(--radius-base); margin-bottom: 16px; word-break: break-all; border: 2px solid var(--color-primary);"></div>
                    <div id="passwordStrength" style="margin-bottom: 16px;"></div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn--secondary" id="copyPasswordBtn">📋 Copy Password</button>
                        <button class="btn btn--outline" id="regeneratePasswordBtn">🔄 Generate New</button>
                    </div>
                </div>
            </div>
        `;
    }

    setupPasswordGeneratorListeners() {
        const lengthSlider = document.getElementById('passwordLength');
        const lengthValue = document.getElementById('lengthValue');
        const generateBtn = document.getElementById('generatePasswordBtn');
        const copyBtn = document.getElementById('copyPasswordBtn');
        const regenerateBtn = document.getElementById('regeneratePasswordBtn');
        
        if (lengthSlider && lengthValue) {
            lengthSlider.addEventListener('input', (e) => {
                lengthValue.textContent = e.target.value;
            });
        }

        [generateBtn, regenerateBtn].forEach(btn => {
            btn?.addEventListener('click', () => this.generatePassword());
        });

        copyBtn?.addEventListener('click', () => {
            const passwordOutput = document.getElementById('passwordOutput');
            if (passwordOutput) {
                this.copyToClipboard(passwordOutput.textContent);
            }
        });
    }

    generatePassword() {
        const lengthSlider = document.getElementById('passwordLength');
        const includeUppercase = document.getElementById('includeUppercase');
        const includeLowercase = document.getElementById('includeLowercase');
        const includeNumbers = document.getElementById('includeNumbers');
        const includeSymbols = document.getElementById('includeSymbols');

        if (!lengthSlider) return;

        const length = parseInt(lengthSlider.value);
        let charset = '';
        
        if (includeUppercase?.checked) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeLowercase?.checked) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (includeNumbers?.checked) charset += '0123456789';
        if (includeSymbols?.checked) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (!charset) {
            this.showToast('Please select at least one character type', 'error');
            return;
        }

        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        const resultDiv = document.getElementById('passwordResult');
        const outputDiv = document.getElementById('passwordOutput');
        const strengthDiv = document.getElementById('passwordStrength');
        
        if (outputDiv) outputDiv.textContent = password;
        if (strengthDiv) strengthDiv.innerHTML = this.calculatePasswordStrength(password);
        if (resultDiv) resultDiv.classList.remove('hidden');

        this.incrementUsage(this.currentTool.storageKey);
        this.trackEvent('tool_used', { tool: 'Password Generator', length });
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];

        // Length scoring
        if (password.length >= 12) score += 25;
        else if (password.length >= 8) score += 15;
        else feedback.push('Use at least 8 characters');

        // Character variety
        if (/[A-Z]/.test(password)) score += 15;
        else feedback.push('Add uppercase letters');
        
        if (/[a-z]/.test(password)) score += 15;
        else feedback.push('Add lowercase letters');
        
        if (/[0-9]/.test(password)) score += 15;
        else feedback.push('Add numbers');
        
        if (/[^A-Za-z0-9]/.test(password)) score += 20;
        else feedback.push('Add special characters');

        // Repetition penalty
        const uniqueChars = new Set(password).size;
        if (uniqueChars / password.length > 0.7) score += 10;

        let strength, color;
        if (score >= 80) {
            strength = 'Very Strong';
            color = 'var(--color-success)';
        } else if (score >= 60) {
            strength = 'Strong';
            color = 'var(--color-success)';
        } else if (score >= 40) {
            strength = 'Medium';
            color = 'var(--color-warning)';
        } else {
            strength = 'Weak';
            color = 'var(--color-error)';
        }

        return `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span>Strength: <strong style="color: ${color};">${strength}</strong></span>
                <div style="flex: 1; height: 8px; background: var(--color-secondary); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${score}%; height: 100%; background: ${color}; transition: width 0.3s ease;"></div>
                </div>
                <span style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">${score}%</span>
            </div>
            ${feedback.length > 0 ? `<div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">💡 ${feedback.join(', ')}</div>` : ''}
        `;
    }

    // QR Code Generator
    getQRGeneratorInterface() {
        return `
            <div class="tool-interface">
                <div class="tool-section">
                    <h3 class="tool-section__title">QR Code Configuration</h3>
                    <div class="form-group">
                        <label class="form-label">Content Type</label>
                        <select class="form-control" id="qrType">
                            <option value="text">Text</option>
                            <option value="url">Website URL</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone Number</option>
                            <option value="wifi">WiFi Network</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Content</label>
                        <textarea class="form-control" id="qrContent" rows="3" placeholder="Enter content for QR code..."></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Size</label>
                        <select class="form-control" id="qrSize">
                            <option value="256">Small (256x256)</option>
                            <option value="512">Medium (512x512)</option>
                            <option value="1024">Large (1024x1024)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Colors</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label class="form-label">Foreground</label>
                                <input type="color" class="form-control" id="qrForeground" value="#000000" style="height: 40px;">
                            </div>
                            <div>
                                <label class="form-label">Background</label>
                                <input type="color" class="form-control" id="qrBackground" value="#ffffff" style="height: 40px;">
                            </div>
                        </div>
                    </div>
                    <button class="btn btn--primary" id="generateQRBtn">Generate QR Code</button>
                </div>
                <div class="result-section hidden" id="qrResult">
                    <h4 class="result-section__title">Generated QR Code</h4>
                    <div id="qrOutput" style="text-align: center; margin-bottom: 16px;"></div>
                    <button class="btn btn--secondary" id="downloadQRBtn">💾 Download QR Code</button>
                </div>
            </div>
        `;
    }

    setupQRGeneratorListeners() {
        document.getElementById('generateQRBtn')?.addEventListener('click', () => {
            this.generateQRCode();
        });
    }

    generateQRCode() {
        const content = document.getElementById('qrContent')?.value.trim();
        const size = parseInt(document.getElementById('qrSize')?.value || '256');
        const type = document.getElementById('qrType')?.value || 'text';
        const foreground = document.getElementById('qrForeground')?.value || '#000000';
        const background = document.getElementById('qrBackground')?.value || '#ffffff';

        if (!content) {
            this.showToast('Please enter content for the QR code', 'error');
            return;
        }

        let formattedContent = content;
        switch (type) {
            case 'email':
                formattedContent = `mailto:${content}`;
                break;
            case 'phone':
                formattedContent = `tel:${content}`;
                break;
            case 'url':
                if (!content.startsWith('http')) {
                    formattedContent = `https://${content}`;
                }
                break;
        }

        const resultDiv = document.getElementById('qrResult');
        const outputDiv = document.getElementById('qrOutput');
        
        if (!outputDiv || !resultDiv) return;

        if (typeof QRCode !== 'undefined') {
            const canvas = document.createElement('canvas');
            outputDiv.innerHTML = '';
            outputDiv.appendChild(canvas);
            
            QRCode.toCanvas(canvas, formattedContent, {
                width: size,
                margin: 2,
                color: {
                    dark: foreground,
                    light: background
                }
            }, (error) => {
                if (error) {
                    this.showToast('Error generating QR code', 'error');
                    return;
                }

                const downloadBtn = document.getElementById('downloadQRBtn');
                if (downloadBtn) {
                    downloadBtn.onclick = () => {
                        const link = document.createElement('a');
                        link.download = 'qrcode.png';
                        link.href = canvas.toDataURL();
                        link.click();
                    };
                }
            });
        } else {
            outputDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; border: 2px dashed var(--color-border); border-radius: var(--radius-base);">
                    <div style="font-size: 48px; margin-bottom: 16px;">⬜</div>
                    <h4>QR Code Generated</h4>
                    <p>Content: ${formattedContent}</p>
                    <p>Size: ${size}x${size}</p>
                </div>
            `;
        }

        resultDiv.classList.remove('hidden');
        this.incrementUsage(this.currentTool.storageKey);
        this.trackEvent('tool_used', { tool: 'QR Code Generator', type, size });
    }

    // URL Shortener
    getURLShortenerInterface() {
        return `
            <div class="tool-interface">
                <div class="tool-section">
                    <h3 class="tool-section__title">URL Shortener</h3>
                    <div class="form-group">
                        <label class="form-label">Long URL</label>
                        <input type="url" class="form-control" id="longUrl" placeholder="https://example.com/very-long-url">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Custom Alias (optional)</label>
                        <input type="text" class="form-control" id="customAlias" placeholder="my-custom-link">
                    </div>
                    <button class="btn btn--primary" id="shortenUrlBtn">Shorten URL</button>
                </div>
                <div class="result-section hidden" id="urlResult">
                    <h4 class="result-section__title">Shortened URL</h4>
                    <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                        <input type="text" class="form-control" id="shortUrlOutput" readonly style="flex: 1;">
                        <button class="btn btn--secondary" id="copyUrlBtn">📋 Copy</button>
                    </div>
                    <div id="urlAnalytics" style="margin-top: 16px;"></div>
                </div>
            </div>
        `;
    }

    setupURLShortenerListeners() {
        document.getElementById('shortenUrlBtn')?.addEventListener('click', () => {
            this.shortenURL();
        });

        document.getElementById('copyUrlBtn')?.addEventListener('click', () => {
            const shortUrlOutput = document.getElementById('shortUrlOutput');
            if (shortUrlOutput) {
                this.copyToClipboard(shortUrlOutput.value);
            }
        });
    }

    shortenURL() {
        const longUrl = document.getElementById('longUrl')?.value.trim();
        const customAlias = document.getElementById('customAlias')?.value.trim();

        if (!longUrl) {
            this.showToast('Please enter a URL to shorten', 'error');
            return;
        }

        try {
            new URL(longUrl);
        } catch (e) {
            this.showToast('Please enter a valid URL', 'error');
            return;
        }

        const shortCode = customAlias || this.generateShortCode();
        const shortUrl = `https://toolhub.io/${shortCode}`;
        
        // Store in local database
        this.urlDatabase[shortCode] = {
            originalUrl: longUrl,
            shortUrl: shortUrl,
            clicks: 0,
            created: new Date().toISOString(),
            lastAccessed: null
        };
        
        localStorage.setItem('url_database', JSON.stringify(this.urlDatabase));

        const resultDiv = document.getElementById('urlResult');
        const shortUrlOutput = document.getElementById('shortUrlOutput');
        const analyticsDiv = document.getElementById('urlAnalytics');
        
        if (shortUrlOutput) shortUrlOutput.value = shortUrl;
        if (analyticsDiv) {
            analyticsDiv.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; padding: 16px; background: var(--color-surface); border-radius: var(--radius-base);">
                    <div style="text-align: center;">
                        <div style="font-size: var(--font-size-2xl); font-weight: bold; color: var(--color-primary);">0</div>
                        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">Total Clicks</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: var(--font-size-2xl); font-weight: bold; color: var(--color-success);">✓</div>
                        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">Active</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: var(--font-size-2xl); font-weight: bold; color: var(--color-info);">🌍</div>
                        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">Global</div>
                    </div>
                </div>
                <p style="margin-top: 12px; font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    💡 <strong>Note:</strong> This is a demo URL shortener. In production, clicks would be tracked in real-time.
                </p>
            `;
        }
        if (resultDiv) resultDiv.classList.remove('hidden');

        this.incrementUsage(this.currentTool.storageKey);
        this.trackEvent('tool_used', { tool: 'URL Shortener', hasCustomAlias: !!customAlias });
    }

    generateShortCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // AI Content Detector
    getAIDetectorInterface() {
        return `
            <div class="tool-interface">
                <div class="tool-section">
                    <h3 class="tool-section__title">AI Content Analysis</h3>
                    <div class="form-group">
                        <label class="form-label">Text to Analyze (minimum 100 characters)</label>
                        <textarea class="form-control" id="aiText" rows="8" placeholder="Paste your text here to check if it was generated by AI..."></textarea>
                        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: 4px;">
                            Characters: <span id="charCount">0</span>/100 minimum
                        </div>
                    </div>
                    <button class="btn btn--primary" id="analyzeTextBtn">Analyze Text</button>
                </div>
                <div class="result-section hidden" id="aiResult">
                    <h4 class="result-section__title">Analysis Results</h4>
                    <div id="aiOutput"></div>
                </div>
            </div>
        `;
    }

    setupAIDetectorListeners() {
        const textArea = document.getElementById('aiText');
        const charCount = document.getElementById('charCount');
        
        textArea?.addEventListener('input', (e) => {
            if (charCount) {
                charCount.textContent = e.target.value.length;
            }
        });

        document.getElementById('analyzeTextBtn')?.addEventListener('click', () => {
            this.analyzeAIContent();
        });
    }

    analyzeAIContent() {
        const text = document.getElementById('aiText')?.value.trim();
        
        if (!text || text.length < 100) {
            this.showToast('Please enter at least 100 characters', 'error');
            return;
        }

        const resultDiv = document.getElementById('aiResult');
        const outputDiv = document.getElementById('aiOutput');
        
        if (!outputDiv || !resultDiv) return;

        // Simulate AI analysis with progress
        outputDiv.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div class="loading" style="margin-bottom: 16px;"></div>
                <p>Analyzing text with AI detection algorithms...</p>
            </div>
        `;
        resultDiv.classList.remove('hidden');

        setTimeout(() => {
            const aiProbability = this.calculateAIProbability(text);
            const confidence = Math.floor(Math.random() * 20) + 80; // 80-99%
            
            let verdict, color;
            if (aiProbability < 30) {
                verdict = 'Likely Human-Written';
                color = 'var(--color-success)';
            } else if (aiProbability < 70) {
                verdict = 'Possibly AI-Generated';
                color = 'var(--color-warning)';
            } else {
                verdict = 'Likely AI-Generated';
                color = 'var(--color-error)';
            }

            outputDiv.innerHTML = `
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 48px; font-weight: bold; color: ${color}; margin-bottom: 8px;">
                        ${aiProbability}%
                    </div>
                    <div style="font-size: var(--font-size-lg); font-weight: medium; color: ${color};">
                        ${verdict}
                    </div>
                    <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: 4px;">
                        Confidence: ${confidence}%
                    </div>
                </div>
                
                <div style="background: var(--color-surface); padding: 16px; border-radius: var(--radius-base); margin-bottom: 16px;">
                    <h5 style="margin-bottom: 12px;">Analysis Breakdown:</h5>
                    <div style="display: grid; gap: 8px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>Vocabulary complexity:</span>
                            <span style="color: ${color};">${this.getRandomScore()}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Sentence structure:</span>
                            <span style="color: ${color};">${this.getRandomScore()}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Repetition patterns:</span>
                            <span style="color: ${color};">${this.getRandomScore()}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Writing style:</span>
                            <span style="color: ${color};">${this.getRandomScore()}%</span>
                        </div>
                    </div>
                </div>

                <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); text-align: left;">
                    <p><strong>Note:</strong> This is a demo of AI content detection. Results are simulated based on text characteristics and should not be used for actual AI detection purposes.</p>
                </div>
            `;

            this.incrementUsage(this.currentTool.storageKey);
            this.trackEvent('tool_used', { tool: 'AI Content Detector', textLength: text.length, aiProbability });
        }, 2000);
    }

    calculateAIProbability(text) {
        // Simple heuristic for demo purposes
        let score = 0;
        
        // Check for repetitive patterns
        const words = text.toLowerCase().split(/\s+/);
        const uniqueWords = new Set(words).size;
        const repetitionRatio = uniqueWords / words.length;
        if (repetitionRatio < 0.7) score += 20;
        
        // Check for very formal language
        const formalWords = ['furthermore', 'therefore', 'however', 'consequently', 'nonetheless'];
        const formalCount = formalWords.filter(word => text.toLowerCase().includes(word)).length;
        score += formalCount * 10;
        
        // Check sentence length variance
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
        if (avgLength > 100) score += 15;
        
        // Random factor for demonstration
        score += Math.floor(Math.random() * 30);
        
        return Math.min(95, Math.max(5, score));
    }

    getRandomScore() {
        return Math.floor(Math.random() * 30) + 50;
    }

    // Additional tool interfaces (simplified for brevity)
    getTextSummarizerInterface() {
        return `
            <div class="tool-interface">
                <div class="tool-section">
                    <h3 class="tool-section__title">Text Summarization</h3>
                    <div class="form-group">
                        <label class="form-label">Text to Summarize (minimum 500 characters)</label>
                        <textarea class="form-control" rows="10" placeholder="Paste your long text here to get a summary..."></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Summary Length</label>
                        <select class="form-control">
                            <option value="short">Short (25%)</option>
                            <option value="medium" selected>Medium (50%)</option>
                            <option value="long">Long (75%)</option>
                        </select>
                    </div>
                    <button class="btn btn--primary" onclick="app.simulateToolUse('Text Summarizer')">Summarize Text</button>
                </div>
            </div>
        `;
    }

    getPlagiarismCheckerInterface() {
        return `
            <div class="tool-interface">
                <div class="tool-section">
                    <h3 class="tool-section__title">Plagiarism Detection</h3>
                    <div class="form-group">
                        <label class="form-label">Text to Check (minimum 100 characters)</label>
                        <textarea class="form-control" rows="8" placeholder="Paste your text here to check for plagiarism..."></textarea>
                    </div>
                    <button class="btn btn--primary" onclick="app.simulateToolUse('Plagiarism Checker')">Check Plagiarism</button>
                </div>
            </div>
        `;
    }

    getColorGeneratorInterface() {
        return `
            <div class="tool-interface">
                <div class="tool-section">
                    <h3 class="tool-section__title">Color Palette Generator</h3>
                    <div class="form-group">
                        <label class="form-label">Generation Method</label>
                        <select class="form-control" id="colorMethod">
                            <option value="random">Random Palette</option>
                            <option value="complementary">Complementary Colors</option>
                            <option value="monochromatic">Monochromatic</option>
                            <option value="triadic">Triadic</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Base Color</label>
                        <input type="color" class="form-control" id="baseColor" value="#3498db" style="height: 50px;">
                    </div>
                    <button class="btn btn--primary" id="generatePaletteBtn">Generate Palette</button>
                </div>
                <div class="result-section hidden" id="paletteResult">
                    <h4 class="result-section__title">Generated Palette</h4>
                    <div id="paletteOutput"></div>
                </div>
            </div>
        `;
    }

    getMarkdownEditorInterface() {
        return `
            <div class="tool-interface">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; height: 500px;">
                    <div class="tool-section">
                        <h3 class="tool-section__title">Markdown Editor</h3>
                        <textarea class="form-control" id="markdownInput" style="height: calc(100% - 60px); resize: none;" placeholder="# Write your markdown here..."># Hello ToolHub Master

This is a **Markdown** editor with _real-time_ preview.

## Features

- Live preview
- Export to HTML
- Full markdown support

> Sample blockquote

\`\`\`javascript
const greeting = "Hello World!";
console.log(greeting);
\`\`\`

[Link example](https://example.com)</textarea>
                        <button class="btn btn--secondary" id="exportMarkdownBtn" style="margin-top: 8px;">💾 Export HTML</button>
                    </div>
                    <div class="tool-section">
                        <h3 class="tool-section__title">Live Preview</h3>
                        <div id="markdownPreview" style="height: calc(100% - 60px); border: 1px solid var(--color-border); border-radius: var(--radius-base); padding: 16px; overflow-y: auto; background: var(--color-surface);"></div>
                    </div>
                </div>
            </div>
        `;
    }

    getPDFConverterInterface() {
        return `
            <div class="tool-interface">
                <div class="tool-section">
                    <h3 class="tool-section__title">PDF Operations</h3>
                    <div class="file-upload" onclick="document.getElementById('pdfFile').click()">
                        <div class="file-upload__icon">📄</div>
                        <div class="file-upload__text">Upload PDF File</div>
                        <div class="file-upload__subtext">Click to select or drag and drop</div>
                        <input type="file" id="pdfFile" accept=".pdf" style="display: none;">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Operation</label>
                        <select class="form-control">
                            <option>Compress PDF</option>
                            <option>Split PDF</option>
                            <option>Merge PDFs</option>
                            <option>PDF to Images</option>
                        </select>
                    </div>
                    <button class="btn btn--primary" onclick="app.simulateToolUse('PDF Converter Suite')">Process PDF</button>
                </div>
            </div>
        `;
    }

    getImageCompressorInterface() {
        return `
            <div class="tool-interface">
                <div class="tool-section">
                    <h3 class="tool-section__title">Image Compression</h3>
                    <div class="file-upload" onclick="document.getElementById('imageFile').click()">
                        <div class="file-upload__icon">🖼️</div>
                        <div class="file-upload__text">Upload Image</div>
                        <div class="file-upload__subtext">Supports JPEG, PNG, WebP</div>
                        <input type="file" id="imageFile" accept="image/*" style="display: none;">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Quality: <span id="qualityValue">80%</span></label>
                        <input type="range" class="form-control" min="10" max="100" value="80" id="qualitySlider">
                    </div>
                    <button class="btn btn--primary" onclick="app.simulateToolUse('Smart Image Compressor')">Compress Image</button>
                </div>
            </div>
        `;
    }

    getDefaultInterface(tool) {
        return `
            <div class="tool-interface">
                <div class="text-center" style="padding: 40px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">${tool.icon}</div>
                    <h3>${tool.name}</h3>
                    <p style="margin-bottom: 24px;">${tool.description}</p>
                    <button class="btn btn--primary" onclick="app.simulateToolUse('${tool.name}')">Use ${tool.name}</button>
                </div>
            </div>
        `;
    }

    // Event Listeners Setup
    setupToolEventListeners(tool) {
        switch (tool.id) {
            case 'password-generator':
                this.setupPasswordGeneratorListeners();
                break;
            case 'qr-generator':
                this.setupQRGeneratorListeners();
                break;
            case 'url-shortener':
                this.setupURLShortenerListeners();
                break;
            case 'ai-detector':
                this.setupAIDetectorListeners();
                break;
            case 'color-generator':
                this.setupColorGeneratorListeners();
                break;
            case 'markdown-editor':
                this.setupMarkdownEditorListeners();
                break;
            case 'image-compressor':
                this.setupImageCompressorListeners();
                break;
        }
    }

    setupColorGeneratorListeners() {
        document.getElementById('generatePaletteBtn')?.addEventListener('click', () => {
            this.generateColorPalette();
        });
    }

    generateColorPalette() {
        const method = document.getElementById('colorMethod')?.value || 'random';
        const baseColor = document.getElementById('baseColor')?.value || '#3498db';
        
        const colors = this.generateColors(baseColor, method);
        
        const resultDiv = document.getElementById('paletteResult');
        const outputDiv = document.getElementById('paletteOutput');
        
        if (outputDiv) {
            outputDiv.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 16px;">
                    ${colors.map(color => `
                        <div style="text-align: center;">
                            <div style="width: 100%; height: 80px; background: ${color}; border-radius: var(--radius-base); margin-bottom: 8px; cursor: pointer; transition: transform 0.2s ease;" onclick="app.copyToClipboard('${color}')"></div>
                            <div style="font-family: var(--font-family-mono); font-size: var(--font-size-sm);">${color}</div>
                        </div>
                    `).join('')}
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn--secondary" onclick="app.copyToClipboard('${colors.join(', ')}')">📋 Copy All</button>
                    <button class="btn btn--outline" onclick="app.exportPalette([${colors.map(c => `'${c}'`).join(', ')}])">💾 Export CSS</button>
                </div>
            `;
        }
        if (resultDiv) resultDiv.classList.remove('hidden');

        this.incrementUsage(this.currentTool.storageKey);
        this.trackEvent('tool_used', { tool: 'Color Palette Generator', method });
    }

    generateColors(baseColor, method) {
        const colors = [baseColor];
        const hsl = this.hexToHsl(baseColor);
        
        switch (method) {
            case 'complementary':
                colors.push(this.hslToHex((hsl[0] + 180) % 360, hsl[1], hsl[2]));
                colors.push(this.hslToHex((hsl[0] + 30) % 360, hsl[1], Math.max(20, hsl[2] - 20)));
                colors.push(this.hslToHex((hsl[0] + 210) % 360, hsl[1], Math.max(20, hsl[2] - 20)));
                colors.push(this.hslToHex(hsl[0], hsl[1], Math.min(80, hsl[2] + 20)));
                break;
            case 'monochromatic':
                for (let i = 1; i < 5; i++) {
                    colors.push(this.hslToHex(hsl[0], hsl[1], Math.max(10, Math.min(90, hsl[2] + (i * 15) - 30))));
                }
                break;
            case 'triadic':
                colors.push(this.hslToHex((hsl[0] + 120) % 360, hsl[1], hsl[2]));
                colors.push(this.hslToHex((hsl[0] + 240) % 360, hsl[1], hsl[2]));
                colors.push(this.hslToHex(hsl[0], Math.max(20, hsl[1] - 20), hsl[2]));
                colors.push(this.hslToHex(hsl[0], Math.min(100, hsl[1] + 20), hsl[2]));
                break;
            default: // random
                for (let i = 1; i < 5; i++) {
                    colors.push(this.generateRandomColor());
                }
        }
        
        return colors;
    }

    setupMarkdownEditorListeners() {
        const input = document.getElementById('markdownInput');
        const preview = document.getElementById('markdownPreview');
        const exportBtn = document.getElementById('exportMarkdownBtn');
        
        if (input && preview) {
            const updatePreview = () => {
                if (typeof markdownit !== 'undefined') {
                    const md = markdownit();
                    preview.innerHTML = md.render(input.value);
                } else {
                    // Fallback basic markdown rendering
                    let html = input.value
                        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/`(.*?)`/g, '<code>$1</code>')
                        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
                        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
                        .replace(/\n/g, '<br>');
                    preview.innerHTML = html;
                }
            };
            
            input.addEventListener('input', updatePreview);
            updatePreview(); // Initial render
        }
        
        exportBtn?.addEventListener('click', () => {
            const html = preview?.innerHTML || '';
            const blob = new Blob([`<!DOCTYPE html><html><head><title>Exported Markdown</title></head><body>${html}</body></html>`], 
                                 { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'markdown-export.html';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    setupImageCompressorListeners() {
        const qualitySlider = document.getElementById('qualitySlider');
        const qualityValue = document.getElementById('qualityValue');
        
        qualitySlider?.addEventListener('input', (e) => {
            if (qualityValue) {
                qualityValue.textContent = `${e.target.value}%`;
            }
        });
    }

    // Utility Functions
    simulateToolUse(toolName) {
        const tool = this.tools.find(t => t.name === toolName);
        if (tool) {
            this.incrementUsage(tool.storageKey);
            this.trackEvent('tool_used', { tool: toolName });
        }
        this.showToast(`${toolName} executed successfully!`, 'success');
    }

    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Copied to clipboard!', 'success');
        } catch (err) {
            this.showToast('Failed to copy to clipboard', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    exportPalette(colors) {
        const css = `:root {
  --primary-color: ${colors[0]};
  --secondary-color: ${colors[1]};
  --accent-color: ${colors[2]};
  --background-color: ${colors[3]};
  --text-color: ${colors[4]};
}`;
        
        const blob = new Blob([css], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'color-palette.css';
        a.click();
        URL.revokeObjectURL(url);
    }

    generateRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    hexToHsl(hex) {
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
        
        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }

    hslToHex(h, s, l) {
        h = h % 360;
        s = s / 100;
        l = l / 100;
        
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;
        
        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }
        
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: var(--color-${type === 'success' ? 'success' : type === 'error' ? 'error' : 'primary'});
            color: white; padding: 12px 20px; border-radius: var(--radius-base);
            font-weight: 500; box-shadow: var(--shadow-lg);
            animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-in 2.7s;
            animation-fill-mode: both;
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 3000);
    }

    // Upgrade Handling
    handleUpgrade(planType) {
        this.trackEvent('upgrade_clicked', { plan: planType });
        this.showToast(`${planType} plan selected! Redirecting to checkout...`, 'success');
        
        // Simulate Stripe integration
        setTimeout(() => {
            alert(`${planType} checkout would be handled by Stripe payment processor in production.`);
            this.closeModal('upgradeModal');
        }, 1500);
    }

    // Analytics
    trackPageView() {
        if (typeof gtag !== 'undefined') {
            gtag('config', 'G-M68FKRBLX2', {
                page_title: 'ToolHub Master',
                page_location: window.location.href
            });
        }
    }

    trackEvent(action, parameters = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'tools',
                ...parameters
            });
        }
        console.log('Event tracked:', action, parameters);
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ToolHubMaster();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);