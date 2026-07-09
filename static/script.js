class LexaraAI {
    constructor() {
        this.conversationHistory = [];
        this.isTyping = false;
        this.currentChatId = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupMarkdown();
        this.setDynamicGreeting();
        this.loadChatHistoryFromStorage();
    }

    initializeElements() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.welcomeSection = document.getElementById('welcomeSection');
    this.quickActionCards = document.querySelectorAll('.quick-action-card');
    this.quickActionBtns = document.querySelectorAll('.quick-action-btn');
        this.themeToggle = document.getElementById('themeToggle');
        this.dynamicGreeting = document.getElementById('dynamicGreeting');
        this.shareChatBtn = document.getElementById('shareChatBtn');
        this.conversationHistoryContainer = document.getElementById('conversationHistory');
        this.sidebar = document.querySelector('.sidebar');
        this.setupMobileMenu();
    }

    setupMobileMenu() {
        // Create mobile menu overlay
        this.mobileOverlay = document.createElement('div');
        this.mobileOverlay.className = 'sidebar-overlay';
        document.body.appendChild(this.mobileOverlay);

        // Mobile menu toggle functionality
        const chatHeaderBar = document.querySelector('.chat-header-bar');
        if (chatHeaderBar) {
            chatHeaderBar.addEventListener('click', (e) => {
                if (window.innerWidth <= 480 && e.target === chatHeaderBar) {
                    this.toggleMobileSidebar();
                }
            });
        }

        // Close sidebar when clicking overlay
        this.mobileOverlay.addEventListener('click', () => {
            this.closeMobileSidebar();
        });

        // Close sidebar when window is resized to larger screen
        window.addEventListener('resize', () => {
            if (window.innerWidth > 480) {
                this.closeMobileSidebar();
            }
        });
    }

    toggleMobileSidebar() {
        if (this.sidebar && this.mobileOverlay) {
            this.sidebar.classList.toggle('mobile-open');
            this.mobileOverlay.classList.toggle('active');
        }
    }

    closeMobileSidebar() {
        if (this.sidebar && this.mobileOverlay) {
            this.sidebar.classList.remove('mobile-open');
            this.mobileOverlay.classList.remove('active');
        }
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


        // Quick action cards (legacy)
        this.quickActionCards.forEach(card => {
            card.addEventListener('click', () => {
                const prompt = card.getAttribute('data-prompt');
                this.handleQuickAction(prompt);
            });
        });

        // Quick action buttons (new)
        const quickActionPrompts = {
            'Summarize text': 'Summarize this text: ',
            'Get advice': 'I need advice about ',
            'Surprise me': 'Surprise me with something interesting',
            'Analyze data': 'Help me analyze this data: ',
            'Help me write': 'Help me write ',
            'More': 'Explain : '
        };
        this.quickActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-prompt');
                const prompt = quickActionPrompts[key] || '';
                if (prompt) {
                    this.handleQuickAction(prompt);
                }
            });
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Share chat button
        this.shareChatBtn.addEventListener('click', () => this.copyChatToClipboard());

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
        this.saveCurrentChat();
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

        if (!this.currentChatId) {
            this.startNewChat(false); // Don't clear messages if it's the first message of a new session
        }

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
            this.saveCurrentChat();
            
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

    copyChatToClipboard() {
        if (this.conversationHistory.length === 0) {
            this.showTemporaryTooltip(this.shareChatBtn, 'Nothing to copy!');
            return;
        }

        let chatText = "Lexara AI Conversation\n";
        chatText += "========================\n\n";

        this.conversationHistory.forEach(item => {
            const prefix = item.role === 'user' ? 'You: ' : 'Lexara AI: ';
            chatText += prefix + item.content + '\n\n';
        });

        navigator.clipboard.writeText(chatText.trim()).then(() => {
            this.showTemporaryTooltip(this.shareChatBtn, 'Copied!');
        }).catch(err => {
            console.error('Failed to copy chat: ', err);
            this.showTemporaryTooltip(this.shareChatBtn, 'Failed to copy!');
        });
    }

    showTemporaryTooltip(element, text) {
        const originalTitle = element.getAttribute('title');
        element.setAttribute('title', text);

        const icon = element.querySelector('svg');
        if (!icon) return;
        
        const originalIconHTML = icon.innerHTML;
        // Checkmark icon
        icon.innerHTML = `<path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;

        element.style.borderColor = '#34d399'; // Green border for success
        element.style.color = '#34d399';

        setTimeout(() => {
            element.setAttribute('title', originalTitle);
            icon.innerHTML = originalIconHTML;
            element.style.borderColor = '';
            element.style.color = '';
        }, 2000);
    }

    // Local Storage Chat History Management
    saveCurrentChat() {
        if (!this.currentChatId || this.conversationHistory.length === 0) return;

        const allChats = this.getAllChatsFromStorage();
        const chatData = {
            id: this.currentChatId,
            timestamp: new Date().toISOString(),
            messages: this.conversationHistory
        };
        
        const existingChatIndex = allChats.findIndex(chat => chat.id === this.currentChatId);
        if (existingChatIndex > -1) {
            allChats[existingChatIndex] = chatData;
        } else {
            allChats.unshift(chatData);
        }

        localStorage.setItem('lexara-chats', JSON.stringify(allChats));
        this.renderChatHistoryList();
    }

    loadChatHistoryFromStorage() {
        this.renderChatHistoryList();
        const allChats = this.getAllChatsFromStorage();
        if (allChats.length > 0) {
            this.loadChat(allChats[0].id);
        } else {
            this.startNewChat(false);
        }
    }

    getAllChatsFromStorage() {
        try {
            const chats = localStorage.getItem('lexara-chats');
            return chats ? JSON.parse(chats) : [];
        } catch (e) {
            console.error("Error parsing chats from localStorage", e);
            return [];
        }
    }

    renderChatHistoryList() {
        if (!this.conversationHistoryContainer) return;

        const allChats = this.getAllChatsFromStorage();
        this.conversationHistoryContainer.innerHTML = '';

        if (allChats.length === 0) {
            this.conversationHistoryContainer.innerHTML = `
                <div class="history-placeholder">
                    <div class="chat-history-item">
                        <div class="chat-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <span>No recent chats</span>
                    </div>
                </div>`;
            return;
        }

        const groupedChats = this.groupChatsByTime(allChats);

        for (const group in groupedChats) {
            const section = document.createElement('div');
            section.className = 'history-section';
            
            const title = document.createElement('h3');
            title.textContent = group;
            section.appendChild(title);

            groupedChats[group].forEach(chat => {
                const item = document.createElement('div');
                item.className = `chat-history-item ${chat.id === this.currentChatId ? 'active' : ''}`;
                item.dataset.chatId = chat.id;
                
                const leftContent = document.createElement('div');
                leftContent.className = 'chat-history-item-left';
                leftContent.style.display = 'flex';
                leftContent.style.alignItems = 'center';
                leftContent.style.gap = '12px';
                leftContent.style.flex = '1';
                leftContent.style.minWidth = '0';
                
                const icon = document.createElement('div');
                icon.className = 'chat-icon';
                icon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
                
                const span = document.createElement('span');
                span.textContent = this.getChatTitle(chat.messages);
                span.style.overflow = 'hidden';
                span.style.textOverflow = 'ellipsis';
                span.style.whiteSpace = 'nowrap';

                leftContent.appendChild(icon);
                leftContent.appendChild(span);
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'chat-delete-btn';
                deleteBtn.innerHTML = `
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                `;
                deleteBtn.setAttribute('title', 'Delete chat');
                
                item.appendChild(leftContent);
                item.appendChild(deleteBtn);
                
                leftContent.addEventListener('click', () => this.loadChat(chat.id));
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteChat(chat.id);
                });
                
                section.appendChild(item);
            });
            
            this.conversationHistoryContainer.appendChild(section);
        }
    }

    groupChatsByTime(chats) {
        const groups = {
            'Today': [],
            'Yesterday': [],
            'Previous 7 Days': [],
            'Previous 30 Days': [],
            'Older': []
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        chats.forEach(chat => {
            const chatDate = new Date(chat.timestamp);
            if (chatDate >= today) {
                groups['Today'].push(chat);
            } else if (chatDate >= yesterday) {
                groups['Yesterday'].push(chat);
            } else if (chatDate >= sevenDaysAgo) {
                groups['Previous 7 Days'].push(chat);
            } else if (chatDate >= thirtyDaysAgo) {
                groups['Previous 30 Days'].push(chat);
            } else {
                groups['Older'].push(chat);
            }
        });

        // Clean up empty groups
        for (const group in groups) {
            if (groups[group].length === 0) {
                delete groups[group];
            }
        }

        return groups;
    }

    getChatTitle(messages) {
        if (messages.length > 0 && messages[0].role === 'user') {
            return messages[0].content.substring(0, 30) + (messages[0].content.length > 30 ? '...' : '');
        }
        return 'New Chat';
    }

    loadChat(chatId) {
        const allChats = this.getAllChatsFromStorage();
        const chat = allChats.find(c => c.id === chatId);

        if (chat) {
            this.currentChatId = chatId;
            this.conversationHistory = chat.messages;
            this.chatMessages.innerHTML = '';
            
            if (this.conversationHistory.length > 0) {
                this.hideWelcomeSection();
                this.conversationHistory.forEach(item => {
                    const messageElement = this.createMessageElement(item.role, item.content);
                    this.chatMessages.appendChild(messageElement);
                });
                this.scrollToBottom();
            } else {
                if (this.welcomeSection) {
                    this.welcomeSection.style.display = 'flex';
                }
            }
            this.renderChatHistoryList();
            this.closeMobileSidebar(); // Close mobile sidebar when chat is loaded
        }
    }

    deleteChat(chatId) {
        if (!confirm('Are you sure you want to delete this conversation?')) return;
        
        let allChats = this.getAllChatsFromStorage();
        allChats = allChats.filter(chat => chat.id !== chatId);
        localStorage.setItem('lexara-chats', JSON.stringify(allChats));
        
        if (this.currentChatId === chatId) {
            if (allChats.length > 0) {
                this.loadChat(allChats[0].id);
            } else {
                this.startNewChat(true);
            }
        } else {
            this.renderChatHistoryList();
        }
    }

    startNewChat(clearMessages = true) {
        this.currentChatId = `chat-${new Date().getTime()}`;
        this.conversationHistory = [];
        if (clearMessages) {
            this.chatMessages.innerHTML = '';
        }
        if (this.welcomeSection) {
            this.welcomeSection.style.display = 'flex';
        }
        this.messageInput.value = '';
        this.autoResizeTextarea();
        this.toggleSendButton();
        this.renderChatHistoryList();
        this.closeMobileSidebar(); // Close mobile sidebar when new chat is started
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
