import numpy as np
import math

def to_python_types(obj):
    if isinstance(obj, dict):
        return {to_python_types(k): to_python_types(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [to_python_types(i) for i in obj]
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.floating):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, float) and math.isnan(obj):
        return None 
    return obj



def safe(val):
    if isinstance(val, float) and math.isnan(val):
        return None
    return val