import pandas as pd
#import seaborn as sns
#import matplotlib.pyplot as plt
#from sklearn.preprocessing import MinMaxScaler
#from sklearn.decomposition import PCA
#import numpy as np
import os


file_path = "/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/Vibration09122023/SpgB/senSpgB_s80W0.00.csv"

        
# 데이터 로드
data = pd.read_csv(file_path)
col = pd.read_excel("/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/Vibration09122023/Signalingk.xlsx", nrows=1)
    
data = pd.concat([data.iloc[:, 5], data.iloc[:, 6], data.iloc[:, 7], data.iloc[:, 20:]], axis=1)
data.columns = col.columns

# 데이터 전처리 및 이상치 제거 수행
filtered_data = pd.DataFrame()
for column in data.columns:
    Q1 = data[column].quantile(0.25)
    Q3 = data[column].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    filtered_column = data[(data[column] >= lower_bound) & (data[column] <= upper_bound)]
    filtered_data = pd.concat([filtered_data, filtered_column], axis=1)

    print("완료" + str(column)) 


data1 = data.iloc[:, 4:2051]
data2 = data.iloc[:, 2052:]
print("분할 완료")
