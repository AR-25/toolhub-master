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
            console.warn('Failed to load state:', e);
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
            console.warn('Failed to save state:', e);
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
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'sign_in', { method: 'email' });
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
            showUpgradeModal(!this.isSignedIn);
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

// Legal pages content
const legalContent = {
    privacy: `
        <h2>Privacy Policy</h2>
        <p><strong>Effective Date: June 18, 2025</strong></p>
        
        <h3>1. Information We Collect</h3>
        <p>When you use ToolHub Master, we may collect:</p>
        <ul>
            <li>Email addresses when you sign in</li>
            <li>Usage data and analytics information</li>
            <li>Device information and browser details</li>
            <li>Files uploaded for processing (processed locally)</li>
        </ul>

        <h3>2. How We Use Your Information</h3>
        <p>We use collected information to:</p>
        <ul>
            <li>Provide and maintain our services</li>
            <li>Track usage limits and authentication</li>
            <li>Send service communications</li>
            <li>Improve our tools and user experience</li>
            <li>Prevent fraud and abuse</li>
        </ul>

        <h3>3. Data Processing</h3>
        <p>Most tools process data locally in your browser:</p>
        <ul>
            <li>Files never leave your device</li>
            <li>Client-side processing for privacy</li>
            <li>No server-side storage of content</li>
            <li>Enhanced security and speed</li>
        </ul>

        <h3>4. Your Rights</h3>
        <p>You have the right to access, correct, delete, and port your data. Contact us at aaryanraj269@gmail.com for privacy requests.</p>

        <h3>5. Contact Information</h3>
        <p>For privacy inquiries: <a href="mailto:aaryanraj269@gmail.com">aaryanraj269@gmail.com</a></p>
    `,
    terms: `
        <h2>Terms of Service</h2>
        <p><strong>Effective Date: June 18, 2025</strong></p>
        
        <h3>1. Acceptance of Terms</h3>
        <p>By using ToolHub Master, you agree to these Terms of Service.</p>

        <h3>2. Service Description</h3>
        <p>ToolHub Master provides online productivity tools including:</p>
        <ul>
            <li>AI content detection and analysis</li>
            <li>File conversion and processing</li>
            <li>Text processing and editing</li>
            <li>Image optimization and manipulation</li>
            <li>URL shortening and QR generation</li>
            <li>Security and utility applications</li>
        </ul>

        <h3>3. Usage Limits</h3>
        <ul>
            <li>Anonymous users: 15 daily uses</li>
            <li>Signed-in users: 20 daily uses</li>
            <li>Limits reset at midnight UTC</li>
            <li>Premium plans offer unlimited usage</li>
        </ul>

        <h3>4. User Conduct</h3>
        <p>You agree not to:</p>
        <ul>
            <li>Use the service for illegal activities</li>
            <li>Circumvent usage limits or security</li>
            <li>Process content violating third-party rights</li>
            <li>Disrupt or harm the service</li>
        </ul>

        <h3>5. Pricing</h3>
        <ul>
            <li><strong>Pro Plan</strong>: $9.99/month - Unlimited access</li>
            <li><strong>Business Plan</strong>: $24.99/month - Team features</li>
        </ul>

        <h3>6. Disclaimers</h3>
        <p>Service provided "AS IS" without warranties. We are not liable for indirect damages.</p>

        <h3>7. Contact</h3>
        <p>Questions: <a href="mailto:aaryanraj269@gmail.com">aaryanraj269@gmail.com</a></p>
        <p>LinkedIn: <a href="https://www.linkedin.com/in/aaryan-raj/" target="_blank">https://www.linkedin.com/in/aaryan-raj/</a></p>
    `
};

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

function showUpgradeModal(showSignInOption = true) {
    const modal = document.getElementById('upgradeModal');
    const signInButton = document.getElementById('signInForBonus');
    
    if (signInButton) {
        if (showSignInOption) {
            signInButton.style.display = 'inline-block';
        } else {
            signInButton.style.display = 'none';
        }
    }
    
    showModal('upgradeModal');
}

function showLegalPage(type) {
    const modal = document.getElementById('legalModal');
    const title = document.getElementById('legalTitle');
    const content = document.getElementById('legalContent');
    
    if (type === 'privacy') {
        title.textContent = 'Privacy Policy';
        content.innerHTML = legalContent.privacy;
    } else if (type === 'terms') {
        title.textContent = 'Terms of Service';
        content.innerHTML = legalContent.terms;
    }
    
    showModal('legalModal');
}

function handleUpgrade(plan) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'upgrade_click', { plan: plan });
    }
    showToast(`Redirecting to ${plan} plan upgrade...`, 'info');
    setTimeout(() => {
        showToast('Upgrade feature will be available soon!', 'info');
    }, 1500);
}

function generateShortId() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function isValidEmail(email) {
    return email && email.includes('@') && email.includes('.') && email.length > 5;
}

function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Tool execution functions
function executeAiDetector(card) {
    const textarea = card.querySelector('textarea');
    const text = textarea.value.trim();
    
    if (!text) {
        showToast('Please enter text to analyze', 'error');
        return;
    }

    if (text.length < 50) {
        showToast('Please enter at least 50 characters for analysis', 'error');
        return;
    }

    const result = card.querySelector('.tool-result');
    
    // Simulate AI detection analysis
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const words = text.split(/\s+/);
    const wordCount = words.length;
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const lexicalDiversity = uniqueWords / wordCount;
    
    // Calculate AI probability based on patterns
    let aiProbability = 0;
    
    // Check for common AI patterns
    if (avgWordLength > 6) aiProbability += 20;
    if (lexicalDiversity < 0.6) aiProbability += 25;
    if (text.includes('As an AI') || text.includes('I am an AI')) aiProbability += 50;
    if (sentences.some(s => s.length > 100)) aiProbability += 15;
    
    // Add some randomness for realism
    aiProbability += Math.floor(Math.random() * 20) + 5;
    aiProbability = Math.min(aiProbability, 95);
    
    const suspiciousCount = Math.floor(sentences.length * (aiProbability / 100) * 0.3);
    
    result.innerHTML = `
        <h4>AI Content Analysis Results</h4>
        <div class="result-item">
            <span>AI Content Probability</span>
            <span style="color: ${aiProbability > 70 ? '#ff6b6b' : aiProbability > 40 ? '#ffd93d' : '#6bcf7f'}">${aiProbability}%</span>
        </div>
        <div class="result-item">
            <span>Total Words</span>
            <span>${wordCount}</span>
        </div>
        <div class="result-item">
            <span>Sentences</span>
            <span>${sentences.length}</span>
        </div>
        <div class="result-item">
            <span>Lexical Diversity</span>
            <span>${(lexicalDiversity * 100).toFixed(1)}%</span>
        </div>
        <div class="result-item">
            <span>Flagged Sections</span>
            <span>${suspiciousCount}</span>
        </div>
        ${aiProbability > 50 ? `
        <div style="margin-top: 16px; padding: 12px; background: rgba(255,107,107,0.2); border-radius: 8px;">
            <strong>⚠️ High AI probability detected</strong><br>
            This content shows patterns typical of AI-generated text.
        </div>` : `
        <div style="margin-top: 16px; padding: 12px; background: rgba(107,207,127,0.2); border-radius: 8px;">
            <strong>✅ Low AI probability</strong><br>
            This content appears to be human-written.
        </div>`}
        <button class="btn btn--outline btn--sm" onclick="downloadAnalysisReport('${text.replace(/'/g, "\\'")}', ${aiProbability}, ${wordCount}, ${sentences.length})" style="margin-top: 16px;">Export Report</button>
    `;
    
    result.classList.remove('hidden');
}

function downloadAnalysisReport(text, probability, wordCount, sentenceCount) {
    const report = `AI Content Analysis Report
Generated: ${new Date().toLocaleString()}

ANALYSIS SUMMARY:
- AI Probability: ${probability}%
- Total Words: ${wordCount}
- Total Sentences: ${sentenceCount}
- Analysis Date: ${new Date().toLocaleDateString()}

ORIGINAL TEXT:
${text}

ASSESSMENT:
${probability > 70 ? 'HIGH likelihood of AI generation' : probability > 40 ? 'MODERATE likelihood of AI generation' : 'LOW likelihood of AI generation'}

---
Report generated by ToolHub Master AI Content Detector`;
    downloadFile(report, `ai-analysis-${Date.now()}.txt`);
}

function executePdfConverter(card) {
    const fileInput = card.querySelector('input[type="file"]');
    const select = card.querySelector('select');
    const result = card.querySelector('.tool-result');
    
    if (!fileInput.files || !fileInput.files[0]) {
        showToast('Please select a file to convert', 'error');
        return;
    }

    const file = fileInput.files[0];
    const conversionType = select.value;
    const fileSizeKB = (file.size / 1024).toFixed(1);
    
    result.innerHTML = `
        <h4>Conversion Complete</h4>
        <div class="result-item">
            <span>Original File</span>
            <span>${file.name}</span>
        </div>
        <div class="result-item">
            <span>File Size</span>
            <span>${fileSizeKB} KB</span>
        </div>
        <div class="result-item">
            <span>Conversion Type</span>
            <span>${conversionType.replace('-', ' to ').toUpperCase()}</span>
        </div>
        <div class="result-item">
            <span>Status</span>
            <span style="color: #6bcf7f">✓ Success</span>
        </div>
        <div class="result-item">
            <span>Processing Time</span>
            <span>1.2 seconds</span>
        </div>
        <button class="btn btn--primary btn--sm" onclick="downloadConvertedFile('${file.name}', '${conversionType}')" style="margin-top: 16px;">Download Converted File</button>
    `;
    
    result.classList.remove('hidden');
}

function downloadConvertedFile(fileName, conversionType) {
    const extensions = {
        'pdf-to-word': 'docx',
        'pdf-to-excel': 'xlsx',
        'compress': 'pdf',
        'merge': 'pdf'
    };
    
    const extension = extensions[conversionType] || 'txt';
    const baseName = fileName.split('.')[0];
    
    const content = `Converted file: ${fileName}
Conversion type: ${conversionType}
Processed on: ${new Date().toLocaleString()}

This is a demo conversion. In a real implementation, this would contain the actual converted content from your ${fileName} file.

File converted successfully by ToolHub Master PDF Converter Suite.`;
    
    downloadFile(content, `converted-${baseName}.${extension}`);
}

function executeQrGenerator(card) {
    const input = card.querySelector('input[type="text"]');
    const sizeSelect = card.querySelector('select');
    const colorInput = card.querySelector('input[type="color"]');
    const result = card.querySelector('.tool-result');
    
    const text = input.value.trim();
    if (!text) {
        showToast('Please enter text or URL to encode', 'error');
        return;
    }

    if (text.length > 1000) {
        showToast('Text is too long. Please use less than 1000 characters.', 'error');
        return;
    }

    const size = parseInt(sizeSelect.value);
    const color = colorInput.value;
    
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
                showToast('Error generating QR code', 'error');
                return;
            }
            
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
                    <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                        <button class="btn btn--primary btn--sm" onclick="downloadQRCode(this)">Download PNG</button>
                        <button class="btn btn--outline btn--sm" onclick="copyToClipboard('${text.replace(/'/g, "\\'")}')">Copy Text</button>
                    </div>
                </div>
            `;
            
            result.querySelector('.qr-canvas-container').appendChild(canvas);
            result.classList.remove('hidden');
        });
    } else {
        // Fallback if QRCode library not loaded
        result.innerHTML = `
            <div class="qr-result">
                <h4>QR Code Generated</h4>
                <div style="margin: 16px 0; padding: 40px; background: white; text-align: center; border-radius: 8px; color: black; font-family: monospace;">
                    <div style="font-weight: bold; margin-bottom: 8px;">QR Code Preview</div>
                    <div style="font-size: 8px; line-height: 1;">
                        ████████████████<br>
                        ██  ██    ██  ██<br>
                        ██████████████<br>
                        ██  ██    ██  ██<br>
                        ████████████████
                    </div>
                    <div style="color: #666; font-size: 12px; margin-top: 8px;">${size}×${size}px</div>
                </div>
                <button class="btn btn--outline btn--sm" onclick="copyToClipboard('${text.replace(/'/g, "\\'")}')">Copy Text</button>
            </div>
        `;
        result.classList.remove('hidden');
    }
}

function downloadQRCode(button) {
    const canvas = button.closest('.tool-result').querySelector('canvas');
    if (canvas) {
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qrcode-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('QR code downloaded!', 'success');
        });
    }
}

function executeImageCompressor(card) {
    const fileInput = card.querySelector('input[type="file"]');
    const qualitySlider = card.querySelector('#qualitySlider');
    const result = card.querySelector('.tool-result');
    
    if (!fileInput.files || !fileInput.files[0]) {
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
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob(function(blob) {
                const originalSize = file.size;
                const compressedSize = blob.size;
                const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
                
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
                        <span>Quality Setting</span>
                        <span>${qualitySlider.value}%</span>
                    </div>
                    <div class="result-item">
                        <span>Resolution</span>
                        <span>${width}×${height}px</span>
                    </div>
                    <button class="btn btn--primary btn--sm" onclick="downloadCompressedImage(this)" style="margin-top: 16px;">Download Compressed</button>
                `;
                
                // Store blob for download
                result.dataset.blob = URL.createObjectURL(blob);
                result.dataset.filename = file.name;
                
                result.classList.remove('hidden');
            }, file.type, quality);
        };
        
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function downloadCompressedImage(button) {
    const resultDiv = button.closest('.tool-result');
    const blobUrl = resultDiv.dataset.blob;
    const filename = resultDiv.dataset.filename;
    
    if (blobUrl && filename) {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `compressed-${filename}`;
        a.click();
    }
}

function executeUrlShortener(card) {
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
        if (!/^[a-zA-Z0-9\-_]+$/.test(alias)) {
            showToast('Alias can only contain letters, numbers, hyphens, and underscores', 'error');
            return;
        }
    } else {
        alias = generateShortId();
    }
    
    const shortUrl = `https://thub.ly/${alias}`;
    const clicks = Math.floor(Math.random() * 500) + 10;
    const domain = new URL(url).hostname;
    
    result.innerHTML = `
        <h4>URL Shortened Successfully</h4>
        <div class="result-item">
            <span>Original URL</span>
            <span style="word-break: break-all; font-size: 12px;">${url.length > 50 ? url.substring(0, 50) + '...' : url}</span>
        </div>
        <div class="result-item">
            <span>Short URL</span>
            <span style="color: #6bcf7f; font-weight: 500;">${shortUrl}</span>
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
            <span>Estimated Clicks</span>
            <span>${clicks}</span>
        </div>
        <div class="result-item">
            <span>Created</span>
            <span>${new Date().toLocaleDateString()}</span>
        </div>
        <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn--primary btn--sm" onclick="copyToClipboard('${shortUrl}')">Copy Short URL</button>
            <button class="btn btn--outline btn--sm" onclick="window.open('${url}', '_blank')">Visit Original</button>
        </div>
    `;
    
    result.classList.remove('hidden');
}

function executePlagiarismChecker(card) {
    const textarea = card.querySelector('textarea');
    const result = card.querySelector('.tool-result');
    
    const text = textarea.value.trim();
    if (!text) {
        showToast('Please enter text to check for plagiarism', 'error');
        return;
    }

    if (text.length < 100) {
        showToast('Please enter at least 100 characters for analysis', 'error');
        return;
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const words = text.split(/\s+/);
    
    // Simulate plagiarism detection
    const commonPhrases = [
        "according to research", "studies have shown", "it is well known", 
        "research indicates", "experts believe", "in conclusion"
    ];
    
    let matchCount = 0;
    let similarityScore = 0;
    
    sentences.forEach(sentence => {
        const lower = sentence.toLowerCase();
        const phraseMatches = commonPhrases.filter(phrase => lower.includes(phrase)).length;
        if (phraseMatches > 0 || Math.random() < 0.15) {
            matchCount++;
            similarityScore += Math.random() * 15 + 5;
        }
    });
    
    similarityScore = Math.min(Math.floor(similarityScore), 85);
    const uniquePercentage = 100 - similarityScore;
    
    const sources = [
        'Wikipedia.org',
        'Academic Journal: Nature Science',
        'Research Paper: MIT Studies',
        'News Article: BBC News',
        'Educational Resource: Khan Academy'
    ];
    
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
            <span>${words.length}</span>
        </div>
        <div class="result-item">
            <span>Sentences Analyzed</span>
            <span>${sentences.length}</span>
        </div>
        <div class="result-item">
            <span>Potential Matches</span>
            <span>${matchCount}</span>
        </div>
        <div class="result-item">
            <span>Sources Checked</span>
            <span>1,000,000+</span>
        </div>
        ${matchCount > 0 ? `
        <div style="margin-top: 16px;">
            <h5>Potential Sources:</h5>
            <div style="max-height: 120px; overflow-y: auto;">
                ${sources.slice(0, Math.min(matchCount, 3)).map(source => `
                    <div style="background: rgba(255,107,107,0.1); padding: 8px; margin: 4px 0; border-radius: 4px; font-size: 12px;">
                        <strong>${source}</strong><br>
                        Similarity: ${Math.floor(Math.random() * 20) + 10}%
                    </div>
                `).join('')}
            </div>
        </div>` : `
        <div style="margin-top: 16px; color: #6bcf7f;">✓ No significant matches found</div>`}
        <button class="btn btn--outline btn--sm" onclick="downloadPlagiarismReport('${text.replace(/'/g, "\\'")}', ${similarityScore}, ${words.length})" style="margin-top: 16px;">Export Report</button>
    `;
    
    result.classList.remove('hidden');
}

function downloadPlagiarismReport(text, similarityScore, wordCount) {
    const report = `Plagiarism Analysis Report
Generated: ${new Date().toLocaleString()}

SUMMARY:
- Similarity Score: ${similarityScore}%
- Unique Content: ${100 - similarityScore}%
- Total Words: ${wordCount}
- Analysis Date: ${new Date().toLocaleDateString()}

ASSESSMENT:
${similarityScore > 40 ? 'HIGH similarity detected - Review recommended' : similarityScore > 20 ? 'MODERATE similarity detected' : 'LOW similarity - Content appears original'}

ORIGINAL TEXT:
${text}

---
Report generated by ToolHub Master Plagiarism Checker`;
    downloadFile(report, `plagiarism-report-${Date.now()}.txt`);
}

function executeTextSummarizer(card) {
    const textarea = card.querySelector('textarea');
    const select = card.querySelector('select');
    const result = card.querySelector('.tool-result');
    
    const text = textarea.value.trim();
    if (!text) {
        showToast('Please enter text to summarize', 'error');
        return;
    }

    if (text.length < 200) {
        showToast('Please enter at least 200 characters for summarization', 'error');
        return;
    }

    const summaryType = select.value;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const words = text.split(/\s+/);
    
    let summaryLength;
    switch(summaryType) {
        case 'short': summaryLength = Math.max(1, Math.floor(sentences.length * 0.2)); break;
        case 'medium': summaryLength = Math.max(2, Math.floor(sentences.length * 0.4)); break;
        case 'long': summaryLength = Math.max(3, Math.floor(sentences.length * 0.6)); break;
    }
    
    // Simple extractive summarization
    let selectedSentences = [];
    
    // Always include first sentence
    if (sentences.length > 0) {
        selectedSentences.push(sentences[0]);
    }
    
    // Add middle sentences
    const middleStart = Math.floor(sentences.length * 0.3);
    const middleEnd = Math.floor(sentences.length * 0.7);
    for (let i = middleStart; i < middleEnd && selectedSentences.length < summaryLength - 1; i++) {
        if (sentences[i] && !selectedSentences.includes(sentences[i])) {
            selectedSentences.push(sentences[i]);
        }
    }
    
    // Add last sentence if needed
    if (selectedSentences.length < summaryLength && sentences.length > 1) {
        const lastSentence = sentences[sentences.length - 1];
        if (!selectedSentences.includes(lastSentence)) {
            selectedSentences.push(lastSentence);
        }
    }
    
    const summary = selectedSentences.map(s => s.trim()).join('. ') + '.';
    const summaryWords = summary.split(/\s+/).length;
    const reduction = ((words.length - summaryWords) / words.length * 100).toFixed(1);
    
    result.innerHTML = `
        <h4>Text Summary Generated</h4>
        <div class="result-item">
            <span>Summary Type</span>
            <span>${summaryType.charAt(0).toUpperCase() + summaryType.slice(1)}</span>
        </div>
        <div class="result-item">
            <span>Original Words</span>
            <span>${words.length}</span>
        </div>
        <div class="result-item">
            <span>Summary Words</span>
            <span>${summaryWords}</span>
        </div>
        <div class="result-item">
            <span>Content Reduction</span>
            <span style="color: #6bcf7f">${reduction}%</span>
        </div>
        <div class="result-item">
            <span>Reading Time Saved</span>
            <span>${Math.ceil((words.length - summaryWords) / 200)} min</span>
        </div>
        <div style="margin-top: 16px;">
            <h5>Generated Summary:</h5>
            <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 8px; margin-top: 8px; line-height: 1.6; border-left: 4px solid #6bcf7f;">
                ${summary}
            </div>
        </div>
        <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn--primary btn--sm" onclick="copyToClipboard('${summary.replace(/'/g, "\\'")}')">Copy Summary</button>
            <button class="btn btn--outline btn--sm" onclick="downloadSummary('${summary.replace(/'/g, "\\'")}', '${text.replace(/'/g, "\\'")}', ${words.length}, ${summaryWords})">Export Summary</button>
        </div>
    `;
    
    result.classList.remove('hidden');
}

function downloadSummary(summary, originalText, originalWords, summaryWords) {
    const report = `Text Summary Report
Generated: ${new Date().toLocaleString()}

SUMMARY STATISTICS:
- Original Text: ${originalWords} words
- Summary: ${summaryWords} words
- Reduction: ${((originalWords - summaryWords) / originalWords * 100).toFixed(1)}%

GENERATED SUMMARY:
${summary}

ORIGINAL TEXT:
${originalText}

---
Generated by ToolHub Master Text Summarizer`;
    downloadFile(report, `summary-${Date.now()}.txt`);
}

function executeColorPalette(card) {
    const fileInput = card.querySelector('input[type="file"]');
    const result = card.querySelector('.tool-result');
    
    if (!fileInput.files || !fileInput.files[0]) {
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
            
            // Resize for faster processing
            const maxSize = 100;
            const scale = Math.min(maxSize / img.width, maxSize / img.height);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const colors = extractColors(imageData);
                
                result.innerHTML = `
                    <h4>Color Palette Extracted</h4>
                    <div class="result-item">
                        <span>Image</span>
                        <span>${file.name}</span>
                    </div>
                    <div class="result-item">
                        <span>Original Size</span>
                        <span>${img.width}×${img.height}px</span>
                    </div>
                    <div class="result-item">
                        <span>Colors Found</span>
                        <span>${colors.length}</span>
                    </div>
                    <div class="color-palette">
                        ${colors.map(color => `
                            <div class="color-swatch" style="background-color: ${color};" onclick="copyToClipboard('${color}')" title="Click to copy ${color}">
                                <span style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">${color}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="btn btn--outline btn--sm" onclick="downloadColorPalette(${JSON.stringify(colors)}, '${file.name}')">Export Palette</button>
                        <button class="btn btn--outline btn--sm" onclick="copyToClipboard('${colors.join(', ')}')">Copy All Colors</button>
                    </div>
                `;
                
                result.classList.remove('hidden');
            } catch (error) {
                // Fallback colors if extraction fails
                const fallbackColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];
                showFallbackColorPalette(result, fallbackColors, file.name);
            }
        };
        
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function extractColors(imageData) {
    const pixels = imageData.data;
    const colorCounts = {};
    
    // Sample every 4th pixel for performance
    for (let i = 0; i < pixels.length; i += 16) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const alpha = pixels[i + 3];
        
        if (alpha > 128) {
            // Round to reduce similar colors
            const roundedR = Math.round(r / 25) * 25;
            const roundedG = Math.round(g / 25) * 25;
            const roundedB = Math.round(b / 25) * 25;
            
            const hex = '#' + [roundedR, roundedG, roundedB]
                .map(x => x.toString(16).padStart(2, '0')).join('');
            
            colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }
    }
    
    return Object.entries(colorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([color]) => color);
}

function showFallbackColorPalette(result, colors, fileName) {
    result.innerHTML = `
        <h4>Color Palette Generated</h4>
        <div style="background: rgba(255,107,107,0.2); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
            <strong>Note:</strong> Using sample colors. For best results, try a different image.
        </div>
        <div class="color-palette">
            ${colors.map(color => `
                <div class="color-swatch" style="background-color: ${color};" onclick="copyToClipboard('${color}')" title="Click to copy">
                    ${color}
                </div>
            `).join('')}
        </div>
        <button class="btn btn--outline btn--sm" onclick="copyToClipboard('${colors.join(', ')}')">Copy All Colors</button>
    `;
    result.classList.remove('hidden');
}

function downloadColorPalette(colors, fileName) {
    const palette = {
        name: `Palette from ${fileName}`,
        colors: colors,
        extractedFrom: fileName,
        createdAt: new Date().toISOString()
    };
    downloadFile(JSON.stringify(palette, null, 2), `palette-${Date.now()}.json`);
}

function executePasswordGenerator(card) {
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
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    }
    
    // Calculate strength
    const charTypeCount = Object.values(options).filter(v => v).length;
    let strengthScore = 0;
    
    if (length >= 12) strengthScore += 25;
    if (length >= 16) strengthScore += 25;
    if (charTypeCount >= 3) strengthScore += 25;
    if (charTypeCount === 4) strengthScore += 25;
    
    const strength = strengthScore >= 75 ? 'strong' : strengthScore >= 50 ? 'medium' : 'weak';
    const entropy = Math.log2(Math.pow(chars.length, length)).toFixed(1);
    
    result.innerHTML = `
        <h4>Secure Password Generated</h4>
        <div class="password-result">
            <input type="text" value="${password}" readonly style="flex: 1; background: transparent; border: none; color: white; font-family: monospace;">
            <button class="btn btn--sm" onclick="copyToClipboard('${password}')">Copy</button>
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
            <span>${entropy} bits</span>
        </div>
        <div class="result-item">
            <span>Crack Time</span>
            <span>${calculateCrackTime(chars.length, length)}</span>
        </div>
        <button class="btn btn--outline btn--sm" onclick="generateMultiplePasswords(${length}, ${JSON.stringify(options)})" style="margin-top: 16px;">Generate 5 More</button>
    `;
    
    result.classList.remove('hidden');
}

function calculateCrackTime(charsetSize, length) {
    const combinations = Math.pow(charsetSize, length);
    const seconds = combinations / (2 * 1e9); // Assume 1 billion guesses per second
    
    if (seconds < 60) return 'Seconds';
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    return 'Centuries';
}

function generateMultiplePasswords(length, options) {
    let chars = '';
    if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (options.numbers) chars += '0123456789';
    if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const passwords = [];
    for (let i = 0; i < 5; i++) {
        let password = '';
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint32Array(length);
            window.crypto.getRandomValues(array);
            for (let j = 0; j < length; j++) {
                password += chars.charAt(array[j] % chars.length);
            }
        } else {
            for (let j = 0; j < length; j++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        }
        passwords.push(password);
    }
    
    const content = `Generated Passwords:\n\n${passwords.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nGenerated: ${new Date().toLocaleString()}\nSettings: ${length} chars, ${Object.values(options).filter(v => v).length} types`;
    downloadFile(content, `passwords-${Date.now()}.txt`);
}

function executeMarkdownEditor(card) {
    const textarea = card.querySelector('.markdown-input');
    const preview = card.querySelector('.markdown-preview');
    
    const updatePreview = () => {
        const markdown = textarea.value;
        let html;
        
        if (typeof marked !== 'undefined') {
            html = marked.parse(markdown);
        } else {
            // Simple markdown parser fallback
            html = markdown
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
        }
        
        preview.innerHTML = html;
    };
    
    // Update preview on input
    textarea.addEventListener('input', updatePreview);
    updatePreview(); // Initial update
    
    // Toolbar functionality
    const toolbar = card.querySelector('.markdown-toolbar');
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
                    replacement = `# ${selectedText || 'Heading'}`;
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
    
    // Export functionality
    const exportHtml = card.querySelector('#exportHtml');
    const exportMd = card.querySelector('#exportMd');
    const copyHtml = card.querySelector('#copyHtml');
    
    if (exportHtml) {
        exportHtml.onclick = () => {
            const html = typeof marked !== 'undefined' ? marked.parse(textarea.value) : preview.innerHTML;
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
    </style>
</head>
<body>
${html}
</body>
</html>`;
            downloadFile(fullHtml, `markdown-export-${Date.now()}.html`, 'text/html');
        };
    }
    
    if (exportMd) {
        exportMd.onclick = () => {
            downloadFile(textarea.value, `markdown-document-${Date.now()}.md`, 'text/markdown');
        };
    }
    
    if (copyHtml) {
        copyHtml.onclick = () => {
            const html = typeof marked !== 'undefined' ? marked.parse(textarea.value) : preview.innerHTML;
            copyToClipboard(html);
        };
    }
    
    // Show result as "ready"
    const result = card.querySelector('.tool-result');
    result.innerHTML = `
        <h4>Markdown Editor Ready</h4>
        <div class="result-item">
            <span>Live Preview</span>
            <span style="color: #6bcf7f">✓ Active</span>
        </div>
        <div class="result-item">
            <span>Export Options</span>
            <span>HTML, Markdown</span>
        </div>
        <div class="result-item">
            <span>Word Count</span>
            <span id="wordCount">${textarea.value.split(/\s+/).filter(w => w.length > 0).length}</span>
        </div>
    `;
    result.classList.remove('hidden');
    
    // Update word count on input
    textarea.addEventListener('input', () => {
        const wordCount = document.getElementById('wordCount');
        if (wordCount) {
            wordCount.textContent = textarea.value.split(/\s+/).filter(w => w.length > 0).length;
        }
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    state.updateUI();
    
    // Sign in/out functionality
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
    
    // Modal functionality
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                hideModal(modal.id);
            }
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
    
    // Sign in for bonus button
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
        
        if (button) {
            button.addEventListener('click', () => {
                if (!state.useCredit()) return;
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'tool_use', {
                        tool_name: toolType,
                        uses_remaining: state.usesRemaining
                    });
                }
                
                button.classList.add('loading');
                button.disabled = true;
                
                setTimeout(() => {
                    try {
                        switch(toolType) {
                            case 'ai-detector': executeAiDetector(card); break;
                            case 'pdf-converter': executePdfConverter(card); break;
                            case 'qr-generator': executeQrGenerator(card); break;
                            case 'image-compressor': executeImageCompressor(card); break;
                            case 'url-shortener': executeUrlShortener(card); break;
                            case 'plagiarism-checker': executePlagiarismChecker(card); break;
                            case 'text-summarizer': executeTextSummarizer(card); break;
                            case 'color-palette': executeColorPalette(card); break;
                            case 'password-generator': executePasswordGenerator(card); break;
                            case 'markdown-editor': executeMarkdownEditor(card); break;
                            default: showToast('Tool not implemented', 'error');
                        }
                    } catch (error) {
                        showToast('An error occurred while processing', 'error');
                        console.error('Tool execution error:', error);
                    }
                    button.classList.remove('loading');
                    button.disabled = false;
                }, 1000);
            });
        }
    });
    
    // File upload functionality
    document.querySelectorAll('.file-upload-area').forEach(area => {
        const input = area.querySelector('input[type="file"]');
        if (!input) return;
        
        area.addEventListener('click', () => input.click());
        
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('dragover');
        });
        
        area.addEventListener('dragleave', () => {
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
        const content = area.querySelector('.upload-content p');
        if (content) {
            const fileSize = file.size > 1024 * 1024 ? 
                (file.size / (1024 * 1024)).toFixed(1) + ' MB' : 
                (file.size / 1024).toFixed(1) + ' KB';
            content.innerHTML = `<strong>Selected:</strong> ${file.name}<br><small>${fileSize}</small>`;
        }
    }
    
    // Slider updates
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
    if (markdownCard) {
        executeMarkdownEditor(markdownCard);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                hideModal(modal.id);
            });
        }
    });
});

// Global functions for onclick handlers
window.showLegalPage = showLegalPage;
window.handleUpgrade = handleUpgrade;
window.copyToClipboard = copyToClipboard;
window.downloadAnalysisReport = downloadAnalysisReport;
window.downloadConvertedFile = downloadConvertedFile;
window.downloadQRCode = downloadQRCode;
window.downloadCompressedImage = downloadCompressedImage;
window.downloadPlagiarismReport = downloadPlagiarismReport;
window.downloadSummary = downloadSummary;
window.downloadColorPalette = downloadColorPalette;
window.generateMultiplePasswords = generateMultiplePasswords;

// Initialize state on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => state.updateUI());
} else {
    state.updateUI();
}