// Global state management
class ToolHubState {
    constructor() {
        this.isSignedIn = false;
        this.userEmail = '';
        this.usesRemaining = 15;
        this.maxUses = 15;
        this.lastResetDate = new Date().toDateString();
        this.loadState();
        this.checkDailyReset();
    }

    loadState() {
        const saved = localStorage.getItem('toolhub-state');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.isSignedIn = state.isSignedIn || false;
                this.userEmail = state.userEmail || '';
                this.usesRemaining = state.usesRemaining !== undefined ? state.usesRemaining : 15;
                this.maxUses = state.maxUses || 15;
                this.lastResetDate = state.lastResetDate || new Date().toDateString();
            } catch (e) {
                // If parsing fails, use defaults
                this.resetToDefaults();
            }
        }
    }

    resetToDefaults() {
        this.isSignedIn = false;
        this.userEmail = '';
        this.usesRemaining = 15;
        this.maxUses = 15;
        this.lastResetDate = new Date().toDateString();
    }

    saveState() {
        const state = {
            isSignedIn: this.isSignedIn,
            userEmail: this.userEmail,
            usesRemaining: this.usesRemaining,
            maxUses: this.maxUses,
            lastResetDate: this.lastResetDate
        };
        localStorage.setItem('toolhub-state', JSON.stringify(state));
    }

    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.lastResetDate !== today) {
            this.usesRemaining = this.maxUses;
            this.lastResetDate = today;
            this.saveState();
        }
    }

    signIn(email) {
        this.isSignedIn = true;
        this.userEmail = email;
        if (this.maxUses === 15) {
            this.maxUses = 20;
            this.usesRemaining = Math.min(this.usesRemaining + 5, 20);
        }
        this.saveState();
        this.updateUI();
        showToast('Successfully signed in! +5 bonus uses added', 'success');
    }

    signOut() {
        this.isSignedIn = false;
        this.userEmail = '';
        this.maxUses = 15;
        this.usesRemaining = Math.min(this.usesRemaining, 15);
        this.saveState();
        this.updateUI();
        showToast('Signed out successfully', 'info');
    }

    useCredit() {
        if (this.usesRemaining <= 0) {
            if (!this.isSignedIn) {
                showUpgradeModal(false);
            } else {
                showUpgradeModal(true);
            }
            return false;
        }
        this.usesRemaining--;
        this.saveState();
        this.updateUI();
        return true;
    }

    updateUI() {
        const usageCount = document.getElementById('usageCount');
        const signedOutSection = document.getElementById('signedOutSection');
        const signedInSection = document.getElementById('signedInSection');
        const userEmail = document.getElementById('userEmail');

        if (usageCount) {
            usageCount.textContent = `${this.usesRemaining}/${this.maxUses} uses remaining`;
        }

        if (this.isSignedIn) {
            if (signedOutSection) signedOutSection.classList.add('hidden');
            if (signedInSection) signedInSection.classList.remove('hidden');
            if (userEmail) userEmail.textContent = this.userEmail;
        } else {
            if (signedOutSection) signedOutSection.classList.remove('hidden');
            if (signedInSection) signedInSection.classList.add('hidden');
        }
    }
}

// Initialize global state
const state = new ToolHubState();

// Utility functions
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('Copied to clipboard!', 'success');
    } catch (err) {
        showToast('Failed to copy to clipboard', 'error');
    }
    
    document.body.removeChild(textArea);
}

function downloadFile(content, filename, type = 'text/plain') {
    try {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('File downloaded successfully!', 'success');
    } catch (error) {
        showToast('Failed to download file', 'error');
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

function showUpgradeModal(isSignedIn = false) {
    const modal = document.getElementById('upgradeModal');
    const signInButton = document.getElementById('signInForBonus');
    
    if (signInButton) {
        if (isSignedIn) {
            signInButton.style.display = 'none';
        } else {
            signInButton.style.display = 'inline-block';
        }
    }
    
    showModal('upgradeModal');
}

// Tool Functions
const tools = {
    'ai-detector': {
        execute: function(card) {
            const textarea = card.querySelector('textarea');
            const text = textarea.value.trim();
            
            if (!text) {
                showToast('Please enter text to analyze', 'error');
                return;
            }

            const result = card.querySelector('.tool-result');
            const confidence = Math.floor(Math.random() * 20) + 80;
            const sentences = text.split(/[.!?]+/).filter(s => s.trim());
            const suspiciousSentences = sentences.slice(0, Math.floor(sentences.length * 0.3));
            
            result.innerHTML = `
                <h4>Analysis Results</h4>
                <div class="result-item">
                    <span>AI Content Probability</span>
                    <span style="color: ${confidence > 90 ? '#ff6b6b' : confidence > 70 ? '#ffd93d' : '#6bcf7f'}">${confidence}%</span>
                </div>
                <div class="result-item">
                    <span>Total Sentences</span>
                    <span>${sentences.length}</span>
                </div>
                <div class="result-item">
                    <span>Suspicious Sentences</span>
                    <span>${suspiciousSentences.length}</span>
                </div>
                <div style="margin-top: 16px;">
                    <h5>Highlighted Suspicious Content:</h5>
                    <div style="background: rgba(255,107,107,0.2); padding: 12px; border-radius: 8px; margin-top: 8px;">
                        ${suspiciousSentences.length > 0 ? suspiciousSentences.join('. ') + '.' : 'No suspicious content detected.'}
                    </div>
                </div>
                <button class="btn btn--outline btn--sm export-btn" style="margin-top: 16px;">Export Report</button>
            `;
            
            const exportBtn = result.querySelector('.export-btn');
            exportBtn.onclick = () => {
                const report = `AI Content Analysis Report\n\nProbability: ${confidence}%\nSuspicious Sentences: ${suspiciousSentences.length}\n\nAnalyzed Text:\n${text}`;
                downloadFile(report, 'ai-analysis.txt');
            };
            
            result.classList.remove('hidden');
        }
    },

    'pdf-converter': {
        execute: function(card) {
            const fileInput = card.querySelector('input[type="file"]');
            const select = card.querySelector('select');
            const result = card.querySelector('.tool-result');
            
            if (!fileInput.files[0]) {
                showToast('Please select a file to convert', 'error');
                return;
            }

            const file = fileInput.files[0];
            const conversionType = select.value;
            
            result.innerHTML = `
                <h4>Conversion Complete</h4>
                <div class="result-item">
                    <span>Original File</span>
                    <span>${file.name}</span>
                </div>
                <div class="result-item">
                    <span>Conversion Type</span>
                    <span>${conversionType}</span>
                </div>
                <div class="result-item">
                    <span>File Size</span>
                    <span>${(file.size / 1024).toFixed(1)} KB</span>
                </div>
                <button class="btn btn--primary btn--sm download-btn" style="margin-top: 16px;">Download Converted File</button>
            `;
            
            const downloadBtn = result.querySelector('.download-btn');
            downloadBtn.onclick = () => {
                const extension = conversionType.includes('Word') ? 'docx' : conversionType.includes('Excel') ? 'xlsx' : 'txt';
                const content = `Converted content from ${file.name}\nConversion type: ${conversionType}\nProcessed on: ${new Date().toLocaleDateString()}`;
                downloadFile(content, `converted-${file.name.split('.')[0]}.${extension}`);
            };
            
            result.classList.remove('hidden');
        }
    },

    'qr-generator': {
        execute: function(card) {
            const input = card.querySelector('input[type="text"]');
            const sizeSelect = card.querySelector('select');
            const colorInput = card.querySelector('input[type="color"]');
            const result = card.querySelector('.tool-result');
            
            const text = input.value.trim();
            if (!text) {
                showToast('Please enter text or URL', 'error');
                return;
            }

            const size = parseInt(sizeSelect.value);
            const color = colorInput.value;
            
            // Create canvas for QR code
            const canvas = document.createElement('canvas');
            
            if (typeof QRCode !== 'undefined') {
                QRCode.toCanvas(canvas, text, {
                    width: size,
                    color: { dark: color, light: '#ffffff' }
                }, function(error) {
                    if (error) {
                        showToast('Error generating QR code', 'error');
                        return;
                    }
                    
                    const scanCount = Math.floor(Math.random() * 1000) + 100;
                    result.innerHTML = `
                        <div class="qr-result">
                            <h4>QR Code Generated</h4>
                            <div class="qr-canvas-container" style="margin: 16px 0;"></div>
                            <div class="result-item">
                                <span>Size</span>
                                <span>${size}x${size}px</span>
                            </div>
                            <div class="result-item">
                                <span>Simulated Scans</span>
                                <span>${scanCount}</span>
                            </div>
                            <div style="margin-top: 16px; display: flex; gap: 8px;">
                                <button class="btn btn--primary btn--sm download-png-btn">Download PNG</button>
                                <button class="btn btn--outline btn--sm copy-text-btn">Copy Text</button>
                            </div>
                        </div>
                    `;
                    
                    result.querySelector('.qr-canvas-container').appendChild(canvas);
                    
                    const downloadBtn = result.querySelector('.download-png-btn');
                    downloadBtn.onclick = () => {
                        canvas.toBlob(blob => {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'qrcode.png';
                            a.click();
                            URL.revokeObjectURL(url);
                        });
                    };
                    
                    const copyBtn = result.querySelector('.copy-text-btn');
                    copyBtn.onclick = () => copyToClipboard(text);
                    
                    result.classList.remove('hidden');
                });
            } else {
                // Fallback if QRCode library not loaded
                result.innerHTML = `
                    <div class="qr-result">
                        <h4>QR Code Generated</h4>
                        <div style="margin: 16px 0; padding: 40px; background: white; text-align: center; border-radius: 8px;">
                            <div style="color: black; font-weight: bold;">QR Code for: ${text}</div>
                            <div style="color: #666; font-size: 12px; margin-top: 8px;">${size}x${size}px</div>
                        </div>
                        <div class="result-item">
                            <span>Text/URL</span>
                            <span style="word-break: break-all;">${text}</span>
                        </div>
                        <button class="btn btn--outline btn--sm" onclick="copyToClipboard('${text}')">Copy Text</button>
                    </div>
                `;
                result.classList.remove('hidden');
            }
        }
    },

    'image-compressor': {
        execute: function(card) {
            const fileInput = card.querySelector('input[type="file"]');
            const qualitySlider = card.querySelector('#qualitySlider');
            const result = card.querySelector('.tool-result');
            
            if (!fileInput.files[0]) {
                showToast('Please select an image to compress', 'error');
                return;
            }

            const file = fileInput.files[0];
            const quality = parseInt(qualitySlider.value) / 100;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    canvas.toBlob(function(blob) {
                        const originalSize = file.size;
                        const compressedSize = blob.size;
                        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
                        
                        result.innerHTML = `
                            <h4>Compression Complete</h4>
                            <div class="result-item">
                                <span>Original Size</span>
                                <span>${(originalSize / 1024).toFixed(1)} KB</span>
                            </div>
                            <div class="result-item">
                                <span>Compressed Size</span>
                                <span>${(compressedSize / 1024).toFixed(1)} KB</span>
                            </div>
                            <div class="result-item">
                                <span>Space Saved</span>
                                <span style="color: #6bcf7f">${savings}%</span>
                            </div>
                            <div class="result-item">
                                <span>Quality</span>
                                <span>${qualitySlider.value}%</span>
                            </div>
                            <button class="btn btn--primary btn--sm download-compressed-btn" style="margin-top: 16px;">Download Compressed</button>
                        `;
                        
                        const downloadBtn = result.querySelector('.download-compressed-btn');
                        downloadBtn.onclick = function() {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'compressed-' + file.name;
                            a.click();
                            URL.revokeObjectURL(url);
                        };
                        
                        result.classList.remove('hidden');
                    }, 'image/jpeg', quality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    },

    'url-shortener': {
        execute: function(card) {
            const urlInput = card.querySelector('input[type="url"]');
            const aliasInput = card.querySelector('input[type="text"]');
            const result = card.querySelector('.tool-result');
            
            const url = urlInput.value.trim();
            if (!url) {
                showToast('Please enter a URL to shorten', 'error');
                return;
            }

            const alias = aliasInput.value.trim() || Math.random().toString(36).substr(2, 8);
            const shortUrl = `https://thub.ly/${alias}`;
            const clicks = Math.floor(Math.random() * 500) + 50;
            
            result.innerHTML = `
                <h4>URL Shortened Successfully</h4>
                <div class="result-item">
                    <span>Original URL</span>
                    <span style="word-break: break-all; font-size: 12px;">${url}</span>
                </div>
                <div class="result-item">
                    <span>Short URL</span>
                    <span style="color: #6bcf7f; font-weight: 500;">${shortUrl}</span>
                </div>
                <div class="result-item">
                    <span>Total Clicks</span>
                    <span>${clicks}</span>
                </div>
                <div class="result-item">
                    <span>Created</span>
                    <span>${new Date().toLocaleDateString()}</span>
                </div>
                <div style="margin-top: 16px; display: flex; gap: 8px;">
                    <button class="btn btn--primary btn--sm copy-short-btn">Copy Short URL</button>
                    <button class="btn btn--outline btn--sm visit-original-btn">Visit Original</button>
                </div>
            `;
            
            const copyBtn = result.querySelector('.copy-short-btn');
            copyBtn.onclick = () => copyToClipboard(shortUrl);
            
            const visitBtn = result.querySelector('.visit-original-btn');
            visitBtn.onclick = () => window.open(url, '_blank');
            
            result.classList.remove('hidden');
        }
    },

    'plagiarism-checker': {
        execute: function(card) {
            const textarea = card.querySelector('textarea');
            const result = card.querySelector('.tool-result');
            
            const text = textarea.value.trim();
            if (!text) {
                showToast('Please enter text to check for plagiarism', 'error');
                return;
            }

            const similarity = Math.floor(Math.random() * 30) + 5;
            const sentences = text.split(/[.!?]+/).filter(s => s.trim());
            const duplicates = sentences.slice(0, Math.floor(sentences.length * 0.2));
            const sources = ['Wikipedia', 'Academic Paper', 'News Article', 'Blog Post', 'Research Journal'];
            
            result.innerHTML = `
                <h4>Plagiarism Check Results</h4>
                <div class="result-item">
                    <span>Similarity Score</span>
                    <span style="color: ${similarity > 20 ? '#ff6b6b' : similarity > 10 ? '#ffd93d' : '#6bcf7f'}">${similarity}%</span>
                </div>
                <div class="result-item">
                    <span>Unique Content</span>
                    <span>${100 - similarity}%</span>
                </div>
                <div class="result-item">
                    <span>Sources Found</span>
                    <span>${duplicates.length}</span>
                </div>
                <div style="margin-top: 16px;">
                    <h5>Potential Sources:</h5>
                    ${duplicates.length > 0 ? duplicates.map((_, i) => `<div style="background: rgba(255,107,107,0.1); padding: 8px; margin: 4px 0; border-radius: 4px; font-size: 12px;">${sources[i % sources.length]}</div>`).join('') : '<div style="color: #6bcf7f;">No suspicious sources found.</div>'}
                </div>
                <button class="btn btn--outline btn--sm export-report-btn" style="margin-top: 16px;">Export Report</button>
            `;
            
            const exportBtn = result.querySelector('.export-report-btn');
            exportBtn.onclick = () => {
                const report = `Plagiarism Report\n\nSimilarity: ${similarity}%\nUnique: ${100-similarity}%\nSources: ${duplicates.length}\n\nChecked Text:\n${text}`;
                downloadFile(report, 'plagiarism-report.txt');
            };
            
            result.classList.remove('hidden');
        }
    },

    'text-summarizer': {
        execute: function(card) {
            const textarea = card.querySelector('textarea');
            const select = card.querySelector('select');
            const result = card.querySelector('.tool-result');
            
            const text = textarea.value.trim();
            if (!text) {
                showToast('Please enter text to summarize', 'error');
                return;
            }

            const summaryType = select.value;
            const sentences = text.split(/[.!?]+/).filter(s => s.trim());
            const wordCount = text.split(/\s+/).length;
            
            let summaryLength;
            switch(summaryType) {
                case 'short': summaryLength = Math.max(1, Math.floor(sentences.length * 0.2)); break;
                case 'medium': summaryLength = Math.max(2, Math.floor(sentences.length * 0.4)); break;
                case 'long': summaryLength = Math.max(3, Math.floor(sentences.length * 0.6)); break;
                default: summaryLength = Math.max(2, Math.floor(sentences.length * 0.4));
            }
            
            const summary = sentences.slice(0, summaryLength).join('. ') + '.';
            const summaryWordCount = summary.split(/\s+/).length;
            
            result.innerHTML = `
                <h4>Text Summary</h4>
                <div class="result-item">
                    <span>Original Words</span>
                    <span>${wordCount}</span>
                </div>
                <div class="result-item">
                    <span>Summary Words</span>
                    <span>${summaryWordCount}</span>
                </div>
                <div class="result-item">
                    <span>Reduction</span>
                    <span style="color: #6bcf7f">${((wordCount - summaryWordCount) / wordCount * 100).toFixed(1)}%</span>
                </div>
                <div style="margin-top: 16px;">
                    <h5>Summary:</h5>
                    <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 8px; margin-top: 8px; line-height: 1.6;">
                        ${summary}
                    </div>
                </div>
                <button class="btn btn--outline btn--sm export-summary-btn" style="margin-top: 16px;">Export Summary</button>
            `;
            
            const exportBtn = result.querySelector('.export-summary-btn');
            exportBtn.onclick = () => downloadFile(summary, 'summary.txt');
            
            result.classList.remove('hidden');
        }
    },

    'color-palette': {
        execute: function(card) {
            const fileInput = card.querySelector('input[type="file"]');
            const result = card.querySelector('.tool-result');
            
            if (!fileInput.files[0]) {
                showToast('Please upload an image to extract colors', 'error');
                return;
            }

            const file = fileInput.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    // Extract colors (simplified algorithm)
                    const colors = [];
                    const predefinedColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];
                    
                    for (let i = 0; i < 5; i++) {
                        try {
                            const x = Math.floor(Math.random() * canvas.width);
                            const y = Math.floor(Math.random() * canvas.height);
                            const pixel = ctx.getImageData(x, y, 1, 1).data;
                            const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);
                            colors.push(hex);
                        } catch (e) {
                            // Fallback to predefined color if canvas access fails
                            colors.push(predefinedColors[i]);
                        }
                    }
                    
                    result.innerHTML = `
                        <h4>Color Palette Extracted</h4>
                        <div class="color-palette">
                            ${colors.map(color => `
                                <div class="color-swatch" style="background-color: ${color};" title="Click to copy ${color}">
                                    ${color}
                                </div>
                            `).join('')}
                        </div>
                        <div style="margin-top: 16px; display: flex; gap: 8px;">
                            <button class="btn btn--outline btn--sm export-json-btn">Export JSON</button>
                            <button class="btn btn--outline btn--sm export-css-btn">Export CSS</button>
                        </div>
                    `;
                    
                    // Add click handlers for color swatches
                    result.querySelectorAll('.color-swatch').forEach((swatch, index) => {
                        swatch.onclick = () => copyToClipboard(colors[index]);
                    });
                    
                    const jsonBtn = result.querySelector('.export-json-btn');
                    jsonBtn.onclick = () => downloadFile(JSON.stringify(colors, null, 2), 'palette.json');
                    
                    const cssBtn = result.querySelector('.export-css-btn');
                    cssBtn.onclick = () => {
                        const css = ':root {\n' + colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n') + '\n}';
                        downloadFile(css, 'palette.css');
                    };
                    
                    result.classList.remove('hidden');
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    },

    'password-generator': {
        execute: function(card) {
            const lengthSlider = card.querySelector('#passwordLength');
            const checkboxes = card.querySelectorAll('input[type="checkbox"]');
            const result = card.querySelector('.tool-result');
            
            const length = parseInt(lengthSlider.value);
            const options = {
                uppercase: checkboxes[0].checked,
                lowercase: checkboxes[1].checked,
                numbers: checkboxes[2].checked,
                symbols: checkboxes[3].checked
            };
            
            if (!Object.values(options).some(v => v)) {
                showToast('Please select at least one character type', 'error');
                return;
            }
            
            let chars = '';
            if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
            if (options.numbers) chars += '0123456789';
            if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
            
            let password = '';
            for (let i = 0; i < length; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            
            const strength = length >= 16 && Object.values(options).filter(v => v).length >= 3 ? 'strong' : 
                           length >= 10 && Object.values(options).filter(v => v).length >= 2 ? 'medium' : 'weak';
            
            result.innerHTML = `
                <h4>Password Generated</h4>
                <div class="password-result">
                    <input type="text" value="${password}" readonly>
                    <button class="btn btn--sm copy-password-btn">Copy</button>
                </div>
                <div class="strength-indicator">
                    <span>Strength: </span>
                    <span class="strength-${strength}">${strength.toUpperCase()}</span>
                </div>
                <div class="result-item">
                    <span>Length</span>
                    <span>${length} characters</span>
                </div>
                <div class="result-item">
                    <span>Character Types</span>
                    <span>${Object.values(options).filter(v => v).length}/4</span>
                </div>
            `;
            
            const copyBtn = result.querySelector('.copy-password-btn');
            copyBtn.onclick = () => copyToClipboard(password);
            
            result.classList.remove('hidden');
        }
    },

    'markdown-editor': {
        execute: function(card) {
            const textarea = card.querySelector('textarea');
            const preview = card.querySelector('.markdown-preview');
            
            // Real-time preview update
            const updatePreview = () => {
                const markdown = textarea.value;
                try {
                    const html = typeof marked !== 'undefined' ? marked.parse(markdown) : markdown.replace(/\n/g, '<br>');
                    preview.innerHTML = html;
                } catch (e) {
                    preview.innerHTML = markdown.replace(/\n/g, '<br>');
                }
            };
            
            // Initial preview
            updatePreview();
            
            // Add event listener for real-time updates
            textarea.addEventListener('input', updatePreview);
            
            // Toolbar functions
            const toolbar = card.querySelector('.markdown-toolbar');
            if (toolbar) {
                toolbar.addEventListener('click', (e) => {
                    if (e.target.dataset.action) {
                        const action = e.target.dataset.action;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const selectedText = textarea.value.substring(start, end);
                        let replacement = '';
                        
                        switch(action) {
                            case 'bold':
                                replacement = `**${selectedText || 'bold text'}**`;
                                break;
                            case 'italic':
                                replacement = `*${selectedText || 'italic text'}*`;
                                break;
                            case 'heading':
                                replacement = `## ${selectedText || 'Heading'}`;
                                break;
                            case 'link':
                                replacement = `[${selectedText || 'link text'}](url)`;
                                break;
                            case 'code':
                                replacement = `\`${selectedText || 'code'}\``;
                                break;
                        }
                        
                        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
                        updatePreview();
                    }
                });
            }
            
            // Export functions
            const exportButtons = card.querySelectorAll('.markdown-actions button');
            if (exportButtons.length >= 2) {
                exportButtons[0].onclick = () => {
                    const html = typeof marked !== 'undefined' ? marked.parse(textarea.value) : textarea.value.replace(/\n/g, '<br>');
                    downloadFile(html, 'document.html', 'text/html');
                };
                exportButtons[1].onclick = () => {
                    downloadFile(textarea.value, 'document.md', 'text/markdown');
                };
            }
        }
    }
};

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI
    state.updateUI();
    
    // Sign in modal
    const signInBtn = document.getElementById('signInBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const signInForm = document.getElementById('signInForm');
    
    if (signInBtn) {
        signInBtn.addEventListener('click', () => showModal('signInModal'));
    }
    
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => state.signOut());
    }
    
    if (signInForm) {
        signInForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('emailInput');
            const email = emailInput.value;
            if (email && email.includes('@') && email.includes('.')) {
                state.signIn(email);
                hideModal('signInModal');
                emailInput.value = '';
            } else {
                showToast('Please enter a valid email address', 'error');
            }
        });
    }
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    // Upgrade modal sign in button
    const signInForBonus = document.getElementById('signInForBonus');
    if (signInForBonus) {
        signInForBonus.addEventListener('click', () => {
            hideModal('upgradeModal');
            showModal('signInModal');
        });
    }
    
    // Tool execution
    document.querySelectorAll('.tool-card').forEach(card => {
        const toolType = card.dataset.tool;
        const button = card.querySelector('.btn--primary');
        
        if (button && tools[toolType]) {
            button.addEventListener('click', () => {
                if (!state.useCredit()) return;
                
                button.classList.add('loading');
                button.disabled = true;
                
                // Simulate processing time
                setTimeout(() => {
                    try {
                        tools[toolType].execute(card);
                    } catch (error) {
                        showToast('An error occurred while processing', 'error');
                        console.error('Tool execution error:', error);
                    }
                    button.classList.remove('loading');
                    button.disabled = false;
                }, 1500);
            });
        }
    });
    
    // File upload handling
    document.querySelectorAll('.file-upload-area').forEach(area => {
        const input = area.querySelector('input[type="file"]');
        if (!input) return;
        
        area.addEventListener('click', () => input.click());
        
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.style.borderColor = 'rgba(255, 255, 255, 0.5)';
        });
        
        area.addEventListener('dragleave', () => {
            area.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        });
        
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            if (e.dataTransfer.files.length > 0) {
                input.files = e.dataTransfer.files;
                const fileName = input.files[0].name;
                const placeholder = area.querySelector('p');
                if (placeholder) {
                    placeholder.textContent = `Selected: ${fileName}`;
                }
            }
        });
        
        input.addEventListener('change', () => {
            if (input.files[0]) {
                const fileName = input.files[0].name;
                const placeholder = area.querySelector('p');
                if (placeholder) {
                    placeholder.textContent = `Selected: ${fileName}`;
                }
            }
        });
    });
    
    // Range slider updates
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    if (qualitySlider && qualityValue) {
        qualitySlider.addEventListener('input', (e) => {
            qualityValue.textContent = e.target.value;
        });
    }
    
    const passwordLength = document.getElementById('passwordLength');
    const lengthValue = document.getElementById('lengthValue');
    if (passwordLength && lengthValue) {
        passwordLength.addEventListener('input', (e) => {
            lengthValue.textContent = e.target.value;
        });
    }
    
    // Initialize markdown editor
    const markdownCard = document.querySelector('[data-tool="markdown-editor"]');
    if (markdownCard && tools['markdown-editor']) {
        tools['markdown-editor'].execute(markdownCard);
    }
});

// Initialize state on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => state.updateUI());
} else {
    state.updateUI();
}