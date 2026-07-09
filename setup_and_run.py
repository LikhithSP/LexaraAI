#!/usr/bin/env python3
"""
Quick start script for ChatGPT Clone
This script helps set up and run the application with guided setup.
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python {sys.version.split()[0]} detected")
    return True

def install_requirements():
    """Install required packages"""
    print("📦 Installing requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install requirements")
        return False

def setup_env_file():
    """Setup environment file with API key"""
    env_file = Path(".env")
    
    if env_file.exists():
        with open(env_file, 'r') as f:
            content = f.read()
            if "GEMINI_API_KEY" in content:
                print("✅ .env file already configured")
                return True
    
    print("\n🔑 Gemini API Key Setup")
    print("You need a Gemini API key to use this application.")
    print("Get one from: https://aistudio.google.com/")
    print()
    
    api_key = input("Enter your Gemini API key (or press Enter to use demo mode): ").strip()
    
    if not api_key:
        api_key = "demo_key_placeholder"
        print("⚠️  Demo mode: Some features may not work without a valid API key")
    
    with open(env_file, 'w') as f:
        f.write(f"GEMINI_API_KEY={api_key}\n")
        f.write(f"GEMINI_MODEL=gemini-2.5-flash\n")
    
    print("✅ .env file created")
    return True

def start_server():
    """Start the FastAPI server"""
    print("\n🚀 Starting ChatGPT Clone server...")
    print("Server will be available at: http://localhost:8000")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        import uvicorn
        from main import app
        uvicorn.run(app, host="0.0.0.0", port=8000)
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped. Thanks for using ChatGPT Clone!")
    except ImportError:
        print("❌ FastAPI/Uvicorn not properly installed")
        return False
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False

def main():
    """Main setup and run function"""
    print("🤖 MyGPT Clone with Gemini API")
    print("=" * 40)
    
    # Check Python version
    if not check_python_version():
        return
    
    # Install requirements
    if not install_requirements():
        return
    
    # Setup environment
    if not setup_env_file():
        return
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()
