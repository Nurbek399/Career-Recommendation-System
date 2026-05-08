import pandas as pd
import numpy as np

def error_analysis(test_df, y_true, y_pred):
    """Perform error analysis by creating a DataFrame with actual vs predicted values and error metrics."""
    errors_df = pd.DataFrame({
        'month': test_df['month'].values, 
        'specialization': test_df['job_title_unified'].values,
        'fact': np.array(y_true).flatten(),
        'prediction': np.array(y_pred).flatten(),
    })
    errors_df['prediction'] = np.maximum(0, np.round(errors_df['prediction'])).astype(int)
    errors_df['fact'] = np.round(errors_df['fact']).astype(int)
    errors_df['abs_error'] = np.abs(errors_df['fact'] - errors_df['prediction'])

    errors_df['perc_error'] = np.where(
        errors_df['fact'] > 0,
        errors_df['abs_error'] / errors_df['fact'],
        0.0
    )

    errors_df['error_type'] = np.where(
        errors_df['prediction'] > errors_df['fact'], 
        'Overprediction', 
        'Underprediction'
    )

    return errors_df.sort_values(by='abs_error', ascending=False)


def error_by_segment(errors_df, segment_col):
    """Calculate mean absolute error and mean percentage error by a specified segment."""
    segment_errors = errors_df.groupby(segment_col).agg(
        mean_abs_error=('abs_error', 'mean'),
        mean_perc_error=('perc_error', 'mean')
    ).reset_index()
    return segment_errors.sort_values(by='mean_abs_error', ascending=False)
