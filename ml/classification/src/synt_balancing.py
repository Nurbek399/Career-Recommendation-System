import numpy as np
import pandas as pd

def get_class_profile(label: str) -> dict:
    profiles = {
        'Data Analyst': {
            'age': (28, 4), 'gpa': (3.3, 0.4), 'years_experience': (3, 2),
            'field_of_study': {'Data Science': 0.4, 'Computer Science': 0.3, 'AI': 0.1, 'Software Engineering': 0.1, 'Cybersecurity': 0.1},
            'python': 0.7, 'java': 0.2, 'c_cpp': 0.1, 'sql': 0.9,
            'machine_learning': 0.3, 'data_analysis': 0.95, 'cloud_computing': 0.3,
            'cybersecurity': 0.1, 'web_development': 0.2, 'devops': 0.1, 'networking': 0.1,
            'communication': (4, 1), 'leadership': (3, 1),
            'problem_solving': (4, 1), 'teamwork': (4, 1), 'adaptability': (3, 1),
        },
        'Data Engineer': {
            'age': (29, 4), 'gpa': (3.2, 0.4), 'years_experience': (4, 2),
            'field_of_study': {'Computer Science': 0.35, 'Software Engineering': 0.3, 'Data Science': 0.2, 'AI': 0.1, 'Cybersecurity': 0.05},
            'python': 0.9, 'java': 0.4, 'c_cpp': 0.3, 'sql': 0.85,
            'machine_learning': 0.3, 'data_analysis': 0.6, 'cloud_computing': 0.8,
            'cybersecurity': 0.2, 'web_development': 0.2, 'devops': 0.7, 'networking': 0.4,
            'communication': (3, 1), 'leadership': (2, 1),
            'problem_solving': (4, 1), 'teamwork': (3, 1), 'adaptability': (4, 1),
        },
        'Cloud Engineer': {
            'age': (28, 4), 'gpa': (3.1, 0.4), 'years_experience': (3, 2),
            'field_of_study': {'Computer Science': 0.3, 'Software Engineering': 0.3, 'Cybersecurity': 0.2, 'AI': 0.1, 'Data Science': 0.1},
            'python': 0.6, 'java': 0.3, 'c_cpp': 0.2, 'sql': 0.4,
            'machine_learning': 0.2, 'data_analysis': 0.3, 'cloud_computing': 0.95,
            'cybersecurity': 0.4, 'web_development': 0.2, 'devops': 0.8, 'networking': 0.7,
            'communication': (3, 1), 'leadership': (2, 1),
            'problem_solving': (4, 1), 'teamwork': (3, 1), 'adaptability': (4, 1),
        },
        'Data Scientist': {
            'age': (29, 4), 'gpa': (3.6, 0.3), 'years_experience': (3, 2),
            'field_of_study': {'Data Science': 0.4, 'AI': 0.3, 'Computer Science': 0.2, 'Software Engineering': 0.05, 'Cybersecurity': 0.05},
            'python': 0.95, 'java': 0.2, 'c_cpp': 0.2, 'sql': 0.7,
            'machine_learning': 0.95, 'data_analysis': 0.9, 'cloud_computing': 0.4,
            'cybersecurity': 0.1, 'web_development': 0.1, 'devops': 0.2, 'networking': 0.1,
            'communication': (3, 1), 'leadership': (2, 1),
            'problem_solving': (5, 1), 'teamwork': (3, 1), 'adaptability': (3, 1),
        },
        'Software Engineer': {
            'age': (27, 4), 'gpa': (3.2, 0.4), 'years_experience': (3, 2),
            'field_of_study': {'Software Engineering': 0.4, 'Computer Science': 0.35, 'AI': 0.1, 'Data Science': 0.1, 'Cybersecurity': 0.05},
            'python': 0.7, 'java': 0.8, 'c_cpp': 0.6, 'sql': 0.5,
            'machine_learning': 0.2, 'data_analysis': 0.3, 'cloud_computing': 0.4,
            'cybersecurity': 0.2, 'web_development': 0.7, 'devops': 0.5, 'networking': 0.3,
            'communication': (3, 1), 'leadership': (3, 1),
            'problem_solving': (4, 1), 'teamwork': (3, 1), 'adaptability': (3, 1),
        },
        'Business Analyst': {
            'age': (29, 4), 'gpa': (3.3, 0.4), 'years_experience': (3, 2),
            'field_of_study': {'Computer Science': 0.3, 'Data Science': 0.25, 'Software Engineering': 0.2, 'AI': 0.15, 'Cybersecurity': 0.1},
            'python': 0.4, 'java': 0.2, 'c_cpp': 0.1, 'sql': 0.7,
            'machine_learning': 0.2, 'data_analysis': 0.8, 'cloud_computing': 0.2,
            'cybersecurity': 0.1, 'web_development': 0.2, 'devops': 0.1, 'networking': 0.1,
            'communication': (5, 1), 'leadership': (4, 1),
            'problem_solving': (4, 1), 'teamwork': (4, 1), 'adaptability': (4, 1),
        },
        'Machine Learning Engineer': {
            'age': (28, 4), 'gpa': (3.5, 0.3), 'years_experience': (3, 2),
            'field_of_study': {'AI': 0.4, 'Data Science': 0.3, 'Computer Science': 0.2, 'Software Engineering': 0.05, 'Cybersecurity': 0.05},
            'python': 0.95, 'java': 0.2, 'c_cpp': 0.3, 'sql': 0.5,
            'machine_learning': 0.98, 'data_analysis': 0.7, 'cloud_computing': 0.5,
            'cybersecurity': 0.1, 'web_development': 0.1, 'devops': 0.3, 'networking': 0.1,
            'communication': (3, 1), 'leadership': (2, 1),
            'problem_solving': (5, 1), 'teamwork': (3, 1), 'adaptability': (3, 1),
        },
    }
    if label not in profiles:
        raise ValueError(f"No profile for '{label}'. Available: {list(profiles.keys())}")
    return profiles[label]


def generate_synthetic_rows(label: str, n: int, seed: int = 42) -> pd.DataFrame:
    """Generates n synthetic rows for a given job label."""
    np.random.seed(seed)
    profile = get_class_profile(label)

    binary_cols = [
        'python', 'java', 'c_cpp', 'sql', 'machine_learning',
        'data_analysis', 'cloud_computing', 'cybersecurity',
        'web_development', 'devops', 'networking'
    ]
    soft_skill_cols = ['communication', 'leadership', 'problem_solving', 'teamwork', 'adaptability']
    categorical_cols = ['field_of_study']

    rows = []
    for _ in range(n):
        row = {}
        for col, val in profile.items():
            if col in categorical_cols:
                categories = list(val.keys())
                probs = list(val.values())
                row[col] = np.random.choice(categories, p=probs)
            elif col in binary_cols:
                row[col] = int(np.random.binomial(1, val))
            elif col in soft_skill_cols:
                row[col] = int(np.clip(round(np.random.normal(val[0], val[1])), 1, 5))
            else:
                raw = np.random.normal(val[0], val[1])
                if col == 'gpa':
                    row[col] = round(np.clip(raw, 0.0, 4.0), 2)
                elif col == 'age':
                    row[col] = int(np.clip(round(raw), 18, 60))
                else:
                    row[col] = int(np.clip(round(raw), 0, None))
        row['recommended_job_1'] = label
        rows.append(row)

    return pd.DataFrame(rows)


def balance_dataset(
    df: pd.DataFrame,
    target_col: str = 'recommended_job_1',
    target_count: int = 300,
    seed: int = 42,
    all_classes: list = None,  
) -> pd.DataFrame:
    '''Balances the dataset by generating synthetic rows for underrepresented classes.'''

    if all_classes is None:
        all_classes = df[target_col].unique().tolist()

    counts = df[target_col].value_counts()
    print("=== Class distribution before balancing ===")
    print(counts.to_string())
    print(f"\nTarget count per class: {target_count}\n")

    balanced_parts = []

    for label in all_classes: 
        class_df = df[df[target_col] == label].copy()
        count = len(class_df)

        n_to_generate = target_count - count
        if n_to_generate <= 0:
            balanced_parts.append(class_df)
            print(f"✓ {label}: no generation needed ({count} rows)")
            continue

        try:
            synthetic = generate_synthetic_rows(label, n=n_to_generate, seed=seed)
            synthetic = synthetic.reindex(columns=df.columns)
            combined = pd.concat([class_df, synthetic], ignore_index=True)
            balanced_parts.append(combined)
            print(f"✓ {label}: generated {n_to_generate} rows ({count} → {target_count})")
        except ValueError as e:
            balanced_parts.append(class_df)
            print(f"⚠ {label}: skipped ({e})")

    df_balanced = pd.concat(balanced_parts, ignore_index=True).sample(
        frac=1, random_state=seed
    ).reset_index(drop=True)

    print("\n=== Class distribution after balancing ===")
    print(df_balanced[target_col].value_counts().to_string())

    return df_balanced