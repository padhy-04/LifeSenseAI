# data-science-service/create_ocr_model.py
import torch
import torch.nn as nn
import os

model_dir = "models"
model_path = os.path.join(model_dir, "ocr_meal_recognition_model.pth")

os.makedirs(model_dir, exist_ok=True)

class DummyOCRModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv = nn.Conv2d(3, 16, kernel_size=3, padding=1)
        self.relu = nn.ReLU()
        self.pool = nn.AdaptiveAvgPool2d((1, 1)) # Global average pooling
        self.fc = nn.Linear(16, 5) # 5 dummy output classes

    def forward(self, x):
        x = self.pool(self.relu(self.conv(x)))
        x = x.view(x.size(0), -1) # Flatten
        return self.fc(x)

dummy_model = DummyOCRModel()

try:
    torch.save(dummy_model.state_dict(), model_path)
    print(f"Dummy OCR meal recognition model saved to {model_path}")
except Exception as e:
    print(f"Error saving dummy OCR model: {e}")

