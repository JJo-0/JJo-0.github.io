import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.preprocessing import StandardScaler
import os

# 모든 데이터를 저장할 빈 데이터프레임 생성
df_all = pd.DataFrame()

# 엑셀 파일 읽기
df_info = pd.read_excel('/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/Vibration09122023/Signalingk 열 정보.xlsx')

# 모든 csv 파일에 대해 반복
for filename in os.listdir('/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/Vibration09122023/ALL'):
    if filename.endswith('.csv'):
        # CSV 파일 읽기
        df_data = pd.read_csv(f'/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/Vibration09122023/ALL/{filename}', header=None)

        # 첫 행에 엑셀 파일의 데이터 추가
        df_data.columns = df_info.columns.tolist()

        # 필요 없는 열 삭제
        df_data = df_data.drop(['uSplFreqMes', 'nDataConv', 'uScaleIdx', 'uAlarmCur', 'sSvsWork', 'sSvsWork.1', 'sSvsWork.2', 'sSvsWork.3', 'sSvsWork.4', 'sSvsWork.5', 'sSvsWork.6', 'sSvsWork.7', 'sSvsWork.8', 'sSvsWork.9', 'sSvsWork.10', 'sSvsWork.11', 'sSvsWork.12'], axis=1)
        
        
        # 'Time Peak', 'Time RMS', 'Crestfactor' 열을 따로 저장
        #df_peak_rms_crest = df_data[['Time Peak', 'Time RMS', 'Crestfactor']]

        ## Time Data 열에 대해서 IQR 연산
        #time_data_columns = [col for col in df_data.columns if 'Time Data' in col]
        #df_time = df_data[time_data_columns]

        #Q1_time = df_time.quantile(0.25, axis=1)
        #Q3_time = df_time.quantile(0.75, axis=1)
        #IQR_time = Q3_time - Q1_time

        #lower_bound_time = Q1_time - 1.5 * IQR_time
        #upper_bound_time = Q3_time + 1.5 * IQR_time

        #df_time = df_time.T.apply(lambda x: [upper_bound_time[x.name] if v > upper_bound_time[x.name] else lower_bound_time[x.name] if v < lower_bound_time[x.name] else v for v in x]).T

        # FFT Data 열에 대해서 IQR 연산
        #fft_data_columns = [col for col in df_data.columns if 'FFT Data' in col]
        #df_fft = df_data[fft_data_columns]

        #Q1_fft = df_fft.quantile(0.25, axis=1)
        #Q3_fft = df_fft.quantile(0.75, axis=1)
        #IQR_fft = Q3_fft - Q1_fft

        #lower_bound_fft = Q1_fft - 1.5 * IQR_fft
        #upper_bound_fft = Q3_fft + 1.5 * IQR_fft

        #df_fft = df_fft.T.apply(lambda x: [upper_bound_fft[x.name] if v > upper_bound_fft[x.name] else lower_bound_fft[x.name] if v < lower_bound_fft[x.name] else v for v in x]).T

        # 데이터프레임 병합
        #df_data = pd.concat([df_peak_rms_crest, df_time, df_fft], axis=1)

        # 정규화
        #scaler = MinMaxScaler()
        #df_normalized = pd.DataFrame(scaler.fit_transform(df_data), columns=df_data.columns)
        # 표준화
        #scaler = StandardScaler()
        #df_standardized = pd.DataFrame(scaler.fit_transform(df_data), columns=df_data.columns)

        # 라벨링 추가
        sensor = filename.split('_')[0]
        speed = filename.split('_')[1][1:].split('W')[0]
        weight = filename.split('W')[1].split('.csv')[0]

        if sensor == 'senMoto':
            sensor = 'F'
        elif sensor == 'senSpgG':
            sensor = 'H'
        elif sensor == 'senSpgB':
            sensor = 'B'
        
        # 정규화
        #df_normalized['Sensor'] = sensor
        #df_normalized['Speed'] = speed
        #df_normalized['Weight'] = weight
        # 표준화
        #df_standardized['Sensor'] = sensor
        #df_standardized['Speed'] = speed
        #df_standardized['Weight'] = weight
        # 그냥 데이터
        df_data['Sensor'] = sensor
        df_data['Speed'] = speed
        df_data['Weight'] = weight


        # 모든 데이터를 저장하는 데이터프레임에 추가
        #df_all = pd.concat([df_all, df_normalized])
        #df_all = pd.concat([df_all, df_standardized])
        df_all = pd.concat([df_all, df_data])

# 모든 데이터를 저장하는 데이터프레임을 csv 파일로 저장
df_all.to_csv('/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/ALL.csv', index=False)

