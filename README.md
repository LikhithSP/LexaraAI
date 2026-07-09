# Lexara AI - Modern AI Chatbot

<p align="center">
  <img src=".\static\images\prev.png">
  <img src=".\static\images\prev1.png">
  <b>A beautiful, modern web-based AI chatbot that replicates the core user experience and interface of ChatGPT, powered by the Google Gemini API.</b><br><a href="https://lexaraai-549089623ce0.herokuapp.com/" target="_blank">Visit Now</a> <br>
</p>

## Features

- **Modern Aesthetic Design**: Clean, beautiful interface inspired by the latest AI chat applications.
- **Lexara AI Branding**: Unique identity with custom logo and gradient design.
- **Real-time Messaging**: Live chat with elegant typing indicators.
- **Quick Action Cards**: Fast access to common AI tasks (with modern Fluent design).
- **Code Syntax Highlighting**: Beautiful formatting for code snippets using `highlight.js`.
- **Markdown & Clean Typography**: Completely styled headers, lists, paragraphs, horizontal rules, links, blockquotes, and tables for a highly professional look.
- **Responsive & Mobile-First Design**: Fully optimized for desktop, tablet, and mobile (with mobile drawer navigation, touch-friendly controls, and a mobile-optimized theme toggle).
- **Persistent Chat History**: All your chats are saved in your browser's local storage, so you can revisit previous conversations even after a reload.
- **Chat Deletion**: Delete individual chats easily via the trashcan icon next to any thread in the history sidebar.
- **Clipboard Sharing**: One-click button to copy your entire conversation to the clipboard.
- **Refined Theme Toggle**: Modern, touch-friendly dark/light mode toggle with smooth transitions and custom SVG icons.
- **Conversation Context & System Instruction**: Maintains context throughout the session. Includes system prompt guiding for knowledge limits gracefully.

## Technology Stack

- **Frontend**: HTML, CSS, vanilla JavaScript
- **Backend**: Python with FastAPI
- **AI Model**: Google Gemini API (`gemini-2.5-flash` by default)
- **Dependencies**: OpenAI library (configured for Gemini's OpenAI-compatible endpoint)

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- Gemini API key (get one from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone or download the project files**

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   - Open the `.env` file
   - Replace with your actual Gemini API key and model settings:
     ```env
     GEMINI_API_KEY=your_gemini_api_key_here
     GEMINI_MODEL=gemini-2.5-flash
     ```

4. **Run the application**:
   ```bash
   python main.py
   ```

5. **Open your browser** and navigate to:
   ```
   http://localhost:8000
   ```

6. Deployed using Heroku 

## Project Structure

```
lexara-ai/
├── main.py                 # FastAPI backend server
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables (API key)
├── README.md              # This file
├── run.bat                # Windows batch file for quick start
├── setup_and_run.py       # Python setup helper
└── static/                # Frontend files
   ├── index.html         # Main HTML page
   ├── styles.css         # CSS styling (including mobile, dark mode, and markdown)
   └── script.js          # JavaScript (UI logic, chat history, and deletion)
```

## API Endpoints

- `GET /` - Serves the main HTML page
- `POST /api/chat` - Handles chat requests
- `GET /health` - Health check endpoint

## Customization

### Styling
Modify `static/styles.css` to change the appearance:
- Colors and themes
- Layout and spacing
- Markdown/typography overrides

### Functionality
Extend `static/script.js` to add new features:
- Local storage chat history (see `saveCurrentChat`, `loadChatHistoryFromStorage`, `deleteChat`)
- Clipboard sharing (see `copyChatToClipboard`)
- Custom commands

### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign up or log in with your Google account
3. Click **Get API key**
4. Copy the API key to your `.env` file as `GEMINI_API_KEY`

## Troubleshooting

### Common Issues

1. **"Module not found" errors**:
   - Make sure you've installed all requirements: `pip install -r requirements.txt`

2. **API key errors / 403 / 429**:
   - Verify your Gemini API key is correctly set in the `.env` file.
   - Note that Google API keys generated outside AI Studio or restricted projects may return `403 Permission Denied` or `429 Quota Exceeded` errors. Generate a standard key starting with `AIzaSy`.

3. **Port already in use**:
   - Change the port in `main.py`: `uvicorn.run(app, host="0.0.0.0", port=8001)`

## License

This project is for educational purposes.
