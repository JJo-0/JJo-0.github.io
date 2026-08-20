#!/usr/bin/env python3
"""Extend the frozen taxonomy migration manifest for post-cutover articles.

`normalize_tags.py` intentionally records the 50 posts that existed when the
explicit taxonomy was introduced. New posts are registered here, then the same
strict parser, rewrite path, and manifest-coverage check are reused unchanged.
"""

from normalize_tags import POST_TAXONOMY, Taxonomy, main

POST_TAXONOMY.update(
    {
        "modern-artificial-intelligence-3.mdx": Taxonomy(
            "ai-machine-learning",
            "neural-network-foundations",
            "study-note",
            (
                "deep-learning",
                "perceptron",
                "multilayer-perceptron",
                "convolution",
                "convolutional-neural-network",
            ),
            "ml-foundations-evaluation",
            True,
            5,
        ),
    }
)

if __name__ == "__main__":
    raise SystemExit(main())
