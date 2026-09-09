#!/usr/bin/env python3
"""Extend the frozen taxonomy migration manifest for post-cutover articles.

`normalize_tags.py` intentionally records the 50 posts that existed when the
explicit taxonomy was introduced. New posts are registered here, then the same
strict parser, rewrite path, and manifest-coverage check are reused unchanged.
"""

from normalize_tags import POST_TAXONOMY, Taxonomy, main

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
    }
)

if __name__ == "__main__":
    raise SystemExit(main())
