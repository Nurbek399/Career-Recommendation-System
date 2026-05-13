# Career Recommendation System

> Diploma project: an end-to-end AI system that recommends IT educational and career trajectories using student profile data, skill matching, labor-market demand forecasting, course roadmaps, and an optional LLM advisor.

## Authors

| Name | GitHub |
| --- | --- |
| Danial Yermekov | https://github.com/danialyermekov |
| Nurbek Seiilbek | https://github.com/Nurbek399 |
| Turan Tastan | Not provided |

## Overview

Career Recommendation System is a production-style machine learning application for helping students choose a suitable IT career path. The system does more than return a single label: it combines profile classification, explicit skill matching, vacancy-demand forecasting, missing-skill analysis, course recommendations, and a grounded AI chat experience.

The project was developed as a diploma work for the topic:

**Development of a Recommendation System for Students on the Choice of Educational Trajectories, Taking into Account the Forecast of the Labor Market**

## What The System Does

- Predicts the most suitable IT profession from a structured student profile.
- Scores all supported professions using profile fit, skill overlap, demand trend, and market share.
- Identifies missing skills for the recommended profession.
- Builds a practical learning roadmap with course suggestions.
- Forecasts labor-market demand from weekly vacancy dynamics.
- Provides an optional AI advisor chat grounded in the generated recommendation context.
- Serves the full product through a FastAPI backend and React frontend.

## Supported Career Tracks

The current model supports seven IT-oriented professions:

- Business Analyst
- Cloud Engineer
- Data Analyst
- Data Engineer
- Data Scientist
- Machine Learning Engineer
- Software Engineer

## System Architecture

```text
Student profile
     |
     v
FastAPI backend
     |
     |-- CatBoost classifier -> profile-fit probabilities
     |-- TF-IDF skill matcher -> profession skill similarity
     |-- LightGBM demand model -> vacancy trend and market-share scores
     |-- Roadmap engine -> missing skills and course recommendations
     |-- Gemini / LLM service -> optional grounded career advisor
     |
     v
React frontend -> recommendation results, score visualizations, roadmap, chat
```

The final score is computed with a transparent weighted formula:

```text
Final score =
  0.40 * classifier score
+ 0.40 * skill-match score
+ 0.15 * demand-trend score
+ 0.05 * demand market-share score
```

This design keeps the recommendation personalized while still considering labor-market signals.

## Key Features

### Machine Learning

- CatBoost-based multiclass career classification.
- LightGBM-based vacancy demand forecasting.
- TF-IDF and cosine similarity for skill-to-profession matching.
- Feature engineering for student profile signals and weekly demand patterns.
- SHAP-based interpretability figures for classifier and demand model behavior.

### Recommendation Logic

- Multi-signal ranking across all supported professions.
- Skill-gap detection against profession profiles.
- Course matching from a combined catalog of learning platforms.
- Alternative career path recommendation.
- Transparent component scores returned by the API.

### Product Engineering

- FastAPI backend with typed Pydantic schemas.
- React frontend for profile input and recommendation display.
- Dockerized single-container deployment.
- Optional Google Gemini integration for chat.
- Backend tests for core recommendation flows.

## Results

### Career Classification

Best model: **CatBoost on processed dataset**

| Metric | Value |
| --- | ---: |
| Accuracy | 0.8440 |
| Macro F1 | 0.8094 |
| Weighted F1 | 0.8413 |

### Demand Forecasting

Best representative model: **LightGBM with linear features**

| Metric | Value |
| --- | ---: |
| MAE | 221.25 |
| WAPE | 0.1120 |
| R2 | 0.9442 |

## Datasets

| Dataset | Size | Purpose |
| --- | ---: | --- |
| `ml/classification/data/raw/career_multilabel_dataset.csv` | 2,000 rows | Initial student-profile data |
| `ml/classification/data/balanced/career_multilabel_dataset_balanced.csv` | 2,819 rows | Balanced classifier training data |
| `backend/data/vacancy_data.csv` | 371 rows | Weekly vacancy-demand forecasting |
| `backend/data/courses_combined.csv` | 41,693 rows | Course matching for roadmaps |

## Tech Stack

| Layer | Tools |
| --- | --- |
| Backend | Python, FastAPI, Uvicorn, Pydantic |
| ML | CatBoost, LightGBM, scikit-learn, pandas, NumPy, joblib |
| Frontend | React, Framer Motion |
| AI Advisor | Google Gemini / LLM service |
| Testing | Pytest, HTTPX |
| Deployment | Docker, Docker Compose |
| Thesis | XeLaTeX, Overleaf-ready assets |

## Repository Structure

```text
Career-Recommendation-System/
├── backend/
│   ├── data/                  # Vacancy and course datasets for inference
│   ├── models/                # Serialized models, preprocessors, profiles
│   ├── services/              # Classifier, demand, skill matcher, LLM services
│   ├── tests/                 # Backend tests
│   ├── config.py              # Model paths and scoring coefficients
│   ├── features.py            # Classification feature engineering
│   ├── main.py                # FastAPI application and endpoints
│   ├── roadmap.py             # Skill-gap and course-roadmap logic
│   └── schemas.py             # API request/response schemas
├── frontend/
│   ├── public/
│   └── src/                   # React application
├── ml/
│   ├── classification/        # Career-classification notebooks and results
│   ├── demand prediction/     # Vacancy demand forecasting notebooks/results
│   └── skills and courses/    # Skill taxonomy and course-matching work
├── scripts/
│   └── generate_raw_waterfall_figures.py
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Quick Start With Docker

Docker is the simplest way to run the full app.

```bash
docker compose up --build
```

Open:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

Optional AI chat support:

```bash
API_KEY=your_google_gemini_api_key docker compose up --build
```

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
pip install .
uvicorn main:app --reload --port 8000
```

macOS / Linux:

```bash
source .venv/bin/activate
pip install .
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend default URL:

```text
http://localhost:3000
```

If the backend runs on another URL, configure:

```bash
REACT_APP_API_URL=http://localhost:8000
```

## API Endpoints

| Endpoint | Method | Description |
| --- | --- | --- |
| `/health` | GET | Backend health check |
| `/recommend` | POST | Generates career recommendation, scores, roadmap, courses, and session context |
| `/chat` | POST | Returns a non-streaming AI advisor response |
| `/chat/stream` | POST | Streams an AI advisor response |
| `/` | GET | Serves the React build when available |

### Example Recommendation Request

```json
{
  "skills": ["python", "sql", "machine learning", "data analysis"],
  "field_of_study": "Computer Science",
  "gpa": 3.4,
  "python": 1,
  "java": 0,
  "c_cpp": 0,
  "sql": 1,
  "machine_learning": 1,
  "data_analysis": 1,
  "cloud_computing": 0,
  "cybersecurity": 0,
  "web_development": 0,
  "devops": 0,
  "networking": 0,
  "communication": 4,
  "leadership": 3,
  "problem_solving": 5,
  "teamwork": 4,
  "adaptability": 4,
  "lang": "en"
}
```

The response includes:

- `top_profession`
- `alternative_profession`
- `final_scores`
- `skill_scores`
- `classification_scores`
- `demand_scores`
- `roadmap_with_courses`
- `full_roadmap`
- `session_id`

## Testing

Backend tests run locally with FastAPI `TestClient` and mocked ML/LLM services, so Docker, Gemini keys, and a running localhost server are not required.

```bash
cd backend
pip install ".[dev]"
python -m pytest
```

The suite covers API response shape, recommendation score aggregation, chat context behavior, course-language fallback, and roadmap course output.

## Thesis / Overleaf Materials

The repository is accompanied by an Overleaf-ready diploma package generated from the project results. It includes:

- AITU-style XeLaTeX thesis structure.
- Abstracts in English, Russian, and Kazakh.
- Methodology, experiments, discussion, and conclusion chapters.
- Figures from ML notebooks, including heatmaps, confusion matrix, SHAP-style explanations, demand seasonality, and raw-value waterfall plots.

The latest generated package is:

```text
overleaf_thesis.zip
```

## Notes On Interpretability

The project includes raw-value waterfall figures for thesis readability. Model explanations still use the processed model input internally, but displayed labels use original feature values where possible. This avoids confusing labels such as negative scaled GPA values in the final report.

## Future Improvements

- Connect the demand module to live vacancy data.
- Add model registry and dataset versioning with MLflow or DVC.
- Add CI checks for backend tests and frontend build.
- Improve user-level explainability with per-recommendation SHAP summaries.
- Add authentication and persistent session storage for production use.
- Evaluate recommendations with real students and academic advisors.

## License

This repository is currently intended for academic and portfolio demonstration purposes. Add an explicit license before public reuse or distribution.
