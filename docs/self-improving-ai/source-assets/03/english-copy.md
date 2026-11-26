# Original pages 11–15: English localization copy

Source: Hung-yi Lee, NTU ML2026, *Self-Improving*, Part 1. The cover is page 1. This adaptation covers original pages 11–15, in that order.

## Chinese → English mapping

| Original page | Object | Original Chinese | English used |
| --- | --- | --- | --- |
| 11 | Native title, shape 2 | 由 AI 自己產生答案 | AI-Generated Answers |
| 11 | Caption embedded in image24.png | AI 能自我修正嗎？從 decoding、workflow 到 reasoning 的技術發展整理 | Can AI Self-Correct? Advances from Decoding and Workflow to Reasoning |
| 12 | Native title, shape 2 | 由 AI 自己產生答案：自我修正 | AI-Generated Answers: Self-Correction |
| 13 | Native title, shape 2 | 由 AI 自己產生答案：自我修正 | AI-Generated Answers: Self-Correction |
| 14 | No Chinese text | — | Existing English retained |
| 15 | Native title, shape 2 | 人類如何讓 AI 成長？ | How Do Humans Help AI Improve? |

## Full visible English copy by page

### Original page 11

- Title: **AI-Generated Answers**
- Thumbnail heading: **Self-Correction**
- Thumbnail caption: **Can AI Self-Correct? Advances from Decoding and Workflow to Reasoning**
- Original source URL: `https://youtu.be/m3i2mk5hs8U?si=G-a9b_gCEnpaEfiF`

### Original page 12

- Title: **AI-Generated Answers: Self-Correction**
- First row: **Input → LLM → output → Detection + Correction → corrected**
- Second row: **Input → LLM → output**, followed by **reflection**, then **LLM → corrected**
- Third row: **Input → LLM → reasoning → LLM → corrected**

The sequence descriptions above are reading aids. All original connectors and boxes remain in their original positions; no connector was added or deleted.

### Original page 13

- Title: **AI-Generated Answers: Self-Correction**
- Upper row: **Input → LLM → output**, ellipsis, **Self-correction → corrected**
- Model annotation: **Nothing changes …**
- Lower row: **Input → LLM → output**

### Original page 14

- Upper row: **Input → LLM → output**, ellipsis, **Self-correction → corrected**
- Vertical update annotation: **Fine-tune model parameters**
- Middle row: **Input → LLM → ?????**, with the original bidirectional dashed connector to **corrected**
- Lower row: **Input → LLM → corrected**
- There is no title on the original page and no new title was added.

### Original page 15

- Title: **How Do Humans Help AI Improve?**
- Inputs: **Input x¹**, **Input x²**, vertical ellipsis, **Input xᴺ**
- Model formula: \(y=f_\theta(x)\)
- Outputs: **output y¹**, **output y²**, vertical ellipsis, **output yᴺ**
- Per-example evaluation: \(l(y,\hat y)\), \(l^1\), \(l^2\), \(l^N\)
- **Loss**: \(L=\sum_{n=1}^N l^n\)
- **Supervised Learning**: **output y**, **answer ŷ**, \(l=d(y,\hat y)\)
- **Reinforcement Learning**: **output y → Reward function → l**

The original notation is preserved: **y is the model output; ŷ is the target answer.** All equation XML, subscripts, superscripts, summation limits and diagrams are from the original PPTX.

## Typography changes

- Translated title fonts: Arial, 44 pt on page 11, 38 pt on pages 12 and 13, 36 pt on page 15.
- Existing English labels were not reworded. Only the following text formatting was changed to avoid rendering-induced line breaks:
  - Page 12, shape 19, **reflection**: Arial 24 pt.
  - Pages 13 and 14, shape 10, **Self-correction**: Arial 20 pt.
  - Page 15, shapes 12 and 13, **Supervised Learning** / **Reinforcement Learning**: Arial 22 pt, original bold retained.
  - Page 15, shape 21, **Reward function**: Arial 22 pt.

Every text-box and diagram geometry is unchanged.
