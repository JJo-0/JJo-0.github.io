---
title: 'Navier–Stokes 방정식이란? AI가 난제를 풀었다는 말 쉽게 보기'
labels: 'AI, 수학, 유체역학, 연구해설'
---

## 한 문장으로 먼저

Navier–Stokes 방정식은 물과 공기의 흐름을 설명하는 식입니다. OpenAI는 이 식의 3차원 해가 특정 조건에서 매끄러움을 잃을 수 있다는 증명 후보를 공개했지만, 아직 Clay Mathematics Institute가 공식 해결로 인정한 것은 아닙니다.

![비행기 뒤에서 연기로 드러난 실제 공기 소용돌이](https://upload.wikimedia.org/wikipedia/commons/f/fe/Airplane_vortex_edit.jpg)

커피에 우유를 떨어뜨리고 저으면 가느다란 줄과 소용돌이가 생깁니다. 눈으로는 자연스럽게 보이지만, 모든 위치의 속도와 압력이 다음 순간 어떻게 변할지 수학으로 완전히 보장하는 일은 어렵습니다. Navier–Stokes 방정식은 시간에 따른 속도 변화, 흐름이 스스로를 옮기는 효과, 압력, 점성을 한 식에 담습니다.

## 방정식이 이미 있는데 무엇이 문제였을까?

계산 규칙을 아는 것과 모든 가능한 입력에서 문제가 생기지 않는다고 증명하는 것은 다릅니다. 날씨나 항공기 주변 공기를 컴퓨터로 계산할 수 있다는 사실만으로, 허용된 모든 3차원 흐름의 해가 영원히 매끄럽다고 결론 내릴 수는 없습니다.

<div data-blogger-equation="navier-stokes" role="figure" aria-label="외력이 있는 비압축성 Navier–Stokes 운동량 방정식과 비압축 조건" style="box-sizing:border-box;width:100%;margin:1.8rem 0;padding:clamp(16px,4vw,28px);overflow:hidden;border:1px solid #cfc8b8;border-radius:12px;background:#f8f4ea;color:#1d211c;">
  <p style="margin:0 0 14px;font-weight:800;line-height:1.45;">방정식은 흐름을 쓰지만, 모든 해의 매끄러움까지 보장하지는 않습니다.</p>
  <div aria-label="운동량 방정식" style="box-sizing:border-box;width:100%;padding:16px 12px;overflow-x:auto;border-radius:10px;background:#255985;color:#fff;text-align:center;white-space:nowrap;font-family:Georgia,'Times New Roman',serif;font-size:clamp(17px,4.3vw,28px);line-height:1.5;">
    &#8706;u/&#8706;t + (u&#183;&#8711;)u = &minus;&#8711;p + &nu;&#916;u + f
  </div>
  <p style="margin:10px 0 18px;text-align:center;font-size:clamp(15px,3.8vw,21px);line-height:1.5;"><strong>비압축 조건:</strong> &#8711;&#183;u = 0</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(108px,1fr));gap:8px;">
    <div style="padding:10px 8px;border-radius:9px;background:#d9eaf7;text-align:center;"><strong>시간 변화</strong><br><span aria-label="partial u over partial t">&#8706;u/&#8706;t</span></div>
    <div style="padding:10px 8px;border-radius:9px;background:#d9eaf7;text-align:center;"><strong>흐름의 자기 이동</strong><br>(u&#183;&#8711;)u</div>
    <div style="padding:10px 8px;border-radius:9px;background:#d9eaf7;text-align:center;"><strong>압력의 밀기</strong><br>&minus;&#8711;p</div>
    <div style="padding:10px 8px;border-radius:9px;background:#d9eaf7;text-align:center;"><strong>점성의 완화</strong><br>&nu;&#916;u<br><small>&nu;는 그리스 문자 뉴</small></div>
    <div style="padding:10px 8px;border-radius:9px;background:#d9eaf7;text-align:center;"><strong>바깥의 힘</strong><br>f</div>
  </div>
  <p style="margin:16px 0 0;padding:12px;border-radius:9px;background:#315e51;color:#fff;text-align:center;line-height:1.55;"><strong>정칙성 질문</strong><br>3차원에서 유한 에너지 해가 항상 매끄러운가, 아니면 유한 시간에 특이점이 생길 수 있는가?</p>
</div>

도식의 `u`는 속도장, `p`는 밀도로 나눈 압력, `ν`는 점성을 나타내는 그리스 문자 뉴(nu), `f`는 바깥에서 가하는 외력을 나타냅니다. 여기서 `ν`는 영어 소문자 `v`가 아닙니다. 첫째 줄은 흐름의 시간 변화와 자기 이동이 압력·점성·외력과 균형을 이루는 운동량 방정식입니다. 둘째 줄의 `∇·u = 0`은 밀도가 일정한 비압축성 유체가 한 지점에서 갑자기 생기거나 사라지지 않는다는 제약입니다. 핵심 질문은 이 두 식을 만족하며 처음에 잘 정의된 흐름이 계속 매끄러운지, 아니면 어느 순간 속도 같은 값이 통제되지 않을 수 있는지입니다.

## 이번 발표가 말한 것은 무엇일까?

OpenAI는 정지 상태에서 시작한 유체에 특별히 설계한 매끄러운 외력을 가하면, 전체 운동에너지는 유한하지만 최대 속도는 유한 시간 안에 제한 없이 커지는 구성을 만들었다고 발표했습니다. 증명 원고와 Lean 형식화 코드도 함께 공개했습니다.

여기서 외력은 바깥에서 흐름을 미는 힘입니다. 모든 물이나 공기가 실제로 폭주한다는 뜻도 아니고, 실험에서 무한한 속도를 측정했다는 뜻도 아닙니다. Clay가 제시한 여러 해결 경로 가운데 외력이 있는 경우에 대한 수학적 주장입니다.

## 컴퓨터가 검사했으면 끝난 것 아닐까?

Lean은 논리 단계를 정해진 규칙으로 검사할 수 있게 돕습니다. 하지만 원래 문제의 조건과 컴퓨터에 입력한 정의가 같은지, 논문과 코드가 정확히 대응하는지는 독립 연구자가 다시 확인해야 합니다.

![연구 주장 공개부터 형식 검증과 독립 검토, 공식 인정까지의 단계](/assets/news-diagrams/navier-verification-path.svg)

따라서 현재 가장 정확한 표현은 “검증 가능한 증명 후보가 공개됐다”입니다. 회사 발표, 형식 검증 자료, 독립 검토, 학계의 일반적 수용과 공식 인정은 서로 다른 단계입니다.

## 가장 큰 한계

이 결과가 맞더라도 내일의 기상예보나 항공기 설계가 곧바로 좋아지는 것은 아닙니다. 새 계산 알고리즘이나 제품을 발표한 연구가 아니라, 방정식이 허용하는 해의 성질을 다루는 수학 연구이기 때문입니다. 앞으로는 독립 연구자들이 같은 증명과 형식화 코드를 검토하고, 원래 문제의 가정이 끝까지 유지되는지를 확인해야 합니다.

수식의 각 항, Clay의 A·B·C·D 해결 경로, 증명 구성과 검증 범위는 [GitBlog 전체 해설](https://jjo-0.github.io/posts/2026-09-09-navier-stokes-openai-frontier-one/)에서 더 자세히 볼 수 있습니다.

## 공식 자료

- [OpenAI 공식 발표와 공개 원고](https://openai.com/index/navier-stokes-solution/)
- [Clay Mathematics Institute의 공식 문제 페이지](https://www.claymath.org/millennium/navier-stokes-equation/)
- [공개 Lean 형식화 저장소](https://github.com/openai/NavierStokesAndEuler)

위의 소용돌이 사진은 NASA 공개 자료를 바탕으로 한 Wikimedia Commons 파일이며, 두 도식은 JJo가 원문을 설명하기 위해 직접 제작했습니다. 실제 특이점의 측정 사진이나 논문 원본 Figure가 아닙니다.
