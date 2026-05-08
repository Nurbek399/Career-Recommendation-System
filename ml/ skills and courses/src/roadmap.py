"""
roadmap_engine.py
=================
Two main functions of the recommendation system:

  1. build_profession_profile(df, profession, top_n)
     → Builds a "reference" profile of a profession from a dataframe of job postings.

  2. generate_roadmap(profession, student_raw_skills, profession_profile)
     → Compares the student with the profile and returns a personal roadmap.

Dependencies from skill_taxonomy.py:
  STOP_WORDS, SYNONYMS, FRAMEWORK_LANGUAGE_MAP,
  MUTUALLY_EXCLUSIVE_CLUSTERS, PROFESSION_CATEGORIES,
  normalize_skill, infer_languages
"""

import ast
from collections import defaultdict, Counter
import pandas as pd

# ── import from taxonomy module ────────────────────────────────────────────
from skills_taxonomy import (
    STOP_WORDS,
    SYNONYMS,
    FRAMEWORK_LANGUAGE_MAP,
    MUTUALLY_EXCLUSIVE_CLUSTERS,
    normalize_skill,
    infer_languages,
)

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGS (placed here — edit in one place)
# ─────────────────────────────────────────────────────────────────────────────

# For each profession — categories that will be included in the roadmap
PROFESSION_CATEGORIES = {
    'Data Scientist': [
        'programming', 'libraries', 'databases', 'cloud', 'other'
    ],
    'Data Analyst': [
        'programming', 'analyst_tools', 'databases'
    ],
    'Data Engineer': [
        'programming', 'databases', 'cloud', 'other', 'libraries'
    ],
    'Business Analyst': [
        'programming', 'analyst_tools', 'databases'
    ],
    'Machine Learning Engineer': [
        'programming', 'libraries', 'cloud', 'other'
    ],
    'Software Engineer': [
        'programming', 'webframeworks', 'databases', 'cloud', 'other'
    ],
    'Cloud Engineer': [
        'programming', 'cloud', 'other', 'databases'
    ],
}

# How many skills to display in the roadmap for each category
CATEGORY_LIMITS: dict[str, int] = {
    "programming":    2,
    "webframeworks":  1,
    "databases":      2,
    "libraries":      4,   # libraries — allow more
    "cloud":          1,
    "analyst_tools":  1,
    "other":          2,
    "default":        2,   # fallback for unknown categories
}

# Convert MUTUALLY_EXCLUSIVE_CLUSTERS (list of dicts) into a list of lists of skills —
# a format convenient for quick lookup within select_top().
_EXCLUSIVE_GROUPS: list[list[str]] = [
    c["skills"] for c in MUTUALLY_EXCLUSIVE_CLUSTERS
]


# =============================================================================
# FUNCTION 1 — build_profession_profile
# =============================================================================

def build_profession_profile(
    df,
    profession: str,
    top_n: int = 5,
    data_col: str = "job_posted_date",
) -> dict[str, list[str]]:
    """
    Builds a "reference" profile of a profession: top-N skills for each category,
    extracted from job postings in the dataframe.
    
    ✨ NEW: more recent job postings have greater weight.

    Parameters
    ---------
    df          : pd.DataFrame with columns 'job_title_unified', 'job_type_skills' and 'date_posted'
    profession  : string — profession name
    top_n       : how many skills to keep per category

    Returns
    ----------
    dict  cat → [skill1, skill2, ...]   (already normalized, filtered)
    """

    # ── 0. Calculate job posting weights by date ────────────────────────────────
    #    Assume df has a 'date_posted' column (datetime type)
    
    profession_df = df[df["job_title_unified"] == profession].copy()
    
    # If there is date_posted, use experiential time weighting
    
    df[data_col] = pd.to_datetime(df[data_col], errors='coerce')
    profession_df[data_col] = pd.to_datetime(profession_df[data_col], errors='coerce')
    max_date = profession_df[data_col].max()
    min_date = profession_df[data_col].min()
    
    # Дни от самой старой вакансии к самой новой
    days_span = (max_date - min_date).days
    if days_span > 0:
        # Weight from 0.5 (old) to 2.0 (fresh)
        profession_df['time_weight'] = 0.5 + 1.5 * (
            (profession_df[data_col] - min_date).dt.days / days_span
        )
    else:
        profession_df['time_weight'] = 1.0

    # ── 1. Calculate frequencies (with time weights) ────────────────────────────
    counter_by_cat: dict[str, Counter] = defaultdict(Counter)

    for idx, row in profession_df.iterrows():
        skills_str = row["job_type_skills"]
        weight = row["time_weight"]
        
        try:
            parsed: dict = ast.literal_eval(skills_str)
        except (ValueError, SyntaxError):
            continue

        for category, skills in parsed.items():
            for raw_skill in skills:
                normalized = normalize_skill(raw_skill)   # lower + synonym
                if normalized and normalized not in STOP_WORDS:
                    # Apply date weight
                    counter_by_cat[category][normalized] += weight

    if not counter_by_cat:
        return {}

    # ── 2. Determine active languages for profession ────────────────────────────
    #    Needed in advance to select only compatible webframeworks.
    active_langs: set[str] = set()
    if "programming" in counter_by_cat:
        active_langs = {s.lower() for s, _ in counter_by_cat["programming"].most_common(top_n)}

    # ── 3. Helper: select top-N considering exclusivity ──────────
    def _select_top(counter: Counter, cat: str) -> list[str]:
        selected: list[str] = []
        seen_groups: set[int] = set()   # indices of already taken exclusive groups

        for skill, _ in counter.most_common(top_n * 6):   # take a margin
            if len(selected) >= top_n:
                break

            # ── filter by language (only for webframeworks) ────────────────
            if cat == "webframeworks" and active_langs:
                required_lang = FRAMEWORK_LANGUAGE_MAP.get(skill)
                # Discard if the framework's language is not in the active profession languages
                if not required_lang or required_lang not in active_langs:
                    continue

            # ── filter mutually exclusive groups ───────────────────────────
            skill_group_idx: int | None = None
            for idx, group in enumerate(_EXCLUSIVE_GROUPS):
                if skill in group:
                    skill_group_idx = idx
                    break

            if skill_group_idx is not None:
                if skill_group_idx in seen_groups:
                    continue              # we already have a rep from this group
                seen_groups.add(skill_group_idx)

            selected.append(skill)

        return selected

    # ── 4. Build profile ──────────────────────────────────────────────
    profile: dict[str, list[str]] = {}

    # Languages first (so active_langs is ready)
    if "programming" in counter_by_cat:
        profile["programming"] = _select_top(counter_by_cat["programming"], "programming")

    for cat, counter in counter_by_cat.items():
        if cat == "programming":
            continue
        profile[cat] = _select_top(counter, cat)

    return profile


# =============================================================================
# FUNCTION 2 — generate_roadmap
# =============================================================================

def generate_roadmap(
    profession: str,
    student_raw_skills: list[str],
    profession_profile: dict[str, list[str]],
) -> dict[str, list[str]]:
    """
    Compares the student's skills with the profession profile and builds a personal roadmap:
    only what the student is missing, grouped by categories.

    Parameters
    ---------
    profession          : profession name (key in PROFESSION_CATEGORIES)
    student_raw_skills  : student's raw skills (any case, synonyms are ok)
    profession_profile  : output of build_profession_profile()

    Returns
    ----------
    dict  cat → [missing_skill1, ...]   — what needs to be learned
    """

    # ── 1. Normalize student skills ────────────────────────────────────
    student_skills: set[str] = set()
    for raw in student_raw_skills:
        normalized = normalize_skill(raw)
        if normalized and normalized not in STOP_WORDS:
            student_skills.add(normalized)

    # ── 2. Expand implicit knowledge (framework → language) ──────────────────
    #    Example: student knows Django → consider they know Python too.
    implicit_langs = infer_languages(list(student_skills))
    student_skills |= implicit_langs

    # ── 3. Active student languages (needed for webframeworks filter) ──────
    #    Taken from normalized skills + implicit languages.
    programming_category = set(profession_profile.get("programming", []))
    active_langs: set[str] = student_skills & (
        programming_category | implicit_langs
    )
    # Fallback: if student knows none of the profile languages - take all their languages
    if not active_langs:
        active_langs = {s for s in student_skills if s in FRAMEWORK_LANGUAGE_MAP.values()}

    # ── 4. Determine relevant categories for profession ─────────────────
    relevant_cats: set[str] = PROFESSION_CATEGORIES.get(profession, set(profession_profile.keys()))

    # ── 5. Build roadmap for each category ─────────────────────────────
    roadmap: dict[str, list[str]] = {}

    for cat, profile_skills in profession_profile.items():

        if cat not in relevant_cats:
            continue

        missing: list[str] = []
        limit = CATEGORY_LIMITS.get(cat, CATEGORY_LIMITS["default"])

        # Limit the profile BEFORE comparing with student skills
        for skill in profile_skills[:limit]:

            # Student already knows it — skip
            if skill in student_skills:
                continue

            # For webframeworks — offer only frameworks for the active student language
            if cat == "webframeworks" and active_langs:
                required_lang = FRAMEWORK_LANGUAGE_MAP.get(skill)
                if required_lang and required_lang not in active_langs:
                    continue    # framework for an unknown language — don't offer

            missing.append(skill)

        if missing:
            roadmap[cat] = missing

    return roadmap


# =============================================================================
# QUICK TEST
# =============================================================================

if __name__ == "__main__":
    import pandas as pd

    # Mock data instead of real dataframe
    mock_data = {
        "job_title_unified": ["Software Engineer"] * 4,
        "job_type_skills": [
            str({"programming": ["Python", "JavaScript"],
                 "webframeworks": ["Django", "React.js", "Vue.js"],
                 "databases": ["PostgreSQL", "MongoDB"],
                 "other": ["Docker", "Git", "Kubernetes"]}),
            str({"programming": ["Python", "Go"],
                 "webframeworks": ["FastAPI", "Django"],
                 "databases": ["PostgreSQL", "Redis"],
                 "other": ["Docker", "Terraform", "Git"]}),
            str({"programming": ["JavaScript", "TypeScript"],
                 "webframeworks": ["React.js", "Next.js", "Express"],
                 "databases": ["MongoDB", "PostgreSQL"],
                 "other": ["Docker", "Git"]}),
            str({"programming": ["Python"],
                 "webframeworks": ["Flask", "FastAPI"],
                 "databases": ["PostgreSQL", "Elasticsearch"],
                 "other": ["Docker", "Jenkins", "Git"]}),
        ],
    }
    df = pd.DataFrame(mock_data)

    print("=" * 60)
    print("STEP 1: Build profession profile")
    print("=" * 60)
    profile = build_profession_profile(df, "Software Engineer", top_n=2)
    for cat, skills in profile.items():
        print(f"  {cat:20} → {skills}")

    print()
    print("=" * 60)
    print("STEP 2: Generate roadmap for student")
    print("=" * 60)

    student = ["git", "postgres", "django"]   # real raw skills (with synonyms)
    print(f"  Student raw skills: {student}")
    print(f"  After normalization:      {[normalize_skill(s) for s in student]}")
    print()

    roadmap = generate_roadmap("Software Engineer", student, profile)
    for cat, skills in roadmap.items():
        print(f"  {cat:20} → {skills}")