// ToolHub Master JavaScript

// Application data
const appData = {
  tools: [
    {
      id: "ai-detector",
      name: "AI Content Detector",
      description: "Detect AI-generated text with 99% accuracy",
      icon: "🤖",
      freeLimit: 3,
      category: "AI Tools"
    },
    {
      id: "pdf-converter",
      name: "PDF Converter Suite", 
      description: "Convert, compress, merge, and split PDFs",
      icon: "📄",
      freeLimit: 5,
      category: "File Tools"
    },
    {
      id: "qr-generator",
      name: "QR Code Generator Pro",
      description: "Create custom QR codes with analytics",
      icon: "⬜",
      freeLimit: 10,
      category: "Utility Tools"
    },
    {
      id: "image-compressor",
      name: "Smart Image Compressor",
      description: "Optimize images without quality loss",
      icon: "🖼️",
      freeLimit: 5,
      category: "File Tools"
    },
    {
      id: "url-shortener",
      name: "URL Shortener Plus",
      description: "Shorten URLs with detailed analytics",
      icon: "🔗",
      freeLimit: 10,
      category: "Utility Tools"
    },
    {
      id: "plagiarism-checker",
      name: "Plagiarism Checker",
      description: "Detect duplicate content instantly",
      icon: "🔍",
      freeLimit: 2,
      category: "Writing Tools"
    },
    {
      id: "text-summarizer",
      name: "Text Summarizer",
      description: "AI-powered content summarization",
      icon: "📝",
      freeLimit: 3,
      category: "AI Tools"
    },
    {
      id: "color-palette",
      name: "Color Palette Generator",
      description: "Extract beautiful color schemes",
      icon: "🎨",
      freeLimit: 10,
      category: "Design Tools"
    },
    {
      id: "password-generator",
      name: "Password Generator",
      description: "Create secure passwords instantly",
      icon: "🔐",
      freeLimit: 20,
      category: "Security Tools"
    },
    {
      id: "markdown-editor",
      name: "Markdown Editor",
      description: "Live editing with real-time preview",
      icon: "✍️",
      freeLimit: 5,
      category: "Writing Tools"
    }
  ],
  pricingTiers: [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      features: [
        "Limited daily usage",
        "Basic tool access",
        "Standard support",
        "Community access"
      ],
      limitations: "Usage limits apply"
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month", 
      features: [
        "Unlimited tool usage",
        "Priority processing",
        "Advanced features",
        "Email support",
        "Export capabilities",
        "No watermarks"
      ],
      popular: true
    },
    {
      name: "Business",
      price: "$24.99",
      period: "/month",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "API access",
        "Custom branding",
        "Priority support",
        "Usage analytics",
        "White-label options"
      ]
    }
  ],
  testimonials: [
    {
      name: "Sarah Johnson",
      role: "Content Creator",
      text: "ToolHub Master has revolutionized my workflow. The AI detector alone saves me hours every week!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Digital Marketer", 
      text: "The URL shortener with analytics is incredibly powerful. Much better than other tools I've used.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Freelance Writer",
      text: "Having all these tools in one place is a game-changer. The interface is intuitive and fast.",
      rating: 5
    }
  ]
};

// Usage tracking
let usageData = {};

// Initialize usage data
function initializeUsageData() {
  const today = new Date().toDateString();
  const storedData = JSON.parse(localStorage.getItem('toolhub_usage') || '{}');
  
  if (storedData.date !== today) {
    usageData = { date: today };
    appData.tools.forEach(tool => {
      usageData[tool.id] = 0;
    });
  } else {
    usageData = storedData;
  }
}

// Save usage data
function saveUsageData() {
  localStorage.setItem('toolhub_usage', JSON.stringify(usageData));
}

// Check if tool can be used
function canUseTool(toolId) {
  const tool = appData.tools.find(t => t.id === toolId);
  return usageData[toolId] < tool.freeLimit;
}

// Use tool (increment usage)
function useTool(toolId) {
  if (canUseTool(toolId)) {
    usageData[toolId]++;
    saveUsageData();
    return true;
  }
  return false;
}

// DOM Elements
let currentTool = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  initializeUsageData();
  renderTools();
  renderTestimonials();
  renderPricing();
  initializeTheme();
  initializeMobileMenu();
  initializeCookieConsent();
  animateCounters();
  
  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});

// Render tools grid
function renderTools() {
  const toolsGrid = document.querySelector('.tools-grid');
  toolsGrid.innerHTML = appData.tools.map(tool => `
    <div class="tool-card" onclick="openTool('${tool.id}')">
      <span class="tool-icon">${tool.icon}</span>
      <h3 class="tool-title">${tool.name}</h3>
      <p class="tool-description">${tool.description}</p>
      <div class="tool-meta">
        <span class="tool-category">${tool.category}</span>
        <span class="tool-limit">${usageData[tool.id] || 0}/${tool.freeLimit} uses</span>
      </div>
    </div>
  `).join('');
}

// Render testimonials
function renderTestimonials() {
  const testimonialsGrid = document.querySelector('.testimonials-grid');
  testimonialsGrid.innerHTML = appData.testimonials.map(testimonial => `
    <div class="testimonial-card">
      <div class="testimonial-rating">${'⭐'.repeat(testimonial.rating)}</div>
      <p class="testimonial-text">"${testimonial.text}"</p>
      <div class="testimonial-author">${testimonial.name}</div>
      <div class="testimonial-role">${testimonial.role}</div>
    </div>
  `).join('');
}

// Render pricing
function renderPricing() {
  const pricingGrid = document.querySelector('.pricing-grid');
  pricingGrid.innerHTML = appData.pricingTiers.map(tier => `
    <div class="pricing-card ${tier.popular ? 'popular' : ''}">
      <h3 class="pricing-name">${tier.name}</h3>
      <div class="pricing-price">${tier.price}</div>
      <div class="pricing-period">${tier.period}</div>
      <ul class="pricing-features">
        ${tier.features.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
      <button class="btn btn--primary btn--full-width" onclick="selectPlan('${tier.name}')">
        ${tier.name === 'Free' ? 'Get Started' : 'Choose Plan'}
      </button>
    </div>
  `).join('');
  
  // Also render pricing modal
  const pricingModalGrid = document.querySelector('.pricing-modal-grid');
  if (pricingModalGrid) {
    pricingModalGrid.innerHTML = pricingGrid.innerHTML;
  }
}

// Open tool modal
function openTool(toolId) {
  const tool = appData.tools.find(t => t.id === toolId);
  if (!tool) return;
  
  currentTool = toolId;
  const modal = document.getElementById('toolModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  modalTitle.textContent = tool.name;
  modalBody.innerHTML = getToolInterface(toolId);
  modal.classList.add('active');
  
  // Initialize tool-specific functionality
  initializeTool(toolId);
}

// Get tool interface HTML
function getToolInterface(toolId) {
  const usageCount = usageData[toolId] || 0;
  const tool = appData.tools.find(t => t.id === toolId);
  const remainingUses = tool.freeLimit - usageCount;
  
  const commonInterface = `
    <div class="tool-interface">
      <div class="usage-info" style="margin-bottom: 16px; padding: 12px; background: var(--color-secondary); border-radius: 8px;">
        <small>Remaining uses today: <strong>${remainingUses}</strong></small>
      </div>
  `;
  
  switch(toolId) {
    case 'ai-detector':
      return commonInterface + `
        <textarea id="aiDetectorInput" class="form-control tool-input" placeholder="Paste your text here to check if it's AI-generated..."></textarea>
        <button class="btn btn--primary" onclick="detectAI()">Analyze Text</button>
        <div id="aiDetectorResult" class="tool-output" style="display: none;"></div>
      </div>`;
      
    case 'pdf-converter':
      return commonInterface + `
        <div class="file-upload" id="pdfUpload">
          <p>📄 Drop your PDF file here or click to select</p>
          <input type="file" id="pdfFile" accept=".pdf" style="display: none;">
        </div>
        <div class="tool-controls">
          <button class="btn btn--outline" onclick="convertPDF('compress')">Compress</button>
          <button class="btn btn--outline" onclick="convertPDF('split')">Split</button>
          <button class="btn btn--outline" onclick="convertPDF('merge')">Merge</button>
        </div>
        <div id="pdfResult" class="tool-output" style="display: none;"></div>
      </div>`;
      
    case 'qr-generator':
      return commonInterface + `
        <input type="text" id="qrInput" class="form-control" placeholder="Enter URL or text to generate QR code">
        <div class="tool-controls">
          <button class="btn btn--primary" onclick="generateQR()">Generate QR Code</button>
        </div>
        <div id="qrResult" class="tool-output" style="display: none;">
          <canvas id="qrCanvas" width="200" height="200"></canvas>
          <button class="btn btn--outline" onclick="downloadQR()" style="margin-top: 16px;">Download QR Code</button>
        </div>
      </div>`;
      
    case 'image-compressor':
      return commonInterface + `
        <div class="file-upload" id="imageUpload">
          <p>🖼️ Drop your image here or click to select</p>
          <input type="file" id="imageFile" accept="image/*" style="display: none;">
        </div>
        <div class="tool-controls">
          <label>Compression Level: <span id="compressionValue">80</span>%</label>
          <input type="range" id="compressionSlider" min="10" max="100" value="80" style="width: 100%;">
        </div>
        <button class="btn btn--primary" onclick="compressImage()">Compress Image</button>
        <div id="imageResult" class="tool-output" style="display: none;"></div>
      </div>`;
      
    case 'url-shortener':
      return commonInterface + `
        <input type="url" id="urlInput" class="form-control" placeholder="Enter URL to shorten">
        <input type="text" id="customAlias" class="form-control" placeholder="Custom alias (optional)" style="margin-top: 8px;">
        <button class="btn btn--primary" onclick="shortenURL()">Shorten URL</button>
        <div id="urlResult" class="tool-output" style="display: none;"></div>
      </div>`;
      
    case 'plagiarism-checker':
      return commonInterface + `
        <textarea id="plagiarismInput" class="form-control tool-input" placeholder="Paste your text here to check for plagiarism..."></textarea>
        <button class="btn btn--primary" onclick="checkPlagiarism()">Check Plagiarism</button>
        <div id="plagiarismResult" class="tool-output" style="display: none;"></div>
      </div>`;
      
    case 'text-summarizer':
      return commonInterface + `
        <textarea id="summarizerInput" class="form-control tool-input" placeholder="Paste your text here to summarize..."></textarea>
        <div class="tool-controls">
          <label>Summary Length:</label>
          <select id="summaryLength" class="form-control">
            <option value="short">Short (2-3 sentences)</option>
            <option value="medium">Medium (4-6 sentences)</option>
            <option value="long">Long (7-10 sentences)</option>
          </select>
        </div>
        <button class="btn btn--primary" onclick="summarizeText()">Summarize Text</button>
        <div id="summarizerResult" class="tool-output" style="display: none;"></div>
      </div>`;
      
    case 'color-palette':
      return commonInterface + `
        <div class="file-upload" id="colorImageUpload">
          <p>🎨 Drop your image here or click to select</p>
          <input type="file" id="colorImageFile" accept="image/*" style="display: none;">
        </div>
        <button class="btn btn--primary" onclick="generateColorPalette()">Extract Colors</button>
        <div id="colorResult" class="tool-output" style="display: none;"></div>
      </div>`;
      
    case 'password-generator':
      return commonInterface + `
        <div class="tool-controls">
          <label>Length: <span id="passwordLength">12</span></label>
          <input type="range" id="lengthSlider" min="6" max="50" value="12" style="width: 100%;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px;">
            <label><input type="checkbox" id="includeUppercase" checked> Uppercase</label>
            <label><input type="checkbox" id="includeLowercase" checked> Lowercase</label>
            <label><input type="checkbox" id="includeNumbers" checked> Numbers</label>
            <label><input type="checkbox" id="includeSymbols"> Symbols</label>
          </div>
        </div>
        <button class="btn btn--primary" onclick="generatePassword()">Generate Password</button>
        <div id="passwordResult" class="tool-output" style="display: none;"></div>
      </div>`;
      
    case 'markdown-editor':
      return commonInterface + `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; height: 400px;">
          <div>
            <label>Markdown Input:</label>
            <textarea id="markdownInput" class="form-control" style="height: 360px; font-family: monospace;" placeholder="# Enter your markdown here"></textarea>
          </div>
          <div>
            <label>Preview:</label>
            <div id="markdownPreview" style="height: 360px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: 8px; padding: 16px; background: var(--color-surface);"></div>
          </div>
        </div>
        <div class="tool-controls" style="margin-top: 16px;">
          <button class="btn btn--outline" onclick="exportMarkdown('html')">Export HTML</button>
          <button class="btn btn--outline" onclick="exportMarkdown('md')">Download MD</button>
        </div>
      </div>`;
      
    default:
      return '<p>Tool not implemented yet.</p>';
  }
}

// Initialize tool-specific functionality
function initializeTool(toolId) {
  switch(toolId) {
    case 'pdf-converter':
      setupFileUpload('pdfUpload', 'pdfFile');
      break;
    case 'image-compressor':
      setupFileUpload('imageUpload', 'imageFile');
      setupCompressionSlider();
      break;
    case 'color-palette':
      setupFileUpload('colorImageUpload', 'colorImageFile');
      break;
    case 'password-generator':
      setupPasswordGenerator();
      break;
    case 'markdown-editor':
      setupMarkdownEditor();
      break;
  }
}

// File upload setup
function setupFileUpload(uploadId, fileInputId) {
  const uploadArea = document.getElementById(uploadId);
  const fileInput = document.getElementById(fileInputId);
  
  if (!uploadArea || !fileInput) return;
  
  uploadArea.addEventListener('click', () => fileInput.click());
  
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    fileInput.files = e.dataTransfer.files;
  });
}

// Tool implementations
function detectAI() {
  if (!useTool('ai-detector')) {
    showUsageLimitModal();
    return;
  }
  
  const input = document.getElementById('aiDetectorInput').value;
  const result = document.getElementById('aiDetectorResult');
  
  if (!input.trim()) {
    alert('Please enter some text to analyze.');
    return;
  }
  
  // Simulate AI detection
  const percentage = Math.floor(Math.random() * 100);
  const confidence = percentage > 70 ? 'High' : percentage > 40 ? 'Medium' : 'Low';
  
  result.innerHTML = `
    <h4>Analysis Results</h4>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${percentage}%"></div>
    </div>
    <p><strong>AI Detection: ${percentage}%</strong></p>
    <p>Confidence Level: ${confidence}</p>
    <p>${percentage > 70 ? 'This text appears to be AI-generated.' : percentage > 40 ? 'This text may contain AI-generated content.' : 'This text appears to be human-written.'}</p>
  `;
  result.style.display = 'block';
  renderTools(); // Update usage count
}

function generateQR() {
  if (!useTool('qr-generator')) {
    showUsageLimitModal();
    return;
  }
  
  const input = document.getElementById('qrInput').value;
  const result = document.getElementById('qrResult');
  const canvas = document.getElementById('qrCanvas');
  
  if (!input.trim()) {
    alert('Please enter text or URL to generate QR code.');
    return;
  }
  
  // Simple QR code generation (mock)
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = '#fff';
  ctx.font = '12px Arial';
  ctx.fillText('QR Code for:', 10, 20);
  ctx.fillText(input.substring(0, 25), 10, 40);
  
  // Create mock QR pattern
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      if (Math.random() > 0.5) {
        ctx.fillRect(i * 10, j * 10 + 50, 8, 8);
      }
    }
  }
  
  result.style.display = 'block';
  renderTools();
}

function downloadQR() {
  const canvas = document.getElementById('qrCanvas');
  const link = document.createElement('a');
  link.download = 'qrcode.png';
  link.href = canvas.toDataURL();
  link.click();
}

function shortenURL() {
  if (!useTool('url-shortener')) {
    showUsageLimitModal();
    return;
  }
  
  const url = document.getElementById('urlInput').value;
  const alias = document.getElementById('customAlias').value;
  const result = document.getElementById('urlResult');
  
  if (!url.trim()) {
    alert('Please enter a URL to shorten.');
    return;
  }
  
  const shortCode = alias || Math.random().toString(36).substring(7);
  const shortUrl = `https://thub.ly/${shortCode}`;
  
  result.innerHTML = `
    <h4>URL Shortened Successfully!</h4>
    <p><strong>Original:</strong> ${url}</p>
    <p><strong>Shortened:</strong> <a href="${url}" target="_blank">${shortUrl}</a></p>
    <button class="btn btn--outline" onclick="copyToClipboard('${shortUrl}')">Copy Link</button>
    <div style="margin-top: 16px;">
      <small>📊 Click analytics available in Pro version</small>
    </div>
  `;
  result.style.display = 'block';
  renderTools();
}

function checkPlagiarism() {
  if (!useTool('plagiarism-checker')) {
    showUsageLimitModal();
    return;
  }
  
  const input = document.getElementById('plagiarismInput').value;
  const result = document.getElementById('plagiarismResult');
  
  if (!input.trim()) {
    alert('Please enter text to check for plagiarism.');
    return;
  }
  
  const percentage = Math.floor(Math.random() * 30); // Low plagiarism for demo
  
  result.innerHTML = `
    <h4>Plagiarism Check Results</h4>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${percentage}%; background: ${percentage > 15 ? '#f56565' : '#48bb78'}"></div>
    </div>
    <p><strong>Similarity: ${percentage}%</strong></p>
    <p>${percentage > 15 ? 'Potential plagiarism detected.' : 'Content appears original.'}</p>
    <div style="margin-top: 16px;">
      <small>🔍 Detailed source analysis available in Pro version</small>
    </div>
  `;
  result.style.display = 'block';
  renderTools();
}

function summarizeText() {
  if (!useTool('text-summarizer')) {
    showUsageLimitModal();
    return;
  }
  
  const input = document.getElementById('summarizerInput').value;
  const length = document.getElementById('summaryLength').value;
  const result = document.getElementById('summarizerResult');
  
  if (!input.trim()) {
    alert('Please enter text to summarize.');
    return;
  }
  
  // Mock summarization
  const sentences = input.split('.').filter(s => s.trim());
  const summaryLength = length === 'short' ? 2 : length === 'medium' ? 4 : 7;
  const summary = sentences.slice(0, Math.min(summaryLength, sentences.length)).join('. ') + '.';
  
  result.innerHTML = `
    <h4>Text Summary</h4>
    <p><strong>Original length:</strong> ${input.length} characters</p>
    <p><strong>Summary length:</strong> ${summary.length} characters</p>
    <div style="padding: 16px; background: var(--color-secondary); border-radius: 8px; margin-top: 16px;">
      ${summary}
    </div>
    <button class="btn btn--outline" onclick="copyToClipboard('${summary.replace(/'/g, '\\\'')}')" style="margin-top: 16px;">Copy Summary</button>
  `;
  result.style.display = 'block';
  renderTools();
}

function generateColorPalette() {
  if (!useTool('color-palette')) {
    showUsageLimitModal();
    return;
  }
  
  const fileInput = document.getElementById('colorImageFile');
  const result = document.getElementById('colorResult');
  
  if (!fileInput.files.length) {
    alert('Please select an image to extract colors from.');
    return;
  }
  
  // Mock color palette
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  
  result.innerHTML = `
    <h4>Color Palette Extracted</h4>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 16px; margin-top: 16px;">
      ${colors.map(color => `
        <div style="text-align: center;">
          <div style="width: 100px; height: 100px; background: ${color}; border-radius: 8px; margin-bottom: 8px; cursor: pointer;" onclick="copyToClipboard('${color}')"></div>
          <small>${color}</small>
        </div>
      `).join('')}
    </div>
    <p style="margin-top: 16px;"><small>Click on any color to copy its hex code</small></p>
  `;
  result.style.display = 'block';
  renderTools();
}

function generatePassword() {
  if (!useTool('password-generator')) {
    showUsageLimitModal();
    return;
  }
  
  const length = document.getElementById('lengthSlider').value;
  const includeUppercase = document.getElementById('includeUppercase').checked;
  const includeLowercase = document.getElementById('includeLowercase').checked;
  const includeNumbers = document.getElementById('includeNumbers').checked;
  const includeSymbols = document.getElementById('includeSymbols').checked;
  const result = document.getElementById('passwordResult');
  
  let charset = '';
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (includeNumbers) charset += '0123456789';
  if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (!charset) {
    alert('Please select at least one character type.');
    return;
  }
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  const strength = length < 8 ? 'Weak' : length < 12 ? 'Medium' : 'Strong';
  const strengthColor = strength === 'Weak' ? '#f56565' : strength === 'Medium' ? '#ed8936' : '#48bb78';
  
  result.innerHTML = `
    <h4>Generated Password</h4>
    <div style="font-family: monospace; font-size: 18px; background: var(--color-secondary); padding: 16px; border-radius: 8px; margin: 16px 0;">
      ${password}
    </div>
    <p>Strength: <span style="color: ${strengthColor}; font-weight: bold;">${strength}</span></p>
    <button class="btn btn--primary" onclick="copyToClipboard('${password}')">Copy Password</button>
  `;
  result.style.display = 'block';
  renderTools();
}

// Setup functions
function setupCompressionSlider() {
  const slider = document.getElementById('compressionSlider');
  const value = document.getElementById('compressionValue');
  
  if (slider && value) {
    slider.addEventListener('input', () => {
      value.textContent = slider.value;
    });
  }
}

function setupPasswordGenerator() {
  const lengthSlider = document.getElementById('lengthSlider');
  const lengthDisplay = document.getElementById('passwordLength');
  
  if (lengthSlider && lengthDisplay) {
    lengthSlider.addEventListener('input', () => {
      lengthDisplay.textContent = lengthSlider.value;
    });
  }
}

function setupMarkdownEditor() {
  const input = document.getElementById('markdownInput');
  const preview = document.getElementById('markdownPreview');
  
  if (!input || !preview) return;
  
  function updatePreview() {
    const markdown = input.value;
    // Simple markdown parsing
    let html = markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br>');
    
    preview.innerHTML = html;
  }
  
  input.addEventListener('input', updatePreview);
  updatePreview(); // Initial render
}

// Utility functions
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copied to clipboard!');
  });
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--color-success);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 3000;
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Modal functions
function closeModal() {
  const modal = document.getElementById('toolModal');
  modal.classList.remove('active');
  
  // Clear all form inputs and results when closing modal
  const modalBody = document.getElementById('modalBody');
  const inputs = modalBody.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    if (input.type === 'checkbox' || input.type === 'radio') {
      input.checked = input.defaultChecked;
    } else if (input.type === 'range') {
      input.value = input.defaultValue;
    } else {
      input.value = '';
    }
  });
  
  // Hide all result divs
  const results = modalBody.querySelectorAll('.tool-output');
  results.forEach(result => {
    result.style.display = 'none';
  });
  
  // Clear file inputs
  const fileInputs = modalBody.querySelectorAll('input[type="file"]');
  fileInputs.forEach(input => {
    input.value = '';
  });
  
  currentTool = null;
}

function openPricingModal() {
  document.getElementById('pricingModal').classList.add('active');
}

function closePricingModal() {
  document.getElementById('pricingModal').classList.remove('active');
}

function showUsageLimitModal() {
  document.getElementById('usageLimitModal').classList.add('active');
}

function closeUsageLimitModal() {
  document.getElementById('usageLimitModal').classList.remove('active');
}

function selectPlan(planName) {
  alert(`Selected ${planName} plan! Payment integration would be implemented here.`);
}

// Theme toggle
function initializeTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('.theme-icon');
  
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-color-scheme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-color-scheme', newTheme);
    themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', newTheme);
  });
  
  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-color-scheme', savedTheme);
  themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// Mobile menu
function initializeMobileMenu() {
  const toggle = document.getElementById('mobileMenuToggle');
  const menu = document.getElementById('navbarMenu');
  
  toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
  });
}

// Cookie consent
function initializeCookieConsent() {
  const consent = document.getElementById('cookieConsent');
  if (!localStorage.getItem('cookieConsent')) {
    setTimeout(() => consent.classList.add('show'), 2000);
  }
}

function acceptCookies() {
  document.getElementById('cookieConsent').classList.remove('show');
  localStorage.setItem('cookieConsent', 'accepted');
}

// Animated counters
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
          if (current < target) {
            current += increment;
            counter.textContent = Math.floor(current).toLocaleString() + '+';
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target.toLocaleString() + '+';
          }
        };
        
        updateCounter();
        observer.unobserve(counter);
      }
    });
  });
  
  counters.forEach(counter => observer.observe(counter));
}

// Scroll to section
function scrollToSection(sectionId) {
  document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// Close modals when clicking outside or pressing escape
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
    if (e.target.id === 'toolModal') {
      closeModal();
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const activeModals = document.querySelectorAll('.modal.active');
    activeModals.forEach(modal => {
      modal.classList.remove('active');
      if (modal.id === 'toolModal') {
        closeModal();
      }
    });
  }
});