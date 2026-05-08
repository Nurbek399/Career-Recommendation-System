from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from metrics.wape import wape
import numpy as np
import pandas as pd
import os

def regression_report(y_true, y_pred, name='Not specified',hyperparams=None):
    """Generate a regression report and append it to the results file."""
    if hyperparams is None:
        hyperparams = {}
    report = {
        'Model': name,
        'Hyperparameters': hyperparams,
        'MAE': mean_absolute_error(y_true, y_pred),
        'WAPE': wape(y_true, y_pred),
        'RMSE': np.sqrt(mean_squared_error(y_true, y_pred)),
        'R2 Score': r2_score(y_true, y_pred)
    }
    
    report_df = pd.DataFrame([report])
    file_path = '../results/regression_report.csv'

    file_exists = os.path.isfile(file_path)

    report_df.to_csv(
        file_path, 
        mode='a', 
        index=False, 
        header=not file_exists,
        encoding='utf-8'
    )
    
    return report_df