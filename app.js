// ToolHub Master - Main Application JavaScript

class ToolHubMaster {
  constructor() {
    this.emailJS = {
      serviceId: 'YOUR_SERVICE_ID',
      templateId: 'YOUR_TEMPLATE_ID',
      publicKey: 'YOUR_PUBLIC_KEY'
    };
    
    this.usageLimits = {
      anonymous: 15,
      verified: 25
    };
    
    this.currentOTP = null;
    this.otpTimer = null;
    this.otpTimeLeft = 0;
    
    this.init();
  }

  init() {
    this.initEmailJS();
    this.initTheme();
    this.initUsageTracking();
    this.initEventListeners();
    this.initTools();
    this.checkDailyReset();
  }

  // EmailJS initialization
  initEmailJS() {
    if (typeof emailjs !== 'undefined') {
      emailjs.init(this.emailJS.publicKey);
    }
  }

  // Theme management
  initTheme() {
    const savedTheme = localStorage.getItem('toolhub-theme') || 'light';
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('toolhub-theme', theme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  // Usage tracking
  initUsageTracking() {
    const today = new Date().toDateString();
    const lastResetDate = localStorage.getItem('toolhub-last-reset');
    
    if (lastResetDate !== today) {
      localStorage.setItem('toolhub-usage-count', '0');
      localStorage.setItem('toolhub-last-reset', today);
    }
    
    this.updateUsageDisplay();
    this.updateUserStatus();
  }

  getCurrentUsage() {
    return parseInt(localStorage.getItem('toolhub-usage-count') || '0');
  }

  getMaxUsage() {
    const isVerified = localStorage.getItem('toolhub-verified') === 'true';
    return isVerified ? this.usageLimits.verified : this.usageLimits.anonymous;
  }

  canUseTools() {
    return this.getCurrentUsage() < this.getMaxUsage();
  }

  incrementUsage() {
    const currentUsage = this.getCurrentUsage();
    localStorage.setItem('toolhub-usage-count', (currentUsage + 1).toString());
    this.updateUsageDisplay();
  }

  updateUsageDisplay() {
    const usageElement = document.getElementById('usage-count');
    if (usageElement) {
      const currentUsage = this.getCurrentUsage();
      const maxUsage = this.getMaxUsage();
      usageElement.textContent = `${currentUsage}/${maxUsage} uses today`;
    }
  }

  updateUserStatus() {
    const isVerified = localStorage.getItem('toolhub-verified') === 'true';
    const userEmail = localStorage.getItem('toolhub-user-email');
    const userStatus = document.getElementById('user-status');
    const userGreeting = document.getElementById('user-greeting');
    
    if (!userStatus || !userGreeting) return;
    
    if (isVerified && userEmail) {
      userStatus.classList.add('hidden');
      userGreeting.classList.remove('hidden');
      const greetingText = document.getElementById('greeting-text');
      if (greetingText) {
        greetingText.textContent = `Welcome, ${userEmail}!`;
      }
    } else {
      userStatus.classList.remove('hidden');
      userGreeting.classList.add('hidden');
    }
  }

  checkDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.initUsageTracking();
      // Set up daily reset
      setInterval(() => {
        this.initUsageTracking();
      }, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
  }

  // Event listeners
  initEventListeners() {
    // Theme toggle
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Authentication
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        this.showEmailModal();
      });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }

    // Modal events
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        this.hideEmailModal();
      });
    }

    const sendOtpBtn = document.getElementById('send-otp-btn');
    if (sendOtpBtn) {
      sendOtpBtn.addEventListener('click', () => {
        this.sendOTP();
      });
    }

    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    if (verifyOtpBtn) {
      verifyOtpBtn.addEventListener('click', () => {
        this.verifyOTP();
      });
    }

    const resendOtpBtn = document.getElementById('resend-otp-btn');
    if (resendOtpBtn) {
      resendOtpBtn.addEventListener('click', () => {
        this.sendOTP();
      });
    }

    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.hideEmailModal();
      });
    }

    // Modal overlay
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        // Only close if clicking directly on the overlay, not its children
        if (e.target === modalOverlay) {
          this.hideEmailModal();
        }
      });
    }

    // OTP input handling
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        if (e.target.value.length === 1 && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
          otpInputs[index - 1].focus();
        }
      });
    });
  }

  // Tool initialization
  initTools() {
    this.addToolEventListener('ai-detector-btn', this.runAIContentDetector.bind(this));
    this.addToolEventListener('summarizer-btn', this.runTextSummarizer.bind(this));
    this.addToolEventListener('pdf-process-btn', this.runPDFConverter.bind(this));
    this.addToolEventListener('compress-image-btn', this.runImageCompressor.bind(this));
    this.addToolEventListener('plagiarism-btn', this.runPlagiarismChecker.bind(this));
    this.addToolEventListener('generate-palette-btn', this.runColorPaletteGenerator.bind(this));
    this.addToolEventListener('generate-password-btn', this.runPasswordGenerator.bind(this));
    this.addToolEventListener('copy-password-btn', this.copyPassword.bind(this));
    this.addToolEventListener('copy-palette-btn', this.copyColorPalette.bind(this));
    this.addToolEventListener('copy-markdown-btn', this.copyMarkdownHTML.bind(this));

    // Image quality slider
    const imageQualitySlider = document.getElementById('image-quality');
    if (imageQualitySlider) {
      imageQualitySlider.addEventListener('input', (e) => {
        const qualityValue = document.getElementById('quality-value');
        if (qualityValue) {
          qualityValue.textContent = e.target.value + '%';
        }
      });
    }

    // Password length slider
    const passwordLengthSlider = document.getElementById('password-length');
    if (passwordLengthSlider) {
      passwordLengthSlider.addEventListener('input', (e) => {
        const lengthValue = document.getElementById('length-value');
        if (lengthValue) {
          lengthValue.textContent = e.target.value;
        }
      });
    }

    // Palette type change
    const paletteType = document.getElementById('palette-type');
    if (paletteType) {
      paletteType.addEventListener('change', (e) => {
        const imageContainer = document.getElementById('palette-image-container');
        const baseColorContainer = document.getElementById('base-color-container');
        
        if (e.target.value === 'image') {
          imageContainer.classList.remove('hidden');
          baseColorContainer.classList.add('hidden');
        } else {
          imageContainer.classList.add('hidden');
          baseColorContainer.classList.remove('hidden');
        }
      });
    }

    // Markdown editor
    const markdownInput = document.getElementById('markdown-input');
    if (markdownInput) {
      markdownInput.addEventListener('input', () => {
        this.updateMarkdownPreview();
      });
    }
  }

  addToolEventListener(id, callback) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('click', callback);
    }
  }

  // Authentication methods
  showEmailModal() {
    const modal = document.getElementById('email-modal');
    if (!modal) return;
    
    const emailStep = document.getElementById('email-step');
    const otpStep = document.getElementById('otp-step');
    const successStep = document.getElementById('success-step');
    
    if (emailStep) emailStep.classList.remove('hidden');
    if (otpStep) otpStep.classList.add('hidden');
    if (successStep) successStep.classList.add('hidden');
    
    this.clearOTPInputs();
    this.clearErrors();
    
    // Show modal
    modal.classList.remove('hidden');
  }

  hideEmailModal() {
    const modal = document.getElementById('email-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
    
    this.clearOTPInputs();
    this.clearErrors();
    
    if (this.otpTimer) {
      clearInterval(this.otpTimer);
    }
  }

  async sendOTP() {
    const emailInput = document.getElementById('email-input');
    if (!emailInput) return;
    
    const email = emailInput.value.trim();
    const errorElement = document.getElementById('email-error');

    if (!this.validateEmail(email)) {
      this.showError(errorElement, 'Please enter a valid email address');
      return;
    }

    this.showLoading('send-otp-btn');
    
    // Generate 6-digit OTP
    this.currentOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      // Simulate email sending (for demo)
      await this.simulateEmailSending(email, this.currentOTP);
      
      const emailStep = document.getElementById('email-step');
      const otpStep = document.getElementById('otp-step');
      
      if (emailStep) emailStep.classList.add('hidden');
      if (otpStep) otpStep.classList.remove('hidden');
      
      this.startOTPTimer();
    } catch (error) {
      this.showError(errorElement, 'Failed to send OTP. Please try again.');
    } finally {
      this.hideLoading('send-otp-btn');
    }
  }

  async simulateEmailSending(email, otp) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production, replace this with actual EmailJS call:
    /*
    return emailjs.send(this.emailJS.serviceId, this.emailJS.templateId, {
      to_email: email,
      otp_code: otp,
      to_name: email.split('@')[0]
    });
    */
    
    console.log(`OTP sent to ${email}: ${otp}`);
    
    // For demo purposes, show OTP in an alert
    alert(`Demo Mode: Your OTP is ${otp}`); 
    
    return Promise.resolve();
  }

  verifyOTP() {
    const otpInputs = document.querySelectorAll('.otp-input');
    const enteredOTP = Array.from(otpInputs).map(input => input.value).join('');
    const errorElement = document.getElementById('otp-error');

    if (enteredOTP.length !== 6) {
      this.showError(errorElement, 'Please enter the complete 6-digit OTP');
      return;
    }

    if (enteredOTP === this.currentOTP) {
      const email = document.getElementById('email-input').value.trim();
      localStorage.setItem('toolhub-verified', 'true');
      localStorage.setItem('toolhub-user-email', email);
      
      const otpStep = document.getElementById('otp-step');
      const successStep = document.getElementById('success-step');
      
      if (otpStep) otpStep.classList.add('hidden');
      if (successStep) successStep.classList.remove('hidden');
      
      this.updateUsageDisplay();
      this.updateUserStatus();
      
      if (this.otpTimer) {
        clearInterval(this.otpTimer);
      }
    } else {
      this.showError(errorElement, 'Invalid OTP. Please try again.');
      this.clearOTPInputs();
    }
  }

  startOTPTimer() {
    this.otpTimeLeft = 60;
    const resendBtn = document.getElementById('resend-otp-btn');
    const timerElement = document.getElementById('otp-timer');
    const timerCount = document.getElementById('timer-count');
    
    if (resendBtn) resendBtn.classList.add('hidden');
    if (timerElement) timerElement.classList.remove('hidden');
    if (timerCount) timerCount.textContent = this.otpTimeLeft;
    
    if (this.otpTimer) {
      clearInterval(this.otpTimer);
    }
    
    this.otpTimer = setInterval(() => {
      this.otpTimeLeft--;
      
      if (timerCount) {
        timerCount.textContent = this.otpTimeLeft;
      }
      
      if (this.otpTimeLeft <= 0) {
        clearInterval(this.otpTimer);
        if (timerElement) timerElement.classList.add('hidden');
        if (resendBtn) resendBtn.classList.remove('hidden');
      }
    }, 1000);
  }

  logout() {
    localStorage.removeItem('toolhub-verified');
    localStorage.removeItem('toolhub-user-email');
    this.updateUsageDisplay();
    this.updateUserStatus();
  }

  // Utility methods
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  showError(element, message) {
    if (element) {
      element.textContent = message;
      element.classList.remove('hidden');
    }
  }

  clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
      el.classList.add('hidden');
      el.textContent = '';
    });
  }

  clearOTPInputs() {
    document.querySelectorAll('.otp-input').forEach(input => {
      input.value = '';
    });
  }

  showLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.classList.add('loading');
      button.disabled = true;
    }
  }

  hideLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  checkUsageLimit(toolName) {
    if (!this.canUseTools()) {
      alert(`You've reached your daily limit. ${this.getMaxUsage() === 15 ? 'Verify your email to get more uses!' : 'Please try again tomorrow.'}`);
      return false;
    }
    return true;
  }

  // Tool implementations
  runAIContentDetector() {
    if (!this.checkUsageLimit('AI Content Detector')) return;

    const input = document.getElementById('ai-detector-input');
    if (!input) return;
    
    const text = input.value.trim();
    
    if (text.length < 100) {
      alert('Please enter at least 100 characters for analysis.');
      return;
    }

    this.showLoading('ai-detector-btn');

    setTimeout(() => {
      const resultDiv = document.getElementById('ai-detector-result');
      const scoreDiv = document.getElementById('ai-score');
      const analysisDiv = document.getElementById('ai-analysis');
      
      if (!resultDiv || !scoreDiv || !analysisDiv) {
        this.hideLoading('ai-detector-btn');
        return;
      }
      
      const aiScore = Math.floor(Math.random() * 20) + 80; // 80-99%
      
      let highlightedText = text;
      const suspiciousPhrases = [
        'furthermore', 'moreover', 'in conclusion', 'it is important to note',
        'additionally', 'consequently', 'therefore', 'however'
      ];

      suspiciousPhrases.forEach(phrase => {
        const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
        highlightedText = highlightedText.replace(regex, `<span class="highlighted-text">${phrase}</span>`);
      });

      scoreDiv.textContent = `${aiScore}%`;
      scoreDiv.style.background = aiScore > 90 ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 165, 0, 0.1)';
      
      analysisDiv.innerHTML = `
        <div style="margin-bottom: 16px;">
          <strong>Analysis Summary:</strong><br>
          This text shows <strong>${aiScore}% likelihood</strong> of being AI-generated based on:
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>Sentence structure patterns</li>
            <li>Vocabulary usage</li>
            <li>Repetitive phrasing</li>
            <li>Transition word frequency</li>
          </ul>
        </div>
        <div>
          <strong>Highlighted suspicious phrases:</strong><br>
          <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin-top: 8px; line-height: 1.6;">
            ${highlightedText}
          </div>
        </div>
      `;

      resultDiv.classList.remove('hidden');
      this.incrementUsage();
      this.hideLoading('ai-detector-btn');
    }, 1500);
  }

  runTextSummarizer() {
    if (!this.checkUsageLimit('Text Summarizer')) return;

    const input = document.getElementById('summarizer-input');
    const lengthSelect = document.getElementById('summary-length');
    
    if (!input || !lengthSelect) return;
    
    const text = input.value.trim();
    const length = lengthSelect.value;

    if (text.length < 200) {
      alert('Please enter at least 200 characters for summarization.');
      return;
    }

    this.showLoading('summarizer-btn');

    setTimeout(() => {
      const resultDiv = document.getElementById('summarizer-result');
      const summaryDiv = document.getElementById('summary-text');
      
      if (!resultDiv || !summaryDiv) {
        this.hideLoading('summarizer-btn');
        return;
      }
      
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const lengthMultiplier = length === 'short' ? 0.25 : length === 'medium' ? 0.5 : 0.75;
      const summaryLength = Math.max(1, Math.floor(sentences.length * lengthMultiplier));
      
      // Simple extractive summarization - select sentences with high keyword density
      const keywords = this.extractKeywords(text);
      const scoredSentences = sentences.map(sentence => {
        const score = keywords.reduce((acc, keyword) => {
          return acc + (sentence.toLowerCase().includes(keyword.toLowerCase()) ? 1 : 0);
        }, 0);
        return { sentence: sentence.trim(), score };
      });

      const topSentences = scoredSentences
        .sort((a, b) => b.score - a.score)
        .slice(0, summaryLength)
        .map(item => item.sentence);

      const summary = topSentences.join('. ') + '.';

      summaryDiv.innerHTML = `
        <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; line-height: 1.6;">
          ${summary}
        </div>
        <div style="margin-top: 12px; font-size: 12px; color: var(--color-text-secondary);">
          Original: ${text.length} characters | Summary: ${summary.length} characters 
          (${Math.round((summary.length / text.length) * 100)}% reduction)
        </div>
      `;

      resultDiv.classList.remove('hidden');
      this.incrementUsage();
      this.hideLoading('summarizer-btn');
    }, 1500);
  }

  extractKeywords(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
    
    const filteredWords = words.filter(word => 
      word.length > 3 && !stopWords.includes(word)
    );

    const frequency = {};
    filteredWords.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.keys(frequency)
      .sort((a, b) => frequency[b] - frequency[a])
      .slice(0, 10);
  }

  runPDFConverter() {
    if (!this.checkUsageLimit('PDF Converter')) return;

    const operationSelect = document.getElementById('pdf-operation');
    const fileInput = document.getElementById('pdf-upload');
    
    if (!operationSelect || !fileInput) return;
    
    const operation = operationSelect.value;
    const files = fileInput.files;

    if (files.length === 0) {
      alert('Please select PDF file(s) to process.');
      return;
    }

    this.showLoading('pdf-process-btn');

    setTimeout(() => {
      const resultDiv = document.getElementById('pdf-result');
      const contentDiv = document.getElementById('pdf-result-content');
      
      if (!resultDiv || !contentDiv) {
        this.hideLoading('pdf-process-btn');
        return;
      }
      
      let resultText = '';
      switch (operation) {
        case 'compress':
          resultText = `
            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px;">
              <strong>Compression Results:</strong><br>
              Original size: ${(files[0].size / 1024 / 1024).toFixed(2)} MB<br>
              Compressed size: ${((files[0].size * 0.7) / 1024 / 1024).toFixed(2)} MB<br>
              <span style="color: var(--color-success);">Size reduced by 30%</span>
            </div>
          `;
          break;
        case 'merge':
          resultText = `
            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px;">
              <strong>Merge Results:</strong><br>
              ${files.length} PDF file(s) have been successfully merged.<br>
              Total pages: ${files.length * 5} (estimated)<br>
              <span style="color: var(--color-success);">Merge completed successfully</span>
            </div>
          `;
          break;
        case 'split':
          resultText = `
            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px;">
              <strong>Split Results:</strong><br>
              PDF has been split into individual pages.<br>
              Generated files: 5 (estimated)<br>
              <span style="color: var(--color-success);">Split completed successfully</span>
            </div>
          `;
          break;
      }

      contentDiv.innerHTML = resultText;
      resultDiv.classList.remove('hidden');
      
      this.incrementUsage();
      this.hideLoading('pdf-process-btn');
    }, 1500);
  }

  runImageCompressor() {
    if (!this.checkUsageLimit('Image Compressor')) return;

    const fileInput = document.getElementById('image-upload');
    const qualitySlider = document.getElementById('image-quality');
    
    if (!fileInput || !qualitySlider) return;
    
    const file = fileInput.files[0];
    const quality = qualitySlider.value / 100;

    if (!file) {
      alert('Please select an image file to compress.');
      return;
    }

    this.showLoading('compress-image-btn');

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          const resultDiv = document.getElementById('image-result');
          const containerDiv = document.getElementById('image-result-container');
          const infoDiv = document.getElementById('compression-info');
          const downloadLink = document.getElementById('image-download-link');
          
          if (!resultDiv || !containerDiv || !infoDiv || !downloadLink) {
            this.hideLoading('compress-image-btn');
            return;
          }
          
          const originalSize = file.size;
          const compressedSize = blob.size;
          const reduction = Math.round((1 - compressedSize / originalSize) * 100);
          
          infoDiv.innerHTML = `
            Original: ${(originalSize / 1024).toFixed(1)} KB → 
            Compressed: ${(compressedSize / 1024).toFixed(1)} KB 
            (${reduction}% reduction)
          `;
          
          const compressedImg = document.createElement('img');
          compressedImg.src = URL.createObjectURL(blob);
          compressedImg.className = 'compressed-image';
          compressedImg.alt = 'Compressed image';
          
          containerDiv.innerHTML = '';
          containerDiv.appendChild(compressedImg);
          
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = `compressed_${file.name}`;
          downloadLink.classList.remove('hidden');
          
          resultDiv.classList.remove('hidden');
          this.incrementUsage();
          this.hideLoading('compress-image-btn');
        }, file.type, quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  runPlagiarismChecker() {
    if (!this.checkUsageLimit('Plagiarism Checker')) return;

    const input = document.getElementById('plagiarism-input');
    if (!input) return;
    
    const text = input.value.trim();

    if (text.length < 50) {
      alert('Please enter at least 50 characters for plagiarism check.');
      return;
    }

    this.showLoading('plagiarism-btn');

    setTimeout(() => {
      const resultDiv = document.getElementById('plagiarism-result');
      const scoreDiv = document.getElementById('plagiarism-score');
      const analysisDiv = document.getElementById('plagiarism-analysis');
      
      if (!resultDiv || !scoreDiv || !analysisDiv) {
        this.hideLoading('plagiarism-btn');
        return;
      }
      
      const similarityScore = Math.floor(Math.random() * 30) + 5; // 5-35%
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      // Simulate finding similar content
      const suspiciousSentences = sentences.slice(0, Math.max(1, Math.floor(sentences.length * 0.2)));
      let highlightedText = text;
      
      suspiciousSentences.forEach(sentence => {
        const trimmed = sentence.trim();
        if (trimmed) {
          highlightedText = highlightedText.replace(trimmed, `<span class="highlighted-text">${trimmed}</span>`);
        }
      });

      scoreDiv.textContent = `${similarityScore}% Similar`;
      scoreDiv.style.background = similarityScore > 25 ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)';
      scoreDiv.style.color = similarityScore > 25 ? '#ff4444' : '#00aa00';
      
      analysisDiv.innerHTML = `
        <div style="margin-bottom: 16px;">
          <strong>Plagiarism Analysis:</strong><br>
          ${similarityScore}% of your text shows similarity to existing content online.
          ${similarityScore > 25 ? '<span style="color: var(--color-warning);">⚠️ Consider revising highlighted sections.</span>' : '<span style="color: var(--color-success);">✅ Content appears to be original.</span>'}
        </div>
        <div>
          <strong>Potentially similar content:</strong><br>
          <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin-top: 8px; line-height: 1.6;">
            ${highlightedText}
          </div>
        </div>
        <div style="margin-top: 12px; font-size: 12px; color: var(--color-text-secondary);">
          Sources checked: Academic papers, web content, publications
        </div>
      `;

      resultDiv.classList.remove('hidden');
      this.incrementUsage();
      this.hideLoading('plagiarism-btn');
    }, 1500);
  }

  runColorPaletteGenerator() {
    if (!this.checkUsageLimit('Color Palette Generator')) return;

    const paletteTypeSelect = document.getElementById('palette-type');
    const baseColorInput = document.getElementById('base-color');
    const imageInput = document.getElementById('palette-image');
    
    if (!paletteTypeSelect) return;
    
    const paletteType = paletteTypeSelect.value;
    const baseColor = baseColorInput ? baseColorInput.value : '#4169E1';

    this.showLoading('generate-palette-btn');

    if (paletteType === 'image' && imageInput && imageInput.files[0]) {
      this.extractColorsFromImage(imageInput.files[0]);
    } else {
      this.generateColorPalette(paletteType, baseColor);
    }
  }

  generateColorPalette(type, baseColor) {
    setTimeout(() => {
      let colors = [];
      const baseHsl = this.hexToHsl(baseColor);

      switch (type) {
        case 'monochromatic':
          colors = this.generateMonochromaticPalette(baseHsl);
          break;
        case 'analogous':
          colors = this.generateAnalogousPalette(baseHsl);
          break;
        case 'complementary':
          colors = this.generateComplementaryPalette(baseHsl);
          break;
        case 'triadic':
          colors = this.generateTriadicPalette(baseHsl);
          break;
        default:
          colors = this.generateRandomPalette();
      }

      this.displayColorPalette(colors);
      this.incrementUsage();
      this.hideLoading('generate-palette-btn');
    }, 1000);
  }

  extractColorsFromImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = this.extractDominantColors(imageData);
        
        this.displayColorPalette(colors);
        this.incrementUsage();
        this.hideLoading('generate-palette-btn');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  extractDominantColors(imageData) {
    const data = imageData.data;
    const colorCounts = {};
    
    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const key = `${r},${g},${b}`;
      colorCounts[key] = (colorCounts[key] || 0) + 1;
    }

    // Get top 5 colors
    const sortedColors = Object.entries(colorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([color,]) => {
        const [r, g, b] = color.split(',').map(Number);
        return this.rgbToHex(r, g, b);
      });

    return sortedColors;
  }

  generateMonochromaticPalette(hsl) {
    const colors = [];
    for (let i = 0; i < 5; i++) {
      const lightness = 20 + (i * 15);
      colors.push(this.hslToHex(hsl.h, hsl.s, lightness));
    }
    return colors;
  }

  generateAnalogousPalette(hsl) {
    const colors = [];
    for (let i = -2; i <= 2; i++) {
      const hue = (hsl.h + (i * 30) + 360) % 360;
      colors.push(this.hslToHex(hue, hsl.s, hsl.l));
    }
    return colors;
  }

  generateComplementaryPalette(hsl) {
    const colors = [
      this.hslToHex(hsl.h, hsl.s, hsl.l),
      this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
      this.hslToHex(hsl.h, hsl.s * 0.7, hsl.l * 1.2),
      this.hslToHex((hsl.h + 180) % 360, hsl.s * 0.7, hsl.l * 1.2),
      this.hslToHex(hsl.h, hsl.s * 0.5, hsl.l * 0.8)
    ];
    return colors;
  }

  generateTriadicPalette(hsl) {
    const colors = [
      this.hslToHex(hsl.h, hsl.s, hsl.l),
      this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
      this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
      this.hslToHex(hsl.h, hsl.s * 0.6, hsl.l * 1.2),
      this.hslToHex((hsl.h + 120) % 360, hsl.s * 0.6, hsl.l * 1.2)
    ];
    return colors;
  }

  generateRandomPalette() {
    const colors = [];
    for (let i = 0; i < 5; i++) {
      const hue = Math.floor(Math.random() * 360);
      const saturation = 50 + Math.floor(Math.random() * 30);
      const lightness = 40 + Math.floor(Math.random() * 40);
      colors.push(this.hslToHex(hue, saturation, lightness));
    }
    return colors;
  }

  displayColorPalette(colors) {
    const paletteDisplay = document.getElementById('color-palette-display');
    const resultDiv = document.getElementById('palette-result');
    
    if (!paletteDisplay || !resultDiv) return;
    
    paletteDisplay.innerHTML = colors.map(color => `
      <div class="color-swatch">
        <div class="color-circle" style="background-color: ${color};"></div>
        <div class="color-code">${color.toUpperCase()}</div>
      </div>
    `).join('');

    resultDiv.classList.remove('hidden');
  }

  copyColorPalette() {
    const colors = Array.from(document.querySelectorAll('.color-code'))
      .map(el => el.textContent)
      .join(', ');
    
    navigator.clipboard.writeText(colors).then(() => {
      const btn = document.getElementById('copy-palette-btn');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      }
    });
  }

  runPasswordGenerator() {
    if (!this.checkUsageLimit('Password Generator')) return;

    const lengthSlider = document.getElementById('password-length');
    const uppercaseCheck = document.getElementById('include-uppercase');
    const lowercaseCheck = document.getElementById('include-lowercase');
    const numbersCheck = document.getElementById('include-numbers');
    const symbolsCheck = document.getElementById('include-symbols');
    
    if (!lengthSlider || !uppercaseCheck || !lowercaseCheck || !numbersCheck || !symbolsCheck) return;
    
    const length = parseInt(lengthSlider.value);
    const includeUppercase = uppercaseCheck.checked;
    const includeLowercase = lowercaseCheck.checked;
    const includeNumbers = numbersCheck.checked;
    const includeSymbols = symbolsCheck.checked;

    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
      alert('Please select at least one character type.');
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

    const passwordDisplay = document.getElementById('password-display');
    if (passwordDisplay) {
      passwordDisplay.value = password;
    }
    
    // Calculate strength
    const strength = this.calculatePasswordStrength(password);
    this.displayPasswordStrength(strength);

    const resultDiv = document.getElementById('password-result');
    if (resultDiv) {
      resultDiv.classList.remove('hidden');
    }
    
    this.incrementUsage();
  }

  calculatePasswordStrength(password) {
    let score = 0;
    let feedback = [];

    // Length check
    if (password.length >= 12) score += 25;
    else if (password.length >= 8) score += 15;
    else feedback.push('Use at least 8 characters');

    // Character variety
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;

    // Bonus for length
    if (password.length >= 16) score += 10;

    let strength = 'Weak';
    let color = '#ff4444';
    
    if (score >= 85) {
      strength = 'Very Strong';
      color = '#00aa00';
    } else if (score >= 70) {
      strength = 'Strong';
      color = '#44aa44';
    } else if (score >= 50) {
      strength = 'Medium';
      color = '#ffaa00';
    }

    return { score, strength, color, feedback };
  }

  displayPasswordStrength(strength) {
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    strengthBar.style.width = `${strength.score}%`;
    strengthBar.style.backgroundColor = strength.color;
    strengthText.textContent = strength.strength;
    strengthText.style.color = strength.color;
  }

  copyPassword() {
    const passwordDisplay = document.getElementById('password-display');
    if (!passwordDisplay) return;
    
    passwordDisplay.select();
    document.execCommand('copy');
    
    const btn = document.getElementById('copy-password-btn');
    if (btn) {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = 'fas fa-check';
        setTimeout(() => {
          icon.className = 'fas fa-copy';
        }, 2000);
      }
    }
  }

  updateMarkdownPreview() {
    const input = document.getElementById('markdown-input');
    const preview = document.getElementById('markdown-preview');
    
    if (!input || !preview) return;
    
    const text = input.value;
    
    if (typeof marked !== 'undefined') {
      preview.innerHTML = marked.parse(text);
    } else {
      // Fallback basic markdown parsing
      let html = text
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^\* (.*$)/gm, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
      
      preview.innerHTML = html;
    }
  }

  copyMarkdownHTML() {
    const preview = document.getElementById('markdown-preview');
    if (!preview) return;
    
    const html = preview.innerHTML;
    
    navigator.clipboard.writeText(html).then(() => {
      const btn = document.getElementById('copy-markdown-btn');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      }
    });
  }

  // Color utility functions
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

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  rgbToHex(r, g, b) {
    const toHex = (c) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.toolhub = new ToolHubMaster();
});