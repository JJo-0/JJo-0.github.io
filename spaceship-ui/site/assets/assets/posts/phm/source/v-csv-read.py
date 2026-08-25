############################################
# 파일 읽기
# 파일 크기 확인
# 파일 분할
############################################

import pandas as pd

file_path = '/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/Vibration09122023/Gear_Vibration_Data.csv'  # 실제 파일 경로로 변경해주세요.
chunk_size = 1000  # 청크 단위 크기 (조정 가능)

total_size = 0  # 전체 데이터 크기 (바이트 단위)
total_rows = 0  # 전체 행 개수

# 청크 단위로 파일 읽기
for chunk in pd.read_csv(file_path, chunksize=chunk_size):
    chunk_size_bytes = chunk.memory_usage(deep=True).sum()  # 청크의 크기 계산 (바이트 단위)
    total_size += chunk_size_bytes  # 전체 데이터 크기 누적
    total_rows += len(chunk)  # 전체 행 개수 누적

print(f'전체 행 개수: {total_rows} 개')


#파일 옮기는 코드
'''
import shutil

# 원본 파일 경로
src = "/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/ALL_Label.csv"

# 목적지 파일 경로
dst = "/Volumes/NO NAME/Data"

# 파일 옮기기
shutil.move(src, dst)
'''

#파일 분할하는 코드
'''def split_file(file_name, chunk_size, output_path):
    try:
        with open(file_name, 'rb') as f:
            index = 0
            while True:
                chunk = f.read(chunk_size)
                if not chunk:
                    break
                output_file = f'{output_path}/part_{index}.csv'
                with open(output_file, 'wb') as out:
                    out.write(chunk)
                index += 1
        print(f'파일이 성공적으로 분할되었습니다. 총 {index}개의 작은 파일이 생성되었습니다.')
    except Exception as e:
        print(f'파일 분할 중 오류가 발생하였습니다: {str(e)}')

# 사용 예시
file_name = '/Volumes/저장/대학교/연구실/AI/Data/Vibration Dataset/ALL_Label.csv'  # 분할할 파일명
chunk_size = 1024 * 1024 * 1024 * 3  # 분할 크기 (3GB)
output_path = '/Volumes/NO NAME/Data'  # 분할된 파일들을 저장할 경로

split_file(file_name, chunk_size, output_path)
'''
