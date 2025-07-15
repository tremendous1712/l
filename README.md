# LLM Visualization Tool

An interactive 3D visualization tool for understanding how Large Language Models (specifically GPT-2) process text through tokenization, embeddings, attention mechanisms, and next token prediction.

## Overview

This application provides an educational interface to explore the internal workings of transformer-based language models. Users can input text and observe the step-by-step processing through animated 3D visualizations.

## Architecture

### Frontend (React + Three.js)
- **Framework**: React 18 with Vite build system
- **3D Rendering**: Three.js with React Three Fiber
- **Animations**: React Spring for smooth transitions
- **UI Components**: Custom 3D interface components
- **API Client**: Axios for backend communication

### Backend (FastAPI + Transformers)
- **Framework**: FastAPI with automatic OpenAPI documentation
- **Model**: GPT-2 from Hugging Face Transformers
- **Processing**: PyTorch for model inference
- **Dimensionality Reduction**: Scikit-learn PCA for 3D visualization
- **CORS**: Configured for frontend integration

## Project Structure

```
l/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── AttentionLinks.jsx      # 3D attention line visualization
│   │   │   ├── AttentionView.jsx       # Interactive attention heatmap
│   │   │   ├── Embeddings3D.jsx        # 3D embedding vectors
│   │   │   ├── ErrorBoundary.jsx       # Error handling component
│   │   │   ├── LLMScene.jsx             # Three.js scene wrapper
│   │   │   ├── LLMStoryController.jsx   # Main navigation controller
│   │   │   ├── LoadingOverlay.jsx       # Loading state overlay
│   │   │   ├── SoftmaxView.jsx          # Probability distribution bars
│   │   │   └── TokenizationView.jsx     # Token flow visualization
│   │   ├── api.jsx           # API client functions
│   │   ├── App.jsx           # Main application component
│   │   ├── App.css           # Application styles
│   │   ├── index.css         # Global styles
│   │   └── main.jsx          # Application entry point
│   ├── public/               # Static assets
│   ├── package.json          # Dependencies and scripts
│   └── vite.config.js        # Vite configuration
├── backend/                  # FastAPI server
│   ├── app.py                # Main server application
│   └── requirements.txt      # Python dependencies
└── README.md                 # This file
```

## Installation and Setup

### Prerequisites
- **Node.js**: Version 18 or higher
- **Python**: Version 3.8 or higher
- **Git**: For cloning the repository

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a Python virtual environment:
```bash
# Windows
python -m venv llm_viz_env
llm_viz_env\Scripts\activate

# macOS/Linux
python -m venv llm_viz_env
source llm_viz_env/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Start the FastAPI server:
```bash
uvicorn app:app --reload --host localhost --port 8000
```

The backend will be available at `http://localhost:8000`
API documentation will be available at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Start both servers** (backend on port 8000, frontend on port 5173)

2. **Enter text** in the input field (default example provided)

3. **Click "Analyze"** or press `Ctrl+Enter` to process the text

4. **Navigate through visualizations** using the step buttons:
   - **Tokenization**: Watch text get broken into tokens with animated flow
   - **Embeddings**: Explore 3D vector representations
   - **Attention**: Examine attention weights between tokens
   - **Softmax**: View next token predictions

5. **Interactive controls**:
   - Mouse: Rotate and zoom the 3D scene
   - Layer controls: Navigate through different model layers (embeddings)
   - Head controls: Switch between attention heads (attention view)

## API Endpoints

The backend provides the following REST API endpoints:

### POST /tokenize
Tokenizes input text using GPT-2 tokenizer.

**Request Body:**
```json
{
  "text": "Your input text here"
}
```

**Response:**
```json
{
  "input_ids": [1234, 5678, ...],
  "tokens": ["token1", "token2", ...],
  "attention_mask": [1, 1, ...]
}
```

### POST /embeddings
Extracts hidden states and computes 3D embeddings.

**Request Body:**
```json
{
  "text": "Your input text here"
}
```

**Response:**
```json
{
  "num_layers": 12,
  "hidden_states": [...],
  "embeddings3d": [[x, y, z], ...]
}
```

### POST /attention
Extracts attention weights from all layers and heads.

**Request Body:**
```json
{
  "text": "Your input text here"
}
```

**Response:**
```json
{
  "num_layers": 12,
  "attentions": [[[[...]]]]
}
```

### POST /next_token
Predicts the next token with probability distribution.

**Request Body:**
```json
{
  "text": "Your input text here"
}
```

**Response:**
```json
{
  "token": "predicted",
  "token_id": 1234,
  "probability": 0.85,
  "probs": [{"token": "word", "prob": 0.85}, ...]
}
```

### GET /health
Health check endpoint for API status.

**Response:**
```json
{
  "status": "ok",
  "model": "gpt2"
}
```

