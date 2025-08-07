# ChatGPT Clone with DeepSeek R1 API

A web-based chatbot that replicates the core user experience and interface of ChatGPT, powered by the DeepSeek R1 API via OpenRouter.

## Features

- **Clean ChatGPT-like Interface**: Familiar chat interface with sidebar and main chat area
- **Real-time Messaging**: Live chat with typing indicators
- **Code Syntax Highlighting**: Proper formatting for code snippets using highlight.js
- **Markdown Support**: Rich text rendering with marked.js
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Conversation Context**: Maintains conversation history throughout the session

## Technology Stack

- **Frontend**: HTML, CSS, vanilla JavaScript
- **Backend**: Python with FastAPI
- **AI Model**: DeepSeek R1 model via OpenRouter
- **Dependencies**: OpenAI library for API integration

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- OpenRouter API key with DeepSeek R1 access (get one from [OpenRouter](https://openrouter.ai/))

### Installation

1. **Clone or download the project files**

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   - Open the `.env` file
   - Replace with your actual OpenRouter API key and URL:
     ```
     DEEPSEEK_API_KEY=your_openrouter_api_key_here
     DEEPSEEK_API_URL=https://openrouter.ai/api/v1/chat/completions
     ```

4. **Run the application**:
   ```bash
   python main.py
   ```

5. **Open your browser** and navigate to:
   ```
   http://localhost:8000
   ```

## Project Structure

```
chatgpt-clone/
├── main.py                 # FastAPI backend server
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables (API key)
├── README.md              # This file
└── static/                # Frontend files
    ├── index.html         # Main HTML page
    ├── styles.css         # CSS styling
    └── script.js          # JavaScript functionality
```

## API Endpoints

- `GET /` - Serves the main HTML page
- `POST /api/chat` - Handles chat requests
- `GET /health` - Health check endpoint

## Usage

1. Open the application in your browser
2. Type your message in the input field at the bottom
3. Press Enter or click the Send button
4. The AI will respond with context-aware answers
5. Use the "New Chat" button to start a fresh conversation

## Features in Detail

### Code Formatting
The chatbot can display code snippets with proper syntax highlighting. Just ask for code examples, and they'll be automatically formatted.

### Conversation Memory
The bot maintains context throughout your conversation, so you can refer to previous messages and build upon the discussion.

### Responsive Design
The interface adapts to different screen sizes:
- Desktop: Full sidebar and chat interface
- Tablet: Adjusts layout for medium screens
- Mobile: Optimized for small screens with hidden sidebar

## Customization

### Styling
Modify `static/styles.css` to change the appearance:
- Colors and themes
- Layout and spacing
- Typography

### Functionality
Extend `static/script.js` to add new features:
- Message persistence
- Export conversations
- Custom commands

### Backend
Enhance `main.py` for additional functionality:
- User authentication
- Database integration
- Rate limiting

### Getting Your OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up for an account
3. Navigate to API keys section
4. Create a new API key
5. Make sure you have access to DeepSeek R1 model
6. Copy the API key to your `.env` file along with the OpenRouter URL

## Troubleshooting

### Common Issues

1. **"Module not found" errors**:
   - Make sure you've installed all requirements: `pip install -r requirements.txt`

2. **API key errors**:
   - Verify your OpenRouter API key is correctly set in the `.env` file
   - Check that your API key is valid and has sufficient credits
   - Ensure you have access to the DeepSeek R1 model on OpenRouter

3. **Port already in use**:
   - Change the port in `main.py`: `uvicorn.run(app, host="0.0.0.0", port=8001)`

4. **CORS errors**:
   - This shouldn't occur since the frontend is served by the same server

## Development

To run in development mode with auto-reload:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Security Notes

- Never commit your `.env` file with real API keys to version control
- In production, use proper environment variable management
- Consider implementing rate limiting and authentication for production use

## License

This project is for educational purposes. Please respect DeepSeek's API terms of service.

## Contributing

Feel free to fork this project and submit pull requests for improvements!
