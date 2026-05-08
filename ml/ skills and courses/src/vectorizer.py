from skills_taxonomy import PROFESSION_CATEGORIES, STOP_WORDS,  normalize_skill
from sklearn.feature_extraction.text import TfidfVectorizer, cosine_similarity

def get_skill_scores(
    student_raw_skills: list,
    vectorizer: TfidfVectorizer,
    profession_vectors,
    profession_names: list,
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
        return {name: 0.0 for name in profession_names}

    student_doc = " ".join(student_skills)

    student_vector = vectorizer.transform([student_doc]) 

    scores = cosine_similarity(student_vector, profession_vectors)[0]

    return dict(sorted(
        zip(profession_names, scores.tolist()),
        key=lambda x: x[1],
        reverse=True
    ))