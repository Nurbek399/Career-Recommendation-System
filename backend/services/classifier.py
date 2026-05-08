import joblib
import json
from catboost import CatBoostClassifier
import pandas as pd
from features import classification_features
from config import CLASSIFIER_PATH, PREPROCESSOR_PATH_CLASSIFIER, CLASS_NAMES
from utils.python_types import to_python_types

class ClassifierService:
    def __init__(self):
        '''Load the pre-trained classifier model and its associated preprocessor from disk.'''
        self.model = joblib.load(CLASSIFIER_PATH)
        self.preprocessor = joblib.load(PREPROCESSOR_PATH_CLASSIFIER) 

    def get_scores(self, profile: dict) -> dict:
        '''Given a student's profile, preprocess the data, run it through the classifier model, and return a dictionary of profession probabilities sorted in descending order.'''
        X = pd.DataFrame([profile])
        X = classification_features(X)
        X_processed = self.preprocessor.transform(X)

        feature_names = self.preprocessor.get_feature_names_out()
        X_df = pd.DataFrame(X_processed, columns=feature_names)

        probs = self.model.predict_proba(X_df)[0]

        return to_python_types(dict(sorted(
            zip(CLASS_NAMES, probs.tolist()),
            key=lambda x: x[1],
            reverse=True
        )))