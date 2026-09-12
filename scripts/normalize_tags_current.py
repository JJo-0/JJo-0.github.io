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
        '2026-09-06-autothermal-methane-news.mdx': Taxonomy('finance-industry', 'hydrogen-process-engineering', 'research-report', ('frontier-one', 'hydrogen-process-engineering')),
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
    }
)

if __name__ == "__main__":
    raise SystemExit(main())
