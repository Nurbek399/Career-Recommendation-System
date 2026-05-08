# Career Recommendation System

An end-to-end machine learning project that recommends IT career paths based on a user profile, skill signals, and labor-market demand.

## Project Overview

This repository combines multiple ML pipelines with a production-style web application:

- A **career classification model** predicts the most suitable IT profession.
- A **vacancy demand model** estimates market demand by role.
- A **skill-gap and roadmap module** identifies missing skills and maps them to courses.
- A **FastAPI backend + React frontend** delivers recommendations through an interactive product experience.

The project is interesting because it blends **classification**, **time-series demand forecasting**, **NLP-based skill matching**, and **API/product engineering** in one portfolio-ready system.

## Key Features

- Multi-factor career recommendation (profile + skills + market demand)
- Profession scoring across roles like Data Scientist, Data Engineer, Cloud Engineer, etc.
- Personalized roadmap generation with course suggestions
- LLM-powered career chat endpoint (`/chat`, `/chat/stream`)
- REST API with test suite for core recommendation flows
- Separate ML research workstreams (classification, demand prediction, skill/course matching)

## Tech Stack

### Backend & API
- Python
- FastAPI, Uvicorn
- Pydantic
- Pytest, HTTPX

### Machine Learning & Data
- CatBoost (career classification)
- LightGBM (demand prediction)
- Scikit-learn
- Pandas, NumPy
- Joblib

### Frontend
- React
- Framer Motion

### AI Integration
- Google Gemini / LLM integration in backend services

## Dataset

The repository includes several prepared datasets:

- `ml/classification/data/raw/career_multilabel_dataset.csv`  
  - 2,000 rows, 25 columns
- `ml/classification/data/balanced/career_multilabel_dataset_balanced.csv`  
  - 2,819 rows, 25 columns
- `backend/data/vacancy_data.csv`  
  - 371 weekly observations of role-level vacancy counts
- `backend/data/courses_combined.csv`  
  - 41,693 course records used for roadmap/course matching

## Installation

### 1) Clone the repository

```bash
git clone https://github.com/<your-username>/Career-Recommendation-System.git
cd Career-Recommendation-System
```

### 2) Set up and run backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install .
```

Optional environment variable for LLM features:

```bash
echo "API_KEY=your_google_gemini_api_key" > .env
```

### 3) Set up frontend

```bash
cd ../frontend
npm install
```

## Usage

### Run backend API

```bash
cd backend
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

### Run frontend app

```bash
cd frontend
npm start
```

Frontend default URL: `http://localhost:3000`  
Backend URL can be configured via `REACT_APP_API_URL`.

### Run backend tests

```bash
cd backend
pytest tests/ -v
```

> Note: current tests call `http://localhost:8000`, so start the backend before running them.

## Project Structure

```text
Career-Recommendation-System/
├── backend/                       # FastAPI app, inference services, tests, model/data assets
│   ├── services/                  # Classifier, demand, skill matcher, course finder, LLM
│   ├── tests/                     # API/integration-style tests
│   ├── models/                    # Serialized models, preprocessors, profiles
│   └── data/                      # Vacancy and courses datasets for inference
├── frontend/                      # React client app
└── ml/
    ├── classification/            # Career-classification experimentation pipeline
    ├── demand prediction/         # Vacancy demand forecasting experiments
    └── skills and courses/         # Skill taxonomy, matching, roadmap/course modules
```

## Results / Metrics

From repository result files:

- **Career Classification (`ml/classification/results/classification_report_fixed.csv`)**
  - Best Accuracy: **0.844** (CatBoost, processed dataset)
  - Best Macro F1: **0.8094** (CatBoost, processed dataset)

- **Demand Prediction (`ml/demand prediction/results/regression_report.csv`)**
  - Best WAPE: **0.1120** (LightGBM with linear features)
  - R²: **0.9442**

## Future Improvements

- Add model and data versioning (e.g., MLflow/DVC)
- Improve reproducibility with a unified root-level environment setup
- Add Docker Compose for one-command backend + frontend startup
- Introduce CI checks for API tests and model artifact validation
- Add richer evaluation dashboards (confusion matrix, drift/monitoring views)
- Expand datasets with external macro/job-market signals

## Assumptions

- This README is based on available code, configuration, and artifact files in the repository.
- Some subproject paths and lockfiles indicate active experimentation; setup may vary slightly by environment.
- Python version requirements were inferred from current `pyproject.toml` files.

## Author

- **Name:** *Your Name*
- **GitHub:** [@your-github-username](https://github.com/your-github-username)
