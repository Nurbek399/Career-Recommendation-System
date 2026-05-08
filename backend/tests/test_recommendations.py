# tests/test_recommendations.py
import httpx
import pytest

BASE_URL = "http://localhost:8000"

# Obvious profiles with clear expected professions
PROFILES = [
    (
        {
            "skills": ["python", "pandas", "scikit-learn", "machine learning", "deep learning", "pytorch", "tensorflow"],
            "field_of_study": "Data Science",
            "gpa": 3.8,
            "python": 1, "java": 0, "c_cpp": 0, "sql": 1,
            "machine_learning": 1, "data_analysis": 1, "cloud_computing": 0,
            "cybersecurity": 0, "web_development": 0, "devops": 0,
            "networking": 0, "communication": 1, "leadership": 0,
            "problem_solving": 1, "teamwork": 1, "adaptability": 1
        },
        "Machine Learning Engineer",  # clear ML focus, strong Python + ML skills
    ),
    (
        {
            "skills": ["sql", "excel", "power bi", "tableau", "statistics", "data visualization"],
            "field_of_study": "Business Analytics",
            "gpa": 3.5,
            "python": 0, "java": 0, "c_cpp": 0, "sql": 1,
            "machine_learning": 0, "data_analysis": 1, "cloud_computing": 0,
            "cybersecurity": 0, "web_development": 0, "devops": 0,
            "networking": 0, "communication": 1, "leadership": 1,
            "problem_solving": 1, "teamwork": 1, "adaptability": 1
        },
        "Data Analyst",  # no ML, strong data viz + business tools + communication
    ),
    (
        {
            "skills": ["python", "spark", "airflow", "kafka", "postgresql", "etl", "data warehouse", "dbt"],
            "field_of_study": "Computer Science",
            "gpa": 3.6,
            "python": 1, "java": 1, "c_cpp": 0, "sql": 1,
            "machine_learning": 0, "data_analysis": 0, "cloud_computing": 1,
            "cybersecurity": 0, "web_development": 0, "devops": 1,
            "networking": 0, "communication": 0, "leadership": 0,
            "problem_solving": 1, "teamwork": 1, "adaptability": 1
        },
        "Data Engineer",  # ETL/pipeline stack
    ),
    (
        {
            "skills": ["requirements gathering", "bpmn", "jira", "confluence", "sql", "excel", "uml"],
            "field_of_study": "Information Systems",
            "gpa": 3.3,
            "python": 0, "java": 0, "c_cpp": 0, "sql": 1,
            "machine_learning": 0, "data_analysis": 1, "cloud_computing": 0,
            "cybersecurity": 0, "web_development": 0, "devops": 0,
            "networking": 0, "communication": 1, "leadership": 1,
            "problem_solving": 1, "teamwork": 1, "adaptability": 1
        },
        "Business Analyst",  # common BA skills + strong communication + some data analysis, no coding focus
    ),
    (
        {
            "skills": ["aws", "terraform", "docker", "kubernetes", "ci/cd", "linux", "networking"],
            "field_of_study": "Computer Science",
            "gpa": 3.4,
            "python": 1, "java": 0, "c_cpp": 0, "sql": 0,
            "machine_learning": 0, "data_analysis": 0, "cloud_computing": 1,
            "cybersecurity": 0, "web_development": 0, "devops": 1,
            "networking": 1, "communication": 0, "leadership": 0,
            "problem_solving": 1, "teamwork": 1, "adaptability": 1
        },
        "Cloud Engineer",  # AWS + DevOps stack
    ),
    (
        {
            "skills": ["python", "statistics", "r", "hypothesis testing", "ml", "feature engineering", "xgboost"],
            "field_of_study": "Applied Mathematics",
            "gpa": 3.9,
            "python": 1, "java": 0, "c_cpp": 0, "sql": 1,
            "machine_learning": 1, "data_analysis": 1, "cloud_computing": 0,
            "cybersecurity": 0, "web_development": 0, "devops": 0,
            "networking": 0, "communication": 1, "leadership": 0,
            "problem_solving": 1, "teamwork": 1, "adaptability": 1
        },
        "Data Scientist",  # strong stats + ML + Python, but no engineering focus, more research/data insight focus than ML engineering
    ),
]


@pytest.mark.parametrize("profile, expected_profession", PROFILES)
def test_top_profession_matches_expected(profile, expected_profession):
    r = httpx.post(f"{BASE_URL}/recommend", json=profile, timeout=30)
    assert r.status_code == 200, f"API error: {r.json()}"

    data = r.json()
    top        = data["top_profession"]
    alt        = data.get("alternative_profession", "")
    final      = data.get("final_scores", {})

    assert expected_profession in (top, alt), (
        f"\nProfile: {profile['skills']}"
        f"\nExpected: {expected_profession}"
        f"\nReceived (top-1): {top}"
        f"\nReceived (top-2): {alt}"
        f"\nFinal scores: {final}"
    )