from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # ✅ CORS
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModel
import torch
from sklearn.decomposition import PCA
import numpy as np


app = FastAPI()

# ✅ Allow frontend (React @ localhost:5173) to make API calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or use ["http://localhost:5173"] for stricter setup
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load tokenizer and model (BERT)
try:
    tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
    model = AutoModel.from_pretrained("bert-base-uncased", output_hidden_states=True, output_attentions=True)
    model.eval()
except Exception as e:
    print("Model/tokenizer load error:", e)
    tokenizer = None
    model = None


class TextInput(BaseModel):
    text: str


@app.post("/tokenize")
def tokenize_text(input: TextInput):
    if tokenizer is None:
        print("/tokenize error: tokenizer not loaded")
        return {"input_ids": [], "tokens": [], "attention_mask": []}
    try:
        inputs = tokenizer(input.text, return_tensors="pt")
        tokens = tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])
        return {
            "input_ids": inputs["input_ids"].tolist(),
            "tokens": tokens,
            "attention_mask": inputs["attention_mask"].tolist()
        }
    except Exception as e:
        print("/tokenize error:", e)
        return {"input_ids": [], "tokens": [], "attention_mask": []}

@app.post("/next_token")
def next_token_prediction(input: TextInput):
    if tokenizer is None or model is None:
        print("/next_token error: model/tokenizer not loaded")
        return {"token": "", "token_id": -1, "probability": 0.0}
    try:
        inputs = tokenizer(input.text, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
            if hasattr(model, 'cls'):
                logits = model.cls(outputs.last_hidden_state)
            else:
                logits = outputs.last_hidden_state[:, -1, :]
            if logits.dim() == 3:
                logits = logits[:, -1, :]
            probs = torch.softmax(logits, dim=-1)
            top_prob, top_idx = torch.max(probs, dim=-1)
            token_id = top_idx.item() if hasattr(top_idx, 'item') else int(top_idx)
            token = tokenizer.convert_ids_to_tokens([token_id])[0]
            probability = float(top_prob.item()) if hasattr(top_prob, 'item') else float(top_prob)
        return {
            "token": token,
            "token_id": token_id,
            "probability": probability
        }
    except Exception as e:
        print("/next_token error:", e)
        return {"token": "", "token_id": -1, "probability": 0.0}

@app.post("/attention")
def get_attention(input: TextInput):
    if tokenizer is None or model is None:
        print("/attention error: model/tokenizer not loaded")
        return {"num_layers": 0, "attentions": []}
    try:
        inputs = tokenizer(input.text, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
        attentions = outputs.attentions
        attentions_data = [layer.squeeze(0).tolist() for layer in attentions]
        return {
            "num_layers": len(attentions_data),
            "attentions": attentions_data
        }
    except Exception as e:
        print("/attention error:", e)
        return {"num_layers": 0, "attentions": []}

@app.post("/embeddings")
def get_embeddings(input: TextInput):
    if tokenizer is None or model is None:
        print("/embeddings error: model/tokenizer not loaded")
        return {"num_layers": 0, "hidden_states": [], "embeddings3d": []}
    try:
        inputs = tokenizer(input.text, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
        hidden_states = outputs.hidden_states
        hidden_states_data = [layer.squeeze(0).tolist() for layer in hidden_states]
        # embeddings3d: PCA of last hidden state (for visualization)
        embeddings3d = []
        try:
            last_hidden = hidden_states[-1].squeeze(0).cpu().numpy()  # [seq_len, hidden_dim]
            pca = PCA(n_components=3)
            embeddings3d = pca.fit_transform(last_hidden).tolist()
        except Exception as e:
            print("PCA error:", e)
            embeddings3d = []
        return {
            "num_layers": len(hidden_states_data),
            "hidden_states": hidden_states_data,
            "embeddings3d": embeddings3d
        }
    except Exception as e:
        print("/embeddings error:", e)
        return {"num_layers": 0, "hidden_states": [], "embeddings3d": []}

@app.get("/health")
def health_check():
    return {"status": "ok", "model": "bert-base-uncased"}
