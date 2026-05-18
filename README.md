# Career Recommendation System

> Full-stack AI career guidance system for students. The app recommends IT career tracks, compares all supported professions, explains scoring factors, builds a learning roadmap, parses CV/resume PDFs, exports a structured PDF report, and includes an optional grounded AI advisor.

## Authors

| Name | GitHub |
| --- | --- |
| Danial Yermekov | https://github.com/danialyermekov |
| Nurbek Seiilbek | https://github.com/Nurbek399 |
| Turan Tastan | Not provided |

## Overview

Career Recommendation System is a diploma project for helping students choose an educational and career trajectory in IT. It combines:

- student profile classification;
- explicit skill matching;
- labor-market demand forecasting;
- multi-profession score comparison;
- skill-gap analysis;
- course-based learning roadmaps;
- resume/CV parsing;
- explainable recommendation output;
- optional AI advisor chat grounded in the generated results.

The system is not limited to a single top recommendation. It returns and visualizes scores for all supported professions so students can compare alternatives and understand why one path is stronger than another.

## Supported Career Tracks

- Business Analyst
- Cloud Engineer
- Data Analyst
- Data Engineer
- Data Scientist
- Machine Learning Engineer
- Software Engineer

## Main Features

### Recommendation Engine

- Weighted final score across all professions.
- Profile match from a CatBoost classifier.
- Skill match from TF-IDF profession profiles and cosine similarity.
- Market demand and trend score from LightGBM forecasting.
- Alternative profession ranking, not only top-1.
- Explainability panel with factor impact for:
  - profile match;
  - skill matching;
  - market demand;
  - trend score.

### Visual Analytics

- Bars chart for all professions.
- Multi-profession radar chart.
- Skill-gap comparison for every profession.
- Score circles for every profession.
- Hover tooltips with profession name, exact score, and factor breakdown.
- Responsive layouts for desktop, tablet, and mobile.

### Learning Roadmap

- Personalized roadmap for the recommended profession.
- Course recommendations from a combined course catalog.
- Drag and drop ordering for roadmap categories and skill tasks.
- Completed tasks move into a completed section.
- Realtime progress counter.
- Skill dependency tree with prerequisites and recommended next step.
- Roadmap progress saved locally in the browser.

### AI Advisor

- Optional Gemini-powered advisor chat.
- Streaming responses.
- Thinking mode UI.
- Voice input and answer playback through browser speech APIs when supported.
- Resizable side panel with overlay, close button, outside click, and Esc support.
- Topic filtering and prompt-injection guardrails. The assistant is scoped to career recommendations, skill gaps, roadmaps, professions, courses, resumes, and system results.

### Resume / CV Parser

- Upload text-based PDF, TXT, or document-like CV files.
- Backend PDF extraction via PyMuPDF.
- Extracts skills, technologies, and possible current role.
- Detected skills are inserted into the profile form for manual review.
- Short-token false positives are filtered, so words like "go" and isolated "R" are not treated as Go/R skills unless the context is explicit.

Note: scanned image-only PDFs require OCR and are not fully supported by the current parser.

### Localization

The frontend supports three interface languages:

- English
- Russian
- Kazakh

Translated areas include the main UI, profession names, chart labels, roadmap UI, AI advisor texts, and PDF report labels.

### PDF Report

The generated PDF report includes:

- summary of all professions;
- score circles;
- bars overview;
- score breakdown;
- recommendation explanation;
- skill-gap summary;
- roadmap;
- roadmap progress when available.

## System Architecture

```text
Student profile / uploaded resume
        |
        v
FastAPI backend
        |
        |-- CatBoost classifier -> profile-fit probabilities
        |-- TF-IDF skill matcher -> profession skill similarity
        |-- LightGBM demand model -> trend and market-share scores
        |-- Roadmap engine -> skill gaps and course recommendations
        |-- PyMuPDF resume parser -> extracted skills and role
        |-- Gemini LLM service -> optional grounded AI advisor
        |
        v
React frontend
        |
        |-- profile form
        |-- all-profession charts
        |-- roadmap and dependency tree
        |-- AI advisor side panel
        |-- PDF export
```

## Scoring Formula

```text
Final score =
  0.40 * classifier/profile score
+ 0.40 * skill-match score
+ 0.15 * demand-trend score
+ 0.05 * demand market-share score
```

## Tech Stack

| Layer | Tools |
| --- | --- |
| Backend | Python, FastAPI, Uvicorn, Pydantic |
| ML | CatBoost, LightGBM, scikit-learn, pandas, NumPy, joblib |
| Resume parsing | PyMuPDF |
| Frontend | React, Framer Motion, CSS Modules |
| AI advisor | Google Gemini via `google-genai` |
| Testing | Pytest, React Scripts/Jest |
| Deployment | Docker, Docker Compose |

## Repository Structure

```text
Career-Recommendation-System/
├── backend/
│   ├── data/                     # Vacancy and course datasets
│   ├── models/                   # Serialized models, vectorizers, profiles
│   ├── services/
│   │   ├── classifier.py         # CatBoost classifier wrapper
│   │   ├── course_finder.py      # Course lookup and roadmap courses
│   │   ├── demand.py             # LightGBM demand forecast
│   │   ├── llm.py                # Gemini chat service
│   │   ├── resume_parser.py      # PDF/TXT resume parser
│   │   └── skill_matcher.py      # TF-IDF skill matching
│   ├── tests/                    # Backend tests
│   ├── main.py                   # FastAPI app and endpoints
│   ├── roadmap.py                # Skill-gap roadmap logic
│   ├── schemas.py                # Pydantic schemas
│   └── pyproject.toml            # Backend dependencies
├── frontend/
│   ├── public/
│   ├── package.json
│   └── src/
│       ├── components/           # Navbar and shared UI
│       ├── context/              # App theme/language context
│       ├── pages/                # Hero, Form, Results
│       ├── utils/api.js          # Backend API client
│       └── i18n.js               # EN/RU/KZ translations
├── ml/                           # Research notebooks and model work
├── scripts/                      # Supporting scripts
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Quick Start With Docker

Docker is the recommended way to run the full application because the ML dependencies are heavy. The local Python environment must have CatBoost, LightGBM, PyMuPDF, and compatible scientific packages installed; Docker handles this automatically.

```bash
docker compose up --build
```

Open the app:

```text
http://localhost:8000
```

Open API docs:

```text
http://localhost:8000/docs
```

Optional AI advisor support:

```bash
API_KEY=your_google_gemini_api_key docker compose up --build
```

On Windows PowerShell:

```powershell
$env:API_KEY="your_google_gemini_api_key"
docker compose up --build
```

Stop containers:

```bash
docker compose down
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
pip install ".[dev]"
uvicorn main:app --reload --port 8000
```

macOS / Linux:

```bash
source .venv/bin/activate
pip install ".[dev]"
uvicorn main:app --reload --port 8000
```

Backend URL:

```text
http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend dev URL:

```text
http://localhost:3000
```

When frontend runs on port 3000, the API client automatically uses:

```text
http://localhost:8000
```

For another backend URL:

```bash
REACT_APP_API_URL=http://localhost:8000 npm start
```

PowerShell:

```powershell
$env:REACT_APP_API_URL="http://localhost:8000"
npm start
```

## API Endpoints

| Endpoint | Method | Description |
| --- | --- | --- |
| `/health` | GET | Backend health check |
| `/recommend` | POST | Generates recommendation, scores, roadmap, courses, all-profession gap summaries, and chat session context |
| `/parse-resume` | POST | Parses uploaded resume/CV bytes and extracts skills/current role |
| `/chat` | POST | Non-streaming AI advisor response |
| `/chat/stream` | POST | Streaming AI advisor response |
| `/` | GET | Serves the React build in Docker/production |

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
- `roadmaps_by_profession`
- `session_id`
- `context`

### Resume Parser Request

The resume parser accepts raw file bytes. It does not require multipart upload.

PowerShell example:

```powershell
$path = "C:\Users\Администратор\Downloads\resume.pdf"
Invoke-RestMethod `
  -Uri http://localhost:8000/parse-resume `
  -Method Post `
  -ContentType "application/pdf" `
  -Headers @{ "X-Filename" = [uri]::EscapeDataString((Split-Path $path -Leaf)) } `
  -InFile $path
```

Example response:

```json
{
  "filename": "resume.pdf",
  "skills": ["Python", "SQL", "MongoDB", "TensorFlow", "AWS", "Spark"],
  "role": "Data Scientist",
  "text_preview": "..."
}
```

## Testing

Backend tests use mocked ML/LLM services for most API flows, so Gemini keys and a running model server are not required.

```bash
cd backend
pip install ".[dev]"
python -m pytest
```

Frontend tests:

```bash
cd frontend
npm test -- --watchAll=false
```

Frontend production build:

```bash
cd frontend
npm run build
```

Current checked test coverage includes:

- recommendation response shape;
- scoring aggregation;
- all-profession score coverage;
- roadmap course output;
- chat context behavior;
- resume parser false-positive protection;
- localization dictionaries for EN/RU/KZ.

## Troubleshooting

### `Server error. Please try again.` on `/recommend`

If this happens during local development, check the backend terminal. A common cause is missing ML dependencies:

```text
No module named 'catboost'
No module named 'lightgbm'
```

Fix options:

```bash
cd backend
pip install ".[dev]"
uvicorn main:app --reload --port 8000
```

Or use Docker:

```bash
docker compose up --build
```

### Port 8000 is already in use

Stop the existing process or container:

```bash
docker compose down
```

Then start again:

```bash
docker compose up --build
```

### AI chat does not answer

Recommendation generation works without an AI key, but Gemini chat requires:

```text
API_KEY=your_google_gemini_api_key
```

Without the key, chat endpoints return a configuration error while the recommendation pipeline remains usable.

### PDF parser misses text

The parser works best with text-based PDFs. If a CV is a scan or image-only PDF, the backend needs OCR support, for example Tesseract or a cloud OCR service.

## Model Results

### Career Classification

Best model: CatBoost on processed dataset.

| Metric | Value |
| --- | ---: |
| Accuracy | 0.8440 |
| Macro F1 | 0.8094 |
| Weighted F1 | 0.8413 |

### Demand Forecasting

Best representative model: LightGBM with selected features.

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

## Current Limitations

- User accounts are not connected to a production database yet. History and roadmap progress are stored locally in the browser.
- Resume parsing does not include OCR for scanned PDFs.
- Explainability in the frontend uses transparent factor importance from the scoring pipeline. Full per-user SHAP explanations require a dedicated backend explainability endpoint and model artifacts.
- Course lookup is generated for the primary roadmap; all-profession skill-gap summaries are returned without course lookup to keep `/recommend` responsive.

## Future Improvements

- Add authentication and persistent user profiles.
- Store recommendation history, roadmap order, and progress in a database.
- Add OCR for scanned resumes.
- Add production-grade SHAP or model-specific explanation endpoints.
- Connect demand forecasting to live vacancy data.
- Add CI for backend tests and frontend build.
- Add model registry and dataset versioning with MLflow or DVC.

## License

This repository is currently intended for academic and portfolio demonstration purposes. Add an explicit license before public reuse or distribution.
