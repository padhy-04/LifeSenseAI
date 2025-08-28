# data-science-service/app/api/endpoints/pose_detection.py
from fastapi import APIRouter, HTTPException, status
from app.core.models import PoseDetectionRequest, PoseDetectionResponse, ErrorResponse
from app.services.pose_service import pose_service

router = APIRouter()

@router.post("/pose-detection", response_model=PoseDetectionResponse, responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}})
async def analyze_pose_endpoint(request: PoseDetectionRequest):
    """
    Analyzes body posture and form from image data (e.g., from webcam stream).
    Provides real-time feedback for workouts.
    """
    try:
        analysis_result = pose_service.analyze_pose(request.imageData, request.userId, request.exerciseType)

        # In a real app, you might update the MongoDB Workout document with analysis results here
        # or have the Node.js backend handle the update.

        return PoseDetectionResponse(
            overallScore=analysis_result["overallScore"],
            feedback=analysis_result["feedback"],
            repetitionCount=analysis_result.get("repetitionCount")
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image data or processing error: {str(ve)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during pose detection: {str(e)}"
        )

