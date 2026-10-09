#!/usr/bin/env python3
"""Extend the frozen taxonomy migration manifest for post-cutover articles.

`normalize_tags.py` intentionally records the 50 posts that existed when the
explicit taxonomy was introduced. New posts are registered here, then the same
strict parser, rewrite path, and manifest-coverage check are reused unchanged.
"""

from normalize_tags import CATEGORY_IDS, POST_TAXONOMY, Taxonomy, main

# Extend the current registry without rewriting the frozen cutover manifest.
CATEGORY_IDS.add("biblical-studies")

POST_TAXONOMY.update(
    {
        "self-improving-ai-chip-design.md": Taxonomy(
            "ai-machine-learning", "semiconductor-ai", "research-report",
            ("ai-for-eda", "reinforcement-learning", "chip-design", "openroad", "semiconductor"),
            "ml-foundations-evaluation", True, 12,
        ),
        "modern-artificial-intelligence-3.mdx": Taxonomy(
            "ai-machine-learning", "neural-network-foundations", "study-note",
            ("deep-learning", "perceptron", "multilayer-perceptron", "convolution", "convolutional-neural-network"),
            "ml-foundations-evaluation", True, 5,
        ),
        "semiconductor-supply-chain-universe-map.md": Taxonomy(
            "finance-industry", "semiconductor-industry", "research-report",
            ("semiconductor", "supply-chain", "materials-equipment", "advanced-packaging", "industry-analysis"),
        ),
        "modern-artificial-intelligence-4.mdx": Taxonomy(
            "ai-machine-learning", "optimization", "study-note",
            ("gradient-descent", "convex-optimization", "accelerated-optimization", "preconditioning", "logistic-regression"),
            "ml-foundations-evaluation", True, 6,
        ),
        "modern-artificial-intelligence-5.mdx": Taxonomy(
            "ai-machine-learning", "image-classification", "study-note",
            ("image-classification", "convolutional-neural-network", "imagenet", "vision-transformer", "foundation-model"),
            "ml-foundations-evaluation", True, 7,
        ),
        "modern-artificial-intelligence-6.mdx": Taxonomy(
            "ai-machine-learning", "semantic-segmentation", "study-note",
            ("semantic-segmentation", "fully-convolutional-network", "u-net", "deeplab", "computer-vision"),
            "ml-foundations-evaluation", True, 8,
        ),
        "modern-artificial-intelligence-7.mdx": Taxonomy(
            "ai-machine-learning", "generative-models", "study-note",
            ("image-denoising", "variational-autoencoder", "diffusion-model", "classifier-free-guidance", "score-matching"),
            "ml-foundations-evaluation", True, 9,
        ),
        "modern-artificial-intelligence-8.mdx": Taxonomy(
            "ai-machine-learning", "representation-learning", "study-note",
            ("contrastive-learning", "self-supervised-learning", "infonce", "simclr", "clip"),
            "ml-foundations-evaluation", True, 10,
        ),
        "2026-09-05-weathernext-3-frontier-one.mdx": Taxonomy(
            "ai-machine-learning", "weather-forecasting", "research-report",
            ("frontier-one", "ai-weather", "weather-forecasting", "google-deepmind"),
        ),
        "2026-09-09-navier-stokes-openai-frontier-one.mdx": Taxonomy(
            "ai-machine-learning", "ai-mathematical-discovery", "research-report",
            ("frontier-one", "ai-mathematics", "formal-verification", "navier-stokes"),
        ),
        "2026-09-09-nanoplasma-sot-memory-news.mdx": Taxonomy(
            "finance-industry", "spintronic-memory", "paper-review",
            ("frontier-one", "semiconductor", "spintronics", "sot-mram"),
        ),
        "2026-09-09-vdw-selector-memory-news.mdx": Taxonomy(
            "finance-industry", "memory-selectors", "paper-review",
            ("frontier-one", "semiconductor", "memory", "two-dimensional-materials"),
        ),
        "2026-09-09-high-na-euv-car-resist-news.mdx": Taxonomy(
            "finance-industry", "semiconductor-lithography", "research-report",
            ("frontier-one", "semiconductor", "high-na-euv", "photoresist"),
        ),
        "2026-09-09-samsung-asml-high-na-mask-news.mdx": Taxonomy(
            "finance-industry", "semiconductor-manufacturing", "research-report",
            ("frontier-one", "semiconductor", "high-na-euv", "photomask", "dram"),
        ),
        "2026-09-07-openai-research-automation-frontier-one.mdx": Taxonomy(
            "ai-machine-learning", "ai-research-automation", "research-report",
            ("frontier-one", "ai-agents", "research-automation", "codex"),
        ),
    }
)

POST_TAXONOMY.update(
    {
        '2026-09-05-aml-paradigm-news.mdx': Taxonomy('health-lifestyle', 'clinical-trial-methods', 'paper-review', ('frontier-one', 'clinical-trial-methods')),
        '2026-09-05-gpt-6-astra-safety-news.mdx': Taxonomy('ai-machine-learning', 'frontier-model-evaluation', 'research-report', ('frontier-one', 'frontier-model-evaluation')),
        '2026-09-05-nvidia-hugging-face-news.mdx': Taxonomy('finance-industry', 'ai-infrastructure', 'research-report', ('frontier-one', 'ai-infrastructure')),
        '2026-09-05-perovskite-interface-news.mdx': Taxonomy('finance-industry', 'photovoltaic-interfaces', 'paper-review', ('frontier-one', 'photovoltaic-interfaces')),
        '2026-09-06-autothermal-methane-news.mdx': Taxonomy('finance-industry', 'hydrogen-process-engineering', 'paper-review', ('frontier-one', 'hydrogen-process-engineering')),
        '2026-09-06-clear-ec-news.mdx': Taxonomy('health-lifestyle', 'clinical-oncology', 'paper-review', ('frontier-one', 'clinical-oncology')),
        '2026-09-06-feederbw-news.mdx': Taxonomy('finance-industry', 'power-grid-data', 'paper-review', ('frontier-one', 'power-grid-data')),
        '2026-09-06-hugcl-news.mdx': Taxonomy('ai-machine-learning', 'continual-learning-robotics', 'paper-review', ('frontier-one', 'continual-learning-robotics')),
        '2026-09-06-solar-blind-corona-news.mdx': Taxonomy('finance-industry', 'power-grid-sensing', 'paper-review', ('frontier-one', 'power-grid-sensing')),
        '2026-09-06-tilted-mnte-news.mdx': Taxonomy('finance-industry', 'spintronics', 'paper-review', ('frontier-one', 'spintronics')),
        '2026-09-07-dlcatalysis-neuac-news.mdx': Taxonomy('health-lifestyle', 'computational-biomanufacturing', 'paper-review', ('frontier-one', 'computational-biomanufacturing')),
        '2026-09-07-glud1-hsc-news.mdx': Taxonomy('health-lifestyle', 'stem-cell-bioengineering', 'paper-review', ('frontier-one', 'stem-cell-bioengineering')),
        '2026-09-08-carep-news.mdx': Taxonomy('health-lifestyle', 'cell-therapy-engineering', 'paper-review', ('frontier-one', 'cell-therapy-engineering')),
        '2026-09-08-chorus-news.mdx': Taxonomy('health-lifestyle', 'clinical-oncology', 'paper-review', ('frontier-one', 'clinical-oncology')),
        '2026-09-08-deepwonder3d-news.mdx': Taxonomy('ai-machine-learning', 'biomedical-image-analysis', 'paper-review', ('frontier-one', 'biomedical-image-analysis')),
        '2026-09-08-imec-nbtin-news.mdx': Taxonomy('finance-industry', 'superconducting-computing', 'research-report', ('frontier-one', 'superconducting-computing')),
        '2026-09-08-rentosertib-aging-news.mdx': Taxonomy('health-lifestyle', 'aging-biomarkers', 'paper-review', ('frontier-one', 'aging-biomarkers')),
    }
)

POST_TAXONOMY.update(
    {
        '2026-09-11-embryo-base-editing-news.mdx': Taxonomy('health-lifestyle', 'genome-editing', 'paper-review', ('frontier-one', 'genome-editing')),
        '2026-09-11-high-na-large-mask-news.mdx': Taxonomy('finance-industry', 'semiconductor-lithography', 'research-report', ('frontier-one', 'semiconductor-lithography')),
        '2026-09-11-sulfide-electrolyte-film-news.mdx': Taxonomy('finance-industry', 'solid-state-batteries', 'paper-review', ('frontier-one', 'solid-state-batteries')),
    }
)

POST_TAXONOMY.update(
    {
        'acts-overview-1.mdx': Taxonomy('biblical-studies', 'acts-overview', 'interactive-guide', ('acts', 'biblical-studies', 'narrative-criticism', 'new-testament')),
        'acts-overview-2.mdx': Taxonomy('biblical-studies', 'acts-overview', 'interactive-guide', ('acts', 'biblical-studies', 'archaeology', 'textual-criticism')),
        'acts-overview-3.mdx': Taxonomy('biblical-studies', 'acts-overview', 'interactive-guide', ('acts', 'biblical-studies', 'reception-history', 'comparative-theology')),
        'acts-1-1-5-1.mdx': Taxonomy('biblical-studies', 'acts-1-1-5', 'interactive-guide', ('acts', 'biblical-studies', 'greek-exegesis', 'textual-criticism')),
        'acts-1-1-5-2.mdx': Taxonomy('biblical-studies', 'acts-1-1-5', 'interactive-guide', ('acts', 'biblical-studies', 'narrative-criticism', 'rhetoric')),
        'acts-1-1-5-3.mdx': Taxonomy('biblical-studies', 'acts-1-1-5', 'interactive-guide', ('acts', 'biblical-studies', 'pneumatology', 'reception-history')),
        'acts-1-6-14-1.mdx': Taxonomy('biblical-studies', 'acts-1-6-14', 'interactive-guide', ('acts', 'biblical-studies', 'greek-exegesis', 'textual-criticism')),
        'acts-1-6-14-2.mdx': Taxonomy('biblical-studies', 'acts-1-6-14', 'interactive-guide', ('acts', 'biblical-studies', 'narrative-criticism', 'rhetoric')),
        'acts-1-6-14-3.mdx': Taxonomy('biblical-studies', 'acts-1-6-14', 'interactive-guide', ('acts', 'biblical-studies', 'pneumatology', 'reception-history')),
    }
)

POST_TAXONOMY.update(
    {
        '2026-09-12-lithium-disulfur-dichloride-frontier-one.mdx': Taxonomy(
            'finance-industry', 'lithium-sulfur-batteries', 'research-report',
            ('frontier-one', 'energy-storage', 'lithium-sulfur-batteries'),
        ),
        '2026-09-14-justgrpo-diffusion-reasoning-news.mdx': Taxonomy(
            'ai-machine-learning', 'diffusion-language-models', 'research-report',
            ('frontier-one', 'diffusion-language-models', 'reinforcement-learning', 'reasoning', 'open-source'),
        ),
        '2026-09-14-fors-diffusion-sampling-news.mdx': Taxonomy(
            'ai-machine-learning', 'diffusion-models', 'research-report',
            ('frontier-candidate', 'diffusion-models', 'sampling-theory', 'mathematics'),
        ),
        '2026-09-14-d4rt-dynamic-4d-vision-news.mdx': Taxonomy(
            'ai-machine-learning', 'computer-vision', 'research-report',
            ('frontier-candidate', 'computer-vision', 'robotics', '3d-vision', 'world-models'),
        ),
    }
)

POST_TAXONOMY.update(
    {
        '2026-09-15-mspa-fpba-nanopore-news.mdx': Taxonomy('research-methods-tools', 'nanopore-sensing', 'paper-review', ('frontier-one', 'nanopore-sensing')),
        '2026-09-15-apoe-stratified-alzheimer-news.mdx': Taxonomy('health-lifestyle', 'neurogenetics', 'paper-review', ('frontier-candidate', 'alzheimers-disease', 'apoe', 'genome-wide-association')),
        '2026-09-15-mos2-snn-in-logic-news.mdx': Taxonomy('finance-industry', 'neuromorphic-computing', 'paper-review', ('frontier-candidate', 'semiconductor', 'neuromorphic-computing')),
    }
)

POST_TAXONOMY.update(
    {
        '2026-09-16-seawater-hydrogen-water-news.mdx': Taxonomy('finance-industry', 'hydrogen-energy', "paper-review", ('frontier-one', 'hydrogen-energy')),
        '2026-09-16-onprem-medical-agent-news.mdx': Taxonomy('health-lifestyle', 'clinical-ai', "paper-review", ('frontier-candidate', 'clinical-ai')),
        '2026-09-16-oect-swelling-mapping-news.mdx': Taxonomy('finance-industry', 'organic-bioelectronics', "paper-review", ('frontier-candidate', 'organic-bioelectronics')),
    }
)


POST_TAXONOMY.update({
    '2026-09-17-vera-rubin-mlperf-news.mdx': Taxonomy('ai-machine-learning', 'ai-compute-hardware', 'research-report', ('frontier-one', 'ai-infrastructure')),
    '2026-09-17-ms-ebv-prerelapse-news.mdx': Taxonomy('health-lifestyle', 'neuroimmunology', 'paper-review', ('frontier-candidate', 'neuroimmunology')),
    '2026-09-17-adolescent-hemophilia-b-news.mdx': Taxonomy('health-lifestyle', 'gene-therapy', 'paper-review', ('frontier-candidate', 'gene-therapy')),
})

POST_TAXONOMY.update({
    '2026-09-18-paper2agent-news.mdx': Taxonomy('ai-machine-learning', 'ai-agents-for-science', 'paper-review', ('frontier-one', 'ai-for-science')),
})

POST_TAXONOMY.update({
    '2026-09-18-delphy-outbreak-phylogenetics-news.mdx': Taxonomy('research-methods-tools', 'bayesian-phylogenetics', 'paper-review', ('frontier-candidate', 'bayesian-phylogenetics')),
    '2026-09-18-panxeon-pancreatic-liquid-biopsy-news.mdx': Taxonomy('health-lifestyle', 'cancer-early-detection', 'paper-review', ('frontier-candidate', 'cancer-early-detection')),
    '2026-09-18-nanomembrane-photonic-integration-news.mdx': Taxonomy('finance-industry', 'integrated-photonics', 'paper-review', ('frontier-candidate', 'integrated-photonics')),
    '2026-09-18-soft-muscle-spectral-control-news.mdx': Taxonomy('robotics-embedded', 'soft-robotics-control', 'paper-review', ('frontier-candidate', 'soft-robotics-control')),
})

POST_TAXONOMY.update({
    '2026-09-19-anthropic-wet-lab-mhs-news.mdx': Taxonomy(
        'ai-machine-learning', 'autonomous-labs', 'research-report',
        ('frontier-one', 'ai-for-science'),
    ),
})

POST_TAXONOMY.update({
    '2026-09-19-dual-neural-progenitors-news.mdx': Taxonomy('health-lifestyle', 'neural-development', 'paper-review', ('frontier-candidate', 'neural-development')),
    '2026-09-19-phosphate-molecular-walker-news.mdx': Taxonomy('research-methods-tools', 'molecular-machines', 'paper-review', ('frontier-candidate', 'molecular-machines')),
    '2026-09-19-whisker-tactile-flight-news.mdx': Taxonomy('robotics-embedded', 'tactile-flight', 'paper-review', ('frontier-candidate', 'tactile-flight')),
})

POST_TAXONOMY.update({
    '2026-09-20-elpr-oled-lithography-news.mdx': Taxonomy('finance-industry', 'oled-lithography', 'paper-review', ('frontier-one', 'oled-lithography')),
    '2026-09-20-developmental-xenocortication-news.mdx': Taxonomy('health-lifestyle', 'neural-organoids', 'paper-review', ('frontier-candidate', 'neural-organoids')),
    '2026-09-20-claude-biomolecular-optimization-news.mdx': Taxonomy('ai-machine-learning', 'scientific-computing', 'research-report', ('frontier-candidate', 'scientific-computing')),
    '2026-09-20-hydrogen-spatial-demand-policy-news.mdx': Taxonomy('finance-industry', 'hydrogen-policy', 'paper-review', ('frontier-candidate', 'hydrogen-policy')),
})

POST_TAXONOMY.update({
    '2026-09-21-memristive-svd-news.mdx': Taxonomy('finance-industry', 'memristive-computing', 'paper-review', ('frontier-one', 'compute-in-memory')),
    '2026-09-21-single-fiber-hyperspectral-news.mdx': Taxonomy('research-methods-tools', 'hyperspectral-imaging', 'paper-review', ('frontier-candidate', 'hyperspectral-imaging')),
    '2026-09-21-erbium-1540nm-led-news.mdx': Taxonomy('finance-industry', 'near-infrared-optoelectronics', 'paper-review', ('frontier-candidate', 'integrated-photonics')),
})

POST_TAXONOMY.update({
    '2026-09-22-mos2-sub5nm-transistors-news.mdx': Taxonomy('finance-industry', '2d-transistors', 'paper-review', ('frontier-one', 'semiconductor')),
    '2026-09-22-irf4-treg-stability-news.mdx': Taxonomy('health-lifestyle', 'treg-engineering', 'paper-review', ('frontier-candidate', 'treg-engineering')),
    '2026-09-22-personalized-phage-guideline-news.mdx': Taxonomy('health-lifestyle', 'phage-therapy', 'research-report', ('frontier-candidate', 'phage-therapy')),
})

POST_TAXONOMY.update({
    '2026-09-23-nioh2-electrochemical-dac-news.mdx': Taxonomy('finance-industry', 'direct-air-capture', 'paper-review', ('frontier-one', 'direct-air-capture')),
    '2026-09-23-vc-mram-ising-machine-news.mdx': Taxonomy('finance-industry', 'spintronic-ising-machine', 'paper-review', ('frontier-candidate', 'semiconductor')),
    '2026-09-23-herbot-her2-biliary-cancer-news.mdx': Taxonomy('health-lifestyle', 'clinical-oncology', 'paper-review', ('frontier-candidate', 'clinical-oncology')),
})

POST_TAXONOMY.update({
    '2026-09-25-soec-stack-operational-control-news.mdx': Taxonomy('finance-industry', 'solid-oxide-electrolysis', 'paper-review', ('frontier-one', 'green-hydrogen')),
    '2026-09-25-nhs-galleri-screening-performance-news.mdx': Taxonomy('health-lifestyle', 'multi-cancer-screening', 'paper-review', ('frontier-candidate', 'cancer-screening')),
    '2026-09-25-npu-sparrow-wing-tail-coordination-news.mdx': Taxonomy('robotics-embedded', 'flapping-wing-robotics', 'paper-review', ('frontier-candidate', 'aerial-robotics')),
})

POST_TAXONOMY.update({
    '2026-09-25-power-bank-buying-guide.mdx': Taxonomy(
        'health-lifestyle', 'consumer-guides', 'buying-guide',
        ('power-bank', 'usb-pd', 'consumer-guides', 'lifestyle'),
    ),
})

POST_TAXONOMY.update({
    '2026-09-28-variation-tolerant-implant-wpt-news.mdx': Taxonomy(
        'finance-industry', 'wearable-implant-bioelectronics', 'paper-review',
        ('frontier-one', 'bioelectronics'),
    ),
    '2026-09-28-high-voltage-linio2-nanorod-news.mdx': Taxonomy(
        'finance-industry', 'high-nickel-cathodes', 'paper-review',
        ('frontier-candidate', 'battery-materials'),
    ),
    '2026-09-28-spacey-spatial-omics-gnn-news.mdx': Taxonomy(
        'ai-machine-learning', 'explainable-spatial-omics', 'paper-review',
        ('frontier-candidate', 'ai-for-science'),
    ),
})

POST_TAXONOMY.update({
    '2026-09-28-soc-00-system-map.mdx': Taxonomy(
        'robotics-embedded', 'embedded-systems', 'tutorial',
        ('soc', 'embedded-systems', 'hardware-software', 'soc-from-code-to-chip'),
    ),
})

POST_TAXONOMY.update({
    '2026-09-29-agent-thermostable-mrna-vaccine-news.mdx': Taxonomy(
        'ai-machine-learning', 'bayesian-vaccine-formulation', 'paper-review',
        ('frontier-one', 'ai-for-science', 'bioengineering'),
    ),
    '2026-09-29-lc1-large-rna-delivery-news.mdx': Taxonomy(
        'health-lifestyle', 'large-rna-lipid-delivery', 'paper-review',
        ('frontier-candidate', 'bioengineering', 'genome-editing'),
    ),
    '2026-09-29-silicon-solid-polymer-battery-news.mdx': Taxonomy(
        'finance-industry', 'silicon-solid-state-batteries', 'paper-review',
        ('frontier-candidate', 'silicon-anode', 'solid-polymer-electrolyte'),
    ),
    '2026-09-30-wrn-inhibitor-phase1-news.mdx': Taxonomy(
        'health-lifestyle', 'wrn-msi-clinical-trial', 'paper-review',
        ('frontier-candidate', 'oncology', 'clinical-trial'),
    ),
    '2026-09-30-rbn-sliding-ferroelectric-memory-news.mdx': Taxonomy(
        'finance-industry', 'sliding-ferroelectric-memory', 'paper-review',
        ('frontier-one', 'semiconductor', 'two-dimensional-materials'),
    ),
    '2026-09-30-trans-interface-perovskite-solar-news.mdx': Taxonomy(
        'finance-industry', 'perovskite-photovoltaics', 'paper-review',
        ('frontier-candidate', 'solar-energy', 'materials-science'),
    ),
})

POST_TAXONOMY.update({
    '2026-10-01-synthidbio-protein-watermark-news.mdx': Taxonomy(
        'ai-machine-learning', 'protein-design-provenance', 'paper-review',
        ('frontier-one', 'ai-for-science', 'bioengineering'),
    ),
    '2026-10-01-wafer-scale-p-type-bcn-news.mdx': Taxonomy(
        'finance-industry', '2d-transistors', 'paper-review',
        ('frontier-candidate', 'semiconductor'),
    ),
    '2026-10-01-ataraxos-hidden-information-games-news.mdx': Taxonomy(
        'ai-machine-learning', 'imperfect-information-agents', 'paper-review',
        ('frontier-candidate', 'reinforcement-learning'),
    ),
})

POST_TAXONOMY.update({
    'ezekiel-2-1-3-11-1.mdx': Taxonomy(
        'biblical-studies', 'ezekiel-2-1-3-11', 'research-report',
        ('ezekiel', 'biblical-studies', 'hebrew-exegesis', 'old-testament'),
    ),
    'ezekiel-2-1-3-11-2.mdx': Taxonomy(
        'biblical-studies', 'ezekiel-2-1-3-11', 'research-report',
        ('ezekiel', 'biblical-studies', 'narrative-criticism', 'old-testament'),
    ),
    'ezekiel-2-1-3-11-3.mdx': Taxonomy(
        'biblical-studies', 'ezekiel-2-1-3-11', 'research-report',
        ('ezekiel', 'biblical-studies', 'reception-history', 'old-testament'),
    ),
})

POST_TAXONOMY.update({
    'acts-2-14-37-1.mdx': Taxonomy(
        'biblical-studies', 'acts-2-14-37', 'research-report',
        ('acts', 'biblical-studies', 'greek-exegesis', 'new-testament'),
    ),
    'acts-2-14-37-2.mdx': Taxonomy(
        'biblical-studies', 'acts-2-14-37', 'research-report',
        ('acts', 'biblical-studies', 'narrative-criticism', 'new-testament'),
    ),
    'acts-2-14-37-3.mdx': Taxonomy(
        'biblical-studies', 'acts-2-14-37', 'research-report',
        ('acts', 'biblical-studies', 'reception-history', 'new-testament'),
    ),
})

# Public retirement keeps the frozen cutover registry intact and removes only
# the two explicitly retired articles from the current publication manifest.
for retired in ("deep-search-gemini.md", "deep-search-travel-prompt.md"):
    POST_TAXONOMY.pop(retired, None)

POST_TAXONOMY.update({
    '2026-10-03-ai-nanocrystal-photovoltaics-news.mdx': Taxonomy('finance-industry', 'ai-accelerated-photovoltaics', 'paper-review', ('frontier-one', 'perovskite-photovoltaics')),
    '2026-10-03-mccv-regulatory-variant-mapping-news.mdx': Taxonomy('health-lifestyle', 'regulatory-genomics', 'paper-review', ('frontier-candidate', 'functional-genomics')),
    '2026-10-03-paml-chemoresistant-cell-risk-news.mdx': Taxonomy('health-lifestyle', 'pediatric-leukemia', 'paper-review', ('frontier-candidate', 'precision-oncology')),
})

POST_TAXONOMY.update({
    '2026-10-02-lace-complementary-heuristics-news.mdx': Taxonomy('ai-machine-learning', 'automated-algorithm-design', 'paper-review', ('frontier-one', 'algorithm-discovery')),
    '2026-10-02-perturbation-benchmark-calibration-news.mdx': Taxonomy('ai-machine-learning', 'genetic-perturbation-evaluation', 'paper-review', ('frontier-candidate', 'virtual-cell-benchmark')),
    '2026-10-02-glassrecon-depth-prior-news.mdx': Taxonomy('robotics-embedded', 'glass-depth-reconstruction', 'paper-review', ('frontier-candidate', 'depth-reconstruction')),
})

POST_TAXONOMY.update({
    '2026-09-13-rentosertib-phase3-news.mdx': Taxonomy('health-lifestyle', 'ai-drug-discovery', 'research-report', ('frontier-one', 'ai-drug-discovery', 'clinical-trials')),
    '2026-09-24-raibo2-marathon-news.mdx': Taxonomy('ai-machine-learning', 'energy-efficient-legged-robotics', 'paper-review', ('frontier-one', 'robotics', 'embodied-ai')),
    '2026-10-04-nutrivax-measles-uptake-news.mdx': Taxonomy('health-lifestyle', 'vaccine-implementation-science', 'paper-review', ('frontier-candidate', 'vaccination', 'public-health')),
    '2026-10-04-room-temperature-cqd-phase-shift-news.mdx': Taxonomy('finance-industry', 'room-temperature-quantum-photonics', 'paper-review', ('frontier-one', 'quantum-photonics', 'semiconductor')),
    '2026-10-04-ultrahigh-voltage-li-metal-pouch-cell-news.mdx': Taxonomy('finance-industry', 'ultrahigh-voltage-lithium-metal-battery', 'paper-review', ('frontier-candidate', 'lithium-metal-battery', 'machine-learning')),
    '2026-10-05-avian-r2-targeted-integration-news.mdx': Taxonomy('health-lifestyle', 'targeted-gene-integration', 'paper-review', ('frontier-candidate', 'genome-editing', 'synthetic-biology')),
    '2026-10-05-inspire-photonic-in-situ-learning-news.mdx': Taxonomy('ai-machine-learning', 'photonic-in-situ-learning', 'paper-review', ('frontier-one', 'photonic-ai', 'neuromorphic-computing')),
    '2026-10-05-survodutide-phase3-news.mdx': Taxonomy('health-lifestyle', 'obesity-diabetes-therapy', 'paper-review', ('frontier-candidate', 'metabolic-medicine', 'phase-3')),
    '2026-10-06-rapid-wgs-pediatric-cancer-news.mdx': Taxonomy('health-lifestyle', 'rapid-cancer-genomics', 'paper-review', ('frontier-candidate', 'pediatric-oncology', 'genomics')),
    '2026-10-06-shotgun-mammalian-metabolic-engineering-news.mdx': Taxonomy('health-lifestyle', 'mammalian-metabolic-engineering', 'paper-review', ('frontier-candidate', 'synthetic-biology', 'cell-engineering')),
    '2026-10-06-visionary-ai-preeclampsia-news.mdx': Taxonomy('health-lifestyle', 'retinal-ai-preeclampsia', 'paper-review', ('frontier-one', 'maternal-health', 'medical-ai')),
    '2026-10-07-7ev-colossal-bandgap-semiconductor-news.mdx': Taxonomy('finance-industry', 'colossal-bandgap-semiconductor', 'paper-review', ('frontier-one', 'semiconductor', 'power-electronics')),
    '2026-10-07-deterministic-2d-semiconductor-nucleation-news.mdx': Taxonomy('finance-industry', 'deterministic-2d-crystal-growth', 'paper-review', ('frontier-candidate', 'two-dimensional-materials', 'semiconductor-manufacturing')),
    '2026-10-07-horizontal-up-microfluidic-chip-cooling-news.mdx': Taxonomy('finance-industry', 'embedded-chip-cooling', 'paper-review', ('frontier-candidate', 'semiconductor-cooling', 'data-center-infrastructure')),
    '2026-10-08-google-constellation-nuclear-uprate-news.mdx': Taxonomy('finance-industry', 'nuclear-power-uprates', 'research-report', ('frontier-one', 'nuclear-energy', 'power-grid', 'ai-infrastructure')),
    '2026-10-08-overhead-cable-radiative-cooling-news.mdx': Taxonomy('finance-industry', 'grid-radiative-cooling', 'paper-review', ('frontier-candidate', 'power-grid', 'radiative-cooling')),
    '2026-10-08-single-crystal-cof-carbon-capture-news.mdx': Taxonomy('finance-industry', 'carbon-capture-membranes', 'paper-review', ('frontier-candidate', 'carbon-capture', 'membrane-technology')),
})

POST_TAXONOMY.update({
    '2026-10-09-sando-safe-dynamic-trajectory-news.mdx': Taxonomy('ai-machine-learning', 'safe-autonomous-robotics', 'paper-review', ('frontier-one', 'robotics', 'safety-critical-planning', 'trajectory-optimization')),
    '2026-10-09-tongue-controlled-fes-exoskeleton-news.mdx': Taxonomy('health-lifestyle', 'assistive-robotics-fes', 'paper-review', ('frontier-candidate', 'assistive-robotics', 'human-robot-interaction', 'functional-electrical-stimulation')),
    '2026-10-09-feather-star-soft-swimmer-news.mdx': Taxonomy('robotics-embedded', 'minimal-actuation-soft-swimmers', 'paper-review', ('frontier-candidate', 'soft-robotics', 'underwater-robotics', 'mechanical-intelligence')),
})

if __name__ == "__main__":
    raise SystemExit(main())
