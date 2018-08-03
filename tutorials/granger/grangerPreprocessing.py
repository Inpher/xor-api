import argparse
import numpy as np
import pandas as pd

# parsing arguments
parser = argparse.ArgumentParser(description='Preprocesses a time series for the computation of granger causality using XOR Secret Computing')
parser.add_argument('--input', help='path for input time series (.csv)', required=True)
parser.add_argument('--output', help='path for output (.csv)', required=False, default='out.csv')
parser.add_argument('--column', help='column containing the y of the time series (integer)', type=int, required=False, default=-1)
parser.add_argument('--lag-max', help='upper bound lag q (integer)', type=int, required=True)
parser.add_argument('--lag-min', help='lower bound lag p (integer)', type=int, required=True)
args = vars(parser.parse_args())

# reading time series
df = pd.read_csv(args['input'])
timeSeries = pd.to_numeric(df.iloc[:,args['column']], errors='coerce').dropna().values
lenTimeSeries = np.shape(timeSeries)[0]

# sanity check
lag_min = args['lag_min']
lag_max = args['lag_max']
assert lag_min >= 0,  "lower bound must be larger or equal to zero!"
assert lag_min <= lag_max, "lower bound must be smaller or equal upper bound!"
assert lenTimeSeries > lag_max, "upper bound must be strictly smaller then the length of the time series!"

# populating output matrix
out = np.zeros((lenTimeSeries - lag_max, lag_max - lag_min + 1)) 
for t in reversed(range(lag_max, lenTimeSeries)):
    out[lenTimeSeries - t - 1] = timeSeries[t - lag_max : t - lag_min + 1]

# writing file
header = np.array([ 'h' + str(i) for i in range(0, lag_max + 1)])
np.savetxt(args['output'], out, fmt='%.9f', delimiter=',', header=','.join(header))
