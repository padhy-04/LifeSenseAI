import pickle
from sklearn.linear_model import LogisticRegression
import os

model_dir = "models"
model_path = os.path.join(model_dir, "nlp_sentiment_model.pkl")

os.makedirs(model_dir, exist_ok=True)

dummy_model = LogisticRegression(random_state=42)

try:
    with open(model_path, 'wb') as f:
        pickle.dump(dummy_model, f)
    print(f"Dummy NLP sentiment model saved to {model_path}")
except Exception as e:
    print(f"Error saving dummy NLP model: {e}")

