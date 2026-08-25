import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.preprocessing import StandardScaler

# 엑셀 파일 읽기
df_info = pd.read_excel('/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/Vibration09122023/Signalingk 열 정보.xlsx')

# CSV 파일 읽기
df_data = pd.read_csv('/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/Vibration09122023/Moto/senMoto_s80W0.00.csv', header=None)

# 첫 행에 엑셀 파일의 데이터 추가
df_data.columns = df_info.columns.tolist()

# 필요 없는 열 삭제
df_data = df_data.drop(['uSplFreqMes', 'nDataConv', 'uScaleIdx', 'uAlarmCur', 'sSvsWork', 'sSvsWork.1', 'sSvsWork.2', 'sSvsWork.3', 'sSvsWork.4', 'sSvsWork.5', 'sSvsWork.6', 'sSvsWork.7', 'sSvsWork.8', 'sSvsWork.9', 'sSvsWork.10', 'sSvsWork.11', 'sSvsWork.12'], axis=1)

# 데이터 확인 (처음 5개 행, 마지막 5개 행 출력)
print(df_data.head(5))
print(df_data.tail(5))

# 'Time Peak', 'Time RMS', 'Crestfactor' 열을 따로 저장
df_peak_rms_crest = df_data[['Time Peak', 'Time RMS', 'Crestfactor']]

# Time Data 열에 대해서 IQR 연산
time_data_columns = [col for col in df_data.columns if 'Time Data' in col]
df_time = df_data[time_data_columns]

# 원본 데이터의 첫 행 'Time Data' 시각화
#plt.figure(figsize=(10, 6))
#sns.boxplot(data=df_time.iloc[0, :])
#plt.title('Boxplot of First Row in Original Time Data')
#plt.show()

Q1_time = df_time.quantile(0.25, axis=1)
Q3_time = df_time.quantile(0.75, axis=1)
IQR_time = Q3_time - Q1_time

lower_bound_time = Q1_time - 1.5 * IQR_time
upper_bound_time = Q3_time + 1.5 * IQR_time

df_time = df_time.T.apply(lambda x: [upper_bound_time[x.name] if v > upper_bound_time[x.name] else lower_bound_time[x.name] if v < lower_bound_time[x.name] else v for v in x]).T

# FFT Data 열에 대해서 IQR 연산
fft_data_columns = [col for col in df_data.columns if 'FFT Data' in col]
df_fft = df_data[fft_data_columns]

# 원본 데이터의 첫 행 'FFT Data' 시각화
#plt.figure(figsize=(10, 6))
#sns.boxplot(data=df_fft.iloc[0, :])
#plt.title('Boxplot of First Row in Original FFT Data')
#plt.show()

Q1_fft = df_fft.quantile(0.25, axis=1)
Q3_fft = df_fft.quantile(0.75, axis=1)
IQR_fft = Q3_fft - Q1_fft

lower_bound_fft = Q1_fft - 1.5 * IQR_fft
upper_bound_fft = Q3_fft + 1.5 * IQR_fft

df_fft = df_fft.T.apply(lambda x: [upper_bound_fft[x.name] if v > upper_bound_fft[x.name] else lower_bound_fft[x.name] if v < lower_bound_fft[x.name] else v for v in x]).T

# 데이터프레임 병합
df_data = pd.concat([df_peak_rms_crest, df_time, df_fft], axis=1)

# 이상치 처리 후 데이터의 첫 행 'Time Data' 시각화
#plt.figure(figsize=(10, 6))
#sns.boxplot(data=df_time.iloc[0, :])
#plt.title('Boxplot of First Row in Processed Time Data')
#plt.show()

# 이상치 처리 후 데이터의 첫 행 'FFT Data' 시각화
#plt.figure(figsize=(10, 6))
#sns.boxplot(data=df_fft.iloc[0, :])
#plt.title('Boxplot of First Row in Processed FFT Data')
#plt.show()
# 데이터 확인 (처음 5개 행, 마지막 5개 행 출력)
print(df_data.head(5))
print(df_data.tail(5))

# 수정한 데이터 다른 이름으로 저장
df_data.to_csv('/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/Vibration_edit/s80/w0.00/senMoto_is80W0.00.csv', index=False)

# 정규화
scaler = MinMaxScaler()
df_normalized = pd.DataFrame(scaler.fit_transform(df_data), columns=df_data.columns)
# 정규화된 데이터 확인 (처음 5개 행, 마지막 5개 행 출력)
print(df_normalized.head(5))
print(df_normalized.tail(5))

# 표준화
scaler = StandardScaler()
df_standardized = pd.DataFrame(scaler.fit_transform(df_data), columns=df_data.columns)
# 표준화된 데이터 확인 (처음 5개 행, 마지막 5개 행 출력)
print(df_standardized.head(5))
print(df_standardized.tail(5))

# 정규화된 데이터 저장
df_normalized.to_csv('/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/Vibration_edit/s80/w0.00/senMoto_is80W0.00_normalized.csv', index=False)
# 표준화된 데이터 저장
df_standardized.to_csv('/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/Vibration_edit/s80/w0.00/senMoto_is80W0.00_standardized.csv', index=False)


