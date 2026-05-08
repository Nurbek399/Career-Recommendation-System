import pandas as pd
import numpy as np
import re


def find_courses_by_skill(
    skill: str,
    all_courses: pd.DataFrame,
    top_n: int = 5
) -> list:
    '''Find courses related to a specific skill, ranked by relevance and quality.
    Relevance is determined by:
    1. Whether the skill appears in the title (especially in the first 40 characters).
    2. Whether the skill appears in the description.
    Quality is determined by a "fair score" that combines rating and number of reviews.'''
    
    skill_clean = skill.lower().replace('_', ' ')
    df = all_courses.copy()
    diff_map = {0: 'Beginner', 1: 'Intermediate', 2: 'Advanced'}

   
    df['rating'] = pd.to_numeric(df['rating'], errors='coerce').fillna(0)
    df['number_of_reviews'] = pd.to_numeric(df['number_of_reviews'], errors='coerce').fillna(0)
    
    df['_title_lower'] = df['title'].str.lower()
    df['_desc_lower'] = df['description'].astype(str).str.lower()
    
    safe_skill = re.escape(skill_clean)

    pattern = rf'(?<!\w){safe_skill}(?!\w)'

    mask_in_title = df['_title_lower'].str.contains(pattern, regex=True, na=False)
    mask_in_desc = df['_desc_lower'].str.contains(pattern, regex=True, na=False)
    
    combined_mask = mask_in_title | mask_in_desc
    df = df[combined_mask].copy()
    
    if df.empty:
        return []

    mask_in_title = mask_in_title[combined_mask]
    mask_in_desc = mask_in_desc[combined_mask]

    mask_level_1 = df['_title_lower'].str[:40].str.contains(skill_clean, regex=False, na=False)
    mask_level_2 = mask_in_title & ~mask_level_1
    mask_level_3 = mask_in_desc & ~mask_in_title

    conditions = [mask_level_1, mask_level_2, mask_level_3]
    df['match_level'] = np.select(conditions, [1, 2, 3], default=4)

    df['fair_score'] = df['rating'] * np.log1p(df['number_of_reviews'])


    df = df.sort_values(
        by=['match_level', 'fair_score'],
        ascending=[True, False]
    )

    df = df.drop_duplicates(subset=['title'], keep='first')
    df['difficulty_label'] = df['difficulty'].map(diff_map)
    df['difficulty_label'] = df['difficulty_label'].replace({pd.NA: None, float('nan'): None})
    results = []
    for _, row in df.head(top_n).iterrows():
        results.append({
            'title': row['title'],
            'platform': row['platform'],
            'rating': round(row['rating'], 2),
            'reviews': int(row['number_of_reviews']),
            'difficulty': row.get('difficulty_label'),
            'certificate': row.get('certificate'),
            'course_url': row.get('course_url')
        })

    return results



def get_roadmap_with_courses(
    roadmap: dict,
    all_courses: pd.DataFrame,
    top_n: int = 2
) -> dict:
    '''For each skill in the roadmap, find relevant courses and return a structured dictionary.'''
    result = {}
    for category, skills in roadmap.items():
        result[category] = {}
        for skill in skills:
            courses = find_courses_by_skill(
                skill, all_courses, top_n=top_n
            )
            result[category][skill] = {'courses': courses}
    return result