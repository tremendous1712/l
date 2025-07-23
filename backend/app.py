"""
FastAPI backend for LLM visualization

Provides REST API endpoints for GPT-2 model analysis including:
- Text tokenization
- Embedding extraction
- Attention weight computation
- Next token prediction

Uses transformers library with GPT-2 model and sklearn for PCA.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # ✅ CORS
from pydantic import BaseModel
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch

from sklearn.decomposition import PCA
import numpy as np
from transformer_lens import HookedTransformer


app = FastAPI(title="LLM Visualization API", version="1.0.0")

# ✅ Allow frontend (React @ localhost:5173) to make API calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or use ["http://localhost:5173"] for stricter setup
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load tokenizer and model (GPT-2)
try:
    tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
    model = GPT2LMHeadModel.from_pretrained("gpt2", output_hidden_states=True, output_attentions=True)
    model.eval()
    # GPT-2 tokenizer doesn't have a pad token by default
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
except Exception as e:
    print("Model/tokenizer load error:", e)
    tokenizer = None
    model = None

# Load TransformerLens model for residual stream
try:
    tl_model = HookedTransformer.from_pretrained("gpt2-small", device="cpu")
except Exception as e:
    print("TransformerLens load error:", e)
    tl_model = None


class TextInput(BaseModel):
    """Request model for text input endpoints"""
    text: str

class EmbeddingInput(BaseModel):
    """Request model for embedding endpoints with layer specification"""
    text: str
    layer: int = 0  # Default to layer 0

class NextTokenInput(BaseModel):
    """Request model for next token and added temperature"""
    text: str
    temperature: float = 1.0  # Default to temp 1


@app.post("/tokenize")
def tokenize_text(input: TextInput):
    """
    Tokenize input text using GPT-2 tokenizer
    
    Args:
        input: TextInput object containing text to tokenize
        
    Returns:
        dict: Contains input_ids, cleaned tokens, and attention_mask
    """
    if tokenizer is None:
        print("/tokenize error: tokenizer not loaded")
        return {"input_ids": [], "tokens": [], "attention_mask": []}
    try:
        inputs = tokenizer(input.text, return_tensors="pt", add_special_tokens=True)
        raw_tokens = tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])
        input_ids = inputs["input_ids"][0].tolist()
        
        # Clean up tokens for better display and remove duplicates
        cleaned_tokens = []
        seen_tokens = set()
        
        for token in raw_tokens:
            # Clean the token
            if token.startswith('Ġ'):
                clean_token = ' ' + token[1:]
            else:
                clean_token = token
            
            # Only add if we haven't seen this exact token before
            if clean_token not in seen_tokens:
                cleaned_tokens.append(clean_token)
                seen_tokens.add(clean_token)
        
        return {
            "input_ids": input_ids,
            "tokens": cleaned_tokens,
            "attention_mask": inputs["attention_mask"].tolist()
        }
    except Exception as e:
        print("/tokenize error:", e)
        return {"input_ids": [], "tokens": [], "attention_mask": []}

@app.post("/next_token")
def next_token_prediction(input: NextTokenInput):
    """
    Predict next token using GPT-2 model
    
    Args:
        input: TextInput object containing text for prediction
        
    Returns:
        dict: Contains predicted token, token_id, probability, and top 10 probabilities
    """
    if tokenizer is None or model is None:
        print("/next_token error: model/tokenizer not loaded")
        return {"token": "", "token_id": -1, "probability": 0.0, "probs": []}
    try:
        # Tokenize input text
        inputs = tokenizer.encode(input.text, return_tensors="pt")
        
        with torch.no_grad():
            # Get model outputs
            outputs = model(inputs)
            logits = outputs.logits
            
            # Get the logits for the last token (next token prediction)
            next_token_logits = logits[0, -1, :]
             
            # Apply temperature scaling

            temperature = max(input.temperature, 1e-6)
            next_token_logits = next_token_logits / temperature
            top_logits, top_indices = torch.topk(next_token_logits, k=10, dim=-1)
            
            probs = torch.softmax(top_logits, dim=-1)
            top_tokens = [tokenizer.decode([idx.item()]) for idx in top_indices]
            top_probs_list = probs.tolist()
            probs_list = [{"token": token.strip(), "prob": prob} for token, prob in zip(top_tokens, top_probs_list)]
           
            # Random sampling instead of greedy selection
            sampled_idx = torch.multinomial(probs, num_samples=1).item()
            token = top_tokens[sampled_idx].strip()
            token_id = top_indices[sampled_idx].item()
            probability = top_probs_list[sampled_idx]

        return {
            "token": token,
            "token_id": token_id,
            "probability": probability,
            "probs": probs_list
        }
    except Exception as e:
        print("/next_token error:", e)
        return {"token": "", "token_id": -1, "probability": 0.0, "probs": []}



@app.post("/residual_stream")
def get_residual_stream(input: TextInput):
    """Get residual stream norms using TransformerLens"""
    if tl_model is None:
        return {"layer_values": [], "tokens": [], "num_layers": 0}
    try:
        # 1. Tokenize input
        tokens = tl_model.to_str_tokens(input.text)
        input_ids = tl_model.to_tokens(input.text)

        # 2. Run model with cache
        _, cache = tl_model.run_with_cache(input_ids)

        # 3. Extract residual norms
        layer_values = []
        num_layers = tl_model.cfg.n_layers

        for token_idx in range(input_ids.shape[1]):
            token_vals = []
            for layer in range(num_layers + 1):  # +1 for embedding layer
                resid_key = f"blocks.{layer}.hook_resid_post" if layer < num_layers else "hook_embed"
                resid = cache[resid_key][0, token_idx]
                token_vals.append(torch.norm(resid).item())
            layer_values.append(token_vals)

        # 4. Clean tokens (remove special tokens)
        clean_tokens = []
        clean_values = []
        for token, vals in zip(tokens, layer_values):
            if token not in ["<|endoftext|>"]:
                clean_tokens.append(token.replace("Ġ", " "))
                clean_values.append(vals)

        return {
            "layer_values": clean_values,
            "tokens": clean_tokens,
            "num_layers": num_layers + 1
        }
    except Exception as e:
        print(f"Residual stream error: {str(e)}")
        return {"layer_values": [], "tokens": [], "num_layers": 0}


@app.post("/attention")
def get_attention(input: TextInput):
    """
    Extract attention weights from GPT-2 model
    
    Args:
        input: TextInput object containing text to analyze
        
    Returns:
        dict: Contains number of layers and attention matrices for all layers/heads
    """
    if tokenizer is None or model is None:
        print("/attention error: model/tokenizer not loaded")
        return {"num_layers": 0, "attentions": []}
    try:
        inputs = tokenizer(input.text, return_tensors="pt", add_special_tokens=True)
        with torch.no_grad():
            outputs = model(**inputs)
        attentions = outputs.attentions if hasattr(outputs, 'attentions') else []
        attentions_data = [layer.squeeze(0).tolist() for layer in attentions] if attentions else []
        return {
            "num_layers": len(attentions_data),
            "attentions": attentions_data
        }
    except Exception as e:
        print("/attention error:", e)
        return {"num_layers": 0, "attentions": []}

@app.post("/embeddings")
def get_embeddings(input: EmbeddingInput):
    """
    Extract hidden states and return embeddings from a specific layer
    
    Args:
        input: EmbeddingInput object containing text and layer number
        
    Returns:
        dict: Contains embeddings from the specified layer
    """
    if tokenizer is None or model is None:
        print("/embeddings error: model/tokenizer not loaded")
        return {"embeddings": [], "layer": input.layer}
    
    try:
        inputs = tokenizer(input.text, return_tensors="pt", add_special_tokens=True)
        with torch.no_grad():
            outputs = model(**inputs)
        
        hidden_states = outputs.hidden_states if hasattr(outputs, 'hidden_states') else []
        
        if not hidden_states:
            return {"embeddings": [], "layer": input.layer}
        
        # Get the specified layer (clamp to valid range)
        layer_idx = max(0, min(input.layer, len(hidden_states) - 1))
        layer_embeddings = hidden_states[layer_idx].squeeze(0).tolist()  # [seq_len, hidden_dim]
        
        print(f"✅ Returning embeddings for layer {layer_idx}, shape: {len(layer_embeddings)} tokens")
        
        return {
            "embeddings": layer_embeddings,
            "layer": layer_idx,
            "num_tokens": len(layer_embeddings),
            "embedding_dim": len(layer_embeddings[0]) if layer_embeddings else 0
        }
        
    except Exception as e:
        print("/embeddings error:", e)
        return {"embeddings": [], "layer": input.layer}

@app.post("/embeddings_all")
def get_all_embeddings(input: TextInput):
    """
    Extract hidden states and compute 3D embeddings using PCA from all layers
    
    Args:
        input: TextInput object containing text to analyze
        
    Returns:
        dict: Contains hidden states from all layers and 3D PCA embeddings
    """
    if tokenizer is None or model is None:
        print("/embeddings_all error: model/tokenizer not loaded")
        return {"num_layers": 0, "hidden_states": [], "embeddings3d": []}
    try:
        inputs = tokenizer(input.text, return_tensors="pt", add_special_tokens=True)
        with torch.no_grad():
            outputs = model(**inputs)
        hidden_states = outputs.hidden_states if hasattr(outputs, 'hidden_states') else []
        hidden_states_data = [layer.squeeze(0).tolist() for layer in hidden_states] if hidden_states else []
        # embeddings3d: PCA of last hidden state (for visualization)
        embeddings3d = []
        if hidden_states_data and len(hidden_states_data[-1]) > 0:
            try:
                last_hidden = np.array(hidden_states_data[-1])  # [seq_len, hidden_dim]
                if last_hidden.shape[1] >= 3:
                    pca = PCA(n_components=3)
                    embeddings3d = pca.fit_transform(last_hidden).tolist()
            except Exception as e:
                print("PCA error:", e)
                embeddings3d = []
        # Always return all keys, even if empty
        return {
            "num_layers": len(hidden_states_data),
            "hidden_states": hidden_states_data,
            "embeddings3d": embeddings3d if isinstance(embeddings3d, list) else []
        }
    except Exception as e:
        print("/embeddings_all error:", e)
        return {"num_layers": 0, "hidden_states": [], "embeddings3d": []}

@app.get("/health")
def health_check():
    """Health check endpoint for API status"""
    return {"status": "ok", "model": "gpt2"}
