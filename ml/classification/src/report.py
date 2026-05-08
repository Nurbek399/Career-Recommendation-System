from sklearn.metrics import (
    f1_score, accuracy_score, 
    precision_score, recall_score, 
    classification_report
)
import numpy as np
import pandas as pd
import os


def classification_report_custom(y_true, y_pred, name='Not specified', hyperparams=None, all_classes=None):
    """Generate a classification report and append it to the results file.
    
    Parameters:
    - y_true, y_pred: True and predicted labels.
    - name: Model name
    - hyperparams: Dict of hyperparameters (optional)
    - all_classes: Complete list of all classes in the dataset (e.g., [0, 1, 2, 3, 4, 5, 6]).
    """
    if hyperparams is None:
        hyperparams = {}

    if all_classes is None:
        all_classes = [0, 1, 2, 3, 4, 5, 6]

    f1_per_class = f1_score(y_true, y_pred, average=None, labels=all_classes, zero_division=0.0)
    per_class_f1 = {f'F1_{cls}': round(score, 4) for cls, score in zip(all_classes, f1_per_class)}
    
    report = {
        'Model': name,
        'Hyperparameters': str(hyperparams), 
        'Accuracy': round(accuracy_score(y_true, y_pred), 4),
        'F1_Macro': round(f1_score(y_true, y_pred, average='macro', zero_division=0.0), 4),
        'F1_Weighted': round(f1_score(y_true, y_pred, average='weighted', zero_division=0.0), 4),
        'Precision_Macro': round(precision_score(y_true, y_pred, average='macro', zero_division=0.0), 4),
        'Recall_Macro': round(recall_score(y_true, y_pred, average='macro', zero_division=0.0), 4),
        **per_class_f1
    }
    
    report_df = pd.DataFrame([report])
    

    base_columns = ['Model', 'Hyperparameters', 'Accuracy', 'F1_Macro', 'F1_Weighted', 'Precision_Macro', 'Recall_Macro']
    f1_columns = [f'F1_{cls}' for cls in all_classes]
    report_df = report_df[base_columns + f1_columns]
    
    file_path = '../results/classification_report.csv'
    file_exists = os.path.isfile(file_path)
    
    report_df.to_csv(
        file_path,
        mode='a',
        index=False,
        header=not file_exists,
        encoding='utf-8'
    )
    
    return report_df