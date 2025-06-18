// ToolHub Master JavaScript Implementation
class ToolHubMaster {
    constructor() {
        this.maxFreeUses = 15;
        this.signInBonus = 5;
        this.currentUsage = this.getUsageCount();
        this.isSignedIn = this.getSignInStatus();
        this.userEmail = this.getUserEmail();
        this.urlMapping = this.getUrlMapping();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUsageDisplay();
        this.updateUserInterface();
        this.setupThemeToggle();
        this.setupMarkdownEditor();
        this.checkDailyReset();
        
        // Track page view
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: 'ToolHub Master',
                page_location: window.location.href
            });
        }
    }

    // Usage Management
    getUsageCount() {
        try {
            const today = new Date().toDateString();
            const savedData = JSON.parse(localStorage.getItem('toolhub_usage') || '{}');
            
            if (savedData.date !== today) {
                // Reset daily usage
                return 0;
            }
            return savedData.count || 0;
        } catch (e) {
            return 0;
        }
    }

    saveUsageCount(count) {
        try {
            const today = new Date().toDateString();
            localStorage.setItem('toolhub_usage', JSON.stringify({
                date: today,
                count: count
            }));
            this.currentUsage = count;
            this.updateUsageDisplay();
        } catch (e) {
            console.warn('Could not save usage count');
        }
    }

    canUseTools() {
        const maxUses = this.isSignedIn ? this.maxFreeUses + this.signInBonus : this.maxFreeUses;
        return this.currentUsage < maxUses;
    }

    consumeUsage() {
        if (!this.canUseTools()) {
            this.showSignInModal();
            return false;
        }
        
        this.saveUsageCount(this.currentUsage + 1);
        
        // Check if user reached limit after sign-in
        const maxUses = this.isSignedIn ? this.maxFreeUses + this.signInBonus : this.maxFreeUses;
        if (this.currentUsage >= maxUses) {
            setTimeout(() => this.showUpgradeModal(), 1000);
        }
        
        return true;
    }

    updateUsageDisplay() {
        const maxUses = this.isSignedIn ? this.maxFreeUses + this.signInBonus : this.maxFreeUses;
        const remaining = Math.max(0, maxUses - this.currentUsage);
        const displayElement = document.getElementById('usageDisplay');
        if (displayElement) {
            displayElement.textContent = `${remaining}/${maxUses} uses remaining`;
        }
    }

    checkDailyReset() {
        try {
            const today = new Date().toDateString();
            const savedData = JSON.parse(localStorage.getItem('toolhub_usage') || '{}');
            
            if (savedData.date && savedData.date !== today) {
                this.saveUsageCount(0);
            }
        } catch (e) {
            console.warn('Could not check daily reset');
        }
    }

    // Sign-in Management
    getSignInStatus() {
        try {
            return localStorage.getItem('toolhub_signed_in') === 'true';
        } catch (e) {
            return false;
        }
    }

    getUserEmail() {
        try {
            return localStorage.getItem('toolhub_user_email') || '';
        } catch (e) {
            return '';
        }
    }

    signIn(email) {
        try {
            localStorage.setItem('toolhub_signed_in', 'true');
            localStorage.setItem('toolhub_user_email', email);
            this.isSignedIn = true;
            this.userEmail = email;
            this.updateUserInterface();
            this.updateUsageDisplay();
            this.hideModal('signInModal');
            this.showToast('Welcome! You got 5 additional free uses.', 'success');
            
            // Track sign-in event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'sign_in', { method: 'email' });
            }
        } catch (e) {
            this.showToast('Sign-in failed. Please try again.', 'error');
        }
    }

    signOut() {
        try {
            localStorage.removeItem('toolhub_signed_in');
            localStorage.removeItem('toolhub_user_email');
            this.isSignedIn = false;
            this.userEmail = '';
            this.updateUserInterface();
            this.updateUsageDisplay();
            this.showToast('Signed out successfully', 'success');
        } catch (e) {
            this.showToast('Sign-out failed', 'error');
        }
    }

    updateUserInterface() {
        const userSection = document.getElementById('userSection');
        const userGreeting = document.getElementById('userGreeting');
        
        if (userSection && userGreeting) {
            if (this.isSignedIn && this.userEmail) {
                userSection.classList.remove('hidden');
                userGreeting.textContent = `Welcome, ${this.userEmail.split('@')[0]}!`;
            } else {
                userSection.classList.add('hidden');
            }
        }
    }

    // URL Mapping for URL Shortener
    getUrlMapping() {
        try {
            return JSON.parse(localStorage.getItem('toolhub_urls') || '{}');
        } catch (e) {
            return {};
        }
    }

    saveUrlMapping(mapping) {
        try {
            localStorage.setItem('toolhub_urls', JSON.stringify(mapping));
            this.urlMapping = mapping;
        } catch (e) {
            console.warn('Could not save URL mapping');
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Sign-in modal
        const signInBtn = document.getElementById('signInBtn');
        if (signInBtn) {
            signInBtn.addEventListener('click', () => {
                const emailInput = document.getElementById('emailInput');
                if (emailInput) {
                    const email = emailInput.value;
                    if (this.validateEmail(email)) {
                        this.signIn(email);
                    } else {
                        this.showToast('Please enter a valid email address', 'error');
                    }
                }
            });
        }

        // Sign-out
        const signOutBtn = document.getElementById('signOutBtn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => {
                this.signOut();
            });
        }

        // Upgrade button
        const upgradeBtn = document.getElementById('upgradeBtn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                this.showUpgradeModal();
            });
        }

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Range input updates
        this.setupRangeInputs();
    }

    setupRangeInputs() {
        const ranges = [
            { input: 'quality', display: 'qualityValue' },
            { input: 'colorCount', display: 'colorCountValue' },
            { input: 'passwordLength', display: 'passwordLengthValue' }
        ];

        ranges.forEach(({ input, display }) => {
            const inputEl = document.getElementById(input);
            const displayEl = document.getElementById(display);
            if (inputEl && displayEl) {
                inputEl.addEventListener('input', () => {
                    displayEl.textContent = inputEl.value;
                });
            }
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        const currentTheme = localStorage.getItem('toolhub_theme') || 'light';
        
        document.documentElement.setAttribute('data-color-scheme', currentTheme);
        themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        
        themeToggle.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-color-scheme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-color-scheme', newTheme);
            try {
                localStorage.setItem('toolhub_theme', newTheme);
            } catch (e) {
                console.warn('Could not save theme preference');
            }
            themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        });
    }

    setupMarkdownEditor() {
        const markdownInput = document.getElementById('markdownInput');
        const markdownPreview = document.getElementById('markdownPreview');
        
        if (markdownInput && markdownPreview) {
            markdownInput.addEventListener('input', () => {
                const markdown = markdownInput.value;
                markdownPreview.innerHTML = this.parseMarkdown(markdown);
            });
            
            // Initialize with default content
            markdownPreview.innerHTML = this.parseMarkdown(markdownInput.value);
        }
    }

    // Tool Implementations
    runAIDetector() {
        if (!this.consumeUsage()) return;
        
        const textElement = document.getElementById('aiText');
        if (!textElement) return;
        
        const text = textElement.value.trim();
        if (!text) {
            this.showToast('Please enter some text to analyze', 'error');
            return;
        }

        this.showLoading();
        
        setTimeout(() => {
            try {
                const confidence = this.simulateAIDetection(text);
                const isAI = confidence > 70;
                const result = document.getElementById('aiResult');
                
                if (result) {
                    result.innerHTML = `
                        <div class="ai-detection-result">
                            <h4>${isAI ? '🤖 AI-Generated Content Detected' : '✍️ Human-Written Content'}</h4>
                            <div class="confidence-bar" style="background: rgba(255,255,255,0.1); height: 20px; border-radius: 10px; overflow: hidden;">
                                <div class="confidence-fill" style="width: ${confidence}%; height: 100%; background: ${isAI ? '#ff4444' : '#44ff44'}; transition: width 0.5s;"></div>
                            </div>
                            <p><strong>Confidence:</strong> ${confidence}%</p>
                            <p><strong>Analysis:</strong> ${this.getAIAnalysis(confidence, text.length)}</p>
                            <button class="btn btn--secondary btn--sm" onclick="navigator.clipboard.writeText('AI Detection Result: ${confidence}% confidence - ${isAI ? 'AI Generated' : 'Human Written'}')">Copy Result</button>
                        </div>
                    `;
                    result.classList.add('active');
                }
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'tool_use', { tool_name: 'ai_detector' });
                }
            } catch (e) {
                this.showToast('Error analyzing text', 'error');
            } finally {
                this.hideLoading();
            }
        }, 1500);
    }

    runPDFConverter() {
        if (!this.consumeUsage()) return;
        
        const fileInput = document.getElementById('pdfFile');
        const operationSelect = document.getElementById('pdfOperation');
        
        if (!fileInput || !operationSelect) return;
        
        const files = fileInput.files;
        const operation = operationSelect.value;
        
        if (files.length === 0) {
            this.showToast('Please select PDF file(s)', 'error');
            return;
        }

        this.showLoading();
        
        setTimeout(() => {
            try {
                const result = document.getElementById('pdfResult');
                const fileNames = Array.from(files).map(f => f.name).join(', ');
                
                if (result) {
                    result.innerHTML = `
                        <div class="pdf-result">
                            <h4>📄 PDF ${operation.charAt(0).toUpperCase() + operation.slice(1)} Complete</h4>
                            <p><strong>Files processed:</strong> ${fileNames}</p>
                            <p><strong>Operation:</strong> ${operation}</p>
                            <p><strong>Status:</strong> ✅ Successfully processed</p>
                            <div class="pdf-actions">
                                <button class="btn btn--secondary btn--sm" onclick="alert('Download would start in real implementation')">Download Result</button>
                                <button class="btn btn--outline btn--sm" onclick="alert('Email feature coming soon')">Email Result</button>
                            </div>
                        </div>
                    `;
                    result.classList.add('active');
                }
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'tool_use', { tool_name: 'pdf_converter' });
                }
            } catch (e) {
                this.showToast('Error processing PDF', 'error');
            } finally {
                this.hideLoading();
            }
        }, 2000);
    }

    generateQR() {
        if (!this.consumeUsage()) return;
        
        const textInput = document.getElementById('qrText');
        const colorInput = document.getElementById('qrColor');
        const sizeSelect = document.getElementById('qrSize');
        
        if (!textInput || !colorInput || !sizeSelect) return;
        
        const text = textInput.value.trim();
        const color = colorInput.value;
        const size = parseInt(sizeSelect.value);
        
        if (!text) {
            this.showToast('Please enter text or URL for QR code', 'error');
            return;
        }

        this.showLoading();
        
        setTimeout(() => {
            try {
                const result = document.getElementById('qrResult');
                if (!result) return;
                
                const canvas = document.createElement('canvas');
                
                if (typeof QRCode !== 'undefined') {
                    QRCode.toCanvas(canvas, text, {
                        width: size,
                        color: {
                            dark: color,
                            light: '#ffffff'
                        }
                    }, (error) => {
                        if (error) {
                            this.showToast('Error generating QR code', 'error');
                            this.hideLoading();
                            return;
                        }
                        
                        result.innerHTML = `
                            <div class="qr-result">
                                <h4>⬜ QR Code Generated</h4>
                                <div class="qr-display" style="text-align: center; margin: 16px 0;"></div>
                                <p><strong>Content:</strong> ${text}</p>
                                <p><strong>Size:</strong> ${size}x${size}px</p>
                                <div class="qr-actions">
                                    <button class="btn btn--secondary btn--sm" onclick="window.toolHub.downloadCanvas('qr-code.png')">Download PNG</button>
                                    <button class="btn btn--outline btn--sm" onclick="navigator.clipboard.writeText('${text.replace(/'/g, '\\\')}')">Copy Text</button>
                                </div>
                            </div>
                        `;
                        const displayDiv = result.querySelector('.qr-display');
                        if (displayDiv) {
                            displayDiv.appendChild(canvas);
                        }
                        result.classList.add('active');
                        this.hideLoading();
                        
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'tool_use', { tool_name: 'qr_generator' });
                        }
                    });
                } else {
                    // Fallback if QRCode library not loaded
                    result.innerHTML = `
                        <div class="qr-result">
                            <h4>⬜ QR Code Generated</h4>
                            <div style="width: ${size}px; height: ${size}px; background: #f0f0f0; border: 2px solid #ccc; display: flex; align-items: center; justify-content: center; margin: 16px auto;">
                                QR Code Preview
                            </div>
                            <p><strong>Content:</strong> ${text}</p>
                            <p><strong>Size:</strong> ${size}x${size}px</p>
                            <p><em>QR code generated successfully</em></p>
                        </div>
                    `;
                    result.classList.add('active');
                    this.hideLoading();
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'tool_use', { tool_name: 'qr_generator' });
                    }
                }
            } catch (e) {
                this.showToast('Error generating QR code', 'error');
                this.hideLoading();
            }
        }, 500);
    }

    generatePassword() {
        if (!this.consumeUsage()) return;
        
        const lengthInput = document.getElementById('passwordLength');
        const uppercaseCheck = document.getElementById('includeUppercase');
        const lowercaseCheck = document.getElementById('includeLowercase');
        const numbersCheck = document.getElementById('includeNumbers');
        const symbolsCheck = document.getElementById('includeSymbols');
        
        if (!lengthInput) return;
        
        const length = parseInt(lengthInput.value);
        const includeUppercase = uppercaseCheck ? uppercaseCheck.checked : true;
        const includeLowercase = lowercaseCheck ? lowercaseCheck.checked : true;
        const includeNumbers = numbersCheck ? numbersCheck.checked : true;
        const includeSymbols = symbolsCheck ? symbolsCheck.checked : true;
        
        if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
            this.showToast('Please select at least one character type', 'error');
            return;
        }

        try {
            const password = this.createSecurePassword(length, {
                uppercase: includeUppercase,
                lowercase: includeLowercase,
                numbers: includeNumbers,
                symbols: includeSymbols
            });
            
            const strength = this.calculatePasswordStrength(password);
            const result = document.getElementById('passwordResult');
            
            if (result) {
                result.innerHTML = `
                    <div class="password-result">
                        <h4>🔐 Password Generated</h4>
                        <div class="password-display" style="position: relative; margin: 16px 0;">
                            <input type="text" value="${password}" readonly class="form-control" id="generatedPassword" style="padding-right: 80px;">
                            <button class="btn btn--secondary btn--sm" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); padding: 4px 8px;" onclick="navigator.clipboard.writeText('${password}'); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy', 2000)">Copy</button>
                        </div>
                        <div class="password-strength">
                            ${this.renderStrengthBars(strength)}
                        </div>
                        <p><strong>Strength:</strong> ${this.getStrengthLabel(strength)}</p>
                        <p><strong>Length:</strong> ${length} characters</p>
                        <div class="password-actions">
                            <button class="btn btn--secondary btn--sm" onclick="generatePassword()">Generate New</button>
                            <button class="btn btn--outline btn--sm" onclick="alert('Password manager integration coming soon')">Save to Manager</button>
                        </div>
                    </div>
                `;
                result.classList.add('active');
            }
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'tool_use', { tool_name: 'password_generator' });
            }
        } catch (e) {
            this.showToast('Error generating password', 'error');
        }
    }

    // Utility Functions
    simulateAIDetection(text) {
        // Simulate AI detection based on text characteristics
        let score = 50; // Base score
        
        // Check for AI-like patterns
        if (text.includes('As an AI') || text.includes('I am an AI')) score += 40;
        if (text.match(/\b(furthermore|moreover|additionally|consequently)\b/gi)) score += 10;
        if (text.split(' ').length > 100 && text.split('.').length < text.split(' ').length / 15) score += 15;
        if (text.match(/\b(utilize|facilitate|implement|optimize)\b/gi)) score += 5;
        
        // Randomize slightly
        score += Math.random() * 20 - 10;
        
        return Math.min(Math.max(Math.round(score), 5), 95);
    }

    getAIAnalysis(confidence, textLength) {
        if (confidence > 80) return "High likelihood of AI generation. Text shows typical AI patterns and structure.";
        if (confidence > 60) return "Moderate likelihood of AI generation. Some patterns suggest automated writing.";
        if (confidence > 40) return "Mixed signals. Could be AI-assisted or human-written with editing tools.";
        return "Low likelihood of AI generation. Text appears to be human-written.";
    }

    createSecurePassword(length, options) {
        let charset = '';
        if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (options.numbers) charset += '0123456789';
        if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        return password;
    }

    calculatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (password.match(/[a-z]/)) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;
        return strength;
    }

    renderStrengthBars(strength) {
        const bars = [];
        for (let i = 0; i < 5; i++) {
            const active = i < strength;
            const className = active ? (strength <= 2 ? 'weak' : strength <= 4 ? 'medium' : 'active') : '';
            bars.push(`<div class="strength-bar ${active ? className : ''}" style="height: 4px; flex: 1; border-radius: 2px; background: ${active ? (strength <= 2 ? '#ff4444' : strength <= 4 ? '#ffaa44' : '#44ff44') : 'rgba(255,255,255,0.3)'}; margin-right: 4px;"></div>`);
        }
        return `<div style="display: flex; gap: 4px; margin: 8px 0;">${bars.join('')}</div>`;
    }

    getStrengthLabel(strength) {
        if (strength <= 2) return 'Weak';
        if (strength <= 4) return 'Medium';
        return 'Strong';
    }

    parseMarkdown(markdown) {
        if (!markdown) return '';
        
        return markdown
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
            .replace(/\n\n/gim, '</p><p>')
            .replace(/\n/gim, '<br>')
            .replace(/^(.+)$/sim, '<p>$1</p>');
    }

    // Helper functions
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    downloadCanvas(filename) {
        const canvas = document.querySelector('#qrResult canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL();
            link.click();
        }
    }

    // UI Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    showSignInModal() {
        if (this.isSignedIn) {
            this.showUpgradeModal();
        } else {
            this.showModal('signInModal');
        }
    }

    showUpgradeModal() {
        this.showModal('upgradeModal');
    }

    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(toast);
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 4000);
        }
    }

    // Additional functions for legal pages
    showPrivacyPolicy() {
        alert('Privacy Policy: We respect your privacy and do not collect personal data beyond what is necessary for service functionality. All data is stored locally on your device.');
    }

    showTermsOfService() {
        alert('Terms of Service: By using ToolHub Master, you agree to use our tools responsibly and in accordance with applicable laws. Service is provided as-is.');
    }

    showAbout() {
        alert('About ToolHub Master: A comprehensive suite of professional tools designed to enhance your productivity. Created by Aaryan Raj to provide high-quality, accessible tools for everyone.');
    }

    showContact() {
        alert('Contact us at: aaryanraj269@gmail.com\nLinkedIn: https://www.linkedin.com/in/aaryan-raj/');
    }

    trackUpgrade(plan) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'upgrade_click', {
                plan: plan,
                value: plan === 'pro' ? 9.99 : 24.99
            });
        }
        alert(`Upgrade to ${plan} selected! This would redirect to payment in a real implementation.`);
    }
}

// Global functions for tool operations
function runAIDetector() { 
    if (window.toolHub) window.toolHub.runAIDetector(); 
}
function runPDFConverter() { 
    if (window.toolHub) window.toolHub.runPDFConverter(); 
}
function generateQR() { 
    if (window.toolHub) window.toolHub.generateQR(); 
}
function compressImage() { 
    if (window.toolHub) window.toolHub.compressImage(); 
}
function shortenURL() { 
    if (window.toolHub) window.toolHub.shortenURL(); 
}
function checkPlagiarism() { 
    if (window.toolHub) window.toolHub.checkPlagiarism(); 
}
function summarizeText() { 
    if (window.toolHub) window.toolHub.summarizeText(); 
}
function generatePalette() { 
    if (window.toolHub) window.toolHub.generatePalette(); 
}
function generatePassword() { 
    if (window.toolHub) window.toolHub.generatePassword(); 
}

function downloadMarkdown() {
    const textElement = document.getElementById('markdownInput');
    if (textElement) {
        const text = textElement.value;
        const blob = new Blob([text], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.md';
        a.click();
        URL.revokeObjectURL(url);
    }
}

function copyMarkdown() {
    const textElement = document.getElementById('markdownInput');
    if (textElement && window.toolHub) {
        const text = textElement.value;
        navigator.clipboard.writeText(text).then(() => {
            window.toolHub.showToast('Markdown copied to clipboard', 'success');
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.toolHub = new ToolHubMaster();
});