---
title: "Raspberry pi 5 설정"
date: 2024-04-05 02:06:00
categories:
  - 정리
  - 하드웨어
  - AMR
tags:
  - ubuntu
  - raspberry pi
toc: true
toc_sticky: true
toc_label: "Raspberry pi 5 설정"
---

# 🍽️ Raspberry pi 5 설정   
라즈베리파이 5 시키고 환경설정을 정리하기 위해 글을 끄적여본다.    

    
🚨 대용량 파일 처리가 Colab에서 안된다는 것을 깨닫고.. 로컬에서 돌렸다. 파이썬으로!  

### 데이터 전처리, 데이터 합치기 (Data Preprocessing, Data Merging)   
---
데이터 전처리는 파일 명 안에 어떤 형태인지 다 모아놨을 텐데, 이를 한 개의 데이터로 합치는 과정이다.    
먼저 비지도 학습, PCA를 써보기 위해서 데이터를 합쳐보자.   
```python
import pandas as pd
import os
from sklearn.decomposition import PCA

# 모든 데이터를 저장할 빈 데이터프레임 생성
df_all = pd.DataFrame()

# 엑셀 파일 읽기
df_info = pd.read_excel('/Volumes/{열에대한정보파일}.xlsx')

# 모든 csv 파일에 대해 반복
for filename in os.listdir('/Volumes/Data'):
    if filename.endswith('.csv'):
        # CSV 파일 읽기
        df_data = pd.read_csv(f'/Volumes/Data/{filename}', header=None)

        # 첫 행에 엑셀 파일의 데이터 추가
        df_data.columns = df_info.columns.tolist()
        # 필요 없는 열 삭제
        df_data = df_data.drop(['필요없는 속성 삭제'], axis=1)
        # "Time Data"가 들어간 열 제거
        time_columns = [col for col in df_data.columns if 'Time Data' in col]
        df_data = df_data.drop(columns=time_columns)
        
        # 데이터 출력
        print(df_data.head(3))

        # df_data를 df_all에 붙이기
        df_all = pd.concat([df_all, df_data])

# 데이터 출력
# PCA를 적용하여 차원 축소, 99%의 분산을 유지하도록 함 = 99%의 정보를 유지하도록 함
# whiten=True로 설정하여 데이터를 정규화(Normalization)함
pca = PCA(n_components=0.99, whiten=True)
df_all_pca = pca.fit_transform(df_all)

# PCA 결과의 설명력 출력
explained_variance_ratio = pca.explained_variance_ratio_
print("PCA 결과의 설명력:")
print(explained_variance_ratio)

```   
비지도 학습을 위해 PCA를 적용하였다.
```    
PCA 결과의 설명력:
[0.78608101 0.09318127 0.0513852  0.03209065 0.01289721 0.00484044
 0.00421308 0.0034297  0.00244788] 
 ```    
    
### 데이터 시각화 (Data Visualization)
---
데이터 시각화가 먼저인 것을 깨달았다. 시각화가 안된 데이터를 가지고 돌릴 때 왜 이런 데이터가 높은 분산을 가지는지.. 아니면 왜 안나오는지, 설명할 수 가 없었다. 그래서 먼저 데이터 시각화를 하려고 한다.       
16GB 되는 데이터를 시각화를 하는 것은 말도 안되기 때문에 이것을 어떻게 하면 줄일까?, 어떻게 하면 효율적으로 시간을  



