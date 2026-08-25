#파일 읽기
import pandas as pd

# CSV 파일 경로 지정
file_path = "/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/ALL.csv"

# CSV 파일 읽기
df = pd.read_csv(file_path, skiprows=range(1,7000),nrows=1)

print(df)

df = pd.read_csv(file_path)
print(df.head(5))



