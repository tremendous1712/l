# LLM Visualization Frontend

React-based frontend application for interactive 3D visualization of Large Language Model processing stages.

## Overview

This is the frontend component of the LLM Visualization Tool, built with React 18, Three.js, and Vite. It provides an interactive 3D interface for exploring how GPT-2 processes text through tokenization, embeddings, attention, and prediction stages.

## Tech Stack

- **React 18**: Modern React with hooks and functional components
- **Three.js + React Three Fiber**: 3D rendering and scene management
- **React Spring**: Smooth animations and transitions
- **Vite**: Fast development build tool with HMR
- **Axios**: HTTP client for API communication
- **@react-three/drei**: Useful helpers for Three.js


## Development Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Key Components

### App.jsx
Main application component handling:
- State management for all API data
- Error handling with retry logic
- Keyboard shortcuts (Ctrl+Enter, Escape)
- Loading states and user feedback

### LLMStoryController.jsx
Navigation controller managing:
- Step-by-step visualization flow
- Layer selection for embeddings
- 3D scene rendering coordination

### TokenizationView.jsx
Animated tokenization visualization:
- Typing animation of input text
- Inline token highlighting
- Vertical flow: Token → ID → Embedding
- Scrollable interface for long sequences

### Embeddings3D.jsx
3D embedding space visualization:
- Sequential vector animation
- PCA dimensionality reduction
- Color-coded token vectors
- Interactive coordinate system

### AttentionView.jsx
Attention mechanism visualization:
- Interactive heatmap tables
- Layer and head navigation
- Color-coded attention weights

### SoftmaxView.jsx
Next token prediction visualization:
- Animated 3D probability bars
- Top-10 token predictions
- Probability percentages

## Configuration

### API Configuration
Update the API base URL in `src/api.jsx`:
```javascript
const API_BASE = "http://localhost:8000"; // Backend URL
```

### Vite Configuration
The `vite.config.js` file contains:
- React plugin configuration
- Development server settings
- Build optimization settings

## Development Guidelines

### Adding New Components
1. Create component file in `src/components/`
2. Add comprehensive JSDoc documentation
3. Include PropTypes or TypeScript interfaces
4. Handle error states gracefully
5. Use React.memo for performance optimization

### 3D Development
- Use React Three Fiber patterns
- Implement proper cleanup in useEffect
- Handle Three.js object disposal
- Test across different devices/browsers
- Optimize geometry and materials

### Animation Guidelines
- Use React Spring for smooth transitions
- Implement loading states for long animations
- Provide user control over animation speed
- Handle animation cleanup on component unmount

## API Integration

The frontend communicates with the FastAPI backend through these endpoints:

- `POST /tokenize` - Get tokenization data
- `POST /embeddings` - Get embedding vectors
- `POST /attention` - Get attention weights
- `POST /next_token` - Get next token predictions
- `GET /health` - Backend health check


