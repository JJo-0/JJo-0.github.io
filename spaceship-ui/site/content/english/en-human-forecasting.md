---
title: Pedestrian Trajectory and Human Pose Forecasting
description: How pose forecasting and trajectory prediction compare across architectures, datasets, time horizons,
  interactions, and physical constraints.
pubDate: 2025-02-07
category: vision-perception-neuroscience
subcategory: human-motion
type: research-report
tags:
- human-pose-forecasting
- trajectory-prediction
- motion-prediction
- diffusion-models
- multi-agent
researchArea: vision-pose-human-perception
researchFeatured: true
researchOrder: 2
lang: en
slug: 2025-02-07-human-forecasting
translatedPosts:
  ko-KR: 2025-02-07-human-forecasting
translationKey: en-2025-02-07-human-forecasting
---

---

## Topic

- I came to see how much <strong>forecasting a person's future 3D pose</strong> differs from <strong>predicting the trajectory a pedestrian will follow</strong>. One describes how the body moves. The other describes where the person goes.
- I used Google Gemini's deep research feature to prepare this report on the two tasks.

---

## A comparative review of research on human pose forecasting

### I. Introduction

<strong>Human pose forecasting</strong> is a research problem in computer vision and graphics. Given an observed sequence of human movements, a model predicts future poses or motion.[^1]

People anticipate how others will move so they can navigate complex environments and avoid hazards.[^1] Giving machines a similar ability matters in **robotics, self-driving vehicles, human–computer interaction (HCI), virtual and augmented reality, sports analysis, and healthcare**.[^3]

Early studies concentrated on a single person's motion over **a short horizon, usually about one second or less**.[^1] Work now encompasses **long-term prediction** over several seconds or more,[^1] **multi-agent prediction** that accounts for interactions among people,[^1] **probabilistic prediction** that represents uncertainty,[^3] and **personalized prediction** that adapts to an individual's movement patterns.[^5]

These settings motivate new approaches to producing accurate, realistic forecasts. They also make it important to compare existing methods on the same task.

This report examines **research published from 2020 through 2025**, with particular attention to studies that directly compare methods. It covers prediction models, evaluation datasets and metrics, comparative experiments, strengths and limitations, and directions for future work.

### II. Approaches to human pose forecasting

Several deep learning architectures have shaped the field. Each captures the spatial and temporal structure of movement in a different way.

- **Recurrent neural networks (RNNs)**
  - Early studies often used RNNs such as long short-term memory networks (LSTMs) because they can process a sequence one step at a time.[^3]
  - They encode the temporal context of earlier movements to predict the pose in the next frame.
  - Learning dependencies over long sequences is difficult, and errors accumulate. These effects **limit long-horizon forecasts**.[^10]

- **Graph convolutional networks (GCNs)**
  - A GCN represents the skeleton as a graph and explicitly models spatial relationships between joints.[^3]
  - It can capture interactions between body parts. Models such as DMST-GRNN[^10] combine graph and recurrent operations to learn both spatial and temporal features.

- **Transformers**
  - After their success in natural language processing, transformers attracted attention in pose prediction because attention can **represent dependencies between distant sequence elements**.[^10]
  - A transformer can learn relationships across joints and across time, a promising property for longer horizons.
  - MotionBERT,[^18] for example, uses a transformer encoder pretrained on a large dataset and performs well on several downstream tasks.

- **Variational autoencoders (VAEs) and generative adversarial networks (GANs)**
  - Generative models can represent the **uncertainty and multiple plausible outcomes** of future motion.[^3]
  - They learn a distribution of future sequences. Sampling from it can produce varied, realistic motions for the same observation.
  - Parsaeifard and colleagues used a VAE in a generative approach to local pose dynamics.[^3]

- **Diffusion models**
  - Results in image and video generation have encouraged researchers to apply diffusion to human motion prediction and generation.[^4]
  - These models can learn complex data distributions and produce **high-quality, diverse samples**.
  - Examples include MDM,[^29] PhysDiff,[^12] and AAMDM.[^30]

- **Hybrid and decoupled models**
  - Some approaches model the global trajectory separately from the local body pose.[^1]
  - This decomposition can manage complexity and improve performance, especially over long horizons or with multiple agents.
  - The T2P model reported good results with this approach.[^2]

The choice depends on the horizon, the number of agents, whether a single outcome or a distribution is needed, and the demands of the application. One system can combine several methods.

### III. Benchmark datasets and evaluation metrics

Comparable results require standardized datasets and metrics appropriate to the prediction task.

#### A. Major benchmark datasets

Datasets differ in recording environment, number of participants, kinds of motion, and annotation accuracy.

- **Human3.6M (H3.6M)**[^5]
  - One of the most widely used indoor datasets for 3D human pose prediction and related tasks.[^5]
  - A marker-based motion capture system provides **3.6 million annotated 3D poses**.
  - Recordings mainly show individuals performing everyday activities. A common short-term benchmark observes 0.4 seconds and predicts the next second.[^5]
  - **Limitations.** A controlled setting, limited movement diversity, and an emphasis on average patterns of motion.[^5]

- **CMU Motion Capture (CMU MoCap)**[^5]
  - A large collection of movements including walking, running, and sports.[^5]
  - It is often used alongside H3.6M to evaluate both short- and long-term prediction.[^10]

- **HumanEva**[^5]
  - Like H3.6M, this dataset was recorded indoors. It provides 3D motion capture synchronized with video.[^5]

- **AMASS (Archive of Motion Capture as Surface Shapes)**[^18]
  - AMASS brings together multiple motion capture collections and represents them using **SMPL body-model parameters**.[^18]
  - The range of movements and body shapes makes it useful for evaluating generalization.
  - Applications include MotionBERT pretraining[^18] and evaluation of physics-based prediction models.[^33]

- **3DPW (3D Poses in the Wild)**[^1]
  - Video sequences recorded in **real outdoor environments** include 3D pose information obtained using inertial measurement units (IMUs).[^1]
  - The dataset supports evaluation under natural recording conditions.
  - **Limitation.** Interactions are restricted to at most two people.[^1]

- **MuPoTS-3D (Multi-Person Pose Tracking in 3D)**[^1]
  - Multi-view markerless motion capture records the 3D poses of **multiple people** in real environments. The review lists up to 20 people.[^1]
  - The recordings include occlusion and changes in lighting.[^36]

- **JRDB-GMP (JRDB-GlobMultiPose)**[^1]
  - Built on JRDB,[^1] this real-world dataset targets **long-term forecasts of up to five seconds for up to 24 agents**.[^1]
  - It was designed to evaluate forecasts under real interactions that earlier datasets covered poorly.[^1]

- **THÖR**[^37]
  - A high-precision Qualisys motion capture system recorded participants indoors in an environment that included **interactions with a robot**.[^37]
  - Dynamic task assignment produced interactions such as overtaking, stopping, and blocking another participant, broadening the range of behavior.[^37]

Controlled datasets such as H3.6M and CMU MoCap contain limited movement diversity and often emphasize average motion over short horizons.[^1] Robotics and HCI applications may need personalized forecasts for several interacting people over a longer period.[^1]

JRDB-GMP[^1] and THÖR[^37] address some of these limitations by recording more demanding scenarios. They make it possible to test how well a model transfers to realistic environments.

**Table 1. Benchmarks used in human pose forecasting**

| Dataset | Type | Main features | Prediction horizon | Main limitation | Source |
|:--|:--|:--|:--|:--|:--|
| Human3.6M | Indoor, marker-based motion capture | 3.6M 3D poses, mainly single-person activities | Mainly short (~1 s) | Controlled environment, limited motion diversity, emphasis on typical motions | [^5] |
| CMU MoCap | Indoor, marker-based motion capture | Large collection spanning everyday activities and sports | Short and long | Controlled environment | [^5] |
| HumanEva | Indoor, marker-based motion capture | 3D motion capture synchronized with video | Mainly short | Controlled environment | [^5] |
| AMASS | Aggregated motion capture | SMPL parameters, diverse movements and body shapes | Varies | Inherits data from existing motion capture collections | [^18] |
| 3DPW | Outdoor video and IMUs | Real outdoor scenes | Mainly short | Up to two people, potential IMU-based pose errors | [^1] |
| MuPoTS-3D | Indoor and outdoor, markerless motion capture | Multiple views and people (up to 20 in the review), occlusion, lighting changes | Mainly short | Potential markerless pose errors | [^1] |
| JRDB-GMP | Real-world video | Up to five seconds and up to 24 agents in real interactions | Long | Newer benchmark requiring standardization and validation | [^1] |
| THÖR | Indoor, high-precision motion capture | Robot present, dynamic tasks designed to elicit overtaking, stopping, and other interactions | Varies | Specific setting at Örebro University, limited scale | [^37] |
| LaFAN1 | Indoor motion capture | Ubisoft dataset for game animation, includes interactions | Varies | Potential bias toward games and animation | [^30] |
| KIT-ML | Indoor motion capture | Paired text and motion | Varies | Emphasis on the mapping from text annotations to motion | [^12] |
| HumanAct12 | Motion capture | Twelve action categories | Varies | Action classes may favor particular movements | [^12] |
| UESTC | Indoor motion capture | Forty action classes and forty subjects | Varies | Action classes may favor particular movements | [^12] |
| HumanML3D | Motion capture and text | Based on AMASS/HumanAct12, with revised text annotations | Varies | Potential variation in text annotation quality and consistency | [^12] |

### IV. Comparative results and performance

Studies compare methods on several datasets and metrics. The comparisons identify conditions in which a particular design is strong and where performance deteriorates.

#### A. Performance by method

- **RNNs and LSTMs**
  - Recurrent models often serve as the <strong>baseline</strong>.
  - They perform reasonably well at short horizons. At longer horizons, errors accumulate and long-range dependencies become harder to learn.[^10]
  - DMST-GRNN combines a GCN and an RNN. It reported lower mean angle error (MAE) than a simple RNN on both short- and long-term forecasts on H3.6M and CMU MoCap.[^10]

- **GCNs**
  - Encoding the skeleton explicitly helps capture spatial relationships, especially when structural information matters to the task.[^10]
  - A GCN alone may be less effective than a transformer at learning purely temporal relationships over long intervals.
  - On action recognition, the transformer-based MotionBERT outperformed the GCN-based ST-GCN and 2s-AGCN.[^18] The result suggests that a transformer can learn effective spatiotemporal representations.

- **Transformers**
  - Their ability to **model long-range dependencies** has produced strong results in related tasks such as pose estimation and motion generation,[^12] indicating potential for forecasting.
  - MotionBERT reported state-of-the-art 3D pose estimation on H3.6M by mean per-joint position error (MPJPE).[^18] MDM reported leading results for text- or action-conditioned generation on HumanML3D, KIT, HumanAct12, and UESTC using measures including FID, R-Precision, and diversity.[^29]
  - These results illustrate the capacity of transformers to learn complex spatiotemporal patterns.[^10]

- **Diffusion models**
  - Many comparisons test motion generation. Those results inform the design of forecasting models, although the tasks have different inputs.
  - Diffusion models have reported **state-of-the-art generation quality and diversity**.[^12]
  - PhysDiff **improved physical plausibility** relative to MDM and MotionDiffuse while maintaining or improving FID and relevance scores.[^12]
  - AAMDM addressed slow sampling. It achieved quality and diversity similar to AMDM200 at a much higher frame rate.[^30]
  - These results suggest that diffusion-based forecasting can support fidelity and diversity. Efficiency and controllability remain open questions.

- **Decoupled and hierarchical models**
  - Separating global trajectory from local pose has been particularly effective in **long-horizon, multi-agent settings**.[^1]
  - The T2P authors reported state-of-the-art results on JRDB-GMP and earlier datasets.[^2] Parsaeifard and colleagues also reported improvements over baselines for their VAE-based decoupled model.[^3]
  - Decomposing the task can make a complex prediction problem easier to handle.

#### B. Strengths and weaknesses identified in comparative studies

- **RNNs**
  - **Strengths.** Straightforward implementation and a good fit for short sequences.
  - **Weaknesses.** Vanishing gradients, accumulated errors, and difficulty modeling long-range dependencies.[^10]
- **GCNs**
  - **Strength.** An explicit representation of skeletal structure.
  - **Weakness.** Long-range temporal dependencies alone may be harder to learn than with a transformer.
- **Transformers**
  - **Strengths.** Strong long-range modeling and parallel processing.
  - **Weaknesses.** High computational cost, possible need for large datasets, and less built-in skeletal structure than a GCN.
- **VAEs and GANs**
  - **Strength.** The ability to represent uncertainty and multiple plausible outcomes.
  - **Weaknesses.** GAN training can be unstable. Expressiveness can be limited relative to diffusion models, and GANs can suffer mode collapse.
- **Diffusion models**
  - **Strengths.** High generation quality and diversity, with flexible conditioning.
  - **Weaknesses.** Sampling is slow, although acceleration methods are improving.[^25] Physical plausibility can require a dedicated mechanism,[^12] and relatively few studies directly compare forecasting performance.
- **Deterministic models**
  - **Strengths.** Training and evaluation are straightforward, for example with MPJPE.
  - **Weaknesses.** A single output misses future uncertainty and can yield an overly smooth or average motion.[^10]
- **Stochastic models**
  - **Strength.** Modeling multiple futures can produce more realistic behavior.
  - **Weaknesses.** Evaluation requires distributional metrics, and controlling the output can be difficult.

#### C. Highlights from benchmark comparisons

- **Short-horizon prediction on H3.6M and CMU.** Graph-based models such as DMST-GRNN[^10] and transformer-based models generally improve on earlier RNN approaches. The best reported MPJPE depends on the exact horizon and evaluation protocol.
- **Long-horizon prediction on H3.6M, CMU, and JRDB-GMP.** Models that incorporate motion context,[^10] interactions,[^1] goal conditioning,[^1] or a trajectory–pose decomposition[^1] tend to perform better. T2P reported a state-of-the-art result on the long-horizon, multi-agent JRDB-GMP benchmark.[^2]
- **Generation quality and diversity on HumanML3D and KIT.** In text- and action-conditioned generation, diffusion models such as MDM[^29] and PhysDiff[^12] reported leading FID, diversity, and multimodality scores. This suggests a route to high-quality probabilistic forecasting.
- **Physical plausibility.** PhysDiff[^12] reported **78–94% reductions in physical errors** such as foot sliding, ground penetration, and floating compared with MDM and MotionDiffuse. The evaluations included HumanML3D, HumanAct12, and UESTC.
- **Efficiency.** On LaFAN1, AAMDM[^30] reported roughly a <strong>40-fold speedup (173 FPS)</strong> over the standard autoregressive diffusion model AMDM200 while retaining similar quality and diversity. This makes real-time interaction a possibility. EMDM[^25] also targets real-time generation.

Transformers are effective at capturing long-range dependencies.[^10] In difficult long-horizon and interaction settings, the strongest results often come from combining them with domain knowledge, such as skeletal structure in a GCN,[^10] an explicit separation of global and local motion,[^1] or physical guidance.[^12]

These comparisons suggest that explicit structural or physical constraints can complement an expressive architecture. Diffusion models also illustrate a trade-off between sample quality and diversity on one hand and generation time on the other.[^25] Acceleration matters when forecasts must arrive in real time. Physical inconsistency is one common failure of data-driven generation.[^12] Work such as PhysDiff[^12] shows how explicit physical modeling can reduce those errors without a substantial penalty on other metrics. This makes physical plausibility worth evaluating as a matter of course.

**Table 3. Reported performance by model family on selected benchmarks**

| Model family | Examples | Strengths in comparisons | Weaknesses in comparisons | Example task and result | Source |
|:--|:--|:--|:--|:--|:--|
| **RNN-based** | LSTM[^3], DMST-GRNN (GCN + RNN)[^10] | Simplicity, short-sequence processing | Weak long-range dependencies, accumulated error | DMST-GRNN improved short- and long-horizon MAE over an RNN on H3.6M and CMU. | [^3] |
| **GCN-based** | ST-GCN, 2s-AGCN[^18], DMST-GRNN[^10] | Explicit skeletal structure | Potential weakness on purely temporal long-range dependencies | DMST-GRNN reported leading MAE on H3.6M and CMU at the time. | [^3] |
| **Transformer-based** | MotionBERT[^18], MDM[^29], T2P[^2] | Strong long-range modeling | High compute cost, limited structural bias | MotionBERT reported leading H3.6M MPJPE for 3D estimation. <br> MDM reported leading generation FID/diversity on HumanML3D, KIT, HumanAct12, and UESTC. <br> T2P reported leading JRDB-GMP forecasting performance. | [^10] |
| **VAE/GAN-based** | Parsaeifard et al.[^3] | Uncertainty and multimodal outcomes | Possible training instability and limited expressiveness | Parsaeifard and colleagues reported improvements over the baselines for their decoupled approach. | [^3] |
| **Diffusion-based** | MDM[^29], MotionDiffuse[^12], PhysDiff[^12], AAMDM[^30] | Generation quality, diversity, flexible conditioning | Slow sampling, difficulty enforcing physical plausibility | PhysDiff reduced physical errors relative to MDM and MotionDiffuse. <br> AAMDM produced frames roughly 40 times faster than AMDM200. | [^4] |
| **Decoupled or hierarchical** | T2P[^2], Parsaeifard et al.[^3] | Manageable complexity for long-horizon, multi-agent tasks | Possible loss of information during decomposition | T2P reported leading results on JRDB-GMP and earlier datasets. | [^1] |

### V. Research trends and persistent challenges

Advances in deep learning and the demands of applications have broadened the scope of human pose forecasting. Several trends recur across the literature.

#### A. Trends shaping the field

- **Longer horizons.** Extending forecasts from less than a second to several seconds or more requires the model to handle uncertainty, higher-level plans, and intentions.[^1]
- **Multi-agent interaction.** Realistic scene understanding requires predicting people who respond to one another.[^1] This calls for appropriate datasets[^1] and interaction-aware models.
- **Probabilistic and diverse forecasts.** Generating multiple plausible futures reflects inherent uncertainty.[^1] VAEs, GANs, and diffusion models support this approach.
- **Personalization.** Long-term HCI can benefit from forecasts adapted to an individual's movement style, body proportions, and behavior.[^5] Options include online adaptation and training individual models.
- **Awareness of scene, context, and physics.** Researchers incorporate 3D environmental information,[^27] object interactions,[^26] and physical laws[^12] to produce movements that fit their surroundings.
- **Conditional forecasts.** A motion can be predicted or generated from text,[^12] an action label,[^12] a trajectory,[^1] or an image.[^40] The boundary with conditional generation is blurred, but conditioning is central to controllable forecasts.
- **Architecture development.** Work continues on GCNs, transformers, and diffusion models, on combinations that incorporate decomposition or physics, and on pretraining with large datasets.[^18]

Long horizons, multi-agent behavior, uncertainty, and context are connected. They all matter when forecasts must be useful in complex, interactive environments.

For example, a longer horizon makes it more important to understand context and interaction. Several agents can respond differently to the same event, so more than one future is plausible. These questions extend prediction beyond simple kinematic extrapolation in controlled experiments.

#### B. Difficulties highlighted in comparative reviews

- **Data quality, scale, and bias.** Long-horizon, multi-agent settings in the wild need large, diverse datasets with accurate annotations.[^1] Existing datasets cover a limited set of conditions,[^1] and even the accuracy of the ground truth can be an issue.[^37]
- **Evaluation rigor.** Overreliance on a single metric such as MPJPE obscures other properties.[^8] Evaluation should cover accuracy, diversity, plausibility, relevance, and efficiency.[^36] Benchmark protocols also need refinement.[^5]
- **Generalization.** A model trained on a particular motion capture dataset may perform poorly in unfamiliar real-world environments because of the domain gap.[^44]
- **Physical plausibility.** Preventing physical violations and visible artifacts remains difficult, particularly in generative models and at long horizons.[^12]
- **Controllability.** Even with conditioning, reliably producing a specified movement remains a challenge.[^29]
- **Computation and real-time constraints.** The cost of transformers and, in particular, diffusion models can limit their use in real-time applications.[^29]
- **Occlusion and noise.** Pose estimates from a real scene are often noisy or incomplete under occlusion.[^4] A forecasting model needs to cope with those inputs.

Many of the outstanding problems concern **data and evaluation**.[^1] Architecture alone cannot remedy a dataset that lacks diversity or a metric that ignores plausibility and interaction quality. Under those conditions, it is difficult to design or assess even a sophisticated model for a real application. New datasets[^1] and evaluation metrics[^12] address these shortcomings.

Physical plausibility[^12] also exposes a tension between flexible data-driven models and hard constraints in the world. A network learns correlations from examples, but an unrepresented physical constraint can still be violated. A physics engine supplies an explicit reference. Combining learning with simulation,[^12] physics-informed losses, or reinforcement learning[^26] offers ways to produce more realistic movements.

### VI. Future directions and conclusions

Comparative studies clarify what has been achieved and what experiments could move the field forward.

#### A. Research opportunities

- **Build better benchmarks.** Develop larger and more diverse accurately annotated datasets of long-horizon, multi-agent interactions in real environments.[^1] Standardize protocols that evaluate accuracy, diversity, plausibility, efficiency, and task relevance together. Personalized forecasting also needs dedicated benchmarks.[^5]
- **Improve long-horizon and interaction models.** Develop architectures that capture long-range dependencies, goal-directed behavior, and complex interactions between agents.[^1] Hierarchies, memory mechanisms, and priors for social interaction are possible directions.
- **Make generative models efficient and controllable.** Investigate faster diffusion sampling[^25] and more precise control over conditional outputs.[^32] Flow-based models offer another route.[^4]
- **Improve physical realism.** Incorporate physical priors more directly and efficiently, reducing reliance on post-processing and expensive simulation.[^12] Possible directions include learning physical regularities implicitly and incorporating differentiable physics.
- **Personalize and adapt.** Learn robust person-specific models from limited data or adapt quickly to an individual user online.[^5]
- **Make predictions explainable and trustworthy.** Understanding why a complex model produced a forecast is particularly important in safety-critical applications.[^46]
- **Use information across modalities.** Combine past poses more effectively with images,[^40] 3D scene scans,[^27] audio, and text instructions.

Several directions follow directly from identified limitations. Better benchmarks address data gaps, physics helps address implausible motion, and faster sampling tackles the cost of diffusion.[^1] These are concrete areas where work could make progress over the next several years.

Interest in personalization[^5] and explainability[^46] also reflects the demands of human-centered applications. A model can be accurate on average and still be hard to trust for a particular person. As systems interact more closely with people, sensitivity to individual differences and the ability to understand or anticipate the model's behavior become important outcomes alongside benchmark accuracy.

#### B. Conclusions

Human pose forecasting has expanded from short, deterministic predictions to **long-horizon, multi-agent, and probabilistic scenarios**. RNNs, GCNs, and especially **transformers** have advanced motion modeling. Generative approaches, particularly **diffusion models** adapted from motion generation, can represent uncertainty and diversity. Efficiency and physical plausibility remain challenges.

The comparisons show that **the best method depends on what is being measured**. Transformers model sequences well, GCNs exploit skeletal structure, decomposition manages complexity, and physical guidance improves realism. Evaluations need to measure more than MPJPE. Benchmark coverage remains a significant bottleneck.

Future progress depends on better benchmarks, models that capture context and interaction, efficient and controllable generation, and robust methods for physical realism and personalization. Demands from HCI, robotics, and autonomous systems continue to make **realism, interaction, efficiency, and personalization** priorities.

---

## References

[^1]: Jeong, H., Choi, J., & Lee, G. (2024). Multi-agent Long-term 3D Human Pose Forecasting via Interaction-aware Trajectory Conditioning. In *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*. [https://openaccess.thecvf.com/content/CVPR2024/papers/Jeong_Multi-agent_Long-term_3D_Human_Pose_Forecasting_via_Interaction-aware_Trajectory_Conditioning_CVPR_2024_paper.pdf](https://openaccess.thecvf.com/content/CVPR2024/papers/Jeong_Multi-agent_Long-term_3D_Human_Pose_Forecasting_via_Interaction-aware_Trajectory_Conditioning_CVPR_2024_paper.pdf)
[^2]: T2P model paper (no link supplied in the original report).
[^3]: Parsaeifard, B., & Stiefelhagen, R. (2021). Learning Decoupled Representations for Human Pose Forecasting. In *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV) Workshops*. [https://openaccess.thecvf.com/content/ICCV2021W/SoMoF/papers/Parsaeifard_Learning_Decoupled_Representations_for_Human_Pose_Forecasting_ICCVW_2021_paper.pdf](https://openaccess.thecvf.com/content/ICCV2021W/SoMoF/papers/Parsaeifard_Learning_Decoupled_Representations_for_Human_Pose_Forecasting_ICCVW_2021_paper.pdf)
[^4]: Xu, Z., Chai, J., & Lv, X. (2025). Human Motion Prediction, Reconstruction, and Generation. *arXiv preprint arXiv:2502.15956*. [https://arxiv.org/html/2502.15956v1](https://arxiv.org/html/2502.15956v1)
[^5]: Adeli, V., Shariat, N., Marin, R., Reid, I., & Salzmann, M. (2023). Personalized Pose Forecasting. *arXiv preprint arXiv:2312.03528*. [https://arxiv.org/pdf/2312.03528](https://arxiv.org/pdf/2312.03528)
[^6]: Li, C., Zhang, Z., Sun, W., & Zou, Q. (2023). Recent Advances in Deterministic Human Motion Prediction: A Review. *arXiv preprint arXiv:2312.06184*. [https://arxiv.org/html/2312.06184v1](https://arxiv.org/html/2312.06184v1)
[^7]: Human Fall Motion Prediction – A Review. (2025). *ResearchGate*. [https://www.researchgate.net/publication/384617145_Human_Fall_Motion_Prediction_-_A_Review](https://www.researchgate.net/publication/384617145_Human_Fall_Motion_Prediction_-_A_Review)
[^8]: Martinez, J., Black, M. J., & Romero, J. (2017). On Human Motion Prediction Using Recurrent Neural Networks. In *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*. [https://typeset.io/papers/on-human-motion-prediction-using-recurrent-neural-networks-2i62b0kvs1](https://typeset.io/papers/on-human-motion-prediction-using-recurrent-neural-networks-2i62b0kvs1)
[^9]: PoseRL-Net: human pose analysis for motion training guided by robot vision. (2025). *Frontiers in Neurorobotics*. [https://www.frontiersin.org/journals/neurorobotics/articles/10.3389/fnbot.2025.1531894/full](https://www.frontiersin.org/journals/neurorobotics/articles/10.3389/fnbot.2025.1531894/full)
[^10]: Mao, W., Liu, M., & Salzmann, M. (2019). Long-Term Human Motion Prediction by Modeling Motion Context and Enhancing Motion Dynamics. *ResearchGate*. [https://www.researchgate.net/publication/326206421_Long-Term_Human_Motion_Prediction_by_Modeling_Motion_Context_and_Enhancing_Motion_Dynamics](https://www.researchgate.net/publication/326206421_Long-Term_Human_Motion_Prediction_by_Modeling_Motion_Context_and_Enhancing_Motion_Dynamics)
[^11]: Human motion prediction. *Papers With Code*. [https://paperswithcode.com/task/human-motion-prediction/codeless](https://paperswithcode.com/task/human-motion-prediction/codeless)
[^12]: Yuan, Y., Rempe, D., Liu, Z., Wang, T., Snavely, N., & Black, M. J. (2023). PhysDiff: Physics-Guided Human Motion Diffusion Model. In *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*. [https://openaccess.thecvf.com/content/ICCV2023/papers/Yuan_PhysDiff_Physics-Guided_Human_Motion_Diffusion_Model_ICCV_2023_paper.pdf](https://openaccess.thecvf.com/content/ICCV2023/papers/Yuan_PhysDiff_Physics-Guided_Human_Motion_Diffusion_Model_ICCV_2023_paper.pdf)
[^13]: Human Pose Estimation Using Deep Learning: A Systematic Literature Review. (2023). *MDPI*. [https://www.mdpi.com/2504-4990/5/4/81](https://www.mdpi.com/2504-4990/5/4/81)
[^14]: A Review on Human Pose Estimation Based on Deep Learning. (2025). *ResearchGate*. [https://www.researchgate.net/publication/386138886_A_Review_on_Human_Pose_Estimation_Based_on_Deep_Learning](https://www.researchgate.net/publication/386138886_A_Review_on_Human_Pose_Estimation_Based_on_Deep_Learning)
[^15]: PoseRL-Net: human pose analysis for motion training guided by robot vision. (2025). *PMC*. [https://pmc.ncbi.nlm.nih.gov/articles/PMC11920136/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11920136/)
[^16]: A Review of 3D Human Pose Estimation. (2024). *Applied and Computational Engineering*. [https://www.ewadirect.com/proceedings/ace/article/view/17679](https://www.ewadirect.com/proceedings/ace/article/view/17679)
[^17]: Prof. Dr. Otmar Hilliges. *AIT Lab - ETH Zürich*. [https://ait.ethz.ch/people/hilliges](https://ait.ethz.ch/people/hilliges)
[^18]: Zheng, W., Liu, M., & Salzmann, M. (2023). MotionBERT: A Unified Perspective On Learning Human Motion Representations. *Scribd*. [https://www.scribd.com/document/714836400/MotionBERT-A-Unified-Perspective-on-Learning-Human-Motion-Representations](https://www.scribd.com/document/714836400/MotionBERT-A-Unified-Perspective-on-Learning-Human-Motion-Representations)
[^19]: HuTuMotion: Human-Tuned Navigation of Latent Motion Diffusion Models with Minimal Feedback. (2023). *arXiv preprint arXiv:2312.12227*. [https://arxiv.org/html/2312.12227v1](https://arxiv.org/html/2312.12227v1)
[^20]: LEAD: Latent Realignment for Human Motion Diffusion. (2024). *arXiv preprint arXiv:2410.14508*. [https://arxiv.org/html/2410.14508v1](https://arxiv.org/html/2410.14508v1)
[^21]: Xu, Z., Chai, J., & Lv, X. (2025). Human Motion Prediction, Reconstruction, and Generation. *arXiv preprint arXiv:2502.15956*. [https://www.arxiv.org/abs/2502.15956](https://www.arxiv.org/abs/2502.15956)
[^22]: Paper page - Human Motion Prediction, Reconstruction, and Generation. *Hugging Face*. [https://huggingface.co/papers/2502.15956](https://huggingface.co/papers/2502.15956)
[^23]: Tianyu Li (黎天宇). *Google Scholar*. [https://scholar.google.com/citations?user=LaPb8-YAAAAJ&hl=en](https://scholar.google.com/citations?user=LaPb8-YAAAAJ&hl=en)
[^24]: Sampieri, A. (2023). On Modelling Humans: Forecasting, Synthesis and Human-X Interaction. *IRIS*. [https://iris.uniroma1.it/retrieve/a39246dd-ef6a-4c7d-a446-f94ce30d6184/Tesi_dottorato_Sampieri.pdf](https://iris.uniroma1.it/retrieve/a39246dd-ef6a-4c7d-a446-f94ce30d6184/Tesi_dottorato_Sampieri.pdf)
[^25]: EMDM: Efficient Motion Diffusion Model for Fast and High-Quality Motion Generation. (2023). *arXiv preprint arXiv:2312.02256*. [https://arxiv.org/html/2312.02256v3](https://arxiv.org/html/2312.02256v3)
[^26]: ReinDiffuse: Crafting Physically Plausible Motions with Reinforced Diffusion Model. (2024). *arXiv preprint arXiv:2410.07296*. [https://arxiv.org/html/2410.07296v1](https://arxiv.org/html/2410.07296v1)
[^27]: Harmonizing Stochasticity and Determinism: Scene-responsive Diverse Human Motion Prediction. (2024). *OpenReview*. [https://openreview.net/forum?id=NQCkNM6TES](https://openreview.net/forum?id=NQCkNM6TES)
[^28]: Shape Conditioned Human Motion Generation with Diffusion Model. (2024). *arXiv preprint arXiv:2405.06778*. [https://arxiv.org/html/2405.06778v1](https://arxiv.org/html/2405.06778v1)
[^29]: Tevet, G., et al. (2022). Human Motion Diffusion Model. *OpenReview*. [https://openreview.net/pdf?id=SJ1kSyO2jwu](https://openreview.net/pdf?id=SJ1kSyO2jwu)
[^30]: Li, T., et al. (2024). AAMDM: Accelerated Auto-regressive Motion Diffusion Model. In *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)*. [https://openaccess.thecvf.com/content/CVPR2024/html/Li_AAMDM_Accelerated_Auto-regressive_Motion_Diffusion_Model_CVPR_2024_paper.html](https://openaccess.thecvf.com/content/CVPR2024/html/Li_AAMDM_Accelerated_Auto-regressive_Motion_Diffusion_Model_CVPR_2024_paper.html)
[^31]: Human Motion Diffusion Model. (2022). *ResearchGate*. [https://www.researchgate.net/publication/364025683_Human_Motion_Diffusion_Model](https://www.researchgate.net/publication/364025683_Human_Motion_Diffusion_Model)
[^32]: Enhanced Fine-grained Motion Diffusion for Text-driven Human Motion Synthesis. (2023). *arXiv preprint arXiv:2305.13773*. [https://arxiv.org/html/2305.13773v2](https://arxiv.org/html/2305.13773v2)
[^33]: Towards Realistic Human Motion Prediction with Latent Diffusion and Physics-Based Models. (2025). *MDPI*. [https://www.mdpi.com/2079-9292/14/3/605](https://www.mdpi.com/2079-9292/14/3/605)
[^34]: AAMDM: Accelerated Auto-regressive Motion Diffusion Model. *CVPR 2024 Open Access Repository*. [https://openaccess.thecvf.com/content/CVPR2024/html/Li_AAMDM_Accelerated_Auto-regressive_Motion_Diffusion_Model_CVPR_2024_paper.html](https://openaccess.thecvf.com/content/CVPR2024/html/Li_AAMDM_Accelerated_Auto-regressive_Motion_Diffusion_Model_CVPR_2024_paper.html)
[^35]: AAMDM: Accelerated Auto-regressive Motion Diffusion Model. *Bytez*. [https://bytez.com/docs/cvpr/31407/paper](https://bytez.com/docs/cvpr/31407/paper)
[^36]: Review of models for estimating 3D human pose using deep learning. (2025). *PMC*. [https://pmc.ncbi.nlm.nih.gov/articles/PMC11888865/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11888865/)
[^37]: Kjellström, H., et al. (2021). The THÖR dataset: A dataset for human-robot interaction. *Örebro University*. [http://oru.diva-portal.org/smash/get/diva2:1524236/FULLTEXT01.pdf](http://oru.diva-portal.org/smash/get/diva2:1524236/FULLTEXT01.pdf)
[^38]: FG-MDM: Towards Zero-Shot Human Motion Generation via ChatGPT-Refined Descriptions. (2023). *arXiv preprint arXiv:2312.02772*. [https://arxiv.org/html/2312.02772v3](https://arxiv.org/html/2312.02772v3)
[^39]: Pose ResNet: 3D Human Pose Estimation Based on Self-Supervision. (2023). *PMC*. [https://pmc.ncbi.nlm.nih.gov/articles/PMC10054156/](https://pmc.ncbi.nlm.nih.gov/articles/PMC10054156/)
[^40]: Move-in-2D: 2D-Conditioned Human Motion Generation. (2024). *arXiv preprint arXiv:2412.13185*. [https://arxiv.org/html/2412.13185v1](https://arxiv.org/html/2412.13185v1)
[^41]: Human Motion Prediction, Reconstruction, and Generation. (2025). *ResearchGate*. [https://www.researchgate.net/publication/389314800_Human_Motion_Prediction_Reconstruction_and_Generation](https://www.researchgate.net/publication/389314800_Human_Motion_Prediction_Reconstruction_and_Generation)
[^42]: 灯塔索引. [https://www.dotaindex.com/paper_search?type=1&ex=1&cites=17023456786400194006](https://www.dotaindex.com/paper_search?type=1&ex=1&cites=17023456786400194006)
[^43]: Deep Learning-Based Human Pose Estimation: A Survey. (2020). *ResearchGate*. [https://www.researchgate.net/publication/347881067_Deep_Learning-Based_Human_Pose_Estimation_A_Survey](https://www.researchgate.net/publication/347881067_Deep_Learning-Based_Human_Pose_Estimation_A_Survey)
[^44]: A Survey on Deep Learning-Based 2D Human Pose Estimation Models. (2023). *Tech Science Press*. [https://www.techscience.com/cmc/v76n2/53975/html](https://www.techscience.com/cmc/v76n2/53975/html)
[^45]: A Systematic Review of Recent Deep Learning Approaches for 3D Human Pose Estimation. (2023). *Preprints.org*. [https://www.preprints.org/manuscript/202311.0197/v1](https://www.preprints.org/manuscript/202311.0197/v1)
[^46]: Neuro-Symbolic AI in 2024: A Systematic Review. (2025). *arXiv preprint arXiv:2501.05435*. [https://arxiv.org/html/2501.05435v1](https://arxiv.org/html/2501.05435v1)
