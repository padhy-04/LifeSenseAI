import torch
import torch.nn as nn
import os

model_dir = "models"
model_path = os.path.join(model_dir, "pose_estimation_model.pth")

os.makedirs(model_dir, exist_ok=True)


class DummyPoseModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.feature_extractor = nn.Conv2d(3, 32, kernel_size=3, padding=1)
        self.keypoint_regressor = nn.Linear(32 * 1 * 1, 17 * 2) # 17 keypoints (x,y)
        self.pool = nn.AdaptiveAvgPool2d((1, 1)) # Global average pooling

    def forward(self, x):
        x = self.pool(self.feature_extractor(x))
        x = x.view(x.size(0), -1) # Flatten
        return self.keypoint_regressor(x) 

dummy_model = DummyPoseModel()

try:
    torch.save(dummy_model.state_dict(), model_path)
    print(f"Dummy Pose Estimation model saved to {model_path}")
except Exception as e:
    print(f"Error saving dummy Pose Estimation model: {e}")

