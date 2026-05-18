from top_profession import get_top_profession


PROFESSIONS = [
    "Business Analyst",
    "Cloud Engineer",
    "Data Analyst",
    "Data Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "Software Engineer",
]


def demand(trend=0.2, market=0.1):
    return {
        profession: {
            "trend_score": trend,
            "market_share": market,
            "predicted_vacancies": 1000,
        }
        for profession in PROFESSIONS
    }


def uniform_scores(value=1.0):
    return {profession: value for profession in PROFESSIONS}


def test_skill_match_can_drive_clear_ml_recommendation():
    classification_scores = uniform_scores()
    skill_scores = uniform_scores(0.1)
    skill_scores["Machine Learning Engineer"] = 0.95

    top, final_scores, top_2 = get_top_profession(
        classification_scores=classification_scores,
        demand_scores=demand(),
        skill_scores=skill_scores,
    )

    assert top == "Machine Learning Engineer"
    assert top_2[0] == top
    assert final_scores["Machine Learning Engineer"] > final_scores["Data Scientist"]


def test_profile_probability_can_drive_recommendation_when_skills_are_equal():
    classification_scores = uniform_scores(0.05)
    classification_scores["Data Analyst"] = 0.70
    skill_scores = uniform_scores()

    top, final_scores, _ = get_top_profession(
        classification_scores=classification_scores,
        demand_scores=demand(),
        skill_scores=skill_scores,
    )

    assert top == "Data Analyst"
    assert final_scores["Data Analyst"] == max(final_scores.values())


def test_market_demand_breaks_close_profile_and_skill_tie():
    classification_scores = uniform_scores()
    skill_scores = uniform_scores()
    demand_scores = demand(trend=0.1, market=0.1)
    demand_scores["Data Engineer"]["trend_score"] = 0.9
    demand_scores["Data Engineer"]["market_share"] = 0.8

    top, final_scores, _ = get_top_profession(
        classification_scores=classification_scores,
        demand_scores=demand_scores,
        skill_scores=skill_scores,
    )

    assert top == "Data Engineer"
    assert final_scores["Data Engineer"] > final_scores["Data Analyst"]


def test_zero_scores_do_not_crash_or_create_missing_professions():
    classification_scores = uniform_scores(0)
    skill_scores = uniform_scores(0)
    demand_scores = demand(trend=0, market=0)

    top, final_scores, top_2 = get_top_profession(
        classification_scores=classification_scores,
        demand_scores=demand_scores,
        skill_scores=skill_scores,
    )

    assert top in PROFESSIONS
    assert len(top_2) == 2
    assert set(final_scores) == set(PROFESSIONS)
    assert all(score == 0 for score in final_scores.values())
