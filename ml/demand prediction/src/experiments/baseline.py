from metrics.wape import wape
from sklearn.metrics import mean_squared_error, mean_absolute_error
import numpy as np
import pandas as pd

def baseline_metrics(test_df, y_true):
    '''Calculate RMSE, MAE, and WAPE for naive predictions.'''

    values = ['lag_1', 'lag_2', 'lag_3', 'lag_4', 'rolling_mean_2', 'rolling_mean_4']

    all_results = []

    for value in values:
        y_pred = test_df[value].values

        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        mae = mean_absolute_error(y_true, y_pred)
        wape_score = wape(y_true, y_pred)

        current_result = {
            'Value': value,
            'RMSE': rmse,
            'MAE': mae,
            'WAPE': wape_score
        }

        all_results.append(current_result)

    results_df = pd.DataFrame(all_results)
    results_df.sort_values(by='WAPE', inplace=True) 
    return results_df