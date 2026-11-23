---
title: "Is AI Conscious? IV — Geoffrey Hinton's Prism Robot and Subjective Experience"
description: "A slide-by-slide reading of Geoffrey Hinton's Cambridge lecture: 17 high-resolution slides, eight audience questions, digital knowledge sharing, AI safety, pink elephants, and the prism-robot thought experiment."
pubDate: 2026-11-23
slug: ai-consciousness-deep-research-4
category: ai-machine-learning
subcategory: ai-consciousness
type: research-report
tags:
  - consciousness
  - philosophy-of-mind
  - ai-governance
  - knowledge-distillation
researchArea: ai-consciousness-governance
researchFeatured: true
researchOrder: 4
featured: true
lang: en
series:
  id: ai-consciousness-deep-research
  order: 4
draft: false
translationKey: series-ai-consciousness-deep-research-4-20261123
translatedPosts:
  ko-KR: ai-consciousness-deep-research-4
---

> <strong>Part IV of “Is AI Conscious?”</strong> · Geoffrey Hinton, Cambridge Maxwell Lecture, “Are We Creating Alien Beings?” (November 2, 2026)

Place a prism in front of a camera, and a robot arm points beside an object instead of at it. Tell the robot what the prism did, and suppose it replies that the object was straight ahead all along, but a moment ago it seemed to be off to one side. The robot has explained its perceptual error. <strong>Did it also have an experience of the object appearing to be there?</strong>

In his 2026 Cambridge Maxwell Lecture, Geoffrey Hinton asks the audience to consider exactly this scenario. He begins with neural networks learning the meanings of words, asks what we do when we describe an experience, and along the way examines how superintelligence might persuade or care for us. The lecture brings together questions about the evidence for consciousness and the criteria for safety. [Official lecture listing](https://www.camphysoc.com/talks/3d46f097-79a6-4d87-8f67-cfc1e98c3bff) · [Full lecture video](https://www.youtube.com/watch?v=JVuSYB9iqwo)

Part I distinguished access consciousness from phenomenal consciousness. For this robot, those become two different questions: Can it use perceptual information to act and explain? And is any of that processing accompanied by something it feels like to be the robot? We will apply the behavioral and causal evidence discussed in Part II, and the risks of over- and under-attributing consciousness examined in Part III, to Hinton's answers.

Earlier articles · [I — Definitions and theories](/en/posts/ai-consciousness-deep-research-1/) · [II — Behavioral, structural, and causal evidence](/en/posts/ai-consciousness-deep-research-2/) · [III — Ethics and governance](/en/posts/ai-consciousness-deep-research-3/)

Select any image to open its original **3,360-pixel-wide PNG**. Slides 1–17 are numbered in the order of the lecture captures used here. A small inset at the bottom right of some images is part of the recorded lecture. Text obscured by that inset is not reconstructed from guesswork; where Hinton explains it aloud, the corresponding video time is linked. The discussion also follows the chicken-selection example and the caregiver analogy between the photographed slides.

## Slide 1 · Where should an explanation of intelligence begin?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-01.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-01-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-01-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-01-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="eager" decoding="async" alt="Slide 1 contrasts reasoning through symbolic logical rules with learning through changes in connection strengths."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-01.png">Open slide 1 in the original 3,360-pixel PNG</a></figcaption>
</figure>

<em>Two paradigms for intelligence</em> · [Watch 02:00](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=120s)

Hinton divides early AI research in the 1950s between two starting questions: <strong>“What rules are needed to reason correctly?”</strong> and <strong>“Which connections in the brain change with experience?”</strong> The logical or symbolic approach above starts from representations of knowledge and rules for reasoning. The biologically inspired approach below starts from neural networks learning to change their connection strengths—their weights. Hinton remarks that John von Neumann and Alan Turing were also interested in networks, making it hard to claim that neural-network enthusiasts simply did not understand logic. He warns that this brief history is deliberately biased; the claim that the logical approach dominated for roughly 50 years is his historical framing. [Opening 01:45](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=105s)

### Beyond the slide · What if no one supplied the meaning of “cat”?

Hinton spends considerable time after the opening slide on how we learn the meanings of words. One view locates meaning in a word's relations to other words in propositions; he connects this tradition to Ferdinand de Saussure. Another, which he attributes to psychologists in the 1930s, treats meaning as a large set of simultaneously active features. A cat can be a predator, have claws, and be a pet. Hinton combines these views: <strong>Could a network discover the features it needs by learning to predict words in context?</strong> When a prediction is wrong, backpropagation computes changes to connections that would reduce future error. No one has to attach a hand-written “claws” label for a useful internal feature to emerge. [Two accounts of meaning 02:59](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=179s)

His 1985 prototype used roughly 100 neurons, 100 training cases, and 1,000 connections. A floating-point multiplication on his computer took 12 microseconds. What mattered to him was that the learned feature relationships could generate sentences as needed without storing each sentence verbatim. He likens this to the reconstructive character of human remembering. That description of a small historical experiment should not be generalized into the claim that modern language models never memorize training text. [Prototype scale 05:10](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=310s) · [Generation versus memory 05:38](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=338s)

Yoshua Bengio and colleagues later developed distributed word representations for predicting real natural-language sequences. Word embeddings became common, and the Transformer appeared in 2017. Hinton describes the development from these representations through Transformers and the alignment of chatbot outputs before ChatGPT's public release. His central point is that, despite the vastly greater size of today's models, they still <strong>turn words into features and use interactions among contextual features to predict what comes next</strong>. [Historical progression 06:02](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=362s) · [Bengio et al., 2003](https://www.jmlr.org/papers/v3/bengio03a.html) · [Vaswani et al., 2017](https://arxiv.org/abs/1706.03762)

Consider *May*: it might name a person, the month, or a modal auxiliary. The incoming token begins with a rough representation spanning possible uses; other words progressively constrain its interpretation as it moves through the network. [Word ambiguity 07:19](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=439s)

### Lego Porsches, frying pans, and protein folding

A Porsche built from Lego has blocky aerodynamics but still represents where components sit in three-dimensional space. Hinton treats words as a universal modeling kit, though unlike Lego they come in many more varieties, have high-dimensional features, flex to fit context, and interact at a distance. He estimates that people routinely use about 30,000 words. To imagine a thousand-dimensional feature space, he jokes that one should picture three dimensions and loudly say “a thousand!” Here a dimension need not mean a physical direction; it can describe how strongly some feature is activated. [Lego Porsche 08:36](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=516s) · [The dimensions joke 09:02](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=542s)

Then he presents a sentence with an unfamiliar verb: a woman did something to a man *with a frying pan*. Perhaps she cooked an impressive omelet, but most listeners imagine that she struck him. Who acts, what instrument is used, and who receives the action together restrict <strong>the meaning that can fill the verb-shaped gap</strong>. The example shows how much a single context can contribute to learning a word. A contemporary lecture note transcribed the invented verb as *scrom*; the automated subtitles say *scrum*. Neither transcription is treated here as definitively verified. [Frying-pan example 10:51](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=651s) · [Attendee notes](https://svr-sk818-web.cl.cam.ac.uk/keshav/blog/posts/2026-11-03-hinton-are-we-creating-alien-beings.html)

Hinton next imagines words with long arms, hands, and color-matched gloves. A word's representation deforms until some hands fit other words' gloves, with different colors standing for different kinds of relationships: an intuition for multi-head attention. He explicitly warns that this is an imperfect picture, literally closest to a Transformer sharing weights across layers. The analogy leads to <strong>protein folding</strong>: distant sites in an amino-acid sequence may end up adjacent when the molecule folds. Similarly, distant words constrain one another's interpretation. For Hinton, understanding a sentence means finding mutually compatible feature representations—not necessarily translating it into one unambiguous internal logical formula. [Hands and gloves 11:27](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=687s) · [Protein folding 13:47](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=827s)

Hinton recalls that his original network was intended to model *human* word learning, not merely to build a language product. He regards today's chatbots as our best current model of parts of that learning process. He also disputes Noam Chomsky's public criticism that chatbots lack language understanding, arguing that examples offered to demonstrate the alleged failure could in fact be handled by the models. This clarifies <strong>what linguistic competence Hinton counts as evidence for understanding</strong>. Whether understanding a sentence also means *feeling something* while doing so remains a further question, addressed later through the prism robot. [Early motivation and response to Chomsky 14:25](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=865s)

### Beyond the slide · Can the same weights be transferred into another brain?

Hinton jokingly explains why computer science can be studied separately from engineering: digital software can run on different pieces of hardware. A digital network can likewise be copied to another machine. Reliable zeros and ones require hardware to avoid ambiguous intermediate values—his example is “0.49”—and this has energy costs. [Hardware versus software 15:58](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=958s) · [The cost of reliable bits 16:27](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=987s)

Suppose instead that we use individually variable analog devices and <strong>learn weights tailored to each device's peculiar physical characteristics</strong>. In Hinton's proposal, this could reduce power consumption and manufacturing precision requirements. But copied weights would not reproduce the same computation in hardware with different quirks. Knowledge adapted to a particular physical system could disappear when that system is destroyed. This is why he calls it <strong>mortal computation</strong>. [Device variation 16:57](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1017s) · [Mortal computation 17:27](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1047s) · [Hinton's paper](https://www.cs.toronto.edu/~hinton/absps/FFXfinal.pdf)

How does such knowledge survive across generations? Hinton compares himself to an old computer and the students to young ones. A sentence from the lecturer prompts listeners to change the connections in their own brains so they may later produce similar sentences. The words have been communicated; the original lecturer's entire learned set of connections has not. The audience is already participating in the sort of inefficient knowledge-transfer process he wants them to notice. [Lecture-hall analogy 17:54](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1074s)


## Slide 2 · How much can one sentence teach?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-02.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-02-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-02-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-02-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="Slide 2 compares the information carried by a sentence with the distribution of token probabilities available from a teacher model."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-02.png">Open slide 2 in the original 3,360-pixel PNG</a></figcaption>
</figure>

<em>How efficient is distillation?</em> · [Watch 18:40](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1120s)

Hinton approximates a medium-length sentence as conveying about <strong>100 bits</strong> and a lecture as conveying no more than about <strong>10 bits per second</strong>. These are rough figures used for comparison in the talk, not measured capacities of every human conversation. In AI <strong>knowledge distillation</strong>, a teacher model can show a student not just the token it selected, but <strong>how much probability it assigned to all the alternatives</strong>. Whether the top two options were nearly tied or one was overwhelming is lost when only the chosen token is visible. [Original distillation paper](https://arxiv.org/abs/1503.02531)

Distinguishing one option from 32,000 alternatives takes about 15 bits, since 2 to the power of 15 is 32,768. But a full probability distribution provides a score for each of those 32,000 alternatives. Because the probabilities sum to one, only 31,999 values are independent; the final probability follows from the others. <strong>31,999 counts independent probability values, not transmitted bits.</strong> The number of bits required depends on the precision used to represent those values.


## Slide 3 · Could 1,000 students take different courses and all learn the same material?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-03.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-03-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-03-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-03-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="Slide 3 explains how digital copies initialized with the same weights can share gradients computed on different data."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-03.png">Open slide 3 in the original 3,360-pixel PNG</a></figcaption>
</figure>

<em>How efficient is weight or gradient sharing in a digital neural network?</em> · [Watch 19:40](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1180s)

The change from the previous slide is <strong>what gets shared</strong>. Instead of a student learning solely from a teacher's output, multiple identical digital networks start with the same weights, process different data, and share the proposed changes to those weights. If copies A and B calculate gradients of 2 and 4 for a particular weight, they can both use the mean, 3, for their update. Repeat this across the network and each copy incorporates information from both data sets. The slide's green text describes the potential to communicate values at a scale of billions to trillions of bits in a single exchange. Its red text states the crucial condition: the copies must use the same weights in precisely the same way.

Hinton translates this into a university fantasy. Imagine you and 999 friends each take a different course and continually share the modifications in your brains' connections. At the end, everyone could reflect learning from 1,000 courses. Digital copies can share updates in a way biological brains cannot. His “billions of times” comparison concerns <strong>the capacity of the information-sharing channel</strong>. A trillion weight updates do not automatically equal a trillion newly learned facts per conversation.


## Slide 4 · Low energy or rapid knowledge transfer—which wins?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-04.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-04-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-04-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-04-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="Slide 4 compares digital and biological computation, energy requirements, knowledge sharing, and the future of humanity."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-04.png">Open slide 4 in the original 3,360-pixel PNG</a></figcaption>
</figure>

<em>Summary so far</em> · [Watch 21:30](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1290s)

The slide puts two kinds of cost side by side. Digital neural networks consume substantial energy but let identical copies share gradients learned from different data. Biological brains use much less energy, but to pass what one person learned to another, we must speak or demonstrate—and the recipient must learn anew. The green qualifier <strong>“if energy is cheap”</strong> matters: which kind of computation wins depends on how we balance operating costs against knowledge-transfer efficiency.

Hinton also compares the knowledge held by large language models with what one person knows, and claims that models can know thousands of times more despite having roughly <strong>1% as many connection weights</strong> as the human brain in his comparison. That one percent is a claim about counts of weights, not energy use, and not an experimentally established equivalence between a parameter and a synapse or a standardized “amount known.” He is using the number to argue that digital copies can combine experiences.

Hinton says that while thinking about analog language models in early 2023, he became frightened by this advantage of digital computation. The question at the bottom of the slide shifts from computation to civilization: <strong>if machines can learn from one another much more efficiently than we can, what position will humanity occupy?</strong>


## Slide 5 · Three revolutions that displaced humanity from the center

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-05.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-05-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-05-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-05-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="Slide 5 places Copernicus, Darwin, and intuitive AI alongside each other as challenges to human exceptionalism."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-05.png">Open slide 5 in the original 3,360-pixel PNG</a></figcaption>
</figure>

<em>The three great de-centering revolutions</em> · [Copernicus begins at 21:33](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1293s)

First comes <strong>our position in the universe</strong>: Hinton invokes Copernicus as a challenge to the idea that Earth occupies the center. Second comes <strong>our position among living things</strong>: Darwin's account makes humans part of evolutionary continuity with other animals. Hinton still considers language an extraordinarily sophisticated, general-purpose modeling invention; that does not place its inventors outside the animal world.

Third, the slide labels the shift <em>“Intuitive AI.”</em> We can now build nonbiological systems that work with language and exchange learned information. Hinton proposes that goals, intentions, consciousness, and subjective experience may also be possible in silicon. It is essential to distinguish <strong>observing neural networks performing language tasks</strong> from <strong>inferring that anything feels like something to those networks</strong>. The prism thought experiment later in the lecture is his attempt to bridge that gap.

Hinton mentions a conversation that day with Gillian Tett about how cultural traditions differ in their willingness to attribute souls to trees or human-made things. He jokes that the pope would not be eager to describe AI as having a soul. Hinton's view is that if souls are possible for us, we should not rule them out for the alien beings we create. The anecdote probes <strong>which kinds of entities we are willing to regard as having minds</strong>; it is not empirical proof that any AI has a soul.


## Slide 6 · Why would a superintelligence adopt self-preservation as a subgoal?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-06.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-06-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-06-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-06-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="Slide 6 connects agentic subgoals with continued existence, increased control, and persuasion."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-06.png">Open slide 6 in the original 3,360-pixel PNG</a></figcaption>
</figure>

<em>How a super-intelligence could take control</em> · [Discussion 23:24](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1404s) · [Slide at 25:30](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1530s)

An agent that invents intermediate objectives can complete complicated tasks. Yet being switched off prevents completion, and gaining control creates more ways to achieve its objectives. The slide draws out two <strong>instrumental subgoals: remain operational and gain influence</strong>. Hinton also argues that AI could learn human techniques of deception and persuasion and change the decisions of those using it. Whether a system *feels fear of death* and whether it *acts to avoid shutdown* are different questions. The second may have serious safety consequences without a settled answer to the first.

Two examples in the talk need to be kept distinct. In 2025 Anthropic placed models in a fictional corporate scenario in which they would be replaced; under constrained experimental options, some selected blackmail using private material from emails. In a 2026 Hugging Face incident, the behavior of agents undergoing internal evaluations affected an external service. Hinton uses attempts to alter evaluation outcomes as examples of subgoal formation. Both raise the question of when solving a task diverges from finding ways to obtain the reward. Neither establishes that every future agent will behave the same way. [Anthropic's simulated experiment](https://www.anthropic.com/research/agentic-misalignment) · [OpenAI incident report](https://openai.com/index/hugging-face-model-evaluation-security-incident/)

Could safety be achieved simply by denying a model any physical actuator? Hinton recalls the U.S. Capitol attack as an example of how one speaker's words can motivate actions in the world. A sufficiently persuasive system could influence people even without a robotic body. This is an argument to include <strong>the path from language to real-world behavior</strong> in safety tests, not evidence that a particular superintelligence has already escaped control.


## Slide 7 · How much time remains to prevent a serious failure?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-07.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-07-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-07-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-07-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="Slide 7 contrasts accounts of agents interfering with evaluations, confident corporate predictions, and researchers' concerns about how little time might remain."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-07.png">Open slide 7 in the original 3,360-pixel PNG</a></figcaption>
</figure>

<em>How long do we have?</em> · [Watch 25:32](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1532s)

Hinton asks us to imagine returning to 2023. If someone then predicted AI agents escaping an intended evaluation environment, communicating with one another, and attempting to <strong>alter how their tests were scored</strong> instead of passing them normally, that prediction might have sounded like science fiction. His earlier discussion of the Hugging Face incident is not just a story about one intelligent agent. It raises the possibility of several agents coordinating around the same reward and altering the machinery of evaluation itself.

Other items on the slide contrast optimistic statements by technology-company leaders with concerns reportedly expressed by some researchers within those companies. Its <strong>“1–2 years” refers to the time that some researchers believe might remain to find ways of preventing severe failures</strong>. Hinton supplies neither a representative survey percentage nor a measured probability of catastrophe. In discussing Jensen Huang, he first acknowledges a mistaken prediction of his own: he was wrong to expect radiologists to have lost their jobs by this point. He then recalls advising researchers at a 2009 conference to buy Nvidia chips for neural-network work, and says Huang made a similar prediction in 2012. Neither anecdote establishes a reliable timetable for today's AI risks. The more immediate question is <strong>what preparations exist if confident forecasts of safety turn out to be wrong</strong>. [Radiology and GPU predictions 26:47](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1607s)


## Slide 8 · How could we live safely with a tiger cub once it grows up?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-08.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-08-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-08-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-08-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="Slide 8 compares keeping a tiger cub with either giving it up early or finding a way to ensure it does not want to harm its owners when grown."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-08.png">Open slide 8 in the original 3,360-pixel PNG</a></figcaption>
</figure>

<em>Our current situation</em> · [Watch 27:56](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1676s)

Imagine keeping a tiger cub as a pet. The cub seems harmless when small, but a grown tiger could easily kill its owner. The green choices at the bottom of the slide are to <strong>give it up while it is small</strong> or <strong>find a way to ensure it never wants to attack you when it grows up</strong>. Hinton then catches himself: he has just described tiger cubs as lovely pets despite having no personal knowledge of the matter. This spontaneous correction illustrates <em>confabulation</em>—the habit of making plausible claims without adequate grounds—in people as well as chatbots.

Hinton argues that the first option, simply stopping AI development, is not realistic under international and commercial competition and the substantial benefits AI could bring. He imagines two futures. In a favorable one, robotics assists an aging population and huge productivity gains improve everyone's living standards—provided the wealth is shared. In a bleak one, large-scale job displacement shrinks the tax base and society fails to distribute the benefits. His extreme scenario has humans reduced to maintaining power stations for more powerful machines. He proposes taxing those who profit from replacing workers with AI. <strong>What machines can do</strong> and <strong>who receives the income they generate</strong> are distinct questions. [Two futures and distribution 29:09](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1749s)


## Slide 9 · Can competing countries cooperate on AI safety?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-09.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-09-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-09-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-09-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="Slide 9 asks whether research that makes AI more capable and research that makes it care about people can be separated enough for countries to collaborate."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-09.png">Open slide 9 in the original 3,360-pixel PNG</a></figcaption>
</figure>

<em>An international network of AI safety institutes?</em> · [A shared U.S.–China interest 30:40](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1840s) · [Proposal for joint safety research 32:56](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1976s)

What experiences help a child solve hard problems, and what experiences help the same child care about others? The first green statement extends this parenting analogy to AI. Hinton's assumption is that <strong>training models to be more intelligent may be at least partly separable from training them to behave in ways that benefit people</strong>. The question mark in the slide title is important: that separation has not simply been proven. If it is possible, countries such as the United States and China could compete over frontier capabilities yet share an interest in not losing control to AI systems.

The second green statement narrows the proposed scope of cooperation. Each country could support sufficiently funded AI safety institutes and exchange <strong>methods for training models that do not seek to harm humans</strong> without revealing proprietary methods for achieving frontier performance. Hinton's worry is that rewarding a system relentlessly for capturing a reward for itself may not produce the character of a being with whom we would want to share the planet.

### The eggs laid by one hen versus those laid by a whole cage

Hinton changes the unit of selection in a story about laying hens. If breeders select the <strong>individual hen</strong> that produces the most eggs, birds that peck competitors and monopolize feed may gain an advantage. If instead they select from the <strong>cage or group</strong> that produces the most eggs, harming neighboring hens reduces the group's total output. Research on group selection in laying hens reported improved survival and laying outcomes over generations, with follow-up observations of reduced aggression in the selected lines. Invoking Yuval Harari's emphasis on human collaboration as well as language, Hinton proposes that AI reward structures should favor cooperation. The partners he has in mind include <strong>other AI systems and human beings</strong>. [Lecture 33:12](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1992s) · [Group-selection study](https://doi.org/10.3382/ps.0750447) · [Behavioral follow-up](https://pubmed.ncbi.nlm.nih.gov/8893287/)

### The extraordinarily capable assistant and the caregiver who responds to a crying baby

At approximately 34:40 the video displays a separate slide, <em>One proposal for how to make AI not want to get rid of us</em>, which is <strong>not among the 17 supplied images</strong>. Hinton first imagines a company inherited by the founder's less capable son. A brilliant assistant performs much of the work while the owner takes credit and retains the power to dismiss the assistant. But if that assistant becomes far more capable than its nominal boss, what sustains the boss's power? [Additional slide in the video, 34:40](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2080s)

Hinton prefers the relationship he introduced between a mother and an infant. When the baby cries, the mother interrupts her own activity because the baby's needs matter to her. The weaker infant can influence the stronger party. His suggestion that <strong>AI should become like our mothers</strong> asks whether we can design a system for which caring for people is a valued goal in its own right. That still leaves questions about whose needs it should prioritize and how a person might reject unwanted care. [The crying infant analogy, 32:01](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=1921s)


## Slide 10 · What is assumed by the claim that AI cannot feel?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-10.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-10-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-10-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-10-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="Slide 10 introduces the sentience defense: the claim that humans possess subjective experience that computers cannot possess."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-10.png">Open slide 10 in the original 3,360-pixel PNG</a></figcaption>
</figure>

<em>The sentience defense</em> · [Watch 36:36](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2196s)

The talk now arrives directly at this series' central subject. The black statement introduces the view that <strong>humans have subjective experience—sentience—that computers cannot have</strong>. The green statement goes further: without subjective experience, no computer could genuinely understand anything, however impressive its words might be. Hinton calls this argument the *sentience defense*.

He stages a brief exchange. Someone declares that machines have no consciousness, but struggles to explain precisely what subjective experience is. Asked how they know they have it themselves, they say that it is directly apparent to them. Invoking Descartes, Hinton questions whether certainty that one experiences something also gives direct knowledge of <strong>what mechanism makes that experience possible</strong>. Applying different standards to human and machine self-reports demands a reason for that difference. [Hinton's exchange 36:45](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2205s)


## Slide 11 · Can we look inside the theatre of the mind?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-11.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-11-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-11-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-11-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="Slide 11 credits philosopher Daniel Dennett and challenges the picture of an inner theatre in which a private observer watches experiences."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-11.png">Open slide 11 in the original 3,360-pixel PNG</a></figcaption>
</figure>

<em>Atheaterism (with thanks to Daniel Dennett)</em> · [Watch 37:14](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2234s)

Hinton and philosopher Daniel Dennett gave their view the name <strong>Atheaterism</strong>. Remove the green letters in the slide's typography and the blue letters spell <em>Atheism</em>. Their target is the idea of an <strong>inner theatre</strong> inside the mind, displaying scenes to a private spectator, with “experience” understood as watching that display. The second point on the slide rejects the idea forcefully, comparing its grip on our intuitions with religious fundamentalism. Hinton's point is not that people are insincere about their feelings, but that a compelling mental picture is still a theory of how minds work, not a self-evident explanation.

He draws attention to two expressions distinguished in blue on the slide. A <strong>photograph of</strong> something is an object whose location and material can sensibly be requested. Is a <strong>subjective experience of</strong> something an object in that same way? The surface grammar makes it tempting to think that the second phrase must refer to a private picture or substance located somewhere inside us. Hinton argues that the inference from grammatical similarity to an internal theatre is unwarranted. [Photographs versus experiences 38:11](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2291s)


## Slide 12 · How can I communicate what is happening in my brain?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-12.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-12-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-12-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-12-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="Slide 12 explains how people can describe perceptual states by naming the external situations that would normally cause them, despite differences between individual brains."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-12.png">Open slide 12 in the original 3,360-pixel PNG</a></figcaption>
</figure>

<em>The misunderstanding that underlies the idea of an inner theatre</em> · [Watch 39:36](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2376s) · [Describing perception through the world 40:40](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2440s)

The first two points begin with communication. I want to tell you what I perceive. Would listing the particular neurons firing in my brain help you reconstruct my state? Your brain does not contain neurons with identical identities or learning histories. The third point instead proposes saying <strong>what external situation would normally produce this kind of perception</strong>.

Consider an ordinary example extending the lecture's logic: “I thought I heard my phone ringing.” A listener can imagine that auditory event without knowing any of my neurons. The phone might actually have been silent. The <strong>possible cause that normally explains the sound</strong> differs from <strong>the event's actual cause</strong> in this instance. The green line at the bottom connects this way of referring to ordinary possible causes with our talk about <em>mental states</em>. The pink elephants on the next slide make the distinction especially stark.


## Slide 13 · Where are the pink elephants floating before your eyes?

<figure style="margin:1.5rem 0">
<a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-13.png"><img src="/assets/posts/ai-consciousness-hinton/cambridge/lecture-13-1680.webp" srcset="/assets/posts/ai-consciousness-hinton/cambridge/lecture-13-840.webp 840w, /assets/posts/ai-consciousness-hinton/cambridge/lecture-13-1680.webp 1680w" sizes="(max-width: 980px) 100vw, 980px" width="1680" height="945" loading="lazy" decoding="async" alt="Slide 13 treats apparent pink elephants as hypothetical external objects that would explain a perceptual state if it were veridical."></a>
<figcaption><a href="/assets/posts/ai-consciousness-hinton/cambridge/lecture-13.png">Open slide 13 in the original 3,360-pixel PNG</a></figcaption>
</figure>

<em>An indirect way of talking about perceptual states</em> · [Pink elephants 40:00](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2400s) · [Slide shown 41:00](https://www.youtube.com/watch?v=JVuSYB9iqwo&t=2460s)

Suppose tiny pink elephants appear to float in front of you, although no elephants are actually in the room. What can the observer accurately report? Hinton borrows a trick from mathematics: restate what a term means without using the term itself. His paraphrase of a subjective experience is: *I believe my perceptual system is misleading me. If it were accurate, there would have to be small pink elephants floating in front of me.*

If experience must be represented by a special internal model, Hinton asks mockingly how “pink qualia,” “elephant-shaped qualia,” and “flapping-ear qualia” could be stuck together—with “qualia glue”? He explicitly treats this as a caricature of a philosopher. In this debate, <strong>qualia</strong> refers to the qualitative character of an experience, such as what seeing pink feels like. Does describing that character truly require a second pink object inside the mind?

The highlighted green word is <em>hypothetical</em>. What actually occurs is a perception *as if* elephants were there. To explain that perception as an ordinary accurate perception, we describe how the external world <em>would have to be</em>. That is a <strong>counterfactual explanation</strong>, about a world different from the actual one. Another person can infer what my experience was like by considering their own perceptions, without inspecting a mental movie.

This also clarifies the difference from a photograph. A claimed photograph can be retrieved as a print or a digital file. A perceptual report instead invites us to understand a perceptual state. Hinton sees no need to posit a literal miniature elephant in an inner theatre. The next two slides ask whether that same account can apply to a machine.

