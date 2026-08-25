'''import pandas as pd
import os
from sklearn.decomposition import PCA

import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import seaborn as sns

# Sensor 값 대치를 위한 딕셔너리
sensor_dict = {'H': 1, 'B': 2, 'F': 3}

# 모든 데이터를 저장할 빈 데이터프레임 생성
df_all = pd.DataFrame()

# CSV 파일 읽기
file_path = '/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/ALL_Label.csv'

# 데이터를 분할하여 읽기
chunksize = 10000  # 한 번에 읽을 행의 수
chunks = []  # 각 분할을 저장할 리스트
for chunk in pd.read_csv(file_path, chunksize=chunksize):
    # "label Data"가 들어간 열 제거
    time_columns = [col for col in chunk.columns if 'Time Data' in col]
    chunk = chunk.drop(columns=time_columns)

    # 'Sensor' 열의 값을 대치
    chunk['Sensor'] = chunk['Sensor'].map(sensor_dict)

    # 'Sensor', 'Speed', 'Weight' 열 제거
    chunk = chunk.drop(['Speed', 'Weight'], axis=1)
    
    # 분할을 리스트에 추가
    chunks.append(chunk)

# 모든 분할을 하나의 데이터프레임으로 결합
df_all = pd.concat(chunks, ignore_index=True)'''
'''# "Time Data"가 들어간 열 제거
time_columns = [col for col in df_data.columns if 'Time Data' in col]
df_data = df_data.drop(columns=time_columns)
print(df_data.head(3))

# 'Sensor', 'Speed', 'Weight' 열 제거
df_pre_pca = df_data.drop(['Sensor', 'Speed', 'Weight'], axis=1)
print(df_pre_pca.head(3))'''

'''# PCA를 적용하여 차원 축소
pca = PCA(n_components=0.99)
#df_pca = pca.fit_transform(df_pre_pca)
df_pca = pca.fit_transform(df_all)

# PCA 결과의 설명력 출력
explained_variance_ratio = pca.explained_variance_ratio_
print("PCA 결과의 설명력:")
print(explained_variance_ratio)

# 전체 설명력 출력
total_explained_variance_ratio = sum(explained_variance_ratio)
print("전체 설명력:")
print(total_explained_variance_ratio)

# PCA 후 주성분의 개수 출력
num_components = len(pca.components_)
print("PCA 후 주성분의 개수:")
print(num_components)

# 시각화
plt.figure(figsize=(8, 6))
scatter = plt.scatter(df_pca[:, 0], df_pca[:, 1], c=df_all['Sensor'], cmap='viridis')
plt.xlabel('PCA Feature 1')
plt.ylabel('PCA Feature 2')
plt.title('2-d visualization of PCA')
plt.legend(handles=scatter.legend_elements()[0], labels=sensor_dict.keys())
plt.show()
'''


import pandas as pd
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

# Sensor 값 대치를 위한 딕셔너리
#sensor_dict = {'G': 1, 'B': 2, 'M': 3}
#sensor_dict = {'H': 1, 'B': 2, 'F': 3}

# CSV 파일 경로
file_path = '/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/result.csv'

# 데이터를 분할하여 읽기
chunksize = 10000  # 한 번에 읽을 행의 수
chunks = []  # 각 분할을 저장할 리스트
for chunk in pd.read_csv(file_path, chunksize=chunksize):
    # "label Data"가 들어간 열 제거
    label_columns = [col for col in chunk.columns if 'Label' in col]
    chunk = chunk.drop(columns=label_columns)

    #chunk = chunk.drop(['Label1', 'Label2'], axis=1)
    #chunk = chunk.drop(['Speed', 'Weight'], axis=1)
    # 'Sensor' 열의 값을 대치
    #chunk['Sensor'] = chunk['Sensor'].map(sensor_dict)
    

    # 인덱스 0부터 2047까지의 열 제거
    chunk = chunk.drop(columns=[str(i) for i in range(2048)])
    #time_columns = [col for col in chunk.columns if 'Time Data' in col]
    #chunk = chunk.drop(columns=time_columns)
    
    # 분할을 리스트에 추가
    chunks.append(chunk)

# 모든 분할을 하나의 데이터프레임으로 결합
df_all = pd.concat(chunks, ignore_index=True)
df_all = df_all.dropna()

# PCA를 적용하여 차원 축소
pca = PCA(n_components=12)
df_pca = pca.fit_transform(df_all)

# PCA 결과의 설명력 출력
explained_variance_ratio = pca.explained_variance_ratio_
print("PCA 결과의 설명력:")
print(explained_variance_ratio)

# 전체 설명력 출력
total_explained_variance_ratio = sum(explained_variance_ratio)
print("전체 설명력:")
print(total_explained_variance_ratio)

# PCA 후 주성분의 개수 출력
num_components = len(pca.components_)
print("PCA 후 주성분의 개수:")
print(num_components)
'''
# 시각화
plt.figure(figsize=(8, 6))
scatter = plt.scatter(df_pca[:, 0], df_pca[:, 1], c=df_all['Sensor'], cmap='viridis')
plt.xlabel('PCA Feature 1')
plt.ylabel('PCA Feature 2')
plt.title('2-d visualization of PCA')
plt.legend(handles=scatter.legend_elements()[0], labels=sensor_dict.keys())
plt.show()'''
