# data-science-service/app/services/nlp_service.py
import os
import pickle
from typing import List, Dict
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from collections import Counter
import re

from app.core.config import settings
from app.core.models import SentimentAnalysisResult

# Ensure NLTK data is downloaded (run this once on your local machine or in Dockerfile)
# import nltk
# nltk.download('vader_lexicon')
# nltk.download('punkt')
# nltk.download('stopwords')

class NLPService:
    def __init__(self):
        # Initialize VADER for sentiment analysis
        self.sid = SentimentIntensityAnalyzer()
        self.stop_words = set(stopwords.words('english'))
        # You would load a more sophisticated model here if needed
        # try:
        #     with open(settings.NLP_MODEL_PATH, 'rb') as f:
        #         self.model = pickle.load(f)
        #     print(f"NLP model loaded from {settings.NLP_MODEL_PATH}")
        # except FileNotFoundError:
        #     print(f"Warning: NLP model not found at {settings.NLP_MODEL_PATH}. Using fallback.")
        #     self.model = None # Fallback to rule-based or simple methods

    def analyze_sentiment(self, text: str) -> SentimentAnalysisResult:
        """
        Performs sentiment analysis on the given text using VADER.
        """
        scores = self.sid.polarity_scores(text)
        compound_score = scores['compound']

        if compound_score >= 0.05:
            overall_sentiment = "positive"
        elif compound_score <= -0.05:
            overall_sentiment = "negative"
        else:
            overall_sentiment = "neutral"

        # Simple keyword extraction
        words = word_tokenize(text.lower())
        filtered_words = [word for word in words if word.isalpha() and word not in self.stop_words]
        common_keywords = [word for word, count in Counter(filtered_words).most_common(5)]

        # Placeholder for topic extraction - in a real system, use more advanced NLP techniques
        topics = ["wellness", "daily reflection"]
        if "stress" in text.lower() or "anxiety" in text.lower():
            topics.append("mental health")
        if "goals" in text.lower() or "achieve" in text.lower():
            topics.append("personal growth")


        return SentimentAnalysisResult(
            overallSentiment=overall_sentiment,
            sentimentScore=compound_score,
            keywords=common_keywords,
            topics=topics
        )

    def estimate_stress_burnout(self, text: str, sentiment_score: float) -> Dict[str, float]:
        """
        Estimates stress and burnout levels based on text sentiment and keywords.
        This is a simplified rule-based example; a real system would use a trained ML model.
        """
        stress_keywords = ["stress", "anxiety", "overwhelmed", "tired", "pressure", "burnout", "exhausted", "deadline", "struggle"]
        burnout_keywords = ["drained", "no motivation", "cynical", "helpless", "frustrated", "depressed", "fatigue", "overwork"]

        text_lower = text.lower()
        stress_count = sum(1 for keyword in stress_keywords if keyword in text_lower)
        burnout_count = sum(1 for keyword in burnout_keywords if keyword in text_lower)

        # Simple linear scaling based on keyword counts and negative sentiment
        # More negative sentiment increases risk, more keywords also increase risk
        stress_level = min(100, stress_count * 8 + (1 - sentiment_score) * 15 + (1 - sentiment_score) * 10) # 0-1 score, 1 being negative
        burnout_risk = min(100, burnout_count * 12 + (1 - sentiment_score) * 20 + (1 - sentiment_score) * 15)

        # Clamp values between 0 and 100
        stress_level = max(0, min(100, stress_level))
        burnout_risk = max(0, min(100, burnout_risk))

        return {"stressLevel": round(stress_level, 2), "burnoutRisk": round(burnout_risk, 2)}

# Initialize service globally (or use FastAPI's dependency injection)
nlp_service = NLPService()
