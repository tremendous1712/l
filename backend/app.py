from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # ✅ CORS
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModel
import torch

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
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModel.from_pretrained("bert-base-uncased", output_hidden_states=True, output_attentions=True)
model.eval()

class TextInput(BaseModel):
    text: str

@app.post("/tokenize")
def tokenize_text(input: TextInput):
    inputs = tokenizer(input.text, return_tensors="pt")
    tokens = tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])
    return {
        "input_ids": inputs["input_ids"].tolist(),
        "tokens": tokens,
        "attention_mask": inputs["attention_mask"].tolist()
    }

@app.post("/attention")
def get_attention(input: TextInput):
    inputs = tokenizer(input.text, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    attentions = outputs.attentions
    attentions_data = [layer.squeeze(0).tolist() for layer in attentions]
    return {
        "num_layers": len(attentions_data),
        "attentions": attentions_data
    }

@app.post("/embeddings")
def get_embeddings(input: TextInput):
    inputs = tokenizer(input.text, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    hidden_states = outputs.hidden_states
    hidden_states_data = [layer.squeeze(0).tolist() for layer in hidden_states]
    return {
        "num_layers": len(hidden_states_data),
        "hidden_states": hidden_states_data
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "model": "bert-base-uncased"}
