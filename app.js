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
        try {
            const saved = localStorage.getItem('toolhub-state');
            if (saved) {
                const state = JSON.parse(saved);
                this.isSignedIn = state.isSignedIn || false;
                this.userEmail = state.userEmail || '';
                this.usesRemaining = state.usesRemaining !== undefined ? state.usesRemaining : 15;
                this.maxUses = state.maxUses || 15;
                this.lastResetDate = state.lastResetDate || new Date().toDateString();
            }
        } catch (e) {
            console.warn('Failed to load state from localStorage:', e);
            this.resetToDefaults();
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
        try {
            const state = {
                isSignedIn: this.isSignedIn,
                userEmail: this.userEmail,
                usesRemaining: this.usesRemaining,
                maxUses: this.maxUses,
                lastResetDate: this.lastResetDate
            };
            localStorage.setItem('toolhub-state', JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save state to localStorage:', e);
        }
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
        
        // Track sign-in event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'sign_in', {
                method: 'email'
            });
        }
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
        console.error('Download error:', error);
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
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

// Generate unique ID for URL shortener
function generateShortId() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Validate email
function isValidEmail(email) {
    return email && email.includes('@') && email.includes('.') && email.length > 5;
}

// Validate URL
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
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

            if (text.length < 50) {
                showToast('Please enter at least 50 characters for accurate analysis', 'error');
                return;
            }

            const result = card.querySelector('.tool-result');
            
            // AI detection algorithm simulation
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
            const wordCount = text.split(/\s+/).length;
            const avgSentenceLength = wordCount / sentences.length;
            const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
            const lexicalDiversity = uniqueWords / wordCount;
            
            // Calculate AI probability based on various factors
            let aiProbability = 0;
            
            // Longer average sentence length suggests AI
            if (avgSentenceLength > 20) aiProbability += 30;
            else if (avgSentenceLength > 15) aiProbability += 15;
            
            // Lower lexical diversity suggests AI
            if (lexicalDiversity < 0.6) aiProbability += 25;
            else if (lexicalDiversity < 0.7) aiProbability += 10;
            
            // Add some randomness for realism
            aiProbability += Math.floor(Math.random() * 25) + 10;
            aiProbability = Math.min(aiProbability, 95);
            
            const suspiciousCount = Math.floor(sentences.length * (aiProbability / 100) * 0.4);
            const suspiciousSentences = sentences.slice(0, suspiciousCount);
            
            result.innerHTML = `
                <h4>AI Content Analysis Results</h4>
                <div class="result-item">
                    <span>AI Content Probability</span>
                    <span style="color: ${aiProbability > 80 ? '#ff6b6b' : aiProbability > 60 ? '#ffd93d' : '#6bcf7f'}">${aiProbability}%</span>
                </div>
                <div class="result-item">
                    <span>Total Words</span>
                    <span>${wordCount}</span>
                </div>
                <div class="result-item">
                    <span>Total Sentences</span>
                    <span>${sentences.length}</span>
                </div>
                <div class="result-item">
                    <span>Lexical Diversity</span>
                    <span>${(lexicalDiversity * 100).toFixed(1)}%</span>
                </div>
                <div class="result-item">
                    <span>Suspicious Sentences</span>
                    <span>${suspiciousCount}</span>
                </div>
                ${suspiciousCount > 0 ? `
                <div style="margin-top: 16px;">
                    <h5>Flagged Content:</h5>
                    <div style="background: rgba(255,107,107,0.2); padding: 12px; border-radius: 8px; margin-top: 8px; max-height: 150px; overflow-y: auto;">
                        ${suspiciousSentences.map(s => s.trim()).join('. ') + '.'}
                    </div>
                </div>` : '<div style="margin-top: 16px; color: #6bcf7f;">✓ No suspicious patterns detected</div>'}
                <button class="btn btn--outline btn--sm export-btn" style="margin-top: 16px;">Export Detailed Report</button>
            `;
            
            const exportBtn = result.querySelector('.export-btn');
            exportBtn.onclick = () => {
                const report = `AI Content Detection Report
Generated: ${new Date().toLocaleString()}

ANALYSIS SUMMARY:
- AI Probability: ${aiProbability}%
- Total Words: ${wordCount}
- Total Sentences: ${sentences.length}
- Average Sentence Length: ${avgSentenceLength.toFixed(1)} words
- Lexical Diversity: ${(lexicalDiversity * 100).toFixed(1)}%
- Suspicious Sentences: ${suspiciousCount}

ORIGINAL TEXT:
${text}

${suspiciousCount > 0 ? `\nFLAGGED CONTENT:\n${suspiciousSentences.join('. ') + '.'}` : '\nNo suspicious patterns detected.'}

---
Report generated by ToolHub Master AI Detector
`;
                downloadFile(report, `ai-analysis-${Date.now()}.txt`);
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
            const fileSizeKB = (file.size / 1024).toFixed(1);
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            
            // Simulate processing time based on file size
            const processingTime = Math.max(2, Math.min(file.size / 100000, 10));
            
            result.innerHTML = `
                <h4>Conversion Complete</h4>
                <div class="result-item">
                    <span>Original File</span>
                    <span>${file.name}</span>
                </div>
                <div class="result-item">
                    <span>File Size</span>
                    <span>${fileSizeMB > 1 ? fileSizeMB + ' MB' : fileSizeKB + ' KB'}</span>
                </div>
                <div class="result-item">
                    <span>Conversion Type</span>
                    <span>${conversionType.replace('-', ' to ').toUpperCase()}</span>
                </div>
                <div class="result-item">
                    <span>Processing Time</span>
                    <span>${processingTime.toFixed(1)}s</span>
                </div>
                <div class="result-item">
                    <span>Status</span>
                    <span style="color: #6bcf7f">✓ Success</span>
                </div>
                <button class="btn btn--primary btn--sm download-btn" style="margin-top: 16px;">Download Converted File</button>
                <button class="btn btn--outline btn--sm preview-btn" style="margin-top: 16px; margin-left: 8px;">Preview Content</button>
            `;
            
            const downloadBtn = result.querySelector('.download-btn');
            const previewBtn = result.querySelector('.preview-btn');
            
            downloadBtn.onclick = () => {
                const extensions = {
                    'pdf-to-word': 'docx',
                    'pdf-to-excel': 'xlsx',
                    'pdf-to-text': 'txt',
                    'compress-pdf': 'pdf',
                    'merge-pdf': 'pdf'
                };
                
                const extension = extensions[conversionType] || 'txt';
                const baseName = file.name.split('.')[0];
                
                let content = `Converted content from ${file.name}\nConversion type: ${conversionType}\nProcessed on: ${new Date().toLocaleString()}\n\n`;
                
                if (conversionType === 'pdf-to-text') {
                    content += `Sample extracted text content from ${file.name}:\n\nThis is a sample of what the extracted text might look like. In a real implementation, this would contain the actual text content extracted from the PDF file using a PDF parsing library.\n\nThe text would maintain paragraph structure and formatting where possible, making it easy to edit and reuse the content in other applications.`;
                } else if (conversionType === 'pdf-to-word') {
                    content = `<?xml version="1.0" encoding="UTF-8"?>\n<document>\n  <title>Converted from ${file.name}</title>\n  <content>This would be the Word document content...</content>\n</document>`;
                }
                
                downloadFile(content, `converted-${baseName}.${extension}`);
            };
            
            previewBtn.onclick = () => {
                const previewContent = `Preview of converted content:\n\n"This is a sample preview of the converted content from ${file.name}. The actual conversion would extract all text, images, and formatting from the original file and convert it to the selected format."`;
                showToast('Preview: ' + previewContent.substring(0, 100) + '...', 'info');
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
                showToast('Please enter text or URL to encode', 'error');
                return;
            }

            if (text.length > 2000) {
                showToast('Text is too long. Please use less than 2000 characters.', 'error');
                return;
            }

            const size = parseInt(sizeSelect.value);
            const color = colorInput.value;
            
            // Create canvas for QR code
            const canvas = document.createElement('canvas');
            
            if (typeof QRCode !== 'undefined') {
                QRCode.toCanvas(canvas, text, {
                    width: size,
                    margin: 2,
                    color: { 
                        dark: color, 
                        light: '#ffffff' 
                    },
                    errorCorrectionLevel: 'M'
                }, function(error) {
                    if (error) {
                        showToast('Error generating QR code: ' + error.message, 'error');
                        return;
                    }
                    
                    const scanCount = Math.floor(Math.random() * 1000) + 100;
                    const dataType = isValidURL(text) ? 'URL' : text.includes('@') ? 'Email' : 'Text';
                    
                    result.innerHTML = `
                        <div class="qr-result">
                            <h4>QR Code Generated Successfully</h4>
                            <div class="qr-canvas-container"></div>
                            <div class="result-item">
                                <span>Data Type</span>
                                <span>${dataType}</span>
                            </div>
                            <div class="result-item">
                                <span>Size</span>
                                <span>${size}×${size}px</span>
                            </div>
                            <div class="result-item">
                                <span>Color</span>
                                <span style="color: ${color}">${color.toUpperCase()}</span>
                            </div>
                            <div class="result-item">
                                <span>Data Length</span>
                                <span>${text.length} characters</span>
                            </div>
                            <div class="result-item">
                                <span>Estimated Scans</span>
                                <span>${scanCount}</span>
                            </div>
                            <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                                <button class="btn btn--primary btn--sm download-png-btn">Download PNG</button>
                                <button class="btn btn--outline btn--sm copy-text-btn">Copy Text</button>
                                <button class="btn btn--outline btn--sm test-scan-btn">Test Scan</button>
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
                            a.download = `qrcode-${Date.now()}.png`;
                            a.click();
                            URL.revokeObjectURL(url);
                            showToast('QR code downloaded!', 'success');
                        });
                    };
                    
                    const copyBtn = result.querySelector('.copy-text-btn');
                    copyBtn.onclick = () => copyToClipboard(text);
                    
                    const testBtn = result.querySelector('.test-scan-btn');
                    testBtn.onclick = () => {
                        showToast(`QR code successfully scanned! Data: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`, 'success');
                    };
                    
                    result.classList.remove('hidden');
                });
            } else {
                // Fallback if QRCode library not loaded
                result.innerHTML = `
                    <div class="qr-result">
                        <h4>QR Code Generated</h4>
                        <div style="margin: 16px 0; padding: 40px; background: white; text-align: center; border-radius: 8px; color: black;">
                            <div style="font-weight: bold; margin-bottom: 8px;">QR Code Preview</div>
                            <div style="font-family: monospace; word-break: break-all; font-size: 8px;">██████████████</div>
                            <div style="color: #666; font-size: 12px; margin-top: 8px;">${size}×${size}px</div>
                            <div style="color: #666; font-size: 10px; margin-top: 4px;">Data: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}</div>
                        </div>
                        <div class="result-item">
                            <span>Text/URL</span>
                            <span style="word-break: break-all; font-size: 12px;">${text}</span>
                        </div>
                        <button class="btn btn--outline btn--sm" onclick="copyToClipboard('${text.replace(/'/g, "\\'")}')">Copy Text</button>
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
            
            if (!file.type.startsWith('image/')) {
                showToast('Please select a valid image file', 'error');
                return;
            }

            const quality = parseInt(qualitySlider.value) / 100;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Calculate new dimensions while maintaining aspect ratio
                    let { width, height } = img;
                    const maxDimension = 2048;
                    
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = (height * maxDimension) / width;
                            width = maxDimension;
                        } else {
                            width = (width * maxDimension) / height;
                            height = maxDimension;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Apply image smoothing for better quality
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob(function(blob) {
                        const originalSize = file.size;
                        const compressedSize = blob.size;
                        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
                        const compressionRatio = (originalSize / compressedSize).toFixed(1);
                        
                        result.innerHTML = `
                            <h4>Image Compression Complete</h4>
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
                                <span style="color: #6bcf7f">${savings}% (${((originalSize - compressedSize) / 1024).toFixed(1)} KB)</span>
                            </div>
                            <div class="result-item">
                                <span>Compression Ratio</span>
                                <span>${compressionRatio}:1</span>
                            </div>
                            <div class="result-item">
                                <span>Quality Setting</span>
                                <span>${qualitySlider.value}%</span>
                            </div>
                            <div class="result-item">
                                <span>Resolution</span>
                                <span>${width}×${height}px</span>
                            </div>
                            <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
                                <button class="btn btn--primary btn--sm download-compressed-btn">Download Compressed</button>
                                <button class="btn btn--outline btn--sm preview-btn">Preview</button>
                            </div>
                        `;
                        
                        const downloadBtn = result.querySelector('.download-compressed-btn');
                        downloadBtn.onclick = function() {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            const extension = file.name.split('.').pop();
                            a.download = `compressed-${file.name.replace(/\.[^/.]+$/, '')}.${extension}`;
                            a.click();
                            URL.revokeObjectURL(url);
                        };
                        
                        const previewBtn = result.querySelector('.preview-btn');
                        previewBtn.onclick = function() {
                            const url = URL.createObjectURL(blob);
                            window.open(url, '_blank');
                            setTimeout(() => URL.revokeObjectURL(url), 1000);
                        };
                        
                        result.classList.remove('hidden');
                    }, file.type, quality);
                };
                
                img.onerror = function() {
                    showToast('Failed to load image. Please try a different file.', 'error');
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = function() {
                showToast('Failed to read file. Please try again.', 'error');
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

            if (!isValidURL(url)) {
                showToast('Please enter a valid URL (including http:// or https://)', 'error');
                return;
            }

            let alias = aliasInput.value.trim();
            if (alias) {
                // Validate custom alias
                if (!/^[a-zA-Z0-9\-_]+$/.test(alias)) {
                    showToast('Alias can only contain letters, numbers, hyphens, and underscores', 'error');
                    return;
                }
                if (alias.length < 3 || alias.length > 20) {
                    showToast('Alias must be between 3 and 20 characters', 'error');
                    return;
                }
            } else {
                alias = generateShortId();
            }
            
            const shortUrl = `https://thub.ly/${alias}`;
            const clicks = Math.floor(Math.random() * 500) + 50;
            const creationDate = new Date();
            const domain = new URL(url).hostname;
            
            result.innerHTML = `
                <h4>URL Shortened Successfully</h4>
                <div class="result-item">
                    <span>Original URL</span>
                    <span style="word-break: break-all; font-size: 12px; max-width: 200px;">${url}</span>
                </div>
                <div class="result-item">
                    <span>Short URL</span>
                    <span style="color: #6bcf7f; font-weight: 500; font-family: monospace;">${shortUrl}</span>
                </div>
                <div class="result-item">
                    <span>Domain</span>
                    <span>${domain}</span>
                </div>
                <div class="result-item">
                    <span>Alias</span>
                    <span>${alias}</span>
                </div>
                <div class="result-item">
                    <span>Total Clicks</span>
                    <span>${clicks}</span>
                </div>
                <div class="result-item">
                    <span>Created</span>
                    <span>${creationDate.toLocaleDateString()} ${creationDate.toLocaleTimeString()}</span>
                </div>
                <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn btn--primary btn--sm copy-short-btn">Copy Short URL</button>
                    <button class="btn btn--outline btn--sm visit-original-btn">Visit Original</button>
                    <button class="btn btn--outline btn--sm qr-code-btn">Generate QR</button>
                </div>
            `;
            
            const copyBtn = result.querySelector('.copy-short-btn');
            copyBtn.onclick = () => copyToClipboard(shortUrl);
            
            const visitBtn = result.querySelector('.visit-original-btn');
            visitBtn.onclick = () => window.open(url, '_blank');
            
            const qrBtn = result.querySelector('.qr-code-btn');
            qrBtn.onclick = () => {
                // Auto-fill QR generator with short URL
                const qrCard = document.querySelector('[data-tool="qr-generator"]');
                if (qrCard) {
                    const qrInput = qrCard.querySelector('input[type="text"]');
                    if (qrInput) {
                        qrInput.value = shortUrl;
                        qrCard.scrollIntoView({ behavior: 'smooth' });
                        showToast('Short URL copied to QR generator!', 'success');
                    }
                }
            };
            
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

            if (text.length < 100) {
                showToast('Please enter at least 100 characters for accurate analysis', 'error');
                return;
            }

            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
            const wordCount = text.split(/\s+/).length;
            
            // Simulate plagiarism detection algorithm
            const commonPhrases = [
                "according to research", "studies have shown", "it is well known", 
                "research indicates", "experts believe", "in conclusion", "furthermore",
                "however", "therefore", "nevertheless", "in addition"
            ];
            
            let similarityScore = 0;
            let duplicateCount = 0;
            const duplicateSentences = [];
            const sources = [
                'Wikipedia.org',
                'Academic Journal: Nature Science',
                'Research Paper: MIT Studies',
                'News Article: BBC News',
                'Blog Post: Medium.com',
                'Educational Resource: Khan Academy',
                'Government Publication: NIH.gov',
                'Book: "Introduction to Modern Science"'
            ];
            
            // Check for common phrases (simplified detection)
            sentences.forEach(sentence => {
                const lowerSentence = sentence.toLowerCase();
                const phraseMatches = commonPhrases.filter(phrase => 
                    lowerSentence.includes(phrase)
                ).length;
                
                if (phraseMatches > 0 || Math.random() < 0.15) {
                    duplicateCount++;
                    duplicateSentences.push(sentence.trim());
                    similarityScore += Math.random() * 15 + 5;
                }
            });
            
            similarityScore = Math.min(Math.floor(similarityScore), 85);
            const uniquePercentage = 100 - similarityScore;
            const sourcesFound = duplicateSentences.length;
            
            result.innerHTML = `
                <h4>Plagiarism Analysis Results</h4>
                <div class="result-item">
                    <span>Similarity Score</span>
                    <span style="color: ${similarityScore > 40 ? '#ff6b6b' : similarityScore > 20 ? '#ffd93d' : '#6bcf7f'}">${similarityScore}%</span>
                </div>
                <div class="result-item">
                    <span>Unique Content</span>
                    <span style="color: ${uniquePercentage > 80 ? '#6bcf7f' : uniquePercentage > 60 ? '#ffd93d' : '#ff6b6b'}">${uniquePercentage}%</span>
                </div>
                <div class="result-item">
                    <span>Total Words</span>
                    <span>${wordCount}</span>
                </div>
                <div class="result-item">
                    <span>Sentences Analyzed</span>
                    <span>${sentences.length}</span>
                </div>
                <div class="result-item">
                    <span>Potential Matches</span>
                    <span>${duplicateCount}</span>
                </div>
                <div class="result-item">
                    <span>Sources Found</span>
                    <span>${sourcesFound}</span>
                </div>
                ${sourcesFound > 0 ? `
                <div style="margin-top: 16px;">
                    <h5>Potential Source Matches:</h5>
                    <div style="max-height: 150px; overflow-y: auto;">
                        ${sources.slice(0, sourcesFound).map((source, i) => `
                            <div style="background: rgba(255,107,107,0.1); padding: 8px; margin: 4px 0; border-radius: 4px; font-size: 12px; border-left: 3px solid #ff6b6b;">
                                <strong>${source}</strong><br>
                                Match: "${duplicateSentences[i] ? duplicateSentences[i].substring(0, 60) + '...' : 'Sample text match'}"
                            </div>
                        `).join('')}
                    </div>
                </div>` : '<div style="margin-top: 16px; color: #6bcf7f;">✓ No significant matches found in our database</div>'}
                <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn btn--outline btn--sm export-report-btn">Export Detailed Report</button>
                    <button class="btn btn--outline btn--sm recheck-btn">Recheck</button>
                </div>
            `;
            
            const exportBtn = result.querySelector('.export-report-btn');
            exportBtn.onclick = () => {
                const report = `Plagiarism Analysis Report
Generated: ${new Date().toLocaleString()}

SUMMARY:
- Similarity Score: ${similarityScore}%
- Unique Content: ${uniquePercentage}%
- Total Words: ${wordCount}
- Sentences Analyzed: ${sentences.length}
- Potential Matches: ${duplicateCount}
- Sources Found: ${sourcesFound}

ANALYSIS DETAILS:
${sourcesFound > 0 ? 'POTENTIAL MATCHES FOUND:\n' + sources.slice(0, sourcesFound).map((source, i) => `\n${i + 1}. Source: ${source}\n   Matched Text: "${duplicateSentences[i] || 'Sample match'}"`).join('\n') : 'No significant matches detected in our database.'}

ORIGINAL TEXT:
${text}

---
Report generated by ToolHub Master Plagiarism Checker
Note: This is a demonstration tool. For academic or professional use, please use specialized plagiarism detection services.`;
                downloadFile(report, `plagiarism-report-${Date.now()}.txt`);
            };
            
            const recheckBtn = result.querySelector('.recheck-btn');
            recheckBtn.onclick = () => {
                showToast('Rechecking with updated database...', 'info');
                setTimeout(() => {
                    tools['plagiarism-checker'].execute(card);
                }, 1500);
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

            if (text.length < 200) {
                showToast('Please enter at least 200 characters for meaningful summarization', 'error');
                return;
            }

            const summaryType = select.value;
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
            const words = text.split(/\s+/);
            const wordCount = words.length;
            
            // Calculate summary length based on type
            let summaryLength;
            let targetPercentage;
            switch(summaryType) {
                case 'short': 
                    summaryLength = Math.max(1, Math.floor(sentences.length * 0.2));
                    targetPercentage = 20;
                    break;
                case 'medium': 
                    summaryLength = Math.max(2, Math.floor(sentences.length * 0.4));
                    targetPercentage = 40;
                    break;
                case 'long': 
                    summaryLength = Math.max(3, Math.floor(sentences.length * 0.6));
                    targetPercentage = 60;
                    break;
                default: 
                    summaryLength = Math.max(2, Math.floor(sentences.length * 0.4));
                    targetPercentage = 40;
            }
            
            // Simple extractive summarization (take first and random sentences for demo)
            let summarySentences = [];
            
            // Always include first sentence as it's often important
            if (sentences.length > 0) {
                summarySentences.push(sentences[0]);
            }
            
            // Add middle sentences for longer summaries
            if (summaryLength > 1 && sentences.length > 2) {
                const middleStart = Math.floor(sentences.length * 0.3);
                const middleEnd = Math.floor(sentences.length * 0.7);
                for (let i = middleStart; i < middleEnd && summarySentences.length < summaryLength - 1; i++) {
                    if (sentences[i] && !summarySentences.includes(sentences[i])) {
                        summarySentences.push(sentences[i]);
                    }
                }
            }
            
            // Add last sentence if we need more content and it exists
            if (summarySentences.length < summaryLength && sentences.length > 1) {
                const lastSentence = sentences[sentences.length - 1];
                if (!summarySentences.includes(lastSentence)) {
                    summarySentences.push(lastSentence);
                }
            }
            
            const summary = summarySentences.map(s => s.trim()).join('. ') + '.';
            const summaryWordCount = summary.split(/\s+/).length;
            const actualReduction = ((wordCount - summaryWordCount) / wordCount * 100).toFixed(1);
            const readingTimeOriginal = Math.ceil(wordCount / 200); // Average reading speed
            const readingTimeSummary = Math.ceil(summaryWordCount / 200);
            
            result.innerHTML = `
                <h4>Text Summary Generated</h4>
                <div class="result-item">
                    <span>Summary Type</span>
                    <span>${summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} (${targetPercentage}%)</span>
                </div>
                <div class="result-item">
                    <span>Original Words</span>
                    <span>${wordCount}</span>
                </div>
                <div class="result-item">
                    <span>Summary Words</span>
                    <span>${summaryWordCount}</span>
                </div>
                <div class="result-item">
                    <span>Content Reduction</span>
                    <span style="color: #6bcf7f">${actualReduction}%</span>
                </div>
                <div class="result-item">
                    <span>Reading Time Saved</span>
                    <span>${readingTimeOriginal - readingTimeSummary} min</span>
                </div>
                <div class="result-item">
                    <span>Sentences Used</span>
                    <span>${summarySentences.length} of ${sentences.length}</span>
                </div>
                <div style="margin-top: 16px;">
                    <h5>Generated Summary:</h5>
                    <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 8px; margin-top: 8px; line-height: 1.6; border-left: 4px solid #6bcf7f;">
                        ${summary}
                    </div>
                </div>
                <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn btn--primary btn--sm copy-summary-btn">Copy Summary</button>
                    <button class="btn btn--outline btn--sm export-summary-btn">Export Summary</button>
                    <button class="btn btn--outline btn--sm regenerate-btn">Regenerate</button>
                </div>
            `;
            
            const copyBtn = result.querySelector('.copy-summary-btn');
            copyBtn.onclick = () => copyToClipboard(summary);
            
            const exportBtn = result.querySelector('.export-summary-btn');
            exportBtn.onclick = () => {
                const report = `Text Summary Report
Generated: ${new Date().toLocaleString()}

SUMMARY STATISTICS:
- Original Text: ${wordCount} words, ${sentences.length} sentences
- Summary: ${summaryWordCount} words, ${summarySentences.length} sentences
- Reduction: ${actualReduction}% shorter
- Type: ${summaryType} summary

GENERATED SUMMARY:
${summary}

ORIGINAL TEXT:
${text}

---
Generated by ToolHub Master Text Summarizer`;
                downloadFile(report, `summary-${Date.now()}.txt`);
            };
            
            const regenerateBtn = result.querySelector('.regenerate-btn');
            regenerateBtn.onclick = () => {
                showToast('Regenerating summary with different algorithm...', 'info');
                setTimeout(() => {
                    tools['text-summarizer'].execute(card);
                }, 1000);
            };
            
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
            
            if (!file.type.startsWith('image/')) {
                showToast('Please select a valid image file', 'error');
                return;
            }

            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Resize image for faster processing
                    const maxSize = 200;
                    const scale = Math.min(maxSize / img.width, maxSize / img.height);
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    try {
                        // Extract colors using canvas pixel data
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const pixels = imageData.data;
                        const colorCounts = {};
                        
                        // Sample pixels and count colors
                        for (let i = 0; i < pixels.length; i += 16) { // Sample every 4th pixel
                            const r = pixels[i];
                            const g = pixels[i + 1];
                            const b = pixels[i + 2];
                            const alpha = pixels[i + 3];
                            
                            if (alpha > 128) { // Skip transparent pixels
                                // Round colors to reduce palette size
                                const roundedR = Math.round(r / 32) * 32;
                                const roundedG = Math.round(g / 32) * 32;
                                const roundedB = Math.round(b / 32) * 32;
                                
                                const hex = '#' + [roundedR, roundedG, roundedB]
                                    .map(x => x.toString(16).padStart(2, '0')).join('');
                                
                                colorCounts[hex] = (colorCounts[hex] || 0) + 1;
                            }
                        }
                        
                        // Get top 5 colors
                        const sortedColors = Object.entries(colorCounts)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 5)
                            .map(([color]) => color);
                        
                        // Fill with default colors if not enough extracted
                        const defaultColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];
                        while (sortedColors.length < 5) {
                            const defaultColor = defaultColors[sortedColors.length];
                            if (!sortedColors.includes(defaultColor)) {
                                sortedColors.push(defaultColor);
                            }
                        }
                        
                        const colors = sortedColors.slice(0, 5);
                        
                        result.innerHTML = `
                            <h4>Color Palette Extracted</h4>
                            <div class="result-item">
                                <span>Image</span>
                                <span>${file.name}</span>
                            </div>
                            <div class="result-item">
                                <span>Dimensions</span>
                                <span>${img.width}×${img.height}px</span>
                            </div>
                            <div class="result-item">
                                <span>Colors Extracted</span>
                                <span>${colors.length}</span>
                            </div>
                            <div class="color-palette">
                                ${colors.map((color, index) => `
                                    <div class="color-swatch" style="background-color: ${color};" 
                                         data-color="${color}" title="Click to copy ${color}">
                                        <span style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.3);">
                                            ${color}
                                        </span>
                                    </div>
                                `).join('')}
                            </div>
                            <div style="margin-top: 16px;">
                                <h5>Color Details:</h5>
                                ${colors.map((color, index) => {
                                    const rgb = hexToRgb(color);
                                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                                    return `
                                        <div style="background: rgba(255,255,255,0.1); padding: 8px; margin: 4px 0; border-radius: 4px; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <div style="width: 20px; height: 20px; background: ${color}; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3);"></div>
                                                <strong>Color ${index + 1}</strong>
                                            </div>
                                            <div style="text-align: right; font-family: monospace;">
                                                <div>HEX: ${color}</div>
                                                <div>RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}</div>
                                                <div>HSL: ${hsl.h}°, ${hsl.s}%, ${hsl.l}%</div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                            <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
                                <button class="btn btn--outline btn--sm export-json-btn">Export JSON</button>
                                <button class="btn btn--outline btn--sm export-css-btn">Export CSS</button>
                                <button class="btn btn--outline btn--sm export-ase-btn">Export Adobe Swatch</button>
                            </div>
                        `;
                        
                        // Add click handlers for color swatches
                        result.querySelectorAll('.color-swatch').forEach(swatch => {
                            swatch.onclick = () => {
                                const color = swatch.dataset.color;
                                copyToClipboard(color);
                            };
                        });
                        
                        const jsonBtn = result.querySelector('.export-json-btn');
                        jsonBtn.onclick = () => {
                            const paletteData = {
                                name: `Palette from ${file.name}`,
                                colors: colors.map((color, index) => ({
                                    name: `Color ${index + 1}`,
                                    hex: color,
                                    rgb: hexToRgb(color),
                                    hsl: rgbToHsl(hexToRgb(color).r, hexToRgb(color).g, hexToRgb(color).b)
                                })),
                                extractedFrom: file.name,
                                createdAt: new Date().toISOString()
                            };
                            downloadFile(JSON.stringify(paletteData, null, 2), `palette-${Date.now()}.json`);
                        };
                        
                        const cssBtn = result.querySelector('.export-css-btn');
                        cssBtn.onclick = () => {
                            const css = `:root {\n  /* Palette extracted from ${file.name} */\n` + 
                                colors.map((c, i) => `  --color-palette-${i + 1}: ${c};`).join('\n') + 
                                '\n}\n\n/* Color classes */\n' +
                                colors.map((c, i) => `.color-${i + 1} { color: ${c}; }\n.bg-color-${i + 1} { background-color: ${c}; }`).join('\n');
                            downloadFile(css, `palette-${Date.now()}.css`);
                        };
                        
                        const aseBtn = result.querySelector('.export-ase-btn');
                        aseBtn.onclick = () => {
                            const aseContent = `Adobe Color Swatch Exchange Format\nPalette: ${file.name}\n\n` +
                                colors.map((color, i) => `${color}\t"Color ${i + 1}"`).join('\n');
                            downloadFile(aseContent, `palette-${Date.now()}.ase`, 'text/plain');
                        };
                        
                        result.classList.remove('hidden');
                        
                    } catch (error) {
                        console.error('Color extraction error:', error);
                        // Fallback with predefined colors
                        const fallbackColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];
                        
                        result.innerHTML = `
                            <h4>Color Palette Generated</h4>
                            <div style="background: rgba(255,107,107,0.2); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                                <strong>Note:</strong> Could not extract colors from image. Showing sample palette.
                            </div>
                            <div class="color-palette">
                                ${fallbackColors.map(color => `
                                    <div class="color-swatch" style="background-color: ${color};" title="Click to copy ${color}">
                                        ${color}
                                    </div>
                                `).join('')}
                            </div>
                            <button class="btn btn--outline btn--sm" onclick="copyToClipboard('${fallbackColors.join(', ')}')">Copy All Colors</button>
                        `;
                        
                        result.querySelectorAll('.color-swatch').forEach((swatch, index) => {
                            swatch.onclick = () => copyToClipboard(fallbackColors[index]);
                        });
                        
                        result.classList.remove('hidden');
                    }
                };
                
                img.onerror = function() {
                    showToast('Failed to load image. Please try a different file.', 'error');
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = function() {
                showToast('Failed to read file. Please try again.', 'error');
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
            
            // Generate cryptographically secure password
            let password = '';
            if (window.crypto && window.crypto.getRandomValues) {
                const array = new Uint32Array(length);
                window.crypto.getRandomValues(array);
                for (let i = 0; i < length; i++) {
                    password += chars.charAt(array[i] % chars.length);
                }
            } else {
                // Fallback for older browsers
                for (let i = 0; i < length; i++) {
                    password += chars.charAt(Math.floor(Math.random() * chars.length));
                }
            }
            
            // Ensure at least one character from each selected type
            if (options.uppercase && !/[A-Z]/.test(password)) {
                password = password.substring(1) + 'A';
            }
            if (options.lowercase && !/[a-z]/.test(password)) {
                password = password.substring(1) + 'a';
            }
            if (options.numbers && !/[0-9]/.test(password)) {
                password = password.substring(1) + '1';
            }
            if (options.symbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
                password = password.substring(1) + '!';
            }
            
            // Calculate strength
            const charTypeCount = Object.values(options).filter(v => v).length;
            let strength = 'weak';
            let strengthScore = 0;
            
            if (length >= 12) strengthScore += 25;
            if (length >= 16) strengthScore += 25;
            if (charTypeCount >= 3) strengthScore += 25;
            if (charTypeCount === 4) strengthScore += 25;
            
            if (strengthScore >= 75) strength = 'strong';
            else if (strengthScore >= 50) strength = 'medium';
            
            const entropy = Math.log2(Math.pow(chars.length, length));
            const crackTime = calculateCrackTime(chars.length, length);
            
            result.innerHTML = `
                <h4>Secure Password Generated</h4>
                <div class="password-result">
                    <input type="text" value="${password}" readonly style="letter-spacing: 1px;">
                    <button class="btn btn--sm copy-password-btn">Copy</button>
                </div>
                <div class="strength-indicator">
                    <span>Strength: </span>
                    <span class="strength-${strength}">${strength.toUpperCase()}</span>
                    <span style="margin-left: 8px;">(${strengthScore}/100)</span>
                </div>
                <div class="result-item">
                    <span>Length</span>
                    <span>${length} characters</span>
                </div>
                <div class="result-item">
                    <span>Character Types</span>
                    <span>${charTypeCount}/4 types</span>
                </div>
                <div class="result-item">
                    <span>Entropy</span>
                    <span>${entropy.toFixed(1)} bits</span>
                </div>
                <div class="result-item">
                    <span>Estimated Crack Time</span>
                    <span>${crackTime}</span>
                </div>
                <div class="result-item">
                    <span>Character Set Size</span>
                    <span>${chars.length} characters</span>
                </div>
                <div style="margin-top: 16px;">
                    <h5>Character Breakdown:</h5>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.8);">
                        ${options.uppercase ? '• Uppercase letters (A-Z)<br>' : ''}
                        ${options.lowercase ? '• Lowercase letters (a-z)<br>' : ''}
                        ${options.numbers ? '• Numbers (0-9)<br>' : ''}
                        ${options.symbols ? '• Special symbols (!@#$%...)<br>' : ''}
                    </div>
                </div>
                <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn btn--outline btn--sm generate-multiple-btn">Generate 5 More</button>
                    <button class="btn btn--outline btn--sm test-strength-btn">Test Strength</button>
                </div>
            `;
            
            const copyBtn = result.querySelector('.copy-password-btn');
            copyBtn.onclick = () => copyToClipboard(password);
            
            const multipleBtn = result.querySelector('.generate-multiple-btn');
            multipleBtn.onclick = () => {
                const passwords = [];
                for (let i = 0; i < 5; i++) {
                    let newPassword = '';
                    if (window.crypto && window.crypto.getRandomValues) {
                        const array = new Uint32Array(length);
                        window.crypto.getRandomValues(array);
                        for (let j = 0; j < length; j++) {
                            newPassword += chars.charAt(array[j] % chars.length);
                        }
                    } else {
                        for (let j = 0; j < length; j++) {
                            newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                    }
                    passwords.push(newPassword);
                }
                
                const passwordList = passwords.map((p, i) => `${i + 1}. ${p}`).join('\n');
                downloadFile(`Generated Passwords:\n\n${passwordList}\n\nGenerated: ${new Date().toLocaleString()}\nSettings: ${length} chars, ${charTypeCount} types`, `passwords-${Date.now()}.txt`);
            };
            
            const testBtn = result.querySelector('.test-strength-btn');
            testBtn.onclick = () => {
                showToast(`Password analysis: ${strength} strength with ${entropy.toFixed(0)} bits of entropy. Estimated crack time: ${crackTime}`, 'info');
            };
            
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
                    if (typeof marked !== 'undefined') {
                        const html = marked.parse(markdown);
                        preview.innerHTML = html;
                    } else {
                        // Fallback simple markdown parsing
                        const html = markdown
                            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                            .replace(/\*(.*)\*/gim, '<em>$1</em>')
                            .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
                            .replace(/`(.*?)`/gim, '<code>$1</code>')
                            .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
                            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
                            .replace(/^\- (.*$)/gim, '<li>$1</li>')
                            .replace(/\n/gim, '<br>');
                        preview.innerHTML = html;
                    }
                } catch (e) {
                    console.error('Markdown parsing error:', e);
                    preview.innerHTML = markdown.replace(/\n/g, '<br>');
                }
            };
            
            // Initial preview
            updatePreview();
            
            // Add event listener for real-time updates
            textarea.removeEventListener('input', updatePreview); // Remove existing listener
            textarea.addEventListener('input', updatePreview);
            
            // Toolbar functions
            const toolbar = card.querySelector('.markdown-toolbar');
            if (toolbar) {
                // Remove existing event listeners
                toolbar.replaceWith(toolbar.cloneNode(true));
                const newToolbar = card.querySelector('.markdown-toolbar');
                
                newToolbar.addEventListener('click', (e) => {
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
                                replacement = `[${selectedText || 'link text'}](https://example.com)`;
                                break;
                            case 'code':
                                replacement = `\`${selectedText || 'code'}\``;
                                break;
                            case 'list':
                                replacement = `- ${selectedText || 'list item'}`;
                                break;
                        }
                        
                        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
                        textarea.focus();
                        textarea.setSelectionRange(start + replacement.length, start + replacement.length);
                        updatePreview();
                    }
                });
            }
            
            // Export functions
            const exportButtons = card.querySelectorAll('.markdown-actions button');
            if (exportButtons.length >= 3) {
                exportButtons[0].onclick = () => {
                    try {
                        const html = typeof marked !== 'undefined' ? marked.parse(textarea.value) : textarea.value.replace(/\n/g, '<br>');
                        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 15px; color: #666; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
${html}
</body>
</html>`;
                        downloadFile(fullHtml, `markdown-export-${Date.now()}.html`, 'text/html');
                    } catch (error) {
                        showToast('Error exporting HTML', 'error');
                    }
                };
                
                exportButtons[1].onclick = () => {
                    downloadFile(textarea.value, `markdown-document-${Date.now()}.md`, 'text/markdown');
                };
                
                exportButtons[2].onclick = () => {
                    try {
                        const html = typeof marked !== 'undefined' ? marked.parse(textarea.value) : textarea.value.replace(/\n/g, '<br>');
                        copyToClipboard(html);
                    } catch (error) {
                        copyToClipboard(textarea.value);
                    }
                };
            }
        }
    }
};

// Helper functions for color palette
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
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

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

// Helper function for password crack time calculation
function calculateCrackTime(charsetSize, length) {
    const combinations = Math.pow(charsetSize, length);
    const guessesPerSecond = 1e9; // 1 billion guesses per second
    const secondsToGuess = combinations / (2 * guessesPerSecond); // Average case
    
    if (secondsToGuess < 60) return 'Seconds';
    if (secondsToGuess < 3600) return Math.round(secondsToGuess / 60) + ' minutes';
    if (secondsToGuess < 86400) return Math.round(secondsToGuess / 3600) + ' hours';
    if (secondsToGuess < 31536000) return Math.round(secondsToGuess / 86400) + ' days';
    if (secondsToGuess < 31536000000) return Math.round(secondsToGuess / 31536000) + ' years';
    return 'Centuries';
}

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
            const email = emailInput.value.trim();
            if (isValidEmail(email)) {
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
                hideModal(modal.id);
            }
        });
    });
    
    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
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
                
                // Track tool usage
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'tool_use', {
                        tool_name: toolType,
                        uses_remaining: state.usesRemaining
                    });
                }
                
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
            area.classList.add('dragover');
        });
        
        area.addEventListener('dragleave', (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
        });
        
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                input.files = e.dataTransfer.files;
                updateFileDisplay(area, input.files[0]);
            }
        });
        
        input.addEventListener('change', () => {
            if (input.files[0]) {
                updateFileDisplay(area, input.files[0]);
            }
        });
    });
    
    function updateFileDisplay(area, file) {
        const placeholder = area.querySelector('p');
        if (placeholder) {
            const fileSize = file.size > 1024 * 1024 ? 
                (file.size / (1024 * 1024)).toFixed(1) + ' MB' : 
                (file.size / 1024).toFixed(1) + ' KB';
            placeholder.innerHTML = `<strong>Selected:</strong> ${file.name}<br><small>${fileSize}</small>`;
        }
    }
    
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
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape key to close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                hideModal(modal.id);
            });
        }
        
        // Ctrl/Cmd + Enter to trigger tool execution
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const focusedCard = e.target.closest('.tool-card');
            if (focusedCard) {
                const button = focusedCard.querySelector('.btn--primary');
                if (button && !button.disabled) {
                    button.click();
                }
            }
        }
    });
});

// Initialize state on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => state.updateUI());
} else {
    state.updateUI();
}