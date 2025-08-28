
import torch
import torch.nn as nn
import os

# Define the path where the model should be saved
model_dir = "models"
model_path = os.path.join(model_dir, "ai_coach_llm_model.pth")


os.makedirs(model_dir, exist_ok=True)



class DummyLLM(nn.Module):
    def __init__(self, vocab_size=1000, embed_dim=64, hidden_dim=128):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.rnn = nn.LSTM(embed_dim, hidden_dim, batch_first=True)
        self.fc = nn.Linear(hidden_dim, vocab_size)

    def forward(self, x):
        # x would be token IDs
        embedded = self.embedding(x)
        output, _ = self.rnn(embedded)
        # For simplicity, just take the last output or average
        return self.fc(output[:, -1, :])

dummy_model = DummyLLM()


try:
    torch.save(dummy_model.state_dict(), model_path)
    print(f"Dummy AI Coach LLM model saved to {model_path}")
except Exception as e:
    print(f"Error saving dummy LLM model: {e}")

