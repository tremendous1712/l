# LLM Visualization Tool

An interactive 3D visualization tool for understanding how Large Language Models (specifically GPT-2) process text through tokenization, embeddings, attention mechanisms, and next token prediction.

## Overview

This application provides an educational interface to explore the internal workings of transformer-based language models. Users can input text and observe the step-by-step processing through animated 3D visualizations.

## Features

### Tokenization Visualization
- Interactive typing animation of input text
- Inline token highlighting with color coding
- Vertical flow diagram showing: Token → Token ID → Embedding Vector
- Animated arrows connecting each stage
- Scrollable interface for long sequences
- Embedding vectors displayed as n×1 matrices

### 3D Embeddings Visualization
- Token embeddings rendered as vectors in 3D space
- Sequential animation showing token-to-token relationships
- Automatic PCA dimensionality reduction for visualization
- Color-coded vectors with coordinate system
- Dynamic scaling to maximize 3D space usage
- Origin-based vector positioning

### Attention Mechanism Visualization
- Interactive attention weight heatmaps
- Layer and head navigation controls
- Color-coded attention matrices
- Token-to-token attention relationships

### Softmax Prediction Visualization
- 3D bar chart of next token probabilities
- Animated probability bars with scaling
- Top-10 token predictions with percentages
- Highlighted predicted token

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
uvicorn app:app --reload --host 0.0.0.0 --port 8000
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

## Keyboard Shortcuts

- `Ctrl+Enter`: Analyze current text
- `Escape`: Reset application state

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

## Development

### Frontend Development

The frontend uses modern React patterns with functional components and hooks:

- **State Management**: React useState and useCallback hooks
- **3D Rendering**: React Three Fiber with drei helpers
- **Animations**: React Spring for smooth transitions
- **Error Handling**: Error boundaries for graceful failure handling
- **Performance**: Parallel API calls and optimized re-renders

Key development files:
- `src/App.jsx`: Main application state and API coordination
- `src/components/LLMStoryController.jsx`: Navigation and step management
- `src/api.jsx`: API client with error handling

### Backend Development

The backend uses FastAPI with async support and automatic documentation:

- **Model Loading**: GPT-2 loaded once at startup
- **Error Handling**: Comprehensive try-catch blocks
- **CORS**: Configured for frontend integration
- **Documentation**: Automatic OpenAPI/Swagger docs

Key development files:
- `app.py`: Main FastAPI application with all endpoints
- Model initialization with proper error handling
- PCA dimensionality reduction for 3D visualization

### Building for Production

#### Frontend Production Build
```bash
cd frontend
npm run build
```

#### Backend Production Deployment
```bash
cd backend
pip install gunicorn
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for frontend URL
2. **Model Loading**: GPT-2 model download may take time on first run
3. **Memory Issues**: Large texts may require more RAM for processing
4. **Port Conflicts**: Ensure ports 8000 and 5173 are available

### Error Handling

The application includes comprehensive error handling:
- **Network errors**: Automatic retry logic with user feedback
- **3D rendering errors**: Error boundaries prevent crashes
- **API errors**: Graceful degradation with error messages
- **Model errors**: Fallback responses for failed predictions

### Performance Optimization

- **Parallel API calls**: All endpoints called simultaneously
- **Efficient rendering**: React.memo and useMemo for expensive operations
- **Progressive loading**: Sequential animations to prevent overwhelming
- **Memory management**: Proper cleanup of 3D resources

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes with proper documentation
4. Test thoroughly with various input texts
5. Submit a pull request with clear description

### Development Guidelines

- Add JSDoc comments for all new functions
- Follow React best practices and hooks patterns
- Test 3D rendering across different devices
- Ensure responsive design for various screen sizes
- Maintain comprehensive error handling

## License

This project is open source and available under the MIT License.

## Acknowledgments

- **Hugging Face Transformers**: For the GPT-2 model and tokenizer
- **Three.js Community**: For 3D rendering capabilities
- **React Spring**: For smooth animation transitions
- **FastAPI**: For the high-performance backend framework
