# 05장 수치 예제

Python3과NumPy·Matplotlib이필요하다.저장소루트에서`python3 docs/robot-learning/labs/05-policy-gradients/policy_examples.py`를실행한다.결과는이폴더results와게시글assets에생성된다.고정seed23,19개수치확인.

상태하나·두행동문제에서REINFORCE를1,500회,회당64개표본으로실행했다.보상은각행동에서Bernoulli(0.2/0.8),baseline0.5고정,학습률0.08이다.기대보상은0.5에서최종약0.79054로증가했다.성능보편화를의도한벤치마크가아니다.

별도의정확계산은확률0.7/0.3·수익99/101에서점수함수기울기0.42,분산최소baseline100.4와V99.6차이,N2자기배치평균편향과leave-one-out,importance평균,양수·음수PPOclip,SACsoftTD1.676·종료처리,재매개변수화유한차분·tanh밀도보정을확인한다.

PPO/SAC신경망,공식과제,물리로봇학습은실행하지않았다.그래프3개는위계산으로직접생성했다.
