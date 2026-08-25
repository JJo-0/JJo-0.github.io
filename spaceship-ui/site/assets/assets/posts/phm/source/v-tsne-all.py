import pandas as pd
import os
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

# Sensor 값 대치를 위한 딕셔너리
sensor_dict = {'H': 1, 'B': 2, 'F': 3}

# 모든 데이터를 저장할 빈 데이터프레임 생성
df_all = pd.DataFrame()

# CSV 파일 읽기
file_path = '/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/ALL_Label.csv'

# 데이터를 분할하여 읽기
chunksize = 1000  # 한 번에 읽을 행의 수
chunks = []  # 각 분할을 저장할 리스트
for chunk in pd.read_csv(file_path, chunksize=chunksize):
    # "label Data"가 들어간 열 제거
    time_columns = [col for col in chunk.columns if 'Time Data' in col]
    chunk = chunk.drop(columns=time_columns)

    # 'Sensor' 열의 값을 대치
    chunk['Sensor'] = chunk['Sensor'].map(sensor_dict)

    # 'Speed', 'Weight' 열 제거
    chunk = chunk.drop(['Speed', 'Weight'], axis=1)

    # 분할을 리스트에 추가
    chunks.append(chunk)

# 모든 분할을 하나의 데이터프레임으로 결합
df_all = pd.concat(chunks, ignore_index=True)

# t-SNE 모델 생성 및 학습
tsne = TSNE(n_components=2)
df_tsne = tsne.fit_transform(df_all)

# 시각화
plt.figure(figsize=(8, 6))
scatter = plt.scatter(df_tsne[:, 0], df_tsne[:, 1], c=df_all['Sensor'], cmap='viridis')
plt.xlabel('t-SNE Feature 1')
plt.ylabel('t-SNE Feature 2')
plt.title('2-d visualization of t-SNE')
plt.legend(handles=scatter.legend_elements()[0], labels=sensor_dict.keys())
plt.show()
