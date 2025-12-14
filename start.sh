#!/bin/bash

# Dostoevsky Chess - Quick Start Script
# This script helps you test the project locally

echo "🎭 Dostoevsky Chess - Quick Start"
echo "================================="
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project files found"
echo ""

# Function to start server
start_server() {
    echo "🚀 Starting local server..."
    echo ""
    
    # Try Python 3
    if command -v python3 &> /dev/null; then
        echo "📡 Server running at: http://localhost:8000"
        echo "🎮 Open this URL in your browser to play!"
        echo ""
        echo "Press Ctrl+C to stop the server"
        echo ""
        python3 -m http.server 8000
        return
    fi
    
    # Try Python 2
    if command -v python &> /dev/null; then
        echo "📡 Server running at: http://localhost:8000"
        echo "🎮 Open this URL in your browser to play!"
        echo ""
        echo "Press Ctrl+C to stop the server"
        echo ""
        python -m SimpleHTTPServer 8000
        return
    fi
    
    # Try PHP
    if command -v php &> /dev/null; then
        echo "📡 Server running at: http://localhost:8000"
        echo "🎮 Open this URL in your browser to play!"
        echo ""
        echo "Press Ctrl+C to stop the server"
        echo ""
        php -S localhost:8000
        return
    fi
    
    # Try npx serve
    if command -v npx &> /dev/null; then
        echo "📡 Server will start shortly..."
        echo "🎮 Open the URL shown below in your browser to play!"
        echo ""
        echo "Press Ctrl+C to stop the server"
        echo ""
        npx serve
        return
    fi
    
    echo "❌ No suitable server found!"
    echo ""
    echo "Please install one of the following:"
    echo "  - Python 3: https://www.python.org/"
    echo "  - PHP: https://www.php.net/"
    echo "  - Node.js: https://nodejs.org/"
    echo ""
    echo "Or manually start a local server in this directory."
    exit 1
}

# Run the server
start_server
