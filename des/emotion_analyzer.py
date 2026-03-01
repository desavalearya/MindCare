# emotion_analyzer.py

from transformers import pipeline
from collections import defaultdict

class EmotionAnalyzer:
    """
    This class encapsulates the three Hugging Face models 
    for detailed emotion analysis.
    """
    def __init__(self):
        print("Loading emotion analysis models...")
        # These models will be downloaded and cached on the first run.
        self.sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
        self.emotion_roberta = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", return_all_scores=True)
        self.go_emotions = pipeline("text-classification", model="SamLowe/roberta-base-go_emotions", return_all_scores=True)
        print("Emotion models loaded successfully!")

    def analyze(self, text):
        """
        Analyzes the text using all three models.
        Includes truncation=True to handle long text inputs.
        """
        results = {}
        results["sentiment"] = self.sentiment_pipeline(text, truncation=True)[0]
        results["roberta_emotion"] = {emo["label"]: emo["score"] for emo in self.emotion_roberta(text, truncation=True)[0]}
        results["go_emotions"] = {emo["label"]: emo["score"] for emo in self.go_emotions(text, truncation=True)[0]}
        return results

    def synthesize_emotions(self, analysis_results, top_n=5):
        """
        Combines and averages the scores from the models to get the top N emotions.
        """
        combined_scores = defaultdict(list)
        # A mapping to standardize emotion labels across different models
        emotion_mapping = {
            'happiness': 'joy', 'joy': 'joy', 'sadness': 'sadness', 'anger': 'anger', 'angry': 'anger', 'fear': 'fear',
            'surprise': 'surprise', 'surprised': 'surprise', 'disgust': 'disgust', 'love': 'love', 'admiration': 'admiration',
            'amusement': 'amusement', 'caring': 'caring', 'curiosity': 'curiosity', 'desire': 'desire', 'excitement': 'excitement',
            'gratitude': 'gratitude', 'nervousness': 'nervousness', 'optimism': 'optimism', 'pride': 'pride',
            'realization': 'realization', 'relief': 'relief', 'remorse': 'remorse', 'annoyance': 'annoyance',
            'approval': 'approval', 'confusion': 'confusion', 'disappointment': 'disappointment',
            'disapproval': 'disapproval', 'embarrassment': 'embarrassment', 'grief': 'grief', 'neutral': 'neutral'
        }
        
        sources = ['roberta_emotion', 'go_emotions']
        for source in sources:
            if source in analysis_results:
                for label, score in analysis_results[source].items():
                    standard_label = emotion_mapping.get(label.lower(), label.lower())
                    combined_scores[standard_label].append(score)

        averaged_scores = {label: sum(scores) / len(scores) for label, scores in combined_scores.items() if scores}
        sorted_emotions = sorted(averaged_scores.items(), key=lambda item: item[1], reverse=True)
        return dict(sorted_emotions[:top_n])