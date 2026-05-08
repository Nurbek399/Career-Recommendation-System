import pytest
import httpx


BASE_URL = "http://localhost:8000"

EXPECTED_PROFESSIONS = {
    "Data Scientist",
    "Data Analyst",
    "Data Engineer",
    "Business Analyst",
    "Machine Learning Engineer",
    "Software Engineer",
    "Cloud Engineer",
}

TEST_PROFILE = {
    "skills": ["python", "sql", "tensorflow", "pytorch", "aws"],
    "age": 23,
    "gender": "Male",
    "degree_level": "Bachelor",
    "field_of_study": "Data Science",
    "gpa": 3.5,
    "years_experience": 1,
    "python": 1,
    "java": 0,
    "c_cpp": 0,
    "sql": 1,
    "machine_learning": 1,
    "data_analysis": 1,
    "cloud_computing": 1,
    "cybersecurity": 0,
    "web_development": 0,
    "devops": 0,
    "networking": 0,
    "communication": 4,
    "leadership": 3,
    "problem_solving": 5,
    "teamwork": 4,
    "adaptability": 3,
}


@pytest.fixture(scope="module")
def client():
    with httpx.Client(base_url=BASE_URL, timeout=30.0) as c:
        yield c


@pytest.fixture(scope="module")
def recommendation_response(client):
    response = client.post("/recommend", json=TEST_PROFILE)
    assert response.status_code == 200, response.text
    return response.json()


@pytest.fixture(scope="module")
def recommendation_context(recommendation_response):
    return recommendation_response["context"]


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_recommend_returns_200(client):
    response = client.post("/recommend", json=TEST_PROFILE)
    assert response.status_code == 200


def test_recommend_structure(recommendation_response):
    data = recommendation_response

    assert "top_profession" in data
    assert "skill_scores" in data
    assert "classification_scores" in data
    assert "demand_scores" in data
    assert "roadmap_with_courses" in data
    assert "context" in data


def test_recommend_top_profession_is_string(recommendation_response):
    assert isinstance(recommendation_response["top_profession"], str)


def test_classification_scores_sum_to_one(recommendation_response):
    scores = recommendation_response["classification_scores"]
    total = sum(scores.values())
    assert abs(total - 1.0) < 0.01


def test_all_professions_in_scores(recommendation_response):
    data = recommendation_response

    assert set(data["skill_scores"].keys()) == EXPECTED_PROFESSIONS
    assert set(data["classification_scores"].keys()) == EXPECTED_PROFESSIONS
    assert set(data["demand_scores"].keys()) == EXPECTED_PROFESSIONS


def test_demand_scores_structure(recommendation_response):
    demand = recommendation_response["demand_scores"]

    for profession, scores in demand.items():
        assert "trend_score" in scores
        assert "market_share" in scores
        assert "predicted_vacancies" in scores
        assert 0 <= scores["trend_score"] <= 1
        assert 0 <= scores["market_share"] <= 1


def test_roadmap_has_courses(recommendation_response):
    roadmap = recommendation_response["roadmap_with_courses"]

    for category, skills in roadmap.items():
        for skill, data in skills.items():
            assert "courses" in data
            assert isinstance(data["courses"], list)


def test_mle_recommended_for_ml_student(recommendation_response):
    top = recommendation_response["top_profession"]
    assert top in ["Machine Learning Engineer", "Data Scientist"]


def test_chat_returns_200(client, recommendation_response):
    chat_payload = {
        "session_id": recommendation_response["session_id"],
        "history": [],
        "message": "Hi, say one word",
        "deep": False,
    }

    response = client.post("/chat", json=chat_payload)
    assert response.status_code == 200, response.text

    data = response.json()
    assert "response" in data
    assert len(data["response"]) > 0


def test_chat_with_history(client, recommendation_response):
    history = [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hello"},
    ]

    chat_payload = {
        "session_id": recommendation_response["session_id"],
        "history": history,
        "message": "What about cloud technologies?",
        "deep": False,
    }

    response = client.post("/chat", json=chat_payload)
    assert response.status_code == 200


def test_empty_skills(client):
    profile = {**TEST_PROFILE, "skills": []}
    response = client.post("/recommend", json=profile)
    assert response.status_code == 200


def test_unknown_skills(client):
    profile = {**TEST_PROFILE, "skills": ["fortran", "cobol", "pascal"]}
    response = client.post("/recommend", json=profile)
    assert response.status_code == 200


def test_ba_recommended_for_analyst(client):
    profile = {
        **TEST_PROFILE,
        "skills": ["excel", "tableau", "power bi", "sql"],
        "machine_learning": 0,
        "cloud_computing": 0,
    }

    response = client.post("/recommend", json=profile)
    assert response.status_code == 200
    top = response.json()["top_profession"]
    assert top in ["Data Analyst", "Business Analyst"]