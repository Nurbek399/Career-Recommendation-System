import joblib
from sklearn.metrics.pairwise import cosine_similarity
from config import VECTORIZER_PATH, PROFESSION_VECTORS_PATH, PROFESSION_NAMES_PATH
from skills_taxonomy import normalize_skill, STOP_WORDS

class SkillMatcherService:
    def __init__(self):
        with open(VECTORIZER_PATH, 'rb') as f:
            self.vectorizer = joblib.load(f)
        with open(PROFESSION_VECTORS_PATH, 'rb') as f:
            self.profession_vectors = joblib.load(f)
        with open(PROFESSION_NAMES_PATH, 'rb') as f:
            self.profession_names = joblib.load(f)

    def get_scores(self,
    student_raw_skills: list[str]
    ) -> dict:
        """
        Calculates cosine similarity between student skills and profession profiles.
        """
        student_skills = set()
        for raw in student_raw_skills:
            normalized = normalize_skill(raw)
            if normalized and normalized not in STOP_WORDS:
                student_skills.add(normalized)
                
        if not student_skills:
            return {name: 0.0 for name in self.profession_names}

        student_doc = " ".join(student_skills)

        student_vector = self.vectorizer.transform([student_doc]) 

        scores = cosine_similarity(student_vector, self.profession_vectors)[0]

        return dict(sorted(
            zip(self.profession_names, scores.tolist()),
            key=lambda x: x[1],
            reverse=True
        ))