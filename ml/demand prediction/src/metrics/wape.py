import numpy as np
from sklearn.metrics import make_scorer

def wape(y_true, y_pred):
    '''Calculate the Weighted Absolute Percentage Error (WAPE) between true and predicted values.
    y_true: Array of true target values.
    y_pred: Array of predicted values.'''
    denominator = np.sum(np.abs(y_true))
    if denominator == 0:
        return 0.0
    result = np.sum(np.abs(y_true - y_pred)) / denominator

    if np.isnan(result) or np.isinf(result):
        return 1.0  

    return result