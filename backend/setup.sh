#!/bin/bash

# LLM Visualization Backend Setup Script

echo "Setting up LLM Visualization Backend..."

# Create virtual environment
echo "Creating Python virtual environment..."
python -m venv llm_viz_env

# Activate virtual environment (Unix/macOS)
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    source llm_viz_env/bin/activate
    echo "Virtual environment activated (Unix/macOS)"
# Activate virtual environment (Windows)
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    llm_viz_env\Scripts\activate
    echo "Virtual environment activated (Windows)"
fi

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Backend setup complete!"
echo ""
echo "To start the server:"
echo "  1. Activate virtual environment:"
echo "     - Unix/macOS: source llm_viz_env/bin/activate"
echo "     - Windows: llm_viz_env\\Scripts\\activate"
echo "  2. Run server: uvicorn app:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "Server will be available at: http://localhost:8000"
echo "API docs will be available at: http://localhost:8000/docs"
