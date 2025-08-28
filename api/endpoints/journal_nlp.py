# data-science-service/app/api/endpoints/journal_nlp.py
from fastapi import APIRouter, HTTPException, status
from app.core.models import JournalNLPRequest, JournalNLPResponse, ErrorResponse
from app.services.nlp_service import nlp_service

router = APIRouter()

@router.post("/journal-nlp", response_model=JournalNLPResponse, responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}})
async def analyze_journal_entry_endpoint(request: JournalNLPRequest):
    """
    Performs NLP analysis on a journal entry to detect mood, stress, and burnout risk.
    """
    try:
        sentiment_result = nlp_service.analyze_sentiment(request.journalText)
        stress_burnout_estimates = nlp_service.estimate_stress_burnout(request.journalText, sentiment_result.sentimentScore)

        # In a real app, you might also update the MongoDB JournalEntry document here
        # or have the Node.js backend handle the update after receiving this response.

        return JournalNLPResponse(
            sentimentAnalysis=sentiment_result,
            stressLevel=stress_burnout_estimates["stressLevel"],
            burnoutRisk=stress_burnout_estimates["burnoutRisk"],
            recoverySuggestions=["Practice deep breathing for 5 minutes", "Take a short walk", "Connect with a friend"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during journal NLP analysis: {str(e)}"
        )

