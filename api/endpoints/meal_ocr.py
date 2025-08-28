# data-science-service/app/api/endpoints/meal_ocr.py
from fastapi import APIRouter, HTTPException, status
from app.core.models import MealOCRRequest, MealOCRResponse, ErrorResponse
from app.services.ocr_service import ocr_service

router = APIRouter()

@router.post("/meal-ocr", response_model=MealOCRResponse, responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}})
async def analyze_meal_photo_endpoint(request: MealOCRRequest):
    """
    Analyzes a meal photo using OCR and image recognition.
    Identifies food items and estimates nutritional content.
    """
    try:
        # Pass the request data to the OCR service for analysis
        food_predictions = await ocr_service.analyze_meal_photo(request.imageUrl, request.userId)

        if not food_predictions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No food items detected in the image or no data found in database for detected items."
            )

        total_calories = sum(item.calories for item in food_predictions)

        # In a real app, you might also trigger an update to the MongoDB MealEntry document here
        # or have the Node.js backend handle the update after receiving this response.

        return MealOCRResponse(
            totalCalories=total_calories,
            estimatedFoods=food_predictions,
            accuracyScore=0.85 # Example accuracy score
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid input or image processing error: {str(ve)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during meal photo analysis: {str(e)}"
        )

