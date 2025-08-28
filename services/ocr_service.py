# data-science-service/app/services/ocr_service.py
import cv2
import numpy as np
import requests
from typing import List
from app.core.config import settings
from app.core.models import FoodItemPrediction, Macronutrients, Micronutrients

class OCRService:
    def __init__(self):
        # Placeholder for loading your OCR/Image Recognition model
        self.model = self._load_model()
        # Placeholder for a simplified nutritional database
        # This would ideally be a more comprehensive database, possibly external or a large local one.
        self.nutritional_db = {
            "rice": {"calories": 130, "protein": 2.7, "carbohydrates": 28.2, "fats": 0.3, "fiber": 0.4, "serving_size_g": 100},
            "dal": {"calories": 110, "protein": 9.0, "carbohydrates": 20.0, "fats": 0.5, "fiber": 8.0, "serving_size_g": 100},
            "roti": {"calories": 100, "protein": 3.0, "carbohydrates": 20.0, "fats": 1.5, "fiber": 2.0, "serving_size_g": 50},
            "chicken curry": {"calories": 250, "protein": 25.0, "carbohydrates": 10.0, "fats": 12.0, "fiber": 2.0, "serving_size_g": 150},
            "vegetable stir-fry": {"calories": 80, "protein": 3.0, "carbohydrates": 15.0, "fats": 1.0, "fiber": 4.0, "serving_size_g": 150},
            "samosa": {"calories": 260, "protein": 5.0, "carbohydrates": 30.0, "fats": 15.0, "fiber": 3.0, "serving_size_g": 100},
            "biryani": {"calories": 350, "protein": 15.0, "carbohydrates": 50.0, "fats": 10.0, "fiber": 3.0, "serving_size_g": 200},
            "paneer butter masala": {"calories": 300, "protein": 15.0, "carbohydrates": 15.0, "fats": 20.0, "fiber": 2.0, "serving_size_g": 150},
            "naan": {"calories": 280, "protein": 8.0, "carbohydrates": 50.0, "fats": 5.0, "fiber": 3.0, "serving_size_g": 100},
            "idli": {"calories": 60, "protein": 2.0, "carbohydrates": 12.0, "fats": 0.5, "fiber": 1.0, "serving_size_g": 50},
            "dosa": {"calories": 120, "protein": 4.0, "carbohydrates": 20.0, "fats": 3.0, "fiber": 2.0, "serving_size_g": 70},
            # Add more Indian food items and common global foods
        }

    def _load_model(self):
        """
        Loads the OCR and image recognition model.
        This is a placeholder. In a real app, you'd load your trained
        TensorFlow, PyTorch, or OpenCV-based model here.
        Consider using a pre-trained model like YOLO for object detection
        fine-tuned on food datasets, and Tesseract for text OCR if labels are present.
        """
        print(f"Loading OCR model from {settings.OCR_MODEL_PATH} (placeholder)...")
        # Example: model = cv2.dnn.readNetFromDarknet(cfg_path, weights_path)
        # For a practical example, you might use a simple image classification model
        # or a pre-trained object detection model.
        return {"name": "Dummy OCR Model", "version": "1.0"}

    async def _fetch_image(self, image_url: str) -> np.ndarray:
        """
        Fetches an image from a URL and converts it to an OpenCV format.
        """
        try:
            response = requests.get(image_url, stream=True, timeout=10) # Added timeout
            response.raise_for_status() # Raise an exception for bad status codes
            image_array = np.asarray(bytearray(response.content), dtype="uint8")
            image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            if image is None:
                raise ValueError("Could not decode image from URL content. Is it a valid image?")
            return image
        except requests.exceptions.Timeout:
            raise ValueError(f"Timeout occurred while fetching image from {image_url}")
        except requests.exceptions.RequestException as e:
            raise ValueError(f"Failed to fetch image from URL {image_url}: {e}")
        except Exception as e:
            raise ValueError(f"Error processing image from URL {image_url}: {e}")

    async def analyze_meal_photo(self, image_url: str, userId: str) -> List[FoodItemPrediction]:
        """
        Analyzes a meal photo using OCR and image recognition to identify food items
        and estimate nutritional values.
        """
        print(f"Analyzing meal photo for user {userId}: {image_url}")
        # In a real implementation, uncomment and use the fetched image:
        # try:
        #     image = await self._fetch_image(image_url)
        #     # Further image processing with actual ML model
        # except ValueError as e:
        #     print(f"Image fetch/decode error: {e}")
        #     # Fallback or raise error
        #     raise e

        # --- Placeholder for actual AI inference ---
        # This section simulates results for common Indian foods.
        # It's highly simplified. A real model would:
        # 1. Detect objects (food items) in the image.
        # 2. Classify each detected object.
        # 3. Estimate portion size (very complex, often relies on reference objects or depth sensing).
        # 4. Look up nutritional values based on classification and portion.

        # Simulate detecting a few common Indian food items.
        # The choice here is arbitrary; a real model would actually "see" the food.
        possible_food_names = list(self.nutritional_db.keys())
        detected_food_names = np.random.choice(possible_food_names, size=np.random.randint(1, 4), replace=False).tolist()

        predictions = []
        for food_name in detected_food_names:
            food_info = self.nutritional_db.get(food_name.lower())
            if food_info:
                # Simulate quantities and scale calories/macros
                # Portion estimation is a hard problem in computer vision.
                # For now, we assume a "standard serving" or slightly varied.
                serving_factor = np.random.uniform(0.8, 1.2) # Simulate slight variation in portion size
                quantity = f"{round(food_info['serving_size_g'] * serving_factor)}g (estimated)"
                
                calories = food_info["calories"] * serving_factor
                macros = Macronutrients(
                    protein=food_info["protein"] * serving_factor,
                    carbohydrates=food_info["carbohydrates"] * serving_factor,
                    fats=food_info["fats"] * serving_factor
                )
                micros = Micronutrients(
                    fiber=food_info.get("fiber", 0.0) * serving_factor,
                    sugar=food_info.get("sugar", 0.0) * serving_factor, # Assuming sugar might be in db
                    sodium=food_info.get("sodium", 0.0) * serving_factor # Assuming sodium might be in db
                )
                predictions.append(FoodItemPrediction(
                    name=food_name.replace('_', ' ').title(), # Format for display
                    quantity=quantity,
                    calories=round(calories, 1),
                    macronutrients=Macronutrients(
                        protein=round(macros.protein, 1),
                        carbohydrates=round(macros.carbohydrates, 1),
                        fats=round(macros.fats, 1)
                    ),
                    micronutrients=Micronutrients(
                        fiber=round(micros.fiber, 1),
                        sugar=round(micros.sugar, 1),
                        sodium=round(micros.sodium, 1)
                    )
                ))
            else:
                predictions.append(FoodItemPrediction(
                    name=f"Unknown Food ({food_name.replace('_', ' ').title()})",
                    quantity="1 serving",
                    calories=0,
                    macronutrients=Macronutrients(protein=0, carbohydrates=0, fats=0)
                ))

        if not predictions:
            raise ValueError("Could not detect any food items.")

        return predictions

# Initialize service globally
ocr_service = OCRService()
