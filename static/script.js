class LexaraAI {
    constructor() {
        this.conversationHistory = [];
        this.isTyping = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupMarkdown();
        this.setDynamicGreeting();
    }

    initializeElements() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.welcomeSection = document.getElementById('welcomeSection');
        this.quickActionCards = document.querySelectorAll('.quick-action-card');
        this.themeToggle = document.getElementById('themeToggle');
        this.dynamicGreeting = document.getElementById('dynamicGreeting');
    }

    setupEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter key to send message
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
            this.toggleSendButton();
        });

        // New chat button
        this.newChatBtn.addEventListener('click', () => this.startNewChat());

        // Quick action cards
        this.quickActionCards.forEach(card => {
            card.addEventListener('click', () => {
                const prompt = card.getAttribute('data-prompt');
                this.handleQuickAction(prompt);
            });
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Initial button state
        this.toggleSendButton();
        
        // Initialize theme
        this.initializeTheme();
    }

    setupMarkdown() {
        // Configure marked for better rendering
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                highlight: function(code, lang) {
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (__) {}
                    }
                    return hljs.highlightAuto(code).value;
                },
                breaks: true,
                gfm: true
            });
        }
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    toggleSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasText || this.isTyping;
    }

    handleQuickAction(prompt) {
        this.messageInput.value = prompt;
        this.autoResizeTextarea();
        this.toggleSendButton();
        this.messageInput.focus();
    }

    hideWelcomeSection() {
        if (this.welcomeSection) {
            this.welcomeSection.style.display = 'none';
        }
    }

    showWelcomeSection() {
        if (this.welcomeSection) {
            this.welcomeSection.style.display = 'flex';
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;

        // Hide welcome section on first message
        this.hideWelcomeSection();

        // Add user message to UI
        this.addUserMessage(message);
        
        // Clear input
        this.messageInput.value = '';
        this.autoResizeTextarea();
        this.toggleSendButton();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send message to backend
            const response = await this.sendToBackend(message);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add assistant response to UI
            this.addAssistantMessage(response.response);
            
            // Update conversation history
            this.conversationHistory = response.conversation_history;
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addErrorMessage(error.message);
        }
    }

    async sendToBackend(message) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                conversation_history: this.conversationHistory
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    addUserMessage(message) {
        const messageElement = this.createMessageElement('user', message);
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    addAssistantMessage(message) {
        const messageElement = this.createMessageElement('assistant', message);
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    addErrorMessage(error) {
        const messageElement = this.createMessageElement('assistant', 
            `I apologize, but I encountered an error: ${error}. Please try again.`);
        messageElement.classList.add('error-message');
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    createMessageElement(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        
        const avatar = document.createElement('div');
        if (role === 'user') {
            avatar.className = 'avatar user-avatar';
            avatar.innerHTML = `
                <img src="https://em-content.zobj.net/source/microsoft-teams/400/bust-in-silhouette_1f464.png" alt="User Avatar" width="18" height="18" style="border-radius: 50%; object-fit: cover;">
            `;
        } else {
            avatar.className = 'avatar lexara-avatar-small';
            avatar.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 2v20M2 12h20" stroke="currentColor" stroke-width="2"/>
                </svg>
            `;
        }
        
        avatarDiv.appendChild(avatar);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (role === 'assistant') {
            // Parse markdown for assistant messages
            if (typeof marked !== 'undefined') {
                contentDiv.innerHTML = marked.parse(content);
                // Apply syntax highlighting to code blocks
                contentDiv.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightBlock(block);
                });
            } else {
                contentDiv.innerHTML = this.parseBasicMarkdown(content);
            }
        } else {
            // Plain text for user messages
            const p = document.createElement('p');
            p.textContent = content;
            contentDiv.appendChild(p);
        }

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        return messageDiv;
    }

    parseBasicMarkdown(text) {
        // Basic markdown parsing fallback
        return text
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        this.isTyping = true;
        this.typingIndicator.style.display = 'block';
        this.toggleSendButton();
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
        this.toggleSendButton();
    }

    scrollToBottom() {
        setTimeout(() => {
            const container = this.chatMessages.parentElement;
            container.scrollTop = container.scrollHeight;
        }, 100);
    }

    startNewChat() {
        // Clear conversation history
        this.conversationHistory = [];
        
        // Clear messages
        this.chatMessages.innerHTML = '';
        
        // Show welcome section
        this.showWelcomeSection();
        
        // Clear input
        this.messageInput.value = '';
        this.autoResizeTextarea();
        this.toggleSendButton();
        
        // Focus input
        this.messageInput.focus();
    }

    // Add smooth animations
    addRippleEffect(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Theme Management Methods
    initializeTheme() {
        // Check for saved theme preference or default to 'light'
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Add a subtle animation class for smooth transition
        document.body.classList.add('theme-transitioning');
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 300);
    }

    // Dynamic Greeting Based on Time
    setDynamicGreeting() {
        if (!this.dynamicGreeting) return;
        
        const now = new Date();
        const hour = now.getHours();
        let greeting = "Hello there!"; // fallback/default
        
        if (hour >= 5 && hour < 12) {
            greeting = "Good morning! 👋";
        } else if (hour >= 12 && hour < 17) {
            greeting = "Good afternoon! ☀️";
        } else if (hour >= 17 && hour < 22) {
            greeting = "Good evening! 🌆";
        } else if (hour >= 22 || hour < 5) {
            greeting = "Hey there, night owl! 🌙";
        }
        
        this.dynamicGreeting.textContent = greeting;
    }
}

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .quick-action-card, .new-chat-btn button, #sendButton {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LexaraAI();
});
