# Development Guide

## Quick Start for Team Members

### Complete Setup (First Time)

1. **Clone the repository:**
```bash
git clone https://github.com/tremendous1712/l.git
cd l
```

2. **Set up the backend:**
```bash
cd backend

# Windows
setup.bat

# Unix/macOS
chmod +x setup.sh
./setup.sh
```

3. **Set up the frontend:**
```bash
cd ../frontend

# Windows
setup.bat

# Unix/macOS  
chmod +x setup.sh
./setup.sh
```

### Daily Development Workflow

1. **Start the backend server:**
```bash
cd backend
# Activate virtual environment first
# Windows: llm_viz_env\Scripts\activate
# Unix/macOS: source llm_viz_env/bin/activate
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

2. **Start the frontend server (in new terminal):**
```bash
cd frontend
npm run dev
```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Architecture Overview

### Data Flow
```
User Input → Frontend → Backend API → GPT-2 Model → Processing → 3D Visualization
```

### Component Hierarchy
```
App.jsx
└── LLMStoryController.jsx
    ├── TokenizationView.jsx
    ├── Embeddings3D.jsx
    ├── AttentionView.jsx
    └── SoftmaxView.jsx
```

## Key Development Areas

### Frontend Components

1. **TokenizationView.jsx**
   - Handles typing animation and token highlighting
   - Manages vertical flow visualization (Token → ID → Embedding)
   - Uses react-spring for smooth animations

2. **Embeddings3D.jsx**
   - Renders 3D vectors in space using Three.js
   - Implements PCA for dimensionality reduction
   - Sequential animation with color-coded vectors

3. **AttentionView.jsx**
   - Interactive heatmap tables for attention weights
   - Layer and head navigation controls
   - Positioned to avoid header overlap

4. **SoftmaxView.jsx**
   - 3D bar chart visualization of probabilities
   - Animated scaling effects
   - Top-10 token predictions

### Backend Endpoints

1. **POST /tokenize**
   - Tokenizes text using GPT-2 tokenizer
   - Returns cleaned tokens and input IDs
   - Removes duplicate tokens for cleaner display

2. **POST /embeddings**
   - Extracts hidden states from all layers
   - Applies PCA for 3D visualization
   - Returns both raw hidden states and 3D coordinates

3. **POST /attention**
   - Extracts attention weights from all layers and heads
   - Returns structured attention matrices
   - Used for heatmap visualization

4. **POST /next_token**
   - Predicts next token with probabilities
   - Returns top-10 predictions with percentages
   - Uses softmax for probability distribution

## Development Best Practices

### Frontend

1. **Component Structure:**
   - Add JSDoc comments for all props
   - Use React.memo for performance optimization
   - Implement proper error boundaries
   - Handle loading states gracefully

2. **3D Development:**
   - Dispose of Three.js objects properly
   - Use useFrame sparingly for performance
   - Implement proper scaling for different screen sizes
   - Test across different browsers and devices

3. **Animation Guidelines:**
   - Use react-spring for smooth transitions
   - Implement sequential animations with proper delays
   - Provide visual feedback for user interactions
   - Handle animation cleanup on component unmount

### Backend

1. **API Design:**
   - Include comprehensive error handling
   - Add proper docstrings for all endpoints
   - Validate input data with Pydantic models
   - Return consistent JSON structures

2. **Model Management:**
   - Load models once at startup
   - Handle model errors gracefully
   - Optimize for memory usage
   - Consider caching for repeated requests

## Common Issues and Solutions

### Frontend Issues

1. **3D Scene Not Rendering:**
   - Check WebGL support in browser
   - Verify Three.js version compatibility
   - Check for JavaScript errors in console

2. **Animation Performance:**
   - Reduce number of animated objects
   - Use React.memo for expensive components
   - Monitor frame rate during development

3. **API Connection Errors:**
   - Verify backend is running on correct port
   - Check CORS configuration
   - Ensure API endpoints are accessible

### Backend Issues

1. **Model Loading Errors:**
   - Check internet connection for model download
   - Verify sufficient disk space and memory
   - Ensure transformers library is properly installed

2. **Memory Issues:**
   - Monitor GPU/CPU usage during inference
   - Consider batch processing for large inputs
   - Implement proper cleanup of model outputs

## Testing Guidelines

### Frontend Testing
- Test all visualization components with various input lengths
- Verify 3D rendering across different browsers
- Check responsive design on different screen sizes
- Test keyboard shortcuts and user interactions

### Backend Testing
- Test all API endpoints with edge cases
- Verify model outputs for consistency
- Check error handling with invalid inputs
- Test concurrent requests for stability

### Integration Testing
- Test complete user workflows
- Verify data consistency across frontend and backend
- Check error propagation and user feedback
- Test with various text inputs and lengths

## Performance Optimization

### Frontend Optimization
- Use React.memo and useMemo appropriately
- Implement virtual scrolling for long token lists
- Optimize Three.js scene complexity
- Bundle size optimization with tree shaking

### Backend Optimization
- Cache model outputs when appropriate
- Optimize tensor operations
- Consider using GPU acceleration
- Implement request batching for efficiency

## Deployment Considerations

### Production Frontend
```bash
cd frontend
npm run build
# Serve dist/ folder with web server
```

### Production Backend
```bash
cd backend
pip install gunicorn
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Environment Variables
- Set API_BASE URL for different environments
- Configure CORS origins for production
- Set proper logging levels
- Handle model cache locations

## Contributing Workflow

1. **Create Feature Branch:**
```bash
git checkout -b feature/your-feature-name
```

2. **Development:**
   - Follow coding standards and documentation guidelines
   - Test thoroughly across components
   - Add appropriate error handling

3. **Testing:**
   - Test with various input texts
   - Verify 3D rendering performance
   - Check API integration

4. **Submit PR:**
   - Clear description of changes
   - Include screenshots for UI changes
   - Reference any related issues

## Useful Development Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
uvicorn app:app --reload                    # Development server
uvicorn app:app --host 0.0.0.0 --port 8000 # Production-like server
python -c "import torch; print(torch.cuda.is_available())"  # Check GPU
```

### Git Workflow
```bash
git status                    # Check file changes
git add .                     # Stage all changes
git commit -m "Description"   # Commit changes
git push origin branch-name   # Push to remote
```
