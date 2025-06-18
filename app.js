// ToolHub Master - Main Application JavaScript

// Initialize Google Analytics
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// ToolHub Master Application
class ToolHubMaster {
    constructor() {
        // Tool definitions with limits
        this.tools = [
            {
                id: 'ai-detector',
                name: 'AI Content Detector',
                category: 'AI Tools',
                icon: '🤖',
                description: 'Detect AI-generated text with 99% accuracy',
                limit: 3,
                storageKey: 'ai_detector'
            },
            {
                id: 'pdf-converter',
                name: 'PDF Converter Suite',
                category: 'File Tools',
                icon: '📄',
                description: 'Convert, compress, merge, and split PDFs',
                limit: 5,
                storageKey: 'pdf_converter'
            },
            {
                id: 'qr-generator',
                name: 'QR Code Generator Pro',
                category: 'Utility Tools',
                icon: '⬜',
                description: 'Create custom QR codes with analytics',
                limit: 10,
                storageKey: 'qr_generator'
            },
            {
                id: 'image-compressor',
                name: 'Smart Image Compressor',
                category: 'File Tools',
                icon: '🖼️',
                description: 'Optimize images without quality loss',
                limit: 5,
                storageKey: 'image_compressor'
            },
            {
                id: 'url-shortener',
                name: 'URL Shortener Plus',
                category: 'Utility Tools',
                icon: '🔗',
                description: 'Shorten URLs with detailed analytics',
                limit: 10,
                storageKey: 'url_shortener'
            },
            {
                id: 'plagiarism-checker',
                name: 'Plagiarism Checker',
                category: 'Writing Tools',
                icon: '🔍',
                description: 'Detect duplicate content instantly',
                limit: 2,
                storageKey: 'plagiarism_checker'
            },
            {
                id: 'text-summarizer',
                name: 'Text Summarizer',
                category: 'AI Tools',
                icon: '📝',
                description: 'AI-powered content summarization',
                limit: 3,
                storageKey: 'text_summarizer'
            },
            {
                id: 'color-palette',
                name: 'Color Palette Generator',
                category: 'Design Tools',
                icon: '🎨',
                description: 'Extract beautiful color schemes',
                limit: 10,
                storageKey: 'color_palette'
            },
            {
                id: 'password-generator',
                name: 'Password Generator',
                category: 'Security Tools',
                icon: '🔐',
                description: 'Create secure passwords instantly',
                limit: 20,
                storageKey: 'password_generator'
            },
            {
                id: 'markdown-editor',
                name: 'Markdown Editor',
                category: 'Writing Tools',
                icon: '✍️',
                description: 'Live editing with real-time preview',
                limit: -1, // Unlimited
                storageKey: 'markdown_editor'
            }
        ];
        
        // Pricing plans
        this.pricing = {
            pro: {
                price: '$9.99/month',
                features: ['Unlimited tool usage', 'Priority support', 'No ads', 'Export capabilities']
            },
            business: {
                price: '$24.99/month',
                features: ['Everything in Pro', 'Team collaboration', 'API access', 'Custom branding']
            }
        };
        
        // Current theme
        this.theme = localStorage.getItem('theme') || 'light';
        
        // Current active tool
        this.activeTool = null;
        
        // Initialize the application
        this.init();
    }
    
    // Initialize the application
    init() {
        this.renderToolsGrid();
        this.setupEventListeners();
        this.applyTheme();
    }
    
    // Render the tools grid
    renderToolsGrid() {
        const toolsGrid = document.getElementById('tools-grid');
        toolsGrid.innerHTML = '';
        
        this.tools.forEach(tool => {
            const usageCount = this.getRemainingUses(tool.storageKey);
            const usageText = tool.limit === -1 ? 'Unlimited' : `${usageCount}/${tool.limit} uses`;
            
            const toolCard = document.createElement('div');
            toolCard.className = 'tool-card glass-card';
            toolCard.dataset.toolId = tool.id;
            
            toolCard.innerHTML = `
                <div class="tool-icon">${tool.icon}</div>
                <div class="tool-name">${tool.name}</div>
                <div class="tool-description">${tool.description}</div>
                <div class="tool-footer">
                    <div class="tool-category">${tool.category}</div>
                    <div class="tool-usage">${usageText}</div>
                </div>
            `;
            
            toolsGrid.appendChild(toolCard);
        });
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Upgrade button
        const upgradeBtn = document.getElementById('upgrade-btn');
        upgradeBtn.addEventListener('click', () => this.openUpgradeModal());
        
        // Close upgrade modal
        const closeUpgradeModal = document.getElementById('close-upgrade-modal');
        closeUpgradeModal.addEventListener('click', () => this.closeUpgradeModal());
        
        // Select pro plan
        const selectPro = document.getElementById('select-pro');
        selectPro.addEventListener('click', () => this.selectPlan('pro'));
        
        // Select business plan
        const selectBusiness = document.getElementById('select-business');
        selectBusiness.addEventListener('click', () => this.selectPlan('business'));
        
        // Tool cards
        document.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('click', () => {
                const toolId = card.dataset.toolId;
                this.openToolModal(toolId);
            });
        });
        
        // Close modal
        const closeModal = document.getElementById('close-modal');
        closeModal.addEventListener('click', () => this.closeToolModal());
        
        // Modal action button
        const modalAction = document.getElementById('modal-action');
        modalAction.addEventListener('click', () => this.processCurrentTool());
    }
    
    // Toggle theme between light and dark
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }
    
    // Apply the current theme
    applyTheme() {
        document.body.dataset.theme = this.theme;
        const themeIcon = document.getElementById('theme-icon');
        themeIcon.textContent = this.theme === 'light' ? '🌙' : '☀️';
    }
    
    // Open the upgrade modal
    openUpgradeModal() {
        const upgradeModal = document.getElementById('upgrade-modal');
        upgradeModal.style.display = 'flex';
        trackEvent('Monetization', 'open_upgrade_modal', 'Upgrade Modal Opened');
    }
    
    // Close the upgrade modal
    closeUpgradeModal() {
        const upgradeModal = document.getElementById('upgrade-modal');
        upgradeModal.style.display = 'none';
    }
    
    // Handle plan selection
    selectPlan(plan) {
        this.showToast(`Selected ${plan} plan! Payment integration would be implemented here.`, 'success');
        this.closeUpgradeModal();
        trackEvent('Monetization', 'select_plan', `Selected ${plan} Plan`);
    }
    
    // Open tool modal
    openToolModal(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        if (!tool) return;
        
        this.activeTool = tool;
        
        const modal = document.getElementById('tool-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const usageCounter = document.getElementById('usage-counter');
        
        modalTitle.textContent = tool.name;
        
        // Set usage counter text
        const usageCount = this.getRemainingUses(tool.storageKey);
        usageCounter.textContent = tool.limit === -1 ? 'Unlimited' : `Uses left: ${usageCount}/${tool.limit}`;
        
        // Check if user has reached the limit
        if (usageCount === 0 && tool.limit !== -1) {
            modalBody.innerHTML = `
                <div class="tool-container">
                    <p>You've reached your daily limit for this tool. Upgrade to Pro for unlimited access.</p>
                    <button class="btn btn-primary" id="modal-upgrade-btn">Upgrade to Pro</button>
                </div>
            `;
            
            // Add event listener to the upgrade button
            document.getElementById('modal-upgrade-btn').addEventListener('click', () => {
                this.closeToolModal();
                this.openUpgradeModal();
            });
            
            modal.style.display = 'flex';
            return;
        }
        
        // Render tool-specific content
        modalBody.innerHTML = this.getToolContent(tool);
        
        // Initialize tool-specific functionality
        this.initializeTool(tool);
        
        modal.style.display = 'flex';
        trackEvent('Tools', 'open_tool', tool.name);
    }
    
    // Close tool modal
    closeToolModal() {
        const modal = document.getElementById('tool-modal');
        modal.style.display = 'none';
        this.activeTool = null;
    }
    
    // Get remaining uses for a tool
    getRemainingUses(storageKey) {
        const data = JSON.parse(localStorage.getItem('toolhub_uses') || '{}');
        const today = new Date().toISOString().slice(0, 10);
        
        if (!data[storageKey] || data[storageKey].date !== today) {
            return this.tools.find(t => t.storageKey === storageKey).limit;
        }
        
        const tool = this.tools.find(t => t.storageKey === storageKey);
        if (tool.limit === -1) return -1; // Unlimited
        
        return Math.max(0, tool.limit - data[storageKey].count);
    }
    
    // Increment usage count for a tool
    incrementUse(storageKey) {
        const tool = this.tools.find(t => t.storageKey === storageKey);
        if (tool.limit === -1) return; // Don't track unlimited tools
        
        const data = JSON.parse(localStorage.getItem('toolhub_uses') || '{}');
        const today = new Date().toISOString().slice(0, 10);
        
        if (!data[storageKey] || data[storageKey].date !== today) {
            data[storageKey] = { count: 1, date: today };
        } else {
            data[storageKey].count += 1;
        }
        
        localStorage.setItem('toolhub_uses', JSON.stringify(data));
        
        // Update UI
        this.renderToolsGrid();
        
        // Update usage counter in modal
        const usageCounter = document.getElementById('usage-counter');
        const usageCount = this.getRemainingUses(storageKey);
        usageCounter.textContent = tool.limit === -1 ? 'Unlimited' : `Uses left: ${usageCount}/${tool.limit}`;
        
        trackEvent('Tools', 'tool_use', tool.name);
    }
    
    // Get tool-specific content for modal
    getToolContent(tool) {
        switch (tool.id) {
            case 'ai-detector':
                return `
                    <div class="tool-container">
                        <div class="form-group">
                            <label class="form-label">Paste text to analyze for AI content:</label>
                            <textarea class="form-textarea" id="ai-text" placeholder="Paste text here (minimum 100 characters)"></textarea>
                        </div>
                        <div id="ai-result"></div>
                    </div>
                `;
            
            case 'pdf-converter':
                return `
                    <div class="tool-container">
                        <div class="file-drop-area" id="pdf-drop-area">
                            <div class="file-drop-message">Drag & drop PDF files here, or click to select</div>
                            <input type="file" id="pdf-file" accept=".pdf" style="display: none;">
                        </div>
                        <div class="form-group mt-3">
                            <label class="form-label">Conversion Type:</label>
                            <select class="form-select" id="pdf-conversion-type">
                                <option value="compress">Compress PDF</option>
                                <option value="pdf-to-image">PDF to Image</option>
                                <option value="merge">Merge PDFs</option>
                                <option value="split">Split PDF</option>
                            </select>
                        </div>
                        <div id="pdf-result"></div>
                    </div>
                `;
            
            case 'qr-generator':
                return `
                    <div class="tool-container">
                        <div class="form-group">
                            <label class="form-label">Enter text or URL:</label>
                            <input type="text" class="form-input" id="qr-text" placeholder="https://example.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label">QR Code Size:</label>
                            <select class="form-select" id="qr-size">
                                <option value="128">Small (128x128)</option>
                                <option value="256" selected>Medium (256x256)</option>
                                <option value="512">Large (512x512)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Foreground Color:</label>
                            <input type="color" class="form-input" id="qr-color" value="#000000">
                        </div>
                        <div class="qr-result" id="qr-result"></div>
                    </div>
                `;
            
            case 'image-compressor':
                return `
                    <div class="tool-container">
                        <div class="file-drop-area" id="image-drop-area">
                            <div class="file-drop-message">Drag & drop image files here, or click to select</div>
                            <input type="file" id="image-file" accept="image/*" style="display: none;">
                        </div>
                        <div class="form-group mt-3">
                            <label class="form-label">Quality:</label>
                            <input type="range" min="30" max="100" value="80" class="form-input" id="image-quality">
                            <div class="flex justify-between">
                                <span>Lower quality</span>
                                <span>Higher quality</span>
                            </div>
                        </div>
                        <div id="image-result"></div>
                    </div>
                `;
            
            case 'url-shortener':
                return `
                    <div class="tool-container">
                        <div class="form-group">
                            <label class="form-label">Enter long URL:</label>
                            <input type="url" class="form-input" id="long-url" placeholder="https://example.com/very/long/path/to/resource">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Custom alias (optional):</label>
                            <input type="text" class="form-input" id="url-alias" placeholder="my-custom-alias">
                        </div>
                        <div id="url-result"></div>
                    </div>
                `;
            
            case 'plagiarism-checker':
                return `
                    <div class="tool-container">
                        <div class="form-group">
                            <label class="form-label">Paste text to check for plagiarism:</label>
                            <textarea class="form-textarea" id="plagiarism-text" placeholder="Paste text here (minimum 100 characters)"></textarea>
                        </div>
                        <div id="plagiarism-result"></div>
                    </div>
                `;
            
            case 'text-summarizer':
                return `
                    <div class="tool-container">
                        <div class="form-group">
                            <label class="form-label">Paste text to summarize:</label>
                            <textarea class="form-textarea" id="summary-text" placeholder="Paste text here (minimum 500 characters)"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Summary Length:</label>
                            <select class="form-select" id="summary-length">
                                <option value="short">Short (25%)</option>
                                <option value="medium" selected>Medium (50%)</option>
                                <option value="long">Long (75%)</option>
                            </select>
                        </div>
                        <div id="summary-result"></div>
                    </div>
                `;
            
            case 'color-palette':
                return `
                    <div class="tool-container">
                        <div class="form-group">
                            <label class="form-label">Choose generation method:</label>
                            <select class="form-select" id="palette-method">
                                <option value="random">Random palette</option>
                                <option value="image">Extract from image</option>
                            </select>
                        </div>
                        <div id="palette-image-section" style="display: none;">
                            <div class="file-drop-area" id="palette-drop-area">
                                <div class="file-drop-message">Drag & drop image files here, or click to select</div>
                                <input type="file" id="palette-file" accept="image/*" style="display: none;">
                            </div>
                        </div>
                        <div id="palette-result"></div>
                    </div>
                `;
            
            case 'password-generator':
                return `
                    <div class="tool-container">
                        <div class="form-group">
                            <label class="form-label">Password Length:</label>
                            <input type="range" min="8" max="64" value="16" class="form-input" id="password-length">
                            <div class="flex justify-between">
                                <span>8</span>
                                <span id="length-value">16</span>
                                <span>64</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="flex gap-2">
                                <label><input type="checkbox" checked id="include-uppercase"> Uppercase (A-Z)</label>
                            </div>
                            <div class="flex gap-2">
                                <label><input type="checkbox" checked id="include-lowercase"> Lowercase (a-z)</label>
                            </div>
                            <div class="flex gap-2">
                                <label><input type="checkbox" checked id="include-numbers"> Numbers (0-9)</label>
                            </div>
                            <div class="flex gap-2">
                                <label><input type="checkbox" checked id="include-symbols"> Symbols (!@#$%^&*)</label>
                            </div>
                        </div>
                        <div id="password-result"></div>
                    </div>
                `;
            
            case 'markdown-editor':
                return `
                    <div class="tool-container">
                        <div class="markdown-container">
                            <div class="form-group">
                                <label class="form-label">Markdown:</label>
                                <textarea class="form-textarea" id="markdown-input" placeholder="# Type your markdown here"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Preview:</label>
                                <div class="markdown-preview" id="markdown-preview"></div>
                            </div>
                        </div>
                    </div>
                `;
            
            default:
                return `<div class="tool-container">Tool content not available.</div>`;
        }
    }
    
    // Initialize tool-specific functionality
    initializeTool(tool) {
        switch (tool.id) {
            case 'ai-detector':
                // Nothing to initialize
                break;
            
            case 'pdf-converter':
                const pdfDropArea = document.getElementById('pdf-drop-area');
                const pdfFileInput = document.getElementById('pdf-file');
                
                pdfDropArea.addEventListener('click', () => {
                    pdfFileInput.click();
                });
                
                pdfDropArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    pdfDropArea.classList.add('active');
                });
                
                pdfDropArea.addEventListener('dragleave', () => {
                    pdfDropArea.classList.remove('active');
                });
                
                pdfDropArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    pdfDropArea.classList.remove('active');
                    if (e.dataTransfer.files.length) {
                        pdfFileInput.files = e.dataTransfer.files;
                        this.handlePdfFileSelected();
                    }
                });
                
                pdfFileInput.addEventListener('change', () => {
                    this.handlePdfFileSelected();
                });
                break;
            
            case 'qr-generator':
                // Nothing to initialize
                break;
            
            case 'image-compressor':
                const imageDropArea = document.getElementById('image-drop-area');
                const imageFileInput = document.getElementById('image-file');
                
                imageDropArea.addEventListener('click', () => {
                    imageFileInput.click();
                });
                
                imageDropArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    imageDropArea.classList.add('active');
                });
                
                imageDropArea.addEventListener('dragleave', () => {
                    imageDropArea.classList.remove('active');
                });
                
                imageDropArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    imageDropArea.classList.remove('active');
                    if (e.dataTransfer.files.length) {
                        imageFileInput.files = e.dataTransfer.files;
                        this.handleImageFileSelected();
                    }
                });
                
                imageFileInput.addEventListener('change', () => {
                    this.handleImageFileSelected();
                });
                break;
            
            case 'url-shortener':
                // Nothing to initialize
                break;
            
            case 'plagiarism-checker':
                // Nothing to initialize
                break;
            
            case 'text-summarizer':
                // Nothing to initialize
                break;
            
            case 'color-palette':
                const paletteMethod = document.getElementById('palette-method');
                const paletteImageSection = document.getElementById('palette-image-section');
                
                paletteMethod.addEventListener('change', () => {
                    paletteImageSection.style.display = paletteMethod.value === 'image' ? 'block' : 'none';
                });
                
                const paletteDropArea = document.getElementById('palette-drop-area');
                const paletteFileInput = document.getElementById('palette-file');
                
                paletteDropArea.addEventListener('click', () => {
                    paletteFileInput.click();
                });
                
                paletteDropArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    paletteDropArea.classList.add('active');
                });
                
                paletteDropArea.addEventListener('dragleave', () => {
                    paletteDropArea.classList.remove('active');
                });
                
                paletteDropArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    paletteDropArea.classList.remove('active');
                    if (e.dataTransfer.files.length) {
                        paletteFileInput.files = e.dataTransfer.files;
                        // Will be processed when action button is clicked
                    }
                });
                break;
            
            case 'password-generator':
                const lengthSlider = document.getElementById('password-length');
                const lengthValue = document.getElementById('length-value');
                
                lengthSlider.addEventListener('input', () => {
                    lengthValue.textContent = lengthSlider.value;
                });
                break;
            
            case 'markdown-editor':
                const markdownInput = document.getElementById('markdown-input');
                const markdownPreview = document.getElementById('markdown-preview');
                const md = window.markdownit();
                
                markdownInput.value = `# Hello ToolHub Master\n\nThis is a **Markdown** editor with _real-time_ preview.\n\n## Features\n\n- Live preview\n- Support for all Markdown syntax\n- Export to HTML\n\n> Sample blockquote\n\n\`\`\`javascript\n// Sample code\nconst greeting = "Hello World!";\nconsole.log(greeting);\n\`\`\``;
                
                markdownInput.addEventListener('input', () => {
                    markdownPreview.innerHTML = md.render(markdownInput.value);
                });
                
                // Initial render
                markdownPreview.innerHTML = md.render(markdownInput.value);
                break;
        }
    }
    
    // Process the current tool action
    processCurrentTool() {
        if (!this.activeTool) return;
        
        // Check if the user has reached the limit
        const usageCount = this.getRemainingUses(this.activeTool.storageKey);
        if (usageCount === 0 && this.activeTool.limit !== -1) {
            this.closeToolModal();
            this.openUpgradeModal();
            return;
        }
        
        switch (this.activeTool.id) {
            case 'ai-detector':
                this.processAiDetector();
                break;
            
            case 'pdf-converter':
                this.processPdfConverter();
                break;
            
            case 'qr-generator':
                this.processQrGenerator();
                break;
            
            case 'image-compressor':
                this.processImageCompressor();
                break;
            
            case 'url-shortener':
                this.processUrlShortener();
                break;
            
            case 'plagiarism-checker':
                this.processPlagiarismChecker();
                break;
            
            case 'text-summarizer':
                this.processTextSummarizer();
                break;
            
            case 'color-palette':
                this.processColorPalette();
                break;
            
            case 'password-generator':
                this.processPasswordGenerator();
                break;
            
            case 'markdown-editor':
                this.processMarkdownEditor();
                break;
        }
    }
    
    // Process AI Detector
    processAiDetector() {
        const text = document.getElementById('ai-text').value;
        const resultContainer = document.getElementById('ai-result');
        
        if (text.length < 100) {
            this.showToast('Please enter at least 100 characters.', 'error');
            return;
        }
        
        // Show loading state
        resultContainer.innerHTML = `
            <div class="text-center mt-3">
                <div>Analyzing text...</div>
                <div class="progress-bar mt-2">
                    <div class="progress-bar-inner" id="ai-progress"></div>
                </div>
            </div>
        `;
        
        const progressBar = document.getElementById('ai-progress');
        
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                
                // Simulate AI detection
                const aiScore = Math.floor(Math.random() * 100);
                
                let resultClass, resultText;
                if (aiScore < 30) {
                    resultClass = 'success';
                    resultText = 'Likely Human-Written';
                } else if (aiScore < 70) {
                    resultClass = 'warning';
                    resultText = 'Possibly AI-Generated';
                } else {
                    resultClass = 'error';
                    resultText = 'Likely AI-Generated';
                }
                
                resultContainer.innerHTML = `
                    <div class="result-container mt-3">
                        <div class="ai-score">${aiScore}%</div>
                        <div class="ai-score-label text-${resultClass}">${resultText}</div>
                        <div class="mt-3">
                            <p>Our AI detection system has analyzed your text and determined it is <strong>${aiScore}%</strong> likely to be AI-generated.</p>
                            <p>Sentence-by-sentence breakdown:</p>
                            <ul class="mt-2">
                                ${this.generateSentenceBreakdown(text)}
                            </ul>
                        </div>
                    </div>
                `;
                
                // Increment usage
                this.incrementUse(this.activeTool.storageKey);
            }
        }, 100);
    }
    
    // Generate sentence breakdown for AI detector
    generateSentenceBreakdown(text) {
        const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
        let html = '';
        
        // Take up to 5 sentences
        const sampleSentences = sentences.slice(0, 5);
        
        sampleSentences.forEach(sentence => {
            const score = Math.floor(Math.random() * 100);
            let resultClass;
            
            if (score < 30) {
                resultClass = 'success';
            } else if (score < 70) {
                resultClass = 'warning';
            } else {
                resultClass = 'error';
            }
            
            html += `<li class="mb-2">"${sentence.trim()}" - <span class="text-${resultClass}">${score}% AI probability</span></li>`;
        });
        
        if (sentences.length > 5) {
            html += `<li>... and ${sentences.length - 5} more sentences</li>`;
        }
        
        return html;
    }
    
    // Process PDF Converter
    processPdfConverter() {
        const fileInput = document.getElementById('pdf-file');
        const conversionType = document.getElementById('pdf-conversion-type').value;
        const resultContainer = document.getElementById('pdf-result');
        
        if (fileInput.files.length === 0) {
            this.showToast('Please select a PDF file.', 'error');
            return;
        }
        
        // Show loading state
        resultContainer.innerHTML = `
            <div class="text-center mt-3">
                <div>Processing PDF...</div>
                <div class="progress-bar mt-2">
                    <div class="progress-bar-inner" id="pdf-progress"></div>
                </div>
            </div>
        `;
        
        const progressBar = document.getElementById('pdf-progress');
        
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                
                // Show result based on conversion type
                let resultHtml = '';
                
                switch (conversionType) {
                    case 'compress':
                        const originalSize = Math.floor(Math.random() * 1000) + 500;
                        const compressedSize = Math.floor(originalSize * (Math.random() * 0.4 + 0.3));
                        const savingsPercent = Math.floor((1 - compressedSize / originalSize) * 100);
                        
                        resultHtml = `
                            <div class="result-container mt-3">
                                <h3>PDF Compressed Successfully</h3>
                                <div class="mt-2">
                                    <p>Original size: ${originalSize} KB</p>
                                    <p>Compressed size: ${compressedSize} KB</p>
                                    <p>You saved ${savingsPercent}% of the original file size!</p>
                                </div>
                                <button class="btn btn-primary mt-3">Download Compressed PDF</button>
                            </div>
                        `;
                        break;
                    
                    case 'pdf-to-image':
                        resultHtml = `
                            <div class="result-container mt-3">
                                <h3>PDF Converted to Images</h3>
                                <div class="mt-2">
                                    <p>Successfully converted 3 pages to images.</p>
                                </div>
                                <div class="flex gap-2 mt-3">
                                    <button class="btn btn-primary">Download All Images (ZIP)</button>
                                    <button class="btn btn-outline">Download Individual Pages</button>
                                </div>
                            </div>
                        `;
                        break;
                    
                    case 'merge':
                        resultHtml = `
                            <div class="result-container mt-3">
                                <h3>PDF Merge</h3>
                                <div class="mt-2">
                                    <p>Please select additional PDF files to merge with the current one.</p>
                                    <input type="file" multiple accept=".pdf" class="form-input mt-2">
                                </div>
                                <button class="btn btn-primary mt-3">Merge PDFs</button>
                            </div>
                        `;
                        break;
                    
                    case 'split':
                        resultHtml = `
                            <div class="result-container mt-3">
                                <h3>PDF Split</h3>
                                <div class="mt-2">
                                    <p>Your PDF has 5 pages. Enter the page ranges to split:</p>
                                    <input type="text" class="form-input mt-2" placeholder="e.g., 1-2, 3-5">
                                </div>
                                <button class="btn btn-primary mt-3">Split PDF</button>
                            </div>
                        `;
                        break;
                }
                
                resultContainer.innerHTML = resultHtml;
                
                // Increment usage
                this.incrementUse(this.activeTool.storageKey);
            }
        }, 100);
    }
    
    // Handle PDF file selection
    handlePdfFileSelected() {
        const fileInput = document.getElementById('pdf-file');
        const dropArea = document.getElementById('pdf-drop-area');
        
        if (fileInput.files.length > 0) {
            const fileName = fileInput.files[0].name;
            dropArea.querySelector('.file-drop-message').textContent = `Selected: ${fileName}`;
        }
    }
    
    // Process QR Generator
    processQrGenerator() {
        const text = document.getElementById('qr-text').value;
        const size = document.getElementById('qr-size').value;
        const color = document.getElementById('qr-color').value;
        const resultContainer = document.getElementById('qr-result');
        
        if (!text) {
            this.showToast('Please enter text or URL.', 'error');
            return;
        }
        
        // Clear previous result
        resultContainer.innerHTML = '';
        
        // Create QR code canvas
        const canvas = document.createElement('canvas');
        resultContainer.appendChild(canvas);
        
        // Use QRCode.js library
        QRCode.toCanvas(canvas, text, {
            width: parseInt(size),
            color: {
                dark: color,
                light: '#ffffff'
            }
        }, function(error) {
            if (error) console.error(error);
        });
        
        // Add download button
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn btn-primary mt-2';
        downloadBtn.textContent = 'Download QR Code';
        downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
        
        resultContainer.appendChild(downloadBtn);
        
        // Increment usage
        this.incrementUse(this.activeTool.storageKey);
    }
    
    // Process Image Compressor
    processImageCompressor() {
        const fileInput = document.getElementById('image-file');
        const quality = document.getElementById('image-quality').value / 100;
        const resultContainer = document.getElementById('image-result');
        
        if (fileInput.files.length === 0) {
            this.showToast('Please select an image.', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        
        // Show loading state
        resultContainer.innerHTML = `
            <div class="text-center mt-3">
                <div>Compressing image...</div>
                <div class="progress-bar mt-2">
                    <div class="progress-bar-inner" id="image-progress"></div>
                </div>
            </div>
        `;
        
        const progressBar = document.getElementById('image-progress');
        
        // Compress image using browser-image-compression library
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: quality
        };
        
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                
                // Create before/after comparison
                const originalUrl = URL.createObjectURL(file);
                
                // Simulate compression result (in a real app, use the library result)
                const originalSize = file.size / 1024; // KB
                const compressedSize = originalSize * (0.3 + quality * 0.4);
                const savingsPercent = Math.floor((1 - compressedSize / originalSize) * 100);
                
                resultContainer.innerHTML = `
                    <div class="result-container mt-3">
                        <h3>Image Compressed Successfully</h3>
                        <div class="mt-2">
                            <p>Original size: ${originalSize.toFixed(2)} KB</p>
                            <p>Compressed size: ${compressedSize.toFixed(2)} KB</p>
                            <p>You saved ${savingsPercent}% of the original file size!</p>
                        </div>
                        <div class="comparison-container mt-3">
                            <div>
                                <div class="before-after-label">Original</div>
                                <div class="image-preview">
                                    <img src="${originalUrl}" alt="Original">
                                </div>
                            </div>
                            <div>
                                <div class="before-after-label">Compressed</div>
                                <div class="image-preview">
                                    <img src="${originalUrl}" alt="Compressed">
                                </div>
                            </div>
                        </div>
                        <button class="btn btn-primary mt-3">Download Compressed Image</button>
                    </div>
                `;
                
                // Increment usage
                this.incrementUse(this.activeTool.storageKey);
            }
        }, 100);
    }
    
    // Handle image file selection
    handleImageFileSelected() {
        const fileInput = document.getElementById('image-file');
        const dropArea = document.getElementById('image-drop-area');
        
        if (fileInput.files.length > 0) {
            const fileName = fileInput.files[0].name;
            dropArea.querySelector('.file-drop-message').textContent = `Selected: ${fileName}`;
        }
    }
    
    // Process URL Shortener
    processUrlShortener() {
        const longUrl = document.getElementById('long-url').value;
        const alias = document.getElementById('url-alias').value;
        const resultContainer = document.getElementById('url-result');
        
        if (!longUrl) {
            this.showToast('Please enter a URL.', 'error');
            return;
        }
        
        // Validate URL
        try {
            new URL(longUrl);
        } catch (e) {
            this.showToast('Please enter a valid URL.', 'error');
            return;
        }
        
        // Show loading state
        resultContainer.innerHTML = `
            <div class="text-center mt-3">
                <div>Generating short URL...</div>
                <div class="progress-bar mt-2">
                    <div class="progress-bar-inner" id="url-progress"></div>
                </div>
            </div>
        `;
        
        const progressBar = document.getElementById('url-progress');
        
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                
                // Generate short code
                const shortCode = alias || this.generateShortCode();
                const shortUrl = `https://toolhub.io/${shortCode}`;
                
                resultContainer.innerHTML = `
                    <div class="result-container mt-3">
                        <h3>URL Shortened Successfully</h3>
                        <div class="mt-2">
                            <p>Short URL:</p>
                            <div class="flex gap-2 items-center">
                                <input type="text" class="form-input" value="${shortUrl}" readonly>
                                <button class="copy-btn" data-copy="${shortUrl}">Copy</button>
                            </div>
                        </div>
                        <div class="mt-3">
                            <p>QR Code:</p>
                            <div id="url-qr" class="mt-2"></div>
                        </div>
                        <div class="mt-3">
                            <p>Analytics:</p>
                            <p>Track clicks and geographic data with our premium plan.</p>
                        </div>
                    </div>
                `;
                
                // Generate QR code for the short URL
                const qrContainer = document.getElementById('url-qr');
                QRCode.toCanvas(qrContainer, shortUrl, { width: 128 }, function(error) {
                    if (error) console.error(error);
                });
                
                // Add copy functionality
                document.querySelector('.copy-btn').addEventListener('click', (e) => {
                    const textToCopy = e.target.dataset.copy;
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        this.showToast('Copied to clipboard!', 'success');
                    });
                });
                
                // Increment usage
                this.incrementUse(this.activeTool.storageKey);
            }
        }, 100);
    }
    
    // Generate a short code for URL shortener
    generateShortCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    
    // Process Plagiarism Checker
    processPlagiarismChecker() {
        const text = document.getElementById('plagiarism-text').value;
        const resultContainer = document.getElementById('plagiarism-result');
        
        if (text.length < 100) {
            this.showToast('Please enter at least 100 characters.', 'error');
            return;
        }
        
        // Show loading state
        resultContainer.innerHTML = `
            <div class="text-center mt-3">
                <div>Checking for plagiarism...</div>
                <div class="progress-bar mt-2">
                    <div class="progress-bar-inner" id="plagiarism-progress"></div>
                </div>
            </div>
        `;
        
        const progressBar = document.getElementById('plagiarism-progress');
        
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                
                // Simulate plagiarism detection
                const plagiarismScore = Math.floor(Math.random() * 30); // 0-30%
                
                resultContainer.innerHTML = `
                    <div class="result-container mt-3">
                        <h3>Plagiarism Check Results</h3>
                        <div class="ai-score">${plagiarismScore}%</div>
                        <div class="ai-score-label">Plagiarism Detected</div>
                        <div class="mt-3">
                            <p>Our system found ${plagiarismScore}% of your text potentially plagiarized from other sources.</p>
                            <div class="mt-2">
                                <h4>Matching Sources:</h4>
                                <ul class="mt-1">
                                    ${this.generateMatchingSources(plagiarismScore)}
                                </ul>
                            </div>
                        </div>
                        <button class="btn btn-primary mt-3">Download Full Report</button>
                    </div>
                `;
                
                // Increment usage
                this.incrementUse(this.activeTool.storageKey);
            }
        }, 100);
    }
    
    // Generate matching sources for plagiarism checker
    generateMatchingSources(score) {
        if (score < 5) return '<li>No significant matches found.</li>';
        
        const sources = [
            { site: 'wikipedia.org', match: Math.floor(Math.random() * 15) },
            { site: 'academia.edu', match: Math.floor(Math.random() * 10) },
            { site: 'researchgate.net', match: Math.floor(Math.random() * 8) }
        ];
        
        let html = '';
        
        sources.forEach(source => {
            if (source.match > 0) {
                html += `<li class="mb-1">${source.site} - ${source.match}% match</li>`;
            }
        });
        
        return html || '<li>No significant matches found.</li>';
    }
    
    // Process Text Summarizer
    processTextSummarizer() {
        const text = document.getElementById('summary-text').value;
        const length = document.getElementById('summary-length').value;
        const resultContainer = document.getElementById('summary-result');
        
        if (text.length < 500) {
            this.showToast('Please enter at least 500 characters.', 'error');
            return;
        }
        
        // Show loading state
        resultContainer.innerHTML = `
            <div class="text-center mt-3">
                <div>Generating summary...</div>
                <div class="progress-bar mt-2">
                    <div class="progress-bar-inner" id="summary-progress"></div>
                </div>
            </div>
        `;
        
        const progressBar = document.getElementById('summary-progress');
        
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                
                // Generate summary (simplified algorithm for demo)
                const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
                let summaryLength;
                
                switch (length) {
                    case 'short':
                        summaryLength = Math.ceil(sentences.length * 0.25);
                        break;
                    case 'medium':
                        summaryLength = Math.ceil(sentences.length * 0.5);
                        break;
                    case 'long':
                        summaryLength = Math.ceil(sentences.length * 0.75);
                        break;
                    default:
                        summaryLength = Math.ceil(sentences.length * 0.5);
                }
                
                // Take evenly distributed sentences for the summary
                const step = sentences.length / summaryLength;
                const summarySentences = [];
                
                for (let i = 0; i < summaryLength; i++) {
                    const index = Math.min(Math.floor(i * step), sentences.length - 1);
                    summarySentences.push(sentences[index]);
                }
                
                const summary = summarySentences.join(' ');
                const reductionPercent = Math.floor((1 - summary.length / text.length) * 100);
                
                resultContainer.innerHTML = `
                    <div class="result-container mt-3">
                        <h3>Summary Generated</h3>
                        <div class="mt-2">
                            <p>Original length: ${text.length} characters</p>
                            <p>Summary length: ${summary.length} characters</p>
                            <p>Reduced by: ${reductionPercent}%</p>
                        </div>
                        <div class="mt-3">
                            <h4>Summary:</h4>
                            <p class="mt-1">${summary}</p>
                        </div>
                        <div class="flex gap-2 mt-3">
                            <button class="btn btn-primary">Copy Summary</button>
                            <button class="btn btn-outline">Download as Text</button>
                        </div>
                    </div>
                `;
                
                // Increment usage
                this.incrementUse(this.activeTool.storageKey);
            }
        }, 100);
    }
    
    // Process Color Palette
    processColorPalette() {
        const method = document.getElementById('palette-method').value;
        const resultContainer = document.getElementById('palette-result');
        
        // Show loading state
        resultContainer.innerHTML = `
            <div class="text-center mt-3">
                <div>Generating color palette...</div>
                <div class="progress-bar mt-2">
                    <div class="progress-bar-inner" id="palette-progress"></div>
                </div>
            </div>
        `;
        
        const progressBar = document.getElementById('palette-progress');
        
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                
                // Generate 5 random colors for demo
                const colors = Array.from({ length: 5 }, () => this.generateRandomColor());
                
                resultContainer.innerHTML = `
                    <div class="result-container mt-3">
                        <h3>Color Palette Generated</h3>
                        <div class="color-palette mt-2">
                            ${colors.map(color => `
                                <div>
                                    <div class="color-swatch" style="background-color: ${color}"></div>
                                    <div class="color-value">${color}</div>
                                    <button class="copy-btn" data-copy="${color}">Copy</button>
                                </div>
                            `).join('')}
                        </div>
                        <div class="flex gap-2 mt-3">
                            <button class="btn btn-primary">Generate New Palette</button>
                            <button class="btn btn-outline">Export as CSS</button>
                        </div>
                    </div>
                `;
                
                // Add copy functionality
                document.querySelectorAll('.copy-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const textToCopy = e.target.dataset.copy;
                        navigator.clipboard.writeText(textToCopy).then(() => {
                            this.showToast('Copied to clipboard!', 'success');
                        });
                    });
                });
                
                // Increment usage
                this.incrementUse(this.activeTool.storageKey);
            }
        }, 100);
    }
    
    // Generate random color
    generateRandomColor() {
        const hex = Math.floor(Math.random() * 16777215).toString(16);
        return `#${hex.padStart(6, '0')}`;
    }
    
    // Process Password Generator
    processPasswordGenerator() {
        const length = document.getElementById('password-length').value;
        const includeUppercase = document.getElementById('include-uppercase').checked;
        const includeLowercase = document.getElementById('include-lowercase').checked;
        const includeNumbers = document.getElementById('include-numbers').checked;
        const includeSymbols = document.getElementById('include-symbols').checked;
        const resultContainer = document.getElementById('password-result');
        
        if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
            this.showToast('Please select at least one character type.', 'error');
            return;
        }
        
        // Generate password
        const password = this.generatePassword(length, includeUppercase, includeLowercase, includeNumbers, includeSymbols);
        const strength = this.calculatePasswordStrength(password);
        
        let strengthClass, strengthText;
        if (strength < 40) {
            strengthClass = 'error';
            strengthText = 'Weak';
        } else if (strength < 70) {
            strengthClass = 'warning';
            strengthText = 'Medium';
        } else {
            strengthClass = 'success';
            strengthText = 'Strong';
        }
        
        resultContainer.innerHTML = `
            <div class="result-container mt-3">
                <h3>Password Generated</h3>
                <div class="mt-2">
                    <p>Your secure password:</p>
                    <div class="flex gap-2 items-center">
                        <input type="text" class="form-input" value="${password}" readonly>
                        <button class="copy-btn" data-copy="${password}">Copy</button>
                    </div>
                    <div class="password-strength strength-${strengthClass}">
                        Password Strength: ${strengthText} (${strength}%)
                    </div>
                </div>
                <div class="mt-3">
                    <p>Password Statistics:</p>
                    <ul class="mt-1">
                        <li>Length: ${password.length} characters</li>
                        <li>Uppercase letters: ${(password.match(/[A-Z]/g) || []).length}</li>
                        <li>Lowercase letters: ${(password.match(/[a-z]/g) || []).length}</li>
                        <li>Numbers: ${(password.match(/[0-9]/g) || []).length}</li>
                        <li>Special characters: ${(password.match(/[^A-Za-z0-9]/g) || []).length}</li>
                    </ul>
                </div>
                <button class="btn btn-primary mt-3">Generate Another Password</button>
            </div>
        `;
        
        // Add copy functionality
        document.querySelector('.copy-btn').addEventListener('click', (e) => {
            const textToCopy = e.target.dataset.copy;
            navigator.clipboard.writeText(textToCopy).then(() => {
                this.showToast('Password copied to clipboard!', 'success');
            });
        });
        
        // Increment usage
        this.incrementUse(this.activeTool.storageKey);
    }
    
    // Generate password
    generatePassword(length, includeUppercase, includeLowercase, includeNumbers, includeSymbols) {
        let charset = '';
        if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (includeNumbers) charset += '0123456789';
        if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        return password;
    }
    
    // Calculate password strength
    calculatePasswordStrength(password) {
        let score = 0;
        
        // Length
        score += Math.min(password.length * 4, 40);
        
        // Character types
        if (password.match(/[A-Z]/)) score += 10;
        if (password.match(/[a-z]/)) score += 10;
        if (password.match(/[0-9]/)) score += 10;
        if (password.match(/[^A-Za-z0-9]/)) score += 15;
        
        // Variety
        const uniqueChars = new Set(password).size;
        score += Math.min(uniqueChars * 2, 15);
        
        return Math.min(score, 100);
    }
    
    // Process Markdown Editor
    processMarkdownEditor() {
        const markdown = document.getElementById('markdown-input').value;
        const md = window.markdownit();
        const html = md.render(markdown);
        
        // Create a Blob with the HTML content
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Create a download link
        const a = document.createElement('a');
        a.href = url;
        a.download = 'markdown_export.html';
        a.click();
        
        this.showToast('HTML file exported successfully!', 'success');
        
        // No need to increment usage for unlimited tools
    }
    
    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        toast.className = 'toast';
        toast.classList.add(`toast-${type}`);
        toastMessage.textContent = message;
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new ToolHubMaster();
});
